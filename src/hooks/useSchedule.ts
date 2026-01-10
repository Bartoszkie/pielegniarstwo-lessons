import { useState, useCallback, useMemo } from 'react';
import { ScheduleDay, GroupId } from '../types';
import { parseExcelFile } from '../utils/excelParser';

interface UseScheduleReturn {
  scheduleData: ScheduleDay[];
  eventsByDate: Record<string, ScheduleDay>;
  availableGroups: GroupId[];
  selectedGroups: Set<GroupId>;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadFile: (file: File) => Promise<void>;
  toggleGroup: (group: GroupId) => void;
  selectAllGroups: () => void;
  deselectAllGroups: () => void;
  clearData: () => void;
}

const STORAGE_KEYS = {
  DATA: 'schedule-data',
  GROUPS: 'schedule-groups',
  SELECTED: 'schedule-selected'
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

  const isLoaded = rawScheduleData.length > 0;

  // Filter schedule data based on selected groups
  const filteredScheduleData = useMemo(() => {
    if (selectedGroups.size === 0) return [];

    return rawScheduleData.map(day => ({
      ...day,
      classes: day.classes.filter(cls => selectedGroups.has(cls.group))
    })).filter(day => day.classes.length > 0);
  }, [rawScheduleData, selectedGroups]);

  // Build eventsByDate lookup
  const eventsByDate = useMemo(() => {
    return filteredScheduleData.reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {} as Record<string, ScheduleDay>);
  }, [filteredScheduleData]);

  const loadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await parseExcelFile(file);

      if (!result.success || result.data.length === 0) {
        const errorCount = result.errors.length;
        if (errorCount > 3) {
          const uniqueErrors = [...new Set(result.errors.map(e => e.split(':')[1]?.trim() || e))].slice(0, 3);
          setError(`Znaleziono ${errorCount} problemow. Przyklady: ${uniqueErrors.join(', ')}`);
        } else if (errorCount > 0) {
          setError(result.errors.join('; '));
        } else {
          setError('Nie udalo sie wczytac danych z pliku');
        }
        return;
      }

      setRawScheduleData(result.data);
      setAvailableGroups(result.groups);

      // No groups selected by default - user must choose
      setSelectedGroups(new Set());

      // Persist to localStorage
      saveToStorage(STORAGE_KEYS.DATA, result.data);
      saveToStorage(STORAGE_KEYS.GROUPS, result.groups);
      saveToStorage(STORAGE_KEYS.SELECTED, []);

      if (result.errors.length > 0) {
        console.warn('Parser warnings:', result.errors);
      }
    } catch (err) {
      setError(`Blad wczytywania pliku: ${err}`);
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
    const allGroups = new Set(availableGroups);
    setSelectedGroups(allGroups);
    saveToStorage(STORAGE_KEYS.SELECTED, availableGroups);
  }, [availableGroups]);

  const deselectAllGroups = useCallback(() => {
    setSelectedGroups(new Set());
    saveToStorage(STORAGE_KEYS.SELECTED, []);
  }, []);

  const clearData = useCallback(() => {
    setRawScheduleData([]);
    setAvailableGroups([]);
    setSelectedGroups(new Set());
    setError(null);
    clearStorage();
  }, []);

  return {
    scheduleData: filteredScheduleData,
    eventsByDate,
    availableGroups,
    selectedGroups,
    isLoaded,
    isLoading,
    error,
    loadFile,
    toggleGroup,
    selectAllGroups,
    deselectAllGroups,
    clearData
  };
}
