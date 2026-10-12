import * as Dialog from '@radix-ui/react-dialog';
import { useMemo, useState } from 'react';
import { MakeupFlow, useApp } from '../../app/AppContext';
import { ClassBlock } from '../../utils/blocks';
import { capitalize, classesLabel, DAY_NAMES_FULL, MONTH_SHORT, parseDate, shortDateLabel } from '../../utils/dateUtils';
import { normalizeForSearch } from '../../utils/eventUtils';
import { makeupOptions, makeupSubjects } from '../../utils/makeup';
import { GroupTag } from '../ui/GroupTag';
import { Check, ChevronLeft, ChevronRight, Close, Info, Redo, Search } from '../ui/icons';
import { KIND_SHORT, termsLabel, whenLabel } from './shared';

type SubjectFlow = Extract<MakeupFlow, { step: 'subject' }>;
type NumberFlow = Extract<MakeupFlow, { step: 'number' }>;

/**
 * Odrabianie, steps 1 and 2: which subject, then which class of it.
 * Full screen on a phone, a dialog on a computer.
 */
export function MakeupWizard() {
  const { makeupFlow, setMakeupFlow } = useApp();
  const open = makeupFlow?.step === 'subject' || makeupFlow?.step === 'number';

  return (
    <Dialog.Root open={open} onOpenChange={next => { if (!next) setMakeupFlow(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 hidden animate-fade-in bg-[rgba(12,10,9,.42)] lg:block" />
        <Dialog.Content
          aria-describedby={undefined}
          onOpenAutoFocus={e => {
            // On a computer, start typing straight away; on a phone, show the list before the keyboard
            if (window.matchMedia('(min-width: 1024px)').matches) {
              e.preventDefault();
              document.getElementById('makeup-subject')?.focus();
            }
          }}
          className="fixed inset-0 z-50 flex animate-pop-in flex-col bg-bg outline-none lg:inset-x-0 lg:bottom-auto lg:top-[7vh] lg:mx-auto lg:h-[min(780px,86dvh)] lg:w-[560px] lg:overflow-hidden lg:rounded-[24px] lg:border lg:border-raise lg:shadow-pop"
        >
          {makeupFlow?.step === 'subject' && <SubjectStep flow={makeupFlow} />}
          {makeupFlow?.step === 'number' && <NumberStep key={makeupFlow.key} flow={makeupFlow} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function WizardHeader({ step, onBack }: { step: 1 | 2; onBack?: () => void }) {
  return (
    <header className="grid shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center px-2 pt-[max(10px,env(safe-area-inset-top))] lg:pt-2.5">
      {onBack ? (
        <button type="button" aria-label="Wróć do wyboru zajęć" onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full active:bg-surface-2">
          <ChevronLeft size={22} strokeWidth={2.2} />
        </button>
      ) : <span />}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[13px] font-semibold leading-[18px]">Odrabianie · krok {step} z 2</span>
        <span role="progressbar" aria-label="Postęp" aria-valuemin={1} aria-valuemax={2} aria-valuenow={step} className="grid w-[72px] grid-cols-2 gap-1">
          <span className="h-1 rounded-full bg-ink" />
          <span className={`h-1 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-ink' : 'bg-line-strong'}`} />
        </span>
      </div>
      <Dialog.Close aria-label="Zamknij odrabianie" className="grid h-11 w-11 place-items-center rounded-full active:bg-surface-2">
        <Close size={20} strokeWidth={2.2} />
      </Dialog.Close>
    </header>
  );
}

function Dots({ total, done }: { total: number; done: number }) {
  if (total < 2 || total > 10) return null;
  return (
    <span aria-hidden="true" className="flex items-center gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i < done ? 'bg-ink-3' : 'border-[1.5px] border-ink-3'}`} />
      ))}
    </span>
  );
}

function isPast(block: ClassBlock, todayKey: string, nowMin: number): boolean {
  return block.date < todayKey || (block.date === todayKey && block.endMin <= nowMin);
}

function SubjectStep({ flow }: { flow: SubjectFlow }) {
  const { classIndex, schedule, setMakeupFlow, todayKey, now } = useApp();
  const [query, setQuery] = useState('');
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const subjects = useMemo(() => makeupSubjects(classIndex, flow.group), [classIndex, flow.group]);
  const groups = [...schedule.selectedGroups].sort();

  const q = normalizeForSearch(query.trim());
  const results = q ? subjects.filter(s => normalizeForSearch(s.title).includes(q)) : subjects;

  return (
    <>
      <WizardHeader step={1} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <div className="flex flex-col gap-2 px-5 pt-5">
          <Dialog.Title className="text-[32px] font-light leading-9 tracking-[-0.025em]">
            Jakie <span className="font-extrabold">ćwiczenia</span> chcesz <span className="font-serif text-[38px] italic tracking-normal">odrobić?</span>
          </Dialog.Title>
          <p className="text-[15px] leading-[21px] text-ink-2">Wpisz nazwę przedmiotu. Podpowiadamy tylko zajęcia z planu grupy {flow.group}.</p>
          {groups.length > 1 && (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[13px] text-ink-2">Odrabiasz jako</span>
              {groups.map(group => (
                <button
                  key={group}
                  type="button"
                  aria-pressed={group === flow.group}
                  onClick={() => setMakeupFlow({ step: 'subject', group })}
                  className={`flex h-9 items-center gap-1.5 rounded-full pl-1.5 pr-3 text-sm ${group === flow.group ? 'pressed font-semibold' : 'raised font-medium'}`}
                >
                  <GroupTag group={group} />
                  {group === flow.group && <Check size={14} strokeWidth={2.6} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sticky top-0 z-10 bg-bg px-4 pb-2.5 pt-4">
          <label className="relative block">
            <span className="sr-only">Nazwa przedmiotu</span>
            <Search size={20} strokeWidth={2.2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" />
            <input
              id="makeup-subject"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="np. dietetyka, migowy"
              autoComplete="off"
              className="h-[52px] w-full rounded-full border border-raise bg-surface pl-[46px] pr-4 text-[17px] font-medium text-ink shadow-raise outline-none transition-shadow placeholder:font-normal placeholder:text-ink-3 focus:shadow-[0_0_0_2px_rgb(var(--ink)),0_10px_24px_rgba(28,25,23,.1)]"
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 px-4 pt-1.5">
          <h2 className="px-1.5 text-[13px] font-semibold text-ink-2">{q ? 'Pasujące zajęcia' : `Zajęcia grupy ${flow.group}`}</h2>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 px-3 py-7 text-center">
              <p className="font-serif text-[26px] italic leading-[30px]">Nic takiego w planie {flow.group}</p>
              <p className="text-sm text-ink-2">Sprawdź pisownię albo wpisz krótszy fragment nazwy.</p>
            </div>
          ) : (
            <div key={q} className="overflow-hidden rounded-2xl border border-line bg-surface">
              {results.map((subject, i) => {
                const done = subject.list.filter(b => isPast(b, todayKey, nowMin)).length;
                const at = q ? normalizeForSearch(subject.title).indexOf(q) : -1;
                return (
                  <button
                    key={subject.key}
                    type="button"
                    onClick={() => setMakeupFlow({ step: 'number', group: flow.group, key: subject.key })}
                    style={{ '--i': i } as React.CSSProperties}
                    className="enter-quick relative grid min-h-16 w-full grid-cols-[minmax(0,1fr)_18px] items-center gap-x-3 py-2.5 pl-4 pr-3.5 text-left active:bg-surface-2"
                  >
                    {i > 0 && <span aria-hidden="true" className="absolute inset-x-4 top-0 h-px bg-line" />}
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-base font-medium leading-[21px] [overflow-wrap:anywhere]">
                        {at === -1 ? subject.title : (
                          <>
                            {subject.title.slice(0, at)}
                            <mark className="rounded bg-accent/15 font-extrabold text-ink shadow-[0_0_0_2px_rgb(var(--accent)/.15)]">{subject.title.slice(at, at + q.length)}</mark>
                            {subject.title.slice(at + q.length)}
                          </>
                        )}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-[18px] text-ink-2">
                        <span>{KIND_SHORT[subject.kind]}</span>
                        <Dots total={subject.list.length} done={done} />
                        <span>{classesLabel(subject.list.length)}{done ? ` · ${done} za Tobą` : ''}</span>
                      </span>
                    </span>
                    <ChevronRight size={18} strokeWidth={2.2} className="text-ink-3" />
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-1 flex gap-2 px-1.5 text-[13px] leading-[19px] text-ink-2">
            <Info size={16} className="mt-px shrink-0" />
            Wykładów tu nie ma: są wspólne dla wszystkich grup, więc nie da się ich odrobić z inną.
          </p>
        </div>
      </div>
    </>
  );
}

function NumberStep({ flow }: { flow: NumberFlow }) {
  const { classIndex, blocksByDate, setMakeupFlow, todayKey, now } = useApp();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const list = classIndex.get(flow.group)?.get(flow.key) ?? [];

  // Most likely the last class that already happened (the missed one), else the next one
  const [n, setN] = useState(() => {
    if (flow.n) return flow.n;
    let lastPast = -1;
    list.forEach((b, i) => { if (isPast(b, todayKey, nowMin)) lastPast = i; });
    return lastPast >= 0 ? lastPast + 1 : 1;
  });
  const options = useMemo(
    () => makeupOptions(classIndex, flow.group, flow.key, n, blocksByDate, todayKey, nowMin),
    [classIndex, flow.group, flow.key, n, blocksByDate, todayKey, nowMin],
  );
  const free = options.filter(o => o.clashes.length === 0).length;
  const own = list[n - 1];
  const [title, kind] = flow.key.split('|');
  const backToSubjects = () => setMakeupFlow({ step: 'subject', group: flow.group });

  return (
    <>
      <WizardHeader step={2} onBack={backToSubjects} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6 pt-4">
        <button
          type="button"
          onClick={backToSubjects}
          aria-label={`Wybrane: ${title}, ${KIND_SHORT[kind]}. Zmień`}
          className="flex min-h-[52px] items-center gap-2.5 rounded-2xl border border-line bg-surface py-2 pl-3.5 pr-2 text-left"
        >
          <Check size={18} strokeWidth={2.4} className="shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-base font-bold leading-[21px] [overflow-wrap:anywhere]">{title}</span>
            <span className="text-[13px] leading-[18px] text-ink-2">{KIND_SHORT[kind]} · {classesLabel(list.length)} w planie {flow.group}</span>
          </span>
          <span className="px-2.5 text-sm font-semibold">Zmień</span>
        </button>

        <div className="flex flex-col gap-2 px-1">
          <Dialog.Title className="text-[32px] font-light leading-9 tracking-[-0.025em]">
            Które to <span className="font-extrabold">zajęcia</span> <span className="font-serif text-[38px] italic tracking-normal">z kolei?</span>
          </Dialog.Title>
          <p className="text-[15px] leading-[21px] text-ink-2">Grupy przerabiają materiał w tej samej kolejności, więc szukamy zajęć o tym samym numerze.</p>
        </div>

        <div role="radiogroup" aria-label="Numer zajęć" className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5">
          {list.map((block, i) => {
            const selected = i + 1 === n;
            const past = isPast(block, todayKey, nowMin);
            return (
              <button
                key={block.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Zajęcia ${i + 1} z ${list.length}: ${DAY_NAMES_FULL[parseDate(block.date).getDay()]} ${parseDate(block.date).getDate()} ${MONTH_SHORT[parseDate(block.date).getMonth()]}, ${block.start}${past ? ', odbyły się' : ''}`}
                onClick={() => setN(i + 1)}
                className={`relative flex min-h-[124px] flex-col items-start justify-end gap-0.5 rounded-[18px] p-3 text-left ${
                  selected ? 'pressed shadow-[var(--shadow-press),0_0_0_2px_rgb(var(--ink))]' : 'raised'
                }`}
              >
                {selected && (
                  <span aria-hidden="true" className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-bg">
                    <Check size={12} strokeWidth={3.2} />
                  </span>
                )}
                <span className={`text-[44px] font-extrabold leading-[46px] tracking-[-0.03em] tabular-nums ${past && !selected ? 'text-ink-2' : ''}`}>{i + 1}</span>
                <span className="text-sm font-semibold leading-[18px]">{shortDateLabel(parseDate(block.date))}</span>
                <span className="text-xs leading-4 text-ink-2">{whenLabel(block.date, todayKey)}</span>
              </button>
            );
          })}
        </div>

        {own && (
          <dl aria-live="polite" className="flex flex-col rounded-2xl border border-line bg-surface">
            <div className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-x-3 px-3.5 py-3">
              <GroupTag group={flow.group} size="sm" />
              <div className="flex flex-col">
                <dt className="text-xs text-ink-2">Twój termin</dt>
                <dd className="text-[15px] font-semibold leading-[21px]">
                  {capitalize(DAY_NAMES_FULL[parseDate(own.date).getDay()])} {parseDate(own.date).getDate()} {MONTH_SHORT[parseDate(own.date).getMonth()]}, {own.start}–{own.end}
                </dd>
              </div>
            </div>
            <div className="mx-3.5 h-px bg-line" />
            <div className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-x-3 px-3.5 py-3">
              <Redo size={20} className="justify-self-center text-ink-2" />
              <div className="flex flex-col">
                <dt className="text-xs text-ink-2">W innych grupach</dt>
                <dd className="text-[15px] font-semibold leading-[21px]">
                  {options.length === 0 ? 'Nie ma już takich zajęć' : `${termsLabel(options.length)}, bez kolizji: ${free}`}
                </dd>
              </div>
            </div>
          </dl>
        )}
      </div>

      <div className="shrink-0 border-t border-line bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => setMakeupFlow({ step: 'results', group: flow.group, key: flow.key, n })}
          className="h-[52px] w-full rounded-[14px] bg-ink text-base font-semibold text-bg transition-transform active:scale-[.98]"
        >
          Pokaż terminy zajęć nr {n}
        </button>
      </div>
    </>
  );
}
