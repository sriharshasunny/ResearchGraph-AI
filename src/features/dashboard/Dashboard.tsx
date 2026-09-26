import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Search, Hexagon } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch);
      setActivePage('search');
    }
  };

  const handleExampleClick = (query: string) => {
    setSearchQuery(query);
    setActivePage('search');
  };

  const examples = [
    "Find papers about self-supervised learning",
    "Compare DINOv2 and MAE",
    "Which papers use Vision Transformers?",
    "What are the research gaps in Graph Neural Networks?"
  ];

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 -mt-10 overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <svg className="w-full h-full max-w-4xl" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#E5E5E5" strokeWidth="1" fill="none">
            <line x1="200" y1="200" x2="400" y2="300" />
            <line x1="400" y1="300" x2="600" y2="250" />
            <line x1="400" y1="300" x2="450" y2="500" />
            <line x1="200" y1="200" x2="150" y2="400" />
            <line x1="150" y1="400" x2="450" y2="500" />
          </g>
          <g fill="#F5F5F5" stroke="#D4D4D4" strokeWidth="1">
            <circle cx="200" cy="200" r="6" />
            <circle cx="400" cy="300" r="8" />
            <circle cx="600" cy="250" r="6" />
            <circle cx="450" cy="500" r="7" />
            <circle cx="150" cy="400" r="5" />
          </g>
        </svg>
      </div>

      <div className="z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-brand-text flex items-center justify-center shadow-lg text-brand-surface">
              <Hexagon className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-text">
            ResearchGraph AI
          </h1>
          <p className="text-lg text-brand-textMuted font-medium">
            Explore research. Connect knowledge. Discover insights.
          </p>
        </motion.div>

        {/* Large Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full relative"
        >
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-6 top-5 h-6 w-6 text-brand-textMuted group-focus-within:text-brand-accent transition-colors" />
            <input
              type="text"
              placeholder="Ask anything about academic research..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-16 pl-16 pr-6 rounded-2xl border border-brand-border bg-brand-surface text-lg text-brand-text placeholder-brand-textMuted focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all shadow-sm"
            />
          </form>
        </motion.div>

        {/* Examples */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-2xl flex flex-col items-center space-y-4"
        >
          <p className="text-xs font-semibold text-brand-textMuted uppercase tracking-wider">
            Try these examples
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 rounded-full border border-brand-border bg-brand-surface text-sm text-brand-textMuted hover:text-brand-text hover:border-brand-textMuted hover:shadow-sm transition-all text-left"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};
