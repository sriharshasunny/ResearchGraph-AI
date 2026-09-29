import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Users, Database, Cpu, Lightbulb, 
  Share2, Network, Sparkles, Activity 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResearchKnowledgeCore: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const handleLabelClick = (id: string, query?: string) => {
    if (id === 'papers') {
      setActivePage('search');
    } else if (id === 'graph') {
      setActivePage('graph');
    } else if (id === 'gaps') {
      setActivePage('gaps');
    } else if (id === 'chat') {
      setActivePage('chat');
    } else if (query) {
      setSearchQuery(query);
      setActivePage('search');
    }
  };

  // Orbit 1: Inner Orbit (45s)
  const orbit1Items = [
    { id: 'papers', label: 'Papers', icon: <FileText className="w-3.5 h-3.5 text-cyan-400" />, angle: 0, query: 'Transformers' },
    { id: 'authors', label: 'Authors', icon: <Users className="w-3.5 h-3.5 text-amber-400" />, angle: 180, query: 'Ashish Vaswani' },
  ];

  // Orbit 2: Middle Orbit (65s)
  const orbit2Items = [
    { id: 'datasets', label: 'Datasets', icon: <Database className="w-3.5 h-3.5 text-emerald-400" />, angle: 30, query: 'ImageNet' },
    { id: 'methods', label: 'Methods', icon: <Cpu className="w-3.5 h-3.5 text-blue-400" />, angle: 150, query: 'Self-Supervised' },
    { id: 'concepts', label: 'Concepts', icon: <Lightbulb className="w-3.5 h-3.5 text-purple-400" />, angle: 270, query: 'Multi-Head Attention' },
  ];

  // Orbit 3: Outer Orbit (90s)
  const orbit3Items = [
    { id: 'citations', label: 'Citations', icon: <Share2 className="w-3.5 h-3.5 text-teal-400" />, angle: 45, query: 'Attention Is All You Need' },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-3.5 h-3.5 text-indigo-400" />, angle: 135 },
    { id: 'chat', label: 'AI Insights', icon: <Sparkles className="w-3.5 h-3.5 text-pink-400" />, angle: 225 },
    { id: 'gaps', label: 'Research Gaps', icon: <Activity className="w-3.5 h-3.5 text-rose-400" />, angle: 315 },
  ];

  return (
    <div className="relative w-full h-[380px] lg:h-[420px] flex items-center justify-center select-none overflow-hidden">
      
      {/* Ambient Celestial Glow Behind Core */}
      <div className="absolute w-[340px] h-[340px] rounded-full bg-blue-600/15 blur-[90px] pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-cyan-400/10 blur-[60px] pointer-events-none" />

      {/* ── CENTRAL RESEARCH KNOWLEDGE CORE ── */}
      <div className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center">
        {/* Core Outer Atmosphere Ring */}
        <div className={`absolute inset-0 rounded-full border border-cyan-400/30 transition-all duration-700 ${
          hoveredLabel ? 'scale-105 border-cyan-400/60 shadow-[0_0_30px_rgba(56,189,248,0.35)]' : 'shadow-[0_0_20px_rgba(37,99,235,0.25)]'
        }`} />

        {/* Sphere Base & Texture Simulation */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#050B18] via-[#0B1A38] to-[#122A5C] border border-blue-400/20 shadow-2xl flex items-center justify-center">
          
          {/* Internal Grid & Knowledge Topological Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen pointer-events-none" viewBox="0 0 200 200">
            {/* Latitude Curves */}
            <ellipse cx="100" cy="100" rx="90" ry="32" fill="none" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
            <ellipse cx="100" cy="100" rx="90" ry="60" fill="none" stroke="#60A5FA" strokeWidth="0.75" opacity="0.4" />
            <ellipse cx="100" cy="100" rx="90" ry="85" fill="none" stroke="#818CF8" strokeWidth="0.75" strokeDasharray="2 4" opacity="0.3" />
            
            {/* Longitudinal Curvature */}
            <ellipse cx="100" cy="100" rx="35" ry="90" fill="none" stroke="#38BDF8" strokeWidth="0.75" strokeDasharray="4 2" opacity="0.5" />
            <ellipse cx="100" cy="100" rx="65" ry="90" fill="none" stroke="#60A5FA" strokeWidth="0.75" opacity="0.35" />

            {/* Neural Topology Network Points */}
            <circle cx="70" cy="80" r="3" fill="#38BDF8" className={hoveredLabel === 'papers' || hoveredLabel === 'datasets' ? 'animate-ping' : ''} />
            <line x1="70" y1="80" x2="115" y2="65" stroke="#38BDF8" strokeWidth="1" opacity="0.7" />
            
            <circle cx="115" cy="65" r="2.5" fill="#818CF8" />
            <line x1="115" y1="65" x2="140" y2="110" stroke="#818CF8" strokeWidth="0.75" opacity="0.6" />
            
            <circle cx="140" cy="110" r="3.5" fill="#34D399" className={hoveredLabel === 'datasets' || hoveredLabel === 'methods' ? 'animate-pulse' : ''} />
            <line x1="140" y1="110" x2="90" y2="135" stroke="#34D399" strokeWidth="0.75" opacity="0.5" />

            <circle cx="90" cy="135" r="2.5" fill="#F472B6" />
            <line x1="90" y1="135" x2="60" y2="120" stroke="#F472B6" strokeWidth="0.75" opacity="0.5" />

            <circle cx="60" cy="120" r="3" fill="#FBBF24" className={hoveredLabel === 'authors' ? 'animate-ping' : ''} />
            <line x1="60" y1="120" x2="70" y2="80" stroke="#FBBF24" strokeWidth="0.75" opacity="0.6" />
          </svg>

          {/* Sphere Center Shimmer */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(56,189,248,0.35),transparent_65%)] pointer-events-none" />

          {/* Center Brand Identity */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-3">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mb-1 shadow-inner">
              <Network className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            </div>
            <span className="text-[11px] font-extrabold tracking-wider text-white uppercase drop-shadow">
              Research
            </span>
            <span className="text-[9px] font-semibold tracking-widest text-cyan-300 uppercase">
              Core
            </span>
            {hoveredLabel && (
              <span className="mt-0.5 px-1.5 py-0.2 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[8px] font-mono text-cyan-200">
                {hoveredLabel.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── ORBIT LAYER 1 (Inner Orbit - 45s) ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[240px] h-[240px] rounded-full border border-cyan-400/10 pointer-events-none"
      >
        {orbit1Items.map((item) => {
          const rad = (item.angle * Math.PI) / 180;
          const radius = 120;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                onMouseEnter={() => setHoveredLabel(item.id)}
                onMouseLeave={() => setHoveredLabel(null)}
                onClick={() => handleLabelClick(item.id, item.query)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 ${
                  hoveredLabel === item.id
                    ? 'bg-cyan-500/30 border border-cyan-300 text-white scale-110 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                    : 'bg-[#0B1730]/85 border border-white/15 text-gray-200 hover:border-cyan-400/50 hover:bg-[#0B1730]'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* ── ORBIT LAYER 2 (Middle Orbit - 65s) ── */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 65, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[310px] h-[310px] rounded-full border border-blue-400/10 pointer-events-none"
      >
        {orbit2Items.map((item) => {
          const rad = (item.angle * Math.PI) / 180;
          const radius = 155;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 65, repeat: Infinity, ease: 'linear' }}
                onMouseEnter={() => setHoveredLabel(item.id)}
                onMouseLeave={() => setHoveredLabel(null)}
                onClick={() => handleLabelClick(item.id, item.query)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 ${
                  hoveredLabel === item.id
                    ? 'bg-blue-500/30 border border-blue-300 text-white scale-110 shadow-[0_0_12px_rgba(96,165,250,0.5)]'
                    : 'bg-[#0B1730]/85 border border-white/15 text-gray-200 hover:border-blue-400/50 hover:bg-[#0B1730]'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

      {/* ── ORBIT LAYER 3 (Outer Orbit - 90s) ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[380px] h-[380px] rounded-full border border-indigo-400/10 pointer-events-none"
      >
        {orbit3Items.map((item) => {
          const rad = (item.angle * Math.PI) / 180;
          const radius = 190;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div
              key={item.id}
              className="absolute pointer-events-auto"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
                onMouseEnter={() => setHoveredLabel(item.id)}
                onMouseLeave={() => setHoveredLabel(null)}
                onClick={() => handleLabelClick(item.id, item.query)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer backdrop-blur-md transition-all duration-300 ${
                  hoveredLabel === item.id
                    ? 'bg-indigo-500/30 border border-indigo-300 text-white scale-110 shadow-[0_0_12px_rgba(129,140,248,0.5)]'
                    : 'bg-[#0B1730]/85 border border-white/15 text-gray-200 hover:border-indigo-400/50 hover:bg-[#0B1730]'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">{item.label}</span>
              </motion.div>
            </div>
          );
        })}
      </motion.div>

    </div>
  );
};
