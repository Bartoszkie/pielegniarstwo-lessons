import { useApp } from '../../app/AppContext';
import { classesLabel } from '../../utils/dateUtils';
import { ModeToggle } from '../ui/ModeToggle';
import { GroupPicker } from '../ui/GroupPicker';
import { TeacherPicker } from '../ui/TeacherPicker';
import { AppMark } from '../ui/icons';
import { FilePanel } from './FilePanel';

export function Sidebar() {
  const { schedule, stats, openHowItWorks } = useApp();

  return (
    <aside className="flex flex-[1_1_288px] flex-col gap-6 border-r border-line bg-surface px-5 py-6 lg:sticky lg:top-0 lg:h-dvh lg:max-w-[320px] lg:overflow-y-auto">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-ink text-bg">
          <AppMark size={20} />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-base font-semibold leading-[22px]">Plan zajęć</span>
          <span className="text-[13px] leading-[18px] text-ink-2">Pielęgniarstwo</span>
        </div>
      </div>

      <ModeToggle compact />

      {schedule.mode === 'student' ? <GroupPicker pairsPerRow={2} compact /> : <TeacherPicker compact />}

      <dl className="flex flex-col gap-2.5 border-t border-line pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">W tym tygodniu</dt>
          <dd className="font-semibold">{classesLabel(stats.thisWeek)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">Do końca semestru</dt>
          <dd className="font-semibold">{classesLabel(stats.remaining)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-2">Następne</dt>
          <dd className="text-right font-semibold">{stats.nextLabel}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-col gap-2">
        <FilePanel />
        <button type="button" onClick={openHowItWorks} className="self-start py-1 text-[13px] font-medium text-ink-2 hover:text-ink">
          Jak to działa?
        </button>
      </div>
    </aside>
  );
}
