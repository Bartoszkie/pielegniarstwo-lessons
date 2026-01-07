import { ViewType, ScheduleDay } from '../types';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';

interface CalendarProps {
  view: ViewType;
  currentDate: Date;
  eventsByDate: Record<string, ScheduleDay>;
  onDayClick: (dateStr: string) => void;
}

export function Calendar({ view, currentDate, eventsByDate, onDayClick }: CalendarProps) {
  return (
    <div className="bg-bg-secondary rounded-[20px] border border-border overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      {view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          eventsByDate={eventsByDate}
          onDayClick={onDayClick}
        />
      ) : (
        <WeekView
          currentDate={currentDate}
          eventsByDate={eventsByDate}
          onDayClick={onDayClick}
        />
      )}
    </div>
  );
}
