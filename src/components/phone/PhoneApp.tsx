import { useEffect, useMemo, useState } from 'react';
import { ClassBlock } from '../../utils/blocks';
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
import { ClassSheet } from './ClassSheet';
import { ReloadBanner } from '../ReloadBanner';
import { PhoneMakeup } from '../makeup/PhoneMakeup';

export function PhoneApp() {
  const { calendar, hasSelection, search, makeupFlow } = useApp();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(!hasSelection);
  const [detail, setDetail] = useState<ClassBlock | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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
  const openClass = (block: ClassBlock) => {
    setDetail(block);
    setDetailOpen(true);
  };
  // From the sheet's list of next dates: close everything and show that day
  const jumpTo = (date: string) => {
    setDetailOpen(false);
    setSearchOpen(false);
    setQuery('');
    calendar.setCursor(parseDate(date));
  };

  if (makeupFlow?.step === 'results') {
    return (
      <>
        <PhoneMakeup key={`${makeupFlow.group}|${makeupFlow.key}|${makeupFlow.n}`} flow={makeupFlow} />
        <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
      </>
    );
  }

  return (
    <div className="fade-enter min-h-dvh pb-[calc(140px+env(safe-area-inset-bottom))]">
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
        {!searching && <ReloadBanner />}
        {searching ? (
          <SearchResults results={results} query={query} onOpenClass={openClass} />
        ) : calendar.view === 'week' ? (
          <>
            {hasSelection && !searchOpen && <NowStrip />}
            <WeekAgenda onPick={openFilters} onOpenClass={openClass} />
          </>
        ) : (
          <PhoneMonth onPick={openFilters} onOpenClass={openClass} />
        )}
      </main>

      <BottomDock />
      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen} />
      <ClassSheet block={detail} open={detailOpen} onOpenChange={setDetailOpen} onJump={jumpTo} />
    </div>
  );
}

interface SearchResultsProps {
  results: ClassBlock[];
  query: string;
  onOpenClass: (block: ClassBlock) => void;
}

function SearchResults({ results, query, onOpenClass }: SearchResultsProps) {
  const { calendar } = useApp();
  if (results.length === 0) {
    return (
      <div key={query} className="enter-quick flex flex-col items-center gap-1.5 px-4 py-10 text-center">
        <span className="text-[15px] font-semibold">Brak zajęć dla „{query.trim()}”</span>
        <span className="text-sm text-ink-2">Spróbuj samego nazwiska, przedmiotu albo numeru sali.</span>
      </div>
    );
  }

  const shown = results.slice(0, 60);
  const byDate = new Map<string, typeof shown>();
  shown.forEach(block => byDate.set(block.date, [...(byDate.get(block.date) ?? []), block]));

  return (
    // Keyed by the query, so each change of results visibly fades in
    <div key={query} className="flex flex-col gap-4">
      <p className="enter-quick px-2 text-sm text-ink-2">
        {results.length > shown.length ? `Pokazano ${shown.length} z ${results.length} wyników` : `Wyniki: ${results.length}`} · najpierw najbliższe
      </p>
      {[...byDate.entries()].map(([date, blocks], index) => (
        <section key={date} className="enter-quick flex flex-col gap-2" style={{ '--i': index + 1 } as React.CSSProperties}>
          <button type="button" onClick={() => calendar.setCursor(parseDate(date))} className="self-start px-2 text-left text-[15px] font-semibold">
            {capitalize(getDayLabel(parseDate(date)))}
          </button>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {blocks.map((block, i) => <ClassRow key={block.id} block={block} divided={i > 0} onOpen={() => onOpenClass(block)} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
