import React from 'react';
import type { Paper } from '../types';
import { useApp } from '../context/AppContext';
import { Bookmark, FileText, ExternalLink, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaperCardProps {
  paper: Paper;
  compact?: boolean;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, compact = false }) => {
  const { savedPaperIds, toggleSavedPaper, setSelectedPaperId, setActivePage } = useApp();
  const isSaved = savedPaperIds.includes(paper.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col p-5 rounded-2xl border border-brand-border bg-brand-surface hover:border-brand-accent/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] cursor-pointer transition-all duration-300 group"
      onClick={() => {
        setSelectedPaperId(paper.id);
        setActivePage('details');
      }}
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-[16px] font-bold text-brand-text leading-snug group-hover:text-brand-accent transition-colors line-clamp-2">
          {paper.title}
        </h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleSavedPaper(paper.id);
          }}
          className={`shrink-0 p-2 rounded-full transition-colors ${isSaved ? 'text-brand-accent bg-brand-accent/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'text-brand-textMuted hover:bg-white/5'}`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex items-center gap-3 text-[12px] text-brand-textMuted font-medium mb-3">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {paper.authors[0]} {paper.authors.length > 1 ? 'et al.' : ''}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {paper.year}</span>
        <span className="px-2 py-0.5 rounded-md bg-brand-bg border border-brand-border text-brand-textSoft">{paper.venue}</span>
      </div>

      {!compact && (
        <p className="text-[13px] text-brand-textSoft leading-relaxed line-clamp-3 mb-4">
          {paper.abstract}
        </p>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-brand-border/50">
        <span className="text-[11px] font-bold text-brand-textMuted uppercase tracking-wider flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-brand-accent" /> {paper.citations.toLocaleString()} Citations
        </span>
        <a 
          href={paper.url} 
          target="_blank" 
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-brand-textMuted hover:text-brand-accent transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
};
