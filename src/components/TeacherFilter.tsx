import { useState, useEffect, useMemo } from 'react';

interface TeacherFilterProps {
  availableTeachers: string[];
  selectedTeachers: Set<string>;
  onToggleTeacher: (teacher: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function TeacherFilter({
  availableTeachers,
  selectedTeachers,
  onToggleTeacher,
  onSelectAll,
  onDeselectAll
}: TeacherFilterProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Always expand if no teachers selected (first time use)
    if (selectedTeachers.size === 0) return true;

    try {
      const saved = localStorage.getItem('teacher-filters-expanded');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expand when all teachers deselected
  useEffect(() => {
    if (selectedTeachers.size === 0) {
      setIsExpanded(true);
    }
  }, [selectedTeachers.size]);

  // Filter teachers by search query
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return availableTeachers;
    const query = searchQuery.toLowerCase();
    return availableTeachers.filter(teacher =>
      teacher.toLowerCase().includes(query)
    );
  }, [availableTeachers, searchQuery]);

  const allSelected = availableTeachers.length > 0 && availableTeachers.every(t => selectedTeachers.has(t));
  const noneSelected = availableTeachers.every(t => !selectedTeachers.has(t));

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('teacher-filters-expanded', String(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  };

  if (availableTeachers.length === 0) {
    return (
      <div className="w-full lg:w-[240px] shrink-0 p-3 lg:p-4 bg-bg-secondary rounded-[12px] border border-border self-start lg:sticky lg:top-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Filtruj wykladowcow
          </span>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Brak wykladowcow w danych. Sprawdz czy plik zawiera informacje o prowadzacych.
        </p>
      </div>
    );
  }

  // Get selected teachers for display when collapsed
  const selectedTeachersList = Array.from(selectedTeachers);

  return (
    <div className="w-full lg:w-[240px] shrink-0 p-3 lg:p-4 bg-bg-secondary rounded-[12px] border border-border self-start lg:sticky lg:top-6">
      {/* Header with toggle */}
      <div
        className="flex items-center justify-between cursor-pointer select-none btn-press"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            Filtruj wykladowcow ({selectedTeachers.size}/{availableTeachers.length})
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Show selected teachers when collapsed */}
      {!isExpanded && selectedTeachers.size > 0 && selectedTeachers.size < availableTeachers.length && (
        <div className="mt-2 text-xs text-text-muted">
          Wybrani:{' '}
          <span className="text-text-secondary">
            {selectedTeachersList.slice(0, 2).map(t => t.split(' ').slice(-1)[0]).join(', ')}
            {selectedTeachers.size > 2 && ` +${selectedTeachers.size - 2}`}
          </span>
        </div>
      )}

      {/* Collapsible content with smooth animation */}
      <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {/* Search input */}
          <div className="relative mt-3 mb-3">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj wykladowcy..."
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-9 pr-3 py-2 text-sm bg-bg-hover border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
          </div>

          {/* All/None buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); onSelectAll(); }}
              disabled={allSelected}
              className="btn-press flex-1 px-2 py-1.5 text-xs font-medium text-text-secondary
                         bg-bg-hover rounded-lg transition-colors
                         hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Wszystkie
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeselectAll(); }}
              disabled={noneSelected}
              className="btn-press flex-1 px-2 py-1.5 text-xs font-medium text-text-secondary
                         bg-bg-hover rounded-lg transition-colors
                         hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Zadne
            </button>
          </div>

          {/* Teacher list with checkboxes */}
          <div className="max-h-[300px] overflow-y-auto space-y-1 pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {filteredTeachers.length === 0 ? (
              <p className="text-xs text-text-muted py-2 text-center">
                Nie znaleziono wykladowcow
              </p>
            ) : (
              filteredTeachers.map(teacher => {
                const isSelected = selectedTeachers.has(teacher);
                return (
                  <label
                    key={teacher}
                    className={`
                      flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer
                      transition-all duration-150
                      ${isSelected
                        ? 'bg-amber-500/10 hover:bg-amber-500/15'
                        : 'hover:bg-bg-hover'
                      }
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleTeacher(teacher)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 rounded border-2 transition-all duration-150
                        flex items-center justify-center
                        ${isSelected
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-text-muted hover:border-text-secondary'
                        }
                      `}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`
                      text-sm truncate transition-colors
                      ${isSelected ? 'text-text-primary' : 'text-text-secondary'}
                    `}>
                      {teacher}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
