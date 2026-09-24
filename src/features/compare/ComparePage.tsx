import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import type { Paper } from '../../types';
import { Columns3, Plus, X, Search, Sparkles, Quote } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';

export const ComparePage: React.FC = () => {
  const { comparePaperIds, addToCompare, removeFromCompare, clearCompare, setActivePage, setSelectedPaperId, addToRecentlyViewed } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPapers = comparePaperIds
    .map(id => mockPapers.find(p => p.id === id))
    .filter((p): p is Paper => p !== undefined);

  const filteredSearchList = mockPapers.filter(
    p =>
      !comparePaperIds.includes(p.id) &&
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handlePaperClick = (id: string) => {
    setSelectedPaperId(id);
    addToRecentlyViewed(id);
    setActivePage('details');
  };

  const comparisonFields = [
    { label: 'Authors', key: 'authors', render: (p: Paper) => p.authors.join(', ') },
    { label: 'Publication Year', key: 'year', render: (p: Paper) => p.year },
    { label: 'Publication Venue', key: 'publication', render: (p: Paper) => p.publication },
    { label: 'Target Dataset', key: 'dataset', render: (p: Paper) => p.dataset || 'N/A' },
    { label: 'Core Method', key: 'method', render: (p: Paper) => p.method || 'N/A' },
    { label: 'Accuracy Metric', key: 'accuracy', render: (p: Paper) => p.accuracy || 'N/A', highlight: true },
    {
      label: 'Core Advantages',
      key: 'advantages',
      render: (p: Paper) => (
        <ul className="list-disc pl-4 space-y-1.5">
          {p.advantages.map((adv, idx) => <li key={idx}>{adv}</li>)}
        </ul>
      )
    },
    {
      label: 'Main Limitations',
      key: 'limitations',
      render: (p: Paper) => (
        <ul className="list-disc pl-4 space-y-1.5">
          {p.limitations.map((lim, idx) => <li key={idx}>{lim}</li>)}
        </ul>
      )
    },
    {
      label: 'Future Work Directions',
      key: 'futureWork',
      render: (p: Paper) => (
        <ul className="list-disc pl-4 space-y-1.5">
          {p.futureWork.map((fw, idx) => <li key={idx}>{fw}</li>)}
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Selector and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-surface border border-brand-border p-6 rounded-xl shadow-sm">
        <div className="space-y-1.5">
          <h2 className="text-[18px] font-semibold text-brand-text flex items-center gap-2">
            <Columns3 className="h-5 w-5 text-brand-accent" />
            Academic Comparison
          </h2>
          <p className="text-[13px] text-brand-textMuted">
            Compare key parameters, datasets, methods, and results for up to 3 papers side by side.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {comparePaperIds.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-4 py-2.5 rounded-lg border border-brand-border bg-brand-surface hover:bg-brand-bg text-[13px] font-medium text-brand-text transition-colors"
            >
              Clear Comparison
            </button>
          )}
          
          {/* Quick select search block */}
          {comparePaperIds.length < 3 && (
            <div className="relative flex-1 md:flex-none">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search paper to add..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 h-10 pl-9 pr-4 rounded-lg border border-brand-border bg-brand-bg text-[13px] text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-brand-textMuted" />
              </div>

              {/* Suggestions dropdown */}
              {searchQuery && filteredSearchList.length > 0 && (
                <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-brand-border bg-brand-surface p-2 shadow-xl">
                  {filteredSearchList.map(paper => (
                    <button
                      key={paper.id}
                      onClick={() => {
                        addToCompare(paper.id);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-brand-bg text-left text-[13px] font-medium text-brand-text transition-colors"
                    >
                      <span className="truncate pr-4">{paper.title}</span>
                      <Plus className="h-4 w-4 text-brand-accent flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Comparison */}
      {selectedPapers.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-surface shadow-sm">
          <div className="min-w-[800px] divide-y divide-brand-border">
            {/* Table Header: Show Paper Titles */}
            <div className="grid grid-cols-4 bg-brand-bg p-4">
              <div className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider self-center">
                Parameter Schema
              </div>

              {/* Paper Slots */}
              {Array.from({ length: 3 }).map((_, idx) => {
                const paper = selectedPapers[idx];
                return (
                  <div key={idx} className="px-5 border-l border-brand-border relative flex flex-col justify-between min-h-[120px]">
                    {paper ? (
                      <>
                        <button
                          onClick={() => removeFromCompare(paper.id)}
                          className="absolute top-0 right-2 p-1.5 rounded-lg hover:bg-brand-surface text-brand-textMuted hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="space-y-2 pr-6 mt-1">
                          <h4
                            onClick={() => handlePaperClick(paper.id)}
                            className="text-[14px] font-semibold text-brand-text hover:text-brand-accent cursor-pointer line-clamp-2 leading-snug transition-colors"
                          >
                            {paper.title}
                          </h4>
                          <span className="inline-block text-[11px] font-medium text-brand-textMuted bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
                            {paper.publication}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-4 text-[12px] text-brand-textMuted">
                          <Quote className="h-3.5 w-3.5" />
                          <span>{paper.citationCount.toLocaleString()} citations</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full border border-dashed border-brand-border rounded-xl flex flex-col items-center justify-center text-center p-4 bg-brand-bg/50 text-brand-textMuted mt-1 mb-1">
                        <Plus className="h-5 w-5 mb-2 opacity-50" />
                        <span className="text-[12px] font-semibold">Slot Empty</span>
                        <span className="text-[11px] mt-1">Select a paper above to compare</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table Body Fields */}
            {comparisonFields.map((field) => (
              <div key={field.key} className="grid grid-cols-4 p-5 hover:bg-brand-bg/50 transition-colors">
                {/* Field label */}
                <div className="text-[13px] font-semibold text-brand-text pr-4 flex items-center">
                  {field.label}
                </div>

                {/* Values columns */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const paper = selectedPapers[idx];
                  return (
                    <div key={idx} className="px-5 border-l border-brand-border text-[13px] text-brand-textMuted leading-relaxed flex items-center">
                      {paper ? (
                        field.highlight ? (
                          <span className="inline-block px-3 py-1 rounded-lg bg-brand-surface text-brand-text font-medium border border-brand-border">
                            {field.render(paper)}
                          </span>
                        ) : (
                          field.render(paper)
                        )
                      ) : (
                        <span className="text-brand-textMuted/30 text-xl">&bull;&bull;&bull;</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No papers selected for comparison"
          description="Click the compare (columns icon) button on any Paper Card, or search a paper using the selector at the top right to get started."
          icon={Columns3}
        />
      )}

      {/* Pro tips banner */}
      {selectedPapers.length > 0 && (
        <div className="p-4 rounded-xl border border-brand-border bg-brand-bg text-[13px] text-brand-textMuted flex gap-3 items-start shadow-sm">
          <Sparkles className="h-5 w-5 text-brand-accent flex-shrink-0" />
          <div className="leading-relaxed">
            <span className="font-semibold text-brand-text">Comparison Tip</span>: Use the matrix to isolate modeling differences. Under performance evaluations, pay attention to pre-training dataset size variations (e.g. ImageNet vs WIT 400M) as they heavily impact downstream zero-shot transfer scores.
          </div>
        </div>
      )}

    </div>
  );
};
