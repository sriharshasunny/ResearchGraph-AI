import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import { PaperCard } from '../../components/PaperCard';
import { motion } from 'framer-motion';
import {
  FileText,
  Network,
  Users,
  Search,
  TrendingUp,
  History,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    setActivePage,
    setSearchQuery,
    recentlyViewedIds,
    reviews
  } = useApp();

  const [localSearch, setLocalSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch);
      setActivePage('search');
    }
  };

  const statCards = [
    { label: 'Total Index Papers', value: mockPapers.length.toString(), icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Connected Entities', value: '1,420', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Knowledge Graph Nodes', value: '480', icon: Network, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Literature Reviews', value: reviews.length.toString(), icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' }
  ];

  const trendingTopics = [
    { topic: 'Self-Supervised Learning', count: '14 new papers', percent: '+18% this wk' },
    { topic: 'Multimodal Embeddings', count: '9 new papers', percent: '+12% this wk' },
    { topic: 'Mixture of Experts (MoE)', count: '11 new papers', percent: '+22% this wk' },
    { topic: 'Linear Attention Models', count: '6 new papers', percent: '+5% this wk' }
  ];

  const recentSearches = [
    'Vision Transformer scale',
    'CLIP zero-shot ImageNet',
    'DINOv2 dense downstream segmentation',
    'Attention is all you need reference list'
  ];

  const handleRecentSearchClick = (q: string) => {
    setSearchQuery(q);
    setActivePage('search');
  };

  // Find recently viewed papers from list
  const recentPapers = recentlyViewedIds
    .map(id => mockPapers.find(p => p.id === id))
    .filter((p): p is typeof mockPapers[0] => p !== undefined)
    .slice(0, 3);

  // Fallback if recently viewed is empty
  const displayPapers = recentPapers.length > 0 ? recentPapers : mockPapers.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-950/20 rounded-2xl border border-indigo-500/20 p-6 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            Welcome back, Dr. Sriharsha <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400">
            Your semantic graph has processed 14 new citations and updated 2 connection clusters today.
          </p>
        </div>
        <button
          onClick={() => setActivePage('graph')}
          className="z-10 flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          View Knowledge Graph
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-850 dark:text-white mt-3">
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Search Panel */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 p-6 backdrop-blur-md shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Search className="h-4.5 w-4.5 text-indigo-500" />
          Semantic Query Search
        </h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Type a research topic or paper keyword..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-28 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950/40 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <button
            type="submit"
            className="absolute right-2 top-2 h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold transition-all shadow-md"
          >
            Find Papers
          </button>
        </form>
        
        {/* Quick searches links */}
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Recent Searches:</span>
          {recentSearches.map((term, idx) => (
            <button
              key={idx}
              onClick={() => handleRecentSearchClick(term)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 text-xs text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-650 dark:hover:text-indigo-400 transition-all"
            >
              <History className="h-3 w-3 text-slate-400" />
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid: Papers and Trending Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Recently Viewed/Featured */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250">
              {recentPapers.length > 0 ? 'Recently Viewed Papers' : 'Featured Core Papers'}
            </h3>
            <button
              onClick={() => setActivePage('search')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              See All Papers
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {displayPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>

        {/* Right Column - Trends */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              Trending Research Topics
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 p-4 backdrop-blur-md shadow-sm space-y-3">
            {trendingTopics.map((topic, idx) => (
              <div
                key={idx}
                onClick={() => handleRecentSearchClick(topic.topic)}
                className="group flex items-center justify-between p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/20 bg-slate-50/30 dark:bg-slate-900/10 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 hover:border-indigo-500/20 cursor-pointer transition-all duration-200"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {topic.topic}
                  </div>
                  <div className="text-[10px] text-slate-450 dark:text-slate-400">
                    {topic.count}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-200/20">
                  {topic.percent}
                </span>
              </div>
            ))}
          </div>

          {/* Quick literature reviews helper card */}
          <div className="rounded-2xl border border-purple-550/20 bg-gradient-to-br from-indigo-950/5 via-purple-950/10 to-indigo-950/10 p-5 backdrop-blur-md relative overflow-hidden shadow-sm flex flex-col justify-between h-[180px]">
            <div className="absolute right-[-15px] bottom-[-15px] h-28 w-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-100/50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full border border-purple-200/10">
                PRO FEATURE
              </span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">Generate Lit Reviews</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Provide any research topic. We summarize publications, outline research gaps, and build comparative matrices.
              </p>
            </div>
            <button
              onClick={() => setActivePage('lit-review')}
              className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-750 text-white text-xs font-bold shadow-md transition-colors"
            >
              Start Lit Review Generator
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
