import { useId } from 'react';
import { KindFilter } from '../../types';

/** Shaded "3D" category icons drawn as SVG: calendar, graduation cap, clipboard, flask. */
export function KindIcon({ kind, size = 24 }: { kind: KindFilter; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${name}-${uid}`;
  const shadow = <ellipse cx="24" cy="43.5" rx="14" ry="2.5" fill="#1C1917" opacity="0.12" />;

  if (kind === 'lecture') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id={id('top')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6B645F" /><stop offset="1" stopColor="#292524" /></linearGradient>
          <linearGradient id={id('base')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#44403C" /><stop offset="1" stopColor="#1C1917" /></linearGradient>
          <linearGradient id={id('tassel')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7A1BE" /><stop offset="1" stopColor="#D0336E" /></linearGradient>
        </defs>
        {shadow}
        <path d="M13 21v10c0 3.5 5 6 11 6s11-2.5 11-6V21z" fill={`url(#${id('base')})`} />
        <path d="M24 9l21 9-21 9-21-9z" fill={`url(#${id('top')})`} />
        <path d="M24 9l21 9-21 1.5L3 18z" fill="#FFFFFF" opacity="0.14" />
        <path d="M24 18l13 3.5V31" stroke={`url(#${id('tassel')})`} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="34.8" y="30" width="4.4" height="7" rx="2" fill={`url(#${id('tassel')})`} />
        <circle cx="24" cy="18" r="2" fill="#F7A1BE" />
      </svg>
    );
  }

  if (kind === 'exercise' || kind === 'other') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id={id('board')} x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#EBD9CA" /><stop offset="1" stopColor="#C4A189" /></linearGradient>
          <linearGradient id={id('metal')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A8A29E" /><stop offset="1" stopColor="#57534E" /></linearGradient>
        </defs>
        {shadow}
        <rect x="10" y="8" width="28" height="34" rx="6" fill={`url(#${id('board')})`} />
        <rect x="14" y="13" width="20" height="25" rx="3" fill="#FFFFFF" />
        <rect x="18" y="5" width="12" height="7" rx="3" fill={`url(#${id('metal')})`} />
        <path d="M18 20h12M18 25h8" stroke="#D6D3D1" strokeWidth="2" strokeLinecap="round" />
        <path d="M18.5 31l3 3 6.5-7" stroke="#D0336E" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 13c.4-1.8 1.7-2.9 3.5-3" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'simulation') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E7E5E4" /></linearGradient>
          <linearGradient id={id('liquid')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7A1BE" /><stop offset="1" stopColor="#C2255F" /></linearGradient>
        </defs>
        <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="#1C1917" opacity="0.12" />
        <path d="M19 6h10v11l11 18.5c1.6 2.7-.3 6.5-3.5 6.5h-25c-3.2 0-5.1-3.8-3.5-6.5L19 17z" fill={`url(#${id('glass')})`} stroke="#A8A29E" strokeWidth="1.2" />
        <path d="M13.1 28.4h21.8l4.4 7.3c1.4 2.4-.3 5.6-3.1 5.6H11.8c-2.8 0-4.5-3.2-3.1-5.6z" fill={`url(#${id('liquid')})`} />
        <rect x="17.5" y="4" width="13" height="4" rx="2" fill="#78716C" />
        <circle cx="21" cy="33" r="1.6" fill="#FFFFFF" opacity="0.75" />
        <circle cx="27" cy="36.5" r="1.1" fill="#FFFFFF" opacity="0.6" />
        <circle cx="25" cy="23" r="1.2" fill="#F7A1BE" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#E2DFDC" /></linearGradient>
        <linearGradient id={id('band')} x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#F7A1BE" /><stop offset="1" stopColor="#D0336E" /></linearGradient>
      </defs>
      <ellipse cx="24" cy="43.5" rx="15" ry="2.5" fill="#1C1917" opacity="0.12" />
      <rect x="7" y="10" width="34" height="31" rx="8" fill={`url(#${id('body')})`} />
      <path d="M15 10h18a8 8 0 0 1 8 8v2H7v-2a8 8 0 0 1 8-8z" fill={`url(#${id('band')})`} />
      <rect x="15" y="6" width="4.5" height="9" rx="2.25" fill="#57534E" />
      <rect x="28.5" y="6" width="4.5" height="9" rx="2.25" fill="#57534E" />
      <rect x="13" y="25" width="5" height="4" rx="1.5" fill="#D6D3D1" />
      <rect x="21.5" y="25" width="5" height="4" rx="1.5" fill="#D6D3D1" />
      <rect x="30" y="25" width="5" height="4" rx="1.5" fill="#D0336E" />
      <rect x="13" y="32" width="5" height="4" rx="1.5" fill="#D6D3D1" />
      <rect x="21.5" y="32" width="5" height="4" rx="1.5" fill="#D6D3D1" />
      <path d="M11 15.5c1.2-2.4 3.4-3.5 6-3.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" fill="none" />
      <rect x="7.5" y="10.5" width="33" height="30" rx="7.5" fill="none" stroke="#1C1917" strokeOpacity="0.08" />
    </svg>
  );
}

export const KIND_FILTER_LABELS: Record<KindFilter, string> = {
  all: 'Wszystkie',
  lecture: 'Wykłady',
  exercise: 'Ćwiczenia',
  simulation: 'Symulacje',
  other: 'Inne',
};
