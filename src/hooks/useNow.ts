import { useEffect, useState } from 'react';
import { getNow } from '../utils/clock';

/** Current time, refreshed every `intervalMs` and whenever the app comes back to the foreground. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => getNow());

  useEffect(() => {
    const tick = () => setNow(getNow());
    const id = window.setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);

  return now;
}
