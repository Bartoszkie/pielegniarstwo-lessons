import { useCallback, useMemo, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { AppProvider } from './app/AppContext';
import { useSchedule } from './hooks/useSchedule';
import { useCalendar } from './hooks/useCalendar';
import { useNow } from './hooks/useNow';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import { useAppUpdate } from './hooks/useAppUpdate';
import { pluralPl } from './utils/dateUtils';
import { isClockOverridden } from './utils/clock';
import { Onboarding } from './components/Onboarding';
import { PhoneApp } from './components/phone/PhoneApp';
import { DesktopApp } from './components/desktop/DesktopApp';
import { HowItWorksDialog, WarningsDialog } from './components/Dialogs';

function isExcelFile(file: File): boolean {
  return /\.(xls|xlsx)$/i.test(file.name) || [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ].includes(file.type);
}

export default function App() {
  const schedule = useSchedule();
  const calendar = useCalendar();
  const now = useNow();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { theme, setTheme } = useTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const [howOpen, setHowOpen] = useState(false);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const { loadFile, isLoaded } = schedule;
  const { markPickerOpened, markPickerClosed } = useAppUpdate({ busy: schedule.isLoading });

  const handleFile = useCallback(async (file: File) => {
    if (!isExcelFile(file)) {
      toast.error('To nie jest plik Excel (.xls lub .xlsx).');
      return;
    }
    const wasLoaded = isLoaded;
    const result = await loadFile(file);
    if (!result.ok) {
      if (wasLoaded) toast.error('Nie udało się wczytać nowego planu. Obecny plan został bez zmian.');
      return;
    }
    if (result.warnings > 0) {
      toast.warning(`Plan wczytany. ${pluralPl(result.warnings, 'wiersz pominięto', 'wiersze pominięto', 'wierszy pominięto')}.`, {
        action: { label: 'Pokaż', onClick: () => setWarningsOpen(true) },
      });
    } else {
      toast.success(wasLoaded ? 'Wczytano nowy plan. Wybór grup został zachowany.' : 'Plan wczytany.');
    }
  }, [loadFile, isLoaded]);

  const actions = useMemo(() => ({
    openFilePicker: () => {
      markPickerOpened();
      fileInput.current?.click();
    },
    handleFile: (file: File) => { void handleFile(file); },
    openHowItWorks: () => setHowOpen(true),
    openWarnings: () => setWarningsOpen(true),
    theme,
    setTheme,
  }), [handleFile, theme, setTheme, markPickerOpened]);

  return (
    <AppProvider schedule={schedule} calendar={calendar} now={now} actions={actions}>
      {!schedule.isLoaded ? <Onboarding /> : isDesktop ? <DesktopApp /> : <PhoneApp />}

      <input
        ref={fileInput}
        type="file"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={e => {
          markPickerClosed();
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {isClockOverridden && (
        // Development only: make a faked clock impossible to miss
        <a
          href={window.location.pathname}
          title="Usuń ?now= z adresu i wróć do prawdziwego czasu"
          className="fixed left-1/2 top-1 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-warn-bg px-2.5 py-1 text-[11px] font-semibold text-warn-ink shadow-pop ring-1 ring-warn"
        >
          Czas testowy: {now.toLocaleString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })} · wyłącz
        </a>
      )}

      <HowItWorksDialog open={howOpen} onOpenChange={setHowOpen} />
      <WarningsDialog open={warningsOpen} onOpenChange={setWarningsOpen} warnings={schedule.warnings} />
      <Toaster
        position={isDesktop ? 'bottom-right' : 'top-center'}
        toastOptions={{
          className: '!rounded-xl !border-raise !bg-hero !text-hero-ink !font-sans !text-sm !shadow-pop',
        }}
      />
    </AppProvider>
  );
}
