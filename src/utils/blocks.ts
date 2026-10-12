import { ClassKind, GroupId, KindFilter, ParsedEvent, ScheduleDay } from '../types';
import { mergeClasses } from './classMerger';
import { instructorKeys, normalizeForSearch, parseDescription } from './eventUtils';
import { toMinutes } from './dateUtils';

export type ClassMode = 'online' | 'onsite' | 'unknown';

/** A merged, parsed class as the UI shows it. */
export interface ClassBlock {
  id: string;
  date: string;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  groups: GroupId[];
  description: string;
  event: ParsedEvent;
  kind: ClassKind;
  /** Online, at the university (a room is given), or not said */
  mode: ClassMode;
  /** The file has this class for every group, e.g. a lecture for the whole year */
  everyone: boolean;
  instructors: string[];
  /** Lower-cased, diacritic-free text used for search */
  haystack: string;
  /** Added by the student: another group's class, attended to make up a missed one */
  makeup?: MakeupLink;
  /** The student makes this class up with another group, on the date given */
  madeUpOn?: MakeupLink;
}

/** Ties a make-up class and the student's own class it replaces */
export interface MakeupLink {
  id: string;
  /** Which class of the subject it is, for the student's group: 1, 2, … */
  n: number;
  total: number;
  /** The student's group */
  group: GroupId;
  /** The other date: the make-up for the replaced class, the replaced class for the make-up */
  date: string;
  start: string;
  /** The groups the student joins for the make-up */
  groups: GroupId[];
}

/** One subject of one kind, e.g. "Dietetyka|exercise": classes are counted per subject and group */
export function subjectKey(block: Pick<ClassBlock, 'event' | 'kind'>): string {
  return `${block.event.title}|${block.kind}`;
}

/** Online, at the university (a room is given, or a simulation), or not said */
export function classMode(event: ParsedEvent): ClassMode {
  return event.online ? 'online' : event.location || event.kind === 'simulation' ? 'onsite' : 'unknown';
}

export function buildDayBlocks(day: ScheduleDay): ClassBlock[] {
  return mergeClasses(day.classes)
    .map(merged => {
      const event = parseDescription(merged.description);
      let start = merged.start_time;
      let end = merged.end_time;
      // Online lectures give their real time on a second line of the cell
      if (event.actualTime) {
        const [from, to] = event.actualTime.split('–');
        if (from && to) {
          start = from;
          end = to;
        }
      }
      const groups = [...merged.groups].sort();
      const mode = classMode(event);
      return {
        id: `${day.date}|${start}|${groups.join(',')}|${merged.description}`,
        date: day.date,
        start,
        end,
        startMin: toMinutes(start),
        endMin: toMinutes(end),
        groups,
        description: merged.description,
        event,
        kind: event.kind,
        mode,
        everyone: merged.everyone,
        instructors: instructorKeys(event.instructor),
        haystack: normalizeForSearch(
          `${event.title} ${event.instructor} ${event.location} ${mode === 'online' ? 'online zdalnie' : mode === 'onsite' ? 'stacjonarnie na uczelni' : ''} ${groups.join(' ')}`,
        ),
      };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
}

export function matchesKind(block: ClassBlock, filter: KindFilter): boolean {
  if (block.kind === 'info') return true;
  return filter === 'all' || block.kind === filter;
}

export function isClass(block: ClassBlock): boolean {
  return block.kind !== 'info';
}

/** A class the student goes to: not a notice, and not one made up on another date */
export function isAttended(block: ClassBlock): boolean {
  return block.kind !== 'info' && !block.madeUpOn;
}

export interface BlockLane {
  block: ClassBlock;
  lane: number;
  lanes: number;
}

/** Places overlapping blocks side by side; each cluster gets as many lanes as it needs. */
export function layoutLanes(blocks: ClassBlock[]): BlockLane[] {
  const sorted = [...blocks].sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  const result: BlockLane[] = [];
  let cluster: BlockLane[] = [];
  let clusterEnd = -1;
  let laneEnds: number[] = [];

  const flush = () => {
    const lanes = Math.max(1, laneEnds.length);
    cluster.forEach(item => { item.lanes = lanes; });
    result.push(...cluster);
    cluster = [];
    laneEnds = [];
  };

  for (const block of sorted) {
    if (cluster.length && block.startMin >= clusterEnd) flush();
    let lane = laneEnds.findIndex(end => end <= block.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.endMin);
    } else {
      laneEnds[lane] = block.endMin;
    }
    cluster.push({ block, lane, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, block.endMin);
  }
  flush();
  return result;
}
