/**
 * Installing the app from the browser, with no backend: Chrome, Edge and Samsung Internet hand
 * the page their install prompt (beforeinstallprompt), which a button can open in one tap;
 * everywhere else the app can only show the steps for that browser.
 */

/** Chrome's install prompt; not in the DOM typings */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Which steps fit the browser the page is open in */
export type InstallGuide = 'ios-safari' | 'ios-other' | 'in-app' | 'android' | 'desktop';

export interface InstallState {
  /** Opened as the installed app: nothing to offer */
  standalone: boolean;
  /** The browser handed over its install prompt, so one tap installs */
  canPrompt: boolean;
  guide: InstallGuide;
  /** The app built into another app (Messenger, Instagram…) that the page is open in, as "w Messengerze"; null when unknown */
  inAppName: string | null;
  isAndroid: boolean;
  /** Installed from this browser before, so the banner stays away */
  installedHere: boolean;
  /** The banner was closed or acted on lately */
  snoozed: boolean;
}

/** How long a closed banner stays away */
const SNOOZE_MS = 7 * 24 * 60 * 60_000;
const SNOOZE_KEY = 'install-banner-closed-at';
const INSTALLED_KEY = 'install-done';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Ignore localStorage errors
  }
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/** In-app browsers (webviews) can't install apps; the name says where the page is, as "w …" */
const IN_APP: [RegExp, string][] = [
  [/Messenger|FB_IAB\/MESSENGER/i, 'w Messengerze'],
  [/Instagram/i, 'w Instagramie'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'na Facebooku'],
  [/musical_ly|TikTok|BytedanceWebview/i, 'w TikToku'],
  [/Snapchat/i, 'w Snapchacie'],
  [/\bLine\//, 'w Line'],
];

function detect(): Pick<InstallState, 'guide' | 'inAppName' | 'isAndroid'> {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const app = IN_APP.find(([pattern]) => pattern.test(ua));
  // A plain Android WebView ("; wv)") is an in-app browser too, just not a known one
  if (app || (isAndroid && /; wv\)/.test(ua))) return { guide: 'in-app', inAppName: app?.[1] ?? null, isAndroid };
  if (isIOS) return { guide: /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? 'ios-other' : 'ios-safari', inAppName: null, isAndroid };
  return { guide: isAndroid ? 'android' : 'desktop', inAppName: null, isAndroid };
}

let deferred: BeforeInstallPromptEvent | null = null;
let state: InstallState = {
  standalone: false,
  canPrompt: false,
  guide: 'desktop',
  inAppName: null,
  isAndroid: false,
  installedHere: false,
  snoozed: false,
};
const listeners = new Set<() => void>();

function update(patch: Partial<InstallState>): void {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener());
}

/**
 * Starts listening before the first render: Chrome can fire its prompt while the app still loads.
 * Called once, from main.tsx.
 */
export function listenForInstall(): void {
  const closedAt = Number(read(SNOOZE_KEY));
  state = {
    ...state,
    ...detect(),
    standalone: isStandalone(),
    installedHere: read(INSTALLED_KEY) === '1',
    snoozed: closedAt > 0 && Date.now() - closedAt < SNOOZE_MS,
  };

  window.addEventListener('beforeinstallprompt', event => {
    // Keep Chrome's own mini-bar away; the app offers the prompt from its banner and menu
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    // Chrome offers it only when the app isn't installed, so an old "installed" mark is stale
    write(INSTALLED_KEY, null);
    update({ canPrompt: true, installedHere: false });
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    write(INSTALLED_KEY, '1');
    update({ canPrompt: false, installedHere: true });
  });

  window.matchMedia('(display-mode: standalone)').addEventListener('change', () => update({ standalone: isStandalone() }));
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallState(): InstallState {
  return state;
}

/** Keeps the banner away for a while: closed, or its steps already shown */
export function snoozeInstallBanner(): void {
  write(SNOOZE_KEY, String(Date.now()));
  update({ snoozed: true });
}

/**
 * Opens the browser's install prompt. Must run in a tap: prompt() is called synchronously.
 * A prompt opens only once, so the state drops it; the browser may offer a new one later.
 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferred;
  if (!event) return 'unavailable';
  deferred = null;
  const shown = event.prompt();
  update({ canPrompt: false });
  await shown;
  const { outcome } = await event.userChoice;
  if (outcome === 'dismissed') snoozeInstallBanner();
  return outcome;
}

/** Whether the banner should ask for the install now */
export function bannerWanted(s: InstallState): boolean {
  if (s.standalone || s.installedHere || s.snoozed) return false;
  // Where only the steps help, they're worth offering on a phone; elsewhere wait for a real prompt
  return s.canPrompt || s.guide === 'ios-safari' || s.guide === 'ios-other' || s.guide === 'in-app';
}
