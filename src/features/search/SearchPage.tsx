import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getPaperIngestionStatus, ingestPaper, searchPapers } from '../../services/api';
import type { IngestionStatus } from '../../services/api';
import type { Paper } from '../../types';
import {
  ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ExternalLink,
  FileSearch, GitCompare, LoaderCircle, MessageSquareText, RotateCcw,
  Search, SlidersHorizontal, Sparkles, X, Database,
} from 'lucide-react';

type SortOrder = 'relevance' | 'newest' | 'citations';

const suggestions = [
  'Self-supervised learning for plant disease detection',
  'Vision Transformers for medical image classification',
  'Graph neural networks for cybersecurity',
  'Retrieval-augmented generation using knowledge graphs',
];

const formatAuthors = (authors: string[]) => authors.length > 5
  ? `${authors.slice(0, 5).join(', ')} et al.`
  : authors.join(', ');

export const SearchPage: React.FC = () => {
  const {
    searchQuery, setSearchQuery, savedPaperIds, toggleSavedPaper,
    setSelectedPaperId, setActivePage, comparisonPaperIds,
    toggleComparisonPaper, clearComparison, addSearchResults,
  } = useApp();

  const [query, setQuery] = useState(searchQuery);
  const [submittedQuery, setSubmittedQuery] = useState(searchQuery.trim());
  const [year, setYear] = useState('');
  const [author, setAuthor] = useState('');
  const [venue, setVenue] = useState('');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [sort, setSort] = useState<SortOrder>('relevance');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(searchQuery.trim()));
  const [retryToken, setRetryToken] = useState(0);
  const [ingestion, setIngestion] = useState<Record<string, IngestionStatus>>({});
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const pollCount = useRef(0);

  const startIngestion = async (paper: Paper) => {
    setIngestingId(paper.id);
    setIngestionError(null);
    try {
      const status = await ingestPaper(paper.id);
      setIngestion(previous => ({ ...previous, [paper.id]: status }));
    } catch (error) {
      setIngestionError(error instanceof Error ? error.message : 'Paper indexing could not be started.');
    } finally {
      setIngestingId(null);
    }
  };

  useEffect(() => {
    const activeIds = Object.entries(ingestion).filter(([, value]) => !['ready', 'abstract_only', 'failed', 'discovered'].includes(value.status)).map(([id]) => id);
    if (!activeIds.length) { pollCount.current = 0; return; }
    const timer = window.setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current > 100) { window.clearInterval(timer); return; }
      void Promise.all(activeIds.map(async id => {
        const current = ingestion[id];
        try {
          const next = await getPaperIngestionStatus(current.canonical_paper_id || id);
          setIngestion(previous => ({ ...previous, [id]: next }));
        } catch { /* Keep the last known state. */ }
      }));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [ingestion]);

  // Home and navbar searches arrive through the existing shared query state.
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.trim() !== submittedQuery) {
      setQuery(searchQuery);
      setSubmittedQuery(searchQuery.trim());
      setHasSearched(true);
    }
  }, [searchQuery, submittedQuery]);

  useEffect(() => {
    if (!submittedQuery) {
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);
    searchPapers(submittedQuery, {
      year: year ? Number(year) : undefined,
      openAccessOnly,
      sort,
      page: currentPage,
    }, controller.signal)
      .then(({ papers: results, totalCount: count }) => {
        if (controller.signal.aborted) return;
        setPapers(previous => currentPage === 1
          ? results
          : [...previous, ...results.filter(result => !previous.some(paper => paper.id === result.id))]);
        setTotalCount(count);
        addSearchResults(results);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPapers([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [submittedQuery, year, openAccessOnly, sort, currentPage, retryToken, addSearchResults]);

  const venues = useMemo(() => Array.from(new Set(papers.map(paper => paper.venue).filter((item): item is string => Boolean(item)))).sort(), [papers]);
  const filteredPapers = useMemo(() => papers.filter(paper => {
    const authorMatches = !author.trim() || paper.authors.some(name => name.toLowerCase().includes(author.trim().toLowerCase()));
    const venueMatches = !venue || paper.venue === venue;
    return authorMatches && venueMatches;
  }), [papers, author, venue]);

  const submitSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const nextQuery = query.trim();
    setHasSearched(Boolean(nextQuery));
    setSearchQuery(nextQuery);
    setSubmittedQuery(nextQuery);
    setCurrentPage(1);
  };

  const runSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setSearchQuery(suggestion);
    setSubmittedQuery(suggestion);
    setHasSearched(true);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setQuery('');
    setSubmittedQuery('');
    setSearchQuery('');
    setHasSearched(false);
    setCurrentPage(1);
    setPapers([]);
    setTotalCount(undefined);
    setLoading(false);
    setError(false);
  };

  const clearFilters = () => {
    setYear('');
    setAuthor('');
    setVenue('');
    setOpenAccessOnly(false);
    setSort('relevance');
    setCurrentPage(1);
  };

  const openPaper = (paper: Paper) => {
    setSelectedPaperId(paper.id);
    setActivePage('details');
  };

  const askAboutPaper = (paper: Paper) => {
    setSelectedPaperId(paper.id);
    const context = [
      `Help me analyze this research paper: ${paper.title}.`,
      paper.authors.length ? `Authors: ${paper.authors.join(', ')}.` : '',
      paper.year ? `Year: ${paper.year}.` : '',
      paper.source ? `Source: ${paper.source}.` : '',
      paper.doi ? `DOI: ${paper.doi}.` : '',
      paper.url ? `Paper URL: ${paper.url}.` : '',
      paper.abstract && paper.abstract !== 'Abstract not available.' ? `Abstract: ${paper.abstract}` : '',
    ].filter(Boolean).join('\n');
    setSearchQuery(context);
    setActivePage('chat');
  };

  const hasFilters = Boolean(year || author || venue || openAccessOnly || sort !== 'relevance');

  return (
    <div className="min-h-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1240px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              <FileSearch className="h-4 w-4" /> Research library
            </div>
            <h1 className="text-[26px] font-bold tracking-tight text-slate-950 sm:text-[30px]">Research Search</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Discover academic papers, explore research methods and find connections across published studies.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Indexed by OpenAlex
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_22px_-18px_rgba(15,23,42,.3)] sm:p-5">
          <form role="search" onSubmit={submitSearch} className="flex min-h-[54px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 sm:px-4">
            <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-slate-400" />
            <input
              aria-label="Search papers, topics, authors, methods or datasets"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search papers, research topics, authors, methods or datasets..."
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            {query && <button type="button" aria-label="Clear search input" onClick={() => setQuery('')} className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X className="h-4 w-4" /></button>}
            <button type="submit" disabled={!query.trim() || loading} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-55">
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-slate-500">Try</span>
            {suggestions.map(suggestion => (
              <button key={suggestion} type="button" onClick={() => runSuggestion(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        {hasSearched && <section aria-label="Search filters" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><SlidersHorizontal className="h-4 w-4 text-blue-600" /> Refine results</div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[130px] flex-col gap-1 text-xs font-medium text-slate-600">
              Publication year
              <select value={year} onChange={event => { setYear(event.target.value); setCurrentPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="">Any year</option>
                {Array.from({ length: 30 }, (_, index) => new Date().getFullYear() - index).map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Author
              <input value={author} onChange={event => setAuthor(event.target.value)} placeholder="Filter returned authors" className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
              Publication / venue
              <select value={venue} onChange={event => setVenue(event.target.value)} disabled={!venues.length} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400">
                <option value="">All returned venues</option>
                {venues.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="flex min-w-[150px] flex-col gap-1 text-xs font-medium text-slate-600">
              Sort by
              <select value={sort} onChange={event => { setSort(event.target.value as SortOrder); setCurrentPage(1); }} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="relevance">Relevance</option><option value="newest">Newest</option><option value="citations">Citation count</option>
              </select>
            </label>
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 hover:bg-slate-50">
              <input type="checkbox" checked={openAccessOnly} onChange={event => { setOpenAccessOnly(event.target.checked); setCurrentPage(1); }} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> Open access
            </label>
            {hasFilters && <button type="button" onClick={clearFilters} className="h-10 px-2 text-sm font-medium text-blue-700 hover:text-blue-900">Clear filters</button>}
          </div>
        </section>}

        {!hasSearched ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Sparkles className="h-6 w-6" /></div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Find your next research breakthrough.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Search published studies to explore methods, datasets and discoveries in your field.</p>
          </section>
        ) : <section aria-live="polite" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3 px-1">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Results for <span className="text-blue-700">“{submittedQuery}”</span></h2>
              <p className="mt-1 text-xs text-slate-500">{loading ? 'Searching academic sources…' : error ? 'Search could not be completed' : `${filteredPapers.length} ${filteredPapers.length === 1 ? 'paper' : 'papers'} loaded from OpenAlex${totalCount !== undefined && !author.trim() && !venue ? ` · ${totalCount.toLocaleString()} total matches` : ''}`}</p>
            </div>
            <button type="button" onClick={clearSearch} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-white hover:text-blue-700"><X className="h-3.5 w-3.5" /> Clear search</button>
          </div>

          {comparisonPaperIds.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-950 px-4 py-3 text-white">
            <div className="flex items-center gap-2 text-sm"><span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold">{comparisonPaperIds.length}</span> papers selected for comparison</div>
            <div className="flex items-center gap-2"><button type="button" onClick={() => setActivePage('compare')} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold hover:bg-blue-500"><GitCompare className="h-3.5 w-3.5" /> Open comparison</button><button type="button" onClick={clearComparison} className="rounded p-2 text-blue-200 hover:bg-white/10 hover:text-white" aria-label="Clear comparison selection"><X className="h-4 w-4" /></button></div>
          </div>}

          {ingestionError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{ingestionError}</div>}

          {loading && papers.length === 0 ? Array.from({ length: 3 }, (_, index) => <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"><div className="h-4 w-3/5 rounded bg-slate-200" /><div className="mt-3 h-3 w-2/5 rounded bg-slate-100" /><div className="mt-5 h-3 w-full rounded bg-slate-100" /><div className="mt-2 h-3 w-4/5 rounded bg-slate-100" /></div>) : error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
            <h3 className="font-semibold text-slate-900">Unable to retrieve papers.</h3><p className="mt-1 text-sm text-slate-600">Check your connection or try again in a moment.</p><button type="button" onClick={() => setRetryToken(value => value + 1)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><RotateCcw className="h-4 w-4" /> Try again</button>
          </div> : filteredPapers.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-900">No papers found.</h3><p className="mt-1 text-sm text-slate-600">Try different keywords or broaden your filters.</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-4 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Clear filters</button>}
          </div> : filteredPapers.map(paper => {
            const saved = savedPaperIds.includes(paper.id);
            const compared = comparisonPaperIds.includes(paper.id);
            const paperStatus = ingestion[paper.id]?.status;
            const paperIsProcessing = Boolean(paperStatus && ['metadata_available', 'downloading', 'extracting', 'indexing'].includes(paperStatus));
            return <article key={paper.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-[0_8px_28px_-22px_rgba(37,99,235,.55)] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => openPaper(paper)} className="text-left text-[15px] font-semibold leading-6 text-slate-900 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{paper.title}</button>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{paper.authors.length ? formatAuthors(paper.authors) : 'Author details unavailable'}{paper.year ? ` · ${paper.year}` : ''}{paper.venue ? ` · ${paper.venue}` : ''}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{paper.abstract !== 'Abstract not available.' ? paper.abstract : 'Abstract unavailable from the academic source.'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {paper.source && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{paper.source}</span>}
                    {paper.openAccess === true && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">Open access</span>}
                    {paper.citationCountAvailable !== false && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">{paper.citations.toLocaleString()} citations</span>}
                    {paper.doi && <span className="max-w-full truncate rounded-full bg-slate-50 px-2.5 py-1 font-mono text-[10px] text-slate-500">DOI: {paper.doi}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:max-w-[230px] sm:justify-end">
                  <button type="button" onClick={() => openPaper(paper)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"><BookOpen className="h-3.5 w-3.5" /> Open paper</button>
                  <button type="button" onClick={() => void startIngestion(paper)} title="Indexes this publicly available scholarly paper for AI research." disabled={ingestingId === paper.id || paperIsProcessing || ['ready', 'abstract_only'].includes(paperStatus || '')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-65"><Database className="h-3.5 w-3.5" />{ingestingId === paper.id ? 'Starting…' : paperIsProcessing ? 'Processing…' : ['ready', 'abstract_only'].includes(paperStatus || '') ? 'Indexed' : 'Index paper'}</button>
                  <button type="button" onClick={() => toggleSavedPaper(paper.id)} aria-label={saved ? 'Remove from saved papers' : 'Save paper'} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium ${saved ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{saved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}{saved ? 'Saved' : 'Save'}</button>
                  <button type="button" onClick={() => toggleComparisonPaper(paper.id)} disabled={!compared && comparisonPaperIds.length >= 3} aria-pressed={compared} title={!compared && comparisonPaperIds.length >= 3 ? 'Remove a paper from the current comparison first (maximum 3)' : undefined} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45 ${compared ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}><GitCompare className="h-3.5 w-3.5" />{compared ? 'Selected' : 'Compare'}</button>
                  <button type="button" onClick={() => askAboutPaper(paper)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"><MessageSquareText className="h-3.5 w-3.5" /> Ask AI</button>
                  {paper.url && <a href={paper.url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-500 hover:text-blue-700" aria-label="Open original source"><ExternalLink className="h-3.5 w-3.5" /> Source</a>}
                </div>
              </div>
              {ingestion[paper.id] && <div role="status" className={`mt-3 rounded-lg px-3 py-2 text-xs ${ingestion[paper.id].status === 'failed' ? 'bg-rose-50 text-rose-800' : ingestion[paper.id].status === 'ready' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>
                <span className="font-semibold">{({ metadata_available: 'Metadata available', downloading: 'Downloading full text', extracting: 'Extracting text', indexing: 'Creating embeddings and graph', ready: 'Ready for AI research', abstract_only: 'Abstract only', failed: 'Processing failed', discovered: 'Not indexed' } as Record<string, string>)[ingestion[paper.id].status] || 'Queued for processing'}</span>
                {ingestion[paper.id].error && <span>: {ingestion[paper.id].error}</span>}
                {ingestion[paper.id].status === 'abstract_only' && <span>: no accessible open-access PDF was found, so full text was not indexed.</span>}
                {ingestion[paper.id].status === 'failed' && <button type="button" onClick={() => void startIngestion(paper)} className="ml-2 font-semibold underline">Retry</button>}
              </div>}
            </article>;
          })}
          {loading && papers.length > 0 && <p role="status" className="py-3 text-center text-sm text-slate-500"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Loading more papers…</p>}
          {!loading && !error && filteredPapers.length > 0 && totalCount !== undefined && papers.length < totalCount && <div className="flex justify-center py-2"><button type="button" onClick={() => setCurrentPage(page => page + 1)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"><ChevronDown className="h-4 w-4" /> Load more papers</button></div>}
        </section>}

        {hasSearched && !loading && !error && filteredPapers.length > 0 && <p className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-slate-400"><ArrowUpRight className="h-3 w-3" /> Results and metadata provided by OpenAlex</p>}
      </div>
    </div>
  );
};
