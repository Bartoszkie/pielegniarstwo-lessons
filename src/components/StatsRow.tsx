import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';

export function StatsRow() {
  const { totalClasses, upcomingClasses, nextClassText } = useStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <StatCard value={totalClasses} label="Wszystkie zajęcia" />
      <StatCard value={upcomingClasses} label="Nadchodzące" />
      <StatCard value={nextClassText} label="Następne zajęcia" />
    </div>
  );
}
