import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { ClassBlock } from '../../utils/blocks';
import { classesLabel, getMonthLabel, getWeekLabel, parseDate } from '../../utils/dateUtils';
import { ViewType } from '../../types';
import { KindChips } from '../ui/KindChips';
import { DisplayTitle } from '../ui/DisplayTitle';
import { ChevronLeft, ChevronRight, Search } from '../ui/icons';
import { Sidebar } from './Sidebar';
import { WeekGrid } from './WeekGrid';
import { MonthGrid } from './MonthGrid';
import { SearchDialog } from './SearchDialog';

export function DesktopApp() {
  const { calendar, kindCounts, kind, hasSelection } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A popover closing must not clear a block opened since: Radix closes the old one only after
  // the click that opened the new one, so a plain setSelectedId(null) would close both
  const toggleBlock = useCallback((id: string, open: boolean) => {
    setSelectedId(current => (open ? id : current === id ? null : current));
  }, []);

  // Search can pick a class from any week, so it jumps to that week
  const openBlock = (block: ClassBlock) => {
    calendar.setCursor(parseDate(block.date));
    calendar.setView('week');
    setSelectedId(block.id);
  };

  const title = calendar.view === 'week' ? getWeekLabel(calendar.weekStart) : getMonthLabel(calendar.cursor);
  const total = kindCounts.find(k => k.kind === 'all')?.count ?? 0;
  const shown = kindCounts.find(k => k.kind === kind)?.count ?? 0;
  const periodWord = calendar.view === 'week' ? 'w tym tygodniu' : 'w tym miesiącu';

  return (
    <div className="flex min-h-dvh flex-wrap items-stretch">
      <Sidebar />
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-7 pb-8 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[28px] leading-8 tracking-[-0.02em]"><DisplayTitle text={title} /></h1>
            <p className="text-sm text-ink-2">
              {hasSelection ? `${classesLabel(total)} ${periodWord}${kind !== 'all' ? ` · widoczne: ${shown}` : ''}` : 'Wybierz grupę, żeby zobaczyć zajęcia'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-label="Szukaj zajęć"
              title="Szukaj (⌘K)"
              onClick={() => setSearchOpen(true)}
              className="raised grid h-10 w-10 place-items-center rounded-[10px]"
            >
              <Search size={18} strokeWidth={2.2} />
            </button>
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
              {(['week', 'month'] as ViewType[]).map(view => (
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
          </div>
        </div>

        {hasSelection && <KindChips size="lg" className="flex-wrap" />}

        {calendar.view === 'week'
          ? <WeekGrid selectedId={selectedId} onToggle={toggleBlock} />
          : <MonthGrid selectedId={selectedId} onToggle={toggleBlock} />}
      </main>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onPick={openBlock} />
    </div>
  );
}
