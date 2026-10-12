import { useApp } from '../../app/AppContext';
import { isClass } from '../../utils/blocks';
import { addDays, formatDate, getDayLabel, parseDate } from '../../utils/dateUtils';

interface EmptyStateProps {
  kind: 'no-selection' | 'empty-week' | 'empty-day';
  onPick?: () => void;
}

export function EmptyState({ kind, onPick }: EmptyStateProps) {
  const { calendar, schedule, visibleByDate, kind: filter, setKind } = useApp();

  if (kind === 'no-selection') {
    const teacher = schedule.mode === 'teacher';
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
        <span className="font-serif text-[28px] italic leading-8 [text-wrap:balance]">{teacher ? 'Nie wybrano wykładowcy' : 'Nie wybrano żadnej grupy'}</span>
        <span className="text-sm text-ink-2">
          {teacher ? 'Zaznacz prowadzących, żeby zobaczyć ich zajęcia.' : 'Zaznacz swoją grupę, żeby zobaczyć zajęcia.'}
        </span>
        {onPick && (
          <button type="button" onClick={onPick} className="mt-2 h-11 rounded-xl bg-ink px-5 text-sm font-semibold text-bg">
            {teacher ? 'Wybierz wykładowców' : 'Wybierz grupę'}
          </button>
        )}
      </div>
    );
  }

  // The first classes after the empty week (or day) being looked at
  const after = formatDate(kind === 'empty-week' ? addDays(calendar.weekStart, 6) : calendar.cursor);
  const nextDate = Object.keys(visibleByDate).filter(d => d > after && visibleByDate[d].some(isClass)).sort()[0];
  const next = nextDate ? visibleByDate[nextDate].find(isClass) ?? null : null;
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-6 py-10 text-center">
      <span className="font-serif text-[28px] italic leading-8 [text-wrap:balance]">
        {kind === 'empty-week' ? 'W tym tygodniu nie ma zajęć' : 'Tego dnia nie ma zajęć'}
      </span>
      {filter !== 'all' ? (
        <button type="button" onClick={() => setKind('all')} className="raised mt-1 h-10 rounded-xl px-4 text-sm font-semibold">
          Pokaż wszystkie rodzaje zajęć
        </button>
      ) : next ? (
        <>
          <span className="text-sm text-ink-2">Następne zajęcia: {getDayLabel(parseDate(next.date))}, {next.start}</span>
          <button
            type="button"
            onClick={() => calendar.setCursor(parseDate(next.date))}
            className="raised mt-1 h-10 rounded-xl px-4 text-sm font-semibold"
          >
            Przejdź do nich
          </button>
        </>
      ) : null}
    </div>
  );
}
