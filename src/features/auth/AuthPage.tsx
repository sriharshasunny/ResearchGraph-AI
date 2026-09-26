import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Database, BookOpen, Layers, Sparkles, ArrowLeft } from 'lucide-react';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [isTraversing, setIsTraversing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  const triggerTraversal = (destination: PageState, mode?: AuthMode) => {
    if (isTraversing) return;
    setIsTraversing(true);
    
    // Halfway through the space travel, switch the actual content and background
    setTimeout(() => {
      setPageState(destination);
      if (mode) setAuthMode(mode);
    }, 700);

    // End traversal
    setTimeout(() => {
      setIsTraversing(false);
    }, 1400);
  };

  // Determine which background to show based on the current logical state
  const bgImage = pageState === 'LANDING' 
    ? "url('/epic_launch_bg.jpg')" 
    : (authMode === 'LOGIN' ? "url('/login_bg.jpg')" : "url('/register_bg.jpg')");

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 fixed inset-0">
      
      {/* --- MASTER BACKGROUND & SPACE TRAVEL EFFECTS --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#030712]">
        
        {/* Dynamic Background Image */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-center"
          style={{ backgroundImage: bgImage }}
          animate={isTraversing ? {
            scale: [1, 4],
            filter: ["brightness(1) blur(0px)", "brightness(4) blur(30px)"],
            opacity: [1, 0.5]
          } : {
            scale: [1, 1.05, 1],
            filter: "brightness(1) blur(0px)",
            opacity: 1,
            backgroundPosition: ["50% 50%", "51% 49%", "50% 50%"]
          }}
          transition={isTraversing ? { duration: 0.7, ease: "easeIn" } : { duration: 40, repeat: Infinity, ease: "easeInOut" }}
          key={pageState + authMode + "-bg"} // Force re-render to capture entrance
        />

        {/* Hyperdrive Starfield Effect (Only visible during traversal) */}
        <AnimatePresence>
          {isTraversing && (
            <motion.div 
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 20, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              {/* Warp Lines */}
              {Array.from({ length: 80 }).map((_, i) => (
                <div 
                  key={`warp-${i}`} 
                  className="absolute bg-cyan-200/80 shadow-[0_0_10px_#fff]" 
                  style={{ 
                    width: `${Math.random() * 100 + 50}px`, 
                    height: '2px', 
                    transform: `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 300 + 100}px)` 
                  }} 
                />
              ))}
              <div className="absolute inset-0 bg-cyan-400/20 mix-blend-overlay"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Normal Ambient Stars */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div key={`ambient-${i}`} className="absolute rounded-full bg-cyan-200"
              style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px' }}
              animate={{ opacity: [0.1, 0.8, 0.1] }}
              transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
            />
          ))}
        </div>
        
        {/* Darkening Gradients */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712] z-0"></div>
      </div>

      {/* --- PAGE CONTENT CONTAINER --- */}
      <div className="relative z-20 w-full h-full overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {/* ==================================================== */}
          {/*                   LANDING PAGE                       */}
          {/* ==================================================== */}
          {pageState === 'LANDING' && (
            <motion.div 
              key="landing-page"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }} // Fly PAST the camera!
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="w-full flex flex-col items-center pb-32"
            >
              {/* Navbar */}
              <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-black/40 backdrop-blur-md">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="font-extrabold text-xl tracking-wide">ResearchGraph</span>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => triggerTraversal('AUTH', 'LOGIN')} className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden md:block">
                    Log in
                  </button>
                  <button onClick={() => triggerTraversal('AUTH', 'REGISTER')} className="px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    Get Started
                  </button>
                </div>
              </nav>

              {/* Centered Hero Content */}
              <div className="w-full max-w-5xl mx-auto px-8 flex flex-col items-center text-center pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md mb-8">
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
                <div 
                  className="w-full max-w-4xl h-[400px] relative bg-[#060B14]/60 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.15)] group cursor-pointer hover:border-cyan-400/60 transition-colors"
                  onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                >
                   <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-14 bg-black/80 border border-cyan-500/30 rounded-2xl flex items-center px-6 z-30 shadow-2xl">
                     <Search className="w-6 h-6 text-cyan-400 mr-4" />
                     <motion.div className="overflow-hidden flex" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", repeatDelay: 5 }}>
                       <span className="text-gray-200 text-lg font-mono whitespace-nowrap">
                         "What are the latest breakthroughs in LLM architectures?"
                       </span>
                     </motion.div>
                     <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-[3px] h-6 bg-cyan-400 ml-1" />
                   </div>

                   {/* Orbital Graph Animation */}
                   <div className="absolute inset-0 pt-20 flex items-center justify-center z-10 overflow-hidden">
                      <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500/30 border-dashed"></div>
                      <div className="absolute w-[350px] h-[350px] rounded-full border border-blue-500/30 border-dashed"></div>
                      <div className="absolute w-[500px] h-[500px] rounded-full border border-emerald-500/30 border-dashed"></div>

                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center z-30 absolute bg-black/50 backdrop-blur-md">
                        <BrainCircuit className="w-10 h-10 text-cyan-300" />
                      </motion.div>

                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 origin-center">
                         <div className="absolute top-[calc(50%-100px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center bg-black/50 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                           <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}><BookOpen className="w-5 h-5 text-purple-300" /></motion.div>
                         </div>
                      </motion.div>
                      
                      <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-0 origin-center">
                         <div className="absolute top-[calc(50%-175px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center bg-black/50 backdrop-blur-sm shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                           <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}><Layers className="w-5 h-5 text-blue-300" /></motion.div>
                         </div>
                      </motion.div>

                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-0 origin-center">
                         <div className="absolute top-[calc(50%-250px)] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center bg-black/50 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                           <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}><Database className="w-5 h-5 text-emerald-300" /></motion.div>
                         </div>
                      </motion.div>
                   </div>
                   
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40 flex items-center justify-center backdrop-blur-sm">
                      <div className="px-8 py-4 bg-cyan-500 rounded-full text-black font-bold text-lg flex items-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                         <Sparkles className="w-5 h-5" /> Travel to Registration
                      </div>
                   </div>
                </div>

                {/* Additional Content (How it works) */}
                <div className="w-full max-w-7xl mt-32 border-t border-gray-800/50 pt-20">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How ResearchGraph Works</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-[#060B14]/80 border border-gray-800 backdrop-blur-md">
                      <Search className="w-10 h-10 text-blue-400 mb-6" />
                      <h3 className="text-2xl font-bold mb-4">1. Query</h3>
                      <p className="text-gray-400">Semantic contextual search beyond keywords.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-[#060B14]/80 border border-gray-800 backdrop-blur-md">
                      <Network className="w-10 h-10 text-purple-400 mb-6" />
                      <h3 className="text-2xl font-bold mb-4">2. Visualize</h3>
                      <p className="text-gray-400">Interactive 3D knowledge map generation.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-[#060B14]/80 border border-gray-800 backdrop-blur-md">
                      <BrainCircuit className="w-10 h-10 text-emerald-400 mb-6" />
                      <h3 className="text-2xl font-bold mb-4">3. Discover</h3>
                      <p className="text-gray-400">AI finds the hidden patterns automatically.</p>
                    </div>
                  </div>
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
              initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }} // Arriving from deep space
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="w-full min-h-screen flex items-center justify-center relative p-8"
            >
              {/* BACK TO LANDING BUTTON (The "Wrong Button") */}
              <button 
                onClick={() => triggerTraversal('LANDING')} 
                className="absolute top-8 left-8 z-[110] px-6 py-3 rounded-full bg-black/60 border border-white/20 flex items-center gap-3 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-md shadow-2xl group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-gray-300 group-hover:text-white transition-colors">Return to Base</span>
              </button>

              {/* AUTH BOX */}
              <div className="w-full max-w-[460px] bg-[#060B14]/80 backdrop-blur-3xl border border-cyan-500/40 rounded-3xl p-10 shadow-[0_0_100px_rgba(0,0,0,0.9)] relative overflow-hidden">
                <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[60px] animate-pulse ${authMode === 'LOGIN' ? 'bg-purple-500/30' : 'bg-orange-500/30'}`}></div>
                <div className={`absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-[60px] animate-pulse ${authMode === 'LOGIN' ? 'bg-cyan-500/30' : 'bg-yellow-500/30'}`}></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-8">
                     <div className="w-16 h-16 rounded-2xl border border-cyan-400/50 flex items-center justify-center bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                       <Network className="w-8 h-8 text-cyan-400" />
                     </div>
                  </div>

                  <h2 className="text-4xl font-extrabold text-center text-white mb-2 tracking-tight">
                    {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-400 text-center mb-10">
                    {authMode === 'LOGIN' ? 'Access your research universe.' : 'Join the academic network.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="wait">
                      {authMode === 'REGISTER' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative group overflow-hidden">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                          <input type="text" placeholder="Full Name" required className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <input type="email" placeholder="Email Address" required className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner" />
                    </div>

                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <input type="password" placeholder="Password" required className="w-full bg-black/60 border border-gray-700/80 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner" />
                    </div>

                    <button type="submit" className={`w-full relative group overflow-hidden rounded-xl p-[1px] mt-8 block shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-shadow`}>
                      <span className={`absolute inset-0 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${authMode === 'LOGIN' ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' : 'bg-gradient-to-r from-orange-400 via-red-500 to-purple-500'}`}></span>
                      <div className="relative flex items-center justify-center gap-2 bg-[#060B14] group-hover:bg-transparent rounded-xl py-4 px-4 transition-all duration-300">
                        <span className="font-bold text-white tracking-wide text-base">
                          {authMode === 'LOGIN' ? 'Launch Platform' : 'Start Researching'}
                        </span>
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </form>

                  <div className="mt-8 text-center text-sm font-medium text-gray-400 border-t border-gray-800 pt-6">
                    {authMode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      onClick={() => triggerTraversal('AUTH', authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold ml-2 relative"
                    >
                      {authMode === 'LOGIN' ? 'Warp to Sign up' : 'Warp to Login'}
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
