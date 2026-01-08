import { ScheduleDay } from '../types';
import { EventIndicator } from './EventIndicator';
import { mergeClasses } from '../utils/classMerger';

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
  const mergedEvents = events ? mergeClasses(events.classes) : [];

  return (
    <div
      onClick={hasEvents ? onClick : undefined}
      className={`min-h-[70px] sm:min-h-[100px] lg:min-h-[120px] p-1.5 sm:p-2 lg:p-3 border-r border-b border-border bg-bg-secondary transition-colors duration-200 relative
        ${isOtherMonth ? 'opacity-30' : ''}
        ${isToday ? 'bg-today shadow-[inset_0_0_0_2px_#6366f1]' : ''}
        ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
        ${!isToday ? 'hover:bg-bg-hover' : ''}
        last:border-r-0 [&:nth-child(7n)]:border-r-0
      `}
    >
      <div
        className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
          isToday
            ? 'text-accent-secondary font-bold'
            : isWeekend
            ? 'text-text-muted'
            : 'text-text-secondary'
        }`}
      >
        {date.getDate()}
      </div>
      {mergedEvents.length > 0 && (
        <div className="flex flex-col gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
          {mergedEvents.slice(0, 2).map((mergedClass, index) => (
            <EventIndicator key={index} event={mergedClass} />
          ))}
          {mergedEvents.length > 2 && (
            <div className="text-[9px] sm:text-[10px] text-text-muted font-medium">
              +{mergedEvents.length - 2} więcej
            </div>
          )}
        </div>
      )}
    </div>
  );
}
