import { useState, useCallback, useMemo } from 'react';
import { ViewType } from '../types';
import { getMonthLabel, getWeekLabel, getStartOfWeek } from '../utils/dateUtils';

const VIEW_STORAGE_KEY = 'calendar-view';

function getDefaultView(): ViewType {
  try {
    // Check localStorage first
    const saved = localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === 'month' || saved === 'week') {
      return saved;
    }
  } catch {
    // Ignore localStorage errors
  }

  // Default: week on mobile (< 640px), month on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    return 'week';
  }
  return 'month';
}

interface UseCalendarReturn {
  currentDate: Date;
  view: ViewType;
  setView: (view: ViewType) => void;
  goToPrev: () => void;
  goToNext: () => void;
  goToToday: () => void;
  label: string;
}

export function useCalendar(): UseCalendarReturn {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setViewState] = useState<ViewType>(getDefaultView);

  const setView = useCallback((newView: ViewType) => {
    setViewState(newView);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, newView);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  }, [view]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const label = useMemo(() => {
    if (view === 'month') {
      return getMonthLabel(currentDate);
    }
    return getWeekLabel(getStartOfWeek(currentDate));
  }, [currentDate, view]);

  return {
    currentDate,
    view,
    setView,
    goToPrev,
    goToNext,
    goToToday,
    label,
  };
}
