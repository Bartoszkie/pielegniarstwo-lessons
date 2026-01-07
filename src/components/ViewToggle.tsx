import { ViewType } from '../types';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-bg-secondary rounded-[12px] p-1 border border-border">
      <button
        onClick={() => onViewChange('month')}
        className={`px-5 py-2.5 border-none bg-transparent font-sans text-sm font-medium cursor-pointer rounded-sm transition-all duration-200 ${
          currentView === 'month'
            ? 'bg-accent-primary text-text-primary shadow-[0_2px_12px_rgba(99,102,241,0.3)]'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
        }`}
      >
        Miesiąc
      </button>
      <button
        onClick={() => onViewChange('week')}
        className={`px-5 py-2.5 border-none bg-transparent font-sans text-sm font-medium cursor-pointer rounded-sm transition-all duration-200 ${
          currentView === 'week'
            ? 'bg-accent-primary text-text-primary shadow-[0_2px_12px_rgba(99,102,241,0.3)]'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
        }`}
      >
        Tydzień
      </button>
    </div>
  );
}
