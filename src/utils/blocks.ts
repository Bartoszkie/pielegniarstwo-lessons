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
      // Simulation classes take place on site even when the cell names no room
      const mode: ClassMode = event.online ? 'online' : event.location || event.kind === 'simulation' ? 'onsite' : 'unknown';
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
