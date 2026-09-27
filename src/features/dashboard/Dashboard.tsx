import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Search, ArrowRight, Mic, TrendingUp, BookOpen, Clock,
  Network, BrainCircuit, Zap, Bookmark, ExternalLink,
  Star, ChevronRight, BarChart2, MessageSquare,
  GitBranch, Globe, Shield, Sparkles, Activity,
  FlaskConical, Target, Plus, Eye, Layers, FileText,
  X, CheckCircle, AlertCircle, Calendar, Hash
} from 'lucide-react';
import { mockPapers } from '../../data/mockData';
import type { Paper } from '../../types';

// Animated counter hook
function useCounter(end: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
}

// Sparkline mini chart
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 28 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length-1] - min) / range) * (h - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
};

// Pill badge
const Badge: React.FC<{ label: string; color?: string }> = ({ label, color = 'cyan' }) => (
  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase
    bg-${color}-500/15 border border-${color}-500/30 text-${color}-400`}>
    {label}
  </span>
);

type SearchMode = 'ALL' | 'RAG' | 'GRAPH' | 'CONCEPTS';
type ActiveTab = 'saved' | 'explored' | 'recommended';

// ─── Paper Row Card (compact) ─────────────────────────────────────────────────
const PaperRow: React.FC<{
  paper: Paper;
  isSaved: boolean;
  onSave: () => void;
  onGraph: () => void;
  onChat: () => void;
  onClick: () => void;
}> = ({ paper, isSaved, onSave, onGraph, onChat, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className="group flex items-start gap-3 px-3 py-2.5 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/3 cursor-pointer transition-all duration-200"
    onClick={onClick}
  >
    {/* Venue badge */}
    <div className="flex-shrink-0 w-12 text-center mt-0.5">
      <div className="px-1 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/20">
        <span className="text-cyan-300 font-black text-[9px] block leading-tight">{paper.venue}</span>
        <span className="text-cyan-500/60 font-mono text-[8px] block">{paper.year}</span>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <h4 className="text-[12px] font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1 leading-snug">
        {paper.title}
      </h4>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] text-gray-500 truncate">{paper.authors[0]}{paper.authors.length > 1 ? ` +${paper.authors.length-1}` : ''}</span>
        <span className="text-gray-700">·</span>
        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5" fill="currentColor" />{(paper.citations/1000).toFixed(1)}k
        </span>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={e => e.stopPropagation()}>
      <button onClick={onGraph} title="View Graph" className="p-1 rounded text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
        <Network className="w-3 h-3" />
      </button>
      <button onClick={onChat} title="Chat about paper" className="p-1 rounded text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
        <MessageSquare className="w-3 h-3" />
      </button>
      <button onClick={onSave} title={isSaved ? 'Unsave' : 'Save'} className={`p-1 rounded transition-all ${isSaved ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10'}`}>
        <Bookmark className="w-3 h-3" fill={isSaved ? 'currentColor' : 'none'} />
      </button>
      {paper.url && (
        <a href={paper.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
          className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-all">
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  </motion.div>
);

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery, setSelectedPaperId, savedPaperIds, toggleSavedPaper, recentlyViewed } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('ALL');
  const [activeTab, setActiveTab] = useState<ActiveTab>('saved');
  const [addPaperOpen, setAddPaperOpen] = useState(false);
  const [addPaperUrl, setAddPaperUrl] = useState('');
  const [addPaperStatus, setAddPaperStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [greeting, setGreeting] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Animated stats
  const papersIndexed = useCounter(204800000);
  const knowledgeEdges = useCounter(1200000000);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSearch.trim()) return;
    setSearchQuery(localSearch);
    if (searchMode === 'GRAPH') setActivePage('graph');
    else if (searchMode === 'RAG') setActivePage('chat');
    else setActivePage('search');
  };

  const handleQuickSearch = (q: string) => { setSearchQuery(q); setActivePage('search'); };

  const handleAddPaper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPaperUrl.trim()) return;
    setAddPaperStatus('loading');
    setTimeout(() => {
      if (addPaperUrl.includes('arxiv') || addPaperUrl.includes('http')) {
        setAddPaperStatus('success');
        setTimeout(() => { setAddPaperOpen(false); setAddPaperUrl(''); setAddPaperStatus('idle'); }, 1500);
      } else {
        setAddPaperStatus('error');
        setTimeout(() => setAddPaperStatus('idle'), 2000);
      }
    }, 1200);
  };

  // Data
  const savedPapers = mockPapers.filter(p => savedPaperIds.includes(p.id));
  const exploredPapers = mockPapers.filter(p => recentlyViewed.includes(p.id));
  const recommendedPapers = mockPapers.filter(p => !savedPaperIds.includes(p.id)).slice(0, 4);
  const tabPapers = activeTab === 'saved' ? savedPapers : activeTab === 'explored' ? exploredPapers : recommendedPapers;

  const recentActivity = [
    { title: 'Graph Neural Networks in Drug Discovery', time: '2h ago', icon: Network, color: 'text-cyan-400' },
    { title: 'Attention Is All You Need', time: '5h ago', icon: BookOpen, color: 'text-purple-400' },
    { title: 'Compared DINOv2 vs CLIP', time: 'Yesterday', icon: Zap, color: 'text-emerald-400' },
    { title: 'Built Transformer Citation Graph', time: '2d ago', icon: GitBranch, color: 'text-sky-400' },
    { title: 'AI Synthesis: Vision Transformers', time: '3d ago', icon: MessageSquare, color: 'text-pink-400' },
  ];

  const recentPublications = [
    { title: 'Mamba-2: State Space Models with Enhanced SSM Kernel', venue: 'ICML', year: '2025', isNew: true },
    { title: 'Flash Attention 3: Fast and Accurate Attention with Asynchrony', venue: 'NeurIPS', year: '2025', isNew: true },
    { title: 'Mixture-of-Depths: Dynamically Allocating Compute in Transformers', venue: 'ArXiv', year: '2024', isNew: false },
    { title: 'KAN: Kolmogorov-Arnold Networks as Universal Approximators', venue: 'ICLR', year: '2025', isNew: true },
    { title: 'xLSTM: Extended Long Short-Term Memory', venue: 'ArXiv', year: '2024', isNew: false },
  ];

  const trendingTopics = [
    { topic: 'Retrieval-Augmented Generation', count: '12.4k', growth: '+34%', hot: true },
    { topic: 'Multimodal Foundation Models', count: '8.2k', growth: '+28%', hot: false },
    { topic: 'Test-Time Compute & Reasoning', count: '5.1k', growth: '+52%', hot: true },
    { topic: 'Protein Folding GNNs', count: '6.7k', growth: '+41%', hot: false },
    { topic: 'State Space Models (Mamba)', count: '3.8k', growth: '+67%', hot: true },
  ];

  const activitySparkData = [2,4,3,7,5,9,6,8,4,7,10,8,9,6,11,8,12,9,7,10,8,11,13,10];
  const searchSparkData = [1,3,2,5,4,6,3,7,5,8,6,9,7,8,6,9,8,10,7,9,11,8,10,12];

  const userStats = [
    { label: 'Saved', val: savedPaperIds.length, icon: Bookmark, color: 'text-cyan-400', spark: [1,2,1,2,1,2], sparkColor: '#06b6d4' },
    { label: 'Explored', val: 48, icon: Eye, color: 'text-purple-400', spark: [2,3,4,3,5,4], sparkColor: '#a855f7' },
    { label: 'AI Chats', val: 12, icon: MessageSquare, color: 'text-emerald-400', spark: [1,2,3,2,4,3], sparkColor: '#10b981' },
    { label: 'Graphs', val: 7, icon: Network, color: 'text-sky-400', spark: [0,1,0,2,1,2], sparkColor: '#0ea5e9' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 18 } }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] overflow-x-hidden">
      {/* Subtle background grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.06),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMC41IDAuNWg0MHY0MEgwLjV6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9nPjwvc3ZnPg==')] opacity-100" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible"
        className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 pb-8 grid grid-cols-12 gap-4">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ROW 1: USER PROFILE + STATS (COMPACT HERO) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={rowVariants} className="col-span-12">
          <div className="relative rounded-2xl overflow-hidden border border-white/8 bg-gradient-to-r from-[#0d1425]/95 via-[#090e1c]/95 to-[#0d1425]/95 backdrop-blur-xl">
            {/* Gradient accent line top */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-cyan-500/8 blur-3xl pointer-events-none" />

            <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar + Identity */}
              <div className="flex items-center gap-3.5 shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/25">
                    <div className="w-full h-full rounded-[10px] bg-[#060a16] flex items-center justify-center">
                      <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-purple-400">SS</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#060a16]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[15px] font-black text-white">Sriharsha Sunny</h2>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[8px] font-black tracking-wider uppercase">Pro</span>
                  </div>
                  <p className="text-[11px] text-gray-400">PhD Researcher · AI &amp; Machine Learning</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider">Online · Engine v2.0</span>
                  </div>
                </div>
              </div>

              {/* Greeting */}
              <div className="flex-1 min-w-0 hidden md:block">
                <p className="text-[13px] font-bold text-white">{greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Researcher</span> 👋</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  <span className="text-cyan-400 font-semibold">{savedPaperIds.length} saved</span> · 
                  <span className="text-purple-400 font-semibold"> 3 new papers</span> matching your interests today
                </p>
              </div>

              {/* User Stats Row */}
              <div className="flex items-center gap-2 ml-auto">
                {userStats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-colors min-w-[64px]">
                      <div className="flex items-center gap-1">
                        <Icon className={`w-3 h-3 ${s.color}`} />
                        <span className={`text-[14px] font-black ${s.color}`}>{s.val}</span>
                      </div>
                      <Sparkline data={s.spark} color={s.sparkColor} height={16} />
                      <span className="text-[9px] text-gray-500">{s.label}</span>
                    </div>
                  );
                })}

                {/* Add Paper Button */}
                <button
                  onClick={() => setAddPaperOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 hover:text-white transition-all text-[11px] font-bold ml-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Paper
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ROW 2: SEARCH BAR (FULL WIDTH) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={rowVariants} className="col-span-12">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
            <div className="relative flex items-center gap-2 bg-[#070b14]/90 border border-white/12 rounded-xl px-3 py-2.5 backdrop-blur-md focus-within:border-cyan-500/40 transition-all">
              {/* Mode tabs */}
              <div className="hidden sm:flex items-center gap-1 border-r border-white/10 pr-3 mr-1 shrink-0">
                {([
                  { id: 'ALL', label: 'All', icon: Search },
                  { id: 'RAG', label: 'AI', icon: Zap },
                  { id: 'GRAPH', label: 'Graph', icon: Network },
                  { id: 'CONCEPTS', label: 'Concepts', icon: BrainCircuit },
                ] as { id: SearchMode; label: string; icon: any }[]).map(m => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} type="button" onClick={() => setSearchMode(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${searchMode === m.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Icon className="w-3 h-3" />{m.label}
                    </button>
                  );
                })}
              </div>

              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search 200M+ papers, authors, topics... (Ctrl+K)"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 focus:outline-none"
              />

              {localSearch && (
                <button type="button" onClick={() => setLocalSearch('')} className="text-gray-600 hover:text-gray-300 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="button" className="text-gray-600 hover:text-cyan-400 transition-colors px-1">
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button type="submit" className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/25 flex items-center gap-1.5 shrink-0">
                Explore <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>

          {/* Quick chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 px-1">
            <span className="text-[10px] text-gray-600 font-semibold">Trending:</span>
            {['Vision Transformers', 'GraphRAG', 'Mamba SSM', 'Test-Time Compute', 'Protein Folding'].map((t, i) => (
              <button key={i} onClick={() => handleQuickSearch(t)}
                className="px-2 py-0.5 rounded-full border border-white/10 bg-white/3 text-[10px] text-gray-400 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />{t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ROW 3: MAIN CONTENT (left 8col) + SIDEBAR (right 4col) */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {/* LEFT COLUMN (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">

          {/* ── QUICK LAUNCH CARDS ─────────────────────────────────── */}
          <motion.div variants={rowVariants} className="grid grid-cols-4 gap-2">
            {[
              { icon: BrainCircuit, label: 'AI Synthesis', sub: 'RAG Literature', action: 'chat', grad: 'from-purple-600/20 to-blue-600/20', border: 'border-purple-500/30', col: 'text-purple-400' },
              { icon: Network, label: '3D Graph', sub: 'Citation Map', action: 'graph', grad: 'from-cyan-600/20 to-emerald-600/20', border: 'border-cyan-500/30', col: 'text-cyan-400' },
              { icon: Search, label: 'Discover', sub: '200M+ Papers', action: 'search', grad: 'from-sky-600/20 to-indigo-600/20', border: 'border-sky-500/30', col: 'text-sky-400' },
              { icon: FlaskConical, label: 'Hypothesize', sub: 'Research Gaps', action: 'chat', grad: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/30', col: 'text-emerald-400' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.button key={i} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActivePage(c.action as any)}
                  className={`flex flex-col items-start p-3 rounded-xl bg-gradient-to-br ${c.grad} border ${c.border} hover:shadow-lg transition-all duration-200 group`}>
                  <Icon className={`w-4 h-4 ${c.col} mb-2`} />
                  <span className="text-[11px] font-bold text-white block">{c.label}</span>
                  <span className="text-[9px] text-gray-500 block mt-0.5">{c.sub}</span>
                  <ChevronRight className={`w-3 h-3 ${c.col} mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
                </motion.button>
              );
            })}
          </motion.div>

          {/* ── MY PAPERS (TABBED) ─────────────────────────────────── */}
          <motion.div variants={rowVariants} className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/6">
              <div className="flex items-center gap-0.5 bg-white/4 rounded-lg p-0.5">
                {([
                  { id: 'saved', label: 'Saved', icon: Bookmark, count: savedPaperIds.length },
                  { id: 'explored', label: 'Explored', icon: Eye, count: recentlyViewed.length },
                  { id: 'recommended', label: 'For You', icon: Star, count: recommendedPapers.length },
                ] as { id: ActiveTab; label: string; icon: any; count: number }[]).map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Icon className="w-2.5 h-2.5" />
                      {tab.label}
                      <span className={`text-[8px] px-1 rounded ${activeTab === tab.id ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/8 text-gray-600'}`}>{tab.count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setAddPaperOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all">
                  <Plus className="w-3 h-3" /> Add
                </button>
                <button onClick={() => setActivePage('search')}
                  className="text-[10px] font-bold text-cyan-400/70 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  All <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Papers list */}
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="py-1 max-h-[280px] overflow-y-auto scrollbar-thin">
                {tabPapers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Bookmark className="w-6 h-6 text-gray-700" />
                    <p className="text-[11px] text-gray-600">No papers yet</p>
                    <button onClick={() => setActivePage('search')} className="text-[10px] text-cyan-400 hover:underline">Browse papers →</button>
                  </div>
                ) : (
                  tabPapers.map(paper => (
                    <PaperRow
                      key={paper.id}
                      paper={paper}
                      isSaved={savedPaperIds.includes(paper.id)}
                      onSave={() => toggleSavedPaper(paper.id)}
                      onGraph={() => { setSelectedPaperId(paper.id); setActivePage('graph'); }}
                      onChat={() => { setSearchQuery(paper.title); setActivePage('chat'); }}
                      onClick={() => { setSelectedPaperId(paper.id); setActivePage('details'); }}
                    />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ── RECENT PUBLICATIONS (NEW THIS WEEK) ───────────────── */}
          <motion.div variants={rowVariants} className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/6">
              <h3 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Recent Publications
              </h3>
              <span className="text-[9px] text-gray-600 font-mono">Updated daily</span>
            </div>
            <div className="py-1">
              {recentPublications.map((pub, i) => (
                <button key={i} onClick={() => handleQuickSearch(pub.title)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/3 transition-all text-left group">
                  <div className="shrink-0 text-center w-10">
                    <div className={`px-1 py-0.5 rounded text-[8px] font-black ${pub.isNew ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' : 'bg-white/5 border border-white/10 text-gray-500'}`}>
                      {pub.venue}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors line-clamp-1">{pub.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {pub.isNew && <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 rounded border border-emerald-500/20">NEW</span>}
                    <span className="text-[9px] text-gray-600 font-mono">{pub.year}</span>
                    <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── RECENT ACTIVITY ────────────────────────────────────── */}
          <motion.div variants={rowVariants} className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/6">
              <h3 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                My Activity
              </h3>
              <div className="flex items-center gap-1">
                <Sparkline data={activitySparkData} color="#06b6d4" height={20} />
                <span className="text-[9px] text-gray-600 font-mono ml-1">24 sessions</span>
              </div>
            </div>
            <div className="py-1">
              {recentActivity.map((act, i) => {
                const Icon = act.icon;
                return (
                  <button key={i} onClick={() => handleQuickSearch(act.title)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/3 transition-all text-left group">
                    <div className={`w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${act.color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="flex-1 text-[11px] text-gray-300 group-hover:text-white transition-colors line-clamp-1">{act.title}</span>
                    <span className="text-[9px] text-gray-600 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />{act.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* ── RESEARCH ANALYTICS ─────────────────────────────────── */}
          <motion.div variants={rowVariants} className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-purple-400" />Analytics
              </h3>
              <span className="text-[9px] text-gray-600 font-mono">30 days</span>
            </div>

            {/* Bar chart */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-gray-600">Search Activity</span>
                <Sparkline data={searchSparkData} color="#a855f7" height={20} />
              </div>
            </div>

            {/* Metric rows */}
            {[
              { label: 'Papers Read', val: 127, max: 200, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
              { label: 'AI Queries', val: 48, max: 100, color: 'bg-purple-500', textColor: 'text-purple-400' },
              { label: 'Graphs Built', val: 7, max: 20, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
              { label: 'Citations Found', val: 340, max: 500, color: 'bg-sky-500', textColor: 'text-sky-400' },
            ].map((m, i) => (
              <div key={i} className="mb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400">{m.label}</span>
                  <span className={`text-[10px] font-black ${m.textColor}`}>{m.val}</span>
                </div>
                <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${m.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.val / m.max) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/6">
              <div className="text-center">
                <div className="text-[13px] font-black text-sky-400">34min</div>
                <div className="text-[9px] text-gray-600">Avg Session</div>
              </div>
              <div className="text-center">
                <div className="text-[13px] font-black text-emerald-400">96.4%</div>
                <div className="text-[9px] text-gray-600">AI Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* ── TRENDING TOPICS ─────────────────────────────────────── */}
          <motion.div variants={rowVariants} className="rounded-2xl border border-white/8 bg-[#0a0f1c]/70 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />Trending in AI
              </h3>
              <span className="text-[9px] text-cyan-400 font-mono">Live</span>
            </div>
            <div className="space-y-1">
              {trendingTopics.map((t, i) => (
                <button key={i} onClick={() => handleQuickSearch(t.topic)}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/4 transition-all group text-left">
                  <span className="w-4 h-4 rounded flex items-center justify-center bg-white/5 text-[9px] font-black text-gray-500 group-hover:text-cyan-400 transition-colors shrink-0">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white transition-colors block truncate">{t.topic}</span>
                    <span className="text-[9px] text-gray-600 font-mono">{t.count} papers</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {t.hot && <span className="text-[7px] font-black bg-rose-500/15 border border-rose-500/30 text-rose-400 px-1 rounded">HOT</span>}
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/8 px-1.5 rounded border border-emerald-500/15">{t.growth}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── PLATFORM SCALE ─────────────────────────────────────── */}
          <motion.div variants={rowVariants} className="rounded-2xl border border-white/8 bg-gradient-to-b from-[#0c1427]/80 to-[#070b14]/80 backdrop-blur-xl p-4">
            <h3 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Globe className="w-3.5 h-3.5 text-sky-400" />Platform Scale
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Papers Indexed', val: '204.8M', icon: FileText, color: 'text-cyan-400' },
                { label: 'Knowledge Edges', val: '1.2B+', icon: GitBranch, color: 'text-purple-400' },
                { label: 'Connected APIs', val: '45+', icon: Layers, color: 'text-emerald-400' },
                { label: 'AI Latency', val: '12ms', icon: Zap, color: 'text-amber-400' },
                { label: 'Accuracy', val: '96.4%', icon: Target, color: 'text-sky-400' },
                { label: 'Security', val: 'SOC2', icon: Shield, color: 'text-green-400' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Icon className={`w-3 h-3 ${s.color} shrink-0`} />
                    <span className="flex-1 text-[10px] text-gray-400">{s.label}</span>
                    <span className={`text-[10px] font-black ${s.color}`}>{s.val}</span>
                  </div>
                );
              })}
            </div>

            <button onClick={() => setActivePage('chat')}
              className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/25 text-[11px] font-bold text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all flex items-center justify-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Start AI Session
            </button>
          </motion.div>
        </div>

      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ADD PAPER MODAL */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {addPaperOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => { setAddPaperOpen(false); setAddPaperStatus('idle'); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
              <div className="relative rounded-2xl border border-white/15 bg-[#0a0f1c]/95 backdrop-blur-2xl shadow-2xl p-6">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent rounded-t-2xl" />
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-black text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-cyan-400" />Add Paper to Library
                  </h3>
                  <button onClick={() => { setAddPaperOpen(false); setAddPaperStatus('idle'); }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddPaper} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-400 font-semibold mb-1.5 block">ArXiv / DOI / URL</label>
                    <input type="text" placeholder="https://arxiv.org/abs/1706.03762 or 10.xxxx/..."
                      value={addPaperUrl} onChange={e => setAddPaperUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Title (opt)', ph: 'Paper title...' },
                      { label: 'Authors (opt)', ph: 'Author names...' },
                      { label: 'Tags (opt)', ph: 'AI, Vision...' },
                    ].map((f, i) => (
                      <div key={i}>
                        <label className="text-[10px] text-gray-500 font-semibold mb-1 block">{f.label}</label>
                        <input type="text" placeholder={f.ph}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-cyan-500/40 transition-all" />
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={addPaperStatus === 'loading' || addPaperStatus === 'success'}
                    className={`w-full py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all ${
                      addPaperStatus === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' :
                      addPaperStatus === 'error' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400' :
                      'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20'
                    }`}>
                    {addPaperStatus === 'loading' && <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Fetching Paper...</>}
                    {addPaperStatus === 'success' && <><CheckCircle className="w-3.5 h-3.5" />Paper Added Successfully!</>}
                    {addPaperStatus === 'error' && <><AlertCircle className="w-3.5 h-3.5" />Invalid URL — Try Again</>}
                    {addPaperStatus === 'idle' && <><Plus className="w-3.5 h-3.5" />Add to Library</>}
                  </button>
                </form>

                <p className="text-[10px] text-gray-600 text-center mt-3">
                  Supports ArXiv, Semantic Scholar, PubMed, DOI, and direct PDF URLs
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
