import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { addDays, DAY_NAMES_FULL, formatDate, getDayLabel, isSameDay } from '../../utils/dateUtils';
import { ViewType } from '../../types';
import { CalendarGrid, Check, ChevronLeft, ChevronRight, FileUp, Help, Info, MoreVertical, Rows, Undo } from '../ui/icons';

const HUMP_WIDTH = 310;
const BAR_TOP = 58;
const SHORT_DAYS = ['NDZ', 'PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB'];

/** Floating footer: the bar rises in a soft hump around the day controls, which overlap its edge. */
export function BottomDock() {
  const { calendar, visibleByDate, schedule, now, openFilePicker, openHowItWorks, openWarnings } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const isToday = isSameDay(calendar.cursor, now);

  const step = (direction: 1 | -1) => {
    if (calendar.view === 'week') {
      calendar.shiftDay(direction);
      return;
    }
    // In month view jump to the previous / next day that has classes
    const keys = Object.keys(visibleByDate).sort();
    const current = formatDate(calendar.cursor);
    const target = direction === 1 ? keys.find(k => k > current) : [...keys].reverse().find(k => k < current);
    if (target) {
      const [y, m, d] = target.split('-').map(Number);
      calendar.setCursor(new Date(y, m - 1, d));
    } else {
      calendar.setCursor(addDays(calendar.cursor, direction));
    }
  };

  const chooseView = (view: ViewType) => {
    calendar.setView(view);
    setMenuOpen(false);
  };

  const hasWarnings = schedule.warnings.length > 0;
  const stepLabel = calendar.view === 'week' ? 'dzień' : 'dzień z zajęciami';

  return (
    <nav aria-label="Nawigacja planu" className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="relative" style={{ height: `calc(116px + env(safe-area-inset-bottom))` }}>
        <div aria-hidden="true" className="absolute inset-0" style={{ filter: 'drop-shadow(0 -8px 20px rgba(28,25,23,.07)) drop-shadow(0 -1px 2px rgba(28,25,23,.04))' }}>
          <div className="absolute inset-x-0 bottom-0 bg-surface" style={{ top: BAR_TOP }} />
          <div className="absolute left-0 h-px bg-line" style={{ top: BAR_TOP, right: `calc(50% + ${HUMP_WIDTH / 2}px)` }} />
          <div className="absolute right-0 h-px bg-line" style={{ top: BAR_TOP, left: `calc(50% + ${HUMP_WIDTH / 2}px)` }} />
          <svg width={HUMP_WIDTH} height="116" viewBox={`0 0 ${HUMP_WIDTH} 116`} className="absolute left-1/2 top-0 -translate-x-1/2 overflow-visible">
            <path d="M0 58 C38 58 42 34 84 34 H226 C268 34 272 58 310 58 V116 H0 Z" style={{ fill: 'rgb(var(--surface))' }} />
            <path d="M0 58.5 C38 58.5 42 34.5 84 34.5 H226 C268 34.5 272 58.5 310 58.5" style={{ fill: 'none', stroke: 'rgb(var(--line))', strokeWidth: 1 }} />
          </svg>
        </div>

        <div className="pointer-events-auto absolute left-1/2 top-4 flex -translate-x-1/2 items-start gap-3.5">
          <button type="button" aria-label={`Poprzedni ${stepLabel}`} onClick={() => step(-1)} className="raised mt-1.5 grid h-11 w-11 place-items-center rounded-full">
            <ChevronLeft size={20} strokeWidth={2.2} />
          </button>
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              aria-label={`${isToday ? 'Dziś, ' : 'Wybrany dzień: '}${getDayLabel(calendar.cursor)}`}
              onClick={calendar.goToToday}
              className="pressed flex h-14 w-14 flex-col items-center justify-center gap-px rounded-2xl"
            >
              <span className="text-[10px] font-bold leading-3 tracking-[.06em] text-accent">{SHORT_DAYS[calendar.cursor.getDay()]}</span>
              <span className="text-2xl font-semibold leading-[26px] tracking-[-0.02em]">{calendar.cursor.getDate()}</span>
            </button>
            {!isToday && (
              <button type="button" aria-label="Wróć do dziś" onClick={calendar.goToToday} className="raised grid h-6 w-10 animate-pop-in place-items-center rounded-full">
                <Undo size={14} strokeWidth={2.4} />
              </button>
            )}
          </div>
          <button type="button" aria-label={`Następny ${stepLabel}`} onClick={() => step(1)} className="raised mt-1.5 grid h-11 w-11 place-items-center rounded-full">
            <ChevronRight size={20} strokeWidth={2.2} />
          </button>
        </div>

        <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Więcej: widok, plik z planem, pomoc"
              className={`pointer-events-auto absolute right-3.5 top-16 grid h-10 w-10 place-items-center rounded-full ${menuOpen ? 'text-ink' : 'text-ink-2'}`}
            >
              <MoreVertical size={18} />
              {hasWarnings && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-warn ring-2 ring-surface" />}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="top" align="end" sideOffset={8} collisionPadding={12} className="z-50 w-[220px] animate-pop-in rounded-2xl border border-raise bg-surface p-1.5 shadow-pop">
              <span className="block px-2.5 pb-0.5 pt-1 text-[11px] font-semibold text-ink-2">Widok</span>
              <MenuItem selected={calendar.view === 'week'} onClick={() => chooseView('week')} icon={<Rows size={18} />}>Tydzień</MenuItem>
              <MenuItem selected={calendar.view === 'month'} onClick={() => chooseView('month')} icon={<CalendarGrid size={18} />}>Miesiąc</MenuItem>
              <div className="mx-2 my-1.5 h-px bg-line" />
              <MenuItem onClick={() => { setMenuOpen(false); openFilePicker(); }} icon={<FileUp size={18} />}>Wczytaj nowy plan…</MenuItem>
              {hasWarnings && (
                <MenuItem onClick={() => { setMenuOpen(false); openWarnings(); }} icon={<Info size={18} className="text-warn" />}>
                  Uwagi do pliku ({schedule.warnings.length})
                </MenuItem>
              )}
              <MenuItem onClick={() => { setMenuOpen(false); openHowItWorks(); }} icon={<Help size={18} />}>Jak to działa?</MenuItem>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <span className="sr-only" aria-live="polite">{DAY_NAMES_FULL[calendar.cursor.getDay()]}</span>
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
