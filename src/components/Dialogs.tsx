import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import { ParseWarning } from '../types';
import { Close, ExternalLink } from './ui/icons';

const GUIDE_URL = 'https://github.com/Bartoszkie/pielegniarstwo-lessons/blob/main/README.md';

function Sheet({ open, onOpenChange, title, subtitle, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-[rgba(12,10,9,.42)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-h-[85dvh] max-w-[480px] animate-pop-in flex-col overflow-hidden rounded-[20px] border border-raise bg-surface shadow-pop outline-none sm:inset-x-0 sm:bottom-auto sm:top-[12vh]"
        >
          <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-5">
            <div>
              <Dialog.Title className="text-[22px] font-bold leading-7 tracking-[-0.015em]">{title}</Dialog.Title>
              {subtitle && <p className="mt-1 text-sm text-ink-2">{subtitle}</p>}
            </div>
            <Dialog.Close aria-label="Zamknij" className="-mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-2 hover:bg-surface-2">
              <Close size={20} />
            </Dialog.Close>
          </div>
          <div className="min-h-0 overflow-y-auto px-6 pb-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function HowItWorksDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const steps = [
    { title: 'Pobierz plan zajęć', text: 'Pobierz plik Excel z planem ze strony uczelni.' },
    { title: 'Wczytaj plik', text: 'Wybierz go w aplikacji. Nowszą wersję wczytasz z menu ⋮ albo z panelu „Plan wczytany”.' },
    { title: 'Zaznacz grupę', text: 'Wybierz swoją grupę lub wykładowców. Aplikacja zapamięta wybór.' },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Jak to działa?" subtitle="3 proste kroki">
      <ol className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
            <span className="pressed grid h-7 w-7 place-items-center rounded-full tabular-nums text-[13px] font-semibold">{index + 1}</span>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <span className="text-[15px] font-semibold">{step.title}</span>
              <span className="text-sm leading-5 text-ink-2">{step.text}</span>
            </div>
          </li>
        ))}
      </ol>
      <a
        href={GUIDE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="raised mt-5 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold"
      >
        Szczegółowa instrukcja ze zdjęciami
        <ExternalLink size={16} />
      </a>
      <Dialog.Close className="mt-2.5 h-12 w-full rounded-[14px] bg-ink text-[15px] font-semibold text-bg">Rozumiem</Dialog.Close>
    </Sheet>
  );
}

export function WarningsDialog({ open, onOpenChange, warnings }: { open: boolean; onOpenChange: (open: boolean) => void; warnings: ParseWarning[] }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Uwagi do pliku" subtitle="Te wiersze arkusza zostały pominięte. Reszta planu wczytała się poprawnie.">
      <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
        {warnings.map(w => (
          <li key={`${w.row}-${w.message}`} className="flex gap-3 px-3.5 py-2.5 text-sm">
            <span className="w-16 shrink-0 tabular-nums text-ink-2">wiersz {w.row}</span>
            <span>{w.message}</span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
