import { useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { normalizeForSearch } from '../../utils/eventUtils';
import { Search } from './icons';

/** Instructor search with a checkbox list. */
export function TeacherPicker({ compact = false }: { compact?: boolean }) {
  const { schedule } = useApp();
  const { availableTeachers, selectedTeachers, toggleTeacher, selectAllTeachers, deselectAllTeachers } = schedule;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    if (!q) return availableTeachers;
    return availableTeachers.filter(t => normalizeForSearch(t).includes(q));
  }, [availableTeachers, query]);

  if (availableTeachers.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-2">
        W pliku nie ma informacji o prowadzących.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="relative block">
        <span className="sr-only">Szukaj wykładowcy</span>
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Szukaj po nazwisku"
          autoComplete="off"
          className={`w-full rounded-xl border border-line-strong bg-surface pl-10 pr-3.5 text-ink outline-none placeholder:text-ink-3 focus:border-ink ${
            compact ? 'h-10 text-sm' : 'h-12 text-base'
          }`}
        />
      </label>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-ink-2">Wybrani: {selectedTeachers.size} z {availableTeachers.length}</span>
        <div className="flex gap-1">
          <button type="button" onClick={selectAllTeachers} className={`${compact ? 'h-8' : 'h-11'} px-2 text-[13px] font-semibold`}>Wszyscy</button>
          <button type="button" onClick={deselectAllTeachers} className={`${compact ? 'h-8' : 'h-11'} px-2 text-[13px] font-semibold`}>Wyczyść</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-1 px-2 py-8 text-center">
          <span className="text-[15px] font-semibold">Brak wyników dla „{query}”</span>
          <span className="text-sm text-ink-2">Sprawdź pisownię albo wpisz samo nazwisko.</span>
        </div>
      ) : (
        <ul className="border-t border-line">
          {filtered.map(teacher => (
            <li key={teacher}>
              <label className={`flex cursor-pointer items-center gap-3 border-b border-line ${compact ? 'min-h-[44px] text-sm' : 'min-h-[52px] text-[15px]'}`}>
                <input
                  type="checkbox"
                  checked={selectedTeachers.has(teacher)}
                  onChange={() => toggleTeacher(teacher)}
                  className="h-5 w-5 shrink-0 accent-[rgb(var(--ink))]"
                />
                <span className="min-w-0 flex-1">{teacher}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
