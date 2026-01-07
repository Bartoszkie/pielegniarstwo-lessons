import { GroupId } from '../types';
import { GROUP_COLORS } from '../constants/groupColors';

interface LegendProps {
  availableGroups: GroupId[];
  selectedGroups: Set<GroupId>;
  onToggleGroup: (group: GroupId) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function Legend({
  availableGroups,
  selectedGroups,
  onToggleGroup,
  onSelectAll,
  onDeselectAll
}: LegendProps) {
  const allSelected = availableGroups.length > 0 && availableGroups.every(g => selectedGroups.has(g));
  const noneSelected = availableGroups.every(g => !selectedGroups.has(g));

  if (availableGroups.length === 0) {
    return null;
  }

  return (
    <div className="w-[200px] shrink-0 p-4 bg-bg-secondary rounded-[12px] border border-border self-start sticky top-6">
      {/* Header */}
      <div className="mb-4">
        <span className="text-sm font-semibold text-text-primary block mb-3">
          Filtruj grupy ({selectedGroups.size}/{availableGroups.length})
        </span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="flex-1 px-2 py-1.5 text-xs font-medium text-text-secondary
                       bg-bg-hover rounded-lg transition-colors
                       hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Wszystkie
          </button>
          <button
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="flex-1 px-2 py-1.5 text-xs font-medium text-text-secondary
                       bg-bg-hover rounded-lg transition-colors
                       hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Żadne
          </button>
        </div>
      </div>

      {/* Group toggles - vertical grid */}
      <div className="grid grid-cols-2 gap-2">
        {availableGroups.map(group => {
          const color = GROUP_COLORS[group];
          const isSelected = selectedGroups.has(group);

          return (
            <button
              key={group}
              onClick={() => onToggleGroup(group)}
              className={`
                flex items-center justify-center gap-1 px-2 py-2 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isSelected
                  ? 'ring-2 ring-offset-2 ring-offset-bg-secondary'
                  : 'opacity-40 hover:opacity-70'
                }
              `}
              style={{
                background: color.backgroundGradient,
                color: color.text,
                // @ts-ignore - ringColor is valid but TS doesn't recognize it
                '--tw-ring-color': isSelected ? color.border : 'transparent'
              }}
            >
              <span>{group}</span>
              {isSelected && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
