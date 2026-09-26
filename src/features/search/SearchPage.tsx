import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaperCard } from '../../components/PaperCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { searchPapers } from '../../services/api';
import type { Paper } from '../../types';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery, filters, setFilters, clearFilters, cachePapers } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local query with global
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Fetch real papers from API
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const papers = await searchPapers(searchQuery);
        setResults(papers);
        cachePapers(papers);
      } catch (err) {
        console.error("Failed to fetch search results", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  // Extract filter options dynamically from search results
  const filterOptions = {
    years: Array.from(new Set(results.map(p => p.year))).sort((a, b) => b - a),
    publications: Array.from(new Set(results.map(p => p.publication?.split(' ')[0] || ''))).filter(Boolean).sort(),
    datasets: Array.from(new Set(results.map(p => p.dataset).filter((d): d is string => !!d))).slice(0, 8),
    methods: Array.from(new Set(results.map(p => p.method).filter((m): m is string => !!m))).slice(0, 8),
    models: Array.from(new Set(results.map(p => p.model).filter((m): m is string => !!m))).slice(0, 8),
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

  // Core filter logic (already filtered by API query, this is just for facet filters)
  const filteredPapers = results.filter((paper) => {

    // Filter matches
    if (filters.years.length > 0 && !filters.years.includes(paper.year)) {
      return false;
    }
    if (filters.publications.length > 0 && !filters.publications.some(pub => paper.publication?.startsWith(pub))) {
      return false;
    }
    if (filters.datasets.length > 0 && (!paper.dataset || !filters.datasets.includes(paper.dataset))) {
      return false;
    }
    if (filters.methods.length > 0 && (!paper.method || !filters.methods.includes(paper.method))) {
      return false;
    }
    if (filters.models.length > 0 && (!paper.model || !filters.models.includes(paper.model))) {
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
    <div className="flex gap-10 max-w-6xl mx-auto h-[calc(100vh-100px)] relative overflow-hidden">
      
      {/* Left Sidebar Filter Section (Desktop) */}
      <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col bg-brand-surface border border-brand-border rounded-xl p-5 overflow-y-auto select-none">
        <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-5 flex-shrink-0">
          <span className="text-[13px] font-semibold text-brand-text flex items-center gap-1.5 uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5 text-brand-textMuted" />
            Filters
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-medium text-brand-accent hover:text-brand-accentHover flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Filter List */}
        <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin pr-1">
          {/* Years filter */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-semibold text-brand-textMuted">Publication Year</h4>
            <div className="flex flex-col gap-1">
              {filterOptions.years.slice(0, 6).map((year) => {
                const checked = filters.years.includes(year);
                return (
                  <label key={year} className="flex items-center gap-2 text-[13px] text-brand-text cursor-pointer hover:text-brand-accent transition-colors">
                    <input 
                      type="checkbox" 
                      checked={checked} 
                      onChange={() => handleFilterToggle('years', year)} 
                      className="rounded border-brand-border text-brand-accent focus:ring-brand-accent h-3.5 w-3.5"
                    />
                    {year}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Publications filter */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-semibold text-brand-textMuted">Journals / Conferences</h4>
            <div className="flex flex-col gap-1">
              {filterOptions.publications.map((pub) => {
                const checked = filters.publications.includes(pub);
                return (
                  <label key={pub} className="flex items-center gap-2 text-[13px] text-brand-text cursor-pointer hover:text-brand-accent transition-colors">
                    <input 
                      type="checkbox" 
                      checked={checked} 
                      onChange={() => handleFilterToggle('publications', pub)} 
                      className="rounded border-brand-border text-brand-accent focus:ring-brand-accent h-3.5 w-3.5"
                    />
                    {pub}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Datasets filter */}
          <div className="space-y-3">
            <h4 className="text-[12px] font-semibold text-brand-textMuted">Datasets</h4>
            <div className="flex flex-col gap-1">
              {filterOptions.datasets.map((dataset) => {
                const checked = filters.datasets.includes(dataset);
                return (
                  <label key={dataset} className="flex items-center gap-2 text-[13px] text-brand-text cursor-pointer hover:text-brand-accent transition-colors">
                    <input 
                      type="checkbox" 
                      checked={checked} 
                      onChange={() => handleFilterToggle('datasets', dataset)} 
                      className="rounded border-brand-border text-brand-accent focus:ring-brand-accent h-3.5 w-3.5"
                    />
                    <span className="truncate">{dataset?.split(' ')[0] || ''}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Results Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden max-w-4xl">
        {/* Search header container */}
        <div className="flex gap-3 mb-4 items-center flex-wrap">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 group">
            <input
              type="text"
              placeholder="Search by keywords, title, abstract, authors..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-24 rounded-lg border border-brand-border bg-brand-surface text-[15px] text-brand-text focus:outline-none focus:border-brand-accent transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-brand-textMuted group-focus-within:text-brand-accent transition-colors" />
            <button
              type="submit"
              className="absolute right-2 top-2 h-8 px-4 rounded bg-brand-accent hover:bg-brand-accentHover text-white text-[13px] font-medium transition-all"
            >
              Search
            </button>
          </form>

          {/* Toggle filter drawer for mobile/tablet */}

        </div>

        {/* Query Summary */}
        <div className="flex items-center justify-between mb-4 border-b border-brand-border pb-2 flex-shrink-0">
          <div className="text-[13px] text-brand-textMuted">
            Showing <span className="font-semibold text-brand-text">{filteredPapers.length}</span> papers
            {searchQuery && (
              <>
                {' '}
                for "<span className="font-semibold text-brand-text">{searchQuery}</span>"
              </>
            )}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-10">
          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : filteredPapers.length > 0 ? (
            <div className="flex flex-col">
              {filteredPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No papers match your search"
              description="Try adjusting your query terms, removing filters, or searching for broader topics."
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
    </div>
  );
};
