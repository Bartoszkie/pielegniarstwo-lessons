import { toast } from 'sonner';
import { useApp } from '../../app/AppContext';
import { ClassBlock } from '../../utils/blocks';
import { durationLabel, getDayLabel, parseDate, capitalize, shortDateLabel } from '../../utils/dateUtils';
import { KIND_LABELS } from '../../utils/eventUtils';
import { ClassCount } from '../ui/ClassCount';
import { GroupTags } from '../ui/GroupTag';
import { Clock, Close, Info, MapPin, Redo, UserIcon } from '../ui/icons';
import { ModeBadge } from '../ui/ModeBadge';

/** Details of one class, shown in a popover next to its block. */
export function BlockDetails({ block, onClose }: { block: ClassBlock; onClose: () => void }) {
  const { numberOf, canMakeup, startMakeup, removeMakeup } = useApp();
  const { event } = block;
  const count = numberOf(block);
  const makeupId = block.makeup?.id ?? block.madeUpOn?.id;
  const undo = () => {
    if (!makeupId) return;
    removeMakeup(makeupId);
    onClose();
    toast.success('Usunięto odrabianie z Twojego planu.');
  };
  return (
    <div className="flex w-[300px] flex-col gap-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-ink-2">{capitalize(getDayLabel(parseDate(block.date)))}</span>
        <button type="button" aria-label="Zamknij" onClick={onClose} className="-my-1.5 -mr-1.5 grid h-8 w-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2">
          <Close size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <GroupTags groups={block.groups} everyone={block.everyone} />
          <span className="mx-1 text-xs text-ink-2">{KIND_LABELS[block.kind].toLowerCase()}</span>
          <ModeBadge mode={block.mode} />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="text-lg font-bold leading-6 tracking-[-0.01em] [overflow-wrap:anywhere]">{event.title}</div>
          {count && <ClassCount n={count.n} total={count.total} className="mt-1 shrink-0" />}
        </div>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Clock size={16} className="shrink-0 text-ink-2" />
          <span className="tabular-nums font-medium">{block.start} – {block.end}</span>
          <span className="text-ink-2">· {durationLabel(block.endMin - block.startMin)}</span>
        </div>
        {!event.online && event.location && (
          <div className="flex items-center gap-2 font-medium">
            <MapPin size={16} className="shrink-0 text-ink-2" />
            <span>{event.location}</span>
          </div>
        )}
        {event.instructor && (
          <div className="flex items-center gap-2 text-ink-2">
            <UserIcon size={16} className="shrink-0" />
            <span className="text-ink">{event.instructor}</span>
          </div>
        )}
      </div>
      {event.notes && (
        <div className="flex items-center gap-2 rounded-[9px] bg-note px-2.5 py-2 text-[13px] font-medium text-note-ink">
          <Info size={14} className="shrink-0" />
          <span>{event.notes}</span>
        </div>
      )}
      {block.makeup && (
        <div className="flex flex-col gap-2 rounded-xl bg-hero p-3 text-[13px] leading-[18px] text-hero-ink">
          <span className="flex gap-2">
            <Redo size={16} className="mt-px shrink-0" />
            <span><span className="font-bold">Odrabianie z grupą {block.groups.join(' · ')}</span>, zamiast {shortDateLabel(parseDate(block.makeup.date))}, {block.makeup.start}.</span>
          </span>
          <button type="button" onClick={undo} className="h-8 self-start rounded-full bg-white/15 px-3 text-[13px] font-semibold hover:bg-white/25">Usuń z planu</button>
        </div>
      )}
      {block.madeUpOn && (
        <div className="flex flex-col gap-2 rounded-xl border border-line bg-bg p-3 text-[13px] leading-[18px]">
          <span className="flex gap-2">
            <Redo size={16} className="mt-px shrink-0" />
            <span><span className="font-bold">Odrabiasz: {shortDateLabel(parseDate(block.madeUpOn.date))}, {block.madeUpOn.start}</span> z grupą {block.madeUpOn.groups.join(' · ')}.</span>
          </span>
          <button type="button" onClick={undo} className="raised h-8 self-start rounded-full px-3 text-[13px] font-semibold">Usuń odrabianie</button>
        </div>
      )}
      {canMakeup && count && !block.makeup && !block.madeUpOn && !block.everyone && (
        <button
          type="button"
          onClick={() => { onClose(); startMakeup(block); }}
          className="raised flex h-10 items-center justify-center gap-2 rounded-[10px] text-sm font-semibold"
        >
          <Redo size={16} />
          Odrób z inną grupą
        </button>
      )}
    </div>
  );
}
