import React, { useState } from 'react';
import type { Paper } from '../types';
import { useApp } from '../context/AppContext';
import { Bookmark, BookmarkCheck, ExternalLink, Bot, Columns } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaperCardProps {
  paper: Paper;
  compact?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, compact = false }) => {
  const {
    savedPaperIds,
    toggleSavePaper,
    setActivePage,
    setSelectedPaperId,
    addToRecentlyViewed,
    comparePaperIds,
    toggleComparePaper
  } = useApp();

  const isSaved = savedPaperIds.includes(paper.id);
  const isCompared = comparePaperIds.includes(paper.id);
  const [isHovered, setIsHovered] = useState(false);

  const handleViewDetails = () => {
    setSelectedPaperId(paper.id);
    addToRecentlyViewed(paper.id);
    setActivePage('details');
  };

  const handleAskAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPaperId(paper.id);
    setActivePage('chat');
  };

  if (compact) {
    return (
      <div onClick={handleViewDetails} className="group relative flex flex-col p-4 rounded-xl border border-brand-border/30 bg-brand-surface/40 hover:bg-brand-surface cursor-pointer transition-all hover:border-brand-accent/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <h4 className="text-[14px] font-semibold text-brand-text mb-1 group-hover:text-brand-accent transition-colors line-clamp-2">{paper.title}</h4>
        <p className="text-[12px] text-brand-textMuted line-clamp-1">{paper.authors.join(', ')} • {paper.year}</p>
      </div>
    );
  }

  return (
    <div 
      className="group relative flex flex-col py-5 px-6 border border-brand-border/30 bg-brand-surface/30 mb-3 rounded-2xl transition-all duration-300 hover:bg-brand-surface hover:border-brand-accent/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-brand-textMuted uppercase tracking-wider">
            {paper.method && <span className="text-brand-accent">{paper.method}</span>}
            {paper.method && <span>•</span>}
            {paper.model && <span>{paper.model}</span>}
            {paper.model && <span>•</span>}
            <span>{paper.dataset || 'General Domain'}</span>
          </div>
          <span className="text-[11px] font-medium text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full border border-brand-accent/20">Open Access</span>
        </div>

        <h3
          onClick={handleViewDetails}
          className="text-[18px] font-bold text-brand-text group-hover:text-brand-accent transition-colors cursor-pointer leading-snug mb-1"
        >
          {paper.title}
        </h3>

        <p className="text-[13px] text-brand-textMuted mb-3 font-medium">
          {paper.authors.join(', ')} <span className="mx-2 opacity-50">•</span> {paper.year}
        </p>

        <p className="text-[14px] text-brand-textMuted/90 leading-relaxed line-clamp-2 mb-4 max-w-4xl">
          {paper.abstract}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10, height: isHovered ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 pt-4 border-t border-brand-border/30 mt-auto overflow-hidden"
      >
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-brand-bg bg-brand-text hover:bg-brand-accent hover:text-brand-bg transition-colors shadow-sm"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSavePaper(paper.id);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
            isSaved 
              ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent' 
              : 'border-brand-border/50 text-brand-textMuted hover:text-brand-text hover:border-brand-border hover:bg-brand-surface'
          }`}
        >
          {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComparePaper(paper.id);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${
            isCompared 
              ? 'bg-brand-violet/10 border-brand-violet/30 text-brand-violet' 
              : 'border-brand-border/50 text-brand-textMuted hover:text-brand-text hover:border-brand-border hover:bg-brand-surface'
          }`}
        >
          <Columns className="h-3.5 w-3.5" />
          {isCompared ? 'Comparing' : 'Compare'}
        </button>

        <button
          onClick={handleAskAI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border border-brand-border/50 text-brand-textMuted hover:text-brand-accent hover:border-brand-accent/30 hover:bg-brand-accent/5 ml-auto"
        >
          <Bot className="h-3.5 w-3.5" />
          Ask AI
        </button>
      </motion.div>
    </div>
  );
};
