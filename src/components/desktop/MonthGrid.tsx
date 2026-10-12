import { useApp } from '../../app/AppContext';
import { isClass } from '../../utils/blocks';
import { classesLabel, formatDate, getDayLabel, getMonthDays, isSameMonth, WEEKDAYS_SHORT } from '../../utils/dateUtils';
import { getGroupColor, groupTint } from '../../constants/groupColors';
import { Info, Video } from '../ui/icons';
import { ClassPopover } from './ClassPopover';

interface MonthGridProps {
  selectedId: string | null;
  onToggle: (id: string, open: boolean) => void;
}

/** Desktop month view. A class opens its details in place; the day number opens that week. */
export function MonthGrid({ selectedId, onToggle }: MonthGridProps) {
  const { calendar, visibleByDate, todayKey } = useApp();
  const { cursor } = calendar;
  const days = getMonthDays(cursor.getFullYear(), cursor.getMonth());

  const openDay = (date: Date) => {
    calendar.setCursor(date);
    calendar.setView('week');
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-line">
          {WEEKDAYS_SHORT.map(day => (
            <span key={day} className="px-3 py-2.5 text-[13px] text-ink-2">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-b-[15px] bg-surface-2">
          {days.map((date, index) => {
            const key = formatDate(date);
            const inMonth = isSameMonth(date, cursor);
            const blocks = inMonth ? visibleByDate[key] ?? [] : [];
            const classes = blocks.filter(isClass);
            const notices = blocks.filter(b => !isClass(b));
            const isToday = key === todayKey;
            const weekend = index % 7 >= 5;
            return (
              <div
                key={key}
                className={`flex min-h-[124px] min-w-0 flex-col gap-[3px] p-2 ${!inMonth ? 'bg-bg' : weekend ? 'bg-bg/50' : 'bg-surface'}`}
              >
                <button
                  type="button"
                  disabled={!inMonth}
                  onClick={() => openDay(date)}
                  aria-label={`${getDayLabel(date)}${classes.length ? `, ${classesLabel(classes.length)}` : ''}. Otwórz tydzień`}
                  className={`mb-0.5 inline-grid h-[26px] min-w-[26px] place-items-center self-start rounded-full text-[13px] hover:bg-surface-2 ${
                    isToday ? 'bg-ink font-semibold text-bg hover:bg-ink' : !inMonth ? 'text-ink-3' : classes.length ? 'font-semibold' : 'text-ink-3'
                  }`}
                >
                  {date.getDate()}
                </button>
                {notices.map(n => (
                  <span key={n.id} className="flex items-center gap-1 text-[11px] font-medium text-ink-2">
                    <Info size={12} className="shrink-0" />
                    <span className="truncate">{n.event.title}</span>
                  </span>
                ))}
                {classes.slice(0, 3).map(block => {
                  const selected = selectedId === block.id;
                  return (
                    <ClassPopover key={block.id} block={block} open={selected} onOpenChange={open => onToggle(block.id, open)} flip={index % 7 >= 4}>
                      <button
                        type="button"
                        aria-label={`${block.event.title}, ${block.start}–${block.end}${block.mode === 'online' ? ', online' : ''}, ${block.everyone ? 'wszystkie grupy' : `grupy ${block.groups.join(', ')}`}`}
                        className="flex h-6 w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 text-left"
                        style={{
                          ...(block.groups.length === 1
                            ? { background: groupTint(block.groups[0]) }
                            : { background: 'rgb(var(--bg))', border: '1px solid rgb(var(--line))' }),
                          ...(selected && { boxShadow: '0 0 0 2px rgb(var(--ink))' }),
                        }}
                      >
                        <span aria-hidden="true" className="flex shrink-0 gap-0.5">
                          {block.groups.slice(0, 3).map(g => (
                            <span key={g} className="h-3 w-1.5 rounded-sm" style={{ background: getGroupColor(g) }} />
                          ))}
                        </span>
                        <span className="shrink-0 tabular-nums text-xs text-ink-2">{block.start}</span>
                        {block.mode === 'online' && <Video size={12} strokeWidth={2.2} className="shrink-0 text-online-ink" />}
                        <span className="min-w-0 truncate text-xs font-medium">{block.event.title}</span>
                      </button>
                    </ClassPopover>
                  );
                })}
                {classes.length > 3 && (
                  <button type="button" onClick={() => openDay(date)} className="self-start rounded-md px-1.5 py-0.5 text-xs font-semibold text-ink-2 hover:bg-surface-2">
                    +{classes.length - 3} więcej
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
