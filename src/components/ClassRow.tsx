import { ClassBlock } from '../utils/blocks';
import { getGroupColor } from '../constants/groupColors';
import { durationLabel } from '../utils/dateUtils';
import { GroupTags } from './ui/GroupTag';
import { Info, MapPin, UserIcon, Video } from './ui/icons';

export type RowState = 'live' | 'next' | 'none';

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
}

const KIND_TEXT: Record<string, string> = {
  lecture: 'wykład',
  exercise: 'ćwiczenia',
  simulation: 'symulacje',
  other: '',
  info: '',
};

/** One class in a day list. The live class is a raised glass panel, the next one is pressed in. */
export function ClassRow({ block, state = 'none', progress = 0, remainingMin = 0, untilLabel, dateLabel, onOpen }: ClassRowProps) {
  const { event } = block;

  if (block.kind === 'info') {
    return (
      <div className="flex items-start gap-3 px-4 py-3.5 text-ink-2">
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

      {onOpen && (
        <button
          type="button"
          aria-label={`Szczegóły: ${event.title}, ${block.start}–${block.end}`}
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
          <GroupTags groups={block.groups} />
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
          {!live && !next && KIND_TEXT[block.kind] && (
            <span className="ml-1 text-xs text-ink-2">{KIND_TEXT[block.kind]}</span>
          )}
        </div>

        <div className="text-[15px] font-semibold leading-[21px] [overflow-wrap:anywhere]">{event.title}</div>

        {event.online ? (
          <div className="flex items-center gap-1.5 text-[13px] font-medium leading-[19px]">
            <Video size={14} className="shrink-0 text-ink-2" />
            <span>Online</span>
          </div>
        ) : event.location ? (
          <div className="flex items-center gap-1.5 text-[13px] font-medium leading-[19px]">
            <MapPin size={14} className="shrink-0 text-ink-2" />
            <span>{event.location}</span>
          </div>
        ) : null}

        {event.instructor && (
          <div className="flex items-center gap-1.5 text-[13px] leading-[19px] text-ink-2">
            <UserIcon size={14} className="shrink-0" />
            <span>{event.instructor}</span>
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
