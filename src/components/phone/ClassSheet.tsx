import { useMemo } from 'react';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import { useApp } from '../../app/AppContext';
import { ClassBlock, isClass, subjectKey } from '../../utils/blocks';
import { KindFilter } from '../../types';
import { getGroupColor } from '../../constants/groupColors';
import { capitalize, classesLabel, DAY_NAMES_FULL, durationLabel, getDayLabel, MONTH_SHORT, parseDate, shortDateLabel } from '../../utils/dateUtils';
import { KIND_LABELS } from '../../utils/eventUtils';
import { makeupOptions } from '../../utils/makeup';
import { GroupTags } from '../ui/GroupTag';
import { KindIcon } from '../ui/KindIcon';
import { ModeBadge } from '../ui/ModeBadge';
import { Check, ChevronRight, Clock, Close, Info, MapPin, Redo, UserIcon, Video } from '../ui/icons';

const SHOWN_DATES = 3;

interface ClassSheetProps {
  /** Kept after closing so the sheet can slide out with its content */
  block: ClassBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Show another date in the plan */
  onJump: (date: string) => void;
}

/** Phone bottom sheet with everything about one class, and its next dates. */
export function ClassSheet({ block, open, onOpenChange, onJump }: ClassSheetProps) {
  return (
    <Drawer.Root open={open && !!block} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-[rgba(12,10,9,.42)]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[26px] bg-surface shadow-[0_-14px_40px_rgba(12,10,9,.2)] outline-none"
        >
          <div className="mx-auto mt-2 h-[5px] w-[38px] shrink-0 rounded-full bg-line-strong" />
          {block && <SheetBody block={block} onJump={onJump} onClose={() => onOpenChange(false)} />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SheetBody({ block, onJump, onClose }: { block: ClassBlock; onJump: (date: string) => void; onClose: () => void }) {
  const { live, blocksByDate, todayKey, now, numberOf, classIndex, canMakeup, startMakeup, removeMakeup } = useApp();
  const { event } = block;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const accent = getGroupColor(block.groups[0]);
  const accent2 = getGroupColor(block.groups[1] ?? block.groups[0]);
  const isLive = live.current?.id === block.id;
  const isNext = live.next?.id === block.id;
  const isOver = block.date < todayKey || (block.date === todayKey && block.endMin <= nowMin);

  // The same subject and kind, after this one and not over yet
  const upcoming = useMemo(() => {
    const list: ClassBlock[] = [];
    for (const date of Object.keys(blocksByDate).sort()) {
      if (date < block.date || date < todayKey) continue;
      for (const other of blocksByDate[date]) {
        if (other.id === block.id || !isClass(other)) continue;
        if (other.event.title !== event.title || other.kind !== block.kind) continue;
        if (date === block.date && other.startMin <= block.startMin) continue;
        if (date === todayKey && other.endMin <= nowMin) continue;
        list.push(other);
      }
    }
    return list;
  }, [blocksByDate, block, event.title, todayKey, nowMin]);

  const kindIcon = block.kind === 'lecture' || block.kind === 'exercise' || block.kind === 'simulation';
  const count = numberOf(block);

  // Other groups' dates for this class, when it's one the student could miss
  const options = useMemo(() => {
    if (!canMakeup || !count || block.makeup || block.madeUpOn || block.everyone) return [];
    return makeupOptions(classIndex, count.group, subjectKey(block), count.n, blocksByDate, todayKey, nowMin);
  }, [canMakeup, count, block, classIndex, blocksByDate, todayKey, nowMin]);
  const freeOptions = options.filter(o => o.clashes.length === 0).length;

  const makeupId = block.makeup?.id ?? block.madeUpOn?.id;
  const undoMakeup = () => {
    if (!makeupId) return;
    removeMakeup(makeupId);
    onClose();
    toast.success('Usunięto odrabianie z Twojego planu.');
  };
  const openMakeup = () => {
    onClose();
    startMakeup(block);
  };

  return (
    <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 pb-[calc(28px+env(safe-area-inset-bottom))] pt-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink-2">{capitalize(getDayLabel(parseDate(block.date)))}</span>
        <Drawer.Close aria-label="Zamknij" className="raised grid h-9 w-9 shrink-0 place-items-center rounded-full">
          <Close size={16} strokeWidth={2.4} />
        </Drawer.Close>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <GroupTags groups={block.groups} everyone={block.everyone} />
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2">
            {kindIcon && <KindIcon kind={block.kind as KindFilter} size={18} />}
            {KIND_LABELS[block.kind].toLowerCase()}
          </span>
          <ModeBadge mode={block.mode} />
        </div>
        <div className="flex items-end justify-between gap-3">
          <Drawer.Title className="text-[30px] font-extrabold leading-[34px] tracking-[-0.025em] [overflow-wrap:anywhere]">{event.title}</Drawer.Title>
          {count && (
            <span className="shrink-0 tabular-nums text-[30px] leading-[34px] tracking-[-0.02em]">
              <span className="font-extrabold">{count.n}</span>
              <span className="font-light text-ink-2"> z {count.total}</span>
            </span>
          )}
        </div>
      </div>

      {block.makeup && (
        <div className="flex flex-col gap-3 rounded-2xl bg-hero p-3.5 text-hero-ink">
          <div className="flex items-start gap-2.5">
            <Redo size={20} className="mt-0.5 shrink-0" />
            <p className="text-[15px] leading-[21px]">
              <span className="font-bold">Odrabiasz z grupą {block.groups.join(' · ')}</span>
              <span className="opacity-80"> zamiast swoich zajęć: {shortDateLabel(parseDate(block.makeup.date))}, {block.makeup.start}.</span>
            </p>
          </div>
          <button type="button" onClick={undoMakeup} className="h-10 self-start rounded-full bg-white/15 px-4 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,.14)] active:bg-white/25">
            Usuń z planu
          </button>
        </div>
      )}

      {block.madeUpOn && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-3.5">
          <div className="flex items-start gap-2.5">
            <Redo size={20} className="mt-0.5 shrink-0" />
            <p className="text-[15px] leading-[21px]">
              <span className="font-bold">Odrabiasz te zajęcia: {shortDateLabel(parseDate(block.madeUpOn.date))}, {block.madeUpOn.start}</span>
              <span className="text-ink-2"> z grupą {block.madeUpOn.groups.join(' · ')}.</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => onJump(block.madeUpOn!.date)} className="raised h-10 rounded-full px-4 text-sm font-semibold">Pokaż odrabianie</button>
            <button type="button" onClick={undoMakeup} className="h-10 rounded-full px-3 text-sm font-semibold text-ink-2">Usuń</button>
          </div>
        </div>
      )}

      {isNext && (
        <div className="pressed flex min-h-12 items-center gap-2.5 rounded-[14px] px-3.5">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full border-[1.5px] border-ink" />
          <span className="text-[15px] font-semibold">Następne zajęcia</span>
          <span className="ml-auto text-[15px] font-bold">{live.untilNextLabel}</span>
        </div>
      )}

      {isLive && (
        <div
          className="relative isolate flex flex-col gap-2.5 overflow-hidden rounded-[14px] p-3.5"
          style={{ boxShadow: `0 10px 22px -12px color-mix(in oklab, ${accent} 75%, transparent), 0 1px 2px rgba(28,25,23,.06)` }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden rounded-[inherit] [clip-path:inset(0_round_14px)]">
            <span className="absolute -left-12 -top-24 h-[200px] w-[200px] rounded-full opacity-50 blur-[40px]" style={{ background: accent }} />
            <span className="absolute -bottom-28 -right-10 h-[200px] w-[200px] rounded-full opacity-40 blur-[44px]" style={{ background: accent2 }} />
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
            style={{
              background: 'var(--glass-fill)',
              WebkitBackdropFilter: 'blur(22px) saturate(180%)',
              backdropFilter: 'blur(22px) saturate(180%)',
              boxShadow: 'inset 0 0 0 1px var(--glass-rim), inset 0 1.5px 0 var(--glass-hi)',
            }}
          />
          <div className="flex items-center gap-2">
            <span className="gloss inline-flex h-6 items-center gap-1.5 rounded-full pl-2 pr-2.5 text-xs font-bold text-white" style={{ backgroundColor: accent }}>
              <span className="live-dot text-white" />
              Trwa teraz
            </span>
            <span className="ml-auto text-[13px] text-ink-2">
              pozostało: <span className="tabular-nums font-bold text-ink">{durationLabel(live.remainingMin)}</span>
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Postęp zajęć"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={live.progress}
            className="relative h-1.5 overflow-hidden rounded-full"
            style={{ background: 'var(--glass-track)', boxShadow: 'inset 0 1px 2px rgba(28,25,23,.14)' }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${live.progress}%`, backgroundColor: accent, backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 60%)' }}
            />
          </div>
        </div>
      )}

      {isOver && <p className="text-sm text-ink-2">Te zajęcia już się odbyły.</p>}

      <dl className="flex flex-col rounded-2xl border border-line bg-bg">
        <DetailRow icon={<Clock size={20} />} label="Godziny" aside={durationLabel(block.endMin - block.startMin)}>
          <span className="tabular-nums font-bold">{block.start} – {block.end}</span>
        </DetailRow>
        {(event.online || event.location) && (
          <DetailRow icon={event.online ? <Video size={20} /> : <MapPin size={20} />} label={event.online ? 'Forma' : 'Miejsce'}>
            {event.online ? 'Online' : event.location}
          </DetailRow>
        )}
        {event.instructor && (
          <DetailRow icon={<UserIcon size={20} />} label="Prowadzi">{event.instructor}</DetailRow>
        )}
        {event.notes && (
          <DetailRow icon={<Info size={20} />} label="Uwagi">{event.notes}</DetailRow>
        )}
      </dl>

      {options.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-3.5">
          <div className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-x-3">
            <span className="raised grid h-9 w-9 place-items-center rounded-xl"><Redo size={20} /></span>
            <p className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold leading-5">Nie dasz rady przyjść?</span>
              <span className="text-sm leading-5 text-ink-2">
                Zajęcia nr {count!.n} mają też inne grupy.{' '}
                {freeOptions > 0
                  ? <><span className="font-semibold text-ink">{termsLabel(freeOptions)}</span> bez kolizji z Twoim planem.</>
                  : <>Wszystkie {termsLabel(options.length)} kolidują z Twoim planem.</>}
              </span>
            </p>
          </div>
          <button type="button" onClick={openMakeup} className="flex h-[46px] items-center justify-center gap-2 rounded-[13px] bg-ink text-[15px] font-semibold text-bg active:scale-[.98]">
            Odrób z inną grupą
            <ChevronRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      )}

      {count ? (
        <AllDates list={count.list} n={count.n} group={count.group} todayKey={todayKey} onJump={onJump} />
      ) : (
      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between px-0.5">
          <h3 className="text-base font-bold">Kolejne terminy</h3>
          {upcoming.length > SHOWN_DATES && <span className="text-[13px] text-ink-2">jeszcze {upcoming.length - SHOWN_DATES}</span>}
        </div>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-line px-3.5 py-3 text-sm text-ink-2">To ostatnie takie zajęcia w planie.</p>
        ) : (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-line">
            {upcoming.slice(0, SHOWN_DATES).map((other, i) => {
              const date = parseDate(other.date);
              return (
                <button
                  key={other.id}
                  type="button"
                  onClick={() => onJump(other.date)}
                  className={`grid min-h-12 grid-cols-[minmax(0,1fr)_auto_18px] items-center gap-x-3 px-3.5 text-left active:bg-surface-2 ${i > 0 ? 'border-t border-line' : ''}`}
                >
                  <span className="text-[15px] font-semibold">{DAY_NAMES_FULL[date.getDay()]} {date.getDate()} {MONTH_SHORT[date.getMonth()]}</span>
                  <span className="tabular-nums text-sm text-ink-2">{other.start}–{other.end}</span>
                  <ChevronRight size={16} strokeWidth={2.2} className="text-ink-3" />
                </button>
              );
            })}
          </div>
        )}
      </section>
      )}
    </div>
  );
}

function termsLabel(count: number): string {
  return count === 1 ? '1 termin' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? `${count} terminy` : `${count} terminów`;
}

/** Every class of the subject for the student's group, numbered; this one pressed in */
function AllDates({ list, n, group, todayKey, onJump }: { list: ClassBlock[]; n: number; group: string; todayKey: string; onJump: (date: string) => void }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between px-0.5">
        <h3 className="text-base font-bold">Wszystkie terminy grupy {group}</h3>
        <span className="text-[13px] text-ink-2">{classesLabel(list.length)}</span>
      </div>
      <ol className="flex flex-col overflow-hidden rounded-2xl border border-line">
        {list.map((other, i) => {
          const date = parseDate(other.date);
          const current = i + 1 === n;
          const past = other.date < todayKey;
          return (
            <li key={other.id} className={i > 0 ? 'border-t border-line' : ''}>
              <button
                type="button"
                aria-current={current ? 'true' : undefined}
                onClick={() => onJump(other.date)}
                className={`grid min-h-[52px] w-full grid-cols-[28px_minmax(0,1fr)_auto_16px] items-center gap-x-3 px-3.5 text-left ${current ? 'bg-pressed shadow-press' : 'active:bg-surface-2'}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid h-7 w-7 place-items-center rounded-full tabular-nums text-sm font-extrabold ${
                    current ? 'bg-ink text-bg' : past ? 'bg-surface-2 text-ink-2' : 'border-[1.5px] border-line-strong'
                  }`}
                >
                  {past && !current ? <Check size={14} strokeWidth={3} /> : i + 1}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={`text-[15px] leading-5 ${current ? 'font-bold' : 'font-semibold'} ${past && !current ? 'text-ink-2' : ''}`}>
                    <span className="sr-only">Zajęcia {i + 1}: </span>
                    {DAY_NAMES_FULL[date.getDay()]} {date.getDate()} {MONTH_SHORT[date.getMonth()]}
                  </span>
                  {(current || past) && <span className="text-xs font-semibold text-ink-2">{current ? 'te zajęcia' : 'odbyły się'}</span>}
                </span>
                <span className={`tabular-nums text-sm ${current ? 'font-semibold' : 'text-ink-2'}`}>{other.start}–{other.end}</span>
                <ChevronRight size={16} strokeWidth={2.2} className={current ? 'invisible' : 'text-ink-3'} />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DetailRow({ icon, label, aside, children }: { icon: React.ReactNode; label: string; aside?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-x-3 border-line px-3.5 py-3 [&:not(:first-child)]:border-t">
      <span className="text-ink-2">{icon}</span>
      <div className="flex min-w-0 flex-col">
        <dt className="text-xs text-ink-2">{label}</dt>
        <dd className="text-base font-semibold leading-[22px] [overflow-wrap:anywhere]">{children}</dd>
      </div>
      {aside && <span className="text-[13px] text-ink-2">{aside}</span>}
    </div>
  );
}
