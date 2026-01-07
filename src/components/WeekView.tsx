import { ScheduleDay } from '../types';
import { getStartOfWeek, formatDate, isToday, DAY_NAMES } from '../utils/dateUtils';
import { WeekEvent } from './WeekEvent';

interface WeekViewProps {
  currentDate: Date;
  eventsByDate: Record<string, ScheduleDay>;
  onDayClick: (dateStr: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

export function WeekView({ currentDate, eventsByDate, onDayClick }: WeekViewProps) {
  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      {/* Week Header */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border bg-bg-card">
        <div className="p-5" />
        {weekDays.map((date, index) => (
          <div
            key={index}
            className={`py-5 px-3 text-center ${isToday(date) ? 'today' : ''}`}
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
              {DAY_NAMES[(index + 1) % 7 || 7]}
            </div>
            <div
              className={`text-2xl font-bold ${
                isToday(date)
                  ? 'w-11 h-11 mx-auto flex items-center justify-center bg-accent-primary rounded-full text-text-primary'
                  : 'text-text-secondary'
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Week Body */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] max-h-[600px] overflow-y-auto">
        {/* Time Column */}
        <div className="border-r border-border">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] p-2 text-xs font-mono text-text-muted text-right border-b border-border"
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
              className="border-r border-border relative min-h-[840px] last:border-r-0"
            >
              {HOURS.map((_, hourIndex) => (
                <div key={hourIndex} className="h-[60px] border-b border-border" />
              ))}
              {dayEvents?.classes.map((event, eventIndex) => (
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
  );
}
