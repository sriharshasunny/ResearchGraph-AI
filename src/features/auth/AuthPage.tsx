import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Sparkles, ArrowLeft, 
  Zap, Database, Layers, Info, X, ExternalLink, Compass, Award, KeyRound, CheckCircle2
} from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';
import { InteractiveSpaceBackground } from '../../components/InteractiveSpaceBackground';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';
type InfoModalType = 'HOW_IT_WORKS' | 'SOURCES' | 'ABOUT' | null;

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  const triggerTraversal = (destination: PageState, mode?: AuthMode) => {
    setPageState(destination);
    if (mode) setAuthMode(mode);
    setActiveModal(null);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 fixed inset-0">
      
      {/* --- INTERACTIVE 3D SPACE BACKGROUND --- */}
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
              <nav className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[#060a14]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50 shadow-2xl shadow-black/50">
                {/* Brand Logo */}
                <div 
                  className="flex items-center gap-3 cursor-pointer group" 
                  onClick={() => { setActiveModal(null); }}
                >
                  <div className="w-10 h-10 rounded-xl border border-cyan-500/40 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-all">
                    <Network className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                      ResearchGraph <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">AI</span>
                    </span>
                    <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold tracking-wider">
                      v2.0
                    </span>
                  </div>
                </div>
                
                {/* Center Navigation Links: How it works, Sources, Info */}
                <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-xl">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
                  >
                    Overview
                  </button>

                  <button 
                    onClick={() => setActiveModal('HOW_IT_WORKS')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-cyan-300 rounded-full hover:bg-cyan-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    How It Works
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI Pipeline</span>
                  </button>

                  <button 
                    onClick={() => setActiveModal('SOURCES')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-purple-300 rounded-full hover:bg-purple-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Database className="w-3 h-3 text-purple-400" />
                    Data Sources
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">45+ Repos</span>
                  </button>

                  <button 
                    onClick={() => setActiveModal('ABOUT')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-emerald-300 rounded-full hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Info className="w-3 h-3 text-emerald-400" />
                    About Us
                  </button>
                </div>

                {/* Right Action Buttons: Log In & Sign Up */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button 
                    onClick={() => triggerTraversal('AUTH', 'LOGIN')} 
                    className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all px-3.5 sm:px-4 py-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => triggerTraversal('AUTH', 'REGISTER')} 
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/30 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
                  >
                    <span>Sign Up Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Mobile Menu Trigger */}
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </nav>

              {/* Mobile Dropdown Menu */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="lg:hidden w-full bg-[#0a0f1c]/95 border-b border-white/10 px-6 py-4 flex flex-col gap-2 relative z-40 backdrop-blur-2xl"
                  >
                    <button 
                      onClick={() => { setActiveModal(null); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-lg"
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => { setActiveModal('HOW_IT_WORKS'); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-cyan-400" /> How It Works
                    </button>
                    <button 
                      onClick={() => { setActiveModal('SOURCES'); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-purple-300 hover:bg-purple-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Database className="w-4 h-4 text-purple-400" /> Data Sources (45+ Repos)
                    </button>
                    <button 
                      onClick={() => { setActiveModal('ABOUT'); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-emerald-400" /> About ResearchGraph AI
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══════════════ MAIN CONTENT AREA (NO SIDEBAR, FULL BREADTH) ═══════════════ */}
              <div className="flex-1 flex flex-col relative w-full overflow-hidden">

                {/* Hero Showcase Container */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 lg:py-10 flex-1 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-20">
                  
                  {/* ─── LEFT: HERO COPY & CALL TO ACTIONS ─── */}
                  <div className="flex-1 flex flex-col items-start text-left max-w-xl z-30">
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-5 text-xs text-gray-300 font-semibold shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span>Next-Gen Autonomous Scientific Intelligence</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">RAG 3D</span>
                    </motion.div>

                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-5"
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
                      className="text-gray-300/80 text-sm sm:text-base leading-relaxed mb-8 max-w-lg"
                    >
                      RAG-powered research intelligence with 3D knowledge topologies, 45+ multi-source scientific repositories, and multi-LLM synthesis to help you discover, connect, and understand research like never before.
                    </motion.p>

                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-wrap items-center gap-3.5 mb-10"
                    >
                      <button 
                        onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 border border-cyan-400/30 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Explore 3D Graph <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveModal('HOW_IT_WORKS')}
                        className="px-5 py-3 rounded-xl bg-white/5 border border-white/15 text-gray-200 font-semibold text-sm hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm hover:border-cyan-400/30"
                      >
                        <Zap className="w-4 h-4 text-cyan-400" />
                        See How It Works
                      </button>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-4 border-t border-white/10"
                    >
                      {[
                        { value: '200M+', label: 'Research Papers', color: 'text-cyan-400' },
                        { value: '45+', label: 'Data Sources', color: 'text-purple-400' },
                        { value: 'Multi-LLM', label: 'AI Intelligence', color: 'text-emerald-400' },
                        { value: 'Real-time', label: 'Knowledge Graph', color: 'text-sky-400' },
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-2.5 backdrop-blur-sm">
                          <span className={`text-base sm:text-lg font-extrabold ${stat.color} block`}>{stat.value}</span>
                          <span className="text-gray-400 text-[11px] leading-tight block">{stat.label}</span>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* ─── CENTER: 3D KNOWLEDGE SPHERE & ORBITING LABELS ─── */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] lg:w-[480px] lg:h-[480px] flex items-center justify-center flex-shrink-0"
                  >
                    {/* Glowing Auras */}
                    <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute w-60 h-60 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none translate-x-8 translate-y-10"></div>

                    {/* Three.js Interactive Neural Core */}
                    <ThreeNeuralCore className="w-full h-full" theme="cyan" interactive={true} />

                    {/* Orbiting Category Badges */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="absolute top-[4%] left-[34%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-blue-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Authors
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }} className="absolute top-[38%] left-[-4%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Papers
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="absolute bottom-[18%] left-[4%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-orange-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Concepts
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.85 }} className="absolute top-[22%] right-[-6%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-cyan-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Knowledge Graph
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.95 }} className="absolute top-[52%] right-[-10%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-purple-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Datasets
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.05 }} className="absolute bottom-[24%] right-[-4%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-yellow-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> Citations
                      </span>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="absolute bottom-[4%] right-[16%] z-20 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-pink-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Research Trends
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* ─── RIGHT: SCI-FI TELEMETRY & CAPABILITY CARDS ─── */}
                  <div className="hidden xl:flex flex-col gap-3.5 w-[240px] z-30 flex-shrink-0">
                    
                    {/* Research Databases Panel */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.6 }}
                      onClick={() => setActiveModal('SOURCES')}
                      className="rounded-2xl bg-[#0a0f1c]/90 border border-white/10 p-3.5 backdrop-blur-xl hover:border-cyan-500/40 transition-all cursor-pointer group shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Research Databases</h4>
                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['PubMed', 'IEEE', 'Semantic Scholar', 'CrossRef', 'arXiv'].map(db => (
                          <span key={db} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-300 font-medium group-hover:border-cyan-500/20 transition-colors">{db}</span>
                        ))}
                      </div>
                    </motion.div>

                    {/* RAG Pipeline Panel */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.7 }}
                      onClick={() => setActiveModal('HOW_IT_WORKS')}
                      className="rounded-2xl bg-[#0a0f1c]/90 border border-white/10 p-3.5 backdrop-blur-xl hover:border-purple-500/40 transition-all cursor-pointer group shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">RAG Pipeline</h4>
                        <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="flex items-center gap-1 text-[9px]">
                        <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">Retrieve</span>
                        <span className="text-gray-500">→</span>
                        <span className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">Augment</span>
                        <span className="text-gray-500">→</span>
                        <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">Generate</span>
                      </div>
                    </motion.div>

                    {/* Large Language Models Panel */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.8 }}
                      className="rounded-2xl bg-[#0a0f1c]/90 border border-white/10 p-3.5 backdrop-blur-xl shadow-xl"
                    >
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Large Language Models</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {['GPT-4o', 'Claude 3.5', 'Gemini 1.5', 'Llama 3.1', 'Mistral'].map(llm => (
                          <span key={llm} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-300 font-medium">{llm}</span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Live Analytics Panel */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.9 }}
                      className="rounded-2xl bg-[#0a0f1c]/90 border border-white/10 p-3.5 backdrop-blur-xl shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Live Global Index</h4>
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Streaming
                        </span>
                      </div>
                      {/* Mini bar chart */}
                      <div className="flex items-end gap-[3px] h-7 mb-2.5">
                        {[60, 85, 45, 70, 90, 55, 75, 95, 65, 80].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400/80 rounded-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="space-y-1.5 text-[9px]">
                        <div className="flex justify-between"><span className="text-gray-400">Papers Indexed</span><span className="text-cyan-400 font-bold">200M+</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Topology Connections</span><span className="text-purple-400 font-bold">1.2B+</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Concept Entities</span><span className="text-emerald-400 font-bold">45K+</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Research Domains</span><span className="text-sky-400 font-bold">120+</span></div>
                      </div>
                    </motion.div>
                  </div>

                </div>

                {/* ═══════════════ COCKPIT COMMAND BAR (BOTTOM) ═══════════════ */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative z-30 w-full mt-auto"
                >
                  {/* Center Pedestal Badge */}
                  <div className="flex justify-center mb-0">
                    <div className="px-6 py-1.5 rounded-t-xl bg-[#0a0f1c]/95 border border-white/10 border-b-0 backdrop-blur-xl text-center shadow-lg">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] block">ResearchGraph AI</span>
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest">Integrating Global Scientific Knowledge</span>
                    </div>
                  </div>

                  {/* Glass Console Bar */}
                  <div className="w-full bg-[#060a14]/95 backdrop-blur-2xl border-t border-white/10 px-4 sm:px-8 py-3.5 shadow-2xl">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      {/* Multi-Source Retrieval */}
                      <div 
                        onClick={() => setActiveModal('SOURCES')}
                        className="hidden sm:block flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                          Multi-Source Retrieval (45+)
                        </span>
                        <div className="flex gap-1.5">
                          {['arXiv', 'PubMed', 'IEEE', 'CrossRef', 'Semantic Scholar'].map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-300 font-medium hover:border-cyan-500/30 transition-colors">{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Central Search Bar Console */}
                      <div 
                        className="flex-1 w-full max-w-lg cursor-pointer"
                        onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                      >
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1 text-center sm:text-left">Ask a Research Question</span>
                        <div className="relative h-11 bg-[#0a0f1c]/90 border border-white/15 rounded-xl flex items-center px-4 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group">
                          <Search className="w-4 h-4 text-cyan-400 mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-gray-400 text-xs font-mono truncate">
                            E.g., "How do graph neural networks improve drug discovery?"
                          </span>
                          <button className="ml-auto w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20 group-hover:from-cyan-500 group-hover:to-blue-500 transition-all">
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>

                      {/* AI-Powered Insights */}
                      <div 
                        onClick={() => setActiveModal('HOW_IT_WORKS')}
                        className="hidden sm:block flex-shrink-0 text-right cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">AI-Powered Insights</span>
                        <div className="space-y-0.5 text-[9px] text-gray-400">
                          <div className="flex items-center gap-1 justify-end"><BrainCircuit className="w-2.5 h-2.5 text-purple-400" /> Multi-paper synthesis</div>
                          <div className="flex items-center gap-1 justify-end"><Network className="w-2.5 h-2.5 text-cyan-400" /> Cross-domain connections</div>
                          <div className="flex items-center gap-1 justify-end"><Search className="w-2.5 h-2.5 text-emerald-400" /> Citation validation</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>

              </div>

              {/* ═══════════════ INTERACTIVE INFORMATION MODALS ═══════════════ */}
              <AnimatePresence>
                {activeModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
                  >
                    <motion.div 
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 15 }}
                      className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-cyan-500/10 text-left"
                    >
                      {/* Close button */}
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* --- MODAL CONTENT 1: HOW IT WORKS --- */}
                      {activeModal === 'HOW_IT_WORKS' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Zap className="w-4 h-4" /> Autonomous Research Engine
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">How ResearchGraph AI Works</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Traditional search engines return isolated lists of PDFs. ResearchGraph AI ingests millions of papers, builds high-dimensional knowledge graphs, and synthesizes answers using state-of-the-art LLMs.
                          </p>

                          <div className="space-y-4 mb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">1</div>
                              <div>
                                <h3 className="font-bold text-base text-white mb-1">Continuous Multi-Source Ingestion</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Automated pipelines continuously ingest preprints, peer-reviewed journals, and institutional datasets across arXiv, PubMed, IEEE Xplore, CrossRef, and OpenAlex.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">2</div>
                              <div>
                                <h3 className="font-bold text-base text-white mb-1">Graph Neural Embedding & 3D Topology</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Extracts research concepts, authors, citations, datasets, and hypotheses into an interactive 3D knowledge graph where mathematical proximity denotes conceptual relationship.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">3</div>
                              <div>
                                <h3 className="font-bold text-base text-white mb-1">Multi-LLM Synthesis & Hypothesis Generation</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Ensembles of GPT-4o, Claude 3.5, and Gemini synthesize literature reviews, generate novel research hypotheses, and validate claims with exact citation anchors.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Ready to accelerate your research?</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
                            >
                              Get Started Free
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- MODAL CONTENT 2: DATA SOURCES --- */}
                      {activeModal === 'SOURCES' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Database className="w-4 h-4" /> Global Scholarly Catalog
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Connected Research Sources</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Direct, real-time API integrations across the world's most reputable academic repositories, covering 200M+ publications and 1.2B+ citation relationships.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                            {[
                              { name: 'arXiv', count: '13.4M Papers', desc: 'Physics, Mathematics, Computer Science, AI, and Quantitative Biology', tag: 'Open Access', color: 'border-red-500/30 text-red-400' },
                              { name: 'PubMed & NCBI', count: '36.2M Papers', desc: 'Biomedical, Life Sciences, Clinical Trials, Genomics, and Health', tag: 'NIH / Med', color: 'border-blue-500/30 text-blue-400' },
                              { name: 'IEEE Xplore', count: '8.1M Papers', desc: 'Electrical Engineering, Computer Hardware, Telecommunications, Robotics', tag: 'Engineering', color: 'border-sky-500/30 text-sky-400' },
                              { name: 'Semantic Scholar', count: '203M Papers', desc: 'Multi-disciplinary academic research catalog with semantic vector index', tag: 'Multi-Domain', color: 'border-yellow-500/30 text-yellow-400' },
                              { name: 'CrossRef', count: '140M DOIs', desc: 'Universal scientific citation networks, publisher metadata, and DOIs', tag: 'Citations', color: 'border-green-500/30 text-green-400' },
                              { name: 'OpenAlex', count: '250M Entities', desc: 'Global scholarly ontology mapping authors, institutions, and concepts', tag: 'Ontology', color: 'border-purple-500/30 text-purple-400' },
                            ].map((source, idx) => (
                              <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-bold text-white text-sm">{source.name}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-white/5 font-mono ${source.color}`}>{source.tag}</span>
                                </div>
                                <span className="text-cyan-400 font-extrabold text-xs block mb-1">{source.count}</span>
                                <p className="text-[11px] text-gray-400 leading-tight">{source.desc}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Want to connect custom institutional databases?</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30"
                            >
                              Connect Your Sources
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- MODAL CONTENT 3: ABOUT US --- */}
                      {activeModal === 'ABOUT' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Info className="w-4 h-4" /> About ResearchGraph AI
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Pioneering Cognitive Research</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            We are on a mission to democratize scientific discovery by organizing the world's academic literature into an interconnected, multi-dimensional cognitive universe.
                          </p>

                          <div className="space-y-3.5 mb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h3 className="font-bold text-sm text-cyan-300 mb-1 flex items-center gap-2">
                                <Compass className="w-4 h-4 text-cyan-400" />
                                Breaking Academic Silos
                              </h3>
                              <p className="text-xs text-gray-300 leading-relaxed">
                                Researchers often spend months reading disconnected papers within their own domain. ResearchGraph AI bridges the gaps between neuroscience, machine learning, physics, and genomics to uncover interdisciplinary breakthroughs.
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h3 className="font-bold text-sm text-purple-300 mb-1 flex items-center gap-2">
                                <Award className="w-4 h-4 text-purple-400" />
                                Built for Academics, Labs & Innovators
                              </h3>
                              <p className="text-xs text-gray-300 leading-relaxed">
                                Trusted by over 140,000+ researchers, PhD candidates, biotech labs, and research institutions across 120+ countries to supercharge literature reviews and patent analysis.
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h3 className="font-bold text-sm text-emerald-300 mb-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                Verifiable Citations, Zero Hallucinations
                              </h3>
                              <p className="text-xs text-gray-300 leading-relaxed">
                                Every generated summary and hypothesis is grounded in verbatim citations, DOIs, and direct links to peer-reviewed source literature.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Join the scientific revolution today.</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/30"
                            >
                              Join Free Today
                            </button>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

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
