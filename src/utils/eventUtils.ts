import { ParsedEvent } from '../types';

export function getShortTitle(description: string): string {
  // Extract the title - typically the first part before "mgr" or instructor info
  const lines = description.split('\n');
  const mainLine = lines[0];

  // Try to extract title before instructor name (mgr, dr, lek, etc.)
  const instructorMatch = mainLine.match(/^(.+?)\s+(mgr|dr|lek|prof)\s/i);
  let title = instructorMatch ? instructorMatch[1].trim() : mainLine;

  // If no match, try to get just the subject name (first meaningful part)
  if (!instructorMatch) {
    // Remove room/location info at the end (e.g., "sala A214", "Katowice")
    title = title.replace(/\s+(sala\s+\S+|Katowice.*|laboratorium.*)$/i, '').trim();
  }

  // Truncate if too long (max ~20 chars for display)
  if (title.length > 20) {
    return title.substring(0, 18) + '...';
  }

  return title;
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
