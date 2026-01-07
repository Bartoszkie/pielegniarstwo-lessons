import { ClassEvent, GroupId } from '../types';

export interface MergedClass {
  start_time: string;
  end_time: string;
  description: string;
  groups: GroupId[];
}

// Helper to check if times are consecutive (allowing small breaks)
function isConsecutive(endTime: string, startTime: string): boolean {
  const [endH, endM] = endTime.split(':').map(Number);
  const [startH, startM] = startTime.split(':').map(Number);

  const endMinutes = endH * 60 + endM;
  const startMinutes = startH * 60 + startM;

  // Allow up to 15 minutes gap (for breaks between classes)
  return startMinutes - endMinutes <= 15 && startMinutes >= endMinutes;
}

export function mergeClasses(classes: ClassEvent[]): MergedClass[] {
  // Step 1: Merge classes with same time+description across groups
  const groupMerged = new Map<string, MergedClass>();

  for (const cls of classes) {
    const key = `${cls.start_time}-${cls.end_time}-${cls.description}`;
    if (groupMerged.has(key)) {
      const existing = groupMerged.get(key)!;
      if (!existing.groups.includes(cls.group)) {
        existing.groups.push(cls.group);
      }
    } else {
      groupMerged.set(key, {
        start_time: cls.start_time,
        end_time: cls.end_time,
        description: cls.description,
        groups: [cls.group]
      });
    }
  }

  // Step 2: Merge consecutive time slots with same description+groups
  const sortedClasses = Array.from(groupMerged.values())
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const result: MergedClass[] = [];

  for (const cls of sortedClasses) {
    const last = result[result.length - 1];
    const groupsKey = [...cls.groups].sort().join(',');
    const lastGroupsKey = last ? [...last.groups].sort().join(',') : '';

    // Check if this class can be merged with the previous one
    if (last &&
        last.description === cls.description &&
        lastGroupsKey === groupsKey &&
        isConsecutive(last.end_time, cls.start_time)) {
      // Extend the previous class
      last.end_time = cls.end_time;
    } else {
      // Add as new entry
      result.push({ ...cls, groups: [...cls.groups] });
    }
  }

  return result;
}
