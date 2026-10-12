import { useApp } from '../../app/AppContext';
import { ClassBlock, isClass, layoutLanes } from '../../utils/blocks';
import { addDays, durationLabel, formatDate, WEEKDAYS_SHORT } from '../../utils/dateUtils';
import { getGroupColor, groupTint } from '../../constants/groupColors';
import { GroupTags } from '../ui/GroupTag';
import { Info } from '../ui/icons';
import { ClassPopover } from './ClassPopover';

const HOUR_PX = 64;

interface WeekGridProps {
  selectedId: string | null;
  onToggle: (id: string, open: boolean) => void;
}

export function WeekGrid({ selectedId, onToggle }: WeekGridProps) {
  const { calendar, visibleByDate, todayKey, now, live, hasSelection, schedule } = useApp();
  const days = Array.from({ length: 7 }, (_, i) => addDays(calendar.weekStart, i));
  const keys = days.map(formatDate);
  const weekBlocks = keys.flatMap(key => (visibleByDate[key] ?? []).filter(isClass));

  // Only show the hours this week actually uses (at least 8:00–16:00)
  let fromHour = 8;
  let toHour = 16;
  if (weekBlocks.length) {
    fromHour = Math.min(8, Math.floor(Math.min(...weekBlocks.map(b => b.startMin)) / 60));
    toHour = Math.max(16, Math.ceil(Math.max(...weekBlocks.map(b => b.endMin)) / 60));
  }
  const hours = Array.from({ length: toHour - fromHour + 1 }, (_, i) => fromHour + i);
  const gridHeight = (toHour - fromHour) * HOUR_PX;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMin - fromHour * 60) / 60) * HOUR_PX;
  const showNow = keys.includes(todayKey) && nowMin >= fromHour * 60 && nowMin <= toHour * 60;

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-line">
          <div />
          {days.map((date, i) => {
            const key = keys[i];
            const isToday = key === todayKey;
            const notices = (visibleByDate[key] ?? []).filter(b => !isClass(b));
            return (
              <div key={key} className="flex min-h-[56px] flex-col justify-center gap-0.5 border-l border-line px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-ink-2">{WEEKDAYS_SHORT[i]}</span>
                  <span className={`inline-grid h-[30px] min-w-[30px] place-items-center rounded-full text-[17px] font-semibold ${isToday ? 'bg-ink text-bg' : i >= 5 ? 'text-ink-2' : ''}`}>
                    {date.getDate()}
                  </span>
                </div>
                {notices.map(n => (
                  <span key={n.id} className="flex items-center gap-1 text-[11px] font-medium leading-4 text-ink-2" title={n.event.notes || undefined}>
                    <Info size={12} className="shrink-0" />
                    <span className="truncate">{n.event.title}</span>
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        <div className="relative pb-4 pt-3">
          <div className="relative grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map(h => (
                <span key={h} className="absolute right-2.5 -translate-y-1/2 font-mono text-xs text-ink-2" style={{ top: (h - fromHour) * HOUR_PX }}>
                  {String(h).padStart(2, '0')}:00
                </span>
              ))}
              {showNow && (
                <span className="absolute right-1.5 z-[4] -translate-y-1/2 rounded-[5px] bg-ink px-1.5 py-px font-mono text-xs font-semibold text-bg" style={{ top: nowTop }}>
                  {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
                </span>
              )}
            </div>
            {hours.map(h => (
              <div key={h} aria-hidden="true" className="absolute left-16 right-0 h-px bg-surface-2" style={{ top: (h - fromHour) * HOUR_PX }} />
            ))}
            {keys.map((key, i) => {
              const blocks = (visibleByDate[key] ?? []).filter(isClass);
              return (
                <div key={key} className={`relative border-l border-line ${i >= 5 ? 'bg-bg/40' : ''}`} style={{ height: gridHeight }}>
                  {layoutLanes(blocks).map(({ block, lane, lanes }) => (
                    <GridBlock
                      key={block.id}
                      block={block}
                      top={((block.startMin - fromHour * 60) / 60) * HOUR_PX}
                      lane={lane}
                      lanes={lanes}
                      state={key === todayKey && live.current?.id === block.id ? 'live' : key === todayKey && live.next?.id === block.id ? 'next' : 'none'}
                      progress={live.progress}
                      remainingMin={live.remainingMin}
                      untilMin={live.untilNextMin}
                      selected={selectedId === block.id}
                      onOpenChange={open => onToggle(block.id, open)}
                      flip={i >= 4}
                    />
                  ))}
                  {showNow && key === todayKey && (
                    <div aria-hidden="true" className="pointer-events-none absolute -left-px right-0 z-[2] h-0.5 bg-ink" style={{ top: nowTop }}>
                      <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-ink" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!hasSelection && (
            <div className="absolute inset-0 grid place-items-center bg-surface/70">
              <div className="flex max-w-[320px] flex-col items-center gap-1.5 rounded-[14px] border border-line bg-surface px-6 py-5 text-center shadow-pop">
                <span className="text-base font-semibold">{schedule.mode === 'teacher' ? 'Nie wybrano wykładowcy' : 'Nie wybrano żadnej grupy'}</span>
                <span className="text-sm text-ink-2">Zaznacz {schedule.mode === 'teacher' ? 'prowadzących' : 'swoją grupę'} w panelu po lewej, żeby zobaczyć zajęcia.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface GridBlockProps {
  block: ClassBlock;
  top: number;
  lane: number;
  lanes: number;
  state: 'live' | 'next' | 'none';
  progress: number;
  remainingMin: number;
  untilMin: number;
  selected: boolean;
  onOpenChange: (open: boolean) => void;
  flip: boolean;
}

function GridBlock({ block, top, lane, lanes, state, progress, remainingMin, untilMin, selected, onOpenChange, flip }: GridBlockProps) {
  const height = ((block.endMin - block.startMin) / 60) * HOUR_PX;
  const single = block.groups.length === 1;
  const accent = getGroupColor(block.groups[0]);
  const accent2 = getGroupColor(block.groups[1] ?? block.groups[0]);
  const live = state === 'live';
  const next = state === 'next';
  const ring = selected ? ', 0 0 0 2px rgb(var(--ink))' : '';

  const style: React.CSSProperties = {
    top: top + 2,
    height: Math.max(22, height - 4),
    left: `calc(${(lane * 100) / lanes}% + 4px)`,
    width: `calc(${100 / lanes}% - 8px)`,
  };
  if (live) {
    Object.assign(style, {
      zIndex: 3,
      transform: 'translateY(-2px)',
      boxShadow: `0 14px 28px -12px color-mix(in oklab, ${accent} 75%, transparent), 0 2px 6px rgba(28,25,23,.1)${ring}`,
    });
  } else if (next) {
    Object.assign(style, { boxShadow: `var(--shadow-press)${ring}`, zIndex: selected ? 2 : undefined });
  } else {
    Object.assign(style, single
      ? { background: groupTint(block.groups[0]), border: `1px solid color-mix(in oklab, ${accent} 26%, rgb(var(--surface)))` }
      : { background: 'rgb(var(--bg))', border: '1px solid rgb(var(--line))' });
    if (selected) Object.assign(style, { boxShadow: '0 0 0 2px rgb(var(--ink))', zIndex: 2 });
  }

  const place = block.event.online ? 'Online' : block.event.location;

  return (
    <ClassPopover block={block} open={selected} onOpenChange={onOpenChange} flip={flip}>
      <button
        type="button"
        aria-label={`${block.event.title}, ${block.start}–${block.end}, grupy ${block.groups.join(', ')}`}
        className={`absolute isolate flex flex-col items-start gap-[3px] overflow-hidden rounded-[10px] px-2 pb-1.5 pt-2.5 text-left text-ink ${next ? 'pressed' : ''}`}
        style={style}
      >
        {live ? (
          <>
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden rounded-[inherit]">
              <span className="absolute -left-9 -top-11 h-[130px] w-[130px] rounded-full opacity-60 blur-[28px]" style={{ background: accent }} />
              <span className="absolute -bottom-14 -right-9 h-[130px] w-[130px] rounded-full opacity-50 blur-[30px]" style={{ background: accent2 }} />
            </span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit]"
              style={{
                background: 'var(--glass-fill)',
                WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                backdropFilter: 'blur(18px) saturate(180%)',
                boxShadow: 'inset 0 0 0 1px var(--glass-rim), inset 0 1.5px 0 var(--glass-hi), inset 0 -1px 0 rgba(255,255,255,.3)',
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-px top-px -z-10 h-[42%]"
              style={{ borderRadius: '9px 9px 40% 40% / 9px 9px 14px 14px', background: 'linear-gradient(180deg, var(--glass-sheen), rgba(255,255,255,0))' }}
            />
          </>
        ) : (
          <span aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1">
            {block.groups.map(g => <span key={g} className="flex-1" style={{ background: getGroupColor(g) }} />)}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-[3px]">
          <GroupTags groups={block.groups} size="sm" />
          {live && (
            <span className="gloss inline-flex h-[18px] items-center gap-1 rounded-full pl-1.5 pr-1.5 text-[11px] font-semibold text-white" style={{ backgroundColor: accent }}>
              <span className="live-dot text-white" />Trwa
            </span>
          )}
          {next && untilMin > 0 && <span className="text-[11px] font-semibold text-ink-2">za {durationLabel(untilMin)}</span>}
        </span>
        {live && (
          <span className="flex w-full flex-col gap-[3px] py-0.5">
            <span className="relative block h-[5px] w-full overflow-hidden rounded-full" style={{ background: 'var(--glass-track)', boxShadow: 'inset 0 1px 2px rgba(28,25,23,.16)' }}>
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progress}%`, backgroundColor: accent, backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 60%)' }} />
            </span>
            <span className="text-[11px] leading-[14px] text-ink-2">pozostało: <span className="font-mono font-semibold text-ink">{durationLabel(remainingMin)}</span></span>
          </span>
        )}
        <span className="font-mono text-xs leading-4 text-ink-2">{block.start}–{block.end}</span>
        <span className="line-clamp-3 text-[13px] font-semibold leading-[17px]">{block.event.title}</span>
        {place && <span className="text-xs leading-4 text-ink-2">{place}</span>}
      </button>
    </ClassPopover>
  );
}
