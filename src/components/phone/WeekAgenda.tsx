import { useEffect, useRef } from 'react';
import { useApp } from '../../app/AppContext';
import { ClassBlock, isClass } from '../../utils/blocks';
import { addDays, DAY_NAMES_FULL, formatDate, capitalize, isSameDay } from '../../utils/dateUtils';
import { ClassRow, RowState } from '../ClassRow';
import { Moon } from '../ui/icons';
import { EmptyState } from './EmptyState';
import { FreeDayCard } from './FreeDayCard';

type Entry =
  | { type: 'day'; date: Date; key: string; blocks: ClassBlock[] }
  | { type: 'gap'; range: string; key: string }
  | { type: 'free-today'; date: Date; key: string };

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
  const { calendar, visibleByDate, live, todayKey, hasSelection } = useApp();
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
    if (blocks.length === 0 && key === todayKey) {
      // Today stays visible on its own, so a free day isn't lost inside a range
      flush();
      entries.push({ type: 'free-today', date, key });
    } else if (blocks.length === 0) {
      pending.push(date);
    } else {
      flush();
      entries.push({ type: 'day', date, key, blocks });
    }
  }
  flush();

  if (!entries.some(e => e.type !== 'gap')) return <EmptyState kind="empty-week" />;

  return (
    <div className="flex flex-col gap-[18px]">
      {entries.map(entry => {
        if (entry.type === 'gap') {
          return (
            <p key={entry.key} className="flex min-h-11 items-center gap-2.5 rounded-[14px] border border-dashed border-line-strong px-3.5 py-2.5 text-sm text-ink-2">
              <Moon size={18} className="shrink-0" />
              <span><span className="font-semibold text-ink">{entry.range}</span> · bez zajęć</span>
            </p>
          );
        }
        if (entry.type === 'free-today') {
          // A filter can hide today's classes; only a really free day gets the card
          const reallyFree = live.today === 'free';
          return (
            <section key={entry.key} id={`day-${entry.key}`} className="flex scroll-mt-20 flex-col gap-2">
              <DayHeading date={entry.date} today>
                {!reallyFree && <span className="text-sm font-normal text-ink-2">· brak zajęć tego rodzaju</span>}
              </DayHeading>
              {reallyFree && <FreeDayCard />}
            </section>
          );
        }
        const isTodayDay = entry.key === todayKey;
        const classes = entry.blocks.filter(isClass);
        const parallel = classes.some((a, i) => classes.some((b, j) => i !== j && a.startMin < b.endMin && b.startMin < a.endMin));
        return (
          <section key={entry.key} id={`day-${entry.key}`} className="flex scroll-mt-20 flex-col gap-2">
            <DayHeading date={entry.date} today={isTodayDay}>
              {parallel && <span className="text-[13px] font-normal text-ink-2">· zajęcia równoległe</span>}
            </DayHeading>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {entry.blocks.map(block => {
                let state: RowState = 'none';
                if (isTodayDay && live.current?.id === block.id) state = 'live';
                else if (live.next?.id === block.id) state = 'next';
                return (
                  <ClassRow
                    key={block.id}
                    block={block}
                    state={state}
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
