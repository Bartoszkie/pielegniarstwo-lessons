import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { addDays, capitalize, durationLabel, formatDate, parseDate, relativeDayLabel } from '../../utils/dateUtils';
import { GroupTags } from '../ui/GroupTag';
import { ChevronDown } from '../ui/icons';

/**
 * Slim dark bar about today: the class happening now, the next one today,
 * or, on a free day (or once today's classes are over), when the next classes are.
 * Tap to expand.
 */
export function NowStrip() {
  const { live, todayKey, calendar } = useApp();
  const [open, setOpen] = useState(false);
  const { current, next } = live;
  const isNow = !!current;
  const isLaterToday = !isNow && live.today === 'classes';
  const block = current ?? next;

  // No class today, or today's are over: say so first, then when the next ones are
  if (!isNow && !isLaterToday) {
    // A free today inside the shown week has its own card in the list
    const todayInWeek = todayKey >= formatDate(calendar.weekStart) && todayKey <= formatDate(addDays(calendar.weekStart, 6));
    if (live.today === 'free' && todayInWeek) return null;
    const headline = live.today === 'free' ? 'Dziś wolne' : 'Na dziś koniec';
    if (!next) {
      return (
        <article className="flex min-h-[52px] items-center gap-2.5 rounded-2xl bg-hero pl-3.5 pr-3 text-hero-ink">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-current" />
          <span className="text-[15px] font-semibold">{headline}</span>
          <span className="min-w-0 truncate text-[13px] opacity-70">· brak kolejnych zajęć w planie</span>
        </article>
      );
    }
    const day = relativeDayLabel(parseDate(next.date), parseDate(todayKey));
    const place = next.event.online ? 'Online' : next.event.location;
    return (
      <article className="overflow-hidden rounded-2xl bg-hero text-hero-ink">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className="flex min-h-[52px] w-full items-center gap-2.5 py-2 pl-3.5 pr-3 text-left"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-current" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[15px] font-semibold leading-5">{headline}</span>
            <span className="truncate text-[13px] leading-[18px] opacity-70">
              Następne: {day}, {next.start}
            </span>
          </span>
          {/* "jutro" is already in the line above */}
          {live.untilNextLabel !== 'jutro' && <span className="shrink-0 text-[13px] font-semibold">{live.untilNextLabel}</span>}
          <ChevronDown size={18} strokeWidth={2.2} className={`shrink-0 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="flex animate-fade-in flex-col gap-2.5 px-3.5 pb-3.5 pt-1">
            <div className="flex items-center gap-1">
              <GroupTags groups={next.groups} />
              <span className="ml-auto tabular-nums text-[13px] opacity-70">{capitalize(day)}, {next.start} – {next.end}</span>
            </div>
            <div className="text-[15px] font-semibold">{next.event.title}</div>
            <div className="text-sm opacity-80">{[place, next.event.instructor].filter(Boolean).join(' · ')}</div>
            <button
              type="button"
              onClick={() => {
                calendar.setCursor(parseDate(next.date));
                setOpen(false);
              }}
              className="mt-1 h-10 rounded-xl bg-hero-ink/10 text-sm font-semibold"
            >
              Pokaż w planie
            </button>
          </div>
        )}
      </article>
    );
  }

  if (!block) return null;
  const place = block.event.online ? 'Online' : block.event.location;
  const nextToday = isNow && next && live.nextInDays === 0 ? next : null;

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
          {isNow ? `do ${block.end}` : live.untilNextLabel}
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
              {isNow ? `jeszcze ${durationLabel(live.remainingMin)}` : `dziś, ${block.start} – ${block.end}`}
            </span>
          </div>
          <div className="text-sm opacity-80">
            {[place, block.event.instructor].filter(Boolean).join(' · ')}
          </div>
          {nextToday && (
            <>
              <div className="h-px bg-current opacity-15" />
              <div className="flex min-w-0 items-baseline gap-2.5 text-sm">
                <span className="opacity-70">Potem</span>
                <span className="tabular-nums font-medium">{nextToday.start}</span>
                <span className="min-w-0 truncate font-medium">
                  {nextToday.event.title}
                  {nextToday.event.location ? ` · ${nextToday.event.location}` : ''}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
