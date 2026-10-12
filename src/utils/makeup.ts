import { GroupId, ScheduleDay } from '../types';
import { buildDayBlocks, ClassBlock, isAttended, isClass, MakeupLink, subjectKey } from './blocks';
import { isInfoDescription } from './eventUtils';

/**
 * Every class of every group, counted per subject: group → subject → classes in date order.
 * Groups go through the material in the same order, so the n-th class of a subject is the same
 * topic in every group. That is what makes it possible to make one up with another group.
 */
export type ClassIndex = Map<GroupId, Map<string, ClassBlock[]>>;

export function buildClassIndex(days: ScheduleDay[]): ClassIndex {
  const index: ClassIndex = new Map();
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of sorted) {
    const byGroup = new Map<GroupId, ScheduleDay['classes']>();
    for (const cls of day.classes) {
      if (isInfoDescription(cls.description)) continue;
      byGroup.set(cls.group, [...(byGroup.get(cls.group) ?? []), cls]);
    }
    for (const [group, classes] of byGroup) {
      let subjects = index.get(group);
      if (!subjects) {
        subjects = new Map();
        index.set(group, subjects);
      }
      // Built for the group alone, so a class split across slots counts once, as the group has it
      for (const block of buildDayBlocks({ ...day, classes })) {
        if (!isClass(block)) continue;
        const key = subjectKey(block);
        subjects.set(key, [...(subjects.get(key) ?? []), block]);
      }
    }
  }
  return index;
}

export interface ClassNumber {
  /** 1 for the first class of the subject, … */
  n: number;
  total: number;
  group: GroupId;
  /** All classes of the subject for the group, in order */
  list: ClassBlock[];
}

/** Which class of its subject a block is, for one group */
export function findNumber(index: ClassIndex, group: GroupId, block: ClassBlock): ClassNumber | null {
  const list = index.get(group)?.get(subjectKey(block));
  if (!list) return null;
  const at = list.findIndex(o => o.date === block.date && o.startMin < block.endMin && block.startMin < o.endMin);
  return at === -1 ? null : { n: at + 1, total: list.length, group, list };
}

export interface MakeupSubject {
  key: string;
  title: string;
  kind: ClassBlock['kind'];
  list: ClassBlock[];
}

/** Subjects a group can make up with another group: the ones that differ between groups (not shared lectures) */
export function makeupSubjects(index: ClassIndex, group: GroupId): MakeupSubject[] {
  const subjects = index.get(group);
  if (!subjects) return [];
  return [...subjects.entries()]
    .filter(([, list]) => !list.every(b => b.everyone))
    .map(([key, list]) => ({ key, title: list[0].event.title, kind: list[0].kind, list }))
    .sort((a, b) => a.title.localeCompare(b.title, 'pl') || a.kind.localeCompare(b.kind));
}

export interface MakeupOption {
  /** date|start|end */
  id: string;
  /** The class as the other groups have it, with all of them in `groups` */
  block: ClassBlock;
  /** The student's own classes at the same time */
  clashes: ClassBlock[];
}

/**
 * The n-th class of a subject in the other groups, from now on, soonest first.
 * Groups that share the student's own class (e.g. its A/B pair) are left out.
 */
export function makeupOptions(
  index: ClassIndex,
  group: GroupId,
  key: string,
  n: number,
  plan: Record<string, ClassBlock[]>,
  todayKey: string,
  nowMin: number,
): MakeupOption[] {
  const own = index.get(group)?.get(key)?.[n - 1];
  const found = new Map<string, { block: ClassBlock; groups: GroupId[] }>();
  for (const [other, subjects] of index) {
    if (other === group) continue;
    const block = subjects.get(key)?.[n - 1];
    if (!block) continue;
    if (block.date < todayKey || (block.date === todayKey && block.startMin <= nowMin)) continue;
    if (own && own.date === block.date && own.startMin === block.startMin && own.endMin === block.endMin) continue;
    const id = `${block.date}|${block.start}|${block.end}`;
    const entry = found.get(id);
    if (entry) entry.groups.push(other);
    else found.set(id, { block, groups: [other] });
  }

  return [...found.entries()]
    .map(([id, { block, groups }]) => {
      const sortedGroups = [...groups].sort();
      return {
        id,
        block: { ...block, id: `option|${id}|${key}`, groups: sortedGroups, everyone: false },
        clashes: (plan[block.date] ?? []).filter(
          b => isAttended(b) && subjectKey(b) !== key && b.startMin < block.endMin && block.startMin < b.endMin,
        ),
      };
    })
    .sort((a, b) => a.block.date.localeCompare(b.block.date) || a.block.startMin - b.block.startMin);
}

/** A make-up the student added to their plan; kept on the device */
export interface SavedMakeup {
  id: string;
  key: string;
  n: number;
  total: number;
  /** The student's group */
  group: GroupId;
  /** The student's own class that is made up */
  own: { date: string; start: string };
  date: string;
  start: string;
  end: string;
  /** The groups the student joins */
  groups: GroupId[];
  /** The cell text, to show the class even if the plan file changes */
  description: string;
}

export function createSavedMakeup(option: MakeupOption, group: GroupId, key: string, n: number, total: number, own: ClassBlock): SavedMakeup {
  const { block } = option;
  return {
    id: `${group}|${key}|${n}|${block.date}|${block.start}`,
    key,
    n,
    total,
    group,
    own: { date: own.date, start: own.start },
    date: block.date,
    start: block.start,
    end: block.end,
    groups: block.groups,
    description: block.description,
  };
}

function makeupBlock(saved: SavedMakeup, index: ClassIndex): ClassBlock {
  const current = index.get(saved.groups[0])?.get(saved.key)?.find(b => b.date === saved.date && b.start === saved.start);
  const base = current ?? buildDayBlocks({
    date: saved.date,
    day: '',
    classes: [{ start_time: saved.start, end_time: saved.end, description: saved.description, group: saved.groups[0] }],
  })[0];
  return {
    ...base,
    id: `makeup|${saved.id}`,
    groups: saved.groups,
    everyone: false,
    makeup: { id: saved.id, n: saved.n, total: saved.total, group: saved.group, date: saved.own.date, start: saved.own.start, groups: saved.groups },
  };
}

/**
 * Puts the student's make-ups into their plan: the make-up class on its date, and the
 * replaced class marked on its own date. Only make-ups of the shown groups count.
 */
export function applyMakeups(
  plan: Record<string, ClassBlock[]>,
  makeups: SavedMakeup[],
  index: ClassIndex,
  groups: Set<GroupId>,
): Record<string, ClassBlock[]> {
  const shown = makeups.filter(m => groups.has(m.group));
  if (!shown.length) return plan;
  const result = { ...plan };
  for (const saved of shown) {
    const link: MakeupLink = {
      id: saved.id, n: saved.n, total: saved.total, group: saved.group, date: saved.date, start: saved.start, groups: saved.groups,
    };
    result[saved.own.date] = (result[saved.own.date] ?? []).map(b =>
      subjectKey(b) === saved.key && b.start === saved.own.start && b.groups.includes(saved.group) ? { ...b, madeUpOn: link } : b,
    );
    result[saved.date] = [...(result[saved.date] ?? []), makeupBlock(saved, index)]
      .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  }
  return result;
}
