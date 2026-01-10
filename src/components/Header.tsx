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
  onHowItWorks?: () => void;
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
  onHowItWorks,
}: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 sm:mb-12 gap-4 sm:gap-6">
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-text-primary to-text-secondary bg-clip-text text-transparent">
            Plan Zajec
          </h1>
          {onHowItWorks && (
            <button
              onClick={onHowItWorks}
              className="px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg transition-all hover:bg-white/20 hover:border-white/30 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Jak to działa?
            </button>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-text-muted text-xs sm:text-sm flex-wrap">
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

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center w-full sm:w-auto">
        {isDataLoaded && onClearData && (
          <button
            onClick={onClearData}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-500/50 rounded-xl transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Prześlij nowy plan zajęć
          </button>
        )}
        {isDataLoaded && (
          <>
            <div className="w-full sm:w-auto flex justify-center">
              <ViewToggle currentView={currentView} onViewChange={onViewChange} />
            </div>
            <div className="flex justify-center">
              <NavigationControls
                onPrev={onPrev}
                onNext={onNext}
                onToday={onToday}
                label={label}
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
