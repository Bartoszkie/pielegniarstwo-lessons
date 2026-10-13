import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { usePeriodStep } from '../../hooks/usePeriodStep';
import { addDays, formatDate, getDayLabel, getMonthLabel, getWeekLabel, isSameMonth } from '../../utils/dateUtils';
import { ViewType } from '../../types';
import { ThemeToggle } from '../ui/ThemeToggle';
import { CalendarGrid, Check, ChevronLeft, ChevronRight, FileUp, Help, Info, MoreVertical, Rows } from '../ui/icons';

const HUMP_WIDTH = 340;
const BAR_TOP = 58;
/** The bar runs this far below the screen, so a dock iOS lifts off the bottom edge leaves no gap */
const BOTTOM_BLEED = 120;
const SHORT_DAYS = ['NDZ', 'PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB'];

/**
 * Floating footer: the bar rises in a soft hump around the controls, which overlap its edge.
 * The arrows move by a week or a month (following the view); the tile in the middle is today:
 * pressed while today is on screen, raised to bring you back otherwise.
 */
export function BottomDock({ landOn }: { /** Days a new month may open on; by default the days with classes */ landOn?: string[] } = {}) {
  const { calendar, schedule, now, todayKey, openFilePicker, openHowItWorks, openWarnings } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const isWeek = calendar.view === 'week';
  const todayShown = isWeek
    ? todayKey >= formatDate(calendar.weekStart) && todayKey <= formatDate(addDays(calendar.weekStart, 6))
    : isSameMonth(now, calendar.cursor);

  const step = usePeriodStep(landOn);

  const chooseView = (view: ViewType) => {
    calendar.setView(view);
    setMenuOpen(false);
  };

  const hasWarnings = schedule.warnings.length > 0;

  return (
    <nav aria-label="Nawigacja planu" className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="relative" style={{ height: `calc(116px + env(safe-area-inset-bottom))` }}>
        <div aria-hidden="true" className="absolute inset-0" style={{ filter: 'drop-shadow(0 -8px 20px rgba(28,25,23,.07)) drop-shadow(0 -1px 2px rgba(28,25,23,.04))' }}>
          <div className="absolute inset-x-0 bg-surface" style={{ top: BAR_TOP, bottom: -BOTTOM_BLEED }} />
          <div className="absolute left-0 h-px bg-line" style={{ top: BAR_TOP, right: `calc(50% + ${HUMP_WIDTH / 2}px)` }} />
          <div className="absolute right-0 h-px bg-line" style={{ top: BAR_TOP, left: `calc(50% + ${HUMP_WIDTH / 2}px)` }} />
          <svg width={HUMP_WIDTH} height="116" viewBox={`0 0 ${HUMP_WIDTH} 116`} className="absolute left-1/2 top-0 -translate-x-1/2 overflow-visible">
            <path d="M0 58 C38 58 42 34 84 34 H256 C298 34 302 58 340 58 V116 H0 Z" style={{ fill: 'rgb(var(--surface))' }} />
            <path d="M0 58.5 C38 58.5 42 34.5 84 34.5 H256 C298 34.5 302 58.5 340 58.5" style={{ fill: 'none', stroke: 'rgb(var(--line))', strokeWidth: 1 }} />
          </svg>
        </div>

        <div className="pointer-events-auto absolute left-1/2 top-3 flex -translate-x-1/2 items-start gap-4">
          <button type="button" aria-label={isWeek ? 'Poprzedni tydzień' : 'Poprzedni miesiąc'} onClick={() => step(-1)} className="raised mt-2 grid h-12 w-12 place-items-center rounded-full">
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-pressed={todayShown}
            aria-label={`${todayShown ? 'Dziś' : 'Wróć do dziś'}: ${getDayLabel(now)}`}
            onClick={calendar.goToToday}
            className={`flex h-16 w-16 flex-col items-center justify-center gap-px rounded-[18px] ${todayShown ? 'pressed' : 'raised -translate-y-0.5'}`}
          >
            <span className="text-[11px] font-extrabold leading-[13px] tracking-[.06em] text-accent">{SHORT_DAYS[now.getDay()]}</span>
            <span className="text-[28px] font-bold leading-[30px] tracking-[-0.02em]">{now.getDate()}</span>
          </button>
          <button type="button" aria-label={isWeek ? 'Następny tydzień' : 'Następny miesiąc'} onClick={() => step(1)} className="raised mt-2 grid h-12 w-12 place-items-center rounded-full">
            <ChevronRight size={24} strokeWidth={2.2} />
          </button>
        </div>

        <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Więcej: widok, plik z planem, pomoc"
              className={`pointer-events-auto absolute right-3 top-[62px] grid h-12 w-12 place-items-center rounded-full ${menuOpen ? 'text-ink' : 'text-ink-2'}`}
            >
              <MoreVertical size={22} />
              {hasWarnings && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-warn ring-2 ring-surface" />}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="top" align="end" sideOffset={8} collisionPadding={12} className="z-50 w-[220px] animate-pop-in rounded-2xl border border-raise bg-surface p-1.5 shadow-pop">
              <span className="block px-2.5 pb-0.5 pt-1 text-[11px] font-semibold text-ink-2">Widok</span>
              <MenuItem selected={calendar.view === 'month'} onClick={() => chooseView('month')} icon={<CalendarGrid size={18} />}>Miesiąc</MenuItem>
              <MenuItem selected={calendar.view === 'week'} onClick={() => chooseView('week')} icon={<Rows size={18} />}>Tydzień</MenuItem>
              <div className="mx-2 my-1.5 h-px bg-line" />
              <MenuItem onClick={() => { setMenuOpen(false); openFilePicker(); }} icon={<FileUp size={18} />}>Wczytaj nowy plan…</MenuItem>
              {hasWarnings && (
                <MenuItem onClick={() => { setMenuOpen(false); openWarnings(); }} icon={<Info size={18} className="text-warn" />}>
                  Uwagi do pliku ({schedule.warnings.length})
                </MenuItem>
              )}
              <MenuItem onClick={() => { setMenuOpen(false); openHowItWorks(); }} icon={<Help size={18} />}>Jak to działa?</MenuItem>
              <div className="mx-2 my-1.5 h-px bg-line" />
              <span className="block px-2.5 pb-1 pt-0.5 text-[11px] font-semibold text-ink-2">Motyw</span>
              <ThemeToggle />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <span className="sr-only" aria-live="polite">{isWeek ? getWeekLabel(calendar.weekStart) : getMonthLabel(calendar.cursor)}</span>
    </nav>
  );
}

function MenuItem({ children, icon, selected, onClick }: { children: React.ReactNode; icon: React.ReactNode; selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? 'true' : undefined}
      className={`flex h-11 w-full items-center gap-2.5 rounded-[11px] px-2.5 text-left text-sm ${selected ? 'pressed font-semibold' : 'font-medium hover:bg-surface-2'}`}
    >
      <span className="shrink-0 text-ink-2">{icon}</span>
      <span className="flex-1">{children}</span>
      {selected && <Check size={16} strokeWidth={2.4} />}
    </button>
  );
}
