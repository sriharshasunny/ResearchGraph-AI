import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Mic, Sparkles, Network, History, Bookmark, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { mockPapers } from '../../data/mockData';
import { PaperCard } from '../../components/PaperCard';

export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery, savedPaperIds } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
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
    "Self-supervised learning in Vision",
    "Compare DINOv2 and MAE",
    "GraphRAG implementations",
    "Research gaps in GNNs"
  ];

  const recentActivity = [
    { type: 'search', title: 'Graph Neural Networks', time: '2 hours ago' },
    { type: 'paper', title: 'Attention Is All You Need', time: '5 hours ago' },
    { type: 'compare', title: 'Compared DINOv2 vs CLIP', time: 'Yesterday' },
  ];

  const trendingTopics = [
    { topic: 'Retrieval-Augmented Generation', count: '12.4k papers' },
    { topic: 'Multimodal Foundation Models', count: '8.2k papers' },
    { topic: 'Federated Learning', count: '5.1k papers' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-start pb-12 w-full overflow-x-hidden">
      
      {/* Clean Light Background Pattern */}
      <div className="absolute inset-0 z-0 bg-brand-bg bg-graph-pattern opacity-60 pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-7xl flex flex-col space-y-12 h-full px-4"
      >
        
        {/* HERO SECTION */}
        <motion.div variants={itemVariants} className="w-full flex flex-col items-center text-center mt-12 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-brand-accent text-[12px] font-bold tracking-widest uppercase shadow-sm">
             <Sparkles className="h-3.5 w-3.5" /> Research Engine Online
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-brand-text">
              {greeting}, <span className="text-brand-accent">Researcher.</span>
            </h1>
            <p className="text-xl md:text-2xl text-brand-textMuted font-medium max-w-3xl mx-auto leading-relaxed">
              What are you researching today?
            </p>
          </div>

          {/* Premium Clean Search Box */}
          <div className="w-full max-w-3xl relative mt-6">
            <form onSubmit={handleSearchSubmit} className="relative group w-full">
              <div className="absolute -inset-1 bg-brand-accent/5 rounded-3xl blur-lg transition-all duration-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-50"></div>
              <div className="relative flex items-center bg-white border border-brand-border rounded-2xl px-6 py-4 shadow-float transition-all duration-300 focus-within:border-brand-accent/40 focus-within:ring-4 focus-within:ring-brand-accent/10">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-brand-accent mr-4 transition-all shrink-0">
                  <Search className="h-6 w-6" />
                </div>
                <input
                  type="text"
                  placeholder="Ask anything about academic research..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-transparent text-[18px] text-brand-text placeholder-brand-textMuted/60 focus:outline-none"
                />
                <div className="flex items-center gap-2 ml-2 shrink-0">
                   <button type="button" className="p-3 text-brand-textMuted hover:text-brand-accent transition-all rounded-xl hover:bg-blue-50">
                     <Mic className="h-5 w-5" />
                   </button>
                   <button type="submit" className="p-3 bg-brand-accent text-white hover:bg-brand-accentHover transition-all rounded-xl shadow-md hover:shadow-lg">
                     <ArrowRight className="h-5 w-5" />
                   </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Suggested Queries Chips */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 max-w-4xl">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="group px-5 py-2.5 rounded-full border border-brand-border bg-white hover:bg-blue-50 text-[13px] font-medium text-brand-textSoft hover:text-brand-accent hover:border-blue-200 shadow-sm transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>

        {/* WIDGETS GRID */}
        <motion.div variants={itemVariants} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
          
          {/* Widget 1: Continue Research (Recent Papers) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col space-y-4">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-[13px] font-bold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Continue Reading
                </h3>
                <button onClick={() => setActivePage('search')} className="text-[13px] font-semibold text-brand-accent hover:text-brand-accentHover transition-colors">
                  View Library &rarr;
                </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockPapers.slice(0, 2).map(paper => (
                   <PaperCard key={paper.id} paper={paper} compact={true} />
                ))}
             </div>
          </div>

          {/* Widget 2: Trending & Activity */}
          <div className="col-span-1 flex flex-col space-y-8">
             {/* Trending */}
             <div className="flex flex-col space-y-4">
               <h3 className="text-[13px] font-bold text-brand-textMuted uppercase tracking-wider flex items-center gap-2 px-1">
                 <TrendingUp className="h-4 w-4" /> Trending Topics
               </h3>
               <div className="p-5 rounded-2xl border border-brand-border bg-white shadow-subtle space-y-4">
                 {trendingTopics.map((topic, idx) => (
                   <div key={idx} className="group flex items-center justify-between cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
                     <span className="text-[14px] font-medium text-brand-text group-hover:text-brand-accent transition-colors truncate pr-4">{topic.topic}</span>
                     <span className="text-[12px] text-brand-textMuted whitespace-nowrap bg-gray-100 px-2 py-1 rounded-md">{topic.count}</span>
                   </div>
                 ))}
               </div>
             </div>

             {/* Recent Activity */}
             <div className="flex flex-col space-y-4">
               <h3 className="text-[13px] font-bold text-brand-textMuted uppercase tracking-wider flex items-center gap-2 px-1">
                 <History className="h-4 w-4" /> Recent Activity
               </h3>
               <div className="p-5 rounded-2xl border border-brand-border bg-white shadow-subtle space-y-4">
                 {recentActivity.map((act, idx) => (
                   <div key={idx} className="flex items-start gap-3 p-1">
                     <div className="mt-1 h-2 w-2 rounded-full bg-brand-border border border-gray-300"></div>
                     <div className="flex flex-col">
                       <span className="text-[14px] font-medium text-brand-text leading-tight">{act.title}</span>
                       <span className="text-[12px] text-brand-textMuted mt-1 flex items-center"><Clock className="inline h-3 w-3 mr-1 opacity-70" />{act.time}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

        </motion.div>
        
      </motion.div>
    </div>
  );
};

