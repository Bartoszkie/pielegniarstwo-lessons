import { useState } from 'react';
import { useApp } from '../../app/AppContext';
import { formatTimestamp, pluralPl } from '../../utils/dateUtils';
import { ChevronUp, FileUp, Info } from '../ui/icons';

/** Collapsible "Plan wczytany" box; an orange dot flags rows the parser skipped. */
export function FilePanel() {
  const { schedule, openFilePicker, openWarnings, handleFile } = useApp();
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const hasWarnings = schedule.warnings.length > 0;

  return (
    <div className="relative flex flex-col rounded-xl border border-raise bg-raised shadow-raise">
      {hasWarnings && (
        <span role="img" aria-label="Plik ma uwagi" className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-warn shadow-[0_0_0_2px_rgb(var(--surface)),0_1px_3px_rgba(28,25,23,.3)]" />
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="file-panel"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 rounded-xl py-3 pl-3.5 pr-3 text-left"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-semibold leading-[18px]">Plan wczytany</span>
          <span className="font-mono text-xs leading-4 text-ink-2">
            {schedule.lastUpdated ? formatTimestamp(schedule.lastUpdated) : '—'}
          </span>
        </span>
        <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2">
          <ChevronUp size={16} strokeWidth={2.2} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && (
        <div id="file-panel" className="flex animate-fade-in flex-col gap-2.5 px-3 pb-3">
          {hasWarnings && (
            <div className="flex items-start gap-2 rounded-[9px] bg-warn-bg px-2.5 py-2 text-[13px] leading-[18px] text-warn-ink">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                {pluralPl(schedule.warnings.length, 'wiersz pominięty', 'wiersze pominięte', 'wierszy pominiętych')}.{' '}
                <button type="button" onClick={openWarnings} className="font-semibold underline underline-offset-2">Szczegóły</button>
              </span>
            </div>
          )}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`flex flex-col items-center gap-2 rounded-[10px] border-[1.5px] border-dashed px-2.5 py-3.5 text-center transition-colors ${
              dragOver ? 'border-ink bg-surface-2' : 'border-line-strong bg-bg'
            }`}
          >
            <FileUp size={20} className="text-ink-2" />
            <span className="text-xs leading-4 text-ink-2">Przeciągnij nowy plik .xls lub .xlsx</span>
            <button
              type="button"
              disabled={schedule.isLoading}
              onClick={openFilePicker}
              className="h-[34px] rounded-[9px] bg-ink px-3.5 text-[13px] font-semibold text-bg disabled:opacity-60"
            >
              {schedule.isLoading ? 'Wczytywanie…' : 'Wybierz plik…'}
            </button>
          </div>
          <span className="text-xs leading-4 text-ink-2">Nowy plik zastąpi obecny plan. Wybrane grupy zostaną zachowane.</span>
        </div>
      )}
    </div>
  );
}
