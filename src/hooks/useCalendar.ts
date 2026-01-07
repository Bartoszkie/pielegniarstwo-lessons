import { useState, useCallback, useMemo } from 'react';
import { ViewType } from '../types';
import { getMonthLabel, getWeekLabel, getStartOfWeek } from '../utils/dateUtils';

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
  const [view, setView] = useState<ViewType>('month');

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
