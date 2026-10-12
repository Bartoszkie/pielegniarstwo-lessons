import { useId } from 'react';
import { useApp } from '../../app/AppContext';
import { parseDate, relativeDayLabel } from '../../utils/dateUtils';
import { ArrowDown } from '../ui/icons';

const PINK = '#D0336E';

/** Today without classes: a light, happy card with when the next ones are. */
export function FreeDayCard() {
  const { live, todayKey, calendar } = useApp();
  const { next } = live;

  return (
    <div
      className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-x-3.5 rounded-[20px] border py-[18px] pl-3.5 pr-4"
      style={{
        background: `linear-gradient(140deg, color-mix(in oklab, ${PINK} 9%, rgb(var(--surface))) 0%, rgb(var(--surface)) 62%)`,
        borderColor: `color-mix(in oklab, ${PINK} 18%, rgb(var(--line)))`,
        boxShadow: `0 1px 2px rgba(28,25,23,.05), 0 8px 22px -10px color-mix(in oklab, ${PINK} 45%, transparent)`,
      }}
    >
      <TeaIllustration />
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="font-serif text-[30px] italic leading-8">Dziś wolne, hurra!</p>
        {next ? (
          <>
            <p className="text-sm text-ink-2">
              Najbliższe zajęcia:{' '}
              <span className="font-semibold text-ink">{relativeDayLabel(parseDate(next.date), parseDate(todayKey))}, {next.start}</span>
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="pressed inline-flex h-[30px] items-center rounded-full px-3 text-[13px] font-semibold">{live.untilNextLabel}</span>
              <button
                type="button"
                onClick={() => calendar.setCursor(parseDate(next.date))}
                className="raised inline-flex h-[30px] items-center gap-1 rounded-full px-3 text-[13px] font-semibold"
              >
                Pokaż
                <ArrowDown size={14} strokeWidth={2.4} />
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink-2">W planie nie ma już kolejnych zajęć.</p>
        )}
      </div>
    </div>
  );
}

/** A pink cup of tea with a heart of steam */
function TeaIllustration() {
  const id = useId();
  return (
    <svg width="84" height="84" viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}cup`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#F9B8CE" />
          <stop offset="1" stopColor={PINK} />
        </linearGradient>
        <linearGradient id={`${id}saucer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E7E5E4" />
        </linearGradient>
        <linearGradient id={`${id}tea`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D9A06B" />
          <stop offset="1" stopColor="#B9773F" />
        </linearGradient>
      </defs>
      <ellipse cx="48" cy="87" rx="28" ry="3.5" fill="#1C1917" opacity="0.1" />
      <ellipse cx="48" cy="79" rx="31" ry="7" fill={`url(#${id}saucer)`} stroke="#1C1917" strokeOpacity="0.08" />
      <path d="M69 52c9-1 13 4 12 9-1 6-7 9-14 8" fill="none" stroke={PINK} strokeWidth="5" strokeLinecap="round" />
      <path d="M22 45h50v5c0 15-10 26-25 26S22 65 22 50z" fill={`url(#${id}cup)`} />
      <ellipse cx="47" cy="45" rx="25" ry="5.5" fill="#F9C9DA" />
      <ellipse cx="47" cy="45.6" rx="21.5" ry="3.9" fill={`url(#${id}tea)`} />
      <path d="M28 54c.6 7 3.4 12.5 8.2 16" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      <path d="M40 37c-4-5 3-8 0-13M53 36c-4-5 3-8 0-13" fill="none" stroke="#D6D3D1" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M47 17.5c-1.6-3-6.2-2.2-6.2 1.1 0 3 4 5.3 6.2 7 2.2-1.7 6.2-4 6.2-7 0-3.3-4.6-4.1-6.2-1.1z" fill={PINK} />
      <path d="M80 18l1.6 4.4L86 24l-4.4 1.6L80 30l-1.6-4.4L74 24l4.4-1.6z" fill="#F7A1BE" />
      <path d="M16 30l1.1 3L20 34l-2.9 1L16 38l-1.1-3L12 34l2.9-1z" fill="#F7A1BE" />
    </svg>
  );
}
