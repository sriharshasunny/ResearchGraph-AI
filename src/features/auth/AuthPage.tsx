import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Sparkles, ArrowLeft, Zap, Globe, Shield, KeyRound, CheckCircle2, Cpu, Share2 } from 'lucide-react';
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full flex flex-col items-center pb-40"
            >
              {/* Navbar */}
              <nav className="w-full px-6 sm:px-10 py-6 flex justify-between items-center max-w-7xl mx-auto relative z-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl shadow-lg">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="font-bold text-xl tracking-wide text-gray-200">ResearchGraph</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <button onClick={() => triggerTraversal('AUTH', 'LOGIN')} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Log in
                  </button>
                  <button onClick={() => triggerTraversal('AUTH', 'REGISTER')} className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-cyan-600/30">
                    Get Started
                  </button>
                </div>
              </nav>

              {/* Top Hero Section: Split Left Copy & Right 3D Visualizer */}
              <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-10 sm:pt-16 pb-24 relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-14">
                
                {/* Left Column: Headline, Subtitle, Search */}
                <div className="flex-1 flex flex-col items-start text-left max-w-2xl">
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">ResearchGraph AI v2.0</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold">3D TOPOLOGY</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
                  >
                    Stop Searching.<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                      Start Connecting.
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg text-gray-400 max-w-xl leading-relaxed mb-8"
                  >
                    Enter any research question. Our neural AI reads millions of academic papers, extracts hidden citations, and constructs an interactive 3D knowledge map in real time.
                  </motion.p>
                  
                  {/* Clean Floating Search Bar */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-xl relative cursor-text group"
                    onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                  >
                    <div className="relative h-16 sm:h-20 bg-[#0a0f1c]/90 backdrop-blur-xl border border-white/15 rounded-2xl flex items-center px-5 shadow-2xl hover:border-cyan-500/50 transition-all">
                       <Search className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mr-3.5 flex-shrink-0" />
                       <div className="flex-1 text-left overflow-hidden">
                         <span className="text-gray-300 text-sm sm:text-lg font-mono whitespace-nowrap">
                           "Breakthroughs in Quantum Neural Networks"
                         </span>
                         <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-[2px] h-4 bg-cyan-400 ml-1 align-middle" />
                       </div>
                       <button className="flex px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all items-center gap-2 shadow-lg shadow-cyan-500/20">
                         <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Explore</span>
                       </button>
                    </div>
                  </motion.div>

                  {/* Highlights under search */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono mt-6"
                  >
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 200M+ Papers</span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Real-time Synthesis</span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> 3D Citation Grid</span>
                  </motion.div>
                </div>

                {/* Right Column: TOP RIGHT 3D VIEW IN HERO */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex-1 w-full max-w-lg lg:max-w-xl flex flex-col items-center justify-center relative"
                >
                  {/* Holographic Glowing Backdrop Aura */}
                  <div className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none -z-10 animate-pulse"></div>
                  <div className="absolute w-64 h-64 rounded-full bg-purple-500/10 blur-[70px] pointer-events-none -z-10 translate-x-12 translate-y-8"></div>
                  
                  {/* 3D Neural Core Holographic Console Viewport */}
                  <div className="relative w-full aspect-square max-w-[420px] sm:max-w-[460px] rounded-3xl bg-[#080d1a]/70 border border-white/15 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col items-center justify-center group hover:border-cyan-500/40 transition-all duration-500">
                    
                    {/* Top Console HUD bar */}
                    <div className="w-full px-5 py-3 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-10 text-xs font-mono">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        <span className="font-bold tracking-wider">3D KNOWLEDGE SPHERE</span>
                      </div>
                      <span className="text-gray-400 text-[11px] font-mono">WEBGL • 60 FPS</span>
                    </div>

                    {/* The Real 3D Three.js WebGL Scene */}
                    <div className="relative w-full flex-1 min-h-[280px] flex items-center justify-center">
                      <ThreeNeuralCore className="w-full h-full" theme="cyan" interactive={true} />
                    </div>

                    {/* Bottom Console HUD Telemetry Strip */}
                    <div className="w-full px-5 py-3 border-t border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-10 text-[11px] font-mono text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-bold">45 NODES</span>
                        <span className="text-gray-600">|</span>
                        <span className="text-purple-400 font-bold">85 SYNAPSES</span>
                      </div>
                      <button 
                        onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                        className="text-cyan-400 hover:text-cyan-300 font-sans font-semibold flex items-center gap-1 hover:underline transition-all"
                      >
                        Explore 3D Map <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Core Features - Scroll Animated */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-6xl mt-4 pt-10"
              >
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-200">How ResearchGraph Works</h2>
                  <p className="text-gray-400 text-sm max-w-lg mx-auto">From raw unstructured paper PDFs to interactive multi-dimensional knowledge graph.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 sm:px-8">
                  {[
                    { icon: Search, color: 'text-blue-400', title: '1. Semantic Query', desc: 'Our AI understands deep context, moving beyond standard keyword matching to find true relevance.' },
                    { icon: BrainCircuit, color: 'text-purple-400', title: '2. Neural Analysis', desc: 'Instantly ingests thousands of papers to extract key findings and hidden connections.' },
                    { icon: Network, color: 'text-cyan-400', title: '3. 3D Exploration', desc: 'Outputs a fully interactive, immersive 3D map of the landscape to navigate knowledge visually.' }
                  ].map((feat, idx) => (
                    <div key={idx} className="rounded-2xl bg-[#0a0f1c]/70 border border-white/10 p-8 text-left hover:border-cyan-500/30 transition-all backdrop-blur-md shadow-xl group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <feat.icon className={`w-6 h-6 ${feat.color}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-white">{feat.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Deep Dive Section */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-6xl mt-28 pt-10 border-t border-white/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 px-6 sm:px-8 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-200">Beyond traditional search engines.</h2>
                    <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
                      Traditional academic search gives you a flat list of links. ResearchGraph gives you the actual answers, mapped out in a visual database that lets you trace citations, track methodologies, and discover breakthroughs.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { icon: Zap, text: "Lightning-fast RAG generation" },
                        { icon: Globe, text: "Global database of 200M+ papers" },
                        { icon: Shield, text: "Unbiased, hallucination-free citations" },
                        { icon: Cpu, text: "Automated synthesis across cross-domain papers" }
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-center gap-4 text-gray-300 font-medium">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-cyan-400" />
                          </div>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Visual Capabilities Showcase */}
                  <div className="rounded-3xl bg-[#080d1a]/80 border border-white/10 p-8 backdrop-blur-xl shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-cyan-400" /> Graph Intelligence
                      </span>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Operational
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-2xl font-bold text-cyan-400 block font-mono">99.4%</span>
                        <span className="text-xs text-gray-400">Citation Accuracy</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-2xl font-bold text-purple-400 block font-mono">3.2x</span>
                        <span className="text-xs text-gray-400">Faster Synthesis</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-2xl font-bold text-sky-400 block font-mono">100%</span>
                        <span className="text-xs text-gray-400">Grounded Citations</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-2xl font-bold text-emerald-400 block font-mono">204M</span>
                        <span className="text-xs text-gray-400">Scientific Papers</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/20 text-xs text-gray-300 leading-relaxed">
                      "ResearchGraph allowed our quantum physics lab to synthesize 1,200 papers in 30 minutes, identifying three unlinked experimental correlations."
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bottom CTA */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl mx-auto mt-28 text-center px-8"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to accelerate your research?</h2>
                <button 
                  onClick={() => triggerTraversal('AUTH', 'REGISTER')} 
                  className="px-8 py-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base sm:text-lg transition-colors shadow-lg shadow-cyan-500/30 flex items-center gap-3 mx-auto"
                >
                  Join the Network <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>

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
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-3 tracking-wider border transition-colors duration-500 ${
                      authMode === 'LOGIN' 
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                        : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-ping ${authMode === 'LOGIN' ? 'bg-cyan-400' : 'bg-purple-400'}`}></span>
                      <span>3D NEURAL UPLINK ACTIVE</span>
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
