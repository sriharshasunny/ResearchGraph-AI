import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bookmark, MessageSquare, ExternalLink, 
  GitCompare, Network, Copy, Check, FileText, Share2,
  Sparkles, Tag, BookOpen, Download, ChevronRight, X
} from 'lucide-react';
import { getPaperDetails, getPaperGraph } from '../../services/api';
import type { ResearchGraph } from '../../services/api';
import type { Paper } from '../../types';

export const PaperDetailsPage: React.FC = () => {
  const {
    selectedPaperId,
    savedPaperIds,
    toggleSavedPaper,
    setActivePage,
    setSearchQuery,
    allPapers,
    setSelectedPaperId,
    comparisonPaperIds,
    toggleComparisonPaper
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'methodology' | 'results' | 'citations' | 'related' | 'graph'>('overview');
  const [tldrMode, setTldrMode] = useState<'simple' | 'expert'>('simple');
  const [readerMode, setReaderMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'bibtex' | 'apa' | 'mla' | 'chicago' | 'ris'>('bibtex');
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('Foundational Reading');
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [remotePaper, setRemotePaper] = useState<Paper | null>(null);
  const [paperLoadError, setPaperLoadError] = useState<string | null>(null);
  const [paperGraph, setPaperGraph] = useState<ResearchGraph | null>(null);
  const [graphLoadError, setGraphLoadError] = useState<string | null>(null);

  const localPaper = allPapers.find(p => p.id === selectedPaperId);
  const paper = localPaper || (remotePaper?.id === selectedPaperId ? remotePaper : null);

  useEffect(() => {
    if (!selectedPaperId || localPaper) return;
    let cancelled = false;
    setPaperLoadError(null);
    getPaperDetails(selectedPaperId).then(result => { if (!cancelled) setRemotePaper(result); })
      .catch(error => { if (!cancelled) setPaperLoadError(error instanceof Error ? error.message : 'Paper metadata could not be loaded.'); });
    return () => { cancelled = true; };
  }, [selectedPaperId, localPaper]);

  useEffect(() => {
    if (!selectedPaperId) return;
    let cancelled = false;
    setPaperGraph(null);
    setGraphLoadError(null);
    getPaperGraph(selectedPaperId).then(result => { if (!cancelled) setPaperGraph(result); })
      .catch(error => { if (!cancelled) setGraphLoadError(error instanceof Error ? error.message : 'Knowledge graph data is unavailable.'); });
    return () => { cancelled = true; };
  }, [selectedPaperId]);

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-transparent">
        <FileText className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">{selectedPaperId && !paperLoadError ? 'Loading paper details…' : selectedPaperId ? 'Paper details unavailable' : 'No paper selected'}</h2>
        {paperLoadError && <p className="mt-2 max-w-md text-sm text-gray-600">{paperLoadError}</p>}
        <button
          onClick={() => setActivePage('search')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 transition-colors"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isSaved = savedPaperIds.includes(paper.id);
  const isCompared = comparisonPaperIds.includes(paper.id);
  const relatedPapers = allPapers.filter(p => p.id !== paper.id).slice(0, 4);
  const graphLabelById = new Map((paperGraph?.nodes || []).map(node => [node.id, node.label]));
  const paperGraphEdges = paperGraph?.edges || [];

  const collections = [
    'Foundational Reading',
    'Core Architectures',
    'Vision & Multimodal',
    'Benchmarks & Evaluation',
    'To Read This Week'
  ];

  // Formatted citations
  const year = paper.year;
  const venue = paper.venue || paper.source || 'Publication venue unavailable';
  const bibtexKey = paper.id.replace(/[^a-z0-9]/gi, '').slice(-24) || 'paper';

  const citationsRecord: Record<string, string> = {
    bibtex: paper.bibtex || `@article{${bibtexKey},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  journal={${venue}},\n  year={${year}}${paper.doi ? `,\n  doi={${paper.doi}}` : ''}\n}`,
    apa: `${paper.authors.join(', ')} (${year || 'n.d.'}). ${paper.title}. ${venue}.${paper.doi ? ` https://doi.org/${paper.doi}` : paper.url ? ` ${paper.url}` : ''}`,
    mla: `${paper.authors.join(', ')}. "${paper.title}." ${venue}, ${year}.`,
    chicago: `${paper.authors.join(', ')}. "${paper.title}." ${venue} (${year}).`,
    ris: `TY  - JOUR\nTI  - ${paper.title}\nAU  - ${paper.authors.join('\nAU  - ')}\nPY  - ${year}\nJO  - ${venue}\nER  -`
  };

  const handleCopyCitation = () => {
    const textToCopy = citationsRecord[exportFormat];
    navigator.clipboard.writeText(textToCopy);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const handleDownloadCitation = () => {
    const textToDownload = citationsRecord[exportFormat];
    const extension = exportFormat === 'bibtex' ? 'bib' : exportFormat === 'ris' ? 'ris' : 'txt';
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper.id}-citation.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAskAI = () => {
    setSearchQuery(`Analyze "${paper.title}" by ${paper.authors.join(', ')} (${paper.year}). Break down its methodology, benchmark results, and limitations.`);
    setActivePage('chat');
  };

  const handleAuthorClick = (authorName: string) => {
    setSearchQuery(authorName);
    setActivePage('search');
  };

  // TL;DR content by mode
  const tldrSimple = paper.tldr || 'No verified summary is available yet. Add this paper to the research index to ask questions grounded in its accessible text.';
  const tldrExpert = paper.tldr || 'A verified technical summary is not available for this paper.';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'results', label: 'Results & Metrics' },
    { id: 'citations', label: 'Citations & BibTeX' },
    { id: 'related', label: 'Related Papers' },
    { id: 'graph', label: 'Graph View' }
  ] as const;

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-transparent">
      <div className="max-w-[1360px] mx-auto space-y-6">

        {/* ── BREADCRUMB HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400 font-medium">
            <button 
              onClick={() => setActivePage('dashboard')}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <button 
              onClick={() => setActivePage('search')}
              className="hover:text-blue-600 transition-colors"
            >
              Papers
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-semibold max-w-[280px] sm:max-w-[450px] truncate" title={paper.title}>
              {paper.title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setReaderMode(!readerMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                readerMode 
                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                  : 'bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-300'
              }`}
              title="Toggle distraction-free reader mode"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{readerMode ? 'Exit Reader Mode' : 'Reader Mode'}</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200 text-[12px] font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cite / Export</span>
            </button>
          </div>
        </div>

        {/* ── PAPER HERO / TITLE CONTAINER ── */}
        <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Field & Venue Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-[11px]">
                {paper.field || 'Artificial Intelligence'}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200 font-mono text-[11px]">
                {paper.venue || 'arXiv'} · {paper.year}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                {paper.citations.toLocaleString()} citations
              </span>
            </div>

            {/* Actions: Save, Compare, Ask AI, Original PDF */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Save with Collections Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleSavedPaper(paper.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                    isSaved
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                      : 'bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
                {isSaved && (
                  <button
                    onClick={() => setIsCollectionMenuOpen(!isCollectionMenuOpen)}
                    className="ml-1 px-2 py-2 rounded-xl bg-blue-50 border border-blue-300 text-blue-700 text-[11px] font-medium hover:bg-blue-100 transition-colors"
                    title="Change collection"
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Collection selector menu */}
                {isCollectionMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-2xl shadow-xl p-2 z-30 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
                      Assign Collection
                    </div>
                    {collections.map(col => (
                      <button
                        key={col}
                        onClick={() => {
                          setSelectedCollection(col);
                          setIsCollectionMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-[12px] flex items-center justify-between transition-colors ${
                          selectedCollection === col ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-white/[0.04]'
                        }`}
                      >
                        <span>{col}</span>
                        {selectedCollection === col && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare Button */}
              <button
                onClick={() => toggleComparisonPaper(paper.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                  isCompared
                    ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm'
                    : 'bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{isCompared ? `In Compare (${comparisonPaperIds.length}/10)` : 'Compare'}</span>
              </button>

              {/* Ask AI */}
              <button
                onClick={handleAskAI}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>

              {paper.pdfUrl && (
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-gray-700 dark:text-gray-200 text-[12px] font-semibold border border-gray-200 dark:border-white/[0.06] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white leading-snug tracking-tight">
              {paper.title}
            </h1>
            
            {/* Clickable Authors */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-[13px] text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Authors:</span>
              {paper.authors.map((author, index) => (
                <span key={author} className="inline-flex items-center">
                  <button
                    onClick={() => handleAuthorClick(author)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                    title={`Search papers by ${author}`}
                  >
                    {author}
                  </button>
                  {index < paper.authors.length - 1 && <span className="text-gray-400 ml-2">·</span>}
                </span>
              ))}
            </div>

            {/* Active Collection Tag if saved */}
            {isSaved && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200">
                <Tag className="w-3 h-3 text-blue-600" />
                <span>Collection: {selectedCollection}</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-t border-gray-100 dark:border-white/[0.04] pt-3 overflow-x-auto scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-50 dark:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TWO-COLUMN RESEARCH READING LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === 'overview' && (
              <>
                {/* ── INTERACTIVE TL;DR SECTION (SIMPLE vs EXPERT) ── */}
                <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-cyan-50/50 rounded-2xl p-6 border border-blue-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">
                        Executive Summary &amp; TL;DR
                      </h2>
                    </div>

                    {/* Mode Segmented Control */}
                    <div className="flex items-center p-0.5 bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-xl shadow-xs">
                      <button
                        onClick={() => setTldrMode('simple')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          tldrMode === 'simple'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                        }`}
                      >
                        Simple (Intuition)
                      </button>
                      <button
                        onClick={() => setTldrMode('expert')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          tldrMode === 'expert'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                        }`}
                      >
                        Expert (Rigorous)
                      </button>
                    </div>
                  </div>

                  <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
                    {tldrMode === 'simple' ? tldrSimple : tldrExpert}
                  </p>
                </div>

                {/* Abstract Card */}
                <div className={`bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3 ${
                  readerMode ? 'font-serif text-[15px] leading-loose max-w-[68ch] mx-auto bg-[#FCFBF8]' : ''
                }`}>
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Abstract
                  </h2>
                  <p className="text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed max-w-[72ch]">
                    {paper.abstract}
                  </p>
                </div>

                {/* Key Contributions & Findings */}
                <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Key contributions &amp; findings
                  </h2>
                  <ul className="space-y-2 text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed">
                    {paper.keyFindings && paper.keyFindings.length > 0 ? (
                      paper.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No verified key findings are available from the indexed paper content yet.</li>
                    )}
                  </ul>
                </div>

                {/* Methodology & Benchmark Architecture */}
                <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Methodology &amp; benchmark architecture
                  </h2>
                  <p className="text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed">
                    Methodology details have not been extracted from this paper. Add an accessible full text to the research index to retrieve evidence-backed methods.
                  </p>
                </div>

                {/* Limitations & Future Directions */}
                <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Limitations &amp; future directions
                  </h2>
                  <p className="text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed">
                    Limitations and future directions are not available from the metadata record. They will appear here only when supported by indexed paper passages.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'methodology' && (
              <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
                <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Mathematical formulation &amp; training pipeline</h2>
                <p className="text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed">
                  No verified methodology passages are indexed for this paper. Add the paper to the research index to enable passage-based analysis.
                </p>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
                <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Benchmark metrics &amp; ablation studies</h2>
                <p className="text-sm text-gray-600">No benchmark metrics have been extracted from indexed evidence for this paper.</p>
              </div>
            )}

            {activeTab === 'citations' && (
              <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">BibTeX Citation</h2>
                  <button
                    onClick={handleCopyCitation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-[12px] font-medium transition-colors"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCitation ? 'Copied Citation!' : 'Copy BibTeX'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-gray-900 text-cyan-300 font-mono text-[12px] overflow-x-auto leading-relaxed">
                  {citationsRecord.bibtex}
                </pre>
              </div>
            )}

            {activeTab === 'related' && (
              <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3">
                <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Directly related research</h2>
                <div className="divide-y divide-gray-100">
                  {relatedPapers.map(rel => (
                    <div key={rel.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 
                          onClick={() => setSelectedPaperId(rel.id)}
                          className="text-[14px] font-bold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer"
                        >
                          {rel.title}
                        </h4>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {rel.authors[0]} et al. · {rel.year} · {rel.citations.toLocaleString()} citations
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleComparisonPaper(rel.id)}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                            comparisonPaperIds.includes(rel.id)
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {comparisonPaperIds.includes(rel.id) ? 'In Compare' : '+ Compare'}
                        </button>
                        <button
                          onClick={() => setSelectedPaperId(rel.id)}
                          className="px-3 py-1.5 bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-gray-700 dark:text-gray-200 text-[11px] font-semibold rounded-lg border border-gray-200 dark:border-white/[0.06] transition-colors"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="bg-[#06111F] rounded-2xl p-6 border border-blue-900/40 shadow-xl space-y-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    Citation &amp; methodology neighborhood
                  </h2>
                  <button
                    onClick={() => setActivePage('graph')}
                    className="text-[12px] text-cyan-300 hover:underline"
                  >
                    Open Full Graph Explorer →
                  </button>
                </div>
                <div className="min-h-56 rounded-xl bg-[#09152E] border border-white/10 p-4">
                  {paperGraphEdges.length ? <div className="space-y-3">
                    {paperGraphEdges.map(edge => <article key={edge.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold text-cyan-200">{paper.title}</span><span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-200">{edge.relation}</span><span className="font-semibold text-violet-200">{graphLabelById.get(edge.source === paper.id ? edge.target : edge.source) || graphLabelById.get(edge.target) || 'Research entity'}</span></div>
                      {edge.evidence && <p className="mt-2 text-xs leading-relaxed text-gray-300">Evidence: {edge.evidence}{edge.page ? ` · page ${edge.page}` : ''}</p>}
                    </article>)}
                  </div> : <div className="flex min-h-48 flex-col items-center justify-center text-center">
                    <Network className="h-9 w-9 text-cyan-400" />
                    <p className="mt-3 text-sm text-gray-300">{graphLoadError || 'No graph entities have been indexed for this paper yet.'}</p>
                    <button type="button" onClick={() => setActivePage('search')} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">Find paper in Search</button>
                  </div>}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: PAPER INFORMATION & MINI GRAPH (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Paper Information Card */}
            <div className="bg-white dark:bg-[#111D35] rounded-2xl p-5 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
              <h3 className="text-[14px] font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/[0.04]">
                Paper information
              </h3>

              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Citations</span>
                  <span className="font-bold text-gray-900 dark:text-white">{paper.citationCountAvailable === false ? 'Not provided' : paper.citations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Publication year</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{paper.year || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Venue / Archive</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{paper.venue || paper.source || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Research field</span>
                  <span className="font-semibold text-blue-600">{paper.field || 'Not provided by source'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Open access</span>
                    <span className={`font-bold ${paper.openAccess ? 'text-emerald-600' : 'text-gray-500'}`}>{paper.openAccess ? 'Listed open access' : 'Not listed as open access'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full py-2 bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-gray-700 dark:text-gray-200 text-[12px] font-semibold rounded-xl border border-gray-200 dark:border-white/[0.06] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export Citation</span>
                </button>
              </div>
            </div>

            {/* Mini Knowledge Graph Connections Card */}
            <div className="bg-white dark:bg-[#111D35] rounded-2xl p-5 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Knowledge connections
                </h3>
              </div>

              <div className="space-y-2 pt-1">
                {paperGraphEdges.slice(0, 4).map(edge => <div key={edge.id} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5 text-[12px]">
                  <div className="flex items-center justify-between gap-2"><span className="font-medium text-gray-500">{edge.relation.replaceAll('_', ' ')}</span><span className="text-right font-bold text-gray-900">{graphLabelById.get(edge.source === paper.id ? edge.target : edge.source) || graphLabelById.get(edge.target) || 'Research entity'}</span></div>
                  {edge.evidence && <p className="mt-1 line-clamp-2 text-[11px] text-gray-500">{edge.evidence}{edge.page ? ` · page ${edge.page}` : ''}</p>}
                </div>)}
                {!paperGraphEdges.length && <p className="rounded-xl bg-gray-50 p-3 text-[12px] text-gray-500">{graphLoadError || 'No indexed graph relationships are available for this paper yet.'}</p>}
              </div>

              <button
                onClick={() => setActivePage('graph')}
                className="w-full mt-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Explore in Knowledge Graph</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ── CITATION EXPORT MODAL ── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D35] rounded-3xl max-w-lg w-full border border-gray-200 dark:border-white/[0.06] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.04]">
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-600" />
                Export Citation
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 dark:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format selection tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {(['bibtex', 'apa', 'mla', 'chicago', 'ris'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                    exportFormat === fmt ? 'bg-white dark:bg-[#111D35] text-blue-700 shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Citation Preview */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-gray-900 text-cyan-300 font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {citationsRecord[exportFormat]}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleDownloadCitation}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-[12px] font-semibold transition-colors"
              >
                Download File
              </button>
              <button
                onClick={handleCopyCitation}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedCitation ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCitation ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
