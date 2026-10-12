import { useApp } from '../../app/AppContext';
import { MONTH_NAMES, getWeekLabelShort, formatTimestamp } from '../../utils/dateUtils';
import { GroupTag } from '../ui/GroupTag';
import { ChevronDown, Search, UserIcon } from '../ui/icons';
import { DisplayTitle } from '../ui/DisplayTitle';

interface PhoneHeaderProps {
  summaryOpen: boolean;
  onToggleSummary: () => void;
  searchOpen: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onOpenFilters: () => void;
}

export function PhoneHeader({
  summaryOpen,
  onToggleSummary,
  searchOpen,
  query,
  onQueryChange,
  onOpenSearch,
  onCloseSearch,
  onOpenFilters,
}: PhoneHeaderProps) {
  const { calendar, schedule, stats } = useApp();
  const title = calendar.view === 'month'
    ? `${MONTH_NAMES[calendar.cursor.getMonth()]} ${calendar.cursor.getFullYear()}`
    : getWeekLabelShort(calendar.weekStart);

  if (searchOpen) {
    return (
      <header className="sticky top-0 z-20 flex items-center gap-1 bg-bg/90 px-4 pb-1 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-md">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Szukaj zajęć</span>
          <Search size={18} strokeWidth={2.2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onCloseSearch(); }}
            placeholder="Przedmiot, sala, wykładowca"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-raise bg-surface pl-11 pr-4 text-base text-ink shadow-[0_0_0_2px_rgb(var(--ink)),0_6px_18px_rgba(28,25,23,.10)] outline-none placeholder:text-ink-3"
          />
        </label>
        <button type="button" onClick={onCloseSearch} className="h-11 px-2 text-[15px] font-semibold">
          Anuluj
        </button>
      </header>
    );
  }

  const selected = [...schedule.selectedGroups].sort();
  const isTeacher = schedule.mode === 'teacher';

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-bg/90 pb-0.5 pl-2.5 pr-2 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-md">
        <button
          type="button"
          aria-expanded={summaryOpen}
          onClick={onToggleSummary}
          className="flex h-11 items-center gap-1.5 rounded-xl px-2"
        >
          <span className="whitespace-nowrap text-2xl leading-7 tracking-[-0.02em]"><DisplayTitle text={title} /></span>
          <ChevronDown size={18} strokeWidth={2.2} className={`text-ink-2 transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`} />
          <span className="sr-only">{summaryOpen ? 'Ukryj podsumowanie' : 'Pokaż podsumowanie'}</span>
        </button>
        <div className="flex items-center gap-0.5">
          <button type="button" aria-label="Szukaj zajęć" onClick={onOpenSearch} className="grid h-11 w-11 place-items-center rounded-full">
            <Search size={20} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={isTeacher ? 'Zmień wykładowców' : `Wybrane grupy: ${selected.join(', ') || 'brak'}. Zmień`}
            className="raised flex h-11 items-center gap-1 rounded-full pl-2 pr-2"
          >
            {isTeacher ? (
              <span className="flex items-center gap-1.5 px-1 text-sm font-semibold">
                <UserIcon size={16} />
                {schedule.selectedTeachers.size}
              </span>
            ) : selected.length === 0 ? (
              <span className="px-1 text-sm font-semibold">Wybierz grupę</span>
            ) : (
              <>
                {selected.slice(0, 3).map(group => <GroupTag key={group} group={group} />)}
                {selected.length > 3 && <span className="px-0.5 tabular-nums text-xs font-semibold text-ink-2">+{selected.length - 3}</span>}
              </>
            )}
            <ChevronDown size={16} className="text-ink-2" />
          </button>
        </div>
      </header>

      {summaryOpen && (
        <div className="grid animate-pop-in grid-cols-3 gap-2 px-4 pb-1 pt-1.5">
          <SummaryTile value={String(stats.thisWeek)} label="w tym tygodniu" />
          <SummaryTile value={String(stats.remaining)} label="do końca semestru" />
          <SummaryTile value={schedule.lastUpdated ? formatTimestamp(schedule.lastUpdated).slice(0, 5) : '—'} label="plan z dnia" />
        </div>
      )}
    </>
  );
}

function SummaryTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-line bg-surface px-3 py-2.5">
      <span className="tabular-nums text-lg font-semibold leading-[22px]">{value}</span>
      <span className="text-xs leading-4 text-ink-2">{label}</span>
    </div>
  );
}
