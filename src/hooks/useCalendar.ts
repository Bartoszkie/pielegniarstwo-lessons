import { useState, useCallback, useMemo } from 'react';
import { ViewType } from '../types';
import { addDays, getStartOfWeek } from '../utils/dateUtils';
import { getNow } from '../utils/clock';

const VIEW_STORAGE_KEY = 'calendar-view';

function getDefaultView(): ViewType {
  try {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === 'month' || saved === 'week') {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }

  // Default: week on phones and tablets, month on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return 'week';
  }
  return 'month';
}

export interface UseCalendarReturn {
  /** The day the user is looking at; the week and month views follow it */
  cursor: Date;
  weekStart: Date;
  view: ViewType;
  setView: (view: ViewType) => void;
  setCursor: (date: Date) => void;
  shiftDay: (days: number) => void;
  /** Moves by a week or a month, depending on the view */
  shiftPeriod: (step: number) => void;
  goToToday: () => void;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function useCalendar(): UseCalendarReturn {
  const [cursor, setCursorState] = useState(() => startOfDay(getNow()));
  const [view, setViewState] = useState<ViewType>(getDefaultView);

  const setView = useCallback((newView: ViewType) => {
    setViewState(newView);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, newView);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setCursor = useCallback((date: Date) => setCursorState(startOfDay(date)), []);

  const shiftDay = useCallback((days: number) => {
    setCursorState(prev => addDays(prev, days));
  }, []);

  const shiftPeriod = useCallback((step: number) => {
    setCursorState(prev => {
      if (view === 'month') {
        return new Date(prev.getFullYear(), prev.getMonth() + step, 1);
      }
      return addDays(prev, 7 * step);
    });
  }, [view]);

  const goToToday = useCallback(() => {
    setCursorState(startOfDay(getNow()));
  }, []);

  const weekStart = useMemo(() => getStartOfWeek(cursor), [cursor]);

  return {
    cursor,
    weekStart,
    view,
    setView,
    setCursor,
    shiftDay,
    shiftPeriod,
    goToToday,
  };
}
