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
      { s: 'UFO_APPEAR', t: 1000 },
      { s: 'ENGINE_START', t: 2000 },
      { s: 'LAUNCH', t: 3200 },
      { s: 'SPACE_TRAVEL', t: 3800 },
      { s: 'KNOWLEDGE_GRAPH', t: 5500 },
      { s: 'ARRIVAL', t: 7000 },
    ];

    const timeouts = timeline.map(({ s, t }) => 
      setTimeout(() => setStage(s as Stage), t)
    );

    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 8500);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [skip, onComplete]);

  // Handle prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setSkip(true);
    }
  }, []);

  // Stars background using simple CSS/divs
  const stars = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    size: Math.random() * 3 + 1 + 'px',
    delay: Math.random() * 2 + 's',
  }));

  const isSpace = ['LAUNCH', 'SPACE_TRAVEL', 'KNOWLEDGE_GRAPH', 'ARRIVAL'].includes(stage);
  
  return (
    <div className="fixed inset-0 bg-[#020617] overflow-hidden z-[100] font-sans flex items-center justify-center text-white">
      
      {/* Background Stars / Space */}
      <AnimatePresence>
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, scale: isSpace ? 1.5 : 1 }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        >
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute bg-white rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: 0.8,
              }}
              animate={{
                opacity: isSpace ? [0, 1, 0] : 0.8,
                y: isSpace ? '100vh' : 0,
              }}
              transition={{
                duration: isSpace ? Math.random() * 1 + 0.5 : 0,
                repeat: isSpace ? Infinity : 0,
                ease: "linear",
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Center Text Messages */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center z-50">
        <AnimatePresence mode="wait">
          {stage === 'AUTH_SUCCESS' && (
            <motion.h2
              key="auth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-light tracking-widest text-brand-surface"
            >
              Authentication successful
            </motion.h2>
          )}
          {stage === 'UFO_APPEAR' && (
            <motion.p
              key="prepare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-light tracking-wide text-brand-textMuted"
            >
              Preparing your research workspace...
            </motion.p>
          )}
          {stage === 'ENGINE_START' && (
            <motion.p
              key="init"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-light tracking-wide text-blue-200"
            >
              Connecting research intelligence...
            </motion.p>
          )}
          {stage === 'SPACE_TRAVEL' && (
            <motion.p
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-light tracking-wide text-blue-200"
            >
              Exploring the research universe...
            </motion.p>
          )}
          {stage === 'ARRIVAL' && (
            <motion.div
              key="arrival"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Network className="h-12 w-12 text-blue-400" />
              <h2 className="text-3xl font-bold tracking-tight text-white">ResearchGraph AI</h2>
              <p className="text-blue-200 font-light tracking-wider">Your research workspace is ready.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* UFO Element */}
      <AnimatePresence>
        {['UFO_APPEAR', 'ENGINE_START', 'LAUNCH'].includes(stage) && (
          <motion.div
            key="ufo"
            className="absolute top-1/2 left-1/2 -ml-16 -mt-16 w-32 h-32 flex items-center justify-center z-40"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: stage === 'ENGINE_START' ? [0, -5, 5, 0] : 0,
              rotate: stage === 'ENGINE_START' ? [0, 2, -2, 0] : 0
            }}
            exit={{ 
              y: -1000, 
              scale: 0.5, 
              opacity: 0, 
              transition: { duration: 0.8, ease: "easeIn" } 
            }}
            transition={{
              y: { repeat: stage === 'ENGINE_START' ? Infinity : 0, duration: 0.2 },
              rotate: { repeat: stage === 'ENGINE_START' ? Infinity : 0, duration: 0.2 },
              default: { duration: 1, ease: 'easeOut' }
            }}
          >
            {/* UFO Body */}
            <div className="relative w-24 h-8 bg-slate-800 rounded-full border border-slate-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex justify-center">
              {/* UFO Dome */}
              <div className="absolute -top-4 w-12 h-6 bg-slate-700/80 rounded-t-full border border-slate-500 backdrop-blur-md"></div>
              {/* UFO Lights */}
              <div className="absolute w-full h-full flex justify-around items-center px-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></div>
              </div>
              {/* Engine Glow */}
              <motion.div 
                className="absolute -bottom-6 w-16 h-8 bg-blue-500 rounded-full blur-xl"
                animate={{ 
                  opacity: stage === 'ENGINE_START' ? [0.4, 0.9, 0.4] : 0.2,
                  scale: stage === 'ENGINE_START' ? [1, 1.5, 1] : 1
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knowledge Graph Nodes Transition */}
      <AnimatePresence>
        {(stage === 'KNOWLEDGE_GRAPH' || stage === 'ARRIVAL') && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Abstract connected nodes in space */}
            <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
              <line x1="20%" y1="30%" x2="40%" y2="50%" stroke="#60a5fa" strokeWidth="1" />
              <line x1="40%" y1="50%" x2="70%" y2="40%" stroke="#60a5fa" strokeWidth="1" />
              <line x1="40%" y1="50%" x2="50%" y2="80%" stroke="#60a5fa" strokeWidth="1" />
              <line x1="70%" y1="40%" x2="80%" y2="20%" stroke="#60a5fa" strokeWidth="1" />
            </svg>
            <div className="absolute top-[30%] left-[20%] w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
            <div className="absolute top-[50%] left-[40%] w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee]" />
            <div className="absolute top-[40%] left-[70%] w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]" />
            <div className="absolute top-[80%] left-[50%] w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_8px_#93c5fd]" />
            <div className="absolute top-[20%] left-[80%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_8px_#c084fc]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button */}
      <button 
        onClick={() => setSkip(true)}
        className="absolute bottom-6 right-6 text-[11px] text-brand-textMuted/50 hover:text-white uppercase tracking-wider transition-colors z-50"
      >
        Skip Intro
      </button>

    </div>
  );
};
