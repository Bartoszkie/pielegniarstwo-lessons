import { ClassEvent } from '../types';
import { getShortTitle } from '../utils/eventUtils';
import { getGroupStyle } from '../constants/groupColors';

interface EventIndicatorProps {
  event: ClassEvent;
}

export function EventIndicator({ event }: EventIndicatorProps) {
  const shortTitle = getShortTitle(event.description);
  const groupStyle = getGroupStyle(event.group);

  return (
    <div
      className="px-2.5 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-transform duration-150 hover:scale-[1.02]"
      style={groupStyle}
    >
      <span className="opacity-70">[{event.group}]</span> {event.start_time} {shortTitle}
    </div>
  );
}
