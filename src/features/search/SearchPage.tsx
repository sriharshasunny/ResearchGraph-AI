import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bookmark, MessageSquare, 
  X, ArrowLeft, GitCompare, ChevronDown, Check,
  BookOpen
} from 'lucide-react';

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
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedField, setSelectedField] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedDataset, setSelectedDataset] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

  // Active Dropdown menu for pills
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery]);

  const years = ['All', '2025', '2024', '2023', '2022', '2021', '2020', '2017'];
  const fields = ['All', 'Architecture & NLP', 'Computer Vision', 'Multimodal', 'Reasoning & LLMs', 'Efficient ML', 'Graph AI & RAG'];
  const methods = ['All', 'Self-Attention', 'Masked Autoencoding', 'Reinforcement Learning', 'Contrastive Learning', 'LoRA', 'Test-Time Compute'];
  const datasets = ['All', 'ImageNet', 'GSM8K', 'MATH', 'WMT 2014', 'LVD-142M'];
  const sources = ['All', 'arXiv', 'NeurIPS', 'ICLR', 'ICML'];

  // Filtering
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

    if (selectedYear !== 'All' && String(paper.year) !== selectedYear) return false;
    if (selectedField !== 'All' && paper.field !== selectedField) return false;
    if (selectedSource !== 'All' && paper.venue !== selectedSource) return false;
    if (openAccessOnly && !paper.pdfUrl) return false;

    return true;
  });

  const handleOpenPaper = (id: string) => {
    setSelectedPaperId(id);
    setActivePage('details');
  };

  const handleAskAI = (paperTitle: string) => {
    setSearchQuery(`Analyze "${paperTitle}" and extract its core methodology, empirical results, and research implications.`);
    setActivePage('chat');
  };

  const hasActiveFilters = selectedYear !== 'All' || selectedField !== 'All' || selectedMethod !== 'All' || selectedDataset !== 'All' || selectedSource !== 'All' || openAccessOnly || localQuery;

  const resetFilters = () => {
    setSelectedYear('All');
    setSelectedField('All');
    setSelectedMethod('All');
    setSelectedDataset('All');
    setSelectedSource('All');
    setOpenAccessOnly(false);
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC] dark:bg-[#0B1426]">
      <div className="max-w-[1240px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm dark:shadow-none space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-2 rounded-xl text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:text-white hover:bg-gray-100 dark:bg-white dark:bg-[#111D35]/[0.06] transition-colors"
                title="Return to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white dark:text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Search Academic Research
                </h1>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-0.5">
                  Find papers from global and private research libraries.
                </p>
              </div>
            </div>

            <div className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/[0.04] dark:border-white/[0.04]">
              {filteredPapers.length} Papers Available
            </div>
          </div>

          {/* Large Search Input */}
          <div className="relative flex items-center bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-2.5 focus-within:border-blue-500 focus-within:bg-white dark:bg-[#111D35] dark:bg-[#111D35] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-gray-400 shrink-0 mr-3" />
            <input
              type="text"
              placeholder="Search papers, authors, datasets, concepts (e.g. DINOv2, self-attention, Vaswani)..."
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="flex-1 bg-transparent text-[14px] text-gray-900 dark:text-white dark:text-white placeholder-gray-400 focus:outline-none"
            />
            {localQuery && (
              <button 
                onClick={() => { setLocalQuery(''); setSearchQuery(''); }}
                className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 dark:text-gray-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ── FILTER PILLS ── */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-white/[0.04] dark:border-white/[0.04] text-[12px]">
            {/* Year Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
                className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  selectedYear !== 'All' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white dark:bg-[#111D35] dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04]'
                }`}
              >
                <span>Year: {selectedYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </button>
              {activeDropdown === 'year' && (
                <div className="absolute left-0 mt-1 w-32 bg-white dark:bg-[#111D35] dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => { setSelectedYear(y); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] flex items-center justify-between ${
                        selectedYear === y ? 'font-bold text-blue-600' : 'text-gray-700 dark:text-gray-200 dark:text-gray-200'
                      }`}
                    >
                      {y}
                      {selectedYear === y && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Research Area Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'field' ? null : 'field')}
                className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  selectedField !== 'All' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white dark:bg-[#111D35] dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04]'
                }`}
              >
                <span>Research Area: {selectedField}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </button>
              {activeDropdown === 'field' && (
                <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-[#111D35] dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg z-30 py-1">
                  {fields.map(f => (
                    <button
                      key={f}
                      onClick={() => { setSelectedField(f); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] flex items-center justify-between ${
                        selectedField === f ? 'font-bold text-blue-600' : 'text-gray-700 dark:text-gray-200 dark:text-gray-200'
                      }`}
                    >
                      {f}
                      {selectedField === f && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Method Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'method' ? null : 'method')}
                className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  selectedMethod !== 'All' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white dark:bg-[#111D35] dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04]'
                }`}
              >
                <span>Method: {selectedMethod}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </button>
              {activeDropdown === 'method' && (
                <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-[#111D35] dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg z-30 py-1">
                  {methods.map(m => (
                    <button
                      key={m}
                      onClick={() => { setSelectedMethod(m); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] flex items-center justify-between ${
                        selectedMethod === m ? 'font-bold text-blue-600' : 'text-gray-700 dark:text-gray-200 dark:text-gray-200'
                      }`}
                    >
                      {m}
                      {selectedMethod === m && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dataset Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'dataset' ? null : 'dataset')}
                className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  selectedDataset !== 'All' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white dark:bg-[#111D35] dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04]'
                }`}
              >
                <span>Dataset: {selectedDataset}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </button>
              {activeDropdown === 'dataset' && (
                <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-[#111D35] dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg z-30 py-1">
                  {datasets.map(d => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDataset(d); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] flex items-center justify-between ${
                        selectedDataset === d ? 'font-bold text-blue-600' : 'text-gray-700 dark:text-gray-200 dark:text-gray-200'
                      }`}
                    >
                      {d}
                      {selectedDataset === d && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Source Filter */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'source' ? null : 'source')}
                className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                  selectedSource !== 'All' 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white dark:bg-[#111D35] dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04]'
                }`}
              >
                <span>Source: {selectedSource}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              </button>
              {activeDropdown === 'source' && (
                <div className="absolute left-0 mt-1 w-36 bg-white dark:bg-[#111D35] dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] rounded-xl shadow-lg z-30 py-1">
                  {sources.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSelectedSource(s); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] flex items-center justify-between ${
                        selectedSource === s ? 'font-bold text-blue-600' : 'text-gray-700 dark:text-gray-200 dark:text-gray-200'
                      }`}
                    >
                      {s}
                      {selectedSource === s && <Check className="w-3 h-3 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Open Access Toggle */}
            <button
              onClick={() => setOpenAccessOnly(!openAccessOnly)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                openAccessOnly 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-white dark:bg-[#111D35] dark:bg-[#111D35] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04]'
              }`}
            >
              Open Access
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-blue-600 hover:underline font-semibold text-[11px]"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ── STICKY BATCH ACTIONS BAR (WHEN PAPERS SELECTED FOR COMPARISON) ── */}
        <AnimatePresence>
          {comparisonPaperIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="sticky top-16 z-30 bg-blue-900 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px] font-bold">
                  {comparisonPaperIds.length}
                </span>
                <span className="text-[13px] font-semibold">Papers Selected for Matrix Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('compare')}
                  className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-[12px] font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Open Side-by-Side Comparison
                </button>
                <button
                  onClick={clearComparison}
                  className="p-1.5 text-blue-300 hover:text-white"
                  title="Clear Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PAPER RESULTS: CLEAN RESEARCH ROWS ── */}
        <div className="space-y-3">
          {filteredPapers.length === 0 ? (
            <div className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] p-12 text-center flex flex-col items-center">
              <Search className="w-10 h-10 text-gray-300 mb-3" />
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white dark:text-white">No matching research papers</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Try searching for broader keywords like "Transformers", "Vision", or reset your filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-[12px] font-bold hover:bg-blue-100 transition-all"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredPapers.map((paper) => {
              const isSaved = savedPaperIds.includes(paper.id);
              const isCompared = comparisonPaperIds.includes(paper.id);

              return (
                <div
                  key={paper.id}
                  className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] p-5 hover:border-blue-300 hover:shadow-sm dark:shadow-none transition-all"
                >
                  {/* Top Row: Title + Action Buttons */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 
                        onClick={() => handleOpenPaper(paper.id)}
                        className="text-[15px] sm:text-[16px] font-bold text-gray-900 dark:text-white dark:text-white hover:text-blue-600 transition-colors cursor-pointer leading-snug"
                      >
                        {paper.title}
                      </h3>

                      <div className="flex items-center gap-2 flex-wrap text-[12px] text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1.5">
                        <span className="font-medium text-gray-700 dark:text-gray-200 dark:text-gray-200">{paper.authors.join(' · ')}</span>
                        <span>•</span>
                        <span className="font-semibold text-gray-600 dark:text-gray-300 dark:text-gray-300">{paper.year}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white dark:bg-[#111D35]/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 text-[11px] font-mono font-medium">
                          {paper.venue || 'arXiv'}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 dark:text-gray-200">{paper.citations.toLocaleString()} citations</span>
                      </div>
                    </div>

                    {/* Action Buttons: [Open] [Save] [Compare] [Ask AI] */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <button
                        onClick={() => handleOpenPaper(paper.id)}
                        className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] hover:bg-gray-100 dark:bg-white dark:bg-[#111D35]/[0.06] text-gray-700 dark:text-gray-200 dark:text-gray-200 font-semibold text-[11px] border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] transition-all"
                      >
                        Open
                      </button>

                      <button
                        onClick={() => toggleSavedPaper(paper.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-[11px] border transition-all ${
                          isSaved
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] hover:bg-gray-100 dark:bg-white dark:bg-[#111D35]/[0.06] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-700 dark:text-gray-200 dark:text-gray-200'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <button
                        onClick={() => toggleComparisonPaper(paper.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-[11px] border transition-all ${
                          isCompared
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] hover:bg-gray-100 dark:bg-white dark:bg-[#111D35]/[0.06] border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-700 dark:text-gray-200 dark:text-gray-200'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                      </button>

                      <button
                        onClick={() => handleAskAI(paper.title)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-sm dark:shadow-none transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Abstract preview */}
                  <p className="text-[13px] text-gray-600 dark:text-gray-300 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                    {paper.abstract}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {paper.field && (
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
                        {paper.field}
                      </span>
                    )}
                    {paper.tldr && (
                      <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-white dark:bg-[#111D35]/[0.06] text-gray-600 dark:text-gray-300 dark:text-gray-300 text-[11px] font-medium">
                        Key insight: {paper.tldr.slice(0, 70)}...
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
