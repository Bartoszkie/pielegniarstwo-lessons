import { useApp } from '../../app/AppContext';
import { ThemePreference } from '../../hooks/useTheme';
import { Moon, Sun, ThemeAuto } from './icons';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'Automatyczny', Icon: ThemeAuto },
  { value: 'light', label: 'Jasny', Icon: Sun },
  { value: 'dark', label: 'Ciemny', Icon: Moon },
];

/** Auto / light / dark. `icons` shows icon-only buttons (sidebar), otherwise icon + label (phone menu). */
export function ThemeToggle({ variant = 'labels' }: { variant?: 'labels' | 'icons' }) {
  const { theme, setTheme } = useApp();

  return (
    <div role="group" aria-label="Motyw" className={variant === 'icons' ? 'flex gap-1' : 'grid grid-cols-3 gap-1'}>
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            aria-label={variant === 'icons' ? `Motyw: ${label.toLowerCase()}` : undefined}
            title={variant === 'icons' ? `Motyw: ${label.toLowerCase()}` : undefined}
            onClick={() => setTheme(value)}
            className={variant === 'icons'
              ? `grid h-8 w-8 place-items-center rounded-lg ${selected ? 'pressed text-ink' : 'text-ink-2 hover:text-ink'}`
              : `flex h-11 flex-col items-center justify-center gap-0.5 rounded-[11px] text-[11px] ${selected ? 'pressed font-semibold text-ink' : 'font-medium text-ink-2 hover:bg-surface-2'}`}
          >
            <Icon size={variant === 'icons' ? 16 : 17} />
            {variant === 'labels' && <span>{value === 'system' ? 'Auto' : label}</span>}
          </button>
        );
      })}
    </div>
  );
}
