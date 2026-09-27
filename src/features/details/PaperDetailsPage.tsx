import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { mockPapers } from '../../data/mockData';
import { ArrowLeft, Bookmark, Network, MessageSquare, ExternalLink, Star, Users, Calendar, BookOpen, FileText, Hash, Zap } from 'lucide-react';

export const PaperDetailsPage: React.FC = () => {
  const { selectedPaperId, savedPaperIds, toggleSavedPaper, setActivePage, setSearchQuery } = useApp();
  const paper = mockPapers.find(p => p.id === selectedPaperId);

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <BookOpen className="w-10 h-10 text-gray-600" />
        <p className="text-gray-500 text-sm">Paper not found</p>
        <button onClick={() => setActivePage('search')} className="px-4 py-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold hover:bg-cyan-500/25 transition-all">
          Browse Papers
        </button>
      </div>
    );
  }

  const isSaved = savedPaperIds.includes(paper.id);
  const relatedPapers = mockPapers.filter(p => p.id !== paper.id).slice(0, 3);

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto scrollbar-thin p-4 sm:p-6 gap-5 relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_0%,rgba(168,85,247,0.05),transparent)]" />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePage('search')} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/25">
                <span className="text-cyan-300 font-black text-[11px] block leading-none">{paper.venue}</span>
                <span className="text-cyan-500/60 font-mono text-[9px] block mt-0.5">{paper.year}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5" fill="currentColor" />
                <span className="text-[12px] font-black font-mono">{paper.citations.toLocaleString()}</span>
                <span className="text-[10px] text-gray-500">citations</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toggleSavedPaper(paper.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${isSaved ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' : 'bg-white/5 border-white/15 text-gray-400 hover:text-cyan-300 hover:border-cyan-500/30'}`}>
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => setActivePage('graph')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/25 transition-all">
              <Network className="w-3.5 h-3.5" /> Graph
            </button>
            <button onClick={() => { setSearchQuery(paper.title); setActivePage('chat'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold hover:bg-purple-500/25 transition-all">
              <MessageSquare className="w-3.5 h-3.5" /> Chat AI
            </button>
            {paper.url && (
              <a href={paper.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-gray-400 text-[11px] font-bold hover:text-white hover:border-white/25 transition-all">
                <ExternalLink className="w-3.5 h-3.5" /> PDF
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">

        {/* Left: paper content */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl p-5">
            <h1 className="text-[18px] font-black text-white leading-snug mb-4">{paper.title}</h1>
            
            {/* Authors */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {paper.authors.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/4 border border-white/8 text-[11px] text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[8px] font-black text-white">{a[0]}</span>
                  {a}
                </div>
              ))}
            </div>

            {/* Abstract */}
            <div>
              <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">Abstract</h2>
              <p className="text-[13px] text-gray-300 leading-relaxed">{paper.abstract}</p>
            </div>
          </motion.div>

          {/* AI Summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl border border-purple-500/25 bg-purple-500/5 backdrop-blur-xl p-5">
            <h2 className="text-[11px] font-black text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />AI Quick Summary
            </h2>
            <p className="text-[12px] text-gray-300 leading-relaxed">
              This paper presents a landmark contribution to <span className="text-purple-300 font-semibold">{paper.venue}</span> — introducing novel architectures that have achieved <span className="text-cyan-300 font-semibold">{paper.citations.toLocaleString()} citations</span> since publication in <span className="text-emerald-300 font-semibold">{paper.year}</span>. The work by {paper.authors[0]} et al. establishes a new paradigm in the field with implications across multiple downstream tasks and benchmarks.
            </p>
            <button onClick={() => { setSearchQuery(paper.title); setActivePage('chat'); }}
              className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors">
              Ask AI for deeper analysis <MessageSquare className="w-3 h-3" />
            </button>
          </motion.div>
        </div>

        {/* Right: metadata + related */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl p-4">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-3">Metadata</h2>
            <div className="space-y-2.5">
              {[
                { icon: BookOpen, label: 'Venue', val: paper.venue || 'N/A', color: 'text-cyan-400' },
                { icon: Calendar, label: 'Year', val: String(paper.year), color: 'text-purple-400' },
                { icon: Users, label: 'Authors', val: `${paper.authors.length} authors`, color: 'text-emerald-400' },
                { icon: Star, label: 'Citations', val: paper.citations.toLocaleString(), color: 'text-amber-400' },
                { icon: FileText, label: 'DOI', val: paper.doi || 'See ArXiv', color: 'text-sky-400' },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${m.color} shrink-0`} />
                    <span className="text-[10px] text-gray-500 w-16 shrink-0">{m.label}</span>
                    <span className={`text-[11px] font-bold ${m.color}`}>{m.val}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Related Papers */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl p-4">
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Hash className="w-3 h-3" />Related Papers
            </h2>
            <div className="space-y-2">
              {relatedPapers.map(rp => (
                <button key={rp.id} onClick={() => setActivePage('details') /* would set ID */}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/4 border border-transparent hover:border-white/8 transition-all group">
                  <p className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">{rp.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] text-gray-600 font-mono">{rp.venue} · {rp.year}</span>
                    <span className="text-amber-400 text-[9px] font-bold font-mono">★{(rp.citations/1000).toFixed(1)}k</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
