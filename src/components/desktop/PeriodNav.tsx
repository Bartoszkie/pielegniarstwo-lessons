import { useApp } from '../../app/AppContext';
import { ViewType } from '../../types';
import { ChevronLeft, ChevronRight } from '../ui/icons';

/** Previous / today / next, and week or month */
export function PeriodNav() {
  const { calendar } = useApp();
  return (
    <>
      <div className="flex items-center gap-1">
        <button type="button" aria-label={calendar.view === 'week' ? 'Poprzedni tydzień' : 'Poprzedni miesiąc'} onClick={() => calendar.shiftPeriod(-1)} className="raised grid h-10 w-10 place-items-center rounded-[10px]">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={calendar.goToToday} className="raised h-10 rounded-[10px] px-3.5 text-sm font-semibold">
          Dziś
        </button>
        <button type="button" aria-label={calendar.view === 'week' ? 'Następny tydzień' : 'Następny miesiąc'} onClick={() => calendar.shiftPeriod(1)} className="raised grid h-10 w-10 place-items-center rounded-[10px]">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="flex gap-1">
        {(['month', 'week'] as ViewType[]).map(view => (
          <button
            key={view}
            type="button"
            aria-pressed={calendar.view === view}
            onClick={() => calendar.setView(view)}
            className={`h-10 rounded-[10px] px-3.5 text-sm ${calendar.view === view ? 'pressed font-semibold' : 'raised font-medium'}`}
          >
            {view === 'week' ? 'Tydzień' : 'Miesiąc'}
          </button>
        ))}
      </div>
    </>
  );
}
