import { useState, useEffect } from 'react';
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
  const [isExpanded, setIsExpanded] = useState(() => {
    // Always expand if no groups selected (first time use)
    if (selectedGroups.size === 0) return true;

    try {
      const saved = localStorage.getItem('filters-expanded');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  // Auto-expand when all groups deselected
  useEffect(() => {
    if (selectedGroups.size === 0) {
      setIsExpanded(true);
    }
  }, [selectedGroups.size]);

  const allSelected = availableGroups.length > 0 && availableGroups.every(g => selectedGroups.has(g));
  const noneSelected = availableGroups.every(g => !selectedGroups.has(g));

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('filters-expanded', String(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  };

  if (availableGroups.length === 0) {
    return null;
  }

  // Get selected groups for display when collapsed
  const selectedGroupsList = Array.from(selectedGroups);

  return (
    <div className="w-full lg:w-[200px] shrink-0 p-3 lg:p-4 bg-bg-secondary rounded-[12px] border border-border self-start lg:sticky lg:top-6">
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between cursor-pointer select-none btn-press"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Filtruj grupy ({selectedGroups.size}/{availableGroups.length})
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Show selected groups when collapsed */}
      {!isExpanded && selectedGroups.size > 0 && selectedGroups.size < availableGroups.length && (
        <div className="mt-2 text-xs text-text-muted truncate">
          Wybrane:{' '}
          <span className="text-text-secondary">
            {selectedGroupsList.slice(0, 4).join(', ')}
            {selectedGroups.size > 4 && ` +${selectedGroups.size - 4}`}
          </span>
        </div>
      )}

      {/* Collapsible content with smooth animation */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {/* All/None buttons */}
          <div className="flex gap-2 mt-3 mb-4">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectAll(); }}
              disabled={allSelected}
              className="btn-press flex-1 px-2 py-1.5 text-xs font-medium text-text-secondary
                         bg-bg-hover rounded-lg transition-colors
                         hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Wszystkie
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeselectAll(); }}
              disabled={noneSelected}
              className="btn-press flex-1 px-2 py-1.5 text-xs font-medium text-text-secondary
                         bg-bg-hover rounded-lg transition-colors
                         hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Żadne
            </button>
          </div>

          {/* Group toggles - responsive grid */}
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 lg:gap-2">
            {availableGroups.map(group => {
              const color = GROUP_COLORS[group];
              const isSelected = selectedGroups.has(group);

              return (
                <button
                  key={group}
                  onClick={() => onToggleGroup(group)}
                  className={`
                    btn-press flex items-center justify-center gap-0.5 lg:gap-1 px-1.5 lg:px-2 py-1.5 lg:py-2 rounded-lg
                    text-xs lg:text-sm font-medium transition-all duration-200
                    ${isSelected
                      ? 'ring-2 ring-offset-2 ring-offset-bg-secondary shadow-lg scale-105'
                      : 'opacity-40 hover:opacity-70 hover:scale-[1.02]'
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
      </div>
    </div>
  );
}
