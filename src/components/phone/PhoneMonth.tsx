import { useApp } from '../../app/AppContext';
import { isClass } from '../../utils/blocks';
import { getGroupColor } from '../../constants/groupColors';
import { classesLabel, formatDate, getDayLabel, getMonthDays, isSameDay, isSameMonth, capitalize, WEEKDAYS_NARROW } from '../../utils/dateUtils';
import { GroupId } from '../../types';
import { ClassRow, RowState } from '../ClassRow';
import { EmptyState } from './EmptyState';

/** Phone month view: a compact grid with group dots and the chosen day's classes below it. */
export function PhoneMonth({ onPick }: { onPick: () => void }) {
  const { calendar, visibleByDate, todayKey, live, hasSelection } = useApp();
  if (!hasSelection) return <EmptyState kind="no-selection" onPick={onPick} />;

  const { cursor } = calendar;
  const days = getMonthDays(cursor.getFullYear(), cursor.getMonth());
  const cursorKey = formatDate(cursor);
  const selected = visibleByDate[cursorKey] ?? [];
  const selectedClasses = selected.filter(isClass);
  const isTodaySelected = cursorKey === todayKey;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-line bg-surface px-2 pb-2 pt-2.5">
        <div className="grid grid-cols-7 pb-1.5">
          {WEEKDAYS_NARROW.map(day => (
            <span key={day} className="text-center text-xs font-medium text-ink-2">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map(date => {
            const key = formatDate(date);
            const inMonth = isSameMonth(date, cursor);
            const blocks = inMonth ? visibleByDate[key] ?? [] : [];
            const classes = blocks.filter(isClass);
            const hasInfo = blocks.length > classes.length;
            const groups: GroupId[] = [];
            classes.forEach(b => b.groups.forEach(g => { if (!groups.includes(g)) groups.push(g); }));
            const isToday = key === todayKey;
            const isSel = isSameDay(date, cursor);
            const numberClass = isToday
              ? 'bg-ink text-bg font-semibold'
              : isSel
                ? 'shadow-[inset_0_0_0_1.5px_rgb(var(--ink))] font-semibold'
                : !inMonth
                  ? 'text-line-strong'
                  : classes.length
                    ? 'font-semibold'
                    : 'text-ink-3';
            return (
              <button
                key={key}
                type="button"
                disabled={!inMonth}
                aria-pressed={isSel}
                aria-label={`${getDayLabel(date)}${classes.length ? `, ${classesLabel(classes.length)}` : ''}`}
                onClick={() => calendar.setCursor(date)}
                className="flex h-[52px] flex-col items-center gap-1 pt-0.5"
              >
                <span
                  className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[15px] ${numberClass} ${
                    isToday && isSel ? 'shadow-[0_0_0_2px_rgb(var(--surface)),0_0_0_3.5px_rgb(var(--ink))]' : ''
                  }`}
                >
                  {date.getDate()}
                </span>
                <span className="flex h-1.5 gap-[3px]">
                  {groups.slice(0, 3).map(g => (
                    <span key={g} className="h-1.5 w-1.5 rounded-full" style={{ background: getGroupColor(g) }} />
                  ))}
                  {!classes.length && hasInfo && <span className="h-0.5 w-2.5 self-center rounded-full bg-ink-3" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="flex items-baseline justify-between gap-2 px-2 text-[15px] font-semibold leading-[22px]">
          <span>{capitalize(getDayLabel(cursor))}{isTodaySelected ? ' · dziś' : ''}</span>
          <span className="text-[13px] font-normal text-ink-2">{classesLabel(selectedClasses.length)}</span>
        </h2>
        {selected.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface px-4 py-6 text-center text-sm text-ink-2">Tego dnia nie ma zajęć.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {selected.map(block => {
              let state: RowState = 'none';
              if (isTodaySelected && live.current?.id === block.id) state = 'live';
              else if (live.next?.id === block.id) state = 'next';
              return (
                <ClassRow key={block.id} block={block} state={state} progress={live.progress} remainingMin={live.remainingMin} untilLabel={live.untilNextLabel} />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
