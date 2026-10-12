import { useState, useCallback, useMemo } from 'react';
import { ScheduleDay, GroupId, ScheduleMode, ParseWarning } from '../types';
import { parseExcelFile, PARSER_VERSION } from '../utils/excelParser';
import { isInfoDescription } from '../utils/eventUtils';

export interface LoadResult {
  ok: boolean;
  days: number;
  warnings: number;
}

interface UseScheduleReturn {
  /** Classes of the selected groups or instructors, plus notices */
  scheduleData: ScheduleDay[];
  /** The whole plan, every group */
  allDays: ScheduleDay[];
  availableGroups: GroupId[];
  selectedGroups: Set<GroupId>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  warnings: ParseWarning[];
  lastUpdated: string | null;
  /** The saved plan was read by an older version of the parser; loading the file again shows more */
  needsReload: boolean;
  loadFile: (file: File) => Promise<LoadResult>;
  toggleGroup: (group: GroupId) => void;
  selectAllGroups: () => void;
  deselectAllGroups: () => void;
  clearData: () => void;
  // Teacher mode
  mode: ScheduleMode;
  setMode: (mode: ScheduleMode) => void;
  availableTeachers: string[];
  selectedTeachers: Set<string>;
  toggleTeacher: (teacher: string) => void;
  selectAllTeachers: () => void;
  deselectAllTeachers: () => void;
}

const STORAGE_KEYS = {
  DATA: 'schedule-data',
  PARSER_VERSION: 'schedule-parser-version',
  GROUPS: 'schedule-groups',
  SELECTED: 'schedule-selected',
  MODE: 'schedule-mode',
  TEACHERS: 'schedule-teachers',
  SELECTED_TEACHERS: 'schedule-selected-teachers',
  LAST_UPDATED: 'schedule-last-updated',
  WARNINGS: 'schedule-warnings'
};

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch {
    // Ignore localStorage errors
  }
  return defaultValue;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage errors
  }
}

function clearStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch {
    // Ignore localStorage errors
  }
}

export function useSchedule(): UseScheduleReturn {
  // Load initial state from localStorage
  const [rawScheduleData, setRawScheduleData] = useState<ScheduleDay[]>(() =>
    loadFromStorage<ScheduleDay[]>(STORAGE_KEYS.DATA, [])
  );
  const [availableGroups, setAvailableGroups] = useState<GroupId[]>(() =>
    loadFromStorage<GroupId[]>(STORAGE_KEYS.GROUPS, [])
  );
  const [selectedGroups, setSelectedGroups] = useState<Set<GroupId>>(() =>
    new Set(loadFromStorage<GroupId[]>(STORAGE_KEYS.SELECTED, []))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ParseWarning[]>(() =>
    loadFromStorage<ParseWarning[]>(STORAGE_KEYS.WARNINGS, [])
  );

  // Teacher mode state
  const [mode, setModeState] = useState<ScheduleMode>(() =>
    loadFromStorage<ScheduleMode>(STORAGE_KEYS.MODE, 'student')
  );
  const [availableTeachers, setAvailableTeachers] = useState<string[]>(() =>
    loadFromStorage<string[]>(STORAGE_KEYS.TEACHERS, [])
  );
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(() =>
    new Set(loadFromStorage<string[]>(STORAGE_KEYS.SELECTED_TEACHERS, []))
  );
  const [lastUpdated, setLastUpdated] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEYS.LAST_UPDATED, null)
  );
  // Plans saved before the version was stored come from version 1
  const [parserVersion, setParserVersion] = useState(() => loadFromStorage<number>(STORAGE_KEYS.PARSER_VERSION, 1));

  const isLoaded = rawScheduleData.length > 0;
  const needsReload = isLoaded && parserVersion < PARSER_VERSION;

  // Filter by mode and selection. Notices (days off, breaks) apply to everyone.
  const filteredScheduleData = useMemo(() => {
    const hasSelection = mode === 'student' ? selectedGroups.size > 0 : selectedTeachers.size > 0;
    if (!hasSelection) return [];
    return rawScheduleData.map(day => ({
      ...day,
      classes: day.classes.filter(cls => {
        if (isInfoDescription(cls.description)) return true;
        if (mode === 'student') return selectedGroups.has(cls.group);
        return !!cls.instructor && cls.instructor.some(instr => selectedTeachers.has(instr));
      })
    })).filter(day => day.classes.length > 0);
  }, [rawScheduleData, selectedGroups, selectedTeachers, mode]);

  const loadFile = useCallback(async (file: File): Promise<LoadResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parseExcelFile(file);

      if (!result.success || result.data.length === 0) {
        setError(result.error ?? 'W pliku nie znaleziono żadnych zajęć. Upewnij się, że to oryginalny plik planu z uczelni.');
        return { ok: false, days: 0, warnings: result.warnings.length };
      }

      setRawScheduleData(result.data);
      setAvailableGroups(result.groups);
      setAvailableTeachers(result.teachers);
      setWarnings(result.warnings);

      // Keep the current selection when replacing the plan, dropping anything the new file no longer has
      setSelectedGroups(prev => {
        const next = new Set([...prev].filter(group => result.groups.includes(group)));
        saveToStorage(STORAGE_KEYS.SELECTED, Array.from(next));
        return next;
      });
      setSelectedTeachers(prev => {
        const next = new Set([...prev].filter(teacher => result.teachers.includes(teacher)));
        saveToStorage(STORAGE_KEYS.SELECTED_TEACHERS, Array.from(next));
        return next;
      });

      // Persist to localStorage
      const timestamp = new Date().toISOString();
      setLastUpdated(timestamp);
      saveToStorage(STORAGE_KEYS.DATA, result.data);
      saveToStorage(STORAGE_KEYS.GROUPS, result.groups);
      saveToStorage(STORAGE_KEYS.TEACHERS, result.teachers);
      saveToStorage(STORAGE_KEYS.WARNINGS, result.warnings);
      saveToStorage(STORAGE_KEYS.LAST_UPDATED, timestamp);
      saveToStorage(STORAGE_KEYS.PARSER_VERSION, PARSER_VERSION);
      setParserVersion(PARSER_VERSION);

      return { ok: true, days: result.data.length, warnings: result.warnings.length };
    } catch (err) {
      setError(`Nie udało się wczytać pliku (${err instanceof Error ? err.message : String(err)}).`);
      return { ok: false, days: 0, warnings: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleGroup = useCallback((group: GroupId) => {
    setSelectedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      saveToStorage(STORAGE_KEYS.SELECTED, Array.from(next));
      return next;
    });
  }, []);

  const selectAllGroups = useCallback(() => {
    setSelectedGroups(new Set(availableGroups));
    saveToStorage(STORAGE_KEYS.SELECTED, availableGroups);
  }, [availableGroups]);

  const deselectAllGroups = useCallback(() => {
    setSelectedGroups(new Set());
    saveToStorage(STORAGE_KEYS.SELECTED, []);
  }, []);

  // Mode switching
  const setMode = useCallback((newMode: ScheduleMode) => {
    setModeState(newMode);
    saveToStorage(STORAGE_KEYS.MODE, newMode);
  }, []);

  // Teacher selection functions
  const toggleTeacher = useCallback((teacher: string) => {
    setSelectedTeachers(prev => {
      const next = new Set(prev);
      if (next.has(teacher)) {
        next.delete(teacher);
      } else {
        next.add(teacher);
      }
      saveToStorage(STORAGE_KEYS.SELECTED_TEACHERS, Array.from(next));
      return next;
    });
  }, []);

  const selectAllTeachers = useCallback(() => {
    setSelectedTeachers(new Set(availableTeachers));
    saveToStorage(STORAGE_KEYS.SELECTED_TEACHERS, availableTeachers);
  }, [availableTeachers]);

  const deselectAllTeachers = useCallback(() => {
    setSelectedTeachers(new Set());
    saveToStorage(STORAGE_KEYS.SELECTED_TEACHERS, []);
  }, []);

  const clearData = useCallback(() => {
    setRawScheduleData([]);
    setAvailableGroups([]);
    setSelectedGroups(new Set());
    setAvailableTeachers([]);
    setSelectedTeachers(new Set());
    setModeState('student');
    setError(null);
    setWarnings([]);
    setLastUpdated(null);
    clearStorage();
  }, []);

  return {
    scheduleData: filteredScheduleData,
    allDays: rawScheduleData,
    availableGroups,
    selectedGroups,
    isLoaded,
    isLoading,
    error,
    warnings,
    lastUpdated,
    needsReload,
    loadFile,
    toggleGroup,
    selectAllGroups,
    deselectAllGroups,
    clearData,
    // Teacher mode
    mode,
    setMode,
    availableTeachers,
    selectedTeachers,
    toggleTeacher,
    selectAllTeachers,
    deselectAllTeachers
  };
}
