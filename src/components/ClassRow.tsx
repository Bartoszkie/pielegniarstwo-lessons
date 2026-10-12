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
  untilMin?: number;
  /** Shows the date above the time, used in search results */
  dateLabel?: string;
}

const KIND_TEXT: Record<string, string> = {
  lecture: 'wykład',
  exercise: 'ćwiczenia',
  simulation: 'symulacje',
  other: '',
  info: '',
};

/** One class in a day list. The live class is a raised glass panel, the next one is pressed in. */
export function ClassRow({ block, state = 'none', progress = 0, remainingMin = 0, untilMin = 0, dateLabel }: ClassRowProps) {
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
      className={`relative isolate grid grid-cols-[52px_minmax(0,1fr)] gap-x-3.5 overflow-hidden px-4 py-3.5 ${
        live ? 'm-1.5 rounded-[14px]' : next ? 'pressed mx-1.5 mb-1.5 rounded-[14px]' : ''
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

      <div className="flex flex-col gap-0.5 font-mono text-sm font-medium leading-5">
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
          {next && untilMin > 0 && (
            <span className="ml-1 text-xs font-semibold text-ink-2">za {durationLabel(untilMin)}</span>
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
              pozostało: <span className="font-mono font-semibold text-ink">{durationLabel(remainingMin)}</span>
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
