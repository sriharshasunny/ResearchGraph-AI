import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Database, BookOpen, Layers, Sparkles, ArrowLeft } from 'lucide-react';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [isTraversing, setIsTraversing] = useState(false);

  // Scroll Parallax logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  
  const spaceScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const spaceY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 40, damping: 15 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 40, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX - window.innerWidth / 2);
    mouseY.set(clientY - window.innerHeight / 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  const triggerTraversal = (destination: PageState, mode?: AuthMode) => {
    if (isTraversing) return;
    setIsTraversing(true);
    setTimeout(() => {
      setPageState(destination);
      if (mode) setAuthMode(mode);
    }, 400);
    setTimeout(() => {
      setIsTraversing(false);
    }, 800);
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 fixed inset-0"
      onMouseMove={handleMouseMove}
    >
      
      {/* --- MASTER BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#030712]">
        
        {/* Layer 1: Landing Background */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-center"
          style={{ backgroundImage: "url('/epic_launch_bg.jpg')", scale: spaceScale, y: spaceY }}
          initial={{ opacity: 1 }}
          animate={{ opacity: pageState === 'LANDING' ? 1 : 0 }}
          transition={{ opacity: { duration: 1.2, ease: "easeInOut" } }}
        />

        {/* Layer 2: Login Background */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-center"
          style={{ backgroundImage: "url('/login_bg.jpg')", scale: spaceScale, y: spaceY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: (pageState === 'AUTH' && authMode === 'LOGIN') ? 1 : 0 }}
          transition={{ opacity: { duration: 1.2, ease: "easeInOut" } }}
        />

        {/* Layer 3: Register Background */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat origin-center"
          style={{ backgroundImage: "url('/register_bg.jpg')", scale: spaceScale, y: spaceY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: (pageState === 'AUTH' && authMode === 'REGISTER') ? 1 : 0 }}
          transition={{ opacity: { duration: 1.2, ease: "easeInOut" } }}
        />

        {/* Dynamic Stars */}
        <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ scale: spaceScale, y: spaceY }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div key={`ambient-${i}`} className="absolute rounded-full bg-cyan-200"
              style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', width: Math.random() * 2 + 1 + 'px', height: Math.random() * 2 + 1 + 'px' }}
              animate={{ opacity: [0.1, 0.8, 0.1] }}
              transition={{ duration: Math.random() * 5 + 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
            />
          ))}
        </motion.div>
        
        {/* Gradients */}
        <div className={`absolute inset-0 transition-colors duration-1000 ease-in-out z-0 ${pageState === 'LANDING' ? 'bg-black/50' : 'bg-transparent'}`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-1000 ease-in-out z-0 ${pageState === 'LANDING' ? 'from-[#030712]/90 via-black/30 to-[#030712] opacity-100' : 'from-[#030712]/20 via-transparent to-[#030712]/20 opacity-100'}`}></div>
      </div>

      {/* --- MOUSE TRACKING GLOW (The true premium feel) --- */}
      <motion.div 
        className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] z-10"
        style={{
          x: useTransform(smoothMouseX, (val) => val + window.innerWidth / 2 - 300),
          y: useTransform(smoothMouseY, (val) => val + window.innerHeight / 2 - 300),
        }}
      />

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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full flex flex-col items-center pb-40"
            >
              {/* Navbar */}
              <nav className="w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto relative z-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl shadow-lg">
                    <Network className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">ResearchGraph</span>
                </div>
                <div className="flex items-center gap-6">
                  <button onClick={() => triggerTraversal('AUTH', 'LOGIN')} className="text-sm font-bold text-gray-400 hover:text-white transition-colors hidden md:block">
                    Log in
                  </button>
                  <button onClick={() => triggerTraversal('AUTH', 'REGISTER')} className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all backdrop-blur-md shadow-xl hover:shadow-cyan-500/20">
                    Get Started
                  </button>
                </div>
              </nav>

              {/* Centered Hero Content */}
              <motion.div 
                style={{ y: contentY }} 
                className="w-full max-w-5xl mx-auto px-8 flex flex-col items-center text-center pt-28 pb-32 relative z-20"
              >
                
                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-2xl relative overflow-hidden group">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]"></span>
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] relative z-10">Neural Engine v2.0</span>
                </div>
                
                <h1 className="text-6xl md:text-[7rem] font-extrabold tracking-tighter drop-shadow-2xl leading-[1.05] mb-8">
                  Stop Searching.<br/>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x inline-block pb-2">
                    Start Connecting.
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-400 max-w-3xl leading-relaxed mb-16 font-medium">
                  Enter a research question. Our AI instantly reads millions of academic papers, finds the hidden patterns, and builds a stunning 3D interactive knowledge map for you.
                </p>
                
                {/* Elite Floating Search Bar */}
                <div 
                  className="w-full max-w-4xl relative group cursor-pointer"
                  onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                  
                  <div className="relative h-24 bg-[#0a0f1c]/80 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center px-6 md:px-8 shadow-2xl group-hover:border-white/20 transition-all">
                     
                     <Search className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 transition-colors mr-6 flex-shrink-0" />
                     
                     <div className="flex-1 text-left">
                       <span className="text-gray-500 text-xl md:text-2xl font-mono">
                         <span className="text-gray-200">"Latest breakthroughs in LLMs"</span>
                         <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-[3px] h-6 bg-cyan-400 ml-2 align-middle" />
                       </span>
                     </div>
                     
                     <button className="hidden md:flex ml-8 px-8 py-4 rounded-2xl bg-cyan-500 text-black font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all items-center gap-3 flex-shrink-0 hover:bg-cyan-400">
                       <Sparkles className="w-6 h-6" /> Initialize
                     </button>
                  </div>
                </div>

                {/* Floating Parallax 3D Icons */}
                <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 flex items-center justify-center">
                   
                   {/* Purple Book */}
                   <motion.div 
                     style={{ x: useTransform(smoothMouseX, [-500, 500], [50, -50]), y: useTransform(smoothMouseY, [-500, 500], [50, -50]) }}
                     className="absolute top-[10%] left-[5%] w-24 h-24 rounded-3xl bg-purple-500/5 border border-purple-500/20 backdrop-blur-3xl flex items-center justify-center shadow-2xl"
                   >
                      <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                        <BookOpen className="w-12 h-12 text-purple-400" />
                      </motion.div>
                   </motion.div>
                   
                   {/* Blue Layers */}
                   <motion.div 
                     style={{ x: useTransform(smoothMouseX, [-500, 500], [-30, 30]), y: useTransform(smoothMouseY, [-500, 500], [-30, 30]) }}
                     className="absolute bottom-[20%] right-[2%] w-28 h-28 rounded-3xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-3xl flex items-center justify-center shadow-2xl"
                   >
                      <motion.div animate={{ y: [15, -15, 15] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                        <Layers className="w-14 h-14 text-blue-400" />
                      </motion.div>
                   </motion.div>

                   {/* Emerald Database */}
                   <motion.div 
                     style={{ x: useTransform(smoothMouseX, [-500, 500], [40, -40]), y: useTransform(smoothMouseY, [-500, 500], [-40, 40]) }}
                     className="absolute top-[25%] right-[15%] w-20 h-20 rounded-full bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-3xl flex items-center justify-center shadow-2xl"
                   >
                      <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                        <Database className="w-10 h-10 text-emerald-400" />
                      </motion.div>
                   </motion.div>
                   
                </div>
              </motion.div>

              {/* Ultra-Premium Glassmorphism Feature Cards */}
              <div className="w-full max-w-7xl mt-10 pt-20 relative z-20">
                <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">How ResearchGraph Works</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-8">
                  {[
                    { icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10', title: '1. Semantic Query', desc: 'Type naturally. Our AI understands deep context, moving beyond standard keyword matching.' },
                    { icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10', title: '2. Neural Analysis', desc: 'Instantly ingests and analyzes thousands of papers to find hidden connections and patterns.' },
                    { icon: Network, color: 'text-cyan-400', bg: 'bg-cyan-500/10', title: '3. 3D Exploration', desc: 'Outputs a fully interactive, immersive 3D knowledge map of the research landscape.' }
                  ].map((feat, idx) => (
                    <div key={idx} className="group relative rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl p-10 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-2 cursor-default overflow-hidden">
                      <div className={`absolute -top-20 -right-20 w-40 h-40 ${feat.bg} rounded-full blur-[50px] group-hover:scale-150 transition-transform duration-700`}></div>
                      <feat.icon className={`w-12 h-12 ${feat.color} mb-8`} />
                      <h3 className="text-2xl font-bold mb-4 text-white">{feat.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  ))}
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full min-h-screen flex items-center justify-center relative p-8 z-50"
            >
              {/* BACK TO BASE */}
              <button 
                onClick={() => triggerTraversal('LANDING')} 
                className="absolute top-10 left-10 z-[110] px-6 py-3 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-xl shadow-2xl group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-gray-300 group-hover:text-white transition-colors">Return to Base</span>
              </button>

              {/* AUTH BOX */}
              <div className="w-full max-w-[460px] bg-[#030712]/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden group">
                {/* Glow behind auth box */}
                <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-50 ${authMode === 'LOGIN' ? 'bg-purple-500/30' : 'bg-orange-500/30'} group-hover:opacity-80 transition-opacity duration-700`}></div>
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px] opacity-50 ${authMode === 'LOGIN' ? 'bg-cyan-500/30' : 'bg-yellow-500/30'} group-hover:opacity-80 transition-opacity duration-700`}></div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-10">
                     <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 shadow-2xl backdrop-blur-md">
                       <Network className="w-8 h-8 text-cyan-400" />
                     </div>
                  </div>

                  <h2 className="text-4xl font-extrabold text-center text-white mb-3 tracking-tight">
                    {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-gray-400 text-center mb-10 font-medium">
                    {authMode === 'LOGIN' ? 'Access your research universe.' : 'Join the academic network.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <AnimatePresence mode="wait">
                      {authMode === 'REGISTER' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative overflow-hidden group/input">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
                          <input type="text" placeholder="Full Name" required className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-white/5 transition-all shadow-inner" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative group/input">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
                      <input type="email" placeholder="Email Address" required className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-white/5 transition-all shadow-inner" />
                    </div>

                    <div className="relative group/input">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-cyan-400 transition-colors" />
                      <input type="password" placeholder="Password" required className="w-full bg-[#0a0f1c]/50 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-white/5 transition-all shadow-inner" />
                    </div>

                    <button type="submit" className={`w-full relative group/btn overflow-hidden rounded-2xl p-[1px] mt-10 block shadow-2xl`}>
                      <span className={`absolute inset-0 opacity-100 transition-opacity duration-300 ${authMode === 'LOGIN' ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500' : 'bg-gradient-to-r from-orange-400 via-red-500 to-purple-500'}`}></span>
                      <div className="relative flex items-center justify-center gap-2 bg-[#0a0f1c] group-hover/btn:bg-transparent rounded-2xl py-4 px-4 transition-all duration-300">
                        <span className="font-bold text-white tracking-wide text-lg">
                          {authMode === 'LOGIN' ? 'Launch Platform' : 'Start Researching'}
                        </span>
                        <ArrowRight className="w-5 h-5 text-white group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </form>

                  <div className="mt-10 text-center text-sm font-medium text-gray-400 border-t border-white/10 pt-8">
                    {authMode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      onClick={() => triggerTraversal('AUTH', authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold ml-1 relative group"
                    >
                      {authMode === 'LOGIN' ? 'Warp to Sign up' : 'Warp to Login'}
                      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-cyan-400 group-hover:w-full transition-all"></span>
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
