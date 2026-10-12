import { GroupId } from '../types';

// One colour per group: the number sets the hue, A is lighter, B deeper.
// Every value passes 4.5:1 contrast with white text.
export const GROUP_COLORS: Record<GroupId, string> = {
  '1A': '#2F5FD0', '1B': '#1F3C88',
  '2A': '#0B7A99', '2B': '#0B4F66',
  '3A': '#D0336E', '3B': '#9C1F78',
  '4A': '#2E7D32', '4B': '#1B5420',
  '5A': '#5E7B12', '5B': '#8A6100',
  '6A': '#C2410C', '6B': '#8F3409',
  '7A': '#C62828', '7B': '#8E1B3A',
  '8A': '#0D7F72', '8B': '#0B5249',
  '9A': '#6D3FD9', '9B': '#4338CA',
};

export function getGroupColor(group: GroupId): string {
  return GROUP_COLORS[group];
}

/** Soft background tint of a group colour, used for single-group blocks. */
export function groupTint(group: GroupId, amount = 11): string {
  return `color-mix(in oklab, ${GROUP_COLORS[group]} ${amount}%, rgb(var(--surface)))`;
}
