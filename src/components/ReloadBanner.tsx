import { useApp } from '../app/AppContext';
import { FileUp, Info } from './ui/icons';

/** Shown while the saved plan was read by an older version that missed shared lectures and breaks. */
export function ReloadBanner() {
  const { schedule, openFilePicker } = useApp();
  if (!schedule.needsReload) return null;
  return (
    <div role="status" className="enter flex items-start gap-3 rounded-2xl border border-warn/40 bg-warn-bg p-3.5 text-warn-ink">
      <Info size={18} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <p className="text-sm leading-5">
          <span className="font-semibold">Wczytaj plik z planem jeszcze raz.</span> Aplikacja czyta go teraz dokładniej:
          pokaże wykłady online wspólne dla wszystkich grup oraz przerwy i sesję.
        </p>
        <button type="button" onClick={openFilePicker} className="raised inline-flex h-10 items-center gap-2 self-start rounded-xl px-3.5 text-sm font-semibold text-ink">
          <FileUp size={16} />
          Wczytaj plik
        </button>
      </div>
    </div>
  );
}
