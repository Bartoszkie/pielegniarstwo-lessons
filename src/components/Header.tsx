import { ViewType } from '../types';
import { ViewToggle } from './ViewToggle';
import { NavigationControls } from './NavigationControls';

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  label: string;
  isDataLoaded?: boolean;
  onClearData?: () => void;
}

export function Header({
  currentView,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  label,
  isDataLoaded,
  onClearData,
}: HeaderProps) {
  return (
    <header className="flex justify-between items-start mb-12 flex-wrap gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-br from-text-primary to-text-secondary bg-clip-text text-transparent">
          Plan Zajec
        </h1>
        <div className="flex items-center gap-3 text-text-muted text-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-glow border border-[rgba(99,102,241,0.2)] rounded-full text-xs font-semibold text-accent-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Pielegniarstwo
          </span>
          <span>Semestr 1 • Katowice NST</span>
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        {isDataLoaded && onClearData && (
          <button
            onClick={onClearData}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-secondary border border-border rounded-xl transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            Wczytaj nowy plik
          </button>
        )}
        {isDataLoaded && (
          <>
            <ViewToggle currentView={currentView} onViewChange={onViewChange} />
            <NavigationControls
              onPrev={onPrev}
              onNext={onNext}
              onToday={onToday}
              label={label}
            />
          </>
        )}
      </div>
    </header>
  );
}
