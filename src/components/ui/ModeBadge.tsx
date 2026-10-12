import { ClassMode } from '../../utils/blocks';
import { University, Video } from './icons';

/** Online (blue) or at the university (sand), so it's clear at a glance whether to travel. */
export function ModeBadge({ mode, size = 'md' }: { mode: ClassMode; size?: 'sm' | 'md' }) {
  if (mode === 'unknown') return null;
  const online = mode === 'online';
  const Icon = online ? Video : University;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-semibold ${
        online ? 'bg-online-bg text-online-ink' : 'bg-onsite-bg text-onsite-ink'
      } ${size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-[22px] px-2 text-xs'}`}
    >
      <Icon size={size === 'sm' ? 12 : 13} strokeWidth={2.2} />
      {online ? 'Online' : 'Na uczelni'}
    </span>
  );
}
