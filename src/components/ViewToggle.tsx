import { ViewType } from '../types';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex w-full sm:w-auto bg-bg-secondary rounded-[10px] sm:rounded-[12px] p-0.5 sm:p-1 border border-border">
      <button
        onClick={() => onViewChange('month')}
        className={`btn-press flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 border-none bg-transparent font-sans text-xs sm:text-sm font-medium cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          currentView === 'month'
            ? 'bg-accent-primary text-text-primary shadow-[0_2px_12px_rgba(99,102,241,0.3)]'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="2" x2="9" y2="6" />
          <line x1="15" y1="2" x2="15" y2="6" />
        </svg>
        Miesiąc
      </button>
      <button
        onClick={() => onViewChange('week')}
        className={`btn-press flex-1 sm:flex-initial px-3 sm:px-5 py-2 sm:py-2.5 border-none bg-transparent font-sans text-xs sm:text-sm font-medium cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          currentView === 'week'
            ? 'bg-accent-primary text-text-primary shadow-[0_2px_12px_rgba(99,102,241,0.3)]'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        Tydzień
      </button>
    </div>
  );
}
