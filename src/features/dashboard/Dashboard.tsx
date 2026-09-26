import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Mic, Sparkles } from 'lucide-react';
import { mockPapers } from '../../data/mockData';
import { PaperCard } from '../../components/PaperCard';

export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning, Researcher.');
    else if (hour < 18) setGreeting('Good afternoon, Researcher.');
    else setGreeting('Good evening, Researcher.');
  }, []);

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
    <div className="relative min-h-[80vh] flex flex-col items-center justify-start pt-10 pb-20 overflow-hidden w-full">
      
      {/* Subtle Animated Background Universe */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none overflow-hidden">
        <svg className="w-[200%] h-[200%] max-w-none opacity-20 animate-spin-slow" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <g stroke="rgba(0, 209, 255, 0.3)" strokeWidth="1" fill="none">
            <line x1="400" y1="400" x2="200" y2="200" />
            <line x1="400" y1="400" x2="600" y2="200" />
            <line x1="400" y1="400" x2="200" y2="600" />
            <line x1="400" y1="400" x2="600" y2="600" />
            <line x1="200" y1="200" x2="300" y2="100" />
            <line x1="600" y1="200" x2="700" y2="300" />
            <circle cx="400" cy="400" r="150" strokeDasharray="4 4" />
            <circle cx="400" cy="400" r="250" strokeDasharray="2 6" opacity="0.5" />
          </g>
          <g fill="#00D1FF">
            <circle cx="400" cy="400" r="4" className="animate-pulse" />
            <circle cx="200" cy="200" r="3" />
            <circle cx="600" cy="200" r="3" />
            <circle cx="200" cy="600" r="3" />
            <circle cx="600" cy="600" r="3" />
            <circle cx="300" cy="100" r="2" />
            <circle cx="700" cy="300" r="2" />
          </g>
        </svg>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center space-y-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[11px] font-semibold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,209,255,0.2)]">
             <Sparkles className="h-3 w-3" /> System Ready
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-text drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {greeting}
          </h1>
          <p className="text-lg md:text-xl text-brand-textMuted/80 font-medium max-w-2xl mx-auto leading-relaxed">
            Explore research. Connect knowledge. Discover insights.
          </p>
        </motion.div>

        {/* Large Futuristic Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full relative"
        >
          <form onSubmit={handleSearchSubmit} className="relative group w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/0 via-brand-accent/20 to-brand-accent/0 rounded-3xl blur-md transition-all duration-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-50"></div>
            <div className="relative flex items-center bg-brand-surface/80 backdrop-blur-xl border border-brand-border/50 rounded-2xl px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 focus-within:border-brand-accent/50 focus-within:shadow-[0_0_30px_rgba(0,209,255,0.15)] focus-within:bg-brand-surface">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-accent/10 text-brand-accent mr-5 group-focus-within:shadow-[0_0_15px_rgba(0,209,255,0.3)] transition-all">
                <Search className="h-6 w-6" />
              </div>
              <input
                type="text"
                placeholder="◉ Ask anything about academic research..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent text-[18px] text-brand-text placeholder-brand-textMuted focus:outline-none"
              />
              <div className="flex items-center gap-3 ml-2 shrink-0">
                 <button type="button" className="p-3 text-brand-textMuted hover:text-brand-accent transition-all rounded-xl hover:bg-brand-accent/10 hover:shadow-[0_0_10px_rgba(0,209,255,0.2)]">
                   <Mic className="h-5 w-5" />
                 </button>
                 <button type="submit" className="p-3 bg-brand-accent text-brand-bg hover:bg-brand-accentHover transition-all rounded-xl shadow-[0_0_15px_rgba(0,209,255,0.4)] hover:shadow-[0_0_20px_rgba(0,209,255,0.6)]">
                   <ArrowRight className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Examples */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col items-center space-y-6"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="group relative px-5 py-3 rounded-xl border border-brand-border/40 bg-brand-surface/40 hover:bg-brand-surface/80 text-[13px] text-brand-textMuted hover:text-brand-text hover:border-brand-accent/40 hover:shadow-[0_0_15px_rgba(0,209,255,0.1)] transition-all text-left overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/0 via-brand-accent/5 to-brand-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center justify-between gap-4">
                  <span>{example}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-accent" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Recent/Suggested Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="w-full mt-16 text-left"
        >
           <h3 className="text-sm font-semibold text-brand-textMuted uppercase tracking-wider mb-6 px-2">Continue Research</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockPapers.slice(0, 2).map(paper => (
                 <PaperCard key={paper.id} paper={paper} compact={true} />
              ))}
           </div>
        </motion.div>
      </div>
    </div>
  );
};
