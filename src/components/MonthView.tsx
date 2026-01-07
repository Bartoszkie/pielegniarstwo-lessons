import { ScheduleDay } from '../types';
import { getMonthDays, formatDate, isToday, isSameMonth, isWeekend } from '../utils/dateUtils';
import { CalendarDay } from './CalendarDay';

interface MonthViewProps {
  currentDate: Date;
  eventsByDate: Record<string, ScheduleDay>;
  onDayClick: (dateStr: string) => void;
}

const DAY_HEADERS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

export function MonthView({ currentDate, eventsByDate, onDayClick }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border bg-bg-card">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="p-4 text-center text-xs font-semibold uppercase tracking-widest text-text-muted"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateStr = formatDate(date);
          const events = eventsByDate[dateStr];
          return (
            <CalendarDay
              key={index}
              date={date}
              events={events}
              isToday={isToday(date)}
              isOtherMonth={!isSameMonth(date, currentDate)}
              isWeekend={isWeekend(date)}
              onClick={() => onDayClick(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}
