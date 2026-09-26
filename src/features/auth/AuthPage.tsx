import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Database, BookOpen, Layers, Sparkles, ArrowLeft, Zap, Globe, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';

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
      
      {/* --- MASTER BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#030712]">
        
        {/* Layer 1: Landing Background */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/epic_launch_bg.jpg')" }}
          initial={false}
          animate={{ opacity: pageState === 'LANDING' ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Layer 2: Login Background (Subdued and dimmed for high contrast in Auth mode) */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter"
          style={{ backgroundImage: "url('/login_bg.jpg')" }}
          initial={false}
          animate={{ 
            opacity: (pageState === 'AUTH' && authMode === 'LOGIN') ? 0.22 : 0,
            scale: (pageState === 'AUTH' && authMode === 'LOGIN') ? 1.02 : 1.0
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Layer 3: Register Background (Subdued and dimmed for high contrast in Auth mode) */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat filter"
          style={{ backgroundImage: "url('/register_bg.jpg')" }}
          initial={false}
          animate={{ 
            opacity: (pageState === 'AUTH' && authMode === 'REGISTER') ? 0.22 : 0,
            scale: (pageState === 'AUTH' && authMode === 'REGISTER') ? 1.02 : 1.0
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* Dynamic Ambient Stars */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={`ambient-${i}`} className="absolute rounded-full bg-cyan-200"
              style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px' }}
              animate={{ opacity: pageState === 'AUTH' ? [0.05, 0.35, 0.05] : [0.1, 0.6, 0.1] }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
            />
          ))}
        </div>
        
        {/* Gradients & Deep Scrim: Dull background in Auth mode so UI & 3D objects pop */}
        <div className={`absolute inset-0 transition-colors duration-700 ease-in-out z-0 ${
          pageState === 'LANDING' 
            ? 'bg-black/50' 
            : 'bg-[#030712]/85'
        }`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-700 ease-in-out z-0 ${
          pageState === 'LANDING' 
            ? 'from-[#030712]/90 via-black/30 to-[#030712] opacity-100' 
            : 'from-[#030712] via-[#030712]/80 to-[#030712] opacity-100'
        }`}></div>
        
        {/* Soft Radial Vignette for Auth mode */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 z-0 ${
          pageState === 'AUTH' 
            ? 'opacity-100 bg-[radial-gradient(circle_at_center,rgba(3,7,18,0.4)_0%,#030712_90%)]' 
            : 'opacity-0'
        }`}></div>
      </div>

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
              <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto relative z-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl shadow-lg">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="font-bold text-xl tracking-wide text-gray-200">ResearchGraph</span>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => triggerTraversal('AUTH', 'LOGIN')} className="text-sm font-bold text-gray-400 hover:text-white transition-colors hidden md:block">
                    Log in
                  </button>
                  <button onClick={() => triggerTraversal('AUTH', 'REGISTER')} className="px-6 py-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors shadow-lg">
                    Get Started
                  </button>
                </div>
              </nav>

              {/* Centered Hero Content */}
              <div className="w-full max-w-5xl mx-auto px-8 flex flex-col items-center text-center pt-24 pb-32 relative z-20">
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">ResearchGraph AI v2.0</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
                >
                  Stop Searching.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Start Connecting.
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-12"
                >
                  Enter a research question. Our AI instantly reads millions of academic papers, finds the hidden patterns, and builds a 3D interactive knowledge map.
                </motion.p>
                
                {/* Clean Floating Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="w-full max-w-3xl relative cursor-text group"
                  onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                >
                  <div className="relative h-20 bg-[#0a0f1c]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center px-6 shadow-xl hover:border-cyan-500/50 transition-colors">
                     <Search className="w-6 h-6 text-cyan-500 mr-4 flex-shrink-0" />
                     <div className="flex-1 text-left overflow-hidden">
                       <span className="text-gray-300 text-lg md:text-xl font-mono whitespace-nowrap">
                         "Latest breakthroughs in LLMs"
                       </span>
                       <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-[2px] h-5 bg-cyan-400 ml-1 align-middle" />
                     </div>
                     <button className="hidden md:flex ml-4 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors items-center gap-2">
                       <Sparkles className="w-4 h-4" /> Initialize
                     </button>
                  </div>
                </motion.div>

                {/* Minimal Floating Badges */}
                <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 flex items-center justify-center">
                   <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] left-[10%] w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-purple-400" />
                   </motion.div>
                   <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[20%] right-[10%] w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                      <Layers className="w-10 h-10 text-blue-400" />
                   </motion.div>
                   <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[25%] right-[15%] w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center">
                      <Database className="w-6 h-6 text-emerald-400" />
                   </motion.div>
                </div>
              </div>

              {/* Core Features - Scroll Animated */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-6xl mt-10 pt-10"
              >
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-200">How ResearchGraph Works</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
                  {[
                    { icon: Search, color: 'text-blue-400', title: '1. Semantic Query', desc: 'Our AI understands deep context, moving beyond standard keyword matching to find true relevance.' },
                    { icon: BrainCircuit, color: 'text-purple-400', title: '2. Neural Analysis', desc: 'Instantly ingests thousands of papers to extract key findings and hidden connections.' },
                    { icon: Network, color: 'text-cyan-400', title: '3. 3D Exploration', desc: 'Outputs a fully interactive, immersive 3D map of the landscape to navigate knowledge visually.' }
                  ].map((feat, idx) => (
                    <div key={idx} className="rounded-2xl bg-[#0a0f1c]/60 border border-white/5 p-8 text-left hover:border-white/10 transition-colors">
                      <feat.icon className={`w-10 h-10 ${feat.color} mb-6`} />
                      <h3 className="text-xl font-bold mb-3 text-white">{feat.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Deep Dive Section with Real WebGL 3D Visualization */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-6xl mt-32 pt-10 border-t border-white/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 px-8 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-200">Beyond traditional search engines.</h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                      Traditional academic search gives you a list of links. ResearchGraph gives you the actual answers, mapped out in a visual database that lets you trace citations, track methodologies, and discover breakthroughs.
                    </p>
                    <ul className="space-y-4">
                      {[
                        { icon: Zap, text: "Lightning-fast RAG generation" },
                        { icon: Globe, text: "Global database of 200M+ papers" },
                        { icon: Shield, text: "Unbiased, hallucination-free citations" }
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
                  
                  {/* REAL 3D WEBGL GRAPH VISUALIZER */}
                  <div className="relative h-96 rounded-3xl bg-[#0a0f1c]/80 border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                     <ThreeNeuralCore className="w-full h-full" theme="cyan" interactive={true} />
                     <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-xs font-mono text-gray-300 pointer-events-none">
                       <span className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                         Real-Time 3D Knowledge Topology
                       </span>
                       <span className="text-cyan-400 font-semibold">WebGL 60FPS</span>
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
                className="w-full max-w-4xl mx-auto mt-32 text-center px-8"
              >
                <h2 className="text-4xl font-bold mb-8">Ready to accelerate your research?</h2>
                <button 
                  onClick={() => triggerTraversal('AUTH', 'REGISTER')} 
                  className="px-8 py-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-3 mx-auto"
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
                      authMode === 'LOGIN' ? 'bg-cyan-500/15' : 'bg-purple-500/15'
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
