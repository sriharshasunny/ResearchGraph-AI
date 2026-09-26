import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Network, BookOpen, Database, BrainCircuit, Users } from 'lucide-react';

type Stage = 'WELCOME' | 'ENGINE_START' | 'SPACE_TRAVEL' | 'KNOWLEDGE_GRAPH' | 'ARRIVAL';

export const LaunchSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('WELCOME');
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (skip) {
      onComplete();
      return;
    }
    const timeline = [
      { s: 'ENGINE_START', t: 4000 },
      { s: 'SPACE_TRAVEL', t: 7000 },
      { s: 'KNOWLEDGE_GRAPH', t: 9500 },
      { s: 'ARRIVAL', t: 13000 },
    ];
    const timeouts = timeline.map(({ s, t }) => setTimeout(() => setStage(s as Stage), t));
    const completeTimeout = setTimeout(() => { onComplete(); }, 17000);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [skip, onComplete]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) setSkip(true);
  }, []);

  const getBackgroundImage = () => {
    switch (stage) {
      case 'WELCOME': return "url('/stage1.jpg')";
      case 'ENGINE_START': return "url('/stage2.jpg')";
      case 'SPACE_TRAVEL': return "url('/stage3.jpg')";
      case 'KNOWLEDGE_GRAPH': return "url('/stage4.jpg')";
      case 'ARRIVAL': return "url('/stage5.jpg')";
      default: return "url('/stage1.jpg')";
    }
  };

  const showUFO = ['WELCOME', 'ENGINE_START', 'SPACE_TRAVEL'].includes(stage);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[100] font-sans flex items-center justify-center text-white">
      
      {/* Background Plate Crossfading with Cinematic Pan/Zoom */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={stage}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1, backgroundPosition: stage === 'SPACE_TRAVEL' ? ["50% 50%", "50% 100%"] : "50% 50%" }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: getBackgroundImage() }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-brightness-75"></div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Stars for Depth Parallax */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-40"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
            }}
            animate={{
              y: stage === 'SPACE_TRAVEL' ? '100vh' : ['0px', '20px', '0px'],
              opacity: stage === 'SPACE_TRAVEL' ? [0, 1, 0] : [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: stage === 'SPACE_TRAVEL' ? Math.random() * 0.5 + 0.2 : Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Real Moving UFO Composition */}
      <AnimatePresence>
        {showUFO && (
          <motion.div
            key="real-ufo"
            className="absolute top-[10%] left-1/2 -translate-x-1/2 z-30 pointer-events-none flex justify-center items-center mix-blend-screen"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ 
              opacity: 1, 
              scale: stage === 'SPACE_TRAVEL' ? 3 : 1, 
              y: stage === 'SPACE_TRAVEL' ? -1500 : (stage === 'ENGINE_START' ? [-5, 5, -5] : [-15, 15, -15]),
              x: stage === 'ENGINE_START' ? [-2, 2, -2] : 0,
              filter: stage === 'ENGINE_START' ? "drop-shadow(0 0 50px rgba(0,209,255,0.8)) brightness(1.5)" : "drop-shadow(0 0 20px rgba(0,209,255,0.4)) brightness(1)"
            }}
            transition={{ 
              y: { repeat: stage === 'ENGINE_START' ? Infinity : (stage === 'SPACE_TRAVEL' ? 0 : Infinity), duration: stage === 'ENGINE_START' ? 0.1 : (stage === 'SPACE_TRAVEL' ? 0.8 : 4), ease: stage === 'SPACE_TRAVEL' ? "easeIn" : "easeInOut" },
              x: { repeat: Infinity, duration: 0.05 },
              scale: { duration: stage === 'SPACE_TRAVEL' ? 0.8 : 1, ease: "easeIn" },
              opacity: { duration: 1 }
            }}
            exit={{ opacity: 0 }}
          >
            <img src="/ufo_ship.jpg" alt="UFO" className="w-[600px] h-auto object-contain max-w-none" />
            
            {/* Added intense flare during engine start */}
            <AnimatePresence>
              {stage === 'ENGINE_START' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [1, 1.5, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="absolute bottom-10 w-[300px] h-[100px] bg-cyan-400 rounded-[100%] blur-[60px] mix-blend-screen"
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="relative z-50 w-full h-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* Stage 1: Welcome */}
          {stage === 'WELCOME' && (
            <motion.div key="stage1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} className="flex flex-col items-center max-w-lg w-full px-6 pt-64">
              <h3 className="text-xl font-light text-brand-textSoft mb-2">Welcome to</h3>
              <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">ResearchGraph AI</h1>
              <p className="text-brand-textMuted mb-12">Preparing your research workspace...</p>
              
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-8">
                <motion.div initial={{ width: "0%" }} animate={{ width: "30%" }} transition={{ duration: 3 }} className="h-full bg-brand-accent shadow-[0_0_10px_#3B82F6]" />
              </div>

              <div className="w-full space-y-4 text-sm font-medium">
                <div className="flex items-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 mr-3" /> Initializing research engines...
                </div>
                <div className="flex items-center text-brand-text">
                  <Loader2 className="w-5 h-5 mr-3 animate-spin text-brand-accent" /> Connecting academic sources...
                </div>
                <div className="flex items-center text-brand-textMuted">
                  <div className="w-5 h-5 mr-3 rounded-full border border-gray-600"></div> Building your knowledge universe...
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage 2: Engine Activation */}
          {stage === 'ENGINE_START' && (
            <motion.div key="stage2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} className="flex flex-col items-center max-w-lg w-full px-6 pt-64">
              <h2 className="text-3xl font-bold text-white mb-8 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Initializing ResearchGraph AI...</h2>
              
              <div className="w-full space-y-4 text-sm font-medium mb-10">
                <div className="flex items-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 mr-3" /> Authenticating user ✓
                </div>
                <div className="flex items-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 mr-3" /> Loading research modules ✓
                </div>
                <div className="flex items-center text-brand-text">
                  <Loader2 className="w-5 h-5 mr-3 animate-spin text-brand-accent" /> Connecting knowledge graph
                </div>
                <div className="flex items-center text-brand-textMuted">
                  <div className="w-5 h-5 mr-3 rounded-full border border-gray-600"></div> Preparing your workspace
                </div>
              </div>

              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: "30%" }} animate={{ width: "65%" }} transition={{ duration: 3 }} className="h-full bg-brand-accent shadow-[0_0_10px_#3B82F6]" />
              </div>
            </motion.div>
          )}

          {/* Stage 3: Space Travel */}
          {stage === 'SPACE_TRAVEL' && (
            <motion.div key="stage3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} className="absolute bottom-20 flex flex-col items-center text-center max-w-2xl px-6">
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Exploring the research universe...</h2>
              <p className="text-brand-textSoft text-lg">Connecting knowledge across papers, authors, datasets and ideas...</p>
            </motion.div>
          )}

          {/* Stage 4: Knowledge Graph Transition */}
          {stage === 'KNOWLEDGE_GRAPH' && (
            <div key="stage4" className="w-full h-full relative flex items-center justify-center">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                 {/* Floating mockup icons */}
                 <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[20%] left-[20%] flex flex-col items-center gap-2">
                   <div className="p-4 bg-brand-surface/40 backdrop-blur-md rounded-2xl border border-brand-accent/30 text-brand-accent shadow-[0_0_20px_rgba(59,130,246,0.3)]"><Database className="w-6 h-6" /></div>
                   <span className="text-xs font-semibold text-white drop-shadow-md">Models</span>
                 </motion.div>
                 <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} className="absolute top-[30%] right-[30%] flex flex-col items-center gap-2">
                   <div className="p-4 bg-brand-surface/40 backdrop-blur-md rounded-2xl border border-pink-500/30 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]"><BookOpen className="w-6 h-6" /></div>
                   <span className="text-xs font-semibold text-white drop-shadow-md">Papers</span>
                 </motion.div>
                 <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4.5, delay: 0.5 }} className="absolute bottom-[40%] left-[30%] flex flex-col items-center gap-2">
                   <div className="p-4 bg-brand-surface/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"><BrainCircuit className="w-6 h-6" /></div>
                   <span className="text-xs font-semibold text-white drop-shadow-md">Algorithms</span>
                 </motion.div>
                 <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 2 }} className="absolute bottom-[30%] right-[25%] flex flex-col items-center gap-2">
                   <div className="p-4 bg-brand-surface/40 backdrop-blur-md rounded-2xl border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]"><Users className="w-6 h-6" /></div>
                   <span className="text-xs font-semibold text-white drop-shadow-md">Authors</span>
                 </motion.div>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.8 }} className="absolute bottom-20 flex flex-col items-center text-center">
                 <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Building your research universe...</h2>
               </motion.div>
            </div>
          )}

          {/* Stage 5: Arrival */}
          {stage === 'ARRIVAL' && (
            <motion.div key="stage5" initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} className="flex flex-col items-center gap-6 mt-[10vh]">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-accent/50 bg-brand-surface/30 backdrop-blur-md text-brand-accent shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <Network className="h-10 w-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                ResearchGraph AI
              </h2>
              <p className="text-xl text-brand-textSoft font-light tracking-wide">
                Your research workspace is ready.
              </p>
              <div className="mt-4 px-8 py-3 rounded-full bg-brand-surface/40 backdrop-blur-md border border-brand-border text-white text-sm font-semibold shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                Welcome Sriharsha
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} onClick={() => setSkip(true)} className="absolute top-8 right-8 px-5 py-2 rounded-full border border-gray-600/40 text-[12px] font-semibold text-gray-400 hover:text-white hover:border-brand-accent hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] uppercase tracking-wider transition-all z-50 backdrop-blur-md">
        Skip Intro
      </motion.button>
    </div>
  );
};
