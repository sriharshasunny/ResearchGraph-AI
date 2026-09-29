import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SortAsc, SortDesc, Bookmark,
  Star, X, BookOpen, ArrowLeft,
  Check, Sparkles, GitCompare, ChevronDown, ChevronUp,
  FileText, Download
} from 'lucide-react';

type SortKey = 'citations' | 'year' | 'title';

export const SearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    savedPaperIds,
    toggleSavedPaper,
    setSelectedPaperId,
    setActivePage,
    allPapers,
    comparisonPaperIds,
    toggleComparisonPaper,
    clearComparison
  } = useApp();

  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [selectedField, setSelectedField] = useState('All');
  const [selectedVenue, setSelectedVenue] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState<SortKey>('citations');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Sync from context when searchQuery changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  // Fields and Venues lists
  const fields = ['All', 'Architecture & NLP', 'Computer Vision', 'Multimodal', 'Reasoning & LLMs', 'Efficient ML', 'Graph AI & RAG'];
  const venues = ['All', 'NeurIPS', 'ICLR', 'ICML', 'TMLR', 'AI Open', 'ArXiv'];
  const years = ['All', '2025', '2024', '2023', '2022', '2021', '2020', '2017'];

  // Filter & Sort
  const filteredPapers = allPapers.filter(paper => {
    if (localQuery.trim()) {
      const q = localQuery.toLowerCase();
      const matchTitle = paper.title.toLowerCase().includes(q);
      const matchAbstract = paper.abstract.toLowerCase().includes(q);
      const matchAuthors = paper.authors.some(a => a.toLowerCase().includes(q));
      const matchField = (paper.field || '').toLowerCase().includes(q);
      const matchVenue = (paper.venue || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAbstract && !matchAuthors && !matchField && !matchVenue) {
        return false;
      }
    }

    if (selectedField !== 'All' && paper.field !== selectedField) return false;
    if (selectedVenue !== 'All' && paper.venue !== selectedVenue) return false;
    if (selectedYear !== 'All' && String(paper.year) !== selectedYear) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'citations') {
      return sortDesc ? b.citations - a.citations : a.citations - b.citations;
    }
    if (sortBy === 'year') {
      return sortDesc ? b.year - a.year : a.year - b.year;
    }
    return sortDesc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
  });

  const handleSelectPaper = (id: string) => {
    setSelectedPaperId(id);
    setActivePage('details');
  };

  const handleBatchSave = () => {
    comparisonPaperIds.forEach(id => {
      if (!savedPaperIds.includes(id)) {
        toggleSavedPaper(id);
      }
    });
  };

  const handleBatchBibtex = () => {
    const papers = allPapers.filter(p => comparisonPaperIds.includes(p.id));
    const bibs = papers.map(p => p.bibtex).filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(bibs);
    alert(`Copied BibTeX citations for ${papers.length} papers!`);
  };

  const comparisonPapers = allPapers.filter(p => comparisonPaperIds.includes(p.id));

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-x-hidden p-4 sm:p-6 pb-20 bg-[#F4F7FB]">

      <div className="relative z-10 max-w-[1360px] mx-auto flex flex-col gap-5">

        {/* ── TOP HEADER & SEARCH ──────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Search Academic Research
                </h1>
                <p className="text-[12px] text-gray-500">
                  Find relevant papers from global and private research libraries.
                </p>
              </div>
            </div>

            <div className="text-[12px] font-medium text-gray-600">
              {filteredPapers.length} papers found
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by keywords, architecture, author (e.g. self-supervised learning for plant disease detection)..."
              value={localQuery}
              onChange={e => {
                setLocalQuery(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="flex-1 bg-transparent text-[14px] text-gray-900 placeholder-gray-500 focus:outline-none"
            />
            {localQuery && (
              <button onClick={() => { setLocalQuery(''); setSearchQuery(''); }} className="text-gray-500 hover:text-gray-900">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Faceted Filters */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
            {/* Field Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mr-1">Field:</span>
              {fields.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedField(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    selectedField === f
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Dropdown filters and sorting */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Venue filter */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <span className="text-[12px] text-gray-500 font-medium">Venue:</span>
                  <select
                    value={selectedVenue}
                    onChange={e => setSelectedVenue(e.target.value)}
                    className="bg-transparent text-[12px] font-medium text-gray-900 outline-none cursor-pointer"
                  >
                    {venues.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                {/* Year filter */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <span className="text-[12px] text-gray-500 font-medium">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="bg-transparent text-[12px] font-medium text-gray-900 outline-none cursor-pointer"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {(selectedField !== 'All' || selectedVenue !== 'All' || selectedYear !== 'All' || localQuery) && (
                  <button
                    onClick={() => {
                      setSelectedField('All');
                      setSelectedVenue('All');
                      setSelectedYear('All');
                      setLocalQuery('');
                      setSearchQuery('');
                    }}
                    className="text-[12px] text-blue-600 hover:underline px-2 py-1 font-medium"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Sort buttons */}
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                {(['citations', 'year', 'title'] as SortKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      if (sortBy === key) setSortDesc(!sortDesc);
                      else { setSortBy(key); setSortDesc(true); }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      sortBy === key
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {key === 'citations' ? 'Most Cited' : key === 'year' ? 'Latest' : 'Title'}
                    {sortBy === key && (sortDesc ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── STICKY BATCH ACTIONS BAR (WHEN PAPERS CHECKED) ───────── */}
        <AnimatePresence>
          {comparisonPaperIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sticky top-4 z-40 rounded-2xl border border-indigo-500/30 bg-[#0c1429]/95 backdrop-blur-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[11px] font-black text-indigo-300">
                  {comparisonPaperIds.length}
                </span>
                <span className="text-[12px] font-bold text-white">Papers Selected</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[11px] shadow-md shadow-purple-500/20"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Compare Side-by-Side
                </button>

                <button
                  onClick={handleBatchSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] hover:bg-cyan-500/30 transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Add All to Library
                </button>

                <button
                  onClick={handleBatchBibtex}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-[11px] hover:text-white transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export BibTeX
                </button>

                <button
                  onClick={clearComparison}
                  className="p-1.5 text-gray-500 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PAPERS RESULTS LIST ──────────────────────────────────── */}
        <div className="space-y-4">
          {filteredPapers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 flex flex-col items-center justify-center text-center">
              <Search className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="text-[16px] font-bold text-gray-900">No research papers match your query</h3>
              <p className="text-[13px] text-gray-500 mt-1 max-w-md">
                Try searching for broader terms or reset your active filters.
              </p>
              <button
                onClick={() => {
                  setSelectedField('All');
                  setSelectedVenue('All');
                  setSelectedYear('All');
                  setLocalQuery('');
                }}
                className="mt-4 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-900 rounded-xl text-[12px] font-bold hover:bg-gray-200 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredPapers.map((paper) => {
              const isSaved = savedPaperIds.includes(paper.id);
              const isChecked = comparisonPaperIds.includes(paper.id);
              const isExpanded = expandedPaperId === paper.id;

              return (
                <div
                  key={paper.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Comparison Checkbox */}
                      <button
                        onClick={() => toggleComparisonPaper(paper.id)}
                        title={isChecked ? 'Remove from compare' : 'Select for comparison'}
                        className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
                          isChecked
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-400 bg-gray-50'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Paper Main Header */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            onClick={() => handleSelectPaper(paper.id)}
                            className="text-[16px] font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug pr-4"
                          >
                            {paper.title}
                          </h3>
                          <span className="text-[16px] font-bold text-gray-900 whitespace-nowrap">
                            92% {/* Mock relevance score from image */}
                          </span>
                        </div>

                        <p className="text-[13px] text-gray-500 mb-3">
                          {paper.authors.join(', ')} • {paper.year} • {paper.venue || 'ArXiv'}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-[12px] font-medium border border-gray-200">
                              {paper.field || 'General AI'}
                            </span>
                            {paper.keyFindings?.[0] && (
                              <span className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-[12px] font-medium border border-gray-200">
                                {paper.keyFindings[0].substring(0, 30)}...
                              </span>
                            )}
                          </div>
                          
                          {/* Actions Column inline */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setSearchQuery(`Analyze "${paper.title}" and explain its architecture, empirical results, and limitations.`);
                                setActivePage('chat');
                              }}
                              className="px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-[13px] transition-all"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => toggleSavedPaper(paper.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                isSaved
                                  ? 'text-blue-600 hover:bg-blue-50'
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Abstract & Key Findings */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                      className="self-start text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isExpanded ? 'Hide Abstract & Findings' : 'Show Full Abstract & Key Findings'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3 text-[13px]"
                        >
                          {paper.keyFindings && paper.keyFindings.length > 0 && (
                            <div>
                              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                                Key Empirical Findings:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                {paper.keyFindings.map((kf, i) => (
                                  <li key={i}>{kf}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                              Abstract:
                            </h5>
                            <p className="text-gray-600 leading-relaxed">
                              {paper.abstract}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── SIDE-BY-SIDE COMPARISON MODAL ────────────────────────── */}
      <AnimatePresence>
        {isCompareModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
              onClick={() => setIsCompareModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-10 z-50 rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-600" />
                  <h3 className="text-[16px] font-bold text-gray-900">
                    Side-by-Side Paper Comparison ({comparisonPapers.length} Papers)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const titles = comparisonPapers.map(p => `"${p.title}"`).join(' vs ');
                      setSearchQuery(`Generate a structured comparative matrix between ${titles}. Highlight architectural choices, datasets, and benchmark trade-offs.`);
                      setIsCompareModalOpen(false);
                      setActivePage('chat');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-[12px] shadow-sm hover:bg-blue-700 flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Synthesize with AI
                  </button>
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {comparisonPapers.map(p => (
                  <div key={p.id} className="flex flex-col gap-4 pt-4 md:pt-0 md:px-4 first:pl-0 last:pr-0">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-gray-700 font-medium text-[11px]">
                          {p.venue} {p.year}
                        </span>
                        <span className="text-amber-500 text-[12px] font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5" fill="currentColor" /> {p.citations.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-gray-900 leading-snug">{p.title}</h4>
                      <p className="text-[12px] text-gray-500 mt-1">{p.authors.join(', ')}</p>
                    </div>

                    {p.tldr && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[13px] text-blue-900 leading-relaxed">
                        <span className="font-bold block text-[10px] text-blue-600 uppercase mb-1 tracking-wider">TL;DR:</span>
                        {p.tldr}
                      </div>
                    )}

                    {p.keyFindings && p.keyFindings.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Key Findings</h5>
                        <ul className="list-disc list-inside space-y-1 text-[12px] text-gray-700 leading-relaxed">
                          {p.keyFindings.map((kf, i) => (
                            <li key={i}>{kf}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h5 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Abstract</h5>
                      <p className="text-[12px] text-gray-600 leading-relaxed">{p.abstract}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
