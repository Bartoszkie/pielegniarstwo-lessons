import { ALL_GROUPS, GroupId } from '../../types';
import { getGroupColor } from '../../constants/groupColors';
import { useApp } from '../../app/AppContext';
import { GroupSwatch } from './GroupTag';
import { Check } from './icons';

interface GroupPickerProps {
  /** Chips per row: phone shows pairs in 3 columns, the sidebar in 2 */
  pairsPerRow?: 2 | 3;
  compact?: boolean;
}

/** Group chips: selected ones are solid and glossy, the rest raised white with a colour swatch. */
export function GroupPicker({ pairsPerRow = 3, compact = false }: GroupPickerProps) {
  const { schedule } = useApp();
  const { availableGroups, selectedGroups, toggleGroup, selectAllGroups, deselectAllGroups } = schedule;
  const groups = availableGroups.length ? availableGroups : ALL_GROUPS;
  const pairs: GroupId[][] = [];
  for (let n = 1; n <= 9; n++) {
    const pair = groups.filter(g => g.startsWith(String(n)));
    if (pair.length) pairs.push(pair);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className={`whitespace-nowrap ${compact ? 'text-[13px]' : 'text-sm'} text-ink-2`}>
          {compact ? 'Grupy' : 'Wybrane'}: {selectedGroups.size} z {groups.length}
        </span>
        <div className="flex">
          <button type="button" onClick={selectAllGroups} className={`${compact ? 'h-8 px-1.5' : 'h-11 px-2'} text-[13px] font-semibold`}>
            Wszystkie
          </button>
          <button type="button" onClick={deselectAllGroups} className={`${compact ? 'h-8 px-1.5' : 'h-11 px-2'} text-[13px] font-semibold`}>
            Wyczyść
          </button>
        </div>
      </div>
      <div className={`grid gap-2.5 ${pairsPerRow === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {pairs.map(pair => (
          <div key={pair[0]} className="flex gap-1">
            {pair.map(group => {
              const on = selectedGroups.has(group);
              const color = getGroupColor(group);
              return (
                <button
                  key={group}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleGroup(group)}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[10px] tabular-nums font-semibold transition-transform active:scale-[.97] ${
                    compact ? 'h-10 text-sm' : 'h-12 text-[15px]'
                  } ${on ? 'gloss text-white' : 'raised text-ink'}`}
                  style={on ? {
                    backgroundColor: color,
                    border: `1px solid color-mix(in oklab, ${color} 80%, #000)`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,.35), inset 0 -2px 0 rgba(0,0,0,.2), 0 2px 4px rgba(28,25,23,.2), 0 6px 12px -4px color-mix(in oklab, ${color} 60%, transparent)`,
                  } : undefined}
                >
                  {on ? <Check size={compact ? 12 : 14} strokeWidth={2.8} /> : <GroupSwatch group={group} size={compact ? 9 : 10} />}
                  {group}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
