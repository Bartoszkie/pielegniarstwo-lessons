import { ScheduleMode } from '../types';

interface ModeSwitchProps {
  currentMode: ScheduleMode;
  onModeChange: (mode: ScheduleMode) => void;
}

export function ModeSwitch({ currentMode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex w-full bg-bg-secondary rounded-[10px] p-0.5 border border-border">
      <button
        onClick={() => onModeChange('student')}
        className={`btn-press flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          currentMode === 'student'
            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Student
      </button>
      <button
        onClick={() => onModeChange('teacher')}
        className={`btn-press flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
          currentMode === 'teacher'
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M12 14l-4 4h8l-4-4z" />
        </svg>
        Wykladowca
      </button>
    </div>
  );
}
