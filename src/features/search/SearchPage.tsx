import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SortAsc, SortDesc, Bookmark, Network,
  MessageSquare, ExternalLink, Star, X, BookOpen, ArrowLeft,
  Check, Copy, Sparkles, GitCompare, ChevronDown, ChevronUp,
  FileText, Download
} from 'lucide-react';
import type { Paper } from '../../types';

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
  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);
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

  const handleCopyBibtex = (paper: Paper) => {
    if (paper.bibtex) {
      navigator.clipboard.writeText(paper.bibtex);
      setCopiedBibtexId(paper.id);
      setTimeout(() => setCopiedBibtexId(null), 2000);
    }
  };

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
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-x-hidden p-4 sm:p-6 pb-20">
      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(6,182,212,0.06),transparent)]" />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto flex flex-col gap-5">

        {/* ── TOP HEADER & SEARCH ──────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-[17px] font-black text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  Academic Literature Discovery
                </h1>
                <p className="text-[11px] text-gray-400">
                  Semantic index of foundational &amp; emerging AI research papers
                </p>
              </div>
            </div>

            <div className="text-[12px] font-mono text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20 font-bold">
              {filteredPapers.length} Papers Matched
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center gap-2.5 bg-[#050811]/90 border border-white/12 rounded-xl px-3.5 py-2.5 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by keywords, architecture, author (e.g. Attention, ViT, GRPO, Radford)..."
              value={localQuery}
              onChange={e => {
                setLocalQuery(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-500 focus:outline-none"
            />
            {localQuery && (
              <button onClick={() => { setLocalQuery(''); setSearchQuery(''); }} className="text-gray-500 hover:text-gray-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Faceted Filters */}
          <div className="mt-4 pt-4 border-t border-white/8 flex flex-col gap-3">
            {/* Field Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1">Field:</span>
              {fields.map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedField(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedField === f
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'bg-white/4 hover:bg-white/8 text-gray-400 hover:text-white border border-transparent'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Dropdown filters and sorting */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Venue filter */}
                <div className="flex items-center gap-1.5 bg-white/4 px-2.5 py-1 rounded-lg border border-white/8">
                  <span className="text-[10px] text-gray-500 font-semibold">Venue:</span>
                  <select
                    value={selectedVenue}
                    onChange={e => setSelectedVenue(e.target.value)}
                    className="bg-transparent text-[11px] text-gray-200 outline-none cursor-pointer"
                  >
                    {venues.map(v => <option key={v} value={v} className="bg-[#0b1222]">{v}</option>)}
                  </select>
                </div>

                {/* Year filter */}
                <div className="flex items-center gap-1.5 bg-white/4 px-2.5 py-1 rounded-lg border border-white/8">
                  <span className="text-[10px] text-gray-500 font-semibold">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="bg-transparent text-[11px] text-gray-200 outline-none cursor-pointer"
                  >
                    {years.map(y => <option key={y} value={y} className="bg-[#0b1222]">{y}</option>)}
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
                    className="text-[10px] text-cyan-400 hover:underline px-2 py-1 font-bold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Sort buttons */}
              <div className="flex items-center gap-1 bg-white/4 p-1 rounded-xl border border-white/8">
                {(['citations', 'year', 'title'] as SortKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      if (sortBy === key) setSortDesc(!sortDesc);
                      else { setSortBy(key); setSortDesc(true); }
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      sortBy === key
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {key === 'citations' ? 'Most Cited' : key === 'year' ? 'Latest' : 'Title'}
                    {sortBy === key && (sortDesc ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />)}
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
        <div className="space-y-3">
          {filteredPapers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 p-12 flex flex-col items-center justify-center text-center">
              <Search className="w-10 h-10 text-gray-600 mb-3" />
              <h3 className="text-[15px] font-black text-white">No research papers match your query</h3>
              <p className="text-[12px] text-gray-400 mt-1 max-w-md">
                Try searching for broader terms like "Transformers", "Self-Attention", "Contrastive", or reset your active filters.
              </p>
              <button
                onClick={() => {
                  setSelectedField('All');
                  setSelectedVenue('All');
                  setSelectedYear('All');
                  setLocalQuery('');
                }}
                className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-[11px] font-bold hover:bg-cyan-500/30 transition-all"
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
                  className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5 hover:border-cyan-500/30 transition-all shadow-md group flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Comparison Checkbox */}
                      <button
                        onClick={() => toggleComparisonPaper(paper.id)}
                        title={isChecked ? 'Remove from compare' : 'Select for comparison'}
                        className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-white/20 hover:border-indigo-400 bg-white/5'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Paper Main Header */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 font-mono font-black text-[10px]">
                            {paper.venue || 'ArXiv'} {paper.year}
                          </span>

                          {paper.field && (
                            <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[10px] font-semibold">
                              {paper.field}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold">
                            <Star className="w-3 h-3" fill="currentColor" />
                            {paper.citations.toLocaleString()} citations
                          </span>
                        </div>

                        <h3
                          onClick={() => handleSelectPaper(paper.id)}
                          className="text-[15px] font-black text-white hover:text-cyan-300 cursor-pointer transition-colors leading-snug"
                        >
                          {paper.title}
                        </h3>

                        <p className="text-[12px] text-gray-400 mt-1">
                          {paper.authors.join(' · ')}
                        </p>

                        {/* TLDR Badge */}
                        {paper.tldr && (
                          <div className="mt-2.5 p-2 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-[12px] text-cyan-300/90 leading-relaxed">
                            <span className="font-black uppercase tracking-wider text-[9px] text-cyan-400 mr-2">Key Takeaway:</span>
                            {paper.tldr}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => toggleSavedPaper(paper.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                          isSaved
                            ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSearchQuery(`Analyze "${paper.title}" and explain its architecture, empirical results, and limitations.`);
                            setActivePage('chat');
                          }}
                          title="Chat with AI about this paper"
                          className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/15 text-gray-400 hover:text-purple-300 border border-white/8 hover:border-purple-500/30 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => { setSelectedPaperId(paper.id); setActivePage('graph'); }}
                          title="Explore Citation Topology"
                          className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/15 text-gray-400 hover:text-cyan-300 border border-white/8 hover:border-cyan-500/30 transition-all"
                        >
                          <Network className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleCopyBibtex(paper)}
                          title="Copy BibTeX Citation"
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/8 hover:border-white/20 transition-all"
                        >
                          {copiedBibtexId === paper.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {paper.pdfUrl && (
                          <a
                            href={paper.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Open Open-Access PDF"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/8 hover:border-white/20 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Abstract & Key Findings */}
                  <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                    <button
                      onClick={() => setExpandedPaperId(isExpanded ? null : paper.id)}
                      className="self-start text-[11px] font-bold text-gray-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
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
                          className="mt-2 p-4 rounded-xl bg-[#060913] border border-white/8 flex flex-col gap-3 text-[12px]"
                        >
                          {paper.keyFindings && paper.keyFindings.length > 0 && (
                            <div>
                              <h5 className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-1.5">
                                Key Empirical Findings:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-300">
                                {paper.keyFindings.map((kf, i) => (
                                  <li key={i}>{kf}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
                              Abstract:
                            </h5>
                            <p className="text-gray-300 leading-relaxed">
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
              className="fixed inset-4 sm:inset-10 z-50 rounded-2xl border border-white/15 bg-[#0a0f1d] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-[16px] font-black text-white">
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
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[11px] shadow-md flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Synthesize with AI
                  </button>
                  <button
                    onClick={() => setIsCompareModalOpen(false)}
                    className="p-1.5 text-gray-500 hover:text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Grid content */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {comparisonPapers.map(p => (
                  <div key={p.id} className="flex flex-col gap-4 pt-4 md:pt-0 md:px-4 first:pl-0 last:pr-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-black">
                          {p.venue} {p.year}
                        </span>
                        <span className="text-amber-400 text-[11px] font-mono font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3" fill="currentColor" /> {p.citations.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-black text-white leading-snug">{p.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1">{p.authors.join(', ')}</p>
                    </div>

                    {p.tldr && (
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[12px] text-cyan-200">
                        <span className="font-bold block text-[10px] text-cyan-400 uppercase mb-1">TL;DR:</span>
                        {p.tldr}
                      </div>
                    )}

                    {p.keyFindings && p.keyFindings.length > 0 && (
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Key Findings</h5>
                        <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                          {p.keyFindings.map((kf, i) => (
                            <li key={i}>{kf}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Abstract</h5>
                      <p className="text-[11px] text-gray-300 leading-relaxed">{p.abstract}</p>
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
