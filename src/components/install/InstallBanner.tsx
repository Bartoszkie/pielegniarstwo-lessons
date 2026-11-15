import { useEffect, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { bannerWanted, InstallState, snoozeInstallBanner } from '../../utils/install';
import { AppLogo } from '../ui/AppLogo';
import { Close, ExternalLink, InstallApp } from '../ui/icons';

/** Lets the page settle first, so the banner's arrival is what catches the eye */
const SHOW_DELAY_MS = 700;

function bannerCopy(install: InstallState): { title: string; text: string; cta: string; inApp: boolean } {
  if (install.guide === 'in-app' && !install.canPrompt) {
    const where = install.inAppName ?? 'W tej aplikacji';
    return {
      title: 'Otwórz plan w przeglądarce',
      text: `${where.charAt(0).toUpperCase()}${where.slice(1)} nie da się zainstalować aplikacji. Zrobisz to w ${install.isAndroid ? 'Chrome' : 'Safari'}.`,
      cta: 'Pokaż, jak otworzyć',
      inApp: true,
    };
  }
  return {
    title: 'Zainstaluj Plan Zajęć',
    text: 'Ikona na ekranie głównym i plan jednym stuknięciem. Działa też bez internetu.',
    cta: install.canPrompt ? 'Zainstaluj aplikację' : 'Pokaż, jak zainstalować',
    inApp: false,
  };
}

/**
 * Drops in from the top while the app runs in a browser tab and could be installed: one tap opens
 * the browser's install prompt where there is one, else the steps for this browser. Closing it
 * (or opening the steps) keeps it away for a week; the ⋮ menu still offers the install.
 */
export function InstallBanner() {
  const { install, startInstall } = useApp();
  const wanted = bannerWanted(install);
  const [phase, setPhase] = useState<'hidden' | 'shown' | 'leaving'>('hidden');

  useEffect(() => {
    if (wanted) {
      const timer = window.setTimeout(() => setPhase('shown'), SHOW_DELAY_MS);
      return () => window.clearTimeout(timer);
    }
    setPhase(current => (current === 'shown' ? 'leaving' : current));
  }, [wanted]);

  // While it slides away (the prompt took over), it keeps the words it had
  const [shownFor, setShownFor] = useState(install);
  if (wanted && shownFor !== install) setShownFor(install);

  if (phase === 'hidden') return null;

  const { title, text, cta, inApp } = bannerCopy(shownFor);
  const act = () => {
    // The browser's prompt drops the banner by itself; the steps count as seen
    if (!install.canPrompt) snoozeInstallBanner();
    startInstall();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[35] flex justify-center px-3 pt-[max(10px,env(safe-area-inset-top))]">
      <section
        aria-label="Instalacja aplikacji"
        aria-live="polite"
        onAnimationEnd={e => { if (e.animationName === 'install-lift') setPhase('hidden'); }}
        className={`pointer-events-auto relative w-full max-w-[440px] rounded-[22px] border border-raise bg-hero p-3.5 text-hero-ink shadow-pop ${
          phase === 'leaving' ? 'install-lift' : 'install-drop'
        }`}
      >
        <div className="grid grid-cols-[48px_minmax(0,1fr)_36px] items-start gap-x-3">
          <span className="install-hop inline-flex"><AppLogo size={48} /></span>
          <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
            <h2 className="text-base font-bold leading-[21px] tracking-[-0.01em]">{title}</h2>
            <p className="text-[13px] leading-[18px] text-hero-ink/75">{text}</p>
          </div>
          <button
            type="button"
            aria-label="Zamknij"
            onClick={snoozeInstallBanner}
            className="-mr-1.5 -mt-1.5 grid h-10 w-10 place-items-center rounded-full text-hero-ink/70 transition-colors hover:bg-hero-ink/10 hover:text-hero-ink"
          >
            <Close size={19} strokeWidth={2.2} />
          </button>
        </div>
        <button
          type="button"
          onClick={act}
          className="install-cta relative mt-3 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-hero-ink text-[15px] font-bold text-hero transition-transform active:scale-[.98]"
        >
          {inApp ? <ExternalLink size={18} strokeWidth={2.3} /> : <InstallApp size={19} strokeWidth={2.2} />}
          {cta}
        </button>
      </section>
    </div>
  );
}
