export const MONTH_NAMES = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const MONTH_GENITIVE = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
];

export const MONTH_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

/** Indexed by Date.getDay() (Sunday = 0) */
export const DAY_NAMES_FULL = [
  'niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'
];

/** Monday-first short weekday names for calendar headers */
export const WEEKDAYS_SHORT = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
export const WEEKDAYS_NARROW = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses "YYYY-MM-DD" as a local date (not UTC). */
export function parseDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Calendar days from `from` to `to` (0 = same day), safe across DST changes */
export function daysBetween(from: Date, to: Date): number {
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/** "dziś", "jutro" or "sobota 17 paź" */
export function relativeDayLabel(date: Date, today: Date): string {
  const days = daysBetween(today, date);
  if (days === 0) return 'dziś';
  if (days === 1) return 'jutro';
  return `${DAY_NAMES_FULL[date.getDay()]} ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  return result;
}

/** Monday-first index: Monday = 0 … Sunday = 6 */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Calendar cells for a month view: whole weeks only, Monday first. */
export function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = getStartOfWeek(first);
  const end = addDays(getStartOfWeek(last), 6);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    days.push(d);
  }
  return days;
}

export function isSameMonth(date: Date, referenceDate: Date): boolean {
  return date.getMonth() === referenceDate.getMonth() && date.getFullYear() === referenceDate.getFullYear();
}

export function getMonthLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/** "12–18 paź" or "28 wrz – 4 paź" */
export function getWeekLabelShort(start: Date): string {
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_SHORT[end.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTH_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTH_SHORT[end.getMonth()]}`;
}

/** "12–18 października 2026" or "28 września – 4 października 2026" */
export function getWeekLabel(start: Date): string {
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTH_GENITIVE[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTH_GENITIVE[start.getMonth()]} – ${end.getDate()} ${MONTH_GENITIVE[end.getMonth()]} ${end.getFullYear()}`;
}

/** "poniedziałek, 12 października" */
export function getDayLabel(date: Date): string {
  return `${DAY_NAMES_FULL[date.getDay()]}, ${date.getDate()} ${MONTH_GENITIVE[date.getMonth()]}`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pl') + text.slice(1);
}

/** Polish plural: pluralPl(5, 'zajęcia', 'zajęcia', 'zajęć') -> "5 zajęć" */
export function pluralPl(count: number, one: string, few: string, many: string): string {
  const ten = count % 10;
  const hundred = count % 100;
  if (count === 1) return `1 ${one}`;
  if (ten >= 2 && ten <= 4 && (hundred < 12 || hundred > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

export function classesLabel(count: number): string {
  return pluralPl(count, 'zajęcia', 'zajęcia', 'zajęć');
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** "2 godz. 15 min", "35 min", "1 godz." */
export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} godz.`;
  return `${h} godz. ${m} min`;
}

/** "11.10.2026 · 18:52" */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} · ${time}`;
}
