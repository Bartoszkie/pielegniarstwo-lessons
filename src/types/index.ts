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
  /** The same class is in the file for every group (e.g. a lecture for the whole year) */
  everyone?: boolean;
}

export interface ScheduleDay {
  date: string;
  day: string;
  classes: ClassEvent[];
}

/** What kind of class a cell describes; `info` is a notice such as a day off or a break. */
export type ClassKind = 'lecture' | 'exercise' | 'simulation' | 'other' | 'info';

/** Filter values for the category chips. */
export type KindFilter = 'all' | Exclude<ClassKind, 'info'>;

export interface ParsedEvent {
  title: string;
  /** Full instructor credits as written in the file, e.g. "dr n. med. Marcin Hutnik" */
  instructor: string;
  kind: ClassKind;
  online: boolean;
  /** Room or place, e.g. "sala C200"; empty when unknown */
  location: string;
  /** Real time range for online classes, given on a second line in the file */
  actualTime: string;
  notes: string;
}

export interface ParseWarning {
  row: number;
  message: string;
}

export type ViewType = 'month' | 'week';
