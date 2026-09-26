import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { 
  Search, ArrowRight, Mic, History, TrendingUp, BookOpen, Clock, 
  Network, BrainCircuit, Zap, Bookmark, ExternalLink, Cpu, Compass
} from 'lucide-react';
import { mockPapers } from '../../data/mockData';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';

type SearchMode = 'ALL' | 'RAG' | 'GRAPH' | 'CONCEPTS';

export const Dashboard: React.FC = () => {
  const { setActivePage, setSearchQuery, setSelectedPaperId, savedPaperIds, toggleSavedPaper } = useApp();
  const [localSearch, setLocalSearch] = useState('');
  const [greeting, setGreeting] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('ALL');

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
      if (searchMode === 'GRAPH') {
        setActivePage('graph');
      } else if (searchMode === 'RAG') {
        setActivePage('chat');
      } else {
        setActivePage('search');
      }
    }
  };

  const handleExampleClick = (query: string) => {
    setSearchQuery(query);
    setActivePage('search');
  };

  const examples = [
    { text: "Self-supervised learning in Vision", icon: BrainCircuit },
    { text: "Compare DINOv2 and MAE", icon: Zap },
    { text: "GraphRAG implementations", icon: Network },
    { text: "Research gaps in GNNs", icon: Compass },
    { text: "Diffusion models for molecular biology", icon: Cpu }
  ];

  const recentActivity = [
    { type: 'search', title: 'Graph Neural Networks in Drug Discovery', time: '2 hours ago', icon: Network, color: 'text-cyan-400' },
    { type: 'paper', title: 'Attention Is All You Need (Transformer)', time: '5 hours ago', icon: BookOpen, color: 'text-purple-400' },
    { type: 'compare', title: 'Compared DINOv2 vs CLIP Embeddings', time: 'Yesterday', icon: Zap, color: 'text-emerald-400' },
  ];

  const trendingTopics = [
    { topic: 'Retrieval-Augmented Generation', count: '12.4k papers', growth: '+34%' },
    { topic: 'Multimodal Foundation Models', count: '8.2k papers', growth: '+28%' },
    { topic: 'Protein Folding & Molecular GNNs', count: '6.7k papers', growth: '+41%' },
    { topic: 'Test-Time Compute & Reasoning', count: '5.1k papers', growth: '+52%' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-start pb-16 w-full overflow-x-hidden">
      
      {/* Sci-Fi Deep Space Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]"></div>
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[160px]"></div>
        <div className="absolute bottom-0 left-1/3 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-7xl flex flex-col space-y-10 h-full px-4 sm:px-8 pt-6"
      >
        
        {/* ============ HERO SECTION WITH 3D QUANTUM NEURAL CORE ============ */}
        <motion.div 
          variants={itemVariants} 
          className="w-full rounded-3xl bg-gradient-to-br from-[#0c1427]/80 via-[#090e1c]/90 to-[#070b14]/90 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle accent border glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* Left Column: Greeting, Telemetry & Search */}
            <div className="flex-1 flex flex-col items-start text-left w-full max-w-2xl">
              
              {/* Uplink status badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>RESEARCH ENGINE ONLINE • v2.0</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">RAG UPLINK ACTIVE</span>
              </div>

              {/* Dynamic Greeting */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-3">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Researcher.</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
                Query across 200M+ peer-reviewed papers, explore 3D knowledge topologies, and synthesize novel scientific hypotheses with Multi-LLM intelligence.
              </p>

              {/* Telemetry quick stats pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-6 text-xs">
                {[
                  { label: 'Papers Indexed', val: '204.8M', col: 'text-cyan-400' },
                  { label: 'Knowledge Edges', val: '1.2B+', col: 'text-purple-400' },
                  { label: 'Connected Repos', val: '45+ APIs', col: 'text-emerald-400' },
                  { label: 'Neural Latency', val: '12ms', col: 'text-sky-400' },
                ].map((stat, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md">
                    <span className={`font-extrabold block text-sm ${stat.col}`}>{stat.val}</span>
                    <span className="text-[10px] text-gray-400">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Mode Selectors */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {[
                  { id: 'ALL', label: 'All Literature', icon: Search },
                  { id: 'RAG', label: 'RAG Synthesis', icon: Zap },
                  { id: 'GRAPH', label: '3D Citation Graph', icon: Network },
                  { id: 'CONCEPTS', label: 'Concept Extraction', icon: BrainCircuit },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSearchMode(mode.id as SearchMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        searchMode === mode.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Premium Sci-Fi Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-600/30 rounded-2xl blur-lg transition-all duration-500 opacity-0 group-focus-within:opacity-100"></div>
                <div className="relative flex items-center bg-[#070b14]/90 border border-white/15 rounded-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 focus-within:border-cyan-400/60 focus-within:ring-1 focus-within:ring-cyan-400/40">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 mr-3 shrink-0 border border-cyan-500/20">
                    <Search className="h-5 w-5 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                  </div>
                  <input
                    type="text"
                    placeholder={
                      searchMode === 'RAG' 
                        ? 'Ask a research hypothesis to synthesize...'
                        : searchMode === 'GRAPH'
                        ? 'Search for topics or authors to view 3D topology...'
                        : 'Ask anything about academic research...'
                    }
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <button 
                      type="button" 
                      title="Voice Research Query"
                      className="p-2.5 text-gray-400 hover:text-cyan-400 transition-all rounded-xl hover:bg-white/5"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 font-bold text-xs"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Suggested Queries Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-3.5">
                <span className="text-[11px] text-gray-500 font-semibold mr-1">Trending:</span>
                {examples.map((example, idx) => {
                  const Icon = example.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleExampleClick(example.text)}
                      className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-xs font-medium text-gray-300 hover:text-cyan-300 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Icon className="w-3 h-3 text-cyan-400/80" />
                      {example.text}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Interactive 3D Quantum Neural Core Widget */}
            <div className="hidden lg:flex flex-col items-center justify-center relative w-[320px] flex-shrink-0">
              
              {/* Outer HUD Container */}
              <div className="relative w-[300px] h-[300px] rounded-3xl bg-[#070b14]/70 border border-white/10 backdrop-blur-xl p-3 flex flex-col items-center justify-center shadow-2xl group">
                
                {/* Top HUD bar */}
                <div className="w-full flex items-center justify-between px-3 py-1 mb-1 border-b border-white/10 text-[10px] font-mono text-gray-400">
                  <span className="flex items-center gap-1 text-cyan-300 font-bold">
                    <Network className="w-3 h-3 text-cyan-400" /> TOPOLOGY HUD
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 text-[9px]">
                    ✦ DRAG TO ROTATE
                  </span>
                </div>

                {/* 3D Core with ambient glow */}
                <div className="relative w-full h-[220px] flex items-center justify-center overflow-hidden">
                  <div className="absolute w-44 h-44 rounded-full bg-cyan-500/20 blur-[50px] pointer-events-none"></div>
                  <ThreeNeuralCore className="w-full h-full" theme="cyan" interactive={true} />
                </div>

                {/* Bottom HUD quick action */}
                <button 
                  onClick={() => setActivePage('graph')}
                  className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-[11px] font-bold text-gray-300 hover:text-cyan-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  Launch Full 3D Universe &rarr;
                </button>
              </div>

            </div>

          </div>
        </motion.div>

        {/* ============ LOWER GRID: CONTINUE READING & TRENDING ============ */}
        <motion.div variants={itemVariants} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Widget 1: Continue Reading (Recent Papers) */}
          <div className="col-span-1 lg:col-span-2 flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-cyan-400" /> Continue Research
              </h3>
              <button 
                onClick={() => setActivePage('search')} 
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>View All 204M Papers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom Enhanced Paper Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockPapers.slice(0, 2).map((paper) => {
                const isSaved = savedPaperIds.includes(paper.id);
                return (
                  <div 
                    key={paper.id}
                    onClick={() => {
                      setSelectedPaperId(paper.id);
                      setActivePage('details');
                    }}
                    className="flex flex-col p-5 rounded-2xl border border-white/10 bg-[#0a0f1c]/80 hover:bg-[#0c1427]/90 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 group relative"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                          {paper.venue} {paper.year}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          ★ {paper.citations.toLocaleString()} citations
                        </span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSavedPaper(paper.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved 
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                      {paper.title}
                    </h4>

                    <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-3 mb-4">
                      {paper.abstract}
                    </p>

                    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-gray-500 text-[11px]">
                        {paper.authors[0]} et al.
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPaperId(paper.id);
                            setActivePage('graph');
                          }}
                          className="px-2 py-1 rounded-md bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-[10px] font-medium text-cyan-300 transition-colors flex items-center gap-1"
                        >
                          <Network className="w-3 h-3 text-cyan-400" /> Graph
                        </button>
                        <a 
                          href={paper.url} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded text-gray-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Trending & Activity Column */}
          <div className="col-span-1 flex flex-col space-y-6">
            
            {/* Trending Topics */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
                <TrendingUp className="h-4 w-4 text-purple-400" /> Trending Topics
              </h3>
              <div className="p-5 rounded-2xl border border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-xl space-y-2.5">
                {trendingTopics.map((topic, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleExampleClick(topic.topic)}
                    className="group flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-3">
                      <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-gray-400 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors truncate">
                        {topic.topic}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-gray-500 font-mono">{topic.count}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                        {topic.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="flex flex-col space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 px-1">
                <History className="h-4 w-4 text-emerald-400" /> Recent Research Logs
              </h3>
              <div className="p-5 rounded-2xl border border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl shadow-xl space-y-3">
                {recentActivity.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleExampleClick(act.title)}
                      className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0 ${act.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-semibold text-gray-200 hover:text-cyan-300 transition-colors truncate">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" /> {act.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </motion.div>
        
      </motion.div>
    </div>
  );
};
