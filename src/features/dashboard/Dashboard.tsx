import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, ArrowRight, BookOpen, MessageSquare, 
  GitCompare, Network, Bookmark, Sparkles, Activity, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResearchKnowledgeCore } from '../../components/ResearchKnowledgeCore';

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
    "Latest Vision Transformer research",
    "Self-supervised learning in agriculture"
  ];

  const quickActions = [
    { 
      label: 'Search Papers', 
      desc: 'Semantic exploration across indexed literature',
      icon: <Search className="w-5 h-5 text-blue-600" />,
      onClick: () => setActivePage('search') 
    },
    { 
      label: 'Ask AI', 
      desc: 'Inquire, synthesize & test research hypotheses',
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      onClick: () => setActivePage('chat') 
    },
    { 
      label: 'Compare Papers', 
      desc: 'Structured side-by-side empirical benchmarking',
      icon: <GitCompare className="w-5 h-5 text-emerald-600" />,
      onClick: () => setActivePage('compare') 
    },
    { 
      label: 'Explore Graph', 
      desc: 'Topological citation & methodology mapping',
      icon: <Network className="w-5 h-5 text-cyan-600" />,
      onClick: () => setActivePage('graph') 
    },
  ];

  const recentSessions = [
    { 
      title: "DINOv2 vs MAE comparison", 
      time: "2 hours ago", 
      category: "Comparative Benchmark",
      target: 'compare' as const
    },
    { 
      title: "RAG in Education", 
      time: "4 hours ago", 
      category: "AI Literature Review",
      target: 'literature' as const
    },
    { 
      title: "Plant Disease Detection Literature Review", 
      time: "1 day ago", 
      category: "Literature Review",
      target: 'literature' as const
    },
    { 
      title: "Graph Neural Network Research Gaps", 
      time: "3 days ago", 
      category: "Research Gaps Discovery",
      target: 'gaps' as const
    }
  ];

  return (
    <div className="flex-1 w-full overflow-y-auto bg-[#F7FAFC] p-4 sm:p-6 lg:p-8 scrollbar-thin pb-24">
      <div className="max-w-[1360px] mx-auto space-y-8">
        
        {/* ── HERO SECTION: 2-ZONE ENVIRONMENT ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-[#0B1A38]/30 bg-[#06111F] text-white p-6 sm:p-8 lg:p-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/user_custom_bg.jpg')" }}
        >
          {/* Layered Subtle Space Background Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black/20">
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT ZONE: SEARCH & PROMPT CHIPS (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-cyan-300 mb-4 w-fit backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Academic Research OS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-3">
                What are you<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">researching today?</span>
              </h1>
              
              <p className="text-[14px] sm:text-[15px] text-gray-300 font-medium mb-7 max-w-xl leading-relaxed">
                Explore research. Connect knowledge. Discover what's next.
              </p>

              {/* Large Search Box */}
              <form onSubmit={handleSearch} className="relative w-full max-w-xl group">
                <div className="relative flex items-center bg-[#06111F]/90 border border-white/20 group-focus-within:border-cyan-400/80 group-focus-within:ring-2 group-focus-within:ring-cyan-500/20 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl transition-all">
                  <div className="pl-3.5 pr-2 text-gray-400 group-focus-within:text-cyan-400 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ask anything about academic research..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="flex-1 bg-transparent py-3 pr-3 text-[14px] sm:text-[15px] text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    title="Search Academic Literature"
                    className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-md shrink-0 group-hover:scale-[1.02]"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Research Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-5 max-w-xl">
                {suggestions.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickTopic(topic)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 hover:border-cyan-400/40 text-[11px] font-medium text-gray-300 hover:text-white transition-all text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT ZONE: RESEARCH KNOWLEDGE CORE (5 Cols) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <ResearchKnowledgeCore />
            </div>

          </div>
        </motion.div>

        {/* ── HOME QUICK ACTIONS (4 COMPACT ELEVATED ACTIONS) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={action.onClick}
              className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-gray-900 truncate">{action.label}</h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5" title={action.desc}>{action.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SECTION: RESEARCH OVERVIEW & CONTINUE YOUR RESEARCH ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* RESEARCH OVERVIEW (Compact Indicators - 4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-[15px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Research Overview
            </h2>

            <div className="grid grid-cols-2 gap-3.5">
              <div 
                onClick={() => setActivePage('saved')}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Bookmark className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">LIBRARY</span>
                </div>
                <div className="text-2xl font-black text-gray-900">{savedPaperIds.length || 24}</div>
                <div className="text-[12px] font-medium text-gray-500 mt-0.5">Saved Papers</div>
              </div>

              <div 
                onClick={() => setActivePage('chat')}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="text-2xl font-black text-gray-900">8</div>
                <div className="text-[12px] font-medium text-gray-500 mt-0.5">Research Sessions</div>
              </div>

              <div 
                onClick={() => setActivePage('compare')}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <GitCompare className="w-5 h-5 text-purple-600" />
                  <span className="text-[10px] font-bold font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">MATRIX</span>
                </div>
                <div className="text-2xl font-black text-gray-900">5</div>
                <div className="text-[12px] font-medium text-gray-500 mt-0.5">Comparisons</div>
              </div>

              <div 
                onClick={() => setActivePage('literature')}
                className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:border-amber-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">SYNTHESIS</span>
                </div>
                <div className="text-2xl font-black text-gray-900">3</div>
                <div className="text-[12px] font-medium text-gray-500 mt-0.5">Literature Reviews</div>
              </div>
            </div>
          </div>

          {/* CONTINUE YOUR RESEARCH (Recent Activity List - 8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Continue Your Research
              </h2>
              <button 
                onClick={() => setActivePage('history')}
                className="text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All Activity →
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {recentSessions.map((session, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePage(session.target)}
                  className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                      {session.target === 'compare' ? <GitCompare className="w-4 h-4" /> :
                       session.target === 'literature' ? <BookOpen className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-600">{session.category}</span>
                        <span>•</span>
                        <span>{session.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0">
                    <span className="text-[12px] font-medium hidden sm:inline">Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── SECTION: SUGGESTED FOR YOU ── */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-[15px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Suggested for You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Top AI Conferences 2026', type: 'Collection' },
              { title: 'Graph Neural Networks Tutorial', type: 'Literature Review' },
              { title: 'State of LLMs Benchmark', type: 'Comparison' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                <div className="text-[10px] font-bold font-mono text-gray-500 uppercase mb-1">{item.type}</div>
                <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* ── GROUNDING & VERIFICATION NOTICE ── */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-[12px] text-gray-500 font-medium">
            Answers and graph relationships are grounded in indexed peer-reviewed literature. Always verify critical findings with primary citations.
          </p>
        </div>

      </div>
    </div>
  );
};
