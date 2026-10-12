import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { GroupId, KindFilter } from '../types';
import { useSchedule } from '../hooks/useSchedule';
import { UseCalendarReturn } from '../hooks/useCalendar';
import { useMakeups } from '../hooks/useMakeups';
import { buildDayBlocks, ClassBlock, isAttended, isClass, matchesKind, subjectKey } from '../utils/blocks';
import { applyMakeups, buildClassIndex, ClassIndex, ClassNumber, findNumber, MakeupOption, SavedMakeup } from '../utils/makeup';
import { addDays, formatDate, getStartOfWeek, parseDate, isSameMonth, daysBetween, durationLabel, relativeDayLabel } from '../utils/dateUtils';
import { normalizeForSearch } from '../utils/eventUtils';
import { ThemePreference } from '../hooks/useTheme';

type Schedule = ReturnType<typeof useSchedule>;

export interface LiveState {
  /** The class happening now */
  current: ClassBlock | null;
  /** The next class that hasn't started yet: later today or on any later day */
  next: ClassBlock | null;
  /** 0–100 */
  progress: number;
  remainingMin: number;
  /** Days from today to the next class (0 = today) */
  nextInDays: number;
  /** Minutes until the next class starts, across days */
  untilNextMin: number;
  /** "za 2 godz. 14 min" within a day, then "jutro" or "za 5 dni" */
  untilNextLabel: string;
  /** Today has classes still to come (or one running), had classes that are all over, or has none */
  today: 'classes' | 'done' | 'free';
}

export interface Stats {
  thisWeek: number;
  remaining: number;
  next: ClassBlock | null;
  nextLabel: string;
}

/** Odrabianie: pick a subject, then which class of it, then see the other groups' dates */
export type MakeupFlow =
  | { step: 'subject'; group: GroupId }
  | { step: 'number'; group: GroupId; key: string; n?: number }
  | { step: 'results'; group: GroupId; key: string; n: number };

interface AppActions {
  openFilePicker: () => void;
  handleFile: (file: File) => void;
  openHowItWorks: () => void;
  openWarnings: () => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

interface AppContextValue extends AppActions {
  schedule: Schedule;
  calendar: UseCalendarReturn;
  now: Date;
  todayKey: string;
  kind: KindFilter;
  setKind: (kind: KindFilter) => void;
  /** Classes for the selected groups or instructors, all kinds */
  blocksByDate: Record<string, ClassBlock[]>;
  /** Same, after the category chip filter */
  visibleByDate: Record<string, ClassBlock[]>;
  /** Category chips with a count for the visible period; only kinds present in the plan */
  kindCounts: { kind: KindFilter; count: number }[];
  live: LiveState;
  stats: Stats;
  hasSelection: boolean;
  search: (query: string) => ClassBlock[];
  /** Every group's classes, counted per subject */
  classIndex: ClassIndex;
  /** Which class of its subject a block is, for the student's group (null for instructors) */
  numberOf: (block: ClassBlock) => ClassNumber | null;
  /** Odrabianie is possible: groups are shown and at least one is selected */
  canMakeup: boolean;
  makeups: SavedMakeup[];
  addMakeup: (makeup: SavedMakeup) => void;
  removeMakeup: (id: string) => void;
  makeupFlow: MakeupFlow | null;
  setMakeupFlow: (flow: MakeupFlow | null) => void;
  /** Opens odrabianie; with a block, straight at the other groups' dates for that class */
  startMakeup: (block?: ClassBlock) => void;
  /** The date picked from the results, waiting for confirmation */
  pendingMakeup: MakeupOption | null;
  setPendingMakeup: (option: MakeupOption | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const KIND_ORDER: KindFilter[] = ['lecture', 'exercise', 'simulation', 'other'];

export function AppProvider({
  schedule,
  calendar,
  now,
  actions,
  children,
}: {
  schedule: Schedule;
  calendar: UseCalendarReturn;
  now: Date;
  actions: AppActions;
  children: ReactNode;
}) {
  const [kind, setKind] = useState<KindFilter>('all');
  const [makeupFlow, setMakeupFlow] = useState<MakeupFlow | null>(null);
  const [pendingMakeup, setPendingMakeup] = useState<MakeupOption | null>(null);
  const { makeups, addMakeup, removeMakeup } = useMakeups();
  const todayKey = formatDate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isStudent = schedule.mode === 'student';

  const classIndex = useMemo(() => buildClassIndex(schedule.allDays), [schedule.allDays]);

  const blocksByDate = useMemo(() => {
    const map: Record<string, ClassBlock[]> = {};
    for (const day of schedule.scheduleData) {
      map[day.date] = buildDayBlocks(day);
    }
    return isStudent ? applyMakeups(map, makeups, classIndex, schedule.selectedGroups) : map;
  }, [schedule.scheduleData, isStudent, makeups, classIndex, schedule.selectedGroups]);

  const visibleByDate = useMemo(() => {
    if (kind === 'all') return blocksByDate;
    const map: Record<string, ClassBlock[]> = {};
    for (const [date, blocks] of Object.entries(blocksByDate)) {
      const shown = blocks.filter(block => matchesKind(block, kind));
      if (shown.some(isClass)) map[date] = shown;
    }
    return map;
  }, [blocksByDate, kind]);

  const kindCounts = useMemo(() => {
    const present = new Set<KindFilter>();
    const counts: Record<KindFilter, number> = { all: 0, lecture: 0, exercise: 0, simulation: 0, other: 0 };
    const { view, cursor, weekStart } = calendar;
    const weekEnd = addDays(weekStart, 6);
    for (const [date, blocks] of Object.entries(blocksByDate)) {
      const d = parseDate(date);
      const inPeriod = view === 'month' ? isSameMonth(d, cursor) : d >= weekStart && d <= weekEnd;
      for (const block of blocks) {
        if (!isClass(block)) continue;
        const k = block.kind as KindFilter;
        present.add(k);
        if (inPeriod) {
          counts[k] += 1;
          counts.all += 1;
        }
      }
    }
    return [
      { kind: 'all' as KindFilter, count: counts.all },
      ...KIND_ORDER.filter(k => present.has(k)).map(k => ({ kind: k, count: counts[k] })),
    ];
  }, [blocksByDate, calendar]);

  const live = useMemo<LiveState>(() => {
    const todayClasses = (blocksByDate[todayKey] ?? []).filter(isAttended);
    const current = todayClasses.find(b => b.startMin <= nowMin && nowMin < b.endMin) ?? null;

    // First class that hasn't started, looking past today when needed
    let next: ClassBlock | null = null;
    for (const date of Object.keys(blocksByDate).filter(d => d >= todayKey).sort()) {
      next = blocksByDate[date].find(b => isAttended(b) && (date > todayKey || b.startMin > nowMin)) ?? null;
      if (next) break;
    }

    const nextInDays = next ? daysBetween(parseDate(todayKey), parseDate(next.date)) : 0;
    const untilNextMin = next ? nextInDays * 1440 + next.startMin - nowMin : 0;
    let untilNextLabel = '';
    if (next) {
      untilNextLabel = untilNextMin < 1440 ? `za ${durationLabel(untilNextMin)}` : nextInDays === 1 ? 'jutro' : `za ${nextInDays} dni`;
    }
    const today = todayClasses.length === 0 ? 'free' : current || next?.date === todayKey ? 'classes' : 'done';

    return {
      current,
      next,
      progress: current ? Math.round(((nowMin - current.startMin) / Math.max(1, current.endMin - current.startMin)) * 100) : 0,
      remainingMin: current ? current.endMin - nowMin : 0,
      nextInDays,
      untilNextMin,
      untilNextLabel,
      today,
    };
  }, [blocksByDate, todayKey, nowMin]);

  const stats = useMemo<Stats>(() => {
    const weekStart = getStartOfWeek(now);
    const weekEnd = formatDate(addDays(weekStart, 6));
    const weekStartKey = formatDate(weekStart);
    let thisWeek = 0;
    let remaining = 0;
    for (const [date, blocks] of Object.entries(blocksByDate)) {
      for (const block of blocks) {
        if (!isAttended(block)) continue;
        if (date >= weekStartKey && date <= weekEnd) thisWeek += 1;
        if (date > todayKey || (date === todayKey && block.endMin > nowMin)) remaining += 1;
      }
    }
    const next = live.next;
    const nextLabel = next ? `${relativeDayLabel(parseDate(next.date), parseDate(todayKey))}, ${next.start}` : '—';
    return { thisWeek, remaining, next, nextLabel };
  }, [blocksByDate, now, todayKey, nowMin, live.next]);

  const hasSelection = schedule.mode === 'student'
    ? schedule.selectedGroups.size > 0
    : schedule.selectedTeachers.size > 0;

  const search = useMemo(() => {
    const all = Object.keys(blocksByDate)
      .sort()
      .flatMap(date => blocksByDate[date].filter(isClass));
    return (query: string) => {
      const q = normalizeForSearch(query.trim());
      if (!q) return [];
      const words = q.split(/\s+/);
      const matches = all.filter(block => words.every(word => block.haystack.includes(word)));
      const upcoming = matches.filter(b => b.date > todayKey || (b.date === todayKey && b.endMin > nowMin));
      const past = matches.filter(b => !upcoming.includes(b)).reverse();
      return [...upcoming, ...past];
    };
  }, [blocksByDate, todayKey, nowMin]);

  const numberOf = useCallback((block: ClassBlock): ClassNumber | null => {
    if (!isClass(block) || !isStudent) return null;
    if (block.makeup) {
      const { n, total, group } = block.makeup;
      return { n, total, group, list: classIndex.get(group)?.get(subjectKey(block)) ?? [] };
    }
    for (const group of block.groups) {
      const found = findNumber(classIndex, group, block);
      if (found) return found;
    }
    return null;
  }, [classIndex, isStudent]);

  const canMakeup = isStudent && schedule.selectedGroups.size > 0;

  const startMakeup = useCallback((block?: ClassBlock) => {
    if (!canMakeup) return;
    const found = block && numberOf(block);
    if (block && found) {
      setMakeupFlow({ step: 'results', group: found.group, key: subjectKey(block), n: found.n });
      return;
    }
    setMakeupFlow({ step: 'subject', group: [...schedule.selectedGroups].sort()[0] });
  }, [canMakeup, numberOf, schedule.selectedGroups]);

  const value: AppContextValue = {
    schedule,
    calendar,
    now,
    todayKey,
    kind,
    setKind,
    blocksByDate,
    visibleByDate,
    kindCounts,
    live,
    stats,
    hasSelection,
    search,
    classIndex,
    numberOf,
    canMakeup,
    makeups,
    addMakeup,
    removeMakeup,
    makeupFlow,
    setMakeupFlow,
    startMakeup,
    pendingMakeup,
    setPendingMakeup,
    ...actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
