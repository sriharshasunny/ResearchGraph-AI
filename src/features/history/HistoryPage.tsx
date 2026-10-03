import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, ArrowLeft, Search, FileText, 
  MessageSquare, GitCompare, BookOpen, ArrowRight, Trash2,
  RotateCcw, Activity
} from 'lucide-react';

interface HistoryItem {
  id: string;
  time: string;
  dateGroup: 'Today' | 'Yesterday' | 'Last 7 Days' | 'Older';
  title: string;
  desc: string;
  category: 'Searches' | 'Papers' | 'Chats' | 'Comparisons' | 'Reviews';
  target: 'compare' | 'details' | 'chat' | 'search' | 'literature' | 'gaps';
  paperId?: string;
  query?: string;
}

export const HistoryPage: React.FC = () => {
  const { setActivePage, setSearchQuery, setSelectedPaperId } = useApp();
  const [filterCategory, setFilterCategory] = useState<'All' | 'Searches' | 'Papers' | 'Chats' | 'Comparisons' | 'Reviews'>('All');
  const [searchQueryLocal, setSearchQueryLocal] = useState('');

  // Initial timeline data
  const initialHistory: HistoryItem[] = [
    {
      id: 'h1',
      time: '21:42',
      dateGroup: 'Today',
      title: 'Compared DINOv2 and MAE',
      desc: 'Evaluated linear probe accuracy vs fine-tuning benchmarks across Vision Transformers.',
      category: 'Comparisons',
      target: 'compare'
    },
    {
      id: 'h2',
      time: '21:30',
      dateGroup: 'Today',
      title: 'Opened DINOv2 paper',
      desc: 'Inspected empirical findings, SwiGLU FFN architecture, and KoLeo regularizer formulation.',
      category: 'Papers',
      target: 'details',
      paperId: 'p3'
    },
    {
      id: 'h3',
      time: '21:12',
      dateGroup: 'Today',
      title: 'Asked AI about Vision Transformers',
      desc: 'Inquired about patch projection equations and inductive bias comparisons against ConvNeXt.',
      category: 'Chats',
      target: 'chat'
    },
    {
      id: 'h4',
      time: '18:05',
      dateGroup: 'Today',
      title: 'Searched for "Self-supervised learning for plant disease detection"',
      desc: 'Matched 14 open-access publications across arXiv and CVPR.',
      category: 'Searches',
      target: 'search',
      query: 'Self-supervised learning'
    },
    {
      id: 'h5',
      time: '14:20',
      dateGroup: 'Yesterday',
      title: 'Generated Literature Review on RAG & Vector Retrieval',
      desc: 'Constructed comprehensive taxonomy comparing dense retrieval with GraphRAG community summaries.',
      category: 'Reviews',
      target: 'literature'
    },
    {
      id: 'h6',
      time: '11:45',
      dateGroup: 'Yesterday',
      title: 'Opened Attention Is All You Need',
      desc: 'Copied BibTeX citation and reviewed scaled dot-product attention equations.',
      category: 'Papers',
      target: 'details',
      paperId: 'p1'
    },
    {
      id: 'h7',
      time: '09:10',
      dateGroup: 'Last 7 Days',
      title: 'Analyzed Research Gaps in Graph Neural Networks',
      desc: 'Identified oversmoothing bottlenecks in deep graph message-passing layers.',
      category: 'Reviews',
      target: 'gaps'
    },
    {
      id: 'h8',
      time: '16:50',
      dateGroup: 'Last 7 Days',
      title: 'Compared DeepSeek-R1 vs OpenAI o1',
      desc: 'Benchmarked test-time compute reinforcement learning on AIME and MATH-500.',
      category: 'Comparisons',
      target: 'compare'
    },
    {
      id: 'h9',
      time: '10:15',
      dateGroup: 'Older',
      title: 'Searched for "LoRA low-rank adaptation matrix rank r"',
      desc: 'Explored parameter-efficient fine-tuning papers and memory complexity.',
      category: 'Searches',
      target: 'search',
      query: 'LoRA low-rank adaptation'
    }
  ];

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>(initialHistory);

  // Undo Delete State
  const [deletedItem, setDeletedItem] = useState<{ item: HistoryItem; index: number } | null>(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Clear all confirmation modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Comparisons': return <GitCompare className="w-4 h-4 text-purple-600" />;
      case 'Papers': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Chats': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'Searches': return <Search className="w-4 h-4 text-cyan-600" />;
      case 'Reviews': return <BookOpen className="w-4 h-4 text-amber-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = historyItems.findIndex(i => i.id === id);
    if (index === -1) return;

    const item = historyItems[index];
    setHistoryItems(prev => prev.filter(i => i.id !== id));
    setDeletedItem({ item, index });

    if (undoTimeoutId) clearTimeout(undoTimeoutId);
    const timeout = setTimeout(() => {
      setDeletedItem(null);
    }, 5000);
    setUndoTimeoutId(timeout);
  };

  const handleUndoDelete = () => {
    if (!deletedItem) return;
    setHistoryItems(prev => {
      const copy = [...prev];
      copy.splice(deletedItem.index, 0, deletedItem.item);
      return copy;
    });
    setDeletedItem(null);
    if (undoTimeoutId) clearTimeout(undoTimeoutId);
  };

  const handleClearAll = () => {
    setHistoryItems([]);
    setIsClearModalOpen(false);
  };

  const handleResume = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.paperId) setSelectedPaperId(item.paperId);
    if (item.query) setSearchQuery(item.query);
    setActivePage(item.target);
  };

  // Filter items
  const filteredItems = historyItems.filter(item => {
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (searchQueryLocal.trim()) {
      const q = searchQueryLocal.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.desc.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Group by day
  type DateGroupKey = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Older';
  const rawGroups: Array<{ key: DateGroupKey; label: string; items: HistoryItem[] }> = [
    { key: 'Today', label: 'Today', items: filteredItems.filter(i => i.dateGroup === 'Today') },
    { key: 'Yesterday', label: 'Yesterday', items: filteredItems.filter(i => i.dateGroup === 'Yesterday') },
    { key: 'Last 7 Days', label: 'Last 7 Days', items: filteredItems.filter(i => i.dateGroup === 'Last 7 Days') },
    { key: 'Older', label: 'Older Activity', items: filteredItems.filter(i => i.dateGroup === 'Older') },
  ];
  const groups = rawGroups.filter(g => g.items.length > 0);

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1040px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  Daily timeline of your academic queries, opened papers, comparisons, and synthesized reviews.
                </p>
              </div>
            </div>

            {historyItems.length > 0 && (
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 text-[12px] font-semibold flex items-center gap-1.5 transition-colors border border-gray-200 hover:border-red-200"
                title="Clear all activity history"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Search & Categories Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history by keyword or topic..."
                value={searchQueryLocal}
                onChange={(e) => setSearchQueryLocal(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-[12px]">
              {(['All', 'Searches', 'Papers', 'Chats', 'Comparisons', 'Reviews'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-semibold transition-all ${
                    filterCategory === cat
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── DAILY GROUPED TIMELINE ── */}
        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center space-y-3">
            <Clock className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">No activity history found</h3>
            <p className="text-[13px] text-gray-500">
              {searchQueryLocal ? 'No results matched your search term.' : 'Your research interactions will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.key} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-semibold text-gray-400">
                    {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => handleResume(item, e)}
                      className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(item.category)}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                              {item.time}
                            </span>
                            <span className="text-[11px] font-bold text-blue-600">
                              {item.category}
                            </span>
                          </div>

                          <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {item.title}
                          </h3>

                          <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed max-w-2xl">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Prominent High-Contrast Resume Button & Delete on Hover */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                          title="Remove item from timeline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleResume(item, e)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[12px] flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <span>Resume</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── UNDO DELETE TOAST ── */}
      {deletedItem && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-[13px] flex items-center gap-3">
          <span>Activity removed from history.</span>
          <button
            onClick={handleUndoDelete}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* ── CLEAR ALL CONFIRMATION MODAL ── */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-gray-200 shadow-2xl p-6 space-y-4">
            <h3 className="text-[16px] font-bold text-gray-900">Clear entire research timeline?</h3>
            <p className="text-[13px] text-gray-500">
              All history logs, search traces, comparison sessions, and review records will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[12px] font-semibold transition-colors shadow-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
