import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../app/AppContext';
import { parseDate, getDayLabel, capitalize } from '../../utils/dateUtils';
import { KindChips } from '../ui/KindChips';
import { ClassRow } from '../ClassRow';
import { PhoneHeader } from './PhoneHeader';
import { NowStrip } from './NowStrip';
import { WeekAgenda } from './WeekAgenda';
import { PhoneMonth } from './PhoneMonth';
import { BottomDock } from './BottomDock';
import { FilterSheet } from './FilterSheet';

export function PhoneApp() {
  const { calendar, hasSelection, search } = useApp();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(!hasSelection);

  // Right after a file is loaded nothing is selected: open the picker
  useEffect(() => {
    if (!hasSelection) setFiltersOpen(true);
  }, [hasSelection]);

  // Start each view from the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [calendar.view]);

  const results = useMemo(() => (searchOpen ? search(query) : []), [searchOpen, search, query]);
  const searching = searchOpen && query.trim().length > 0;
  const openFilters = () => setFiltersOpen(true);

  return (
    <div className="min-h-dvh pb-[calc(140px+env(safe-area-inset-bottom))]">
      <PhoneHeader
        summaryOpen={summaryOpen}
        onToggleSummary={() => setSummaryOpen(v => !v)}
        searchOpen={searchOpen}
        query={query}
        onQueryChange={setQuery}
        onOpenSearch={() => setSearchOpen(true)}
        onCloseSearch={() => { setSearchOpen(false); setQuery(''); }}
        onOpenFilters={openFilters}
      />

      {hasSelection && !searching && (
        <KindChips className="no-scrollbar overflow-x-auto px-4 pb-2.5 pt-2" />
      )}

      <main className="flex flex-col gap-5 px-3 pt-1">
        {searching ? (
          <SearchResults results={results} query={query} />
        ) : calendar.view === 'week' ? (
          <>
            {hasSelection && !searchOpen && <NowStrip />}
            <WeekAgenda onPick={openFilters} />
          </>
        ) : (
          <PhoneMonth onPick={openFilters} />
        )}
      </main>

      <BottomDock />
      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}

function SearchResults({ results, query }: { results: ReturnType<ReturnType<typeof useApp>['search']>; query: string }) {
  const { calendar } = useApp();
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 px-4 py-10 text-center">
        <span className="text-[15px] font-semibold">Brak zajęć dla „{query.trim()}”</span>
        <span className="text-sm text-ink-2">Spróbuj samego nazwiska, przedmiotu albo numeru sali.</span>
      </div>
    );
  }

  const shown = results.slice(0, 60);
  const byDate = new Map<string, typeof shown>();
  shown.forEach(block => byDate.set(block.date, [...(byDate.get(block.date) ?? []), block]));

  return (
    <div className="flex flex-col gap-4">
      <p className="px-2 text-sm text-ink-2">
        {results.length > shown.length ? `Pokazano ${shown.length} z ${results.length} wyników` : `Wyniki: ${results.length}`} · najpierw najbliższe
      </p>
      {[...byDate.entries()].map(([date, blocks]) => (
        <section key={date} className="flex flex-col gap-2">
          <button type="button" onClick={() => calendar.setCursor(parseDate(date))} className="self-start px-2 text-left text-[15px] font-semibold">
            {capitalize(getDayLabel(parseDate(date)))}
          </button>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {blocks.map(block => <ClassRow key={block.id} block={block} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
