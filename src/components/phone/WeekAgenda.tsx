import { useEffect, useRef } from 'react';
import { useApp } from '../../app/AppContext';
import { ClassBlock, ClassMode, isClass } from '../../utils/blocks';
import { addDays, DAY_NAMES_FULL, formatDate, capitalize, isSameDay } from '../../utils/dateUtils';
import { ClassRow, rowState } from '../ClassRow';
import { Info, Moon } from '../ui/icons';
import { ModeBadge } from '../ui/ModeBadge';
import { EmptyState } from './EmptyState';
import { FreeDayCard } from './FreeDayCard';

type Entry =
  | { type: 'day'; date: Date; key: string; blocks: ClassBlock[] }
  | { type: 'gap'; range: string; key: string }
  | { type: 'notice'; range: string; text: string; key: string; days: Date[] }
  | { type: 'free-today'; date: Date; key: string; note: string };

/** "Przerwa świąteczna, 21.12.2026 – 03.01.2027" for the notices of a day */
function noticeText(blocks: ClassBlock[]): string {
  return blocks.map(b => (b.event.notes ? `${b.event.title}, ${b.event.notes}` : b.event.title)).join(' · ');
}

/** The day's classes are all online, or all at the university */
function dayMode(classes: ClassBlock[]): ClassMode {
  const modes = new Set(classes.map(b => b.mode));
  return modes.size === 1 ? classes[0].mode : 'unknown';
}

function gapRange(days: Date[]): string {
  const name = (d: Date) => `${DAY_NAMES_FULL[d.getDay()]} ${d.getDate()}`;
  if (days.length === 1) return capitalize(name(days[0]));
  if (days.length === 2) return `${capitalize(name(days[0]))} i ${name(days[1])}`;
  return `${capitalize(name(days[0]))} – ${name(days[days.length - 1])}`;
}

function TodayBadge() {
  return <span className="inline-flex h-[22px] items-center rounded-full bg-ink px-2 text-xs font-semibold text-bg">Dziś</span>;
}

function DayHeading({ date, today, children }: { date: Date; today: boolean; children?: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 px-2 text-[15px] font-semibold leading-[22px]">
      <span>{capitalize(DAY_NAMES_FULL[date.getDay()])}</span>
      <span className="font-normal text-ink-2">{date.getDate()}</span>
      {today && <TodayBadge />}
      {children}
    </h2>
  );
}

interface WeekAgendaProps {
  onPick: () => void;
  onOpenClass: (block: ClassBlock) => void;
}

/** The phone week view: one card per day with classes; empty days folded into one line, except today. */
export function WeekAgenda({ onPick, onOpenClass }: WeekAgendaProps) {
  const { calendar, visibleByDate, live, todayKey, hasSelection, kind } = useApp();
  const cursorKey = formatDate(calendar.cursor);
  const previousKey = useRef(cursorKey);

  // Follow the cursor (not on first render): a new week starts at the top, a picked day scrolls into view
  useEffect(() => {
    if (previousKey.current === cursorKey) return;
    previousKey.current = cursorKey;
    const section = document.getElementById(`day-${cursorKey}`);
    if (section && !isSameDay(calendar.cursor, calendar.weekStart)) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [cursorKey, calendar.cursor, calendar.weekStart]);

  if (!hasSelection) return <EmptyState kind="no-selection" onPick={onPick} />;

  const entries: Entry[] = [];
  let pending: Date[] = [];
  const flush = () => {
    if (pending.length) entries.push({ type: 'gap', range: gapRange(pending), key: `gap-${formatDate(pending[0])}` });
    pending = [];
  };
  for (let i = 0; i < 7; i++) {
    const date = addDays(calendar.weekStart, i);
    const key = formatDate(date);
    const blocks = visibleByDate[key] ?? [];
    const hasClasses = blocks.some(isClass);
    if (!hasClasses && key === todayKey) {
      // Today stays visible on its own, so a free day isn't lost inside a range
      flush();
      entries.push({ type: 'free-today', date, key, note: noticeText(blocks) });
    } else if (blocks.length === 0) {
      pending.push(date);
    } else if (!hasClasses) {
      // Days with only a notice (a day off, a break): one line, joined with the next day if it says the same
      flush();
      const text = noticeText(blocks);
      const last = entries[entries.length - 1];
      if (last?.type === 'notice' && last.text === text) {
        last.days.push(date);
        last.range = gapRange(last.days);
      } else {
        entries.push({ type: 'notice', range: gapRange([date]), text, key: `notice-${key}`, days: [date] });
      }
    } else {
      flush();
      entries.push({ type: 'day', date, key, blocks });
    }
  }
  flush();

  // A new week (or filter) remounts the list, so its entries fade up one after another
  const animKey = `${formatDate(calendar.weekStart)}|${kind}`;

  if (!entries.some(e => e.type !== 'gap')) {
    return (
      <div key={animKey} className="enter">
        <EmptyState kind="empty-week" />
      </div>
    );
  }

  return (
    <div key={animKey} className="flex flex-col gap-[18px]">
      {entries.map((entry, index) => {
        const enter = { '--i': index } as React.CSSProperties;
        if (entry.type === 'gap') {
          return (
            <p key={entry.key} style={enter} className="enter flex min-h-11 items-center gap-2.5 rounded-[14px] border border-dashed border-line-strong px-3.5 py-2.5 text-sm text-ink-2">
              <Moon size={18} className="shrink-0" />
              <span><span className="font-semibold text-ink">{entry.range}</span> · bez zajęć</span>
            </p>
          );
        }
        if (entry.type === 'notice') {
          return (
            <p key={entry.key} style={enter} className="enter flex min-h-11 items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-2">
              <Info size={18} className="shrink-0 text-ink" />
              <span><span className="font-semibold text-ink">{entry.range}</span> · {entry.text}</span>
            </p>
          );
        }
        if (entry.type === 'free-today') {
          // A filter can hide today's classes; only a really free day gets the card
          const reallyFree = live.today === 'free';
          return (
            <section key={entry.key} id={`day-${entry.key}`} style={enter} className="enter flex scroll-mt-20 flex-col gap-2">
              <DayHeading date={entry.date} today>
                {!reallyFree && <span className="text-sm font-normal text-ink-2">· brak zajęć tego rodzaju</span>}
              </DayHeading>
              {reallyFree && <FreeDayCard note={entry.note || undefined} />}
            </section>
          );
        }
        const isTodayDay = entry.key === todayKey;
        const classes = entry.blocks.filter(isClass);
        const parallel = classes.some((a, i) => classes.some((b, j) => i !== j && a.startMin < b.endMin && b.startMin < a.endMin));
        const mode = dayMode(classes);
        return (
          <section key={entry.key} id={`day-${entry.key}`} style={enter} className="enter flex scroll-mt-20 flex-col gap-2">
            <DayHeading date={entry.date} today={isTodayDay}>
              {mode !== 'unknown' && <ModeBadge mode={mode} size="sm" />}
              {parallel && <span className="text-[13px] font-normal text-ink-2">· zajęcia równoległe</span>}
            </DayHeading>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {entry.blocks.map((block, i) => {
                const state = rowState(block, live, isTodayDay);
                return (
                  <ClassRow
                    key={block.id}
                    block={block}
                    state={state}
                    divided={i > 0 && state === 'none' && rowState(entry.blocks[i - 1], live, isTodayDay) === 'none'}
                    progress={live.progress}
                    remainingMin={live.remainingMin}
                    untilLabel={live.untilNextLabel}
                    onOpen={isClass(block) ? () => onOpenClass(block) : undefined}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
