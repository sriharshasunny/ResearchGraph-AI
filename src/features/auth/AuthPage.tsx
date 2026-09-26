import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Sparkles, ArrowLeft, Zap, Globe, KeyRound, CheckCircle2, Cpu, Share2 } from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';
import { InteractiveSpaceBackground } from '../../components/InteractiveSpaceBackground';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  const triggerTraversal = (destination: PageState, mode?: AuthMode) => {
    setPageState(destination);
    if (mode) setAuthMode(mode);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 fixed inset-0">
      
      {/* --- INTERACTIVE 3D SPACE BACKGROUND (Parallax stars, deep space vortex/nebula, shooting stars) --- */}
      <InteractiveSpaceBackground pageState={pageState} authMode={authMode} />

      {/* --- PAGE CONTENT CONTAINER --- */}
      <div 
        ref={scrollContainerRef}
        className="relative z-20 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <AnimatePresence mode="wait">
          
          {/* ==================================================== */}
          {/*                   LANDING PAGE                       */}
          {/* ==================================================== */}
          {pageState === 'LANDING' && (
            <motion.div 
              key="landing-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full min-h-screen flex flex-col relative"
            >
              {/* ═══════════════ TOP NAVBAR ═══════════════ */}
              <nav className="w-full px-4 sm:px-6 py-3 flex items-center justify-between bg-[#060a14]/90 backdrop-blur-xl border-b border-white/10 relative z-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-cyan-500/40 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20 shadow-lg shadow-cyan-500/10">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="font-bold text-lg tracking-wide text-white">ResearchGraph <span className="text-cyan-400">AI</span></span>
                </div>
                
                <div className="hidden lg:flex items-center gap-0.5">
                  {['Home', 'Explore', '3D Graph', 'Papers', 'LLM Chat', 'Analytics', 'About'].map((link, i) => (
                    <button 
                      key={link}
                      className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                        i === 2 
                          ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 text-xs cursor-pointer hover:bg-white/10 transition-all min-w-[200px]">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search papers, authors, concepts...</span>
                    <span className="ml-auto text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono border border-white/10">⌘K</span>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative">
                    <span className="text-gray-400 text-sm">🔔</span>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400"></span>
                  </button>
                  <button onClick={() => triggerTraversal('AUTH', 'LOGIN')} className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-cyan-500/20">
                    S
                  </button>
                </div>
              </nav>

              {/* ═══════════════ MAIN CONTENT AREA ═══════════════ */}
              <div className="flex-1 flex relative overflow-hidden">

                {/* ─── LEFT SIDEBAR ─── */}
                <aside className="hidden lg:flex flex-col w-[220px] bg-[#060a14]/80 backdrop-blur-xl border-r border-white/10 z-40 flex-shrink-0">
                  {/* Research Universe Menu */}
                  <div className="p-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Research Universe</h3>
                    <div className="space-y-0.5">
                      {[
                        { icon: Network, label: 'Knowledge Graph', active: true },
                        { icon: Search, label: 'Paper Explorer', active: false },
                        { icon: Zap, label: 'RAG Pipeline', active: false },
                        { icon: BrainCircuit, label: 'LLM Assistant', active: false },
                        { icon: Globe, label: 'Data Sources', active: false },
                        { icon: Sparkles, label: 'Concept Analysis', active: false },
                        { icon: Share2, label: 'Citation Network', active: false },
                        { icon: Cpu, label: 'Research Trends', active: false },
                      ].map((item, idx) => (
                        <button 
                          key={idx}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            item.active 
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Research Sources Panel */}
                  <div className="mt-auto p-4 border-t border-white/10">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Research Sources</h3>
                    <div className="space-y-1.5">
                      {[
                        { name: 'arXiv', count: '13.4M papers', color: 'bg-red-500' },
                        { name: 'PubMed', count: '36.2M papers', color: 'bg-blue-500' },
                        { name: 'IEEE', count: '8.1M papers', color: 'bg-sky-500' },
                        { name: 'Semantic Scholar', count: '203M papers', color: 'bg-yellow-500' },
                        { name: 'CrossRef', count: '140M papers', color: 'bg-green-500' },
                        { name: 'OpenAlex', count: '250M papers', color: 'bg-purple-500' },
                        { name: 'Custom Sources', count: 'Configure...', color: 'bg-gray-500' },
                      ].map((src, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px]">
                          <span className={`w-2 h-2 rounded-full ${src.color} flex-shrink-0`}></span>
                          <span className="text-gray-300 font-medium truncate">{src.name}</span>
                          <span className="text-gray-600 ml-auto text-[10px] whitespace-nowrap">{src.count}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 w-full py-1.5 rounded-lg border border-dashed border-white/15 text-gray-500 text-[11px] font-medium hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                      + Add Source
                    </button>
                  </div>
                </aside>

                {/* ─── CENTER MAIN AREA ─── */}
                <div className="flex-1 relative flex flex-col overflow-hidden">

                  {/* Hero Overlay Content */}
                  <div className="relative flex-1 flex items-center justify-center p-6 sm:p-10">
                    
                    {/* LEFT HERO TEXT */}
                    <div className="absolute left-6 sm:left-10 top-6 sm:top-10 z-30 max-w-md">
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        ResearchGraph AI
                      </motion.div>

                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4"
                      >
                        A Universe<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                          of Connected
                        </span><br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400">
                          Knowledge
                        </span>
                      </motion.h1>

                      <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm"
                      >
                        RAG-powered research intelligence with knowledge graphs, multi-source data and LLMs to help you discover, connect and understand research like never before.
                      </motion.p>

                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3 mb-8"
                      >
                        <button 
                          onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 border border-cyan-400/20"
                        >
                          Explore 3D Graph <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-gray-300 font-medium text-xs sm:text-sm hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px]">▶</span>
                          Watch Demo
                        </button>
                      </motion.div>

                      {/* Stats Row */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-4 text-[11px]"
                      >
                        {[
                          { value: '200M+', label: 'Research Papers' },
                          { value: '45+', label: 'Data Sources' },
                          { value: 'Multi-LLM', label: 'AI Intelligence' },
                          { value: 'Real-time', label: 'Knowledge Graph' },
                        ].map((stat, idx) => (
                          <div key={idx}>
                            <span className="text-white font-bold block">{stat.value}</span>
                            <span className="text-gray-500">{stat.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* ═══ CENTER 3D KNOWLEDGE SPHERE ═══ */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px] flex items-center justify-center"
                    >
                      {/* Glow aura */}
                      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-pulse"></div>
                      <div className="absolute w-60 h-60 rounded-full bg-purple-500/8 blur-[80px] pointer-events-none translate-x-8 translate-y-10"></div>

                      <ThreeNeuralCore className="w-full h-full" theme="cyan" interactive={true} />

                      {/* Floating Category Labels */}
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute top-[5%] left-[35%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Authors
                        </span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="absolute top-[40%] left-[-5%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Papers
                        </span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="absolute bottom-[20%] left-[5%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Concepts
                        </span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.85 }} className="absolute top-[25%] right-[-8%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Knowledge Graph
                        </span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.95 }} className="absolute top-[50%] right-[-12%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Datasets
                        </span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.05 }} className="absolute bottom-[25%] right-[-5%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Citations
                        </span>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="absolute bottom-[5%] right-[15%] z-20 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Research Trends
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* ═══ RIGHT FLOATING PANELS ═══ */}
                    <div className="hidden xl:flex flex-col gap-3 absolute right-4 top-6 z-30 w-[210px]">
                      
                      {/* Research Databases Panel */}
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
                        className="rounded-xl bg-[#0a0f1c]/90 border border-white/10 p-3 backdrop-blur-xl"
                      >
                        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">Research Databases</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {['PubMed', 'IEEE', 'Semantic Scholar', 'CrossRef'].map(db => (
                            <span key={db} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-400 font-medium">{db}</span>
                          ))}
                        </div>
                      </motion.div>

                      {/* RAG Pipeline Panel */}
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                        className="rounded-xl bg-[#0a0f1c]/90 border border-white/10 p-3 backdrop-blur-xl"
                      >
                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">RAG Pipeline</h4>
                        <div className="flex items-center gap-1 text-[9px]">
                          <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300">Retrieve</span>
                          <span className="text-gray-600">→</span>
                          <span className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300">Augment</span>
                          <span className="text-gray-600">→</span>
                          <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Generate</span>
                        </div>
                      </motion.div>

                      {/* Large Language Models Panel */}
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                        className="rounded-xl bg-[#0a0f1c]/90 border border-white/10 p-3 backdrop-blur-xl"
                      >
                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Large Language Models</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {['GPT-4', 'Claude', 'Gemini', 'Llama', 'Mistral'].map(llm => (
                            <span key={llm} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-400 font-medium">{llm}</span>
                          ))}
                        </div>
                      </motion.div>

                      {/* Live Analytics Panel */}
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
                        className="rounded-xl bg-[#0a0f1c]/90 border border-white/10 p-3 backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Live Analytics</h4>
                          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
                          </span>
                        </div>
                        {/* Mini bar chart */}
                        <div className="flex items-end gap-[3px] h-8 mb-2">
                          {[60, 85, 45, 70, 90, 55, 75, 95, 65, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400/80 rounded-sm" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                        <div className="space-y-1 text-[9px]">
                          <div className="flex justify-between"><span className="text-gray-500">Papers Indexed</span><span className="text-cyan-400 font-bold">200M+</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Connections</span><span className="text-purple-400 font-bold">1.2B+</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Concepts</span><span className="text-emerald-400 font-bold">45K+</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Research Domains</span><span className="text-sky-400 font-bold">120+</span></div>
                        </div>
                      </motion.div>
                    </div>

                  </div>

                  {/* ═══════════════ COCKPIT BOTTOM SECTION ═══════════════ */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative z-30 w-full"
                  >
                    {/* Center Badge */}
                    <div className="flex justify-center mb-3">
                      <div className="px-6 py-2 rounded-t-xl bg-[#0a0f1c]/95 border border-white/10 border-b-0 backdrop-blur-xl text-center">
                        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] block">ResearchGraph AI</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Integrating Global Knowledge</span>
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="w-full bg-[#060a14]/95 backdrop-blur-xl border-t border-white/10 px-4 sm:px-8 py-4">
                      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4">
                        
                        {/* Multi-Source Retrieval */}
                        <div className="hidden sm:block flex-shrink-0">
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">Multi-Source Retrieval</span>
                          <div className="flex gap-1">
                            {['arXiv', 'PubMed', 'IEEE'].map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-gray-500">{s}</span>
                            ))}
                          </div>
                        </div>

                        {/* Central Search Bar */}
                        <div 
                          className="flex-1 w-full max-w-lg cursor-text"
                          onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                        >
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 text-center">Ask a Research Question</span>
                          <div className="relative h-11 bg-[#0a0f1c]/80 border border-white/15 rounded-xl flex items-center px-4 hover:border-cyan-500/40 transition-all group">
                            <Search className="w-4 h-4 text-gray-600 mr-2 flex-shrink-0" />
                            <span className="text-gray-500 text-xs font-mono truncate">
                              E.g., "How does graph neural networks improve drug discovery?"
                            </span>
                            <button className="ml-auto w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* AI-Powered Insights */}
                        <div className="hidden sm:block flex-shrink-0 text-right">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">AI-Powered Insights</span>
                          <div className="space-y-0.5 text-[9px] text-gray-500">
                            <div className="flex items-center gap-1 justify-end"><BrainCircuit className="w-2.5 h-2.5 text-purple-400" /> Summarize</div>
                            <div className="flex items-center gap-1 justify-end"><Network className="w-2.5 h-2.5 text-cyan-400" /> Connect concepts</div>
                            <div className="flex items-center gap-1 justify-end"><Search className="w-2.5 h-2.5 text-emerald-400" /> Find related work</div>
                            <div className="flex items-center gap-1 justify-end"><Sparkles className="w-2.5 h-2.5 text-yellow-400" /> Generate insights</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>

            </motion.div>
          )}

          {/* ==================================================== */}
          {/*                   AUTH / LOGIN / SIGNUP              */}
          {/* ==================================================== */}
          {pageState === 'AUTH' && (
            <motion.div 
              key="auth-page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full min-h-screen flex items-center justify-center relative p-4 sm:p-8 z-50"
            >
              {/* BACK TO BASE BUTTON */}
              <button 
                onClick={() => triggerTraversal('LANDING')} 
                className="absolute top-6 left-6 z-[110] px-4 py-2 rounded-full bg-[#0a0f1c]/90 border border-white/15 flex items-center gap-2 hover:bg-white/10 hover:border-cyan-500/40 transition-all backdrop-blur-md shadow-xl"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-xs sm:text-sm text-gray-200">Return to Base</span>
              </button>

              <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 lg:gap-14 items-center justify-center relative z-20 pt-16 md:pt-0">
                
                {/* 3D QUANTUM NEURAL CORE HUD */}
                <div className="flex-1 flex flex-col items-center justify-center max-w-lg">
                  
                  {/* The Real WebGL 3D Quantum Core with Ambient Backglow */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
                    <div className={`absolute w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-colors duration-700 ${
                      authMode === 'LOGIN' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                    }`} />
                    <ThreeNeuralCore 
                      className="w-full h-full" 
                      theme={authMode === 'LOGIN' ? 'cyan' : 'purple'} 
                      interactive={true}
                    />
                  </div>
                  
                  {/* High-Tech Telemetry HUD */}
                  <div className="mt-2 text-center max-w-md px-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider border transition-colors duration-500 ${
                        authMode === 'LOGIN' 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-ping ${authMode === 'LOGIN' ? 'bg-cyan-400' : 'bg-purple-400'}`}></span>
                        <span>3D NEURAL UPLINK ACTIVE</span>
                      </div>
                      <span className="text-[10px] text-gray-300 font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                        ✦ DRAG TO ROTATE
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {authMode === 'LOGIN' ? 'Quantum Knowledge Grid' : 'Neural Node Genesis'}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                      {authMode === 'LOGIN' 
                        ? 'Connected to the decentralized scientific graph. Authenticate to sync your papers and explore 3D citation maps.' 
                        : 'Generate your cryptographic researcher identity to contribute hypotheses and synthesize discoveries.'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-400 border-t border-white/10 pt-3">
                      <div className="bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-cyan-400 font-bold block">204.8M</span> Papers
                      </div>
                      <div className="bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-purple-400 font-bold block">14ms</span> Latency
                      </div>
                      <div className="bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-emerald-400 font-bold block">TLS 1.3</span> Encrypted
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREMIUM GLASSMORPHIC AUTH CARD */}
                <div className={`w-full max-w-[440px] bg-[#080d1a]/95 backdrop-blur-3xl border rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-20 transition-all duration-500 ${
                  authMode === 'LOGIN' 
                    ? 'border-white/15 hover:border-cyan-500/40 shadow-cyan-950/20' 
                    : 'border-white/15 hover:border-purple-500/40 shadow-purple-950/20'
                }`}>
                  
                  {/* Subtle Top Specular Accent Line */}
                  <div className={`absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent transition-colors duration-500 ${
                    authMode === 'LOGIN' ? 'via-cyan-400/60' : 'via-purple-400/60'
                  }`} />

                  {/* Mode Switcher Tabs */}
                  <div className="flex p-1 bg-black/50 rounded-2xl border border-white/10 mb-6">
                    <button 
                      type="button"
                      onClick={() => setAuthMode('LOGIN')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        authMode === 'LOGIN' 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Sign In
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthMode('REGISTER')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        authMode === 'REGISTER' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Create Account
                    </button>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
                    {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Researcher ID'}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm text-center mb-6">
                    {authMode === 'LOGIN' ? 'Access your research universe and knowledge maps.' : 'Join 140K+ researchers mapping scientific literature.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {authMode === 'REGISTER' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                          <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <input 
                              type="text" 
                              placeholder="Dr. Elena Vance" 
                              required 
                              className="w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all text-sm" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${authMode === 'LOGIN' ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <input 
                          type="email" 
                          placeholder="researcher@lab.org" 
                          required 
                          className={`w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                            authMode === 'LOGIN' 
                              ? 'focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50' 
                              : 'focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50'
                          }`} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">Password</label>
                        {authMode === 'LOGIN' && (
                          <span className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer">Forgot?</span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${authMode === 'LOGIN' ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <input 
                          type="password" 
                          placeholder="••••••••••••" 
                          required 
                          className={`w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                            authMode === 'LOGIN' 
                              ? 'focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50' 
                              : 'focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50'
                          }`} 
                        />
                      </div>
                    </div>

                    {/* Features checklist for register mode */}
                    {authMode === 'REGISTER' && (
                      <div className="text-[11px] text-gray-400 space-y-1 py-1">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Unlimited 3D Knowledge Graph querying</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Autonomous citation analysis and RAG summaries</span>
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className={`w-full text-white rounded-xl py-3.5 mt-4 font-bold flex items-center justify-center gap-2 transition-all text-sm tracking-wide shadow-lg ${
                        authMode === 'LOGIN'
                          ? 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25 hover:shadow-cyan-500/40'
                          : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40'
                      }`}
                    >
                      {authMode === 'LOGIN' ? 'Launch Platform' : 'Initialize Account'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Guest Instant Demo Access */}
                    <button
                      type="button"
                      onClick={onAuthComplete}
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Instant Demo Explorer
                    </button>
                  </form>

                  <div className="mt-6 text-center text-xs text-gray-400 border-t border-white/10 pt-5">
                    {authMode === 'LOGIN' ? "Don't have an account? " : "Already registered? "}
                    <button 
                      onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                      className={`font-semibold ml-1 transition-colors ${
                        authMode === 'LOGIN' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
                      }`}
                    >
                      {authMode === 'LOGIN' ? 'Sign up free' : 'Log in here'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
