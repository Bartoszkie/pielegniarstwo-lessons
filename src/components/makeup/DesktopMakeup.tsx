import { useEffect } from 'react';
import { MakeupFlow, useApp } from '../../app/AppContext';
import { ClassBlock, isAttended, layoutLanes, subjectKey } from '../../utils/blocks';
import { addDays, formatDate, getMonthDays, getMonthLabel, getWeekLabel, isSameMonth, parseDate, shortDateLabel, WEEKDAYS_SHORT } from '../../utils/dateUtils';
import { getGroupColor } from '../../constants/groupColors';
import { MakeupOption } from '../../utils/makeup';
import { DisplayTitle } from '../ui/DisplayTitle';
import { GroupTags } from '../ui/GroupTag';
import { Check, ChevronRight, Warning } from '../ui/icons';
import { PeriodNav } from '../desktop/PeriodNav';
import {
  KIND_SHORT, MakeupBar, MakeupResults, NoOptions, optionStatus, OptionStatus, pickedNote, termsLabel,
  useConfirmMakeup, useMakeupResults, useOptionFilter, useOptionSelection, whenLabel,
} from './shared';

type ResultsFlow = Extract<MakeupFlow, { step: 'results' }>;

interface Picking {
  selected: MakeupOption | null;
  select: (option: MakeupOption) => void;
}

const HOUR_PX = 56;

const STATUS_TEXT: Record<OptionStatus, string> = {
  chosen: 'w Twoim planie',
  best: 'najbliższy wolny',
  free: 'bez kolizji',
  clash: 'kolizja',
};

/** Desktop: the other groups' dates in the week or month grid, over the student's own plan, and all of them in a list */
export function DesktopMakeup({ flow }: { flow: ResultsFlow }) {
  const { calendar } = useApp();
  const results = useMakeupResults(flow);
  const { shown, chips } = useOptionFilter(results);
  const { selected, select } = useOptionSelection(results, shown);
  const { confirm, remove, previous } = useConfirmMakeup(flow, results);
  const picking = { selected, select };

  // Open on the soonest date that fits, else the first one (this view is remounted per class)
  useEffect(() => {
    const target = results.best ?? results.options[0];
    if (target) calendar.setCursor(parseDate(target.block.date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const previousDate = previous && selected && !(previous.date === selected.block.date && previous.start === selected.block.start)
    ? `${shortDateLabel(parseDate(previous.date))}, ${previous.start}`
    : null;

  const isWeek = calendar.view === 'week';
  const title = isWeek ? getWeekLabel(calendar.weekStart) : getMonthLabel(calendar.cursor);
  const hasOptions = results.options.length > 0;

  return (
    <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-7 pb-8 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 key={title} className="enter-quick text-[28px] leading-8 tracking-[-0.02em]"><DisplayTitle text={title} /></h1>
          <p className="text-sm text-ink-2">
            {hasOptions ? `${termsLabel(results.options.length)} w innych grupach · bez kolizji: ${results.free}` : 'Brak terminów w innych grupach'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PeriodNav />
        </div>
      </div>

      <MakeupBar flow={flow} results={results} wide />

      {!hasOptions ? (
        <NoOptions results={results} flow={flow} />
      ) : (
        <>
          {chips}
          <div className="flex flex-wrap items-start gap-5">
            <div className="min-w-0 flex-[3_1_560px]">
              {isWeek
                ? <WeekOptionsGrid key={title} results={results} shown={shown} flow={flow} picking={picking} />
                : <MonthOptionsGrid key={title} results={results} shown={shown} flow={flow} picking={picking} />}
            </div>
            <OptionsList results={results} shown={shown} picking={picking} />
          </div>
          <ConfirmBar selected={selected} results={results} previousDate={previousDate} onConfirm={confirm} onRemove={remove} />
        </>
      )}
    </main>
  );
}

type Item =
  | { type: 'plan'; block: ClassBlock }
  | { type: 'own'; block: ClassBlock }
  | { type: 'option'; block: ClassBlock; option: MakeupOption };

function ConfirmBar({ selected, results, previousDate, onConfirm, onRemove }: {
  selected: MakeupOption | null;
  results: MakeupResults;
  previousDate: string | null;
  onConfirm: (option: MakeupOption) => void;
  onRemove: () => void;
}) {
  const chosen = !!selected && selected.id === results.chosenId;
  return (
    <div
      role="region"
      aria-label="Wybrany termin"
      className="sticky bottom-4 z-10 mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[18px] border border-raise bg-surface py-3 pl-4 pr-3 shadow-[0_18px_40px_-12px_rgba(28,25,23,.3),0_2px_6px_rgba(28,25,23,.08)]"
    >
      {selected ? (
        <>
          <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-bg"><Check size={14} strokeWidth={3.2} /></span>
          <span className="flex min-w-0 flex-[1_1_260px] flex-col" aria-live="polite">
            <span className="text-xs leading-4 text-ink-2">{chosen ? 'Już w Twoim planie' : 'Wybrany termin'}</span>
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="text-[17px] font-bold leading-6">{shortDateLabel(parseDate(selected.block.date))}, {selected.block.start}–{selected.block.end}</span>
              <span className="flex gap-[3px]"><GroupTags groups={selected.block.groups} size="sm" /></span>
              <span className={`text-[13px] font-semibold leading-[18px] ${selected.clashes.length ? 'text-warn-ink' : 'text-ink-2'}`}>{pickedNote(selected, previousDate)}</span>
            </span>
          </span>
          {chosen ? (
            <button type="button" onClick={onRemove} className="raised h-12 rounded-[14px] px-5 text-[15px] font-semibold">Usuń z mojego planu</button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirm(selected)}
              className="flex h-12 items-center gap-2 rounded-[14px] bg-ink px-[22px] text-[15px] font-semibold text-bg shadow-[0_1px_2px_rgba(28,25,23,.2),0_8px_18px_-8px_rgba(28,25,23,.55)] transition-transform active:scale-[.98]"
            >
              Potwierdź termin
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          )}
        </>
      ) : (
        <>
          <span aria-hidden="true" className="h-7 w-7 shrink-0 rounded-full border-2 border-dashed border-ink-3" />
          <span className="flex min-w-0 flex-[1_1_260px] flex-col">
            <span className="text-[17px] font-bold leading-6">Wybierz termin</span>
            <span className="text-[13px] text-ink-2">Kliknij zajęcia innej grupy w kalendarzu albo na liście.</span>
          </span>
          <button type="button" disabled className="h-12 cursor-not-allowed rounded-[14px] bg-surface-2 px-[22px] text-[15px] font-semibold text-ink-2">Potwierdź termin</button>
        </>
      )}
    </div>
  );
}

function WeekOptionsGrid({ results, shown, flow, picking }: { results: MakeupResults; shown: MakeupOption[]; flow: ResultsFlow; picking: Picking }) {
  const { calendar, blocksByDate, todayKey } = useApp();
  const days = Array.from({ length: 7 }, (_, i) => addDays(calendar.weekStart, i));
  const keys = days.map(formatDate);
  const own = results.own;

  const itemsByDay = keys.map(key => {
    const items = new Map<string, Item>();
    for (const block of blocksByDate[key] ?? []) {
      if (!isAttended(block)) continue;
      // The class being made up shows as the dashed "own" block instead
      if (own && key === own.date && subjectKey(block) === flow.key && block.start === own.start) continue;
      items.set(block.id, { type: 'plan', block });
    }
    if (own && own.date === key) items.set(`own|${own.id}`, { type: 'own', block: { ...own, id: `own|${own.id}` } });
    for (const option of shown) {
      if (option.block.date === key) items.set(option.block.id, { type: 'option', block: option.block, option });
    }
    return items;
  });

  const all = itemsByDay.flatMap(items => [...items.values()].map(i => i.block));
  let fromHour = 8;
  let toHour = 16;
  if (all.length) {
    fromHour = Math.min(8, Math.floor(Math.min(...all.map(b => b.startMin)) / 60));
    toHour = Math.max(16, Math.ceil(Math.max(...all.map(b => b.endMin)) / 60));
  }
  const hours = Array.from({ length: toHour - fromHour + 1 }, (_, i) => fromHour + i);
  const gridHeight = (toHour - fromHour) * HOUR_PX;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <div className="min-w-[680px]">
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-line">
          <div />
          {days.map((date, i) => {
            const key = keys[i];
            const count = shown.filter(o => o.block.date === key).length;
            return (
              <div key={key} className="flex min-h-[56px] flex-col justify-center gap-0.5 border-l border-line px-2.5 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-ink-2">{WEEKDAYS_SHORT[i]}</span>
                  <span className={`inline-grid h-[30px] min-w-[30px] place-items-center rounded-full text-[17px] font-semibold ${key === todayKey ? 'bg-ink text-bg' : count ? '' : 'text-ink-3'}`}>
                    {date.getDate()}
                  </span>
                </div>
                {count > 0 && <span className="text-[11px] font-semibold leading-4 text-ink-2">{termsLabel(count)}</span>}
              </div>
            );
          })}
        </div>

        <div className="relative pb-4 pt-3">
          <div className="relative grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map(h => (
                <span key={h} className="absolute right-2 -translate-y-1/2 tabular-nums text-xs text-ink-2" style={{ top: (h - fromHour) * HOUR_PX }}>
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
            </div>
            {hours.map(h => (
              <div key={h} aria-hidden="true" className="absolute left-14 right-0 h-px bg-surface-2" style={{ top: (h - fromHour) * HOUR_PX }} />
            ))}
            {itemsByDay.map((items, i) => {
              const byId = items;
              return (
                <div key={keys[i]} className="relative border-l border-line" style={{ height: gridHeight }}>
                  {layoutLanes([...items.values()].map(item => item.block)).map(({ block, lane, lanes }) => {
                    const item = byId.get(block.id)!;
                    const style: React.CSSProperties = {
                      top: ((block.startMin - fromHour * 60) / 60) * HOUR_PX + 2,
                      height: Math.max(24, ((block.endMin - block.startMin) / 60) * HOUR_PX - 4),
                      left: `calc(${(lane * 100) / lanes}% + 3px)`,
                      width: `calc(${100 / lanes}% - 6px)`,
                    };
                    Object.assign(style, { '--i': i });
                    return <GridItem key={block.id} item={item} style={style} results={results} flow={flow} picking={picking} />;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function GridItem({ item, style, results, flow, picking }: { item: Item; style: React.CSSProperties; results: MakeupResults; flow: ResultsFlow; picking: Picking }) {
  const { block } = item;

  if (item.type === 'plan') {
    return (
      <div
        aria-label={`Twój plan: ${block.event.title}, ${block.start}–${block.end}`}
        role="img"
        className="enter absolute flex flex-col gap-0.5 overflow-hidden rounded-[10px] border border-line bg-surface-2 px-2 py-1.5"
        style={style}
      >
        <span className="tabular-nums text-[11px] leading-[14px] text-ink-3">{block.start}–{block.end}</span>
        <span className="line-clamp-2 text-xs font-semibold leading-4 text-ink-2">{block.event.title}</span>
        <span className="mt-auto text-[10px] font-bold uppercase tracking-[.04em] text-ink-3">Twój plan</span>
      </div>
    );
  }

  if (item.type === 'own') {
    return (
      <div
        aria-label={`Twój termin zajęć nr ${flow.n}, ${block.start}–${block.end}`}
        role="img"
        className="enter absolute flex flex-col gap-0.5 overflow-hidden rounded-[10px] border-[1.5px] border-dashed border-ink-3 px-2 py-1.5"
        style={{ ...style, background: 'repeating-linear-gradient(135deg, rgb(var(--bg)) 0 6px, rgb(var(--surface-2)) 6px 12px)' }}
      >
        <span className="text-xs font-bold leading-4 text-ink-2">Twój termin ({flow.group})</span>
        <span className="tabular-nums text-[11px] leading-[14px] text-ink-2">{block.start}–{block.end}</span>
        <span className="mt-auto text-[11px] font-semibold text-ink-2">odrabiasz</span>
      </div>
    );
  }

  const status = optionStatus(item.option, results);
  const color = getGroupColor(block.groups[0]);
  const selected = picking.selected?.id === item.option.id;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => picking.select(item.option)}
      aria-label={`${block.start}–${block.end}, grupy ${block.groups.join(', ')}, ${STATUS_TEXT[status]}`}
      className="enter absolute flex flex-col items-start gap-[3px] overflow-hidden rounded-[10px] px-2 pb-1.5 pt-2 text-left transition-transform hover:-translate-y-px"
      style={{
        ...style,
        background: `color-mix(in oklab, ${color} 13%, rgb(var(--surface)))`,
        border: selected ? '2px solid rgb(var(--ink))' : status === 'clash' ? '1.5px solid rgb(var(--warn))' : `1px solid color-mix(in oklab, ${color} 30%, rgb(var(--surface)))`,
        boxShadow: selected ? '0 10px 20px -10px rgba(28,25,23,.6)' : undefined,
        zIndex: selected ? 2 : 1,
      }}
    >
      {selected && (
        <span aria-hidden="true" className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-bg">
          <Check size={12} strokeWidth={3.2} />
        </span>
      )}
      <span className="flex flex-wrap gap-[3px]"><GroupTags groups={block.groups} size="sm" /></span>
      <span className="text-[13px] font-bold leading-4">{results.title} · nr {flow.n}</span>
      <span className="tabular-nums text-[11px] leading-[14px] text-ink-2">{block.start}–{block.end}{block.event.location ? ` · ${block.event.location}` : ''}</span>
      <span className={`mt-auto flex items-center gap-1 text-[11px] font-bold leading-[14px] ${status === 'clash' ? 'text-warn-ink' : ''}`}>
        {status === 'clash' ? <Warning size={12} strokeWidth={2.4} /> : <Check size={12} strokeWidth={2.8} />}
        {status === 'clash' ? `kolizja: ${item.option.clashes[0].event.title}` : STATUS_TEXT[status]}
      </span>
    </button>
  );
}

function MonthOptionsGrid({ results, shown, flow, picking }: { results: MakeupResults; shown: MakeupOption[]; flow: ResultsFlow; picking: Picking }) {
  const { calendar, todayKey } = useApp();
  const { cursor } = calendar;
  const days = getMonthDays(cursor.getFullYear(), cursor.getMonth());

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <div className="min-w-[680px]">
        <div className="grid grid-cols-7 border-b border-line">
          {WEEKDAYS_SHORT.map(day => <span key={day} className="px-3 py-2.5 text-[13px] text-ink-2">{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-[15px] bg-surface-2">
          {days.map((date, index) => {
            const key = formatDate(date);
            const inMonth = isSameMonth(date, cursor);
            const options = inMonth ? shown.filter(o => o.block.date === key) : [];
            const isOwn = inMonth && results.own?.date === key;
            return (
              <div
                key={key}
                style={{ '--i': Math.floor(index / 7) } as React.CSSProperties}
                className={`enter-quick flex min-h-[112px] min-w-0 flex-col gap-1 p-2 ${inMonth ? 'bg-surface' : 'bg-bg'}`}
              >
                <span className={`mb-0.5 inline-grid h-[26px] min-w-[26px] place-items-center self-start rounded-full text-[13px] ${
                  key === todayKey ? 'bg-ink font-semibold text-bg' : !inMonth ? 'text-ink-3' : options.length || isOwn ? 'font-semibold' : 'text-ink-3'
                }`}>
                  {date.getDate()}
                </span>
                {isOwn && results.own && (
                  <span className="flex h-6 items-center gap-1.5 rounded-md border border-dashed border-ink-3 px-1.5 text-xs text-ink-2">
                    <span className="tabular-nums">{results.own.start}</span>
                    <span className="truncate font-semibold">Twój termin</span>
                  </span>
                )}
                {options.map(option => {
                  const status = optionStatus(option, results);
                  const selected = picking.selected?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => picking.select(option)}
                      aria-label={`${option.block.start}–${option.block.end}, grupy ${option.block.groups.join(', ')}, ${STATUS_TEXT[status]}`}
                      className={`flex h-[26px] w-full min-w-0 items-center gap-1.5 rounded-[7px] px-1.5 text-left ${
                        selected ? 'bg-ink text-bg shadow-[0_4px_10px_-4px_rgba(28,25,23,.5)]' : status === 'clash' ? 'border border-warn bg-warn-bg text-warn-ink' : 'border border-line bg-bg'
                      }`}
                    >
                      {selected && <Check size={12} strokeWidth={3.2} className="shrink-0" />}
                      <span aria-hidden="true" className="flex shrink-0 gap-0.5">
                        {option.block.groups.slice(0, 2).map(g => <span key={g} className="h-3 w-1.5 rounded-sm" style={{ background: getGroupColor(g) }} />)}
                      </span>
                      <span className={`shrink-0 tabular-nums text-xs ${selected ? '' : 'text-ink-2'}`}>{option.block.start}</span>
                      <span className="min-w-0 truncate text-xs font-semibold">{option.block.groups.join(' · ')}</span>
                      {status === 'clash' && <Warning size={12} strokeWidth={2.4} className="ml-auto shrink-0 text-warn-ink" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <span className="sr-only">Zajęcia nr {flow.n}</span>
    </div>
  );
}

function OptionsList({ results, shown, picking }: { results: MakeupResults; shown: MakeupOption[]; picking: Picking }) {
  const { calendar, todayKey } = useApp();
  return (
    <section aria-labelledby="makeup-all" className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="makeup-all" className="text-base font-bold">Wszystkie terminy</h2>
        <span className="text-[13px] text-ink-2">wybierz jeden</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        {shown.map((option, i) => {
          const status = optionStatus(option, results);
          const selected = picking.selected?.id === option.id;
          const previousOn = i > 0 && picking.selected?.id === shown[i - 1].id;
          const date = parseDate(option.block.date);
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                calendar.setCursor(date);
                picking.select(option);
              }}
              className={`relative grid w-full grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-left ${
                selected ? 'rounded-[14px] bg-pressed shadow-[var(--shadow-press),inset_0_0_0_2px_rgb(var(--ink))]' : 'hover:bg-surface-2'
              }`}
            >
              {i > 0 && !selected && !previousOn && <span aria-hidden="true" className="absolute inset-x-3.5 top-0 h-px bg-line" />}
              <span aria-hidden="true" className={`grid h-[22px] w-[22px] place-items-center self-start rounded-full ${selected ? 'bg-ink text-bg' : 'border-2 border-line-strong bg-surface'}`}>
                {selected && <Check size={12} strokeWidth={3.4} />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-bold leading-[19px]">{shortDateLabel(date)}</span>
                <span className="tabular-nums text-xs text-ink-2">{option.block.start}–{option.block.end} · {whenLabel(option.block.date, todayKey)}</span>
              </span>
              <span className="flex gap-[3px]"><GroupTags groups={option.block.groups} size="sm" /></span>
              <span className={`col-start-2 col-end-4 text-xs font-bold leading-4 ${status === 'clash' ? 'text-warn-ink' : ''}`}>
                {status === 'clash' ? `kolizja: ${option.clashes.map(c => c.event.title).join(', ')}` : status === 'best' ? 'Najbliższy wolny termin' : status === 'chosen' ? 'W Twoim planie' : 'bez kolizji'}
              </span>
            </button>
          );
        })}
      </div>
      <p className="px-1 text-xs leading-[17px] text-ink-2">
        Kolizje sprawdzamy z Twoim planem. {KIND_SHORT[results.kind] === 'ćwiczenia' ? 'Odrabianie ćwiczeń' : 'Odrabianie'} uzgodnij z prowadzącą.
      </p>
    </section>
  );
}
