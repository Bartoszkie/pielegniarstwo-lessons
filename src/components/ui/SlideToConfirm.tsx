import { useEffect, useRef, useState } from 'react';
import { Check } from './icons';

const KNOB = 52;
const PAD = 4;

interface SlideToConfirmProps {
  label: string;
  /** Shown on the dark track once confirmed */
  doneLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
}

/**
 * A track with a round knob: drag it to the right end, or just tap the track, to confirm.
 * A drag that stops short springs back.
 */
export function SlideToConfirm({ label, doneLabel, onConfirm, disabled = false }: SlideToConfirmProps) {
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const drag = useRef<{ x0: number; from: number; max: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const finish = () => {
    if (done || disabled) return;
    setDragging(false);
    setProgress(1);
    setDone(true);
    // Let the knob reach the end before moving on
    timer.current = window.setTimeout(onConfirm, 380);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (done || disabled) return;
    const track = e.currentTarget;
    const scale = track.getBoundingClientRect().width / track.offsetWidth || 1;
    track.setPointerCapture(e.pointerId);
    drag.current = { x0: e.clientX, from: progress, max: (track.offsetWidth - KNOB - PAD * 2) * scale, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > 4) d.moved = true;
    setProgress(Math.max(0, Math.min(1, d.from + dx / d.max)));
  };

  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    // The click that follows this press is handled here
    skipClick.current = true;
    if (!d.moved || progress > 0.85) {
      finish();
    } else {
      setDragging(false);
      setProgress(0);
    }
  };

  const onPointerCancel = () => {
    drag.current = null;
    setDragging(false);
    setProgress(0);
  };

  const onClick = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    finish();
  };

  const ease = dragging ? 'none' : 'left .32s cubic-bezier(.2,.8,.2,1), width .32s cubic-bezier(.2,.8,.2,1), opacity .3s ease';
  const travel = `(100% - ${KNOB + PAD * 2}px)`;

  if (disabled) {
    return (
      <div aria-disabled="true" className="relative flex h-[60px] items-center justify-center rounded-full bg-surface-2 pl-14 text-[15px] font-semibold text-ink-2 shadow-[inset_0_2px_6px_rgba(28,25,23,.08)]">
        {label}
        <span aria-hidden="true" className="absolute left-1 top-1 grid h-[52px] w-[52px] place-items-center rounded-full bg-line-strong text-surface">
          <Arrow />
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={done ? doneLabel : `${label}: przesuń w prawo albo naciśnij`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClick={onClick}
      className={`relative block h-[60px] w-full touch-none select-none overflow-hidden rounded-full ${
        done ? 'bg-ink text-bg' : 'cursor-grab bg-pressed shadow-press active:cursor-grabbing'
      }`}
    >
      {!done && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded-full bg-ink"
            style={{ width: `calc(${progress} * ${travel} + ${KNOB + PAD * 2}px)`, opacity: 0.08 + progress * 0.8, transition: ease }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 pl-14 text-[15px] font-semibold"
            style={{ opacity: Math.max(0, 1 - progress * 1.8), transition: dragging ? 'none' : 'opacity .3s ease' }}
          >
            <span className="slide-shine">{label}</span>
            <svg className="slide-nudge text-ink-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 17l5-5-5-5" /><path d="M13 17l5-5-5-5" />
            </svg>
          </span>
        </>
      )}
      {done && (
        <span className="absolute inset-0 flex items-center justify-center pr-14 text-[15px] font-semibold">{doneLabel}</span>
      )}
      <span
        aria-hidden="true"
        className={`absolute top-1 grid h-[52px] w-[52px] place-items-center rounded-full shadow-[0_6px_14px_-4px_rgba(28,25,23,.55),0_1px_2px_rgba(28,25,23,.3)] ${
          done ? 'bg-bg text-ink' : 'bg-ink text-bg'
        }`}
        style={{
          backgroundImage: done ? undefined : 'linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,0) 55%)',
          left: `calc(${PAD}px + ${progress} * ${travel})`,
          transform: dragging ? 'scale(1.04)' : 'scale(1)',
          transition: dragging ? 'transform .15s ease' : `${ease}, transform .15s ease`,
        }}
      >
        {done ? <Check size={22} strokeWidth={3} /> : <Arrow />}
      </span>
    </button>
  );
}

function Arrow() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
    </svg>
  );
}
