import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Database, ChevronDown, BookOpen, Layers, X, Globe, Sparkles } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [isWarping, setIsWarping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setShowAuthOverlay(true);
  };

  const handleToggleMode = (newMode: AuthMode) => {
    if (isWarping || newMode === authMode) return;
    setIsWarping(true);
    
    setTimeout(() => {
      setAuthMode(newMode);
    }, 600);

    setTimeout(() => {
      setIsWarping(false);
    }, 1200);
  };

  const authBgImage = authMode === 'LOGIN' ? "url('/login_bg.jpg')" : "url('/register_bg.jpg')";

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* MAIN LANDING PAGE */}
      <div className={`transition-all duration-700 ${showAuthOverlay ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        
        {/* Landing Hero Section */}
        <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
          
          {/* Landing Background Layer */}
          <div className="absolute inset-0 z-0">
            <motion.div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-center"
              style={{ backgroundImage: "url('/epic_launch_bg.jpg')" }}
              animate={{ scale: [1, 1.05, 1], backgroundPosition: ["50% 50%", "52% 48%", "50% 50%"] }}
              transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712]"></div>
          </div>

          {/* Floating Stars */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div key={i} className="absolute rounded-full bg-cyan-400"
                style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px' }}
                animate={{ y: [0, -40, 0], opacity: [0.1, 0.8, 0.1] }}
                transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
              />
            ))}
          </div>

          {/* Navbar */}
          <nav className="relative z-50 w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-extrabold text-xl tracking-wide">ResearchGraph</span>
            </div>
            
            {/* Login / Auth Buttons on top */}
            <div className="flex items-center gap-4">
              <button onClick={() => openAuth('LOGIN')} className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden md:block">
                Log in
              </button>
              <button onClick={() => openAuth('REGISTER')} className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                Get Started
              </button>
            </div>
          </nav>

          {/* Centered Hero Content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-8 flex-1 flex flex-col items-center justify-center text-center pt-10 pb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Live Semantic Engine</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] leading-[1.1] mb-6">
              Stop Searching.<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">Start Connecting.</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl leading-relaxed drop-shadow-md mb-10">
              Enter a research question. Our AI instantly reads millions of academic papers, finds the hidden patterns, and builds a stunning 3D interactive knowledge map for you.
            </p>
            
            {/* Giant Live Preview Widget */}
            <div className="w-full max-w-4xl h-[400px] relative bg-[#060B14]/60 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.15)] group cursor-pointer" onClick={() => openAuth('REGISTER')}>
               
               <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-14 bg-black/80 border border-cyan-500/30 rounded-2xl flex items-center px-6 z-30 shadow-2xl">
                 <Search className="w-6 h-6 text-cyan-400 mr-4" />
                 <motion.div className="overflow-hidden flex" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", repeatDelay: 5 }}>
                   <span className="text-gray-200 text-lg font-mono whitespace-nowrap">
                     "What are the latest breakthroughs in LLM architectures?"
                   </span>
                 </motion.div>
                 <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-[3px] h-6 bg-cyan-400 ml-1" />
               </div>

               {/* Orbital Graph Animation (Massive Scale) */}
               <div className="absolute inset-0 pt-20 flex items-center justify-center z-10 overflow-hidden">
                  
                  {/* Orbit Rings */}
                  <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500/30 border-dashed"></div>
                  <div className="absolute w-[350px] h-[350px] rounded-full border border-blue-500/30 border-dashed"></div>
                  <div className="absolute w-[500px] h-[500px] rounded-full border border-emerald-500/30 border-dashed"></div>

                  {/* Central Node */}
                  <motion.div animate={{ scale: [1, 1.15, 1], filter: ["drop-shadow(0 0 20px #22d3ee)", "drop-shadow(0 0 50px #22d3ee)", "drop-shadow(0 0 20px #22d3ee)"] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center z-30 absolute bg-black/50 backdrop-blur-md">
                    <BrainCircuit className="w-10 h-10 text-cyan-300" />
                  </motion.div>

                  {/* Orbiting Nodes */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 origin-center">
                     <div className="absolute top-[calc(50%-100px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] bg-black/50 backdrop-blur-sm">
                       <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}><BookOpen className="w-5 h-5 text-purple-300" /></motion.div>
                     </div>
                  </motion.div>
                  
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 origin-center">
                     <div className="absolute top-[calc(50%-175px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] bg-black/50 backdrop-blur-sm">
                       <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}><Layers className="w-5 h-5 text-blue-300" /></motion.div>
                     </div>
                  </motion.div>

                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-0 origin-center">
                     <div className="absolute top-[calc(50%-250px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] bg-black/50 backdrop-blur-sm">
                       <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}><Database className="w-5 h-5 text-emerald-300" /></motion.div>
                     </div>
                  </motion.div>
               </div>
               
               {/* Hover Overlay */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40 flex items-center justify-center backdrop-blur-sm">
                  <div className="px-8 py-4 bg-cyan-500 rounded-full text-black font-bold text-lg flex items-center gap-3">
                     <Sparkles className="w-5 h-5" /> Start Exploring Now
                  </div>
               </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Discover Features</span>
            <ChevronDown className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* ... Rest of the landing page sections ... */}
        <section className="relative z-10 w-full py-32 bg-[#030712] border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How ResearchGraph Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-8 rounded-3xl bg-[#060B14] border border-gray-800"><h3 className="text-2xl font-bold mb-4 text-white">1. Query</h3><p className="text-gray-400">Semantic contextual search.</p></div>
              <div className="p-8 rounded-3xl bg-[#060B14] border border-gray-800"><h3 className="text-2xl font-bold mb-4 text-white">2. Visualize</h3><p className="text-gray-400">Interactive 3D knowledge map.</p></div>
              <div className="p-8 rounded-3xl bg-[#060B14] border border-gray-800"><h3 className="text-2xl font-bold mb-4 text-white">3. Discover</h3><p className="text-gray-400">AI finds the hidden patterns.</p></div>
            </div>
          </div>
        </section>
      </div>

      {/* FULL SCREEN AUTH OVERLAY (With Warp Transition) */}
      <AnimatePresence>
        {showAuthOverlay && (
          <motion.div 
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          >
            {/* Close Button */}
            <button onClick={() => setShowAuthOverlay(false)} className="absolute top-8 right-8 z-[110] w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-md">
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Dynamic Background Layer with Warp Capability */}
            <div className="absolute inset-0 z-0">
              <motion.div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-center"
                style={{ backgroundImage: authBgImage }}
                animate={isWarping ? {
                  scale: [1, 5], filter: ["brightness(1) blur(0px)", "brightness(3) blur(20px)"], opacity: [1, 0]
                } : {
                  scale: [1, 1.05, 1], filter: "brightness(1) blur(0px)", opacity: 1, backgroundPosition: ["50% 50%", "52% 48%", "50% 50%"]
                }}
                transition={isWarping ? { duration: 0.6, ease: "easeIn" } : { duration: 30, repeat: Infinity, ease: "easeInOut" }}
                key={authMode + "-bg"}
              />
              <AnimatePresence>
                {isWarping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 bg-cyan-200 z-10 mix-blend-overlay" />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/40 z-0"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-black/40 to-[#030712]/50 z-0"></div>
            </div>

            {/* Warp Stars */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div key={`star-${i}`} className="absolute rounded-full bg-white" style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%' }}
                  animate={isWarping ? { scale: [1, 30], x: (Math.random() - 0.5) * 1500, y: (Math.random() - 0.5) * 1500, opacity: 0 } : { opacity: Math.random() * 0.5 + 0.1 }}
                  transition={isWarping ? { duration: 0.6 } : {}}
                />
              ))}
            </div>

            {/* Centered Auth Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: isWarping ? 0 : 1, scale: isWarping ? 0.9 : 1, y: isWarping ? -50 : 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-20 w-full max-w-[440px] bg-[#060B14]/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
            >
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[50px] animate-pulse ${authMode === 'LOGIN' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}></div>
              <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[50px] animate-pulse ${authMode === 'LOGIN' ? 'bg-cyan-500/20' : 'bg-yellow-500/20'}`}></div>

              <div className="relative z-10">
                <div className="flex justify-center mb-8">
                   <div className="w-14 h-14 rounded-2xl border border-cyan-400/50 flex items-center justify-center bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                     <Network className="w-8 h-8 text-cyan-400" />
                   </div>
                </div>

                <h2 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
                  {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-sm text-center mb-10">
                  {authMode === 'LOGIN' ? 'Login to continue your research journey.' : 'Join the universe of academic knowledge.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {authMode === 'REGISTER' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative group overflow-hidden">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                        <input type="text" placeholder="Full Name" required className="w-full bg-[#030712]/80 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input type="email" placeholder="Email Address" required className="w-full bg-[#030712]/80 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input type="password" placeholder="Password" required className="w-full bg-[#030712]/80 border border-gray-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
                  </div>

                  <button type="submit" className={`w-full relative group overflow-hidden rounded-xl p-[1px] mt-6 block shadow-[0_0_25px_rgba(34,211,238,0.2)]`}>
                    <span className={`absolute inset-0 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 ${authMode === 'LOGIN' ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' : 'bg-gradient-to-r from-orange-400 via-red-500 to-purple-500'}`}></span>
                    <div className="relative flex items-center justify-center gap-2 bg-[#060B14] group-hover:bg-transparent rounded-xl py-4 px-4 transition-all duration-300">
                      <span className="font-bold text-white tracking-wide text-sm">
                        {authMode === 'LOGIN' ? 'Launch Platform' : 'Start Researching'}
                      </span>
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-gray-400">
                  {authMode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => handleToggleMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold ml-1 relative"
                  >
                    {authMode === 'LOGIN' ? 'Sign up' : 'Login'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
