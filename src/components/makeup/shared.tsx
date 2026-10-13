import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { MakeupFlow, useApp } from '../../app/AppContext';
import { ClassBlock } from '../../utils/blocks';
import { daysBetween, parseDate, shortDateLabel } from '../../utils/dateUtils';
import { createSavedMakeup, makeupOptions, MakeupOption } from '../../utils/makeup';
import { ChevronRight, Close, Redo } from '../ui/icons';

type ResultsFlow = Extract<MakeupFlow, { step: 'results' }>;

export const KIND_SHORT: Record<string, string> = {
  lecture: 'wykład',
  exercise: 'ćwiczenia',
  simulation: 'symulacje',
  other: 'zajęcia',
  info: '',
};

export function termsLabel(count: number): string {
  if (count === 1) return '1 termin';
  const ten = count % 10;
  const hundred = count % 100;
  return ten >= 2 && ten <= 4 && (hundred < 12 || hundred > 14) ? `${count} terminy` : `${count} terminów`;
}

/** "dziś", "jutro", "za 5 dni", "za 7 tyg." or, for the past, "odbyły się" */
export function whenLabel(date: string, todayKey: string): string {
  const days = daysBetween(parseDate(todayKey), parseDate(date));
  if (days < 0) return 'odbyły się';
  if (days === 0) return 'dziś';
  if (days === 1) return 'jutro';
  if (days < 14) return `za ${days} dni`;
  return `za ${Math.round(days / 7)} tyg.`;
}

export interface MakeupResults {
  title: string;
  kind: ClassBlock['kind'];
  /** The subject's classes in the student's group */
  list: ClassBlock[];
  /** The student's own class being made up */
  own: ClassBlock | null;
  options: MakeupOption[];
  /** Soonest date with no clash */
  best: MakeupOption | null;
  free: number;
  /** Id of the option already in the student's plan, if any */
  chosenId: string | null;
}

export function useMakeupResults(flow: ResultsFlow): MakeupResults {
  const { classIndex, blocksByDate, todayKey, now, makeups } = useApp();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return useMemo(() => {
    const list = classIndex.get(flow.group)?.get(flow.key) ?? [];
    const own = list[flow.n - 1] ?? null;
    const options = makeupOptions(classIndex, flow.group, flow.key, flow.n, blocksByDate, todayKey, nowMin);
    const best = options.find(o => o.clashes.length === 0) ?? null;
    const saved = makeups.find(m => m.group === flow.group && m.key === flow.key && m.n === flow.n);
    const chosen = saved && options.find(o => o.block.date === saved.date && o.block.start === saved.start);
    const [title, kind] = flow.key.split('|');
    return {
      title,
      kind: kind as ClassBlock['kind'],
      list,
      own,
      options,
      best,
      free: options.filter(o => o.clashes.length === 0).length,
      chosenId: chosen ? chosen.id : null,
    };
  }, [classIndex, blocksByDate, todayKey, nowMin, makeups, flow]);
}

export type OptionStatus = 'chosen' | 'best' | 'free' | 'clash';

export function optionStatus(option: MakeupOption, results: MakeupResults): OptionStatus {
  if (option.id === results.chosenId) return 'chosen';
  if (option.clashes.length) return 'clash';
  return option === results.best ? 'best' : 'free';
}

/** "Wszystkie / Bez kolizji" chips, shared by the phone and desktop results */
export function useOptionFilter(results: MakeupResults) {
  const [onlyFree, setOnlyFree] = useState(false);
  const shown = onlyFree ? results.options.filter(o => o.clashes.length === 0) : results.options;
  const chips = (
    <div className="flex gap-2">
      {[false, true].map(free => {
        const selected = onlyFree === free;
        return (
          <button
            key={String(free)}
            type="button"
            aria-pressed={selected}
            onClick={() => setOnlyFree(free)}
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm ${selected ? 'pressed font-semibold' : 'raised font-medium'}`}
          >
            {free ? 'Bez kolizji' : 'Wszystkie'}
            <span className="tabular-nums text-xs font-medium text-ink-2">{free ? results.free : results.options.length}</span>
          </button>
        );
      })}
    </div>
  );
  return { shown, chips };
}

/** The dark bar on top of the results: what is being made up, change it, or finish */
export function MakeupBar({ flow, results, wide = false }: { flow: ResultsFlow; results: MakeupResults; wide?: boolean }) {
  const { setMakeupFlow } = useApp();
  const change = () => setMakeupFlow({ step: 'number', group: flow.group, key: flow.key, n: flow.n });
  const own = results.own;
  const ownLabel = own ? `Twój termin: ${shortDateLabel(parseDate(own.date))}, ${own.start}` : '';
  const kicker = wide ? `Odrabiasz${own ? ` · ${ownLabel} (${flow.group})` : ''}` : ownLabel || 'Odrabiasz';
  const subject = (
    <span className="flex min-w-0 flex-col text-left">
      <span className="truncate text-xs leading-4 text-hero-ink/75">{kicker}</span>
      <span className={`truncate font-bold ${wide ? 'text-lg leading-6' : 'text-base leading-[21px]'}`}>
        {results.title} · {KIND_SHORT[results.kind]} <span className="font-serif text-[1.2em] font-normal italic">nr</span> {flow.n}
      </span>
    </span>
  );

  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-hero bg-[linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,0)_60%)] py-2.5 pl-2.5 pr-2 text-hero-ink shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_8px_20px_-10px_rgba(28,25,23,.6)]">
      <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.12]">
        <Redo size={20} strokeWidth={2.1} />
      </span>
      {wide ? (
        <span className="min-w-0 flex-1">{subject}</span>
      ) : (
        <button type="button" onClick={change} aria-label={`${results.title}, zajęcia nr ${flow.n}. Zmień`} className="min-w-0 flex-1">
          {subject}
        </button>
      )}
      {wide && (
        <button type="button" onClick={change} className="h-9 shrink-0 rounded-full bg-white/[.14] px-3.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,.14)] active:bg-white/25">
          Zmień
        </button>
      )}
      <button
        type="button"
        aria-label="Zakończ odrabianie"
        onClick={() => setMakeupFlow(null)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[.14] shadow-[inset_0_1px_0_rgba(255,255,255,.14)] active:bg-white/25"
      >
        <Close size={16} strokeWidth={2.6} />
      </button>
    </div>
  );
}

/** No other group has this class ahead: say so and offer a way out */
export function NoOptions({ results, flow }: { results: MakeupResults; flow: ResultsFlow }) {
  const { setMakeupFlow } = useApp();
  return (
    <div className="enter flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-6 py-8 text-center">
      <p className="font-serif text-[28px] italic leading-8 [text-wrap:balance]">Brak terminów w innych grupach</p>
      <p className="max-w-[340px] text-sm leading-5 text-ink-2">
        Pozostałe grupy miały już zajęcia nr {flow.n} z przedmiotu {results.title} albo plan ich nie przewiduje. Zapytaj prowadzącą o inny termin.
      </p>
      <button
        type="button"
        onClick={() => setMakeupFlow({ step: 'subject', group: flow.group })}
        className="raised mt-2 flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold"
      >
        Wybierz inne zajęcia
        <ChevronRight size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}

/** The date the student picked from the results; starts on the soonest one with no clash */
export function useOptionSelection(results: MakeupResults, shown: MakeupOption[]) {
  const [selectedId, setSelectedId] = useState<string | null>(() => results.best?.id ?? null);
  // A filter can hide the picked date: then nothing is picked
  const selected = shown.find(o => o.id === selectedId) ?? null;
  return { selected, select: (option: MakeupOption) => setSelectedId(option.id) };
}

/** Adds the picked date to the plan and goes back to it, on the month view at that day */
export function useConfirmMakeup(flow: ResultsFlow, results: MakeupResults) {
  const { calendar, makeups, addMakeup, removeMakeup, setMakeupFlow } = useApp();
  const previous = makeups.find(m => m.group === flow.group && m.key === flow.key && m.n === flow.n) ?? null;

  const confirm = (option: MakeupOption) => {
    if (!results.own) return;
    const saved = createSavedMakeup(option, flow.group, flow.key, flow.n, results.list.length, results.own);
    const date = parseDate(option.block.date);
    addMakeup(saved);
    setMakeupFlow(null);
    calendar.setView('month');
    calendar.setCursor(date);
    window.scrollTo({ top: 0 });
    toast.success('Dodano do Twojego planu', {
      description: `${results.title} nr ${flow.n} · ${shortDateLabel(date)}, ${option.block.start}`,
      action: { label: 'Cofnij', onClick: () => removeMakeup(saved.id) },
    });
  };

  const remove = () => {
    if (!previous) return;
    removeMakeup(previous.id);
    toast.success('Usunięto odrabianie z Twojego planu.');
  };

  return { confirm, remove, previous };
}

/** Status line for the picked date, under its title */
export function pickedNote(option: MakeupOption, previousDate: string | null): string {
  if (option.clashes.length) return `Koliduje z: ${option.clashes.map(c => `${c.event.title}, ${c.start}–${c.end}`).join('; ')}`;
  const place = option.block.event.location || (option.block.mode === 'online' ? 'online' : '');
  return ['Bez kolizji', place, previousDate ? `zastąpi ${previousDate}` : ''].filter(Boolean).join(' · ');
}
