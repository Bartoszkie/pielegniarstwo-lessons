export interface ClassEvent {
  start_time: string;
  end_time: string;
  description: string;
}

export interface ScheduleDay {
  date: string;
  day: string;
  classes: ClassEvent[];
}

export interface ParsedEvent {
  title: string;
  instructor: string;
  location: string;
  notes: string;
}

export type ViewType = 'month' | 'week';
export type EventType = 'podstawy' | 'badanie';
