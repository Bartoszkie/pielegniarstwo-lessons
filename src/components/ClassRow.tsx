import { ClassBlock } from '../utils/blocks';
import { useApp, type LiveState } from '../app/AppContext';
import { getGroupColor } from '../constants/groupColors';
import { durationLabel, parseDate, shortDateLabel } from '../utils/dateUtils';
import { ClassCount } from './ui/ClassCount';
import { GroupTags } from './ui/GroupTag';
import { Info, Redo, UserIcon } from './ui/icons';
import { ModeBadge } from './ui/ModeBadge';

export type RowState = 'live' | 'next' | 'none';

/** The live class (only on today's list) and the next class stand out; the rest are plain. */
export function rowState(block: ClassBlock, live: LiveState, isToday: boolean): RowState {
  if (isToday && live.current?.id === block.id) return 'live';
  if (live.next?.id === block.id) return 'next';
  return 'none';
}

interface ClassRowProps {
  block: ClassBlock;
  state?: RowState;
  progress?: number;
  remainingMin?: number;
  /** For the next class: "za 2 godz. 14 min", "jutro", "za 5 dni" */
  untilLabel?: string;
  /** Shows the date above the time, used in search results */
  dateLabel?: string;
  /** Tapping the row opens the class details */
  onOpen?: () => void;
  /** A hairline above the row, between two plain rows */
  divided?: boolean;
}

const KIND_TEXT: Record<string, string> = {
  lecture: 'wykład',
  exercise: 'ćwiczenia',
  simulation: 'symulacje',
  other: '',
  info: '',
};

/** One class in a day list. The live class is a raised glass panel, the next one is pressed in. */
export function ClassRow({ block, state = 'none', progress = 0, remainingMin = 0, untilLabel, dateLabel, onOpen, divided }: ClassRowProps) {
  const { numberOf } = useApp();
  const count = numberOf(block);
  const divider = divided && <span aria-hidden="true" className="absolute inset-x-4 top-0 h-px bg-line" />;

  const { event } = block;

  if (block.kind === 'info') {
    return (
      <div className="relative flex items-start gap-3 px-4 py-3.5 text-ink-2">
        {divider}
        <Info size={18} className="mt-0.5 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold leading-[21px] text-ink">{event.title}</span>
          {event.notes && <span className="text-[13px] leading-[19px]">{event.notes}</span>}
        </div>
      </div>
    );
  }

  const accent = getGroupColor(block.groups[0]);
  const accent2 = getGroupColor(block.groups[1] ?? block.groups[0]);
  const live = state === 'live';
  const next = state === 'next';

  return (
    <div
      // The live class floats as a glass card; the inset padding keeps its text on the same columns as the other rows.
      // The next class is pressed in across the full width of the day card.
      className={`relative isolate grid grid-cols-[52px_minmax(0,1fr)] gap-x-3.5 overflow-hidden ${
        live ? 'm-1.5 rounded-[14px] px-2.5 py-2' : next ? 'bg-pressed px-4 py-3.5 shadow-press' : 'px-4 py-3.5'
      }`}
      style={live ? {
        boxShadow: `0 6px 16px -8px color-mix(in oklab, ${accent} 70%, transparent), 0 1px 2px rgba(28,25,23,.06)`,
      } : undefined}
    >
      {live && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
            <span className="absolute -left-12 -top-20 h-[200px] w-[200px] rounded-full opacity-[.55] blur-[38px]" style={{ background: accent }} />
            <span className="absolute -bottom-24 -right-10 h-[190px] w-[190px] rounded-full opacity-[.45] blur-[42px]" style={{ background: accent2 }} />
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
            style={{
              background: 'var(--glass-fill)',
              WebkitBackdropFilter: 'blur(22px) saturate(180%)',
              backdropFilter: 'blur(22px) saturate(180%)',
              boxShadow: 'inset 0 0 0 1px var(--glass-rim), inset 0 1.5px 0 var(--glass-hi), inset 0 -1px 0 rgba(255,255,255,.25)',
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-px top-px -z-10 h-[46%]"
            style={{
              borderRadius: '13px 13px 40% 40% / 13px 13px 18px 18px',
              background: 'linear-gradient(180deg, var(--glass-sheen), rgba(255,255,255,0))',
            }}
          />
        </>
      )}

      {divider}

      {onOpen && (
        <button
          type="button"
          aria-label={`Szczegóły: ${event.title}, ${block.start}–${block.end}${count ? `, zajęcia ${count.n} z ${count.total}` : ''}${block.makeup ? ', odrabianie' : ''}`}
          onClick={onOpen}
          className="absolute inset-0 z-[1] rounded-[inherit] transition-colors active:bg-ink/[.04]"
        />
      )}

      <div className="flex flex-col gap-0.5 tabular-nums text-sm font-medium leading-5">
        {dateLabel && <span className="mb-0.5 font-sans text-xs font-semibold text-ink-2">{dateLabel}</span>}
        <span>{block.start}</span>
        <span className="text-[13px] font-normal text-ink-2">{block.end}</span>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className={`flex flex-wrap gap-1 ${block.madeUpOn ? 'grayscale' : ''}`}>
            <GroupTags groups={block.groups} everyone={block.everyone} />
          </span>
          {block.makeup && (
            <span className="ml-1 inline-flex h-[22px] items-center gap-1 rounded-full bg-hero pl-1.5 pr-2 text-xs font-semibold text-hero-ink">
              <Redo size={12} strokeWidth={2.6} />
              Odrabianie
            </span>
          )}
          {live && (
            <span
              className="gloss ml-1 inline-flex h-[22px] items-center gap-1.5 rounded-full pl-2 pr-2.5 text-xs font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              <span className="live-dot text-white" />
              Trwa teraz
            </span>
          )}
          {next && untilLabel && (
            <span className="ml-1 text-xs font-semibold text-ink-2">Następne · {untilLabel}</span>
          )}
          {!live && !next && !block.makeup && KIND_TEXT[block.kind] && (
            <span className="ml-1 text-xs text-ink-2">{KIND_TEXT[block.kind]}</span>
          )}
          {count && <ClassCount n={count.n} total={count.total} className="ml-auto pl-2" />}
        </div>

        <div className={`text-[15px] font-semibold leading-[21px] [overflow-wrap:anywhere] ${block.madeUpOn ? 'text-ink-2' : ''}`}>{event.title}</div>

        {block.mode !== 'unknown' && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium leading-[19px]">
            <ModeBadge mode={block.mode} />
            {block.mode === 'onsite' && event.location && <span>{event.location}</span>}
          </div>
        )}

        {event.instructor && (
          <div className="flex items-center gap-1.5 text-[13px] leading-[19px] text-ink-2">
            <UserIcon size={14} className="shrink-0" />
            <span>{event.instructor}</span>
          </div>
        )}

        {block.makeup && (
          <div className="mt-0.5 flex items-start gap-1.5 text-[13px] font-semibold leading-[18px]">
            <Redo size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
            <span>Z grupą {block.groups.join(' · ')}, zamiast {shortDateLabel(parseDate(block.makeup.date))}</span>
          </div>
        )}

        {block.madeUpOn && (
          <div className="mt-0.5 flex items-start gap-1.5 text-[13px] font-semibold leading-[18px] text-ink-2">
            <Redo size={14} strokeWidth={2.2} className="mt-0.5 shrink-0" />
            <span>Odrabiasz: {shortDateLabel(parseDate(block.madeUpOn.date))}, {block.madeUpOn.start}, z grupą {block.madeUpOn.groups.join(' · ')}</span>
          </div>
        )}

        {live && (
          <div className="mt-1.5 flex items-center gap-2.5">
            <div
              role="progressbar"
              aria-label="Postęp zajęć"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full"
              style={{ background: 'var(--glass-track)', boxShadow: 'inset 0 1px 2px rgba(28,25,23,.14)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: accent,
                  backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 60%)',
                }}
              />
            </div>
            <span className="shrink-0 text-xs text-ink-2">
              pozostało: <span className="tabular-nums font-semibold text-ink">{durationLabel(remainingMin)}</span>
            </span>
          </div>
        )}

        {event.notes && (
          <div className="mt-1 flex items-center gap-1.5 self-start rounded-lg bg-note px-2.5 py-1 text-[13px] font-medium leading-[18px] text-note-ink">
            <Info size={14} className="shrink-0" />
            <span>{event.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
