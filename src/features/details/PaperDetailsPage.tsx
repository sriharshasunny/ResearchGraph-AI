import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Bookmark, Network, MessageSquare, ExternalLink,
  Star, BookOpen, FileText, Hash,
  Copy, Check, GitCompare
} from 'lucide-react';

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
    toggleComparisonPaper,
    paperNotes,
    setPaperNote
  } = useApp();

  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const paper = allPapers.find(p => p.id === selectedPaperId) || allPapers[0];

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <BookOpen className="w-10 h-10 text-gray-600" />
        <p className="text-gray-400 text-sm font-bold">Paper not found</p>
        <button
          onClick={() => setActivePage('search')}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold hover:bg-cyan-500/30 transition-all"
        >
          Browse Literature
        </button>
      </div>
    );
  }

  const isSaved = savedPaperIds.includes(paper.id);
  const isCompared = comparisonPaperIds.includes(paper.id);
  const savedNote = paperNotes[paper.id] || '';
  const relatedPapers = allPapers.filter(p => p.id !== paper.id).slice(0, 3);

  const handleCopyBibtex = () => {
    if (paper.bibtex) {
      navigator.clipboard.writeText(paper.bibtex);
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    }
  };

  const handleSaveNote = () => {
    setPaperNote(paper.id, noteText);
    setIsEditingNote(false);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto scrollbar-thin p-4 sm:p-6 gap-5 relative pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('search')}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 font-mono font-black text-[11px]">
                {paper.venue || 'ArXiv'} {paper.year}
              </span>
              {paper.field && (
                <span className="px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/25 text-purple-300 font-medium text-[10px]">
                  {paper.field}
                </span>
              )}
              <span className="flex items-center gap-1 text-amber-400 text-[11px] font-mono font-bold">
                <Star className="w-3.5 h-3.5" fill="currentColor" />
                {paper.citations.toLocaleString()} citations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => toggleSavedPaper(paper.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                isSaved
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                  : 'bg-white/5 border-white/15 text-gray-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved to Library' : 'Save Paper'}
            </button>

            <button
              onClick={() => toggleComparisonPaper(paper.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                isCompared
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/5 border-white/15 text-gray-400 hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              {isCompared ? 'In Compare List' : 'Add to Compare'}
            </button>

            <button
              onClick={() => { setSelectedPaperId(paper.id); setActivePage('graph'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/25 transition-all"
            >
              <Network className="w-3.5 h-3.5" /> Citation Graph
            </button>

            <button
              onClick={() => {
                setSearchQuery(`Explain the main technical contributions and limitations of "${paper.title}"`);
                setActivePage('chat');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[11px] hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat AI
            </button>

            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-gray-300 text-[11px] font-bold hover:text-white hover:border-white/30 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> PDF
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">

        {/* Left 2 Cols: Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-6">
            <h1 className="text-[20px] font-black text-white leading-snug mb-3">{paper.title}</h1>

            {/* Authors */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {paper.authors.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/4 border border-white/8 text-[11px] text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[9px] font-black text-white">
                    {a[0]}
                  </span>
                  {a}
                </div>
              ))}
            </div>

            {/* TLDR */}
            {paper.tldr && (
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                  Core Takeaway &amp; Significance:
                </span>
                <p className="text-[13px] text-cyan-200 leading-relaxed font-medium">
                  {paper.tldr}
                </p>
              </div>
            )}

            {/* Key Empirical Findings */}
            {paper.keyFindings && paper.keyFindings.length > 0 && (
              <div className="mb-5">
                <h3 className="text-[11px] font-black text-purple-400 uppercase tracking-wider mb-2">
                  Key Empirical Findings &amp; SOTA Benchmarks:
                </h3>
                <ul className="list-disc list-inside space-y-1.5 text-[13px] text-gray-300">
                  {paper.keyFindings.map((kf, i) => (
                    <li key={i}>{kf}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Abstract */}
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">Abstract</h3>
              <p className="text-[13px] text-gray-300 leading-relaxed">{paper.abstract}</p>
            </div>
          </div>

          {/* Personal Researcher Notes */}
          <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                My Research Notes
              </h3>
              {!isEditingNote && (
                <button
                  onClick={() => { setNoteText(savedNote); setIsEditingNote(true); }}
                  className="text-[10px] font-bold text-cyan-400 hover:underline"
                >
                  {savedNote ? 'Edit Note' : '+ Add Note'}
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="flex flex-col gap-2 mt-2">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Record your insights, critique, experimental ideas, or questions on this paper..."
                  rows={4}
                  className="w-full bg-[#050811] border border-white/15 rounded-xl p-3 text-[12px] font-mono text-gray-200 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="px-3 py-1 rounded text-[11px] text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : savedNote ? (
              <p className="text-[12px] text-gray-300 font-mono bg-[#050811] p-3 rounded-xl border border-white/5 leading-relaxed">
                {savedNote}
              </p>
            ) : (
              <p className="text-[11px] text-gray-600 italic">No notes recorded yet for this paper.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Metadata & BibTeX */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">
              Publication Metadata
            </h3>
            <div className="space-y-3 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Venue</span>
                <span className="font-bold text-cyan-300">{paper.venue || 'ArXiv'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Year</span>
                <span className="font-mono font-bold text-purple-300">{paper.year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Citations</span>
                <span className="font-mono font-bold text-amber-400">{paper.citations.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Field</span>
                <span className="font-medium text-gray-300">{paper.field || 'General AI'}</span>
              </div>
            </div>
          </div>

          {/* BibTeX Citation */}
          {paper.bibtex && (
            <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  BibTeX Citation
                </h3>
                <button
                  onClick={handleCopyBibtex}
                  className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                >
                  {copiedBibtex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedBibtex ? 'Copied!' : 'Copy BibTeX'}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#04060c] border border-white/8 font-mono text-[10px] text-gray-300 overflow-x-auto leading-normal">
                <code>{paper.bibtex}</code>
              </pre>
            </div>
          )}

          {/* Related Papers */}
          <div className="rounded-2xl border border-white/10 bg-[#090d18]/90 backdrop-blur-xl p-5">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              Related Literature
            </h3>
            <div className="space-y-2">
              {relatedPapers.map(rp => (
                <button
                  key={rp.id}
                  onClick={() => { setSelectedPaperId(rp.id); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/4 border border-transparent hover:border-white/8 transition-all group"
                >
                  <p className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {rp.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-500 font-mono">{rp.venue} {rp.year}</span>
                    <span className="text-amber-400 text-[9px] font-bold font-mono">★{(rp.citations / 1000).toFixed(1)}k</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
