import { useEffect, useRef } from 'react';
import { useApp } from '../../app/AppContext';
import { ClassBlock, isClass } from '../../utils/blocks';
import { addDays, DAY_NAMES_FULL, formatDate, capitalize, isSameDay } from '../../utils/dateUtils';
import { ClassRow, RowState } from '../ClassRow';
import { EmptyState } from './EmptyState';

type Entry =
  | { type: 'day'; date: Date; key: string; blocks: ClassBlock[] }
  | { type: 'gap'; text: string; key: string };

function gapText(days: Date[]): string {
  const name = (d: Date) => `${DAY_NAMES_FULL[d.getDay()]} ${d.getDate()}`;
  if (days.length === 1) return `${capitalize(name(days[0]))} · bez zajęć`;
  if (days.length === 2) return `${capitalize(name(days[0]))} i ${name(days[1])} · bez zajęć`;
  return `${capitalize(name(days[0]))} – ${name(days[days.length - 1])} · bez zajęć`;
}

/** The phone week view: one card per day with classes, empty days folded into one line. */
export function WeekAgenda({ onPick }: { onPick: () => void }) {
  const { calendar, visibleByDate, live, todayKey, hasSelection } = useApp();
  const cursorKey = formatDate(calendar.cursor);
  const previousKey = useRef(cursorKey);

  // Scroll to the day picked with the footer arrows (not on first render)
  useEffect(() => {
    if (previousKey.current === cursorKey) return;
    previousKey.current = cursorKey;
    document.getElementById(`day-${cursorKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [cursorKey]);

  if (!hasSelection) return <EmptyState kind="no-selection" onPick={onPick} />;

  const entries: Entry[] = [];
  let pending: Date[] = [];
  const flush = () => {
    if (pending.length) entries.push({ type: 'gap', text: gapText(pending), key: `gap-${formatDate(pending[0])}` });
    pending = [];
  };
  for (let i = 0; i < 7; i++) {
    const date = addDays(calendar.weekStart, i);
    const key = formatDate(date);
    const blocks = visibleByDate[key] ?? [];
    if (blocks.length === 0) {
      pending.push(date);
    } else {
      flush();
      entries.push({ type: 'day', date, key, blocks });
    }
  }
  flush();

  if (!entries.some(e => e.type === 'day')) return <EmptyState kind="empty-week" />;

  return (
    <div className="flex flex-col gap-5">
      {entries.map(entry => {
        if (entry.type === 'gap') {
          return <p key={entry.key} className="px-2 text-sm text-ink-2">{entry.text}</p>;
        }
        const isTodayDay = entry.key === todayKey;
        const classes = entry.blocks.filter(isClass);
        const parallel = classes.some((a, i) => classes.some((b, j) => i !== j && a.startMin < b.endMin && b.startMin < a.endMin));
        const isCursor = isSameDay(entry.date, calendar.cursor) && !isTodayDay;
        return (
          <section key={entry.key} id={`day-${entry.key}`} className="flex scroll-mt-20 flex-col gap-2">
            <h2 className="flex items-center gap-2 px-2 text-[15px] font-semibold leading-[22px]">
              <span className={isCursor ? 'underline decoration-2 underline-offset-4' : ''}>{capitalize(DAY_NAMES_FULL[entry.date.getDay()])}</span>
              <span className="font-normal text-ink-2">{entry.date.getDate()}</span>
              {isTodayDay && (
                <span className="inline-flex h-[22px] items-center rounded-full bg-ink px-2 text-xs font-semibold text-bg">Dziś</span>
              )}
              {parallel && <span className="text-[13px] font-normal text-ink-2">· zajęcia równoległe</span>}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              {entry.blocks.map(block => {
                let state: RowState = 'none';
                if (isTodayDay && live.current?.id === block.id) state = 'live';
                else if (isTodayDay && live.next?.id === block.id) state = 'next';
                return (
                  <ClassRow
                    key={block.id}
                    block={block}
                    state={state}
                    progress={live.progress}
                    remainingMin={live.remainingMin}
                    untilMin={live.untilNextMin}
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
