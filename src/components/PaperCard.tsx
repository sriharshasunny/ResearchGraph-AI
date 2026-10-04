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
      className="flex flex-col p-5 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#111D35] hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md dark:hover:shadow-blue-900/20 cursor-pointer group"
      onClick={() => {
        setSelectedPaperId(paper.id);
        setActivePage('details');
      }}
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
          {paper.title}
        </h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleSavedPaper(paper.id);
          }}
          className={`shrink-0 p-2 rounded-full ${isSaved ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15' : 'text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:bg-white/[0.04] dark:hover:bg-white dark:bg-[#111D35]/[0.06]'}`}
        >
          <Bookmark className="h-4 w-4" fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex items-center gap-3 text-[12px] text-gray-500 dark:text-gray-400 font-medium mb-3">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {paper.authors[0]} {paper.authors.length > 1 ? 'et al.' : ''}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {paper.year}</span>
        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-300">{paper.venue}</span>
      </div>

      {!compact && (
        <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 mb-4">
          {paper.abstract}
        </p>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200 dark:border-white/[0.04]">
        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> {paper.citations.toLocaleString()} Citations
        </span>
        <a 
          href={paper.url} 
          target="_blank" 
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </motion.div>
  );
};
