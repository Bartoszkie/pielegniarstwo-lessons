import { ClassKind, ParsedEvent } from '../types';

// Cells look like: "<Subject> <titles> <First> <Last> <type> <place>", e.g.
//   "Genetyka dr Jolanta Mol ćwiczenia Katowice, sala C200"
//   "Radiologia dr n. med. Marcin Hutnik wykład ONLINE\n17:45-20:45"
// Older files use "laboratorium <room>" as the place.
const KIND_RE = /(^|\s)(zaj[eę]cia w warunkach symulowanych|wyk[łl]ady?|[ćc]wiczenia|laboratorium|seminarium|lektorat|zaj[eę]cia praktyczne|praktyk[ai] zawodow[ae])(?=[\s,]|$)/iu;
const TITLE_RE = /(^|\s)(prof\.?|dr|mgr|lek\.?)(?=\s)/iu;
const TIME_RANGE_RE = /^(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})$/;
const INFO_RE = /(dzie[nń] wolny|przerwa|inauguracja|[śs]wi[eę]t|rektorsk|wolne od zaj)/iu;
const NAME_RE = /([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}'-]+)\s+([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}'-]+)\s*$/u;

const cache = new Map<string, ParsedEvent>();

function kindFromKeyword(keyword: string): ClassKind {
  const k = keyword.toLowerCase();
  if (k.includes('symulowanych')) return 'simulation';
  if (k.startsWith('wyk')) return 'lecture';
  if (k.includes('wiczenia') || k === 'laboratorium' || k === 'lektorat') return 'exercise';
  return 'other';
}

function pad(h: string): string {
  return h.padStart(2, '0');
}

function sentenceCase(text: string): string {
  const lower = text.toLocaleLowerCase('pl');
  return lower.charAt(0).toLocaleUpperCase('pl') + lower.slice(1);
}

function isMostlyUppercase(text: string): boolean {
  const letters = text.replace(/[^\p{L}]/gu, '');
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^\p{Lu}]/gu, '').length;
  return upper / letters.length > 0.8;
}

function cleanLocation(rest: string): string {
  let place = rest.replace(/^[,\s]+/, '').trim();
  place = place.replace(/^katowice\s*,?\s*/i, '').trim();
  if (!place) return '';
  if (/^sala\.?$/i.test(place)) return 'sala do ustalenia';
  return place;
}

export function parseDescription(description: string): ParsedEvent {
  const cached = cache.get(description);
  if (cached) return cached;

  const lines = description.split('\n').map(line => line.trim()).filter(Boolean);
  const main = lines[0] ?? '';
  let actualTime = '';
  const noteParts: string[] = [];
  for (const line of lines.slice(1)) {
    const time = line.match(TIME_RANGE_RE);
    if (time && !actualTime) {
      actualTime = `${pad(time[1])}:${time[2]}–${pad(time[3])}:${time[4]}`;
    } else {
      noteParts.push(line);
    }
  }
  const notes = noteParts.join(' ').replace(/\s*-\s*/g, ' – ');

  let result: ParsedEvent;
  const kindMatch = main.match(KIND_RE);

  if (!kindMatch && !TITLE_RE.test(main) && (isMostlyUppercase(main) || INFO_RE.test(main))) {
    result = { title: sentenceCase(main), instructor: '', kind: 'info', online: false, location: '', actualTime, notes };
  } else {
    let before = main;
    let after = '';
    let kind: ClassKind = 'other';
    if (kindMatch && kindMatch.index !== undefined) {
      const keywordStart = kindMatch.index + kindMatch[1].length;
      before = main.slice(0, keywordStart).trim();
      after = main.slice(keywordStart + kindMatch[2].length).trim();
      kind = kindFromKeyword(kindMatch[2]);
      if (kindMatch[2].toLowerCase() === 'laboratorium') {
        after = `laboratorium ${after}`.trim();
      }
    }

    let title = before;
    let instructor = '';
    const titleMatch = before.match(TITLE_RE);
    if (titleMatch && titleMatch.index !== undefined) {
      const at = titleMatch.index + titleMatch[1].length;
      title = before.slice(0, at).trim();
      instructor = before.slice(at).trim();
    }
    if (!title) title = main;

    const online = /^online\b/i.test(after);
    const location = online ? '' : after.startsWith('laboratorium') ? after : cleanLocation(after);

    result = { title, instructor, kind, online, location, actualTime, notes };
  }

  cache.set(description, result);
  return result;
}

/**
 * Turns the instructor credits of a cell into stable filter keys, e.g.
 * "dr n. med. i n.o zdr Martyna Andreew-Gamza" -> "dr Martyna Andreew-Gamza".
 * Several instructors can be separated with "/".
 */
export function instructorKeys(credits: string): string[] {
  if (!credits) return [];
  const keys: string[] = [];
  for (const part of credits.split('/')) {
    const segment = part.trim();
    const name = segment.match(NAME_RE);
    if (!name) continue;
    const lower = segment.toLowerCase();
    const title = lower.includes('prof') ? 'prof.'
      : lower.includes('hab') ? 'dr hab.'
      : lower.startsWith('dr') ? 'dr'
      : lower.startsWith('mgr') ? 'mgr'
      : lower.startsWith('lek') ? 'lek.'
      : '';
    keys.push(`${title} ${name[1]} ${name[2]}`.trim());
  }
  return keys;
}

/** Surname of an instructor key, used for sorting. */
export function surname(key: string): string {
  const words = key.split(' ');
  return words[words.length - 1] ?? key;
}

export function isInfoDescription(description: string): boolean {
  return parseDescription(description).kind === 'info';
}

/** Lower-cases and strips Polish diacritics so search ignores them. */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase();
}

export const KIND_LABELS: Record<ClassKind, string> = {
  lecture: 'Wykład',
  exercise: 'Ćwiczenia',
  simulation: 'Symulacje',
  other: 'Zajęcia',
  info: 'Informacja',
};
