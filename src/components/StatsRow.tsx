import { useState } from 'react';
import { ScheduleDay } from '../types';
import { useStats } from '../hooks/useStats';
import { StatCard } from './StatCard';

interface StatsRowProps {
  scheduleData: ScheduleDay[];
}

export function StatsRow({ scheduleData }: StatsRowProps) {
  const { remainingClasses, thisWeekClasses, nextClassText } = useStats(scheduleData);

  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('stats-expanded');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('stats-expanded', String(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-3 mb-4 sm:mb-6">
      {/* Header - always visible */}
      <div
        className="flex items-center justify-between cursor-pointer select-none btn-press"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">Statystyki</span>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Collapsible content */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3">
            <StatCard value={remainingClasses} label="Pozostałe zajęcia" />
            <StatCard value={thisWeekClasses} label="W tym tygodniu" />
            <StatCard value={nextClassText} label="Następne zajęcia" />
          </div>
        </div>
      </div>
    </div>
  );
}
