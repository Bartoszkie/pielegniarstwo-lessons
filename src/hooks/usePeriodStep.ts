import { useApp } from '../app/AppContext';
import { isClass } from '../utils/blocks';
import { addDays, formatDate, isSameMonth, parseDate } from '../utils/dateUtils';

/**
 * Previous or next week or month, following the view. A week opens on its Monday;
 * a month opens on today when it's in it, else on its first date in `landOn`
 * (by default the days with classes), else on its 1st.
 */
export function usePeriodStep(landOn?: string[]) {
  const { calendar, now, visibleByDate } = useApp();
  return (direction: 1 | -1) => {
    if (calendar.view === 'week') {
      calendar.setCursor(addDays(calendar.weekStart, 7 * direction));
      return;
    }
    const month = new Date(calendar.cursor.getFullYear(), calendar.cursor.getMonth() + direction, 1);
    if (isSameMonth(now, month)) {
      calendar.goToToday();
      return;
    }
    const prefix = formatDate(month).slice(0, 8);
    const candidates = landOn ?? Object.keys(visibleByDate).filter(k => visibleByDate[k].some(isClass));
    const first = candidates.filter(date => date.startsWith(prefix)).sort()[0];
    calendar.setCursor(first ? parseDate(first) : month);
  };
}
