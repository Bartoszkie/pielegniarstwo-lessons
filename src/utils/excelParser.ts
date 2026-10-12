import { ScheduleDay, ClassEvent, GroupId, ALL_GROUPS, ParseWarning } from '../types';
import { instructorKeys, parseDescription, surname } from './eventUtils';

/**
 * Bumped whenever parsing changes what a file yields, so plans saved by an older version
 * can ask to be loaded again. 2: merged cells of any size (lectures for all groups), breaks.
 */
export const PARSER_VERSION = 2;

interface TimeSlot {
  col: number;
  start: string;
  end: string;
}

// Time slot columns C-S (indices 2-18), used when the header row can't be read
const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { col: 2, start: '08:00', end: '08:45' },
  { col: 3, start: '08:45', end: '09:30' },
  { col: 4, start: '09:30', end: '10:15' },
  { col: 5, start: '10:20', end: '11:05' },
  { col: 6, start: '11:05', end: '11:50' },
  { col: 7, start: '11:50', end: '12:35' },
  { col: 8, start: '12:40', end: '13:25' },
  { col: 9, start: '13:25', end: '14:10' },
  { col: 10, start: '14:10', end: '14:55' },
  { col: 11, start: '15:00', end: '15:45' },
  { col: 12, start: '15:45', end: '16:30' },
  { col: 13, start: '16:30', end: '17:15' },
  { col: 14, start: '17:20', end: '18:05' },
  { col: 15, start: '18:05', end: '18:50' },
  { col: 16, start: '18:50', end: '19:35' },
  { col: 17, start: '19:40', end: '20:25' },
  { col: 18, start: '20:25', end: '21:15' },
];

const HEADER_ROW = 3;
const FIRST_DATA_ROW = 4;
const SLOT_HEADER_RE = /^(\d{1,2})[.:](\d{2})\s*-\s*(\d{1,2})[.:](\d{2})$/;
const DATE_RANGE_RE = /(\d{1,2})\.(\d{1,2})\.(\d{4})\s*[-–]\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/;

export interface ParseResult {
  success: boolean;
  data: ScheduleDay[];
  groups: GroupId[];
  teachers: string[];
  warnings: ParseWarning[];
  /** Set when the file could not be read at all */
  error?: string;
}

function extractInstructors(description: string): string[] {
  return instructorKeys(parseDescription(description).instructor);
}

const pad = (value: string | number) => String(value).padStart(2, '0');

/** The time slots as the header row names them ("08.00-08.45", …), else the usual ones. */
function readTimeSlots(header: unknown[] | undefined, grupaCol: number): TimeSlot[] {
  if (!header) return DEFAULT_TIME_SLOTS;
  const slots: TimeSlot[] = [];
  for (let col = 2; col < grupaCol; col++) {
    const match = String(header[col] ?? '').trim().match(SLOT_HEADER_RE);
    if (!match) return DEFAULT_TIME_SLOTS;
    slots.push({ col, start: `${pad(match[1])}:${match[2]}`, end: `${pad(match[3])}:${match[4]}` });
  }
  return slots.length ? slots : DEFAULT_TIME_SLOTS;
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const warnings: ParseWarning[] = [];
  const scheduleMap = new Map<string, Map<GroupId, ClassEvent[]>>();
  const groupsFound = new Set<GroupId>();
  const teachersFound = new Set<string>();

  const addEvents = (date: string, group: GroupId, events: ClassEvent[]) => {
    if (!scheduleMap.has(date)) scheduleMap.set(date, new Map());
    const dateGroups = scheduleMap.get(date)!;
    if (!dateGroups.has(group)) dateGroups.set(group, []);
    dateGroups.get(group)!.push(...events);
  };

  try {
    // Loaded on demand: the library is large and only needed when a file is read
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Assume first sheet contains the schedule
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Find the GRUPA column in the header row (Excel row 4)
    const headerRow = rows[HEADER_ROW] as unknown[] | undefined;
    let grupaColIndex = headerRow ? headerRow.findIndex(h => String(h ?? '').trim().toUpperCase() === 'GRUPA') : -1;

    // Fallback: if the header is missing, find the first column holding a group in the first data row
    if (grupaColIndex === -1) {
      const firstDataRow = rows[FIRST_DATA_ROW];
      if (firstDataRow) {
        for (let testCol = 15; testCol < Math.min(firstDataRow.length, 30); testCol++) {
          if (isValidGroup(String(firstDataRow[testCol] ?? '').trim().toUpperCase())) {
            grupaColIndex = testCol;
            break;
          }
        }
      }
    }

    if (grupaColIndex === -1) {
      return {
        success: false,
        data: [],
        groups: [],
        teachers: [],
        warnings,
        error: 'Nie znaleziono kolumny GRUPA. Upewnij się, że to oryginalny plik planu z uczelni.'
      };
    }

    const timeSlots = readTimeSlots(headerRow, grupaColIndex);
    const firstSlotCol = timeSlots[0].col;
    const lastSlotCol = timeSlots[timeSlots.length - 1].col;
    const banners: { title: string; from: string; to: string }[] = [];

    // A merged cell only holds its value in the top-left cell. The rows it spans are the groups
    // (and days) it is for: two rows for a pair like 7A+7B, all 18 for a lecture for the whole year,
    // hundreds for a break. Copy the value to every row and slot it covers.
    for (const merge of sheet['!merges'] ?? []) {
      const { s, e } = merge;
      if (s.r < FIRST_DATA_ROW) continue;
      const value = rows[s.r]?.[s.c];
      if (value === undefined || value === null || !String(value).trim()) continue;

      // A row merged across the whole sheet, date column included, announces a period
      // ("ZIMOWA SESJA … 01.02.2027-21.02.2027"): turn it into notices for those days
      if (s.c < firstSlotCol && e.c >= grupaColIndex) {
        const text = String(value).replace(/\s+/g, ' ').trim();
        const range = text.match(DATE_RANGE_RE);
        if (range) {
          banners.push({
            title: text,
            from: `${range[3]}-${pad(range[2])}-${pad(range[1])}`,
            to: `${range[6]}-${pad(range[5])}-${pad(range[4])}`,
          });
        }
        continue;
      }

      if (s.c < firstSlotCol || s.c > lastSlotCol) continue;
      for (let r = s.r; r <= e.r; r++) {
        if (!rows[r]) rows[r] = [];
        for (let c = Math.max(s.c, firstSlotCol); c <= Math.min(e.c, lastSlotCol); c++) {
          if (r !== s.r || c !== s.c) rows[r][c] = value;
        }
      }
    }

    for (let rowIndex = FIRST_DATA_ROW; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (!row || row.length < grupaColIndex) continue;

      // Column A: Date (index 0)
      const dateValue = row[0];
      const parsedDate = parseExcelDate(dateValue);
      if (!parsedDate) {
        if (dateValue) {
          warnings.push({ row: rowIndex + 1, message: `nieprawidłowa data „${String(dateValue).trim()}”` });
        }
        continue;
      }

      const groupValue = String(row[grupaColIndex] ?? '').trim().toUpperCase();
      if (!isValidGroup(groupValue)) {
        if (groupValue) {
          warnings.push({ row: rowIndex + 1, message: `nieznana grupa „${groupValue}”` });
        }
        continue;
      }
      const group = groupValue as GroupId;
      groupsFound.add(group);

      // One event per run of slots holding the same text (a class usually spans several slots)
      const classes: ClassEvent[] = [];
      for (const slot of timeSlots) {
        const cellValue = row[slot.col];
        const description = cellValue === undefined || cellValue === null ? '' : String(cellValue).trim();
        if (!description) continue;

        const previous = classes[classes.length - 1];
        const previousSlot = timeSlots.find(t => t.col === slot.col - 1);
        if (previous && previousSlot && previous.description === description && previous.end_time === previousSlot.end) {
          previous.end_time = slot.end;
          continue;
        }

        const instructors = extractInstructors(description);
        instructors.forEach(instructor => teachersFound.add(instructor));
        classes.push({
          start_time: slot.start,
          end_time: slot.end,
          description,
          group,
          instructor: instructors.length > 0 ? instructors : undefined
        });
      }

      if (classes.length > 0) addEvents(parsedDate, group, classes);
    }

    // Periods announced across the sheet (exam session, breaks) become a notice on each of their days
    const groups = Array.from(groupsFound).sort();
    for (const banner of banners) {
      for (let date = banner.from; date <= banner.to; date = nextDate(date)) {
        for (const group of groups) {
          addEvents(date, group, [{ start_time: timeSlots[0].start, end_time: timeSlots[timeSlots.length - 1].end, description: banner.title, group }]);
        }
      }
    }

    // Convert map to ScheduleDay array, marking classes that every group has
    const scheduleData: ScheduleDay[] = [];
    scheduleMap.forEach((groupEvents, date) => {
      const allClasses: ClassEvent[] = [];
      groupEvents.forEach(events => allClasses.push(...events));

      const groupsPerClass = new Map<string, Set<GroupId>>();
      for (const cls of allClasses) {
        const key = `${cls.start_time}|${cls.end_time}|${cls.description}`;
        if (!groupsPerClass.has(key)) groupsPerClass.set(key, new Set());
        groupsPerClass.get(key)!.add(cls.group);
      }
      if (groupsFound.size > 1) {
        for (const cls of allClasses) {
          if (groupsPerClass.get(`${cls.start_time}|${cls.end_time}|${cls.description}`)!.size === groupsFound.size) {
            cls.everyone = true;
          }
        }
      }

      const [y, m, d] = date.split('-').map(Number);
      const dayNames = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
      scheduleData.push({
        date,
        day: dayNames[new Date(y, m - 1, d).getDay()],
        classes: allClasses.sort((a, b) => a.start_time.localeCompare(b.start_time))
      });
    });

    scheduleData.sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      data: scheduleData,
      groups,
      teachers: Array.from(teachersFound).sort((a, b) => surname(a).localeCompare(surname(b), 'pl') || a.localeCompare(b, 'pl')),
      warnings
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      groups: [],
      teachers: [],
      warnings,
      error: `Nie udało się odczytać pliku (${error instanceof Error ? error.message : String(error)}).`
    };
  }
}

/** "2026-12-31" → "2027-01-01" */
function nextDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

function parseExcelDate(value: unknown): string | null {
  if (typeof value === 'number') {
    // Excel serial date number - use UTC to avoid timezone issues
    // Excel epoch is December 30, 1899 (serial 0)
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
    const date = new Date(EXCEL_EPOCH + value * MS_PER_DAY);
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }

  if (typeof value === 'string') {
    // "10/1/25" is M/D/YY (10/1/25 is a Wednesday, as in the plan)
    const parts = value.split('/');
    if (parts.length === 3) {
      const [month, day, yearPart] = parts.map(p => parseInt(p, 10));
      if ([month, day, yearPart].some(Number.isNaN)) return null;
      const year = yearPart < 100 ? 2000 + yearPart : yearPart;
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  return null;
}

function isValidGroup(value: string): boolean {
  return ALL_GROUPS.includes(value as GroupId);
}
