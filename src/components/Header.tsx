import { useState } from 'react';
import { ViewType, ScheduleMode } from '../types';
import { ViewToggle } from './ViewToggle';
import { NavigationControls } from './NavigationControls';
import { ModeSwitch } from './ModeSwitch';

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
  mode?: ScheduleMode;
  onModeChange?: (mode: ScheduleMode) => void;
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
  mode,
  onModeChange,
}: HeaderProps) {
  const [isViewControlsExpanded, setIsViewControlsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('view-controls-expanded');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const toggleViewControls = () => {
    setIsViewControlsExpanded(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('view-controls-expanded', String(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  };
  return (
    <header className="mb-4 sm:mb-8 space-y-3 sm:space-y-4">
      {/* Section 1: Navbar */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-text-primary to-text-secondary bg-clip-text text-transparent">
              Plan Zajec
            </h1>
            {onHowItWorks && (
              <button
                onClick={onHowItWorks}
                className="btn-press px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-lg transition-all hover:bg-white/20 hover:border-white/30 flex items-center gap-1.5"
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
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-text-muted text-xs sm:text-sm flex-wrap mb-3 sm:mb-0">
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
        {isDataLoaded && mode && onModeChange && (
          <div className="mt-3">
            <ModeSwitch currentMode={mode} onModeChange={onModeChange} />
          </div>
        )}
        {isDataLoaded && onClearData && (
          <button
            onClick={onClearData}
            className="btn-press w-full mt-3 sm:mt-4 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-500/50 rounded-xl transition-all hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Prześlij nowy plan zajęć
          </button>
        )}
      </div>

      {/* Section 2: View Controls */}
      {isDataLoaded && (
        <div className="bg-bg-secondary border border-border rounded-xl p-3 sm:p-4">
          {/* Header - always visible */}
          <div
            className="flex items-center justify-between cursor-pointer select-none btn-press"
            onClick={toggleViewControls}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="9" y1="2" x2="9" y2="6" />
                  <line x1="15" y1="2" x2="15" y2="6" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-text-primary">{label}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isViewControlsExpanded && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToday(); }}
                  className="btn-press px-3 py-1 text-xs font-medium text-text-secondary bg-bg-hover rounded-lg transition-colors hover:text-text-primary"
                >
                  Dziś
                </button>
              )}
              <svg
                className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isViewControlsExpanded ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Collapsible content */}
          <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isViewControlsExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              {/* Controls row */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 pt-3">
                <ViewToggle currentView={currentView} onViewChange={onViewChange} />
                <NavigationControls
                  onPrev={onPrev}
                  onNext={onNext}
                  onToday={onToday}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
