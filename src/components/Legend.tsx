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
    <div className="mt-6 p-5 bg-bg-secondary rounded-[12px] border border-border">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <span className="text-sm font-semibold text-text-primary">
          Filtruj grupy ({selectedGroups.size}/{availableGroups.length})
        </span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={allSelected}
            className="px-3 py-1.5 text-xs font-medium text-text-secondary
                       bg-bg-hover rounded-lg transition-colors
                       hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Zaznacz wszystkie
          </button>
          <button
            onClick={onDeselectAll}
            disabled={noneSelected}
            className="px-3 py-1.5 text-xs font-medium text-text-secondary
                       bg-bg-hover rounded-lg transition-colors
                       hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Odznacz wszystkie
          </button>
        </div>
      </div>

      {/* Group toggles */}
      <div className="flex flex-wrap gap-2">
        {availableGroups.map(group => {
          const color = GROUP_COLORS[group];
          const isSelected = selectedGroups.has(group);

          return (
            <button
              key={group}
              onClick={() => onToggleGroup(group)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
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
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
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
