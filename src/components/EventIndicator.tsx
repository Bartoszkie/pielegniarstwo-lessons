import { ClassEvent } from '../types';
import { getEventClass, getShortTitle } from '../utils/eventUtils';

interface EventIndicatorProps {
  event: ClassEvent;
}

export function EventIndicator({ event }: EventIndicatorProps) {
  const eventClass = getEventClass(event.description);
  const shortTitle = getShortTitle(event.description);

  return (
    <div
      className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium text-text-primary whitespace-nowrap overflow-hidden text-ellipsis transition-transform duration-150 hover:scale-[1.02] ${
        eventClass === 'podstawy' ? 'event-podstawy' : 'event-badanie'
      }`}
    >
      {event.start_time} {shortTitle}
    </div>
  );
}
