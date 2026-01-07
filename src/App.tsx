import { useState, useCallback } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Header } from './components/Header';
import { StatsRow } from './components/StatsRow';
import { Calendar } from './components/Calendar';
import { Legend } from './components/Legend';
import { EventModal } from './components/EventModal';
import { useCalendar } from './hooks/useCalendar';
import { eventsByDate } from './data/scheduleData';

export default function App() {
  const { currentDate, view, setView, goToPrev, goToNext, goToToday, label } = useCalendar();
  const [modalData, setModalData] = useState<string | null>(null);

  const handleDayClick = useCallback((dateStr: string) => {
    if (eventsByDate[dateStr]) {
      setModalData(dateStr);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalData(null);
  }, []);

  return (
    <>
      <BackgroundEffects />

      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <Header
          currentView={view}
          onViewChange={setView}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          label={label}
        />

        <StatsRow />

        <Calendar
          view={view}
          currentDate={currentDate}
          eventsByDate={eventsByDate}
          onDayClick={handleDayClick}
        />

        <Legend />
      </div>

      <EventModal
        isOpen={modalData !== null}
        onClose={handleCloseModal}
        data={modalData ? eventsByDate[modalData] : null}
      />
    </>
  );
}
