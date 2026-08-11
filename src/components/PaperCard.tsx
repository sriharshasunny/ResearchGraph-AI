import React from 'react';
import type { Paper } from '../types';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Columns3, MessageSquare, ArrowRight, Quote, Calendar } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper }) => {
  const {
    savedPaperIds,
    toggleSavePaper,
    comparePaperIds,
    addToCompare,
    removeFromCompare,
    setActivePage,
    setSelectedPaperId,
    addToRecentlyViewed,
    addChatMessage
  } = useApp();

  const isSaved = savedPaperIds.includes(paper.id);
  const isComparing = comparePaperIds.includes(paper.id);

  const handleViewDetails = () => {
    setSelectedPaperId(paper.id);
    addToRecentlyViewed(paper.id);
    setActivePage('details');
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComparing) {
      removeFromCompare(paper.id);
    } else {
      addToCompare(paper.id);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Pre-fill chat message
    addChatMessage({
      id: `chat-init-${Date.now()}`,
      sender: 'user',
      content: `Explain the core contributions, advantages, and limitations of the paper: "${paper.title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    
    // Add default assistant response mimicking research agent
    setTimeout(() => {
      addChatMessage({
        id: `chat-resp-${Date.now()}`,
        sender: 'assistant',
        content: `Here is a semantic summary of **"${paper.title}"** (${paper.year}):\n\n### Core Contribution\nThe paper proposes using **${paper.method}** combined with **${paper.model}** to address key bottlenecks in this domain. Evaluated on the **${paper.dataset}** dataset, it demonstrates **${paper.accuracy}**.\n\n### Key Advantages\n${paper.advantages.map(adv => `- ${adv}`).join('\n')}\n\n### Main Limitations\n${paper.limitations.map(lim => `- ${lim}`).join('\n')}\n\nWould you like to generate a comparative literature review or inspect its citation topology?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [{ id: paper.id, index: 1, title: paper.title }]
      });
    }, 1200);

    setActivePage('chat');
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 p-6 backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 pointer-events-none" />

      <div>
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
            <Calendar className="h-3 w-3" />
            {paper.year}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">
            {paper.publication}
          </span>
          <span className="flex items-center gap-1">
            <Quote className="h-3 w-3 text-indigo-500" />
            {paper.citationCount.toLocaleString()} citations
          </span>
        </div>

        {/* Paper Title */}
        <h3
          onClick={handleViewDetails}
          className="text-base font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-250 cursor-pointer line-clamp-2 leading-snug"
        >
          {paper.title}
        </h3>

        {/* Authors */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {paper.authors.join(', ')}
        </p>

        {/* Abstract Preview */}
        <p className="text-xs text-slate-600 dark:text-slate-350 mt-3 line-clamp-3 leading-relaxed">
          {paper.abstract}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {paper.keywords.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100/80 dark:border-slate-800/30 mt-5 pt-4">
        {/* Detail Button */}
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
        >
          View Analysis
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Tool Action Icons */}
        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <button
            onClick={handleCompareClick}
            title={isComparing ? 'Remove from Comparison' : 'Add to Comparison'}
            className={`p-2 rounded-xl border transition-all ${
              isComparing
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/60 scale-105'
                : 'bg-white/40 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
            }`}
          >
            <Columns3 className="h-4 w-4" />
          </button>

          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            title="Chat about Paper"
            className="p-2 rounded-xl border bg-white/40 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-slate-350 transition-all"
          >
            <MessageSquare className="h-4 w-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavePaper(paper.id);
            }}
            title={isSaved ? 'Unsave Paper' : 'Save Paper'}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 scale-105'
                : 'bg-white/40 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-350'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
