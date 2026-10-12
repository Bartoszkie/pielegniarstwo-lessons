import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

/** Right after opening the app, or coming back to it, an update can reload the page unnoticed */
const FRESH_MS = 10_000;
const CHECK_INTERVAL_MS = 60 * 60_000;
/** Opening the file picker on iOS can hide and show the page several times in a row */
const MIN_CHECK_GAP_MS = 30_000;
const PICKER_GRACE_MS = 60_000;
const TOAST_ID = 'app-update';
const CHUNK_RELOAD_KEY = 'app-chunk-reload';
const RESELECT_KEY = 'app-updated-reselect';

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Ignore sessionStorage errors
  }
}

/**
 * Keeps the installed app on the latest release without reinstalling it.
 * Checks for a new version on start, whenever the app comes back to the foreground and every hour,
 * then applies it right away if the app was just opened, otherwise offers it in a toast
 * and applies it when the app is left. Never while a file is being read or picked.
 */
export function useAppUpdate({ busy }: { busy: boolean }) {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const foregroundAtRef = useRef(Date.now());
  const lastCheckRef = useRef(0);
  const pendingRef = useRef(false);
  const appliedRef = useRef(false);
  const pickerOpenedAtRef = useRef(0);
  const busyRef = useRef(busy);
  busyRef.current = busy;
  // useRegisterSW keeps the callbacks it was first given, so they reach the latest logic through this ref
  const decideRef = useRef(() => {});

  const { updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration;
      lastCheckRef.current = Date.now();
    },
    onNeedRefresh() {
      pendingRef.current = true;
      decideRef.current();
    },
  });

  const apply = useCallback(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;
    toast.dismiss(TOAST_ID);
    // The new version takes over and the page reloads
    void updateServiceWorker();
  }, [updateServiceWorker]);

  const isSafe = () => !busyRef.current && Date.now() - pickerOpenedAtRef.current > PICKER_GRACE_MS;

  decideRef.current = () => {
    if (!pendingRef.current || !isSafe() || document.visibilityState !== 'visible') return;
    if (Date.now() - foregroundAtRef.current <= FRESH_MS) {
      apply();
      return;
    }
    toast('Dostępna jest nowa wersja aplikacji.', {
      id: TOAST_ID,
      duration: Infinity,
      action: { label: 'Odśwież', onClick: apply },
    });
  };

  useEffect(() => {
    const check = () => {
      const registration = registrationRef.current;
      if (!registration || registration.installing || !navigator.onLine) return;
      if (Date.now() - lastCheckRef.current < MIN_CHECK_GAP_MS) return;
      lastCheckRef.current = Date.now();
      registration.update().catch(() => {
        // Offline or the server is unreachable: try again next time
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        foregroundAtRef.current = Date.now();
        if (pendingRef.current) decideRef.current();
        else check();
      } else if (pendingRef.current && isSafe()) {
        // Leaving the app: switch to the new version while nobody is looking
        apply();
      }
    };

    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') check();
    }, CHECK_INTERVAL_MS);

    // A lazily loaded part of the app is gone from the server after a deploy: reload onto the new version once
    const onPreloadError = (event: Event) => {
      const last = Number(readSession(CHUNK_RELOAD_KEY) ?? 0);
      if (Date.now() - last < 10_000) return;
      event.preventDefault();
      writeSession(CHUNK_RELOAD_KEY, String(Date.now()));
      writeSession(RESELECT_KEY, '1');
      if (pendingRef.current) apply();
      else window.location.reload();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('vite:preloadError', onPreloadError);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('vite:preloadError', onPreloadError);
    };
  }, [apply]);

  // Reading a file means the user is busy with the app: from then on an update is offered, not forced.
  // One that arrived meanwhile is offered once the file is read.
  useEffect(() => {
    if (busy) foregroundAtRef.current = 0;
    else decideRef.current();
  }, [busy]);

  useEffect(() => {
    if (readSession(RESELECT_KEY)) {
      writeSession(RESELECT_KEY, null);
      toast('Aplikacja została zaktualizowana. Wybierz plik jeszcze raz.');
    }
  }, []);

  const markPickerOpened = useCallback(() => {
    pickerOpenedAtRef.current = Date.now();
  }, []);

  const markPickerClosed = useCallback(() => {
    pickerOpenedAtRef.current = 0;
  }, []);

  return { markPickerOpened, markPickerClosed };
}
