export type GroupId =
  | '1A' | '1B' | '2A' | '2B'
  | '3A' | '3B' | '4A' | '4B'
  | '5A' | '5B' | '6A' | '6B'
  | '7A' | '7B' | '8A' | '8B'
  | '9A' | '9B';

export const ALL_GROUPS: GroupId[] = [
  '1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B',
  '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B',
  '9A', '9B'
];

export type ScheduleMode = 'student' | 'teacher';

export interface ClassEvent {
  start_time: string;
  end_time: string;
  description: string;
  group: GroupId;
  instructor?: string[];
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
