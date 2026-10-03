import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Network, Search, 
  ExternalLink, MessageSquare, ArrowLeft, X, Filter, Download, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force';

// --- DATA TYPES ---
interface EntityData {
  id: string;
  label: string;
  type: 'Paper' | 'Author' | 'Dataset' | 'Method' | 'Model' | 'Concept';
  usedBy?: string;
  related?: string[];
  datasets?: string[];
  paperId?: string;
}

const rawNodes: EntityData[] = [
  { id: 'dinov2', label: 'DINOv2', type: 'Model', usedBy: '24 papers', related: ['Vision Transformer', 'Self-Supervised Learning', 'MAE'], datasets: ['ImageNet-1K', 'LVD-142M'], paperId: 'p3' },
  { id: 'mae', label: 'MAE (Masked Autoencoders)', type: 'Model', usedBy: '38 papers', related: ['Vision Transformer', 'Pixel Reconstruction'], datasets: ['ImageNet-1K'], paperId: 'p4' },
  { id: 'attention', label: 'Attention Is All You Need', type: 'Paper', usedBy: '114,850 citations', related: ['Multi-Head Attention', 'Transformer Encoder'], datasets: ['WMT 2014 En-De'], paperId: 'p1' },
  { id: 'vit', label: 'Vision Transformer (ViT)', type: 'Concept', usedBy: '32,410 citations', related: ['Patch Projection', 'Attention Is All You Need'], datasets: ['ImageNet-1K', 'JFT-300M'], paperId: 'p2' },
  { id: 'deepseek_r1', label: 'DeepSeek-R1', type: 'Model', usedBy: '12 papers', related: ['GRPO Algorithm', 'Test-Time Compute', 'Multi-Head Attention'], datasets: ['MATH-500', 'AIME 2024'], paperId: 'p5' },
  { id: 'vaswani', label: 'Ashish Vaswani', type: 'Author', usedBy: 'Transformer Architectures', related: ['Attention Is All You Need'] },
  { id: 'oquab', label: 'Maxime Oquab', type: 'Author', usedBy: 'DINOv2, Self-Supervised Learning', related: ['DINOv2'] },
  { id: 'imagenet', label: 'ImageNet-1K', type: 'Dataset', usedBy: '1,200+ publications', related: ['ViT', 'MAE', 'DINOv2'] },
  { id: 'grpo', label: 'GRPO Optimization', type: 'Method', usedBy: 'DeepSeek-R1', related: ['Reinforcement Learning', 'DeepSeek-R1'] },
];

const rawEdges = [
  { source: 'dinov2', target: 'vit', relation: 'USES', verb: 'uses' },
  { source: 'mae', target: 'vit', relation: 'USES', verb: 'uses' },
  { source: 'vit', target: 'attention', relation: 'BUILDS_ON', verb: 'builds upon' },
  { source: 'deepseek_r1', target: 'attention', relation: 'BUILDS_ON', verb: 'builds upon' },
  { source: 'deepseek_r1', target: 'grpo', relation: 'USES', verb: 'uses' },
  { source: 'attention', target: 'vaswani', relation: 'AUTHORED_BY', verb: 'authored by' },
  { source: 'dinov2', target: 'oquab', relation: 'AUTHORED_BY', verb: 'authored by' },
  { source: 'dinov2', target: 'imagenet', relation: 'EVALUATED_ON', verb: 'evaluated on' },
  { source: 'mae', target: 'imagenet', relation: 'EVALUATED_ON', verb: 'evaluated on' },
  { source: 'dinov2', target: 'mae', relation: 'RELATED_TO', verb: 'related to' },
];

const nodeColorMap = {
  Model: { bg: '#2563EB', text: '#BFDBFE', border: '#60A5FA', glow: 'rgba(37,99,235,0.4)' },
  Concept: { bg: '#7C3AED', text: '#DDD6FE', border: '#A78BFA', glow: 'rgba(124,58,237,0.4)' },
  Dataset: { bg: '#059669', text: '#A7F3D0', border: '#34D399', glow: 'rgba(5,150,105,0.4)' },
  Author: { bg: '#D97706', text: '#FDE68A', border: '#FBBF24', glow: 'rgba(217,119,6,0.4)' },
  Paper: { bg: '#0891B2', text: '#CFFAFE', border: '#22D3EE', glow: 'rgba(8,145,178,0.4)' },
  Method: { bg: '#4F46E5', text: '#C7D2FE', border: '#818CF8', glow: 'rgba(79,70,229,0.4)' },
};

// --- CUSTOM NODE ---
const EntityNode = ({ data, selected }: any) => {
  const colors = nodeColorMap[data.type as keyof typeof nodeColorMap];
  const { uiMode } = useApp();
  const isExpert = uiMode === 'expert';

  return (
    <div className={`relative flex flex-col items-center justify-center transition-all ${selected ? 'scale-110' : 'scale-100'}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
        style={{ 
          backgroundColor: colors.bg, 
          border: `2px solid ${selected ? '#fff' : colors.border}`,
          boxShadow: selected ? `0 0 20px ${colors.glow}` : 'none'
        }}
      >
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{data.label.substring(0, 1)}</span>
      </div>
      <div className="absolute top-12 flex flex-col items-center min-w-max pointer-events-none">
        <span className={`font-sans font-bold text-center drop-shadow-md ${selected ? 'text-white text-[13px]' : 'text-gray-300 dark:text-gray-400 text-[11px]'}`}>
          {data.label}
        </span>
        <span className="text-[9px] font-mono tracking-widest uppercase mt-0.5" style={{ color: colors.text }}>
          {data.type}
        </span>
        {isExpert && selected && data.paperId && (
          <span className="text-[8px] font-mono text-gray-500 mt-1">ID: {data.paperId}</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// --- CUSTOM EDGE ---
const RelationEdge = ({
  sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetPosition, targetX, targetY,
  });
  
  const { uiMode } = useApp();
  const isSimple = uiMode === 'simple';
  const labelText = isSimple ? data?.verb : data?.relation;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {data?.isSelected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-[#09152E]/90 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider backdrop-blur-md shadow-lg"
          >
            {labelText as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

const nodeTypes = { entity: EntityNode };
const edgeTypes = { relation: RelationEdge };

// --- GRAPH COMPONENT ---
const GraphCanvas = () => {
  const { setActivePage, setSelectedPaperId, setSearchQuery, uiMode, theme } = useApp();
  const { fitView } = useReactFlow();
  
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQueryLocal, setSearchQueryLocal] = useState('');
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Initialize nodes and edges with d3-force
  useEffect(() => {
    // Setup D3 Force Simulation
    const simulationNodes = rawNodes.map(n => ({ ...n, x: Math.random() * 500, y: Math.random() * 500 }));
    const simulationLinks = rawEdges.map(e => ({ source: e.source, target: e.target, relation: e.relation, verb: e.verb }));

    const simulation = forceSimulation(simulationNodes as any)
      .force('link', forceLink(simulationLinks).id((d: any) => d.id).distance(150))
      .force('charge', forceManyBody().strength(-800))
      .force('center', forceCenter(400, 300))
      .force('collide', forceCollide().radius(60))
      .stop();

    // Run simulation synchronously for initial layout
    for (let i = 0; i < 150; ++i) simulation.tick();

    const initialNodes = simulationNodes.map((n: any) => ({
      id: n.id,
      type: 'entity',
      position: { x: n.x, y: n.y },
      data: { ...n }
    }));

    const initialEdges = simulationLinks.map((e: any, i) => ({
      id: `e${i}`,
      source: e.source.id || e.source,
      target: e.target.id || e.target,
      type: 'relation',
      data: { relation: e.relation, verb: e.verb, isSelected: false },
      animated: e.relation === 'USES' || e.relation === 'BUILDS_ON',
      style: { stroke: '#334155', strokeWidth: 1.5, opacity: 0.6 },
    }));

    setNodes(initialNodes);
    setEdges(initialEdges);
    
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 50);
  }, []);

  // Handle Selection & Hover styles
  useEffect(() => {
    setNodes(nds => nds.map(n => {
      const isSelected = n.id === selectedNodeId;
      const isDimmed = (filterType !== 'All' && n.data.type !== filterType) || (selectedNodeId && n.id !== selectedNodeId && !rawEdges.some(e => (e.source === selectedNodeId && e.target === n.id) || (e.target === selectedNodeId && e.source === n.id)));
      
      return {
        ...n,
        selected: isSelected,
        style: { ...n.style, opacity: isDimmed ? 0.2 : 1, transition: 'opacity 0.3s ease' }
      };
    }));

    setEdges(eds => eds.map(e => {
      const isSelected = e.source === selectedNodeId || e.target === selectedNodeId;
      return {
        ...e,
        data: { ...e.data, isSelected },
        style: { 
          stroke: isSelected ? '#38BDF8' : '#334155',
          strokeWidth: isSelected ? 2 : 1.5,
          opacity: isSelected ? 1 : 0.2,
          strokeDasharray: e.data?.relation === 'RELATED_TO' ? '5,5' : 'none',
          transition: 'all 0.3s ease'
        }
      };
    }));
  }, [selectedNodeId, filterType]);

  const onNodeClick = (_e: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const handleExport = () => {
    // Mock export
    const data = JSON.stringify({ nodes: rawNodes, edges: rawEdges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge_graph_export.json';
    a.click();
  };

  const selectedNodeData = rawNodes.find(n => n.id === selectedNodeId);

  return (
    <div className="w-full h-full relative flex">
      {/* ── TOP CONTROL HUD ── */}
      <Panel position="top-left" className="m-4 z-20 flex flex-col gap-3">
        {/* Title & Back */}
        <div className="flex items-center gap-3 bg-white/90 dark:bg-[#09152E]/90 border border-gray-200 dark:border-white/15 px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md pointer-events-auto">
          <button
            onClick={() => setActivePage('dashboard')}
            className="p-1 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <h1 className="text-[14px] font-bold text-gray-900 dark:text-white tracking-tight">Knowledge Graph {uiMode === 'expert' ? '(Expert Mode)' : ''}</h1>
          </div>
        </div>

        {/* Search & Filter pills */}
        <div className="flex items-center gap-2 flex-wrap pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQueryLocal}
              onChange={(e) => {
                setSearchQueryLocal(e.target.value);
                const match = rawNodes.find(n => n.label.toLowerCase().includes(e.target.value.toLowerCase()));
                if (match && e.target.value.length > 2) setSelectedNodeId(match.id);
              }}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#09152E]/90 border border-gray-200 dark:border-white/15 text-[12px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 backdrop-blur-md w-48 sm:w-60 shadow-lg"
            />
          </div>

          <button onClick={() => setIsLegendOpen(!isLegendOpen)} className="p-1.5 rounded-xl bg-white/90 dark:bg-[#09152E]/90 border border-gray-200 dark:border-white/15 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shadow-lg">
            <Filter className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="p-1.5 rounded-xl bg-white/90 dark:bg-[#09152E]/90 border border-gray-200 dark:border-white/15 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shadow-lg" title="Export JSON">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <AnimatePresence>
          {isLegendOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white/90 dark:bg-[#09152E]/90 border border-gray-200 dark:border-white/15 p-3 rounded-2xl shadow-xl backdrop-blur-md flex flex-col gap-2 w-48">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entity Types</span>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Model', 'Paper', 'Concept', 'Dataset', 'Author', 'Method'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2 py-0.5 rounded-lg font-medium text-[10px] transition-all ${
                      filterType === t 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="bg-gray-50 dark:bg-[#06111F]"
        minZoom={0.2}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={theme === 'dark' ? '#1E293B' : '#E2E8F0'} gap={16} />
        <Controls className="bg-white dark:bg-[#09152E] border-gray-200 dark:border-gray-800 rounded-xl shadow-lg fill-gray-600 dark:fill-gray-400" />
        <MiniMap 
          nodeColor={(n: any) => nodeColorMap[n.data.type as keyof typeof nodeColorMap].bg}
          maskColor={theme === 'dark' ? 'rgba(6, 17, 31, 0.7)' : 'rgba(249, 250, 251, 0.7)'}
          className="bg-white dark:bg-[#09152E] border-gray-200 dark:border-gray-800 rounded-xl shadow-lg"
        />
      </ReactFlow>

      {/* ── GRAPH SIDE PANEL ── */}
      <AnimatePresence>
        {selectedNodeData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-6 right-6 top-20 sm:top-auto z-30 w-80 sm:w-96 bg-white/95 dark:bg-[#09152E]/95 border border-gray-200 dark:border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4 flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  {selectedNodeData.type}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1.5 leading-snug">
                  {selectedNodeData.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[12px] pt-2 border-t border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 flex-1 overflow-y-auto">
              {selectedNodeData.usedBy && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Adoption / Metrics:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedNodeData.usedBy}</span>
                </div>
              )}

              {selectedNodeData.related && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Related Concepts:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedNodeData.related.map((r, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNodeData.datasets && (
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Primary Datasets:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedNodeData.datasets.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center gap-2">
              {uiMode === 'expert' && (
                <button
                  className="w-full py-1.5 px-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold rounded-xl border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center gap-1.5 transition-colors mb-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  Expand Node (1-hop)
                </button>
              )}
              <button
                onClick={() => {
                  if (selectedNodeData.paperId) {
                    setSelectedPaperId(selectedNodeData.paperId);
                    setActivePage('details');
                  } else {
                    setSearchQuery(selectedNodeData.label);
                    setActivePage('search');
                  }
                }}
                className="flex-1 py-2 px-3 bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 text-gray-900 dark:text-white text-[12px] font-semibold rounded-xl border border-gray-200 dark:border-white/15 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{selectedNodeData.paperId ? 'Open Paper' : 'Search'}</span>
              </button>

              <button
                onClick={() => {
                  setSearchQuery(`Explain the role of "${selectedNodeData.label}" in modern AI research, citing relevant papers and topological relationships.`);
                  setActivePage('chat');
                }}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
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

export const KnowledgeGraphPage: React.FC = () => (
  <div className="w-full h-[calc(100vh-56px)]">
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  </div>
);
