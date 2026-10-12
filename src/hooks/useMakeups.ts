import { useCallback, useState } from 'react';
import { SavedMakeup } from '../utils/makeup';

const STORAGE_KEY = 'schedule-makeups';

function load(): SavedMakeup[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as SavedMakeup[];
  } catch {
    // Ignore localStorage errors
  }
  return [];
}

function save(makeups: SavedMakeup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeups));
  } catch {
    // Ignore localStorage errors
  }
}

/** The student's make-up classes, kept on this device only */
export function useMakeups() {
  const [makeups, setMakeups] = useState<SavedMakeup[]>(load);

  const update = useCallback((change: (list: SavedMakeup[]) => SavedMakeup[]) => {
    setMakeups(prev => {
      const next = change(prev);
      save(next);
      return next;
    });
  }, []);

  // One make-up per class: picking another date replaces the previous one
  const addMakeup = useCallback((makeup: SavedMakeup) => {
    update(list => [...list.filter(m => !(m.group === makeup.group && m.key === makeup.key && m.n === makeup.n)), makeup]);
  }, [update]);

  const removeMakeup = useCallback((id: string) => {
    update(list => list.filter(m => m.id !== id));
  }, [update]);

  return { makeups, addMakeup, removeMakeup };
}
