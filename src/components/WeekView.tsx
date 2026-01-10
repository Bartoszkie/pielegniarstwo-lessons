import { useRef, useEffect } from 'react';
import { ScheduleDay } from '../types';
import { getStartOfWeek, formatDate, isToday, DAY_NAMES } from '../utils/dateUtils';
import { WeekEvent } from './WeekEvent';
import { mergeClasses } from '../utils/classMerger';

interface WeekViewProps {
  currentDate: Date;
  eventsByDate: Record<string, ScheduleDay>;
  onDayClick: (dateStr: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

export function WeekView({ currentDate, eventsByDate, onDayClick }: WeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Find which day index is today (if it's in the current week)
  const todayIndex = weekDays.findIndex((date) => isToday(date));

  // Auto-scroll to current day on mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || todayIndex === -1) return;

    // Only scroll on mobile (when content is scrollable)
    if (container.scrollWidth > container.clientWidth) {
      const timeColumnWidth = 60; // matches min-w on mobile
      const dayColumnWidth = (container.scrollWidth - timeColumnWidth) / 7;
      const scrollTarget = timeColumnWidth + (todayIndex * dayColumnWidth) - (container.clientWidth / 2) + (dayColumnWidth / 2);
      container.scrollLeft = Math.max(0, scrollTarget);
    }
  }, [todayIndex, currentDate]);

  return (
    <div ref={scrollContainerRef} className="overflow-x-auto">
      <div className="min-w-[700px]">
      {/* Week Header */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] sm:grid-cols-[80px_repeat(7,1fr)] border-b border-border bg-bg-card">
        <div className="p-3 sm:p-5" />
        {weekDays.map((date, index) => (
          <div
            key={index}
            className={`py-3 sm:py-5 px-2 sm:px-3 text-center ${isToday(date) ? 'today' : ''}`}
          >
            <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide sm:tracking-widest text-text-muted mb-1">
              {DAY_NAMES[(index + 1) % 7 || 7]}
            </div>
            <div
              className={`text-lg sm:text-2xl font-bold ${
                isToday(date)
                  ? 'w-8 h-8 sm:w-11 sm:h-11 mx-auto flex items-center justify-center bg-accent-primary rounded-full text-text-primary'
                  : 'text-text-secondary'
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Week Body */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] sm:grid-cols-[80px_repeat(7,1fr)] max-h-[500px] sm:max-h-[600px] overflow-y-auto">
        {/* Time Column */}
        <div className="border-r border-border">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[50px] sm:h-[60px] p-1.5 sm:p-2 text-[10px] sm:text-xs font-mono text-text-muted text-right border-b border-border"
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        {weekDays.map((date, dayIndex) => {
          const dateStr = formatDate(date);
          const dayEvents = eventsByDate[dateStr];

          return (
            <div
              key={dayIndex}
              className="border-r border-border relative min-h-[700px] sm:min-h-[840px] last:border-r-0"
            >
              {HOURS.map((_, hourIndex) => (
                <div key={hourIndex} className="h-[50px] sm:h-[60px] border-b border-border" />
              ))}
              {dayEvents && mergeClasses(dayEvents.classes).map((event, eventIndex) => (
                <WeekEvent
                  key={eventIndex}
                  event={event}
                  onClick={() => onDayClick(dateStr)}
                />
              ))}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
