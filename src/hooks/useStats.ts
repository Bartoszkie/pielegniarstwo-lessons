import { useMemo } from 'react';
import { ScheduleDay } from '../types';

interface UseStatsReturn {
  totalClasses: number;
  upcomingClasses: number;
  nextClassText: string;
}

export function useStats(scheduleData: ScheduleDay[]): UseStatsReturn {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalClasses = 0;
    let upcoming = 0;
    let nextClassTimestamp: number | null = null;

    scheduleData.forEach(day => {
      totalClasses += day.classes.length;

      const eventDate = new Date(day.date);
      const eventTimestamp = eventDate.getTime();
      if (eventDate >= today) {
        upcoming += day.classes.length;
        if (nextClassTimestamp === null || eventTimestamp < nextClassTimestamp) {
          nextClassTimestamp = eventTimestamp;
        }
      }
    });

    let nextClassText = '-';
    if (nextClassTimestamp !== null) {
      const diffTime = nextClassTimestamp - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        nextClassText = 'Dzis!';
      } else if (diffDays === 1) {
        nextClassText = 'Jutro';
      } else {
        nextClassText = `Za ${diffDays} dni`;
      }
    }

    return {
      totalClasses,
      upcomingClasses: upcoming,
      nextClassText,
    };
  }, [scheduleData]);
}
