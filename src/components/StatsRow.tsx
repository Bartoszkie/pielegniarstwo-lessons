import { ScheduleDay } from '../types';
import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';

interface StatsRowProps {
  scheduleData: ScheduleDay[];
}

export function StatsRow({ scheduleData }: StatsRowProps) {
  const { remainingClasses, thisWeekClasses, nextClassText } = useStats(scheduleData);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <StatCard value={remainingClasses} label="Pozostałe zajęcia" />
      <StatCard value={thisWeekClasses} label="W tym tygodniu" />
      <StatCard value={nextClassText} label="Następne zajęcia" />
    </div>
  );
}
