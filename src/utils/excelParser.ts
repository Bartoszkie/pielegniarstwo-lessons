import * as XLSX from 'xlsx';
import { ScheduleDay, ClassEvent, GroupId, ALL_GROUPS } from '../types';

// Time slot column mapping (columns C-T in Excel = indices 2-19)
const TIME_SLOTS: { col: number; start: string; end: string }[] = [
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
  { col: 18, start: '20:25', end: '21:10' },
];

export interface ParseResult {
  success: boolean;
  data: ScheduleDay[];
  groups: GroupId[];
  errors: string[];
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const errors: string[] = [];
  const scheduleMap = new Map<string, Map<GroupId, ClassEvent[]>>();
  const groupsFound = new Set<GroupId>();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Assume first sheet contains the schedule
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON array (rows)
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

    // Handle merged cells - SELECTIVELY copy values for shared classes only
    // Only handle small merges (2 rows max) in time slot columns to avoid
    // copying large holiday break regions to all cells
    const merges = sheet['!merges'] || [];

    for (const merge of merges) {
      const startRow = merge.s.r;
      const startCol = merge.s.c;
      const endRow = merge.e.r;
      const endCol = merge.e.c;

      // Skip merges that span more than 2 rows (likely holidays/headers)
      const rowSpan = endRow - startRow + 1;
      if (rowSpan > 2) continue;

      // Only process merges in time slot columns (2-18)
      if (startCol < 2 || startCol > 18) continue;

      // Get the value from the top-left cell
      const sourceValue = rows[startRow]?.[startCol];

      if (sourceValue !== undefined && sourceValue !== null) {
        const valueStr = String(sourceValue);
        // Skip if it looks like a holiday/break message
        if (valueStr.toUpperCase().includes('PRZERWA') ||
            valueStr.toUpperCase().includes('ŚWIĘT') ||
            valueStr.toUpperCase().includes('SWIAT')) continue;

        // Copy to other cells in the merge (shared class between groups)
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            if (r !== startRow || c !== startCol) {
              if (!rows[r]) rows[r] = [];
              (rows[r] as unknown[])[c] = sourceValue;
            }
          }
        }
      }
    }

    // Dynamically find GRUPA column from header row (row index 3 = Excel row 4)
    const headerRow = rows[3] as unknown[];
    let grupaColIndex = -1;

    // Search header row for GRUPA column
    if (headerRow) {
      for (let i = 0; i < headerRow.length; i++) {
        const header = String(headerRow[i] || '').trim().toUpperCase();
        if (header === 'GRUPA') {
          grupaColIndex = i;
          break;
        }
      }
    }

    // Fallback: if GRUPA header not found, detect by finding valid group values in first data row
    if (grupaColIndex === -1) {
      const firstDataRow = rows[4];
      if (firstDataRow) {
        for (let testCol = 15; testCol < Math.min(firstDataRow.length, 30); testCol++) {
          const testValue = String(firstDataRow[testCol] || '').trim().toUpperCase();
          if (ALL_GROUPS.includes(testValue as GroupId)) {
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
        errors: ['Nie znaleziono kolumny GRUPA w pliku Excel']
      };
    }

    // Skip header rows (0-3), start from row 4 (index 4)
    for (let rowIndex = 4; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (!row || row.length < grupaColIndex) continue;

      // Column A: Date (index 0)
      const dateValue = row[0];
      const parsedDate = parseExcelDate(dateValue);
      if (!parsedDate) {
        if (dateValue) {
          errors.push(`Row ${rowIndex + 1}: Invalid date format "${dateValue}"`);
        }
        continue;
      }

      // Get group from dynamically detected column
      const groupValue = String(row[grupaColIndex] || '').trim().toUpperCase();
      if (!isValidGroup(groupValue)) {
        if (groupValue) {
          errors.push(`Row ${rowIndex + 1}: Invalid group "${groupValue}"`);
        }
        continue;
      }
      const group = groupValue as GroupId;
      groupsFound.add(group);

      // Parse time slots (columns C-T, indices 2-18)
      const classes: ClassEvent[] = [];
      for (const slot of TIME_SLOTS) {
        const cellValue = row[slot.col];
        if (cellValue && String(cellValue).trim()) {
          classes.push({
            start_time: slot.start,
            end_time: slot.end,
            description: String(cellValue).trim(),
            group: group
          });
        }
      }

      // Store in map structure
      if (classes.length > 0) {
        if (!scheduleMap.has(parsedDate)) {
          scheduleMap.set(parsedDate, new Map());
        }
        const dateGroups = scheduleMap.get(parsedDate)!;
        if (!dateGroups.has(group)) {
          dateGroups.set(group, []);
        }
        dateGroups.get(group)!.push(...classes);
      }
    }

    // Convert map to ScheduleDay array
    const scheduleData: ScheduleDay[] = [];
    scheduleMap.forEach((groupEvents, date) => {
      const allClasses: ClassEvent[] = [];
      groupEvents.forEach((events) => {
        allClasses.push(...events);
      });

      if (allClasses.length > 0) {
        const dateObj = new Date(date);
        const dayNames = ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'];

        scheduleData.push({
          date,
          day: dayNames[dateObj.getDay()],
          classes: allClasses.sort((a, b) => a.start_time.localeCompare(b.start_time))
        });
      }
    });

    // Sort by date
    scheduleData.sort((a, b) => a.date.localeCompare(b.date));

    return {
      success: true,
      data: scheduleData,
      groups: Array.from(groupsFound).sort(),
      errors
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      groups: [],
      errors: [`Failed to parse Excel file: ${error}`]
    };
  }
}

function parseExcelDate(value: unknown): string | null {
  if (typeof value === 'number') {
    // Excel serial date number - use UTC to avoid timezone issues
    // Excel epoch is December 30, 1899 (serial 0)
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
    const utcTimestamp = EXCEL_EPOCH + value * MS_PER_DAY;
    const date = new Date(utcTimestamp);

    // Extract using UTC methods to avoid timezone shifts
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  if (typeof value === 'string') {
    // Try parsing "10/1/25" format (M/D/YY - American style based on screenshot analysis)
    const parts = value.split('/');
    if (parts.length === 3) {
      const [part1, part2, part3] = parts.map(p => parseInt(p, 10));
      // Format is M/D/YY (American) based on the screenshot where 10/1/25 is Wednesday (Oct 1, 2025 is Wednesday)
      const year = part3 < 100 ? 2000 + part3 : part3;
      const month = part1 - 1; // Month is 0-indexed
      const day = part2;
      // Use UTC to avoid timezone issues
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

function isValidGroup(value: string): boolean {
  return ALL_GROUPS.includes(value as GroupId);
}
