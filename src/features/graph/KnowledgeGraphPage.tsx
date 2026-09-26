import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import { Network, Info, ZoomIn, ZoomOut, Maximize, BrainCircuit, ExternalLink } from 'lucide-react';
import { PaperCard } from '../../components/PaperCard';
import { motion } from 'framer-motion';

export const KnowledgeGraphPage: React.FC = () => {
  const { setSelectedPaperId, setActivePage } = useApp();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    { id: '1', label: 'Transformer Arch', type: 'concept', x: 50, y: 50, color: 'bg-brand-accent' },
    { id: 'p1', label: 'Attention Is All You Need', type: 'paper', x: 25, y: 30, color: 'bg-white' },
    { id: '2', label: 'Self-Supervised', type: 'concept', x: 70, y: 30, color: 'bg-brand-violet' },
    { id: 'p2', label: 'ViT', type: 'paper', x: 35, y: 70, color: 'bg-white' },
    { id: 'p3', label: 'DINOv2', type: 'paper', x: 80, y: 60, color: 'bg-white' },
    { id: '3', label: 'Contrastive', type: 'concept', x: 60, y: 80, color: 'bg-green-500' },
    { id: 'p4', label: 'CLIP', type: 'paper', x: 85, y: 85, color: 'bg-white' },
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
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      
      {/* Top Header */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white border border-brand-border shadow-sm flex items-center justify-center">
          <Network className="h-5 w-5 text-brand-accent" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-brand-text leading-tight">Semantic Graph</h2>
          <p className="text-[11px] text-brand-textMuted font-medium">EXPLORING RESEARCH RELATIONSHIPS</p>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <div className="flex flex-col rounded-xl bg-white border border-brand-border shadow-sm overflow-hidden">
          <button className="p-3 text-brand-textMuted hover:bg-gray-50 hover:text-brand-accent transition-colors"><ZoomIn className="h-4 w-4" /></button>
          <div className="h-[1px] w-full bg-brand-border"></div>
          <button className="p-3 text-brand-textMuted hover:bg-gray-50 hover:text-brand-accent transition-colors"><ZoomOut className="h-4 w-4" /></button>
        </div>
        <button className="p-3 rounded-xl bg-white border border-brand-border shadow-sm text-brand-textMuted hover:bg-gray-50 hover:text-brand-accent transition-colors">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Graph Area */}
      <div className="flex-1 w-full bg-graph-pattern opacity-80 cursor-grab active:cursor-grabbing relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <line
                key={idx}
                x1={`${sourceNode.x}%`}
                y1={`${sourceNode.y}%`}
                x2={`${targetNode.x}%`}
                y2={`${targetNode.y}%`}
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeDasharray={activeNode === edge.source || activeNode === edge.target ? "0" : "4 4"}
                className={`transition-all duration-300 ${activeNode === edge.source || activeNode === edge.target ? 'stroke-brand-accent' : ''}`}
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
                group relative flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300
                ${node.type === 'concept' ? 'w-16 h-16 shadow-lg' : 'px-4 py-2 bg-white border border-brand-border shadow-sm'}
                ${activeNode === node.id ? 'ring-4 ring-brand-accent/20 scale-110' : 'hover:scale-105 hover:shadow-md'}
                ${node.type === 'concept' ? node.color : ''}
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
                <BrainCircuit className="h-6 w-6 text-white" />
              ) : (
                <span className="text-[12px] font-bold text-brand-text truncate max-w-[120px]">{node.label}</span>
              )}

              {/* Tooltip */}
              {node.type === 'concept' && (
                <div className="absolute top-full mt-3 px-3 py-1.5 bg-brand-text text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none z-50">
                  {node.label}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-brand-text"></div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
