import { useApp } from '../../app/AppContext';
import { ScheduleMode } from '../../types';

/** Grupy / Wykładowcy switch: the current mode is pressed in. */
export function ModeToggle({ compact = false }: { compact?: boolean }) {
  const { schedule } = useApp();
  const options: { value: ScheduleMode; label: string }[] = [
    { value: 'student', label: 'Grupy' },
    { value: 'teacher', label: 'Wykładowcy' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map(option => {
        const selected = schedule.mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => schedule.setMode(option.value)}
            className={`${compact ? 'h-10 rounded-[10px]' : 'h-11 rounded-xl'} text-sm ${
              selected ? 'pressed font-semibold' : 'raised font-medium'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
