import { useApp } from '../../app/AppContext';
import { KindIcon, KIND_FILTER_LABELS } from './KindIcon';

/** Category filter chips with 3D icons. The selected chip looks pressed in. */
export function KindChips({ size = 'md', className = '' }: { size?: 'md' | 'lg'; className?: string }) {
  const { kind, setKind, kindCounts } = useApp();

  return (
    <div className={`flex gap-2 ${className}`}>
      {kindCounts.map(({ kind: value, count }) => {
        const selected = kind === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            onClick={() => setKind(value)}
            className={`kind-chip flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full text-sm ${
              size === 'lg' ? 'h-12 pl-2.5 pr-4' : 'h-11 pl-2 pr-3.5'
            } ${selected ? 'pressed font-semibold' : 'raised font-medium'}`}
          >
            <span key={selected ? 'on' : 'off'} className={`kind-ico ${selected ? 'kind-spin' : ''}`}>
              <KindIcon kind={value} size={size === 'lg' ? 28 : 24} />
            </span>
            {KIND_FILTER_LABELS[value]}
            <span className="font-mono text-xs font-medium text-ink-2">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
