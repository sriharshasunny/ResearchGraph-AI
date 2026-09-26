import React from 'react';
import type { Paper } from '../types';
import { useApp } from '../context/AppContext';
import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper }) => {
  const {
    savedPaperIds,
    toggleSavePaper,
    setActivePage,
    setSelectedPaperId,
    addToRecentlyViewed,
  } = useApp();

  const isSaved = savedPaperIds.includes(paper.id);

  const handleViewDetails = () => {
    setSelectedPaperId(paper.id);
    addToRecentlyViewed(paper.id);
    setActivePage('details');
  };

  return (
    <div className="group relative flex flex-col py-6 border-b border-brand-border/50 last:border-b-0 hover:bg-brand-surface/50 transition-colors -mx-4 px-4 rounded-xl">
      <div className="flex-1">
        {/* Relevance Indicator */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
            <span className="text-[11px] font-medium text-brand-textMuted tracking-wide">HIGH MATCH</span>
          </div>
        </div>

        {/* Paper Title */}
        <h3
          onClick={handleViewDetails}
          className="text-[17px] font-semibold text-brand-text hover:text-brand-accent transition-colors cursor-pointer leading-snug mb-1"
        >
          {paper.title}
        </h3>

        {/* Authors and Year */}
        <p className="text-[13px] text-brand-textMuted mb-2">
          {paper.authors.join(', ')} <span className="mx-1.5">·</span> {paper.year}
        </p>

        {/* Domains/Keywords */}
        <div className="flex flex-wrap gap-2 text-[12px] font-medium text-brand-text mb-3">
          {paper.method && <span>{paper.method}</span>}
          {paper.method && <span className="text-brand-border">•</span>}
          {paper.model && <span>{paper.model}</span>}
          {paper.model && <span className="text-brand-border">•</span>}
          <span>{paper.dataset || 'General Domain'}</span>
        </div>

        {/* Abstract Preview */}
        <p className="text-[14px] text-brand-textMuted leading-relaxed line-clamp-3 mb-5 max-w-3xl">
          {paper.abstract}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-1.5 text-[13px] font-medium text-brand-accent hover:text-brand-accentHover transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open Paper
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSavePaper(paper.id);
          }}
          className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
            isSaved ? 'text-brand-text' : 'text-brand-textMuted hover:text-brand-text'
          }`}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4 text-brand-accent" /> : <Bookmark className="h-4 w-4" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
};
