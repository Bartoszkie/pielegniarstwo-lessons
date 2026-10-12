import { useApp } from '../../app/AppContext';
import { ChevronRight, Redo } from '../ui/icons';

/** "Odrabianie zajęć", right under Grupy / Wykładowcy. Pressed in while odrabianie is open. */
export function MakeupEntry({ compact = false, onStart }: { compact?: boolean; onStart?: () => void }) {
  const { canMakeup, startMakeup, makeupFlow, makeups, schedule, todayKey } = useApp();
  if (!canMakeup) return null;

  const active = !!makeupFlow;
  const current = makeupFlow && makeupFlow.step !== 'subject' ? makeupFlow.key.split('|')[0] : '';
  const planned = makeups.filter(m => schedule.selectedGroups.has(m.group) && m.date >= todayKey).length;
  const hint = current
    ? `Teraz: ${current}${makeupFlow?.step === 'results' ? `, nr ${makeupFlow.n}` : ''}`
    : planned
      ? `Zaplanowane: ${planned}`
      : 'Znajdź ten sam temat w innej grupie';

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => {
        onStart?.();
        startMakeup();
      }}
      className={`grid w-full grid-cols-[36px_minmax(0,1fr)_18px] items-center gap-x-3 py-2.5 pl-2.5 pr-3 text-left ${
        compact ? 'min-h-[54px] rounded-xl' : 'min-h-[60px] rounded-[14px]'
      } ${active ? 'pressed' : 'raised'}`}
    >
      <span aria-hidden="true" className="gloss grid h-9 w-9 place-items-center rounded-[11px] bg-hero text-hero-ink">
        <Redo size={19} strokeWidth={2.1} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] font-bold leading-5">Odrabianie zajęć</span>
        <span className="truncate text-[13px] leading-[18px] text-ink-2">{hint}</span>
      </span>
      <ChevronRight size={18} strokeWidth={2.2} className="text-ink-2" />
    </button>
  );
}
