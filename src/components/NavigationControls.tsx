interface NavigationControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  label: string;
}

export function NavigationControls({ onPrev, onNext, onToday, label }: NavigationControlsProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-9 h-9 sm:w-10 sm:h-10 border border-border bg-bg-secondary text-text-secondary rounded-sm cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-bg-hover hover:border-accent-primary hover:text-text-primary"
        >
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={onToday}
          className="px-3 sm:px-5 py-2 sm:py-2.5 h-9 sm:h-10 border border-border bg-bg-secondary text-text-secondary rounded-sm cursor-pointer font-sans text-xs sm:text-sm font-medium transition-all duration-200 hover:bg-bg-hover hover:border-accent-primary hover:text-text-primary"
        >
          Dziś
        </button>
        <button
          onClick={onNext}
          className="w-9 h-9 sm:w-10 sm:h-10 border border-border bg-bg-secondary text-text-secondary rounded-sm cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-bg-hover hover:border-accent-primary hover:text-text-primary"
        >
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="text-base sm:text-lg font-semibold text-text-primary min-w-[120px] sm:min-w-[180px] text-center">
        {label}
      </div>
    </>
  );
}
