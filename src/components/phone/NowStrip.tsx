import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { durationLabel } from '../../utils/dateUtils';
import { GroupTags } from '../ui/GroupTag';
import { ChevronDown } from '../ui/icons';

/** Slim dark bar for the class happening now (or the next one today); tap to expand. */
export function NowStrip() {
  const { live } = useApp();
  const [open, setOpen] = useState(false);
  const block = live.current ?? live.next;
  if (!block) return null;

  const isNow = !!live.current;
  const place = block.event.online ? 'Online' : block.event.location;

  return (
    <article className="overflow-hidden rounded-2xl bg-hero text-hero-ink">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="relative flex min-h-[52px] w-full items-center gap-2.5 pl-3.5 pr-3 text-left"
      >
        {isNow ? <span className="live-dot shrink-0" /> : <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-current" />}
        <span className="shrink-0 text-[13px] font-semibold opacity-70">{isNow ? 'Teraz' : 'Następne'}</span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{block.event.title}</span>
        <span className="shrink-0 tabular-nums text-[13px] opacity-70">
          {isNow ? `do ${block.end}` : `za ${durationLabel(live.untilNextMin)}`}
        </span>
        <ChevronDown size={18} strokeWidth={2.2} className={`shrink-0 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        {isNow && (
          <>
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-current opacity-15" />
            <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] bg-current" style={{ width: `${live.progress}%` }} />
          </>
        )}
      </button>
      {open && (
        <div className="flex animate-fade-in flex-col gap-2.5 px-3.5 pb-3.5 pt-3">
          <div className="flex items-center gap-1">
            <GroupTags groups={block.groups} />
            <span className="ml-auto text-[13px] opacity-70">
              {isNow ? `jeszcze ${durationLabel(live.remainingMin)}` : `${block.start} – ${block.end}`}
            </span>
          </div>
          <div className="text-sm opacity-80">
            {[place, block.event.instructor].filter(Boolean).join(' · ')}
          </div>
          {isNow && live.next && (
            <>
              <div className="h-px bg-current opacity-15" />
              <div className="flex min-w-0 items-baseline gap-2.5 text-sm">
                <span className="opacity-70">Potem</span>
                <span className="tabular-nums font-medium">{live.next.start}</span>
                <span className="min-w-0 truncate font-medium">
                  {live.next.event.title}
                  {live.next.event.location ? ` · ${live.next.event.location}` : ''}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
