import { useMemo } from 'react';
import { ScheduleDay } from '../types';
import { mergeClasses } from '../utils/classMerger';

interface UseStatsReturn {
  remainingClasses: number;
  thisWeekClasses: number;
  nextClassText: string;
}

export function useStats(scheduleData: ScheduleDay[]): UseStatsReturn {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate end of current week (Sunday 23:59:59)
    const endOfWeek = new Date(today);
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    endOfWeek.setDate(today.getDate() + (7 - dayOfWeek));
    endOfWeek.setHours(23, 59, 59, 999);

    let remaining = 0;
    let thisWeek = 0;
    let nextClassTimestamp: number | null = null;

    scheduleData.forEach(day => {
      // Parse date as local time (not UTC)
      const [year, month, dayNum] = day.date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, dayNum);
      const eventTimestamp = eventDate.getTime();

      if (eventDate >= today) {
        // Count merged classes for remaining (rest of semester)
        remaining += mergeClasses(day.classes).length;

        // Count merged classes for this week only
        if (eventDate <= endOfWeek) {
          thisWeek += mergeClasses(day.classes).length;
        }

        // Track next class date
        if (nextClassTimestamp === null || eventTimestamp < nextClassTimestamp) {
          nextClassTimestamp = eventTimestamp;
        }
      }
    });

    let nextClassText = '-';
    if (nextClassTimestamp !== null) {
      const diffTime = nextClassTimestamp - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        nextClassText = 'Dziś!';
      } else if (diffDays === 1) {
        nextClassText = 'Jutro';
      } else {
        nextClassText = `Za ${diffDays} dni`;
      }
    }

    return {
      remainingClasses: remaining,
      thisWeekClasses: thisWeek,
      nextClassText,
    };
  }, [scheduleData]);
}
