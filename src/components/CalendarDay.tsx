import { ScheduleDay } from '../types';
import { EventIndicator } from './EventIndicator';

interface CalendarDayProps {
  date: Date;
  events?: ScheduleDay;
  isToday: boolean;
  isOtherMonth: boolean;
  isWeekend: boolean;
  onClick?: () => void;
}

export function CalendarDay({
  date,
  events,
  isToday,
  isOtherMonth,
  isWeekend,
  onClick,
}: CalendarDayProps) {
  const hasEvents = events && events.classes.length > 0;

  return (
    <div
      onClick={hasEvents ? onClick : undefined}
      className={`min-h-[120px] p-3 border-r border-b border-border bg-bg-secondary transition-colors duration-200 relative
        ${isOtherMonth ? 'opacity-30' : ''}
        ${isToday ? 'bg-today shadow-[inset_0_0_0_2px_#6366f1]' : ''}
        ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
        ${!isToday ? 'hover:bg-bg-hover' : ''}
        last:border-r-0 [&:nth-child(7n)]:border-r-0
      `}
    >
      <div
        className={`text-sm font-semibold mb-2 ${
          isToday
            ? 'text-accent-secondary font-bold'
            : isWeekend
            ? 'text-text-muted'
            : 'text-text-secondary'
        }`}
      >
        {date.getDate()}
      </div>
      {events && (
        <div className="flex flex-col gap-1 mt-1">
          {events.classes.map((classEvent, index) => (
            <EventIndicator key={index} event={classEvent} />
          ))}
        </div>
      )}
    </div>
  );
}
