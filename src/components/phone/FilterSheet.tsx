import { Drawer } from 'vaul';
import { useApp } from '../../app/AppContext';
import { formatTimestamp, pluralPl } from '../../utils/dateUtils';
import { ModeToggle } from '../ui/ModeToggle';
import { MakeupEntry } from '../makeup/MakeupEntry';
import { GroupPicker } from '../ui/GroupPicker';
import { TeacherPicker } from '../ui/TeacherPicker';
import { Check, Close, Info } from '../ui/icons';

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Bottom sheet for picking groups or instructors. Opens by itself while nothing is selected. */
export function FilterSheet({ open, onOpenChange }: FilterSheetProps) {
  const { schedule, hasSelection, openWarnings } = useApp();
  const isTeacher = schedule.mode === 'teacher';
  const groups = [...schedule.selectedGroups].sort();

  const ctaLabel = isTeacher
    ? hasSelection ? `Pokaż plan · ${pluralPl(schedule.selectedTeachers.size, 'osoba', 'osoby', 'osób')}` : 'Wybierz co najmniej jedną osobę'
    : !hasSelection ? 'Wybierz co najmniej jedną grupę'
      : groups.length <= 3 ? `Pokaż plan · ${groups.join(', ')}` : `Pokaż plan · ${groups.length} grup`;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={hasSelection}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-[rgba(12,10,9,.42)]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col rounded-t-[20px] bg-surface shadow-[0_-8px_32px_rgba(12,10,9,.16)] outline-none"
        >
          <div className="mx-auto mt-2 h-[5px] w-9 shrink-0 rounded-full bg-line-strong" />
          <div className="flex items-start justify-between gap-3 pl-5 pr-2.5 pt-3.5">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Drawer.Title className="text-[22px] font-bold leading-7 tracking-[-0.015em]">Czyj plan pokazać?</Drawer.Title>
              {schedule.lastUpdated && (
                <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
                  <Check size={14} strokeWidth={2.4} className="text-ink" />
                  Plan wczytany {formatTimestamp(schedule.lastUpdated)}
                </div>
              )}
              {schedule.warnings.length > 0 && (
                <div className="flex items-center gap-1.5 text-[13px] text-warn-ink">
                  <Info size={14} />
                  <span>{pluralPl(schedule.warnings.length, 'wiersz pominięty', 'wiersze pominięte', 'wierszy pominiętych')} ·</span>
                  <button type="button" onClick={openWarnings} className="font-semibold underline underline-offset-2">Szczegóły</button>
                </div>
              )}
            </div>
            {hasSelection && (
              <Drawer.Close aria-label="Zamknij" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl">
                <Close size={20} />
              </Drawer.Close>
            )}
          </div>

          <div className="mx-5 mt-4 flex flex-col gap-2">
            <ModeToggle />
            <MakeupEntry onStart={() => onOpenChange(false)} />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-2">
            {isTeacher ? (
              <TeacherPicker />
            ) : (
              <>
                <GroupPicker />
                <p className="mt-3 text-[13px] leading-[19px] text-ink-2">
                  Możesz zaznaczyć kilka grup, np. swoją i podgrupę. Wybór zostanie zapamiętany.
                </p>
              </>
            )}
          </div>

          <div className="border-t border-line px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              disabled={!hasSelection}
              onClick={() => onOpenChange(false)}
              className="h-[52px] w-full rounded-[14px] bg-ink text-base font-semibold text-bg disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-2"
            >
              {ctaLabel}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
