import { MergedClass } from '../utils/classMerger';
import { getShortTitle } from '../utils/eventUtils';
import { getGroupStyle } from '../constants/groupColors';

interface EventIndicatorProps {
  event: MergedClass;
}

export function EventIndicator({ event }: EventIndicatorProps) {
  const shortTitle = getShortTitle(event.description);
  // Use first group for styling, show all groups in label
  const groupStyle = getGroupStyle(event.groups[0]);
  const groupsLabel = event.groups.sort().join(' ');

  return (
    <div
      className="px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-transform duration-150 hover:scale-[1.02]"
      style={groupStyle}
    >
      <span className="opacity-70">[{groupsLabel}]</span> {event.start_time} {shortTitle}
    </div>
  );
}
