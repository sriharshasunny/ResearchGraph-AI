import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Network, ZoomIn, ZoomOut, Maximize, BrainCircuit, ExternalLink, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const KnowledgeGraphPage: React.FC = () => {
  const { setSelectedPaperId, setActivePage } = useApp();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    { id: '1', label: 'Transformer Arch', type: 'concept', x: 50, y: 50, color: 'bg-purple-500', shadow: 'shadow-purple-500/50' },
    { id: 'p1', label: 'Attention Is All You Need', type: 'paper', x: 25, y: 30, color: 'border-cyan-500/50 text-cyan-300' },
    { id: '2', label: 'Self-Supervised', type: 'concept', x: 70, y: 30, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
    { id: 'p2', label: 'ViT: Vision Transformer', type: 'paper', x: 35, y: 70, color: 'border-cyan-500/50 text-cyan-300' },
    { id: 'p3', label: 'DINOv2', type: 'paper', x: 80, y: 60, color: 'border-cyan-500/50 text-cyan-300' },
    { id: '3', label: 'Contrastive', type: 'concept', x: 60, y: 80, color: 'bg-rose-500', shadow: 'shadow-rose-500/50' },
    { id: 'p4', label: 'CLIP', type: 'paper', x: 85, y: 85, color: 'border-cyan-500/50 text-cyan-300' },
  ];

  const edges = [
    { source: '1', target: 'p1' },
    { source: '1', target: 'p2' },
    { source: '1', target: '2' },
    { source: '2', target: 'p3' },
    { source: '1', target: 'p4' },
    { source: '3', target: 'p4' },
    { source: '2', target: '3' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden">
      
      {/* Sci-Fi Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[150px]"></div>
      </div>

      {/* Top Header HUD */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-4 p-4 rounded-2xl bg-[#070b14]/80 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <Network className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-white leading-tight flex items-center gap-2">
            Semantic Graph <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </h2>
          <p className="text-[11px] text-cyan-400/80 font-mono tracking-widest mt-1">TOPOLOGICAL MAPPING ENGINE</p>
        </div>
      </div>

      {/* Controls HUD */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
        <div className="flex flex-col rounded-xl bg-[#070b14]/80 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
          <button className="p-3.5 text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition-colors"><ZoomIn className="h-4 w-4" /></button>
          <div className="h-[1px] w-full bg-white/10"></div>
          <button className="p-3.5 text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition-colors"><ZoomOut className="h-4 w-4" /></button>
        </div>
        <button className="p-3.5 rounded-xl bg-[#070b14]/80 backdrop-blur-md border border-white/10 shadow-2xl text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition-colors">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Graph Area */}
      <div className="flex-1 w-full bg-graph-pattern opacity-90 cursor-grab active:cursor-grabbing relative z-0">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            const isActive = activeNode === edge.source || activeNode === edge.target;
            return (
              <line
                key={idx}
                x1={`${sourceNode.x}%`}
                y1={`${sourceNode.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke={isActive ? "rgba(6, 182, 212, 0.8)" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth={isActive ? "3" : "1.5"}
                strokeDasharray={isActive ? "0" : "6 6"}
                className="transition-all duration-300"
                style={isActive ? { filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.5))' } : {}}
              />
            );
          })}
        </svg>

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 12, delay: Math.random() * 0.3 }}
          >
            <div 
              className={`
                group relative flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md
                ${node.type === 'concept' ? 'w-16 h-16 shadow-xl ' + node.color + ' ' + node.shadow : 'px-4 py-2.5 bg-[#0a0f1c]/90 border hover:border-cyan-400 shadow-lg ' + node.color}
                ${activeNode === node.id ? 'ring-4 ring-cyan-500/30 scale-110' : 'hover:scale-105 hover:shadow-cyan-500/20'}
              `}
              onClick={() => {
                setActiveNode(node.id);
                if (node.type === 'paper') {
                  setSelectedPaperId(node.id);
                  setActivePage('details');
                }
              }}
              onMouseEnter={() => setActiveNode(node.id)}
              onMouseLeave={() => setActiveNode(null)}
            >
              {node.type === 'concept' ? (
                <BrainCircuit className="h-6 w-6 text-white drop-shadow-md" />
              ) : (
                <div className="flex items-center gap-2">
                   <span className="text-[12px] font-bold truncate max-w-[140px]">{node.label}</span>
                   <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                </div>
              )}

              {/* Tooltip for Concepts */}
              {node.type === 'concept' && (
                <div className="absolute top-full mt-4 px-4 py-2 bg-[#070b14]/90 border border-white/10 text-white text-[12px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none z-50">
                  {node.label}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#070b14]/90"></div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
