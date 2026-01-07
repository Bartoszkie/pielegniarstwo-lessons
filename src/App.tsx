import { useState, useCallback } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Header } from './components/Header';
import { StatsRow } from './components/StatsRow';
import { Calendar } from './components/Calendar';
import { Legend } from './components/Legend';
import { EventModal } from './components/EventModal';
import { FileUpload } from './components/FileUpload';
import { useCalendar } from './hooks/useCalendar';
import { useSchedule } from './hooks/useSchedule';

export default function App() {
  const { currentDate, view, setView, goToPrev, goToNext, goToToday, label } = useCalendar();
  const {
    scheduleData,
    eventsByDate,
    availableGroups,
    selectedGroups,
    isLoaded,
    isLoading,
    error,
    loadFile,
    toggleGroup,
    selectAllGroups,
    deselectAllGroups,
    clearData
  } = useSchedule();

  const [modalData, setModalData] = useState<string | null>(null);

  const handleDayClick = useCallback((dateStr: string) => {
    if (eventsByDate[dateStr]) {
      setModalData(dateStr);
    }
  }, [eventsByDate]);

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
          isDataLoaded={isLoaded}
          onClearData={clearData}
        />

        {!isLoaded ? (
          <FileUpload
            onFileSelect={loadFile}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <>
            <StatsRow scheduleData={scheduleData} />

            <Calendar
              view={view}
              currentDate={currentDate}
              eventsByDate={eventsByDate}
              onDayClick={handleDayClick}
            />

            <Legend
              availableGroups={availableGroups}
              selectedGroups={selectedGroups}
              onToggleGroup={toggleGroup}
              onSelectAll={selectAllGroups}
              onDeselectAll={deselectAllGroups}
            />
          </>
        )}
      </div>

      <EventModal
        isOpen={modalData !== null}
        onClose={handleCloseModal}
        data={modalData ? eventsByDate[modalData] : null}
      />
    </>
  );
}
