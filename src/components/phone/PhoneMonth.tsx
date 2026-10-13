import { useApp } from '../../app/AppContext';
import { ClassBlock, isClass } from '../../utils/blocks';
import { classesLabel, formatDate, getDayLabel, capitalize } from '../../utils/dateUtils';
import { ClassRow, rowState } from '../ClassRow';
import { EmptyState } from './EmptyState';
import { FreeDayCard } from './FreeDayCard';
import { MonthCarousel } from './MonthCarousel';

/** Phone month view: a compact grid with group dots (swiped sideways to change month) and the chosen day's classes below it. */
export function PhoneMonth({ onPick, onOpenClass }: { onPick: () => void; onOpenClass: (block: ClassBlock) => void }) {
  const { calendar, visibleByDate, todayKey, live, hasSelection, kind } = useApp();
  if (!hasSelection) return <EmptyState kind="no-selection" onPick={onPick} />;

  const { cursor } = calendar;
  const cursorKey = formatDate(cursor);
  const selected = visibleByDate[cursorKey] ?? [];
  const selectedClasses = selected.filter(isClass);
  const isTodaySelected = cursorKey === todayKey;

  return (
    <div className="flex flex-col gap-4">
      <MonthCarousel />

      <section key={`${cursorKey}|${kind}`} className="enter-quick flex flex-col gap-2" style={{ '--i': 2 } as React.CSSProperties}>
        <h2 className="flex items-baseline justify-between gap-2 px-2 text-[15px] font-semibold leading-[22px]">
          <span>{capitalize(getDayLabel(cursor))}{isTodaySelected ? ' · dziś' : ''}</span>
          <span className="text-[13px] font-normal text-ink-2">{classesLabel(selectedClasses.length)}</span>
        </h2>
        {selected.length === 0 && isTodaySelected && live.today === 'free' ? (
          <FreeDayCard />
        ) : selected.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface px-4 py-6 text-center text-sm text-ink-2">Tego dnia nie ma zajęć.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {selected.map((block, i) => {
              const state = rowState(block, live, isTodaySelected);
              return (
                <ClassRow
                  key={block.id}
                  block={block}
                  state={state}
                  divided={i > 0 && state === 'none' && rowState(selected[i - 1], live, isTodaySelected) === 'none'}
                  progress={live.progress}
                  remainingMin={live.remainingMin}
                  untilLabel={live.untilNextLabel}
                  onOpen={isClass(block) ? () => onOpenClass(block) : undefined}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
