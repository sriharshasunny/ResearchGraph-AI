import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, UserCheck, Database, GitMerge, BrainCircuit, Globe, CheckCircle2 } from 'lucide-react';

export const LaunchSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (skip) {
      onComplete();
      return;
    }

    const duration = 8000; // 8 seconds total loading
    const interval = 50; // update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500); // Wait half a second at 100% then finish
          return 100;
        }
        return p + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [skip, onComplete]);

  // Determine which step is currently active (0 to 4)
  const currentStep = Math.min(4, Math.floor(progress / 20));

  const stepsData = [
    { title: 'Authenticating', subtitle: 'User verified', icon: UserCheck },
    { title: 'Loading', subtitle: 'Research modules', icon: Database },
    { title: 'Connecting', subtitle: 'Academic sources', icon: GitMerge },
    { title: 'Building', subtitle: 'Knowledge graph', icon: BrainCircuit },
    { title: 'Entering', subtitle: 'Your workspace', icon: Globe },
  ];

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[100] font-sans flex text-white select-none">
      
      {/* Epic Cinematic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out transform scale-100 hover:scale-105"
        style={{ backgroundImage: "url('/epic_launch_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
      </div>

      {/* Top Left: Brand */}
      <div className="absolute top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-12 h-12 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Network className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-extrabold text-xl leading-tight tracking-wide drop-shadow-md">ResearchGraph AI</span>
          <span className="text-gray-300 text-[11px] font-medium tracking-wide drop-shadow-md">Explore research. Connect knowledge. Discover insights.</span>
        </div>
      </div>

      {/* Top Right: Status */}
      <div className="absolute top-8 right-8 px-4 py-2 rounded-full border border-gray-600/50 bg-black/40 backdrop-blur-md flex items-center gap-3 z-50 shadow-lg">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
        <span className="text-gray-200 text-[10px] font-bold tracking-widest uppercase">Research Engine Online</span>
      </div>

      {/* Center Top: Welcome Titles */}
      <div className="absolute top-[18%] w-full flex flex-col items-center z-50 text-center">
        <motion.span 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
          className="text-gray-300 text-[12px] font-bold tracking-[0.25em] uppercase mb-4 drop-shadow-lg"
        >
          Welcome Back, Sriharsha
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-6xl font-extrabold text-white mb-5 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tight"
        >
          Launching Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Research Universe</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
          className="text-gray-200 text-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-light"
        >
          Connecting academic knowledge across the universe...
        </motion.p>
      </div>

      {/* Bottom Center: Loading HUD Widget */}
      <div className="absolute bottom-[12%] w-full max-w-[900px] left-1/2 -translate-x-1/2 z-50">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
          className="w-full relative border border-cyan-500/30 bg-[#060B14]/70 backdrop-blur-xl rounded-3xl pt-10 pb-8 px-12 shadow-[0_0_50px_rgba(0,209,255,0.15)] flex flex-col"
        >
          {/* Sci-fi Corner Accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-3xl opacity-70"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-3xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-3xl opacity-70"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-3xl opacity-70"></div>

          {/* HUD Content */}
          <div className="flex justify-between items-start w-full mb-10 relative px-4">
            {/* Connecting Line */}
            <div className="absolute top-6 left-12 right-12 h-[2px] bg-gray-700/60 z-0"></div>
            
            {/* Active Progress Line (Follows the active step) */}
            <div 
              className="absolute top-6 left-12 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-0 transition-all duration-500 ease-out" 
              style={{ width: `calc(${(currentStep / 4) * 100}% - 3rem)` }}
            ></div>

            {stepsData.map((step, idx) => {
              const isActive = currentStep === idx;
              const isCompleted = currentStep > idx;
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center relative z-10 w-28">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-500 relative ${
                    isActive ? 'border-2 border-cyan-400 bg-[#0c233f] shadow-[0_0_25px_rgba(34,211,238,0.5)] text-cyan-400 scale-110' 
                    : isCompleted ? 'border-2 border-cyan-500/50 bg-[#07172c] text-cyan-500' 
                    : 'border-2 border-gray-700 bg-[#030712] text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                    {/* Small checkmark badge for completed steps */}
                    {(isCompleted || isActive) && (
                      <div className="absolute -bottom-1 -right-1 bg-[#060B14] rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 bg-black rounded-full" />
                      </div>
                    )}
                  </div>
                  <span className={`text-[13px] font-bold tracking-wide transition-colors ${isActive || isCompleted ? 'text-white drop-shadow-md' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  <span className={`text-[11px] mt-0.5 transition-colors ${isActive || isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.subtitle}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Gradient Progress Bar */}
          <div className="flex items-center gap-5 px-6 w-full">
            <div className="flex-1 h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <motion.div 
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-white text-sm font-mono font-bold w-10">{Math.floor(progress)}%</span>
          </div>

          <div className="text-center mt-8 text-[10px] text-cyan-400/80 font-mono tracking-[0.3em] uppercase">
             Initializing Research Intelligence...
          </div>
        </motion.div>
      </div>

      {/* Bottom Left: Tech HUD */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2 z-50 opacity-50 pointer-events-none">
        <div className="text-[10px] text-cyan-400 font-mono tracking-widest border-b border-cyan-400/30 pb-1 inline-block">RG-AI / O1</div>
        <div className="flex items-end gap-1 h-6">
           {Array.from({length: 15}).map((_, i) => (
             <motion.div 
               key={i} 
               className="w-1 bg-cyan-400/60 rounded-t-sm"
               animate={{ height: ['20%', '100%', '20%'] }}
               transition={{ duration: Math.random() * 1 + 0.5, repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
             />
           ))}
        </div>
        <div className="text-[8px] text-gray-500 font-mono mt-1">SECURE CONNECTION ESTABLISHED</div>
      </div>

      {/* Bottom Right: Skip Button */}
      <button 
        onClick={() => setSkip(true)} 
        className="absolute bottom-8 right-8 px-6 py-2.5 rounded-full border border-gray-500/60 text-gray-300 text-[12px] font-medium hover:text-white hover:border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all z-50 backdrop-blur-md group"
      >
        Skip Intro <span className="group-hover:translate-x-1 inline-block transition-transform">&rarr;</span>
      </button>

    </div>
  );
};
