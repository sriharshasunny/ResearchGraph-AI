import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, ArrowLeft, Search, FileText, 
  MessageSquare, GitCompare, BookOpen, ArrowRight, Trash2 
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { setActivePage, setSearchQuery, setSelectedPaperId } = useApp();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Searches' | 'Papers' | 'Chats' | 'Comparisons' | 'Reviews'>('All');

  const historyItems = [
    {
      id: 'h1',
      time: '21:42',
      date: 'Today',
      title: 'Compared DINOv2 and MAE',
      desc: 'Evaluated linear probe accuracy vs fine-tuning benchmarks across Vision Transformers.',
      category: 'Comparisons',
      target: 'compare' as const,
      icon: <GitCompare className="w-4 h-4 text-purple-600" />
    },
    {
      id: 'h2',
      time: '21:30',
      date: 'Today',
      title: 'Opened DINOv2 paper',
      desc: 'Inspected empirical findings, SwiGLU FFN architecture, and KoLeo regularizer formulation.',
      category: 'Papers',
      target: 'details' as const,
      paperId: 'p3',
      icon: <FileText className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'h3',
      time: '21:12',
      date: 'Today',
      title: 'Asked AI about Vision Transformers',
      desc: 'Inquired about patch projection equations and inductive bias comparisons against ConvNeXt.',
      category: 'Chats',
      target: 'chat' as const,
      icon: <MessageSquare className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 'h4',
      time: '18:05',
      date: 'Today',
      title: 'Searched for "Self-supervised learning for plant disease detection"',
      desc: 'Matched 14 open-access publications across arXiv and CVPR.',
      category: 'Searches',
      target: 'search' as const,
      query: 'Self-supervised learning',
      icon: <Search className="w-4 h-4 text-cyan-600" />
    },
    {
      id: 'h5',
      time: '14:20',
      date: 'Yesterday',
      title: 'Generated Literature Review on RAG & Vector Retrieval',
      desc: 'Constructed comprehensive taxonomy comparing dense retrieval with GraphRAG community summaries.',
      category: 'Reviews',
      target: 'literature' as const,
      icon: <BookOpen className="w-4 h-4 text-amber-600" />
    },
    {
      id: 'h6',
      time: '11:45',
      date: 'Yesterday',
      title: 'Opened Attention Is All You Need',
      desc: 'Copied BibTeX citation and reviewed scaled dot-product attention equations.',
      category: 'Papers',
      target: 'details' as const,
      paperId: 'p1',
      icon: <FileText className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'h7',
      time: '09:10',
      date: '3 days ago',
      title: 'Analyzed Research Gaps in Graph Neural Networks',
      desc: 'Identified oversmoothing bottlenecks in deep graph message-passing layers.',
      category: 'Reviews',
      target: 'gaps' as const,
      icon: <Clock className="w-4 h-4 text-rose-600" />
    }
  ];

  const filteredItems = historyItems.filter(item => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  const handleItemClick = (item: typeof historyItems[0]) => {
    if (item.paperId) {
      setSelectedPaperId(item.paperId);
    }
    if (item.query) {
      setSearchQuery(item.query);
    }
    setActivePage(item.target);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1000px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Return to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Research Activity History
                </h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Timeline of your research queries, opened papers, comparisons, and AI sessions.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Research history cleared.')}
              className="text-gray-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
              title="Clear Timeline"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Categories Filter */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-gray-100 text-[12px]">
            {(['All', 'Searches', 'Papers', 'Chats', 'Comparisons', 'Reviews'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterCategory === cat
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── TIMELINE LIST ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="p-5 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-start justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {item.date} • {item.time}
                    </span>
                    <span className="text-[11px] font-bold text-blue-600">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors mt-1 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-1">
                <span className="text-[12px] font-semibold hidden sm:inline">Resume</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
