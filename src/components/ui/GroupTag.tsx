import { GroupId } from '../../types';
import { getGroupColor } from '../../constants/groupColors';

interface GroupTagProps {
  group: GroupId;
  size?: 'sm' | 'md';
}

/** Glossy badge in the group's colour, e.g. "3A". */
export function GroupTag({ group, size = 'md' }: GroupTagProps) {
  return (
    <span
      className={`gloss inline-flex shrink-0 items-center tabular-nums font-semibold text-white ${
        size === 'sm' ? 'h-[18px] rounded px-1 text-[11px]' : 'h-[22px] rounded-md px-1.5 text-xs'
      }`}
      style={{ backgroundColor: getGroupColor(group) }}
    >
      {group}
    </span>
  );
}

/** One neutral badge instead of all of them, for classes every group has (e.g. lectures). */
export function EveryoneTag({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      title="Zajęcia dla wszystkich grup"
      className={`gloss inline-flex shrink-0 items-center bg-[#57534E] font-semibold text-white ${
        size === 'sm' ? 'h-[18px] rounded px-1 text-[11px]' : 'h-[22px] rounded-md px-1.5 text-xs'
      }`}
    >
      {size === 'sm' ? 'Wszystkie' : 'Wszystkie grupy'}
    </span>
  );
}

export function GroupTags({ groups, size, everyone }: { groups: GroupId[]; size?: 'sm' | 'md'; everyone?: boolean }) {
  if (everyone) return <EveryoneTag size={size} />;
  return (
    <>
      {groups.map(group => (
        <GroupTag key={group} group={group} size={size} />
      ))}
    </>
  );
}

/** Small glossy colour square used on unselected group chips. */
export function GroupSwatch({ group, size = 10 }: { group: GroupId; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-[3px]"
      style={{
        width: size,
        height: size,
        backgroundColor: getGroupColor(group),
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 55%, rgba(0,0,0,.15))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 1px 2px rgba(28,25,23,.25)',
      }}
    />
  );
}
