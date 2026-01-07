import { MergedClass } from '../utils/classMerger';
import { parseDescription } from '../utils/eventUtils';
import { getGroupStyle } from '../constants/groupColors';

interface WeekEventProps {
  event: MergedClass;
  onClick: () => void;
}

export function WeekEvent({ event, onClick }: WeekEventProps) {
  const parsed = parseDescription(event.description);
  const groupStyle = getGroupStyle(event.groups[0]);
  const groupsLabel = event.groups.sort().join(' ');

  const startParts = event.start_time.split(':');
  const endParts = event.end_time.split(':');
  const startHour = parseInt(startParts[0]);
  const startMin = parseInt(startParts[1]);
  const endHour = parseInt(endParts[0]);
  const endMin = parseInt(endParts[1]);

  const top = (startHour - 7) * 60 + startMin;
  const height = Math.max((endHour - startHour) * 60 + (endMin - startMin), 40);

  return (
    <div
      onClick={onClick}
      className="absolute left-1 right-1 p-2 rounded-lg text-xs overflow-hidden z-10 cursor-pointer transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
      style={{ top: `${top}px`, height: `${height}px`, ...groupStyle }}
    >
      <div className="font-mono font-medium mb-1 opacity-90">
        <span className="opacity-70">[{groupsLabel}]</span> {event.start_time} - {event.end_time}
      </div>
      <div className="font-semibold leading-tight">{parsed.title}</div>
      {parsed.location && (
        <div className="mt-1 opacity-80 text-[10px]">{parsed.location}</div>
      )}
    </div>
  );
}
