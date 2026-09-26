import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network } from 'lucide-react';

type Stage = 'AUTH_SUCCESS' | 'UFO_APPEAR' | 'ENGINE_START' | 'LAUNCH' | 'SPACE_TRAVEL' | 'KNOWLEDGE_GRAPH' | 'ARRIVAL';

export const LaunchSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('AUTH_SUCCESS');
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (skip) {
      onComplete();
      return;
    }
    const timeline = [
      { s: 'UFO_APPEAR', t: 1500 },
      { s: 'ENGINE_START', t: 2800 },
      { s: 'LAUNCH', t: 4500 },
      { s: 'SPACE_TRAVEL', t: 5200 },
      { s: 'KNOWLEDGE_GRAPH', t: 7500 },
      { s: 'ARRIVAL', t: 9500 },
    ];
    const timeouts = timeline.map(({ s, t }) => setTimeout(() => setStage(s as Stage), t));
    const completeTimeout = setTimeout(() => { onComplete(); }, 11000);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [skip, onComplete]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) setSkip(true);
  }, []);

  const stars = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    size: Math.random() * 2.5 + 0.5 + 'px',
    color: Math.random() > 0.8 ? '#00D1FF' : '#ffffff',
  }));

  const isSpace = ['LAUNCH', 'SPACE_TRAVEL', 'KNOWLEDGE_GRAPH', 'ARRIVAL'].includes(stage);
  
  return (
    <div className="fixed inset-0 bg-[#02050e] overflow-hidden z-[100] font-sans flex items-center justify-center text-white">
      <AnimatePresence>
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1, scale: isSpace ? 2 : 1 }} transition={{ duration: 5, ease: 'easeInOut' }}>
          {stars.map((star) => (
            <motion.div
              key={star.id} className="absolute rounded-full"
              style={{ top: star.top, left: star.left, width: star.size, height: star.size, backgroundColor: star.color, opacity: 0.8 }}
              animate={{ opacity: isSpace ? [0, 1, 0] : 0.8, y: isSpace ? '120vh' : 0 }}
              transition={{ duration: isSpace ? Math.random() * 0.8 + 0.4 : 0, repeat: isSpace ? Infinity : 0, ease: "linear" }}
            />
          ))}
          {isSpace && (
             <>
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 2 }} className="absolute top-1/4 left-1/4 w-[50vh] h-[50vh] rounded-full bg-cyan-500/20 blur-[100px]" />
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 3 }} className="absolute bottom-1/4 right-1/4 w-[60vh] h-[60vh] rounded-full bg-purple-500/20 blur-[120px]" />
             </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 text-center z-50 w-full max-w-2xl px-4">
        <AnimatePresence mode="wait">
          {stage === 'AUTH_SUCCESS' && (
            <motion.h2 key="auth" initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} className="text-3xl font-light tracking-[0.2em] text-gray-400 uppercase">
              Welcome back
            </motion.h2>
          )}
          {stage === 'UFO_APPEAR' && (
            <motion.p key="prepare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xl font-light tracking-wide text-gray-500">
              Preparing your research workspace...
            </motion.p>
          )}
          {stage === 'ENGINE_START' && (
            <motion.p key="init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xl font-light tracking-wide text-cyan-400 animate-pulse">
              Activating Research Engine...
            </motion.p>
          )}
          {stage === 'SPACE_TRAVEL' && (
            <motion.p key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xl font-light tracking-wide text-gray-400">
              Navigating the knowledge universe...
            </motion.p>
          )}
          {stage === 'ARRIVAL' && (
            <motion.div key="arrival" initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeOut" }} className="flex flex-col items-center gap-6 mt-[10vh]">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 text-white shadow-[0_0_40px_rgba(0,209,255,0.5)]">
                <Network className="h-10 w-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                ResearchGraph AI
              </h2>
              <p className="text-xl text-cyan-400 font-light tracking-widest uppercase">
                Your workspace is ready
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {['UFO_APPEAR', 'ENGINE_START', 'LAUNCH'].includes(stage) && (
          <motion.div
            key="ufo" className="absolute top-1/2 left-1/2 -ml-[72px] -mt-[40px] w-[144px] h-[80px] flex items-center justify-center z-40"
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: stage === 'ENGINE_START' ? [0, -8, 8, 0] : 0, rotate: stage === 'ENGINE_START' ? [0, 2, -2, 0] : 0 }}
            exit={{ y: -1500, scale: 0.3, opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }}
            transition={{ y: { repeat: stage === 'ENGINE_START' ? Infinity : 0, duration: 0.15 }, rotate: { repeat: stage === 'ENGINE_START' ? Infinity : 0, duration: 0.15 }, default: { duration: 1.5, ease: 'easeOut' } }}
          >
            <div className="relative w-36 h-10 bg-gradient-to-b from-[#2a3040] to-[#121620] rounded-[100%] border border-slate-500/50 shadow-[0_20px_50px_rgba(0,209,255,0.2)] flex justify-center items-center overflow-visible">
              <div className="absolute top-1 w-24 h-1.5 bg-white/20 rounded-full blur-[2px]"></div>
              <div className="absolute -top-7 w-16 h-10 bg-gradient-to-b from-cyan-400/30 to-blue-900/80 rounded-t-[100%] border border-cyan-300/40 backdrop-blur-xl shadow-[inset_0_0_15px_rgba(0,209,255,0.4)] flex justify-center">
                 <div className="mt-4 w-4 h-2 bg-cyan-400/50 rounded-full blur-[2px]"></div>
              </div>
              <div className="absolute w-[104%] h-full rounded-[100%] border-t border-b border-cyan-400/20 flex justify-around items-center px-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]"></div>
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_12px_#22d3ee]" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_#60a5fa]" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <div className="absolute w-8 h-8 rounded-full bg-[#121620] border border-slate-600/50 flex items-center justify-center shadow-[inset_0_4px_4px_rgba(0,0,0,0.5)]">
                 <motion.div className="w-4 h-4 bg-cyan-300 rounded-full blur-[1px]" animate={{ opacity: stage === 'ENGINE_START' ? [0.6, 1, 0.6] : 0.4, boxShadow: stage === 'ENGINE_START' ? ['0 0 10px #22d3ee', '0 0 30px #22d3ee', '0 0 10px #22d3ee'] : '0 0 5px #22d3ee' }} transition={{ repeat: Infinity, duration: 0.3 }} />
              </div>
              <motion.div className="absolute -bottom-10 w-24 h-16 rounded-[100%] bg-gradient-to-b from-cyan-400 to-transparent blur-xl" animate={{ opacity: stage === 'ENGINE_START' ? [0.3, 0.9, 0.3] : 0, scale: stage === 'ENGINE_START' ? [0.8, 1.4, 0.8] : 0, y: stage === 'ENGINE_START' ? [0, 5, 0] : 0 }} transition={{ repeat: Infinity, duration: 0.2 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(stage === 'KNOWLEDGE_GRAPH' || stage === 'ARRIVAL') && (
          <motion.div className="absolute inset-0 z-30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}>
            <svg width="100%" height="100%" className="absolute inset-0 opacity-40">
              <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut" }} d="M 20% 30% L 40% 50% L 70% 40% L 85% 60%" stroke="#00D1FF" strokeWidth="1.5" fill="none" />
              <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }} d="M 40% 50% L 50% 80% L 20% 70%" stroke="#7A00FF" strokeWidth="1" fill="none" />
            </svg>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute top-[30%] left-[20%] w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_#00D1FF]" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="absolute top-[50%] left-[40%] w-6 h-6 bg-purple-500 rounded-full shadow-[0_0_30px_#7A00FF]" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} className="absolute top-[40%] left-[70%] w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_#00D1FF]" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} onClick={() => setSkip(true)} className="absolute bottom-8 right-8 px-4 py-2 rounded-full border border-gray-600/40 text-[11px] text-gray-400 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,209,255,0.3)] uppercase tracking-widest transition-all z-50 backdrop-blur-md">
        Skip Launch
      </motion.button>
    </div>
  );
};
