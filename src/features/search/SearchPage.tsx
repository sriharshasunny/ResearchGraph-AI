import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import { PaperCard } from '../../components/PaperCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Search, SlidersHorizontal, X, RotateCcw, Filter, Check } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery, filters, setFilters, clearFilters } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local query with global
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Simulate query loading effect for professional feel
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  // Extract filter options dynamically from mock papers
  const filterOptions = {
    years: Array.from(new Set(mockPapers.map(p => p.year))).sort((a, b) => b - a),
    publications: Array.from(new Set(mockPapers.map(p => p.publication.split(' ')[0]))).sort(),
    datasets: Array.from(new Set(mockPapers.map(p => p.dataset).filter(Boolean))).slice(0, 8),
    methods: Array.from(new Set(mockPapers.map(p => p.method).filter(Boolean))).slice(0, 8),
    models: Array.from(new Set(mockPapers.map(p => p.model).filter(Boolean))).slice(0, 8),
  };

  // Toggle filter arrays
  const handleFilterToggle = (category: keyof typeof filters, value: any) => {
    setFilters((prev) => {
      const arr = prev[category] as any[];
      const exists = arr.includes(value);
      const updated = exists ? arr.filter((v) => v !== value) : [...arr, value];
      return {
        ...prev,
        [category]: updated,
      };
    });
  };

  // Core filter logic
  const filteredPapers = mockPapers.filter((paper) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q);
      const matchAbstract = paper.abstract.toLowerCase().includes(q);
      const matchAuthors = paper.authors.some(a => a.toLowerCase().includes(q));
      const matchKeywords = paper.keywords.some(k => k.toLowerCase().includes(q));
      
      if (!matchTitle && !matchAbstract && !matchAuthors && !matchKeywords) {
        return false;
      }
    }

    // Filter matches
    if (filters.years.length > 0 && !filters.years.includes(paper.year)) {
      return false;
    }
    if (filters.publications.length > 0 && !filters.publications.some(pub => paper.publication.startsWith(pub))) {
      return false;
    }
    if (filters.datasets.length > 0 && !filters.datasets.includes(paper.dataset)) {
      return false;
    }
    if (filters.methods.length > 0 && !filters.methods.includes(paper.method)) {
      return false;
    }
    if (filters.models.length > 0 && !filters.models.includes(paper.model)) {
      return false;
    }

    return true;
  });

  const activeFiltersCount =
    filters.years.length +
    filters.publications.length +
    filters.datasets.length +
    filters.methods.length +
    filters.models.length;

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-1 h-[calc(100vh-100px)] relative overflow-hidden">
      
      {/* Left Sidebar Filter Section (Desktop) */}
      <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 rounded-2xl p-5 backdrop-blur-md overflow-y-auto select-none">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/30 pb-3 mb-4 flex-shrink-0">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/40">
                {activeFiltersCount}
              </span>
            )}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 flex items-center gap-0.5"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Filter List */}
        <div className="flex-1 space-y-5 overflow-y-auto scrollbar-none pr-1">
          {/* Years filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Publication Year</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {filterOptions.years.slice(0, 6).map((year) => {
                const checked = filters.years.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => handleFilterToggle('years', year)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                        : 'bg-white/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-850/40 text-slate-650 dark:text-slate-400 hover:bg-slate-100/50'
                    }`}
                  >
                    {year}
                    {checked && <Check className="h-3 w-3 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publications filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Journals/Confs</h4>
            <div className="flex flex-col gap-1.5">
              {filterOptions.publications.map((pub) => {
                const checked = filters.publications.includes(pub);
                return (
                  <button
                    key={pub}
                    onClick={() => handleFilterToggle('publications', pub)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                        : 'bg-white/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-850/40 text-slate-650 dark:text-slate-400 hover:bg-slate-100/50'
                    }`}
                  >
                    <span>{pub}</span>
                    {checked && <Check className="h-3 w-3 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Datasets filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Datasets</h4>
            <div className="flex flex-col gap-1.5">
              {filterOptions.datasets.map((dataset) => {
                const checked = filters.datasets.includes(dataset);
                return (
                  <button
                    key={dataset}
                    onClick={() => handleFilterToggle('datasets', dataset)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                        : 'bg-white/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-850/40 text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 hover:text-slate-800'
                    }`}
                  >
                    <span className="truncate">{dataset.split(' ')[0]}</span>
                    {checked && <Check className="h-3 w-3 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Methods filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Methods</h4>
            <div className="flex flex-col gap-1.5">
              {filterOptions.methods.map((method) => {
                const checked = filters.methods.includes(method);
                return (
                  <button
                    key={method}
                    onClick={() => handleFilterToggle('methods', method)}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-medium transition-all text-left ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/45 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                        : 'bg-white/40 dark:bg-slate-900/10 border-slate-200/50 dark:border-slate-850/40 text-slate-650 dark:text-slate-400 hover:bg-slate-100/50'
                    }`}
                  >
                    <span className="truncate">{method.split(' ')[0]}</span>
                    {checked && <Check className="h-3 w-3 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Results Panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Search header container */}
        <div className="flex gap-3 mb-6 items-center flex-wrap">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Search by keywords, title, abstract, authors..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-24 rounded-xl border border-slate-200/85 dark:border-slate-800/85 bg-white/40 dark:bg-slate-900/40 text-sm text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <button
              type="submit"
              className="absolute right-2 top-2 h-7 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold transition-all"
            >
              Search
            </button>
          </form>

          {/* Toggle filter drawer for mobile/tablet */}
          <button
            onClick={() => setShowDrawer(true)}
            className="flex items-center gap-1.5 h-11 px-4.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs font-bold text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden shadow-sm transition-all"
          >
            <Filter className="h-4 w-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {/* Query Summary & Reset */}
        <div className="flex items-center justify-between mb-4 px-1 flex-shrink-0">
          <div className="text-xs text-slate-550 dark:text-slate-400">
            Found <span className="font-bold text-slate-800 dark:text-slate-200">{filteredPapers.length}</span> papers
            {searchQuery && (
              <>
                {' '}
                for "<span className="font-semibold text-indigo-600 dark:text-indigo-400">{searchQuery}</span>"
              </>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-10 pr-1">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No papers match your search"
              description="Try adjusting your query terms, removing filters, or searching for broader topics like 'SSL' or 'Transformer'."
              actionText="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setLocalSearch('');
                clearFilters();
              }}
            />
          )}
        </div>
      </div>

      {/* Slide-out Mobile/Tablet Filter Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden bg-slate-950/40 backdrop-blur-xs">
          <div className="w-80 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Filter className="h-4.5 w-4.5 text-indigo-500" />
                  Semantic Filters
                </span>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrollable Filters list for mobile */}
              <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 scrollbar-none">
                {/* Year filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Year</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {filterOptions.years.slice(0, 6).map((year) => {
                      const checked = filters.years.includes(year);
                      return (
                        <button
                          key={year}
                          onClick={() => handleFilterToggle('years', year)}
                          className={`px-2 py-1.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                            checked
                              ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                              : 'bg-white dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-100'
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Publications filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Publications</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.publications.map((pub) => {
                      const checked = filters.publications.includes(pub);
                      return (
                        <button
                          key={pub}
                          onClick={() => handleFilterToggle('publications', pub)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            checked
                              ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                              : 'bg-white dark:bg-slate-950/20 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-455 hover:bg-slate-100'
                          }`}
                        >
                          {pub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDrawer(false)}
              className="w-full h-11 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold shadow-md transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
