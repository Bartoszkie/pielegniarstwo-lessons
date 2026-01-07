import { GroupId } from '../types';

export interface GroupColor {
  background: string;
  backgroundGradient: string;
  text: string;
  border: string;
}

export const GROUP_COLORS: Record<GroupId, GroupColor> = {
  // Year 1 - Blues
  '1A': {
    background: '#3B82F6',
    backgroundGradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    text: '#ffffff',
    border: '#60A5FA'
  },
  '1B': {
    background: '#1D4ED8',
    backgroundGradient: 'linear-gradient(135deg, #1D4ED8, #1E40AF)',
    text: '#ffffff',
    border: '#3B82F6'
  },
  // Year 2 - Cyans
  '2A': {
    background: '#06B6D4',
    backgroundGradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    text: '#ffffff',
    border: '#22D3EE'
  },
  '2B': {
    background: '#0891B2',
    backgroundGradient: 'linear-gradient(135deg, #0891B2, #0E7490)',
    text: '#ffffff',
    border: '#06B6D4'
  },
  // Year 3 - Teals
  '3A': {
    background: '#14B8A6',
    backgroundGradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
    text: '#ffffff',
    border: '#2DD4BF'
  },
  '3B': {
    background: '#0D9488',
    backgroundGradient: 'linear-gradient(135deg, #0D9488, #0F766E)',
    text: '#ffffff',
    border: '#14B8A6'
  },
  // Year 4 - Greens
  '4A': {
    background: '#22C55E',
    backgroundGradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    text: '#ffffff',
    border: '#4ADE80'
  },
  '4B': {
    background: '#16A34A',
    backgroundGradient: 'linear-gradient(135deg, #16A34A, #15803D)',
    text: '#ffffff',
    border: '#22C55E'
  },
  // Year 5 - Limes/Yellows
  '5A': {
    background: '#84CC16',
    backgroundGradient: 'linear-gradient(135deg, #84CC16, #65A30D)',
    text: '#ffffff',
    border: '#A3E635'
  },
  '5B': {
    background: '#CA8A04',
    backgroundGradient: 'linear-gradient(135deg, #CA8A04, #A16207)',
    text: '#ffffff',
    border: '#EAB308'
  },
  // Year 6 - Oranges
  '6A': {
    background: '#F97316',
    backgroundGradient: 'linear-gradient(135deg, #F97316, #EA580C)',
    text: '#ffffff',
    border: '#FB923C'
  },
  '6B': {
    background: '#EA580C',
    backgroundGradient: 'linear-gradient(135deg, #EA580C, #C2410C)',
    text: '#ffffff',
    border: '#F97316'
  },
  // Year 7 - Reds/Roses
  '7A': {
    background: '#EF4444',
    backgroundGradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    text: '#ffffff',
    border: '#F87171'
  },
  '7B': {
    background: '#F43F5E',
    backgroundGradient: 'linear-gradient(135deg, #F43F5E, #E11D48)',
    text: '#ffffff',
    border: '#FB7185'
  },
  // Year 8 - Pinks/Purples
  '8A': {
    background: '#EC4899',
    backgroundGradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
    text: '#ffffff',
    border: '#F472B6'
  },
  '8B': {
    background: '#A855F7',
    backgroundGradient: 'linear-gradient(135deg, #A855F7, #9333EA)',
    text: '#ffffff',
    border: '#C084FC'
  }
};

export function getGroupColor(group: GroupId): GroupColor {
  return GROUP_COLORS[group];
}

export function getGroupStyle(group: GroupId): React.CSSProperties {
  const color = GROUP_COLORS[group];
  return {
    background: color.backgroundGradient,
    color: color.text
  };
}
