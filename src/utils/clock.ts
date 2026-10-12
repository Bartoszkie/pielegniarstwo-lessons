// In development, `?now=2026-10-17T10:00` pretends the app runs at that moment
// (the clock keeps ticking from there). Ignored in production builds.
const startedAt = Date.now();
const override = (() => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('now');
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
})();

export function getNow(): Date {
  return override === null ? new Date() : new Date(override + (Date.now() - startedAt));
}
