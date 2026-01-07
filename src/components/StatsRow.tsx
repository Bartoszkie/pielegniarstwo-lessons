import { ScheduleDay } from '../types';
import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';

interface StatsRowProps {
  scheduleData: ScheduleDay[];
}

export function StatsRow({ scheduleData }: StatsRowProps) {
  const { totalClasses, upcomingClasses, nextClassText } = useStats(scheduleData);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <StatCard value={totalClasses} label="Wszystkie zajecia" />
      <StatCard value={upcomingClasses} label="Nadchodzace" />
      <StatCard value={nextClassText} label="Nastepne zajecia" />
    </div>
  );
}
