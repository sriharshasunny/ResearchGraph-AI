import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, Bookmark, Network, MessageSquare, ExternalLink, Star, X, BookOpen, ArrowLeft } from 'lucide-react';
import { mockPapers } from '../../data/mockData';
import type { Paper } from '../../types';

type SortKey = 'citations' | 'year' | 'relevance';

export const SearchPage: React.FC = () => {
  const { searchQuery, setSearchQuery, savedPaperIds, toggleSavedPaper, setSelectedPaperId, setActivePage } = useApp();
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [sortBy, setSortBy] = useState<SortKey>('citations');
  const [sortDesc, setSortDesc] = useState(true);
  const [filterVenue, setFilterVenue] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [results, setResults] = useState<Paper[]>(mockPapers);
  const [isSearching, setIsSearching] = useState(false);

  const venues = [...new Set(mockPapers.map(p => p.venue).filter(Boolean))];

  useEffect(() => {
    if (searchQuery) { setLocalQuery(searchQuery); doSearch(searchQuery); }
  }, [searchQuery]);

  const doSearch = (q: string) => {
    setIsSearching(true);
    setTimeout(() => {
      let filtered = mockPapers;
      if (q.trim()) {
        const lower = q.toLowerCase();
        filtered = mockPapers.filter(p =>
          p.title.toLowerCase().includes(lower) ||
          p.abstract.toLowerCase().includes(lower) ||
          p.authors.some(a => a.toLowerCase().includes(lower)) ||
          (p.venue || '').toLowerCase().includes(lower)
        );
      }
      if (filterVenue) filtered = filtered.filter(p => p.venue === filterVenue);
      if (filterYear) filtered = filtered.filter(p => String(p.year) === filterYear);
      filtered.sort((a, b) => {
        const va = sortBy === 'citations' ? a.citations : sortBy === 'year' ? a.year : 0;
        const vb = sortBy === 'citations' ? b.citations : sortBy === 'year' ? b.year : 0;
        return sortDesc ? vb - va : va - vb;
      });
      setResults(filtered);
      setIsSearching(false);
    }, 400);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    doSearch(localQuery);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 sm:p-6 gap-4">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(6,182,212,0.05),transparent)]" />
      </div>

      {/* Search Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setActivePage('dashboard')} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-[15px] font-black text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />Discover Papers
          </h1>
          <span className="text-[10px] text-gray-600 font-mono">{results.length} results</span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative flex items-center bg-[#0a0f1c]/90 border border-white/12 rounded-xl px-3 py-2.5 focus-within:border-cyan-500/40 transition-all">
            <Search className="w-4 h-4 text-gray-500 mr-2.5 shrink-0" />
            <input type="text" placeholder="Search papers, authors, topics..."
              value={localQuery} onChange={e => setLocalQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 focus:outline-none" />
            {localQuery && (
              <button type="button" onClick={() => { setLocalQuery(''); setResults(mockPapers); }}
                className="text-gray-600 hover:text-gray-300 ml-2">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[12px] rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20">
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <Filter className="w-3 h-3 text-gray-600" />
          <select value={filterVenue} onChange={e => setFilterVenue(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-cyan-500/40 transition-all">
            <option value="">All Venues</option>
            {venues.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-300 focus:outline-none focus:border-cyan-500/40 transition-all">
            <option value="">All Years</option>
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex items-center gap-1 ml-auto">
            {(['citations', 'year', 'relevance'] as SortKey[]).map(s => (
              <button key={s} onClick={() => { if (sortBy === s) setSortDesc(!sortDesc); else { setSortBy(s); setSortDesc(true); } }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${sortBy === s ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>
                {sortBy === s && (sortDesc ? <SortDesc className="w-2.5 h-2.5" /> : <SortAsc className="w-2.5 h-2.5" />)}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
        {isSearching ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-[12px] text-gray-500">Searching 200M+ papers...</span>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Search className="w-10 h-10 text-gray-700" />
            <p className="text-[14px] font-bold text-gray-500">No papers found</p>
            <p className="text-[11px] text-gray-600">Try a different query or remove filters</p>
            <button onClick={() => { setLocalQuery(''); setFilterVenue(''); setFilterYear(''); setResults(mockPapers); }}
              className="px-4 py-2 bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-xl text-[11px] font-bold hover:bg-cyan-500/25 transition-all mt-1">
              Clear Filters
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2 pb-4">
              {results.map((paper, i) => {
                const isSaved = savedPaperIds.includes(paper.id);
                return (
                  <motion.div key={paper.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => { setSelectedPaperId(paper.id); setActivePage('details'); }}
                    className="group flex gap-4 p-4 rounded-xl border border-white/8 bg-[#0a0f1c]/60 hover:bg-[#0c1527]/80 hover:border-cyan-500/25 cursor-pointer transition-all backdrop-blur-sm">
                    
                    {/* Left */}
                    <div className="shrink-0 text-center w-14">
                      <div className="px-1.5 py-1 rounded-lg bg-cyan-500/12 border border-cyan-500/20">
                        <span className="text-cyan-300 font-black text-[10px] block leading-tight">{paper.venue}</span>
                        <span className="text-cyan-500/60 font-mono text-[9px] block">{paper.year}</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-center gap-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />
                        <span className="text-[9px] text-amber-400 font-bold font-mono">{(paper.citations/1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">{paper.title}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-2">{paper.abstract}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        {paper.authors.slice(0, 3).map((a, j) => (
                          <span key={j} className="flex items-center gap-0.5">
                            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[7px] font-black text-white">{a[0]}</span>
                            {a.split(' ').pop()}
                          </span>
                        ))}
                        {paper.authors.length > 3 && <span className="text-gray-600">+{paper.authors.length - 3} more</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleSavedPaper(paper.id)} className={`p-1.5 rounded-lg border transition-all ${isSaved ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30'}`}>
                        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={() => { setSelectedPaperId(paper.id); setActivePage('graph'); }} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                        <Network className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setSearchQuery(paper.title); setActivePage('chat'); }} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-purple-400 hover:border-purple-500/30 transition-all">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      {paper.url && (
                        <a href={paper.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-all">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
