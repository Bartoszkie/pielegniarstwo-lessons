import { EventType, ParsedEvent } from '../types';

export function getEventClass(description: string): EventType {
  if (description.toLowerCase().includes('badanie fizykalne')) {
    return 'badanie';
  }
  return 'podstawy';
}

export function getShortTitle(description: string): string {
  if (description.toLowerCase().includes('badanie fizykalne')) {
    return 'Badanie fizykalne';
  }
  return 'Podstawy pielęgn.';
}

export function parseDescription(description: string): ParsedEvent {
  const lines = description.split('\n');
  const mainLine = lines[0];

  let title = '';
  let instructor = '';
  let location = '';

  const match = mainLine.match(/^(.+?)\s+(mgr\s+.+?)\s+laboratorium\s+(.+)$/i);
  if (match) {
    title = match[1].trim();
    instructor = match[2].trim();
    location = match[3].trim();
  } else {
    title = mainLine;
  }

  const notes = lines.slice(1).join(' ').trim();

  return { title, instructor, location, notes };
}
