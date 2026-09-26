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
    <div className="fixed inset-0 bg-black overflow-hidden z-[100] font-sans flex items-center justify-center text-white">
      {/* Cinematic Hyper-Realistic Background */}
      <motion.div 
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1.15, opacity: 1 }}
        transition={{ duration: 11, ease: "linear", opacity: { duration: 1.5 } }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/ufo_space_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-brightness-75"></div>
      </motion.div>

      <AnimatePresence>
        <motion.div className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1, scale: isSpace ? 1.5 : 1 }} transition={{ duration: 5, ease: 'easeInOut' }}>
          {stars.map((star) => (
            <motion.div
              key={star.id} className="absolute rounded-full"
              style={{ top: star.top, left: star.left, width: star.size, height: star.size, backgroundColor: star.color, opacity: 0.8 }}
              animate={{ opacity: isSpace ? [0, 1, 0] : 0.8, y: isSpace ? '120vh' : 0 }}
              transition={{ duration: isSpace ? Math.random() * 0.8 + 0.4 : 0, repeat: isSpace ? Infinity : 0, ease: "linear" }}
            />
          ))}
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

      {/* The CSS UFO has been replaced by the realistic background image */}

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
