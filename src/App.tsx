import { useState, useCallback } from 'react';
import { BackgroundEffects } from './components/BackgroundEffects';
import { Header } from './components/Header';
import { StatsRow } from './components/StatsRow';
import { Calendar } from './components/Calendar';
import { Legend } from './components/Legend';
import { EventModal } from './components/EventModal';
import { HowItWorksModal } from './components/HowItWorksModal';
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
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleDayClick = useCallback((dateStr: string) => {
    if (eventsByDate[dateStr]) {
      setModalData(dateStr);
    }
  }, [eventsByDate]);

  const handleCloseModal = useCallback(() => {
    setModalData(null);
  }, []);

  const handleOpenHowItWorks = useCallback(() => {
    setShowHowItWorks(true);
  }, []);

  const handleCloseHowItWorks = useCallback(() => {
    setShowHowItWorks(false);
  }, []);

  return (
    <>
      <BackgroundEffects />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Header
          currentView={view}
          onViewChange={setView}
          onPrev={goToPrev}
          onNext={goToNext}
          onToday={goToToday}
          label={label}
          isDataLoaded={isLoaded}
          onClearData={clearData}
          onHowItWorks={handleOpenHowItWorks}
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

            {/* Info banner when no groups selected */}
            {selectedGroups.size === 0 && (
              <div className="mb-4 lg:mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Plan zajęć poprawnie załadowany!
                  </p>
                  <p className="text-sm text-text-secondary">
                    Wybierz grupę w panelu po prawej stronie, aby zobaczyć plan zajęć
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
              <div className="flex-1 min-w-0">
                <Calendar
                  view={view}
                  currentDate={currentDate}
                  eventsByDate={eventsByDate}
                  onDayClick={handleDayClick}
                />
              </div>

              <Legend
                availableGroups={availableGroups}
                selectedGroups={selectedGroups}
                onToggleGroup={toggleGroup}
                onSelectAll={selectAllGroups}
                onDeselectAll={deselectAllGroups}
              />
            </div>
          </>
        )}
      </div>

      <EventModal
        isOpen={modalData !== null}
        onClose={handleCloseModal}
        data={modalData ? eventsByDate[modalData] : null}
      />

      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={handleCloseHowItWorks}
      />
    </>
  );
}
