import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { ReadingStatus } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowRight, BookOpen,
  Network, Zap, Bookmark, ExternalLink,
  Star, MessageSquare,
  Sparkles, Activity, Plus, FileText,
  X, CheckCircle, Copy, Check,
  ChevronDown, ChevronUp, Compass,
  GitCompare, ArrowUpRight, BookCheck, BookmarkPlus,
  Download
} from 'lucide-react';
import type { Paper } from '../../types';

export const Dashboard: React.FC = () => {
  const {
    setActivePage,
    setSearchQuery,
    setSelectedPaperId,
    savedPaperIds,
    toggleSavedPaper,
    paperReadingStatus,
    setPaperReadingStatus,
    paperNotes,
    setPaperNote,
    comparisonPaperIds,
    toggleComparisonPaper,
    clearComparison,
    activeProject,
    setActiveProject,
    scratchpad,
    setScratchpad,
    allPapers,
    addCustomPaper
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'reading' | 'to_read' | 'completed'>('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [expandedNotesPaperId, setExpandedNotesPaperId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const [copiedBibtexId, setCopiedBibtexId] = useState<string | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [addPaperOpen, setAddPaperOpen] = useState(false);
  const [addPaperInput, setAddPaperInput] = useState('');
  const [addPaperTitle, setAddPaperTitle] = useState('');
  const [addPaperField, setAddPaperField] = useState('Computer Vision');
  const [addPaperStatus, setAddPaperStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedCategory, setFeedCategory] = useState<'all' | 'cv' | 'nlp' | 'reasoning'>('all');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);

  // Projects list
  const availableProjects = [
    'Vision-Language Scaling & Reasoning',
    'Graph RAG & Topological Retrieval',
    'Linear-Time State Space Architectures',
    'Reinforcement Learning from Verifiable Rewards'
  ];

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    setSearchQuery(localSearch);
    setActivePage('search');
  };

  const handleQuickTopic = (topic: string) => {
    setSearchQuery(topic);
    setActivePage('search');
  };

  // Filtered saved papers
  const savedPapers = allPapers.filter(p => savedPaperIds.includes(p.id));
  const filteredLibrary = savedPapers.filter(p => {
    const status = paperReadingStatus[p.id] || 'to_read';
    if (libraryFilter !== 'all' && status !== libraryFilter) return false;
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        (p.field || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Reading status counters
  const readingCount = savedPapers.filter(p => (paperReadingStatus[p.id] || 'to_read') === 'reading').length;
  const toReadCount = savedPapers.filter(p => (paperReadingStatus[p.id] || 'to_read') === 'to_read').length;
  const completedCount = savedPapers.filter(p => (paperReadingStatus[p.id] || 'to_read') === 'completed').length;

  const handleCopyBibtex = (paper: Paper) => {
    if (paper.bibtex) {
      navigator.clipboard.writeText(paper.bibtex);
      setCopiedBibtexId(paper.id);
      setTimeout(() => setCopiedBibtexId(null), 2000);
    }
  };

  const handleExportAllBibtex = () => {
    const bibs = savedPapers.map(p => p.bibtex || `@misc{${p.id},\n  title={${p.title}},\n  year={${p.year}}\n}`).join('\n\n');
    navigator.clipboard.writeText(bibs);
    alert(`Copied BibTeX for ${savedPapers.length} saved papers to clipboard!`);
  };

  const handleSaveNote = (paperId: string) => {
    setPaperNote(paperId, editingNote);
    setExpandedNotesPaperId(null);
  };

  const handleCopyScratchpad = () => {
    navigator.clipboard.writeText(scratchpad);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleSendNotesToCopilot = () => {
    setSearchQuery(`Review my research hypotheses and suggest relevant literature:\n\n${scratchpad}`);
    setActivePage('chat');
  };

  const handleAddPaperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPaperInput.trim()) return;
    setAddPaperStatus('loading');
    setTimeout(() => {
      const newId = `custom-${Date.now()}`;
      const title = addPaperTitle.trim() || addPaperInput.trim();
      const newPaper: Paper = {
        id: newId,
        title,
        authors: ['Sriharsha Sunny', 'Collaborators'],
        year: new Date().getFullYear(),
        citations: 0,
        venue: 'ArXiv',
        field: addPaperField,
        tldr: 'Newly imported paper directly into researcher workspace.',
        abstract: 'User-imported paper via direct URL/DOI into ResearchGraph AI.',
        url: addPaperInput.startsWith('http') ? addPaperInput : `https://arxiv.org/abs/${addPaperInput}`,
        bibtex: `@article{user_${Date.now()},\n  title={${title}},\n  author={User import},\n  year={${new Date().getFullYear()}}\n}`
      };
      addCustomPaper(newPaper);
      setPaperReadingStatus(newId, 'to_read');
      setAddPaperStatus('success');
      setTimeout(() => {
        setAddPaperOpen(false);
        setAddPaperInput('');
        setAddPaperTitle('');
        setAddPaperStatus('idle');
      }, 1200);
    }, 800);
  };

  // Comparison papers
  const comparisonPapers = allPapers.filter(p => comparisonPaperIds.includes(p.id));

  // ArXiv Live Feed Papers (from allPapers)
  const feedPapers = allPapers.filter(p => {
    if (feedCategory === 'cv') return p.field?.toLowerCase().includes('vision');
    if (feedCategory === 'nlp') return p.field?.toLowerCase().includes('nlp') || p.field?.toLowerCase().includes('architecture');
    if (feedCategory === 'reasoning') return p.field?.toLowerCase().includes('reasoning');
    return true;
  }).slice(0, 4);

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-x-hidden pb-12">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(14,165,233,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 flex flex-col gap-5">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ROW 1: RESEARCH WORKBENCH COMMAND BAR */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Project Context & Identity */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/10 shrink-0">
                <div className="w-full h-full rounded-[11px] bg-[#070b14] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Workspace</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold">
                    SYNCHRONIZED
                  </span>
                </div>

                <div className="relative mt-0.5">
                  <button
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="flex items-center gap-2 text-[15px] font-black text-white hover:text-cyan-300 transition-colors group"
                  >
                    <span>{activeProject}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-cyan-400 transition-transform" />
                  </button>

                  {/* Project Selector Dropdown */}
                  <AnimatePresence>
                    {showProjectDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute left-0 top-full mt-2 w-80 rounded-xl bg-[#0b1222] border border-white/15 shadow-2xl p-2 z-50 backdrop-blur-2xl"
                      >
                        <p className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Switch Project</p>
                        {availableProjects.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => { setActiveProject(p); setShowProjectDropdown(false); }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-[12px] font-medium transition-all flex items-center justify-between ${
                              activeProject === p ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{p}</span>
                            {activeProject === p && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Quick Live Stats & Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap lg:justify-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-[11px] text-gray-300">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white">{savedPapers.length}</span>
                <span className="text-gray-500">Saved Papers</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-[11px] text-gray-300">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">{readingCount}</span>
                <span className="text-gray-500">In Reading</span>
              </div>

              <button
                onClick={handleExportAllBibtex}
                title="Export entire library as BibTeX"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-[11px] font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                BibTeX ({savedPapers.length})
              </button>

              <button
                onClick={() => setAddPaperOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Paper
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="mt-4 relative group">
            <div className="relative flex items-center gap-2.5 bg-[#050811]/90 border border-white/12 rounded-xl px-3.5 py-2.5 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search literature by concept, methodology, author, or question... (Press Ctrl+K)"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-500 focus:outline-none"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                <span>⌘K</span>
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[11px] hover:bg-cyan-500/30 transition-all flex items-center gap-1"
              >
                Search <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1">Explore Topics:</span>
            {[
              'Vision Transformers',
              'Self-Supervised Learning',
              'DeepSeek-R1 GRPO',
              'FlashAttention-2',
              'Graph RAG',
              'Selective State Spaces (Mamba)',
              'LoRA Fine-Tuning'
            ].map((t, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickTopic(t)}
                className="px-2.5 py-1 rounded-lg bg-white/4 hover:bg-cyan-500/10 border border-white/8 hover:border-cyan-500/30 text-[10px] text-gray-400 hover:text-cyan-300 transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ROW 2: ACTIVE COMPARISON BAR (IF PAPERS SELECTED) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {comparisonPaperIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0d1428] to-purple-950/40 backdrop-blur-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-bold text-white">
                    Paper Comparison Workspace ({comparisonPaperIds.length}/3 selected)
                  </h4>
                  <span className="text-[10px] text-indigo-300 font-mono">Side-by-side Matrix</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {comparisonPapers.map(cp => (
                    <span
                      key={cp.id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-300"
                    >
                      <span className="truncate max-w-[200px] font-semibold">{cp.title}</span>
                      <button
                        onClick={() => toggleComparisonPaper(cp.id)}
                        className="text-gray-500 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={clearComparison}
                className="px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-white text-[11px] font-medium"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  const titles = comparisonPapers.map(p => `"${p.title}"`).join(' and ');
                  setSearchQuery(`Generate a structured comparative literature review between ${titles}. Analyze architectural differences, training objectives, empirical benchmarks, and trade-offs.`);
                  setActivePage('chat');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-lg shadow-purple-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Synthesize Comparison with AI
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ROW 3: MAIN WORKSPACE (LEFT 8 COLS) + TOOLS DOCK (RIGHT 4 COLS) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-5">

          {/* LEFT 8 COLS: READING DESK & SAVED PAPERS */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">

            {/* ── INTERACTIVE READING DESK ───────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl overflow-hidden shadow-xl">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <BookCheck className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-[13px] font-black text-white uppercase tracking-wider">
                    My Reading Desk &amp; Library
                  </h3>
                  <span className="text-[11px] font-mono text-gray-500">({savedPapers.length} papers)</span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'all', label: 'All', count: savedPapers.length },
                    { id: 'reading', label: 'Reading', count: readingCount },
                    { id: 'to_read', label: 'To Read', count: toReadCount },
                    { id: 'completed', label: 'Done', count: completedCount },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLibraryFilter(tab.id as any)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        libraryFilter === tab.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                      <span className="text-[9px] opacity-75">({tab.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Library search filter */}
              <div className="px-5 py-2.5 border-b border-white/5 bg-black/20 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Filter within your saved papers..."
                  value={librarySearch}
                  onChange={e => setLibrarySearch(e.target.value)}
                  className="bg-transparent text-[12px] text-white placeholder-gray-600 focus:outline-none flex-1"
                />
                {librarySearch && (
                  <button onClick={() => setLibrarySearch('')} className="text-gray-500 hover:text-gray-300">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Papers List */}
              <div className="divide-y divide-white/5">
                {filteredLibrary.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <Bookmark className="w-8 h-8 text-gray-600 mb-2" />
                    <p className="text-[13px] font-bold text-gray-400">No papers in this view</p>
                    <p className="text-[11px] text-gray-600 mt-1 max-w-sm">
                      {librarySearch ? 'Try a different filter keyword.' : 'Explore and bookmark papers from search or ArXiv digest below.'}
                    </p>
                  </div>
                ) : (
                  filteredLibrary.map(paper => {
                    const status = paperReadingStatus[paper.id] || 'to_read';
                    const isCompared = comparisonPaperIds.includes(paper.id);
                    const note = paperNotes[paper.id] || '';
                    const isNotesExpanded = expandedNotesPaperId === paper.id;

                    return (
                      <div
                        key={paper.id}
                        className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col gap-2.5"
                      >
                        {/* Top info line */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Compare Checkbox */}
                            <button
                              onClick={() => toggleComparisonPaper(paper.id)}
                              title={isCompared ? 'Remove from compare' : 'Add to compare'}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                isCompared
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : 'border-white/20 hover:border-indigo-400 bg-white/5'
                              }`}
                            >
                              {isCompared && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            {/* Title & Metadata */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-black text-[9px] font-mono">
                                  {paper.venue || 'ArXiv'} {paper.year}
                                </span>
                                {paper.field && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/25 text-purple-300 font-medium text-[9px]">
                                    {paper.field}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                                  <Star className="w-2.5 h-2.5" fill="currentColor" />
                                  {paper.citations.toLocaleString()} citations
                                </span>
                              </div>

                              <h4
                                onClick={() => { setSelectedPaperId(paper.id); setActivePage('details'); }}
                                className="text-[13px] font-bold text-white hover:text-cyan-300 cursor-pointer transition-colors leading-snug"
                              >
                                {paper.title}
                              </h4>

                              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                                {paper.authors.join(', ')}
                              </p>

                              {/* One-sentence TLDR */}
                              {paper.tldr && (
                                <p className="text-[11px] text-cyan-400/90 bg-cyan-500/5 border border-cyan-500/10 rounded-md px-2 py-1 mt-1.5 leading-relaxed">
                                  <span className="font-bold uppercase tracking-wider text-[9px] text-cyan-300 mr-1.5">TL;DR:</span>
                                  {paper.tldr}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Reading Status Selector & Actions */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {/* Reading Status Dropdown */}
                            <select
                              value={status}
                              onChange={e => setPaperReadingStatus(paper.id, e.target.value as ReadingStatus)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                                status === 'completed'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : status === 'reading'
                                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                  : 'bg-white/5 border-white/15 text-gray-400'
                              }`}
                            >
                              <option value="to_read">To Read</option>
                              <option value="reading">Currently Reading</option>
                              <option value="completed">Completed</option>
                            </select>

                            {/* Quick Action Icons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setSearchQuery(`Analyze the core methodology and findings of "${paper.title}"`); setActivePage('chat'); }}
                                title="Chat with AI about this paper"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => { setSelectedPaperId(paper.id); setActivePage('graph'); }}
                                title="View in Citation Graph"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                              >
                                <Network className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleCopyBibtex(paper)}
                                title="Copy BibTeX Citation"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                              >
                                {copiedBibtexId === paper.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => toggleSavedPaper(paper.id)}
                                title="Remove from Library"
                                className="p-1.5 rounded-lg text-cyan-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              >
                                <Bookmark className="w-3.5 h-3.5" fill="currentColor" />
                              </button>

                              {paper.pdfUrl && (
                                <a
                                  href={paper.pdfUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open PDF"
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Notes / Annotations */}
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              if (isNotesExpanded) {
                                setExpandedNotesPaperId(null);
                              } else {
                                setExpandedNotesPaperId(paper.id);
                                setEditingNote(note);
                              }
                            }}
                            className="text-[10px] font-bold text-gray-500 hover:text-cyan-300 transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            {note ? `Notes (${note.length} chars)` : '+ Add personal note'}
                            {isNotesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          <AnimatePresence>
                            {isNotesExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 p-3 rounded-xl bg-[#060913] border border-white/10 flex flex-col gap-2"
                              >
                                <textarea
                                  value={editingNote}
                                  onChange={e => setEditingNote(e.target.value)}
                                  placeholder="Write notes, key takeaways, equations, or hypothesis related to this paper..."
                                  className="w-full bg-transparent text-[12px] text-gray-200 placeholder-gray-600 focus:outline-none resize-none h-20 font-mono"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setExpandedNotesPaperId(null)}
                                    className="px-2.5 py-1 rounded text-[11px] text-gray-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveNote(paper.id)}
                                    className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold hover:bg-cyan-500/30 transition-all"
                                  >
                                    Save Note
                                  </button>
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

            {/* ── DAILY ARXIV & CONFERENCE DIGEST ────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-[13px] font-black text-white uppercase tracking-wider">
                      ArXiv &amp; Conference Feed
                    </h3>
                    <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      LIVE DIGEST
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Top landmark papers curated for your domain</p>
                </div>

                {/* Feed category pills */}
                <div className="flex items-center gap-1 bg-white/4 p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'cv', label: 'Vision' },
                    { id: 'nlp', label: 'NLP / LLM' },
                    { id: 'reasoning', label: 'Reasoning' },
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFeedCategory(c.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        feedCategory === c.id
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedPapers.map(paper => {
                  const isSaved = savedPaperIds.includes(paper.id);
                  return (
                    <div
                      key={paper.id}
                      className="p-3.5 rounded-xl border border-white/8 bg-[#060a15]/60 hover:bg-[#080e1e] hover:border-purple-500/30 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {paper.venue} {paper.year}
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5" fill="currentColor" /> {(paper.citations / 1000).toFixed(1)}k
                          </span>
                        </div>
                        <h4
                          onClick={() => { setSelectedPaperId(paper.id); setActivePage('details'); }}
                          className="text-[12px] font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-2 cursor-pointer leading-snug"
                        >
                          {paper.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                          {paper.authors[0]} et al.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                        <button
                          onClick={() => toggleSavedPaper(paper.id)}
                          className={`text-[10px] font-bold flex items-center gap-1 transition-colors ${
                            isSaved ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-300'
                          }`}
                        >
                          <Bookmark className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} />
                          {isSaved ? 'Saved' : 'Save'}
                        </button>

                        <button
                          onClick={() => { setSelectedPaperId(paper.id); setActivePage('details'); }}
                          className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1"
                        >
                          Read <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLS: INTERACTIVE RESEARCH DOCK */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">

            {/* ── RESEARCH SCRATCHPAD & HYPOTHESIS LAB ───────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-[12px] font-black text-white uppercase tracking-wider">
                    Research Scratchpad
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <Check className="w-2.5 h-2.5" /> Auto-saved
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">
                Jot working hypotheses, survey notes, and open questions.
              </p>

              <textarea
                value={scratchpad}
                onChange={e => setScratchpad(e.target.value)}
                placeholder="Type your notes here..."
                rows={7}
                className="w-full bg-[#050812] border border-white/10 rounded-xl p-3 text-[11px] font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 resize-y leading-relaxed"
              />

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={handleCopyScratchpad}
                  className="text-[10px] font-bold text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedNotes ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedNotes ? 'Copied!' : 'Copy Notes'}
                </button>

                <button
                  onClick={handleSendNotesToCopilot}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Ask AI to Review
                </button>
              </div>
            </div>

            {/* ── INTERACTIVE TOPOLOGY MINI RADAR ────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-[12px] font-black text-white uppercase tracking-wider">
                    Citation Topology Radar
                  </h3>
                </div>
                <button
                  onClick={() => setActivePage('graph')}
                  className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  3D View <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {/* Interactive SVG Radar Canvas */}
              <div className="relative w-full h-44 rounded-xl bg-[#050811] border border-white/8 overflow-hidden flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full">
                  {/* Concentric rings */}
                  <circle cx="50%" cy="50%" r="25%" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <circle cx="50%" cy="50%" r="45%" fill="none" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  
                  {/* Edges */}
                  <line x1="50%" y1="50%" x2="25%" y2="30%" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="28%" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="78%" y2="72%" stroke="rgba(14,165,233,0.3)" strokeWidth="1.5" />
                  <line x1="25%" y1="30%" x2="75%" y2="28%" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2 2" />
                </svg>

                {/* Central Root Node */}
                <div
                  onClick={() => { setSelectedPaperId('p1'); setActivePage('details'); }}
                  title="Attention Is All You Need (Root)"
                  className="absolute z-10 w-9 h-9 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  <span className="text-[9px] font-black text-cyan-300">ViT</span>
                </div>

                {/* Peripheral Nodes */}
                {[
                  { id: 'p1', label: 'Attn', x: '25%', y: '30%', col: 'border-cyan-400 text-cyan-300' },
                  { id: 'p3', label: 'DINO', x: '75%', y: '28%', col: 'border-purple-400 text-purple-300' },
                  { id: 'p4', label: 'CLIP', x: '30%', y: '75%', col: 'border-emerald-400 text-emerald-300' },
                  { id: 'p5', label: 'R1', x: '78%', y: '72%', col: 'border-indigo-400 text-indigo-300' },
                ].map((node, i) => (
                  <div
                    key={i}
                    onClick={() => { setSelectedPaperId(node.id); setActivePage('details'); }}
                    style={{ left: node.x, top: node.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 px-2 py-0.5 rounded-full bg-[#0a0f1d] border ${node.col} text-[9px] font-bold cursor-pointer hover:scale-110 transition-transform shadow-md`}
                  >
                    {node.label}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 px-1">
                <span>5 clusters active</span>
                <span>Click nodes to view paper</span>
              </div>
            </div>

            {/* ── COPILOT RESEARCH PROMPT LAUNCHPAD ─────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-4 shadow-xl">
              <div className="flex items-center gap-2 mb-2.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-[12px] font-black text-white uppercase tracking-wider">
                  Synthesis Launchpad
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">
                1-click literature inquiries grounded in your index:
              </p>

              <div className="space-y-2">
                {[
                  {
                    title: 'Compare DINOv2 vs CLIP',
                    prompt: 'Compare DINOv2 and CLIP. Highlight differences between self-supervised vision features and language-supervised contrastive learning.'
                  },
                  {
                    title: 'Explain DeepSeek-R1 GRPO',
                    prompt: 'Explain how DeepSeek-R1 uses Group Relative Policy Optimization (GRPO) to train reasoning capabilities without a critic model.'
                  },
                  {
                    title: 'Synthesize ViT vs CNN trade-offs',
                    prompt: 'Explain the inductive biases of Vision Transformers compared to Convolutional Neural Networks at scale.'
                  },
                  {
                    title: 'Literature Review: FlashAttention',
                    prompt: 'Summarize the IO-aware GPU SRAM tiling technique introduced in FlashAttention and FlashAttention-2.'
                  },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSearchQuery(p.prompt); setActivePage('chat'); }}
                    className="w-full text-left p-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group flex items-center justify-between"
                  >
                    <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors">
                      {p.title}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ADD PAPER MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {addPaperOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
              onClick={() => { setAddPaperOpen(false); setAddPaperStatus('idle'); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div className="rounded-2xl border border-white/15 bg-[#0a0f1d] shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookmarkPlus className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-[15px] font-black text-white">Import Paper to Library</h3>
                  </div>
                  <button
                    onClick={() => { setAddPaperOpen(false); setAddPaperStatus('idle'); }}
                    className="p-1 rounded-lg text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddPaperSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Paper Title or URL / ArXiv ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2304.07193 or Attention Is All You Need"
                      value={addPaperInput}
                      onChange={e => setAddPaperInput(e.target.value)}
                      className="w-full bg-[#050811] border border-white/15 rounded-xl px-3 py-2 text-[12px] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Paper Field / Topic
                    </label>
                    <select
                      value={addPaperField}
                      onChange={e => setAddPaperField(e.target.value)}
                      className="w-full bg-[#050811] border border-white/15 rounded-xl px-3 py-2 text-[12px] text-white outline-none"
                    >
                      <option value="Computer Vision">Computer Vision</option>
                      <option value="Architecture & NLP">Architecture & NLP</option>
                      <option value="Multimodal">Multimodal</option>
                      <option value="Reasoning & LLMs">Reasoning & LLMs</option>
                      <option value="Efficient ML">Efficient ML</option>
                      <option value="Graph AI & RAG">Graph AI & RAG</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={addPaperStatus === 'loading' || addPaperStatus === 'success'}
                    className={`w-full py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all ${
                      addPaperStatus === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500'
                    }`}
                  >
                    {addPaperStatus === 'loading' && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {addPaperStatus === 'success' && <><CheckCircle className="w-3.5 h-3.5" /> Added to Library!</>}
                    {addPaperStatus === 'idle' && 'Import Paper'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
