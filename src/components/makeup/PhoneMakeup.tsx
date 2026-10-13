import { useEffect } from 'react';
import { MakeupFlow, useApp } from '../../app/AppContext';
import { ClassBlock } from '../../utils/blocks';
import {
  addDays, capitalize, DAY_NAMES_FULL, formatDate, getMonthDays, getWeekLabelShort, isSameDay, isSameMonth,
  MONTH_NAMES, MONTH_SHORT, parseDate, shortDateLabel, WEEKDAYS_NARROW,
} from '../../utils/dateUtils';
import { MakeupOption } from '../../utils/makeup';
import { DisplayTitle } from '../ui/DisplayTitle';
import { GroupTag, GroupTags } from '../ui/GroupTag';
import { CalendarGrid, Check, ChevronLeft, ChevronRight, Moon, Rows, UserIcon, Warning } from '../ui/icons';
import { ModeBadge } from '../ui/ModeBadge';
import { SlideToConfirm } from '../ui/SlideToConfirm';
import {
  KIND_SHORT, MakeupBar, MakeupResults, NoOptions, optionStatus, OptionStatus, pickedNote, termsLabel,
  useConfirmMakeup, useMakeupResults, useOptionFilter, useOptionSelection, whenLabel,
} from './shared';
import { usePeriodStep } from '../../hooks/usePeriodStep';

type ResultsFlow = Extract<MakeupFlow, { step: 'results' }>;

interface Picking {
  selected: MakeupOption | null;
  select: (option: MakeupOption) => void;
}

/**
 * Phone: the other groups' dates for the class being made up, in a week list or a month grid.
 * Tapping a date only selects it; the bar at the bottom confirms it with a slide.
 */
export function PhoneMakeup({ flow }: { flow: ResultsFlow }) {
  const { calendar } = useApp();
  const results = useMakeupResults(flow);
  const { shown, chips } = useOptionFilter(results);
  const { selected, select } = useOptionSelection(results, shown);
  const { confirm, remove, previous } = useConfirmMakeup(flow, results);
  const step = usePeriodStep(shown.map(o => o.block.date));

  // Open on the soonest date that fits, else the first one (this view is remounted per class)
  useEffect(() => {
    const target = results.best ?? results.options[0];
    if (target) calendar.setCursor(parseDate(target.block.date));
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isWeek = calendar.view === 'week';
  const title = isWeek
    ? getWeekLabelShort(calendar.weekStart)
    : `${MONTH_NAMES[calendar.cursor.getMonth()]} ${calendar.cursor.getFullYear()}`;
  const hasOptions = results.options.length > 0;
  const picking = { selected, select };
  const previousDate = previous && previous.date && selected && !(previous.date === selected.block.date && previous.start === selected.block.start)
    ? `${shortDateLabel(parseDate(previous.date))}, ${previous.start}`
    : null;

  return (
    <div className="fade-enter min-h-dvh pb-[calc(200px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex items-center gap-1.5 bg-bg/90 px-3 pb-1 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-md">
        <button type="button" aria-label={isWeek ? 'Poprzedni tydzień' : 'Poprzedni miesiąc'} onClick={() => step(-1)} className="raised grid h-10 w-10 shrink-0 place-items-center rounded-full">
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
        <span key={title} className="enter-quick min-w-0 flex-1 truncate text-center text-[22px] leading-7 tracking-[-0.02em]"><DisplayTitle text={title} /></span>
        <button type="button" aria-label={isWeek ? 'Następny tydzień' : 'Następny miesiąc'} onClick={() => step(1)} className="raised grid h-10 w-10 shrink-0 place-items-center rounded-full">
          <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </header>

      <div className="flex flex-col gap-3 px-3 pt-2.5">
        <MakeupBar flow={flow} results={results} />
        {hasOptions && (
          <div className="flex items-center gap-2 px-1">
            {chips}
            <ViewIcons />
          </div>
        )}
      </div>

      <main className="flex flex-col gap-4 px-3 pt-3">
        {!hasOptions ? (
          <NoOptions results={results} flow={flow} />
        ) : isWeek ? (
          <WeekOptions results={results} shown={shown} flow={flow} picking={picking} />
        ) : (
          <MonthOptions results={results} shown={shown} flow={flow} picking={picking} />
        )}
      </main>

      {hasOptions && (
        <ConfirmBar
          selected={selected}
          results={results}
          previousDate={previousDate}
          onConfirm={confirm}
          onRemove={remove}
        />
      )}
    </div>
  );
}

/** Month or week, as two icons in a pressed track */
function ViewIcons() {
  const { calendar } = useApp();
  return (
    <div role="group" aria-label="Widok" className="pressed ml-auto flex shrink-0 gap-[3px] rounded-[13px] p-[3px]">
      {(['month', 'week'] as const).map(view => {
        const selected = calendar.view === view;
        const Icon = view === 'month' ? CalendarGrid : Rows;
        return (
          <button
            key={view}
            type="button"
            aria-pressed={selected}
            aria-label={view === 'month' ? 'Miesiąc' : 'Tydzień'}
            onClick={() => calendar.setView(view)}
            className={`grid h-[34px] w-10 place-items-center rounded-[10px] ${selected ? 'raised' : 'text-ink-2'}`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

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
      className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 rounded-t-[26px] bg-surface px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3.5 shadow-[0_-12px_32px_rgba(28,25,23,.12),0_-1px_0_rgba(28,25,23,.06)]"
    >
      {selected ? (
        <div className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-x-3">
          <span aria-hidden="true" className="grid h-[26px] w-[26px] place-items-center rounded-full bg-ink text-bg">
            <Check size={14} strokeWidth={3.2} />
          </span>
          <span className="flex min-w-0 flex-col" aria-live="polite">
            <span className="text-xs leading-4 text-ink-2">{chosen ? 'Już w Twoim planie' : 'Wybrany termin'}</span>
            <span className="truncate text-base font-bold leading-[22px]">
              {shortDateLabel(parseDate(selected.block.date))}, {selected.block.start}–{selected.block.end}
            </span>
            <span className={`truncate text-[13px] font-semibold leading-[18px] ${selected.clashes.length ? 'text-warn-ink' : 'text-ink-2'}`}>
              {pickedNote(selected, previousDate)}
            </span>
          </span>
          <span className="flex gap-[3px]"><GroupTags groups={selected.block.groups} /></span>
        </div>
      ) : (
        <div className="grid grid-cols-[26px_minmax(0,1fr)] items-center gap-x-3">
          <span aria-hidden="true" className="h-[26px] w-[26px] rounded-full border-2 border-dashed border-ink-3" />
          <span className="flex flex-col">
            <span className="text-base font-bold leading-[22px]">Wybierz termin</span>
            <span className="text-[13px] leading-[18px] text-ink-2">Dotknij zajęć innej grupy na liście powyżej.</span>
          </span>
        </div>
      )}
      {chosen ? (
        <button type="button" onClick={onRemove} className="raised h-[52px] rounded-full text-[15px] font-semibold">Usuń z mojego planu</button>
      ) : (
        <SlideToConfirm
          key={selected?.id ?? 'none'}
          label={selected ? 'Przesuń, aby potwierdzić' : 'Najpierw wybierz termin'}
          doneLabel="Dodano do planu"
          disabled={!selected}
          onConfirm={() => { if (selected) onConfirm(selected); }}
        />
      )}
    </div>
  );
}

function dayRange(days: Date[]): string {
  const name = (d: Date) => `${DAY_NAMES_FULL[d.getDay()]} ${d.getDate()}`;
  if (days.length === 1) return capitalize(name(days[0]));
  if (days.length === 2) return `${capitalize(name(days[0]))} i ${name(days[1])}`;
  return `${capitalize(name(days[0]))} – ${name(days[days.length - 1])}`;
}

/** "25 paź · 2 terminy (kolidują), 7 lis · 1 termin" for the first dates in a list */
function summary(options: MakeupOption[]): string {
  const byDate = new Map<string, MakeupOption[]>();
  options.forEach(o => byDate.set(o.block.date, [...(byDate.get(o.block.date) ?? []), o]));
  return [...byDate.entries()].slice(0, 2).map(([date, list]) => {
    const d = parseDate(date);
    const allClash = list.every(o => o.clashes.length);
    return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]} · ${termsLabel(list.length)}${allClash ? (list.length === 1 ? ' (koliduje)' : ' (kolidują)') : ''}`;
  }).join(', ');
}

function JumpLink({ label, options, onJump }: { label: string; options: MakeupOption[]; onJump: (date: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onJump(options[0].block.date)}
      className="raised flex min-h-12 items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 text-left text-sm"
    >
      <span className="flex-1 text-ink-2"><span className="font-semibold text-ink">{label}:</span> {summary(options)}</span>
      <ChevronRight size={16} strokeWidth={2.2} className="shrink-0 text-ink-3" />
    </button>
  );
}

type Entry =
  | { type: 'gap'; key: string; days: Date[] }
  | { type: 'day'; key: string; date: Date; own: ClassBlock | null; options: MakeupOption[] };

function WeekOptions({ results, shown, flow, picking }: { results: MakeupResults; shown: MakeupOption[]; flow: ResultsFlow; picking: Picking }) {
  const { calendar } = useApp();
  const startKey = formatDate(calendar.weekStart);
  const endKey = formatDate(addDays(calendar.weekStart, 6));

  const entries: Entry[] = [];
  let gap: Date[] = [];
  const flush = () => {
    if (gap.length) entries.push({ type: 'gap', key: `gap-${formatDate(gap[0])}`, days: gap });
    gap = [];
  };
  for (let i = 0; i < 7; i++) {
    const date = addDays(calendar.weekStart, i);
    const key = formatDate(date);
    const own = results.own?.date === key ? results.own : null;
    const options = shown.filter(o => o.block.date === key);
    if (!own && !options.length) {
      gap.push(date);
      continue;
    }
    flush();
    entries.push({ type: 'day', key, date, own, options });
  }
  flush();

  const later = shown.filter(o => o.block.date > endKey);
  const earlier = shown.filter(o => o.block.date < startKey).reverse();
  const jump = (date: string) => calendar.setCursor(parseDate(date));

  return (
    <div key={`${startKey}|${shown.length}`} className="flex flex-col gap-4">
      {entries.map((entry, index) => {
        const enter = { '--i': index } as React.CSSProperties;
        if (entry.type === 'gap') {
          return (
            <p key={entry.key} style={enter} className="enter flex min-h-11 items-center gap-2.5 rounded-[14px] border border-dashed border-line-strong px-3.5 py-2.5 text-sm text-ink-2">
              <Moon size={18} className="shrink-0" />
              <span><span className="font-semibold text-ink">{dayRange(entry.days)}</span> · brak terminów</span>
            </p>
          );
        }
        return (
          <DaySection key={entry.key} style={enter} date={entry.date} own={entry.own} options={entry.options} results={results} flow={flow} picking={picking} />
        );
      })}
      {earlier.length > 0 && !entries.some(e => e.type === 'day' && e.options.length) && (
        <JumpLink label="Wcześniej" options={earlier} onJump={jump} />
      )}
      {later.length > 0 && <JumpLink label="Dalej" options={later} onJump={jump} />}
    </div>
  );
}

function DaySection({ date, own, options, results, flow, picking, style }: {
  date: Date;
  own: ClassBlock | null;
  options: MakeupOption[];
  results: MakeupResults;
  flow: ResultsFlow;
  picking: Picking;
  style?: React.CSSProperties;
}) {
  const dayName = `${capitalize(DAY_NAMES_FULL[date.getDay()])} ${date.getDate()}`;
  return (
    <section style={style} className="enter flex flex-col gap-2">
      <h2 className="flex items-center gap-2 px-2 text-[15px] font-semibold leading-[22px]">
        <span>{dayName}</span>
        <span className="text-[13px] font-normal text-ink-2">· {options.length ? termsLabel(options.length) : 'brak terminów'}</span>
      </h2>
      <div role="radiogroup" aria-label={dayName} className="overflow-hidden rounded-2xl border border-line bg-surface">
        {own && <OwnRow block={own} flow={flow} />}
        {options.map((option, i) => {
          const on = picking.selected?.id === option.id;
          const previousOn = i > 0 && picking.selected?.id === options[i - 1].id;
          return (
            <OptionRow
              key={option.id}
              option={option}
              status={optionStatus(option, results)}
              results={results}
              flow={flow}
              selected={on}
              divided={i > 0 && !on && !previousOn}
              onSelect={() => picking.select(option)}
            />
          );
        })}
      </div>
    </section>
  );
}

/** The student's own class, shown where it would be, as a dashed placeholder */
function OwnRow({ block, flow }: { block: ClassBlock; flow: ResultsFlow }) {
  return (
    <div className="m-1.5 grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-3 rounded-xl border-[1.5px] border-dashed border-line-strong px-2.5 py-2 text-ink-2">
      <span className="tabular-nums text-sm font-semibold">{block.start}</span>
      <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-[18px]">
        <span className="grayscale"><GroupTag group={flow.group} size="sm" /></span>
        Twój termin, który odrabiasz
      </span>
    </div>
  );
}

const STATUS_LABEL: Record<OptionStatus, string> = {
  chosen: 'W Twoim planie',
  best: 'Najbliższy wolny',
  free: 'bez kolizji',
  clash: 'kolizja',
};

function OptionRow({ option, status, results, flow, selected, divided, onSelect }: {
  option: MakeupOption;
  status: OptionStatus;
  results: MakeupResults;
  flow: ResultsFlow;
  selected: boolean;
  divided: boolean;
  onSelect: () => void;
}) {
  const { todayKey } = useApp();
  const { block, clashes } = option;
  const clashText = clashes.map(c => `${c.event.title}, ${c.start}–${c.end}`).join('; ');
  const label = status === 'best' ? `${STATUS_LABEL.best} · ${whenLabel(block.date, todayKey)}` : STATUS_LABEL[status];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      aria-label={`${block.start}–${block.end}, z grupami ${block.groups.join(', ')}${block.event.location ? `, ${block.event.location}` : ''}. ${clashes.length ? `Koliduje z: ${clashText}` : 'Bez kolizji'}${status === 'chosen' ? ', już w Twoim planie' : ''}`}
      className={`relative grid w-full grid-cols-[48px_minmax(0,1fr)_24px] items-center gap-x-3 py-3.5 pl-4 pr-3.5 text-left transition-[background-color,box-shadow] duration-200 ${
        selected ? 'rounded-[14px] bg-pressed shadow-[var(--shadow-press),inset_0_0_0_2px_rgb(var(--ink))]' : 'active:bg-ink/[.04]'
      }`}
    >
      {divided && <span aria-hidden="true" className="absolute inset-x-4 top-0 h-px bg-line" />}
      <span className="flex flex-col gap-0.5 self-start tabular-nums text-sm font-medium leading-5">
        <span>{block.start}</span>
        <span className="text-[13px] font-normal text-ink-2">{block.end}</span>
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-1">
          <GroupTags groups={block.groups} />
          <span className={`ml-auto inline-flex items-center gap-1 whitespace-nowrap pl-2 text-xs font-bold ${status === 'clash' ? 'text-warn-ink' : ''}`}>
            {status === 'clash' && <Warning size={13} strokeWidth={2.4} />}
            {label}
          </span>
        </span>
        <span className="text-[15px] font-semibold leading-[21px] [overflow-wrap:anywhere]">
          {results.title} · {KIND_SHORT[results.kind]} nr {flow.n}
        </span>
        {block.mode !== 'unknown' && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium leading-[19px]">
            <ModeBadge mode={block.mode} />
            {block.mode === 'onsite' && block.event.location && <span>{block.event.location}</span>}
          </span>
        )}
        {block.event.instructor && (
          <span className="flex items-center gap-1.5 text-[13px] leading-[19px] text-ink-2">
            <UserIcon size={14} className="shrink-0" />
            <span>{block.event.instructor}</span>
          </span>
        )}
        {clashes.length > 0 && (
          <span className="mt-0.5 self-start rounded-[10px] bg-warn-bg px-2.5 py-1.5 text-[13px] leading-[18px] text-warn-ink">
            Koliduje z: <span className="font-bold">{clashText}</span>
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${selected ? 'bg-ink text-bg' : 'border-2 border-line-strong bg-surface'}`}
      >
        {selected && <Check size={13} strokeWidth={3.4} />}
      </span>
    </button>
  );
}

function MonthOptions({ results, shown, flow, picking }: { results: MakeupResults; shown: MakeupOption[]; flow: ResultsFlow; picking: Picking }) {
  const { calendar, todayKey } = useApp();
  const { cursor } = calendar;
  const days = getMonthDays(cursor.getFullYear(), cursor.getMonth());
  const cursorKey = formatDate(cursor);
  const ownKey = results.own?.date;
  const pickedKey = picking.selected?.block.date;
  const dayOptions = shown.filter(o => o.block.date === cursorKey);
  const monthPrefix = cursorKey.slice(0, 8);
  const later = shown.filter(o => o.block.date > cursorKey && !o.block.date.startsWith(monthPrefix));
  const nextInMonth = shown.find(o => o.block.date > cursorKey && o.block.date.startsWith(monthPrefix));

  return (
    <div className="flex flex-col gap-4">
      <div key={monthPrefix} className="enter rounded-2xl border border-line bg-surface px-2 pb-2 pt-2.5">
        <div className="grid grid-cols-7 pb-1.5">
          {WEEKDAYS_NARROW.map(day => (
            <span key={day} className="text-center text-xs font-medium text-ink-2">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map(date => {
            const key = formatDate(date);
            const inMonth = isSameMonth(date, cursor);
            const options = inMonth ? shown.filter(o => o.block.date === key) : [];
            const isOwn = inMonth && key === ownKey;
            const isPicked = inMonth && key === pickedKey;
            const isToday = key === todayKey;
            const current = isSameDay(date, cursor);
            return (
              <button
                key={key}
                type="button"
                disabled={!inMonth}
                aria-pressed={current}
                aria-label={`${date.getDate()} ${MONTH_SHORT[date.getMonth()]}${options.length ? `, ${termsLabel(options.length)}` : ''}${isOwn ? ', Twój termin' : ''}${isPicked ? ', tu jest wybrany termin' : ''}`}
                onClick={() => calendar.setCursor(date)}
                className={`flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl ${current ? 'pressed' : ''}`}
              >
                <span
                  className={`grid h-[30px] w-[30px] place-items-center rounded-full text-[15px] tabular-nums ${
                    isPicked ? 'bg-ink font-bold text-bg' : isOwn ? 'border-[1.5px] border-dashed border-ink-2' : ''
                  } ${isPicked ? '' : isToday ? 'font-extrabold text-accent' : !inMonth ? 'text-line-strong' : options.length || isOwn ? 'font-bold' : 'text-ink-3'}`}
                >
                  {date.getDate()}
                </span>
                <span aria-hidden="true" className="flex h-[7px] items-center gap-[3px]">
                  {options.slice(0, 4).map(o => (
                    <span
                      key={o.id}
                      className={`h-[7px] rounded-full ${
                        o.id === picking.selected?.id ? 'w-[13px] bg-ink' : o.clashes.length ? 'w-[7px] border-2 border-warn' : 'w-[7px] bg-ink'
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3.5 gap-y-1 border-t border-line px-1 pt-2.5 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-ink" />bez kolizji</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full border-2 border-warn" />kolizja</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded-full border-[1.5px] border-dashed border-ink-2" />Twój termin</span>
        </div>
      </div>

      <div key={cursorKey} className="enter-quick flex flex-col gap-4" style={{ '--i': 2 } as React.CSSProperties}>
        {dayOptions.length || cursorKey === ownKey ? (
          <DaySection date={cursor} own={cursorKey === ownKey ? results.own : null} options={dayOptions} results={results} flow={flow} picking={picking} />
        ) : (
          <p className="rounded-2xl border border-line bg-surface px-4 py-5 text-center text-sm text-ink-2">
            Tego dnia nie ma terminów.
            {nextInMonth && (
              <>
                {' '}
                <button type="button" onClick={() => calendar.setCursor(parseDate(nextInMonth.block.date))} className="font-semibold text-ink underline underline-offset-2">
                  Najbliższy: {parseDate(nextInMonth.block.date).getDate()} {MONTH_SHORT[parseDate(nextInMonth.block.date).getMonth()]}
                </button>
              </>
            )}
          </p>
        )}
        {later.length > 0 && <JumpLink label="Później" options={later} onJump={date => calendar.setCursor(parseDate(date))} />}
      </div>
    </div>
  );
}
