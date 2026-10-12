import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { MakeupFlow, useApp } from '../../app/AppContext';
import { capitalize, DAY_NAMES_FULL, getDayLabel, MONTH_GENITIVE, parseDate, shortDateLabel } from '../../utils/dateUtils';
import { createSavedMakeup, MakeupOption } from '../../utils/makeup';
import { GroupTags } from '../ui/GroupTag';
import { Check, Plus, Redo, Warning } from '../ui/icons';
import { KIND_SHORT, useMakeupResults, whenLabel } from './shared';

type ResultsFlow = Extract<MakeupFlow, { step: 'results' }>;

/** "Dodać do Twojego planu?": what is made up, with which group, when; then back to the plan */
export function MakeupConfirm() {
  const { makeupFlow, pendingMakeup, setPendingMakeup } = useApp();
  const open = !!pendingMakeup && makeupFlow?.step === 'results';

  return (
    <Dialog.Root open={open} onOpenChange={next => { if (!next) setPendingMakeup(null); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-[rgba(12,10,9,.46)]" />
        <Dialog.Content
          role="alertdialog"
          aria-describedby="makeup-confirm-note"
          className="fixed inset-x-3.5 bottom-[max(14px,env(safe-area-inset-bottom))] z-50 mx-auto flex max-h-[92dvh] max-w-[440px] animate-pop-in flex-col gap-4 overflow-y-auto rounded-[26px] bg-surface px-[18px] pb-[18px] pt-5 shadow-pop outline-none sm:inset-x-0 sm:bottom-auto sm:top-[12vh]"
        >
          {open && <ConfirmBody flow={makeupFlow} option={pendingMakeup} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ConfirmBody({ flow, option }: { flow: ResultsFlow; option: MakeupOption }) {
  const { calendar, todayKey, makeups, addMakeup, removeMakeup, setPendingMakeup, setMakeupFlow } = useApp();
  const results = useMakeupResults(flow);
  const { block, clashes } = option;
  const date = parseDate(block.date);
  const own = results.own;
  const chosen = option.id === results.chosenId;
  const previous = makeups.find(m => m.group === flow.group && m.key === flow.key && m.n === flow.n);
  const replaces = previous && !chosen ? previous : null;

  const confirm = () => {
    if (!own) return;
    const saved = createSavedMakeup(option, flow.group, flow.key, flow.n, results.list.length, own);
    addMakeup(saved);
    setPendingMakeup(null);
    setMakeupFlow(null);
    // Back in the plan, on the month with the new class picked
    calendar.setView('month');
    calendar.setCursor(date);
    window.scrollTo({ top: 0 });
    toast.success('Dodano do Twojego planu', {
      description: `${results.title} nr ${flow.n} · ${shortDateLabel(date)}, ${block.start}`,
      action: { label: 'Cofnij', onClick: () => removeMakeup(saved.id) },
    });
  };

  const remove = () => {
    if (!previous) return;
    removeMakeup(previous.id);
    setPendingMakeup(null);
    toast.success('Usunięto odrabianie z Twojego planu.');
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="gloss grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-hero text-hero-ink">
          <Redo size={22} strokeWidth={2.1} />
        </span>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold leading-[18px] text-ink-2">Odrabianie</span>
          <Dialog.Title className="text-2xl font-light leading-7 tracking-[-0.02em]">
            {chosen ? <>Już w <span className="font-extrabold">Twoim planie</span></> : <>Dodać do <span className="font-extrabold">Twojego planu?</span></>}
          </Dialog.Title>
        </div>
      </div>

      <ol className="flex flex-col rounded-[18px] border border-line bg-bg">
        <Step n={1} label="Co odrabiasz">
          <span className="text-base font-bold leading-[22px]">
            {results.title} · {KIND_SHORT[results.kind]} <span className="font-serif text-[19px] font-normal italic">nr</span> {flow.n}
          </span>
          {own && <span className="text-[13px] leading-[18px] text-ink-2">zamiast: {getDayLabel(parseDate(own.date))}, {own.start}–{own.end} ({flow.group})</span>}
        </Step>
        <Step n={2} label="Z grupą">
          <span className="flex flex-wrap gap-1 py-0.5"><GroupTags groups={block.groups} /></span>
          {block.event.instructor && <span className="text-[13px] leading-[18px] text-ink-2">prowadzi: {block.event.instructor}</span>}
        </Step>
        <Step n={3} label="Kiedy">
          <span className="text-base font-bold leading-[22px]">{capitalize(DAY_NAMES_FULL[date.getDay()])} {date.getDate()} {MONTH_GENITIVE[date.getMonth()]}</span>
          <span className="tabular-nums text-[13px] leading-[18px] text-ink-2">
            {block.start}–{block.end}{block.event.location ? ` · ${block.event.location}` : block.mode === 'online' ? ' · online' : ''} · {whenLabel(block.date, todayKey)}
          </span>
        </Step>
      </ol>

      {clashes.length === 0 ? (
        <p className="-mt-1 flex items-center gap-2 px-1 text-sm font-semibold">
          <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-surface-2"><Check size={12} strokeWidth={3} /></span>
          Nie koliduje z Twoim planem
        </p>
      ) : (
        <p className="-mt-1 flex items-start gap-2 rounded-xl bg-warn-bg px-3 py-2.5 text-sm leading-5 text-warn-ink">
          <Warning size={16} strokeWidth={2.4} className="mt-0.5 shrink-0" />
          <span>
            Koliduje z: <span className="font-bold">{clashes.map(c => `${c.event.title}, ${c.start}–${c.end}`).join('; ')}</span>. W planie zobaczysz oba zajęcia.
          </span>
        </p>
      )}

      <p id="makeup-confirm-note" className="px-1 text-[13px] leading-[19px] text-ink-2">
        {replaces && <>Zastąpi wybrany wcześniej termin: {shortDateLabel(parseDate(replaces.date))}, {replaces.start}. </>}
        Zmiana jest widoczna tylko dla Ciebie, w Twoim planie. Odrabianie uzgodnij z prowadzącą.
      </p>

      <div className="flex flex-col gap-2">
        {chosen ? (
          <>
            <Dialog.Close className="h-[52px] rounded-[15px] bg-ink text-base font-semibold text-bg transition-transform active:scale-[.98]">Gotowe</Dialog.Close>
            <button type="button" onClick={remove} className="raised h-12 rounded-[15px] text-[15px] font-semibold">Usuń z mojego planu</button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={confirm}
              disabled={!own}
              className="flex h-[52px] items-center justify-center gap-2 rounded-[15px] bg-ink text-base font-semibold text-bg shadow-[0_1px_2px_rgba(28,25,23,.2),0_8px_18px_-8px_rgba(28,25,23,.55)] transition-transform active:scale-[.98]"
            >
              <Plus size={18} strokeWidth={2.4} />
              Dodaj do mojego planu
            </button>
            <Dialog.Close className="raised h-12 rounded-[15px] text-[15px] font-semibold">Wybierz inny termin</Dialog.Close>
          </>
        )}
      </div>
    </>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[26px_minmax(0,1fr)] gap-x-3 border-line px-3.5 py-3 [&:not(:first-child)]:border-t">
      <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-ink text-xs font-extrabold text-bg">{n}</span>
      <span className="flex min-w-0 flex-col gap-px">
        <span className="text-xs leading-4 text-ink-2">{label}</span>
        {children}
      </span>
    </li>
  );
}
