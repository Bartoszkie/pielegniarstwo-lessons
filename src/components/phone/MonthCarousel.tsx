import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { usePeriodStep } from '../../hooks/usePeriodStep';
import { isClass } from '../../utils/blocks';
import { getGroupColor } from '../../constants/groupColors';
import { classesLabel, formatDate, getDayLabel, getMonthDays, getMonthLabel, isSameDay, isSameMonth, WEEKDAYS_NARROW } from '../../utils/dateUtils';
import { GroupId } from '../../types';
import { Redo } from '../ui/icons';

/** Movement before a press becomes a drag */
const SLOP = 8;
/** Share of the grid's width a drag must pass to change month */
const COMMIT_RATIO = 0.25;
/** Release speed (px/ms) that changes month however short the drag */
const FLICK_SPEED = 0.45;
const SNAP_MS = 320;
const EASE = 'cubic-bezier(.2,.8,.2,1)';
/** Space between the two months while they slide */
const GAP = 16;
/** While moving, the months fade out at the card's sides instead of being cut */
const EDGE_FADE = 'linear-gradient(to right, transparent, #000 12px, #000 calc(100% - 12px), transparent)';

interface Drag {
  id: number;
  x0: number;
  y0: number;
  active: boolean;
  /** Size of the month on screen when the drag started */
  width: number;
  height: number;
  dx: number;
  samples: { t: number; x: number }[];
}

type Direction = 1 | -1 | 0;

/**
 * The month grid as a carousel: swipe left for the next month (it comes in from the right),
 * right for the previous one. The neighbouring month only shows while dragging, under the fixed
 * row of weekdays; a drag that stops short springs back. Taps still pick a day, and vertical
 * drags still scroll the page.
 */
export function MonthCarousel() {
  const { calendar, kind } = useApp();
  const { cursor } = calendar;
  const step = usePeriodStep();
  const monthKey = `${formatDate(cursor).slice(0, 7)}|${kind}`;

  // Which neighbour is mounted: +1 the next month (on the right), -1 the previous one (on the left)
  const [dir, setDirState] = useState<Direction>(0);
  const dirRef = useRef<Direction>(0);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const current = useRef<HTMLDivElement>(null);
  const neighbour = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const drag = useRef<Drag | null>(null);
  const settling = useRef(false);
  const skipClick = useRef(false);
  /** The month reached by a swipe slides in, so it skips the fade-in */
  const swipedTo = useRef<string | null>(null);
  const frame = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  const setDir = (value: Direction) => {
    if (dirRef.current === value) return;
    dirRef.current = value;
    setDirState(value);
  };

  /** Moves the months by `x` px and shows the pill while dragging; `ms` animates the move */
  const move = (x: number, ms = 0, pillOpacity = 0) => {
    const transition = ms ? `${ms}ms ${EASE}` : '';
    if (track.current) {
      track.current.style.transition = transition && `transform ${transition}`;
      track.current.style.transform = x ? `translateX(${x}px)` : '';
    }
    if (pill.current) {
      pill.current.style.transition = transition && `opacity ${transition}`;
      pill.current.style.opacity = String(pillOpacity);
    }
  };

  /** Pins the viewport to `height` px with the edge fade, or (null) lets it follow its month again */
  const pin = (height: number | null) => {
    const el = viewport.current;
    if (!el) return;
    el.style.height = height === null ? '' : `${height}px`;
    el.style.maskImage = el.style.webkitMaskImage = height === null ? '' : EDGE_FADE;
  };

  const settle = (then: () => void) => {
    settling.current = true;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(then, SNAP_MS + 20);
  };

  // Once the month changes (by a swipe or anything else) the new one sits still in place
  useLayoutEffect(() => {
    window.clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    move(0);
    if (viewport.current) viewport.current.style.transition = '';
    pin(null);
    settling.current = false;
    drag.current = null;
    setDir(0);
  }, [monthKey]);

  useEffect(() => () => {
    window.clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
  }, []);

  const springBack = () => {
    move(0, SNAP_MS);
    settle(() => {
      settling.current = false;
      pin(null);
      setDir(0);
    });
  };

  const snap = (direction: 1 | -1, width: number, height: number) => {
    const target = neighbour.current?.offsetHeight ?? height;
    move(-direction * (width + GAP), SNAP_MS);
    if (viewport.current) {
      viewport.current.style.transition = `height ${SNAP_MS}ms ${EASE}`;
      viewport.current.style.height = `${target}px`;
    }
    const month = new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1);
    settle(() => {
      swipedTo.current = `${formatDate(month).slice(0, 7)}|${kind}`;
      step(direction);
    });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // A press clears a skip left over from a drag that produced no click
    skipClick.current = false;
    if (settling.current || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, active: false, width: 0, height: 0, dx: 0, samples: [] };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SLOP) return;
      // Up and down scrolls the page
      if (Math.abs(dy) >= Math.abs(dx)) {
        drag.current = null;
        return;
      }
      d.active = true;
      d.width = current.current?.offsetWidth ?? 0;
      d.height = current.current?.offsetHeight ?? 0;
      e.currentTarget.setPointerCapture(e.pointerId);
      pin(d.height);
    }
    d.dx = Math.max(-d.width, Math.min(d.width, dx));
    d.samples.push({ t: e.timeStamp, x: e.clientX });
    while (d.samples.length > 2 && e.timeStamp - d.samples[0].t > 100) d.samples.shift();
    if (d.dx) setDir(d.dx < 0 ? 1 : -1);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => move(d.dx, 0, Math.min(1, Math.abs(d.dx) / (d.width * COMMIT_RATIO))));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.active) return;
    // The click that ends a drag must not pick a day
    skipClick.current = true;
    cancelAnimationFrame(frame.current);
    const recent = d.samples.filter(s => e.timeStamp - s.t <= 100);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const velocity = recent.length > 1 ? (last.x - first.x) / Math.max(1, last.t - first.t) : 0;
    const direction = dirRef.current;
    // Speed towards the neighbour: a flick commits, a flick back cancels
    const towards = -velocity * direction;
    const commit = direction !== 0 && (towards > FLICK_SPEED || (Math.abs(d.dx) > d.width * COMMIT_RATIO && towards > -FLICK_SPEED));
    if (commit) snap(direction, d.width, d.height);
    else springBack();
  };

  const onPointerCancel = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.active) springBack();
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (!skipClick.current) return;
    skipClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const neighbourMonth = dir ? new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1) : null;

  return (
    <div className="rounded-2xl border border-line bg-surface px-2 pb-1 pt-2.5">
      <div className="grid grid-cols-7 pb-0.5">
        {WEEKDAYS_NARROW.map(day => (
          <span key={day} className="text-center text-xs font-medium text-ink-2">{day}</span>
        ))}
      </div>
      <div
        ref={viewport}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
        className="relative touch-pan-y select-none overflow-hidden"
      >
        <div ref={track} className="relative">
          {neighbourMonth && (
            <div ref={neighbour} inert aria-hidden="true" className="absolute top-0 w-full" style={{ [dir === 1 ? 'left' : 'right']: `calc(100% + ${GAP}px)` }}>
              <MonthDays month={neighbourMonth} />
            </div>
          )}
          {/* A month reached any other way (or a new filter) fades in */}
          <div ref={current} key={monthKey} className={swipedTo.current === monthKey ? '' : 'enter'}>
            <MonthDays month={cursor} />
          </div>
        </div>
        <span
          ref={pill}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-bg opacity-0 shadow-pop"
        >
          {neighbourMonth && getMonthLabel(neighbourMonth)}
        </span>
      </div>
    </div>
  );
}

/** One month's day cells with group dots; the cursor's day is marked when it falls in this month. */
function MonthDays({ month }: { month: Date }) {
  const { calendar, visibleByDate, todayKey } = useApp();
  const { cursor } = calendar;
  const days = getMonthDays(month.getFullYear(), month.getMonth());

  return (
    // The padding keeps today's ring inside the clipped viewport
    <div className="grid grid-cols-7 gap-y-0.5 py-1">
      {days.map(date => {
        const key = formatDate(date);
        const inMonth = isSameMonth(date, month);
        const blocks = inMonth ? visibleByDate[key] ?? [] : [];
        const classes = blocks.filter(isClass);
        const hasInfo = blocks.length > classes.length;
        const groups: GroupId[] = [];
        classes.filter(b => !b.makeup).forEach(b => b.groups.forEach(g => { if (!groups.includes(g)) groups.push(g); }));
        const hasMakeup = classes.some(b => b.makeup);
        const isToday = key === todayKey;
        const isSel = isSameDay(date, cursor);
        const numberClass = isToday
          ? 'bg-ink text-bg font-semibold'
          : isSel
            ? 'shadow-[inset_0_0_0_1.5px_rgb(var(--ink))] font-semibold'
            : !inMonth
              ? 'text-line-strong'
              : classes.length
                ? 'font-semibold'
                : 'text-ink-3';
        return (
          <button
            key={key}
            type="button"
            disabled={!inMonth}
            aria-pressed={isSel}
            aria-label={`${getDayLabel(date)}${classes.length ? `, ${classesLabel(classes.length)}` : ''}${hasMakeup ? ', odrabianie' : ''}`}
            onClick={() => calendar.setCursor(date)}
            className="flex h-[52px] flex-col items-center gap-1 pt-0.5"
          >
            <span
              className={`grid h-[34px] w-[34px] place-items-center rounded-full text-[15px] ${numberClass} ${
                isToday && isSel ? 'shadow-[0_0_0_2px_rgb(var(--surface)),0_0_0_3.5px_rgb(var(--ink))]' : ''
              }`}
            >
              {date.getDate()}
            </span>
            <span className="flex h-1.5 items-center gap-[3px]">
              {hasMakeup && (
                <span className="-my-[3px] grid h-3 w-[18px] place-items-center rounded-full bg-hero text-hero-ink">
                  <Redo size={9} strokeWidth={3} />
                </span>
              )}
              {groups.slice(0, hasMakeup ? 2 : 3).map(g => (
                <span key={g} className="h-1.5 w-1.5 rounded-full" style={{ background: getGroupColor(g) }} />
              ))}
              {!classes.length && hasInfo && <span className="h-0.5 w-2.5 self-center rounded-full bg-ink-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
