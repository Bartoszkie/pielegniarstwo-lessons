import * as Dialog from '@radix-ui/react-dialog';
import { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { ClassBlock } from '../../utils/blocks';
import { parseDate, WEEKDAYS_SHORT, weekdayIndex, MONTH_SHORT, pluralPl } from '../../utils/dateUtils';
import { GroupTags } from '../ui/GroupTag';
import { Return, Search } from '../ui/icons';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (block: ClassBlock) => void;
}

/** ⌘K search window over the whole plan (upcoming classes first). */
export function SearchDialog({ open, onOpenChange, onPick }: SearchDialogProps) {
  const { search, schedule } = useApp();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => search(query).slice(0, 50), [search, query]);
  const current = Math.min(active, Math.max(0, results.length - 1));

  const close = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setQuery('');
      setActive(0);
    }
  };

  const pick = (block: ClassBlock) => {
    onPick(block);
    close(false);
  };

  const scope = schedule.mode === 'student'
    ? `grupy ${[...schedule.selectedGroups].sort().join(', ') || 'brak'}`
    : pluralPl(schedule.selectedTeachers.size, 'wykładowca', 'wykładowców', 'wykładowców');

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-fade-in bg-[rgba(12,10,9,.32)]" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[88px] z-50 flex w-[min(640px,calc(100%-32px))] -translate-x-1/2 animate-pop-in flex-col overflow-hidden rounded-[20px] border border-raise bg-surface shadow-pop outline-none"
        >
          <Dialog.Title className="sr-only">Szukaj zajęć</Dialog.Title>
          <div className="flex h-16 items-center gap-3 border-b border-line pl-5 pr-4">
            <Search size={20} strokeWidth={2.2} className="shrink-0" />
            <input
              type="search"
              aria-label="Szukaj zajęć"
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(current + 1, results.length - 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(current - 1, 0)); }
                else if (e.key === 'Enter' && results[current]) { e.preventDefault(); pick(results[current]); }
              }}
              placeholder="Szukaj przedmiotu, sali lub wykładowcy"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-3"
            />
            <Dialog.Close className="h-7 shrink-0 rounded-[7px] border border-line bg-surface px-2 tabular-nums text-xs font-semibold text-ink-2 shadow-[0_1px_0_rgba(28,25,23,.08)]">
              Esc
            </Dialog.Close>
          </div>

          <div className="max-h-[440px] overflow-y-auto p-2">
            {!query.trim() ? (
              <p className="px-3 py-6 text-center text-sm text-ink-2">Wpisz nazwę przedmiotu, nazwisko prowadzącego albo numer sali.</p>
            ) : results.length === 0 ? (
              <div key={query} className="enter-quick flex flex-col items-center gap-1.5 px-3 py-8 text-center">
                <span className="text-[15px] font-semibold">Brak wyników dla „{query.trim()}”</span>
                <span className="text-sm text-ink-2">Spróbuj samego nazwiska albo numeru sali.</span>
              </div>
            ) : (
              // Keyed by the query, so each new set of results visibly fades in
              <div key={query}>
                <div className="enter-quick px-3 pb-1.5 pt-2 text-xs font-semibold text-ink-2">Najpierw najbliższe</div>
                {results.map((block, i) => {
                  const date = parseDate(block.date);
                  const meta = [block.event.online ? 'Online' : block.event.location, block.event.instructor].filter(Boolean).join(' · ');
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => pick(block)}
                      onMouseMove={() => current !== i && setActive(i)}
                      style={{ '--i': i + 1 } as React.CSSProperties}
                      className={`enter-quick flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left ${i === current ? 'bg-surface-2' : ''}`}
                    >
                      <span className="flex w-[104px] shrink-0 flex-col gap-0.5">
                        <span className="text-[13px] font-semibold">{WEEKDAYS_SHORT[weekdayIndex(date)]} {date.getDate()} {MONTH_SHORT[date.getMonth()]}</span>
                        <span className="tabular-nums text-xs text-ink-2">{block.start}–{block.end}</span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-[15px] font-semibold">{block.event.title}</span>
                        {meta && <span className="truncate text-[13px] text-ink-2">{meta}</span>}
                      </span>
                      <span className="flex shrink-0 gap-1"><GroupTags groups={block.groups} everyone={block.everyone} /></span>
                      <Return size={16} className={`shrink-0 text-ink-2 ${i === current ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-bg px-5 py-2.5 text-xs text-ink-2">
            <span>Cały plan · {scope}</span>
            <span className="flex items-center gap-3">
              <Kbd label="↑↓">wybierz</Kbd>
              <Kbd label="↵">otwórz</Kbd>
              <Kbd label="Esc">zamknij</Kbd>
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Kbd({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <kbd className="rounded border border-line-strong bg-surface px-1.5 py-px tabular-nums text-[11px]">{label}</kbd>
      {children}
    </span>
  );
}
