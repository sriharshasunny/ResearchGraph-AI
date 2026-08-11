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
        <ul className="list-disc pl-4 space-y-1">
          {p.advantages.map((adv, idx) => <li key={idx}>{adv}</li>)}
        </ul>
      )
    },
    {
      label: 'Main Limitations',
      key: 'limitations',
      render: (p: Paper) => (
        <ul className="list-disc pl-4 space-y-1">
          {p.limitations.map((lim, idx) => <li key={idx}>{lim}</li>)}
        </ul>
      )
    },
    {
      label: 'Future Work Directions',
      key: 'futureWork',
      render: (p: Paper) => (
        <ul className="list-disc pl-4 space-y-1">
          {p.futureWork.map((fw, idx) => <li key={idx}>{fw}</li>)}
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 select-none">
      
      {/* Selector and Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/45 border border-slate-200/80 dark:border-slate-800/40 p-5 rounded-2xl backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Columns3 className="h-5 w-5 text-indigo-500" />
            Academic Comparison matrix
          </h2>
          <p className="text-xs text-slate-500">
            Compare key parameters, datasets, methods, and results for up to 3 papers side by side.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {comparePaperIds.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold text-slate-650"
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
                  className="w-full md:w-56 h-9 pl-8 pr-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-xs text-slate-800 focus:outline-none"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Suggestions dropdown */}
              {searchQuery && filteredSearchList.length > 0 && (
                <div className="absolute right-0 top-10 z-20 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl">
                  {filteredSearchList.map(paper => (
                    <button
                      key={paper.id}
                      onClick={() => {
                        addToCompare(paper.id);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-left text-xs font-semibold"
                    >
                      <span className="truncate pr-4">{paper.title}</span>
                      <Plus className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
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
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 shadow-sm">
          <div className="min-w-[800px] divide-y divide-slate-200/60 dark:divide-slate-800/40">
            {/* Table Header: Show Paper Titles */}
            <div className="grid grid-cols-4 bg-slate-50/50 dark:bg-slate-950/20 p-4">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest self-center">
                Parameter Schema
              </div>

              {/* Paper Slots */}
              {Array.from({ length: 3 }).map((_, idx) => {
                const paper = selectedPapers[idx];
                return (
                  <div key={idx} className="px-4 border-l border-slate-200/65 dark:border-slate-800/50 relative flex flex-col justify-between min-h-[100px]">
                    {paper ? (
                      <>
                        <button
                          onClick={() => removeFromCompare(paper.id)}
                          className="absolute top-0 right-2 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="space-y-1.5 pr-6">
                          <h4
                            onClick={() => handlePaperClick(paper.id)}
                            className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 cursor-pointer line-clamp-2 leading-snug"
                          >
                            {paper.title}
                          </h4>
                          <span className="inline-block text-[10px] font-semibold text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-100/10">
                            {paper.publication}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500">
                          <Quote className="h-3 w-3 text-slate-400" />
                          <span>{paper.citationCount.toLocaleString()} citations</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4 bg-white/10 dark:bg-slate-900/10 text-slate-400">
                        <Plus className="h-5 w-5 mb-1 text-slate-350" />
                        <span className="text-[10px] font-semibold">Slot Empty</span>
                        <span className="text-[8px]">Select a paper above to compare</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table Body Fields */}
            {comparisonFields.map((field) => (
              <div key={field.key} className="grid grid-cols-4 p-4 hover:bg-slate-50/20 transition-colors">
                {/* Field label */}
                <div className="text-xs font-extrabold text-slate-700 dark:text-slate-350 pr-4">
                  {field.label}
                </div>

                {/* Values columns */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const paper = selectedPapers[idx];
                  return (
                    <div key={idx} className="px-4 border-l border-slate-200/60 dark:border-slate-800/40 text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                      {paper ? (
                        field.highlight ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-100/10">
                            {field.render(paper)}
                          </span>
                        ) : (
                          field.render(paper)
                        )
                      ) : (
                        <span className="text-slate-350 dark:text-slate-600">&bull;&bull;&bull;</span>
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
        <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 text-xs text-slate-600 dark:text-slate-400 flex gap-2.5 items-start">
          <Sparkles className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-250">Comparison Tip</span>: Use the matrix to isolate modeling differences. Under performance evaluations, pay attention to pre-training dataset size variations (e.g. ImageNet vs WIT 400M) as they heavily impact downstream zero-shot transfer scores.
          </div>
        </div>
      )}

    </div>
  );
};
