import { useState } from 'react';
import { useApp } from '../app/AppContext';
import { FileCheck, Info } from './ui/icons';
import { AppLogo } from './ui/AppLogo';

const GUIDE_URL = 'https://github.com/Bartoszkie/pielegniarstwo-lessons/blob/main/README.md';

const STEPS = [
  {
    title: 'Pobierz plik z planem',
    text: 'Arkusz Excel ze strony wydziału, zakładka „Plan zajęć”.',
    link: true,
  },
  { title: 'Wybierz go poniżej', text: 'Plik zostaje na tym urządzeniu. Nic nie jest wysyłane.' },
  { title: 'Zaznacz swoją grupę', text: 'Wybór zostanie zapamiętany, a plan działa też bez internetu.' },
];

/** First run: what to do, and the file picker. */
export function Onboarding() {
  const { schedule, openFilePicker, handleFile } = useApp();
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[440px] flex-col gap-7 px-5 pb-8 pt-[max(40px,env(safe-area-inset-top))]">
      <header className="flex flex-col gap-3.5">
        <AppLogo size={44} />
        <div className="flex flex-col gap-1">
          <h1 className="text-[34px] font-extrabold leading-[38px] tracking-[-0.03em]">Plan zajęć</h1>
          <p className="font-serif text-[30px] italic leading-8 text-ink-2">Pielęgniarstwo</p>
        </div>
        <p className="text-base leading-6 text-ink-2">
          Wczytaj arkusz z planem z uczelni. Zobaczysz tylko swoje zajęcia, dzień po dniu.
        </p>
      </header>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
            <span className="pressed grid h-7 w-7 place-items-center rounded-full tabular-nums text-[13px] font-semibold">{index + 1}</span>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-[15px] font-semibold leading-[21px]">{step.title}</span>
              <span className="text-sm leading-5 text-ink-2">
                {step.text}{' '}
                {step.link && (
                  <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">
                    Instrukcja ze zdjęciami
                  </a>
                )}
              </span>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3">
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`flex flex-col items-center gap-3.5 rounded-[18px] border-[1.5px] border-dashed bg-surface p-5 transition-colors ${
            dragOver ? 'border-ink' : 'border-line-strong'
          }`}
        >
          {schedule.isLoading ? (
            <div className="flex w-full flex-col items-center gap-3 py-1.5" role="status">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin">
                <circle cx="12" cy="12" r="9" stroke="rgb(var(--line))" strokeWidth="2.5" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-[15px] font-semibold">Przetwarzanie pliku…</span>
            </div>
          ) : (
            <>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-bg">
                <FileCheck size={22} />
              </div>
              <button type="button" onClick={openFilePicker} className="h-[52px] w-full rounded-[14px] bg-ink text-base font-semibold text-bg">
                Wybierz plik Excel
              </button>
              <span className="text-[13px] text-ink-2">
                Obsługiwane formaty: .xls, .xlsx<span className="hidden lg:inline"> · możesz też przeciągnąć plik tutaj</span>
              </span>
            </>
          )}
        </div>

        {schedule.error && (
          <div role="alert" className="flex gap-2.5 rounded-[14px] bg-danger-bg px-4 py-3.5 text-danger-ink">
            <Info size={18} className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">Nie udało się odczytać pliku</span>
              <span className="text-sm">{schedule.error}</span>
            </div>
          </div>
        )}
      </div>

      <p className="mt-auto text-center text-[13px] leading-[19px] text-ink-2">
        Dodaj aplikację do ekranu głównego, żeby mieć plan zawsze pod ręką.{' '}
        <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">Jak to zrobić?</a>
      </p>
    </div>
  );
}
