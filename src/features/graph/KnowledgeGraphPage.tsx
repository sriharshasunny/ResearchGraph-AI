import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize2, 
  ExternalLink, MessageSquare, ArrowLeft, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GraphNode {
  id: string;
  label: string;
  type: 'Paper' | 'Author' | 'Dataset' | 'Method' | 'Model' | 'Concept';
  x: number;
  y: number;
  usedBy?: string;
  related?: string[];
  datasets?: string[];
  paperId?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: 'AUTHORED_BY' | 'USES' | 'CITES' | 'RELATED_TO' | 'EVALUATED_ON' | 'IMPROVES' | 'BUILDS_ON';
}

export const KnowledgeGraphPage: React.FC = () => {
  const { setActivePage, setSelectedPaperId, setSearchQuery } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('dinov2');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQueryLocal, setSearchQueryLocal] = useState('');

  const nodes: GraphNode[] = [
    { 
      id: 'dinov2', 
      label: 'DINOv2', 
      type: 'Model', 
      x: 480, 
      y: 280, 
      usedBy: '24 papers', 
      related: ['Vision Transformer', 'Self-Supervised Learning', 'MAE'], 
      datasets: ['ImageNet-1K', 'LVD-142M'],
      paperId: 'p3'
    },
    { 
      id: 'mae', 
      label: 'MAE (Masked Autoencoders)', 
      type: 'Model', 
      x: 320, 
      y: 200, 
      usedBy: '38 papers', 
      related: ['Vision Transformer', 'Pixel Reconstruction'], 
      datasets: ['ImageNet-1K'],
      paperId: 'p4'
    },
    { 
      id: 'attention', 
      label: 'Attention Is All You Need', 
      type: 'Paper', 
      x: 650, 
      y: 150, 
      usedBy: '114,850 citations', 
      related: ['Multi-Head Attention', 'Transformer Encoder'], 
      datasets: ['WMT 2014 En-De'],
      paperId: 'p1'
    },
    { 
      id: 'vit', 
      label: 'Vision Transformer (ViT)', 
      type: 'Concept', 
      x: 380, 
      y: 420, 
      usedBy: '32,410 citations', 
      related: ['Patch Projection', 'Attention Is All You Need'], 
      datasets: ['ImageNet-1K', 'JFT-300M'],
      paperId: 'p2'
    },
    { 
      id: 'deepseek_r1', 
      label: 'DeepSeek-R1', 
      type: 'Model', 
      x: 720, 
      y: 360, 
      usedBy: '12 papers', 
      related: ['GRPO Algorithm', 'Test-Time Compute', 'Multi-Head Attention'], 
      datasets: ['MATH-500', 'AIME 2024'],
      paperId: 'p5'
    },
    { 
      id: 'vaswani', 
      label: 'Ashish Vaswani', 
      type: 'Author', 
      x: 820, 
      y: 120, 
      usedBy: 'Transformer Architectures', 
      related: ['Attention Is All You Need']
    },
    { 
      id: 'oquab', 
      label: 'Maxime Oquab', 
      type: 'Author', 
      x: 580, 
      y: 440, 
      usedBy: 'DINOv2, Self-Supervised Learning', 
      related: ['DINOv2']
    },
    { 
      id: 'imagenet', 
      label: 'ImageNet-1K', 
      type: 'Dataset', 
      x: 220, 
      y: 330, 
      usedBy: '1,200+ publications', 
      related: ['ViT', 'MAE', 'DINOv2']
    },
    { 
      id: 'grpo', 
      label: 'GRPO Optimization', 
      type: 'Method', 
      x: 860, 
      y: 310, 
      usedBy: 'DeepSeek-R1', 
      related: ['Reinforcement Learning', 'DeepSeek-R1']
    },
  ];

  const edges: GraphEdge[] = [
    { source: 'dinov2', target: 'vit', relation: 'USES' },
    { source: 'mae', target: 'vit', relation: 'USES' },
    { source: 'vit', target: 'attention', relation: 'BUILDS_ON' },
    { source: 'deepseek_r1', target: 'attention', relation: 'BUILDS_ON' },
    { source: 'deepseek_r1', target: 'grpo', relation: 'USES' },
    { source: 'attention', target: 'vaswani', relation: 'AUTHORED_BY' },
    { source: 'dinov2', target: 'oquab', relation: 'AUTHORED_BY' },
    { source: 'dinov2', target: 'imagenet', relation: 'EVALUATED_ON' },
    { source: 'mae', target: 'imagenet', relation: 'EVALUATED_ON' },
    { source: 'dinov2', target: 'mae', relation: 'RELATED_TO' },
  ];

  const nodeColorMap = {
    Model: { bg: '#2563EB', text: '#BFDBFE', border: '#60A5FA', glow: 'rgba(37,99,235,0.4)' },
    Concept: { bg: '#7C3AED', text: '#DDD6FE', border: '#A78BFA', glow: 'rgba(124,58,237,0.4)' },
    Dataset: { bg: '#059669', text: '#A7F3D0', border: '#34D399', glow: 'rgba(5,150,105,0.4)' },
    Author: { bg: '#D97706', text: '#FDE68A', border: '#FBBF24', glow: 'rgba(217,119,6,0.4)' },
    Paper: { bg: '#0891B2', text: '#CFFAFE', border: '#22D3EE', glow: 'rgba(8,145,178,0.4)' },
    Method: { bg: '#4F46E5', text: '#C7D2FE', border: '#818CF8', glow: 'rgba(79,70,229,0.4)' },
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const handleOpenPaper = (paperId?: string) => {
    if (paperId) {
      setSelectedPaperId(paperId);
      setActivePage('details');
    } else {
      setActivePage('search');
    }
  };

  const handleAskAIAboutEntity = (name: string) => {
    setSearchQuery(`Explain the role of "${name}" in modern AI research, citing relevant papers and topological relationships.`);
    setActivePage('chat');
  };

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden bg-[#06111F] text-white select-none">
      
      {/* ── TOP CONTROL HUD ── */}
      <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
        
        {/* Title & Back */}
        <div className="flex items-center gap-3 bg-[#09152E]/90 border border-white/15 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => setActivePage('dashboard')}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h1 className="text-[14px] font-bold text-white tracking-tight">Research Knowledge Graph</h1>
          </div>
        </div>

        {/* Search & Filter pills */}
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          {/* Entity search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search graph entities..."
              value={searchQueryLocal}
              onChange={(e) => setSearchQueryLocal(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#09152E]/90 border border-white/15 text-[12px] text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/80 backdrop-blur-md w-48 sm:w-60"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[#09152E]/90 border border-white/15 p-1 rounded-xl backdrop-blur-md text-[11px]">
            {['All', 'Model', 'Paper', 'Concept', 'Dataset', 'Author'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                  filterType === t 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── INTERACTIVE CANVAS VIEW (SVG GRAPH) ── */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative overflow-hidden"
        style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
      >
        <svg className="w-full h-full min-w-[1000px] min-h-[700px]">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Relationships / Edges */}
          {edges.map((edge, idx) => {
            const sNode = nodes.find(n => n.id === edge.source);
            const tNode = nodes.find(n => n.id === edge.target);
            if (!sNode || !tNode) return null;

            const isConnected = selectedNodeId === edge.source || selectedNodeId === edge.target;

            return (
              <g key={idx}>
                <line
                  x1={sNode.x}
                  y1={sNode.y}
                  x2={tNode.x}
                  y2={tNode.y}
                  stroke={isConnected ? '#38BDF8' : '#1E293B'}
                  strokeWidth={isConnected ? 2 : 1}
                  strokeDasharray={edge.relation === 'RELATED_TO' ? '4 4' : undefined}
                  opacity={isConnected ? 0.9 : 0.4}
                />
                {/* Edge Label for Active Connections */}
                {isConnected && (
                  <text
                    x={(sNode.x + tNode.x) / 2}
                    y={(sNode.y + tNode.y) / 2 - 6}
                    fill="#38BDF8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-bold tracking-wider"
                  >
                    {edge.relation}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isDimmed = filterType !== 'All' && node.type !== filterType;
            const colors = nodeColorMap[node.type];

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer transition-all duration-300"
                opacity={isDimmed ? 0.2 : 1}
              >
                {/* Outer Glow Halo on Selection */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={26}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth={2}
                    className="animate-pulse"
                    filter="url(#glow)"
                  />
                )}

                {/* Node Body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 18 : 14}
                  fill={colors.bg}
                  stroke={isSelected ? '#FFFFFF' : colors.border}
                  strokeWidth={2}
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + 30}
                  fill={isSelected ? '#FFFFFF' : '#94A3B8'}
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                  className="font-sans drop-shadow"
                >
                  {node.label}
                </text>

                {/* Node Type Pill */}
                <text
                  x={node.x}
                  y={node.y + 42}
                  fill={colors.text}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {node.type.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── ZOOM & VIEW CONTROLS (BOTTOM-LEFT) ── */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1 bg-[#09152E]/90 border border-white/15 p-1 rounded-xl backdrop-blur-md">
        <button
          onClick={() => setZoomLevel(Math.min(zoomLevel + 0.15, 1.8))}
          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(Math.max(zoomLevel - 0.15, 0.6))}
          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── GRAPH SIDE PANEL (BOTTOM-RIGHT / RIGHT) ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-6 right-6 top-20 sm:top-auto z-30 w-80 sm:w-88 bg-[#09152E]/95 border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedNode.type}
                </span>
                <h3 className="text-[17px] font-bold text-white mt-1.5 leading-snug">
                  {selectedNode.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[12px] pt-1 border-t border-white/10 text-gray-300">
              {selectedNode.usedBy && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Used By:</span>
                  <span className="text-white font-medium">{selectedNode.usedBy}</span>
                </div>
              )}

              {selectedNode.related && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Related Concepts:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.related.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-gray-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.datasets && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Primary Datasets:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.datasets.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons: [Open] [Search Related] [Ask AI] */}
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => handleOpenPaper(selectedNode.paperId)}
                className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-white text-[12px] font-semibold rounded-xl border border-white/15 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>

              <button
                onClick={() => handleAskAIAboutEntity(selectedNode.label)}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
