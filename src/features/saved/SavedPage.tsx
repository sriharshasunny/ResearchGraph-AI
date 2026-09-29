import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bookmark, Search, Plus, MessageSquare, 
  GitCompare, FileText, ArrowLeft, Folder, Trash2
} from 'lucide-react';

export const SavedPage: React.FC = () => {
  const {
    savedPaperIds,
    toggleSavedPaper,
    allPapers,
    setSelectedPaperId,
    setActivePage,
    setSearchQuery,
    comparisonPaperIds,
    toggleComparisonPaper
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'collections' | 'recent'>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [collections, setCollections] = useState([
    { id: 'c1', name: 'Foundation Models & Transformers', count: 3 },
    { id: 'c2', name: 'Self-Supervised Vision', count: 2 },
    { id: 'c3', name: 'Reasoning & Test-Time Compute', count: 1 },
  ]);

  const savedPapers = allPapers.filter(p => savedPaperIds.includes(p.id));

  const filteredPapers = savedPapers.filter(p => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.authors.some(a => a.toLowerCase().includes(q));
  });

  const handleOpenPaper = (id: string) => {
    setSelectedPaperId(id);
    setActivePage('details');
  };

  const handleAskAI = (title: string) => {
    setSearchQuery(`Review my saved paper "${title}". Summarize its methodology and highlight practical implementation considerations.`);
    setActivePage('chat');
  };

  const handleCreateCollection = () => {
    const name = window.prompt('Enter collection name:');
    if (name && name.trim()) {
      setCollections([...collections, { id: `c-${Date.now()}`, name: name.trim(), count: 0 }]);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1240px] mx-auto space-y-6">

        {/* ── TOP HEADER ── */}
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
                  <Bookmark className="w-5 h-5 text-blue-600" />
                  Your Research Library
                </h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Curate, organize, and synthesize saved publications and personal reading collections.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateCollection}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Collection</span>
            </button>
          </div>

          {/* Search bar & Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
            {/* Tabs */}
            <div className="flex items-center gap-1 w-full sm:w-auto">
              {[
                { id: 'all', label: `All Saved (${savedPapers.length})` },
                { id: 'collections', label: `Collections (${collections.length})` },
                { id: 'recent', label: 'Recently Saved' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search saved papers..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* ── CONTENT TABS ── */}
        {activeTab === 'collections' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(col => (
              <div
                key={col.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between h-36"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <span className="text-[11px] font-bold text-gray-400 font-mono">{col.count} PAPERS</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 mt-3 leading-snug">{col.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('all')}>
                    View Collection →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPapers.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center">
                <Bookmark className="w-10 h-10 text-gray-300 mb-3" />
                <h3 className="text-[16px] font-bold text-gray-900">Your research library is empty</h3>
                <p className="text-[13px] text-gray-500 mt-1 max-w-sm">
                  Search across academic research to begin exploring and saving foundational papers.
                </p>
                <button
                  onClick={() => setActivePage('search')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-500 transition-all shadow-sm"
                >
                  Explore Academic Search
                </button>
              </div>
            ) : (
              filteredPapers.map((paper) => {
                const isCompared = comparisonPaperIds.includes(paper.id);

                return (
                  <div
                    key={paper.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            onClick={() => handleOpenPaper(paper.id)}
                            className="text-[15px] font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                          >
                            {paper.title}
                          </h3>

                          <p className="text-[12px] text-gray-500 mt-1">
                            {paper.authors.join(' · ')} • {paper.year} • <span className="font-semibold text-gray-700">{paper.citations.toLocaleString()} citations</span>
                          </p>

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {paper.field && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                                {paper.field}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              Saved in Library
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        <button
                          onClick={() => handleOpenPaper(paper.id)}
                          className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-[11px] border border-gray-200 transition-all"
                        >
                          Open
                        </button>

                        <button
                          onClick={() => handleAskAI(paper.title)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask AI</span>
                        </button>

                        <button
                          onClick={() => toggleComparisonPaper(paper.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-[11px] border transition-all ${
                            isCompared
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                        </button>

                        <button
                          onClick={() => toggleSavedPaper(paper.id)}
                          title="Remove from Saved"
                          className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
