import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, ArrowRight, BookOpen, MessageSquare, 
  GitCompare, Network, Bookmark, Sparkles, Activity, Clock 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery, savedPaperIds } = useApp();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'globe_wheel' && scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ top: e.data.deltaY, behavior: 'auto' });
      }
      if (e.data && e.data.type === 'hero_search' && e.data.query) {
        setSearchQuery(e.data.query);
        setActivePage('search');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setSearchQuery, setActivePage]);



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
    <div ref={scrollContainerRef} className="flex-1 w-full overflow-y-auto bg-transparent dark:bg-transparent p-4 sm:p-6 lg:p-8 scrollbar-thin pb-24">
      <div className="max-w-[1360px] mx-auto space-y-8">
        
        {/* ── HERO SECTION: FULL WIDTH IFRAME ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden shadow-xl border border-blue-900/30 bg-[#04061a]"
        >
          <iframe 
            src="/home_hero.html"
            className="absolute inset-0 w-full h-full border-none outline-none"
            title="Dashboard Hero"
            sandbox="allow-scripts allow-same-origin"
          />
        </motion.div>

        {/* ── HOME QUICK ACTIONS (4 COMPACT ELEVATED ACTIONS) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={action.onClick}
              className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] rounded-2xl p-4 border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer flex items-center gap-3.5"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/[0.04] dark:bg-white dark:bg-[#111D35]/[0.04] border border-gray-100 dark:border-white/[0.04] dark:border-white/[0.04] flex items-center justify-center shrink-0">
                {action.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-bold text-gray-900 dark:text-white dark:text-white truncate">{action.label}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 line-clamp-2 mt-0.5" title={action.desc}>{action.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SECTION: RESEARCH OVERVIEW & CONTINUE YOUR RESEARCH ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* RESEARCH OVERVIEW (Compact Indicators - 4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Research Overview
            </h2>

            <div className="grid grid-cols-2 gap-3.5">
              <div 
                onClick={() => setActivePage('saved')}
                className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Bookmark className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">LIBRARY</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white dark:text-white">{savedPaperIds.length || 24}</div>
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">Saved Papers</div>
              </div>

              <div 
                onClick={() => setActivePage('chat')}
                className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">ACTIVE</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white dark:text-white">8</div>
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">Research Sessions</div>
              </div>

              <div 
                onClick={() => setActivePage('compare')}
                className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm hover:border-purple-300 dark:hover:border-purple-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <GitCompare className="w-5 h-5 text-purple-600" />
                  <span className="text-[10px] font-bold font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">MATRIX</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white dark:text-white">5</div>
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">Comparisons</div>
              </div>

              <div 
                onClick={() => setActivePage('literature')}
                className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm hover:border-amber-300 dark:hover:border-amber-500/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">SYNTHESIS</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white dark:text-white">3</div>
                <div className="text-[12px] font-medium text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">Literature Reviews</div>
              </div>
            </div>
          </div>

          {/* CONTINUE YOUR RESEARCH (Recent Activity List - 8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-gray-900 dark:text-white dark:text-white tracking-tight flex items-center gap-2">
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

            <div className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm divide-y divide-gray-100 dark:divide-white/[0.06] overflow-hidden">
              {recentSessions.map((session, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePage(session.target)}
                  className="p-4 hover:bg-gray-50 dark:bg-white/[0.04]/80 dark:hover:bg-white dark:bg-[#111D35]/[0.04] transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-indigo-600/20 text-blue-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-indigo-500/20">
                      {session.target === 'compare' ? <GitCompare className="w-4 h-4" /> :
                       session.target === 'literature' ? <BookOpen className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] sm:text-[14px] font-semibold text-gray-900 dark:text-white dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 dark:text-gray-400 mt-0.5">
                        <span className="font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">{session.category}</span>
                        <span>•</span>
                        <span>{session.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0">
                    <span className="text-[12px] font-medium hidden sm:inline">Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── SECTION: SUGGESTED FOR YOU ── */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06]">
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Suggested for You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Top AI Conferences 2026', type: 'Collection' },
              { title: 'Graph Neural Networks Tutorial', type: 'Literature Review' },
              { title: 'State of LLMs Benchmark', type: 'Comparison' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111D35] dark:bg-[#111D35] p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all cursor-pointer group">
                <div className="text-[10px] font-bold font-mono text-gray-500 dark:text-gray-400 dark:text-gray-400 uppercase mb-1">{item.type}</div>
                <h3 className="text-[14px] font-bold text-gray-900 dark:text-white dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* ── GROUNDING & VERIFICATION NOTICE ── */}
        <div className="pt-4 border-t border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-center">
          <p className="text-[12px] text-gray-500 dark:text-gray-400 dark:text-gray-400 font-medium">
            Answers and graph relationships are grounded in indexed peer-reviewed literature. Always verify critical findings with primary citations.
          </p>
        </div>

      </div>
    </div>
  );
};
