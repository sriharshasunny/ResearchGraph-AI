import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Sparkles, Bookmark, BookOpen, GitCompare, Activity, MessageSquare, History } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '../../assets/hero-bg.jpg';

export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery, savedPaperIds } = useApp();
  const [localSearch, setLocalSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    setSearchQuery(localSearch);
    setActivePage('search');
  };

  const handleQuickTopic = (topic: string) => {
    setSearchQuery(topic);
    setActivePage('search');
  };

  const suggestions = [
    "Find papers about RAG",
    "Compare DINOv2 and MAE",
    "Research gaps in GNNs",
    "Vision Transformers in agriculture",
    "Self-supervised learning"
  ];

  const recentSessions = [
    { title: "DINOv2 vs MAE comparison", time: "2 hours ago", type: "Research Session", icon: <GitCompare className="w-4 h-4 text-blue-500" /> },
    { title: "RAG in Education", time: "4 hours ago", type: "Literature Review", icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
    { title: "Plant disease detection literature review", time: "1 day ago", type: "Saved Search", icon: <Bookmark className="w-4 h-4 text-amber-500" /> },
    { title: "Self-supervised learning gaps", time: "3 days ago", type: "Research Gaps", icon: <Activity className="w-4 h-4 text-purple-500" /> }
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto bg-[#F4F7FB] p-4 lg:p-8 scrollbar-thin pb-20">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-sm flex flex-col items-center justify-center text-center p-6 bg-blue-900"
        >
          {/* We will use a soft space background here, assuming heroImage exists or fallback to a gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950">
            {/* Soft decorative elements to mimic the space background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px]"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              What are you<br />researching today?
            </h1>
            <p className="text-[15px] text-blue-100 mb-8 font-medium max-w-lg">
              Explore research. Connect knowledge. Discover new insights.
            </p>

            <form onSubmit={handleSearch} className="w-full relative group">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
              <input
                type="text"
                placeholder="Ask anything about academic research..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full h-14 pl-12 pr-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-blue-200/70 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all text-[15px] shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickTopic(s)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-[12px] font-medium text-blue-50 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* STATS & RECENT */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Research Overview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-[16px] font-bold text-gray-900 mb-4 px-2 tracking-tight">Your Research Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                <Bookmark className="w-6 h-6 text-emerald-500 mb-2" />
                <span className="text-2xl font-bold text-gray-900">{savedPaperIds.length}</span>
                <span className="text-[12px] font-medium text-gray-500 mt-1">Saved Papers</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-gray-900">8</span>
                <span className="text-[12px] font-medium text-gray-500 mt-1">Research Sessions</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                <GitCompare className="w-6 h-6 text-purple-500 mb-2" />
                <span className="text-2xl font-bold text-gray-900">5</span>
                <span className="text-[12px] font-medium text-gray-500 mt-1">Comparisons</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
                <BookOpen className="w-6 h-6 text-amber-500 mb-2" />
                <span className="text-2xl font-bold text-gray-900">3</span>
                <span className="text-[12px] font-medium text-gray-500 mt-1">Literature Reviews</span>
              </div>
            </div>
          </motion.div>

          {/* Continue Your Research */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-[16px] font-bold text-gray-900 mb-4 px-2 tracking-tight">Continue Your Research</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentSessions.map((session, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                  onClick={() => setActivePage('chat')}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                    {session.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-gray-900 truncate">{session.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-medium text-gray-500">{session.type}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-[11px] font-medium text-gray-400">{session.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
