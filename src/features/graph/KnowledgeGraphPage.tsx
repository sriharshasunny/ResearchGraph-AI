import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { graphData } from '../../data/mockData';
import { getPaperDetails } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  User,
  Database,
  Binary,
  Layers,
  ArrowUpRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

// Custom Node component to display clean labels
const CustomNode: React.FC<any> = ({ data }) => {
  const { label, category } = data;

  const colorStyles = useMemo(() => {
    switch (category) {
      case 'Paper':
        return 'border-brand-accent/40 bg-blue-50 text-brand-accent shadow-sm hover:shadow-md hover:border-brand-accent transition-all';
      case 'Author':
        return 'border-purple-500/40 bg-purple-50 text-purple-600 shadow-sm hover:shadow-md hover:border-purple-500 transition-all';
      case 'Dataset':
        return 'border-emerald-500/40 bg-emerald-50 text-emerald-600 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all';
      case 'Method':
        return 'border-amber-500/40 bg-amber-50 text-amber-600 shadow-sm hover:shadow-md hover:border-amber-500 transition-all';
      case 'Model':
        return 'border-blue-400/40 bg-blue-50 text-blue-600 shadow-sm hover:shadow-md hover:border-blue-400 transition-all';
      default:
        return 'border-brand-border bg-white text-brand-text shadow-sm hover:shadow-md transition-all';
    }
  }, [category]);

  const Icon = useMemo(() => {
    switch (category) {
      case 'Paper': return FileText;
      case 'Author': return User;
      case 'Dataset': return Database;
      case 'Method': return Binary;
      case 'Model': return Layers;
      default: return FileText;
    }
  }, [category]);

  return (
    <div className={`px-4 py-3 rounded-xl border shadow-sm text-center flex flex-col items-center justify-center min-w-[150px] max-w-[200px] select-none backdrop-blur-sm ${colorStyles}`}>
      <Handle type="target" position={Position.Top} className="!bg-brand-border !w-2 !h-2" />
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{category}</span>
      </div>
      <div className="text-[12px] font-semibold leading-snug break-words max-w-full text-brand-text">
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-brand-border !w-2 !h-2" />
    </div>
  );
};

export const KnowledgeGraphPage: React.FC = () => {
  const { setActivePage, setSelectedPaperId, addToRecentlyViewed, addChatMessage, paperCache } = useApp();
  const [nodes, , onNodesChange] = useNodesState(graphData.nodes);
  const [edges, , onEdgesChange] = useEdgesState(graphData.edges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Custom Node Types mapping for React Flow
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  // Handle clicking a node to display details in sidebar
  const onNodeClick = async (_: any, node: any) => {
    const category = node.data.category;
    const nodeId = node.data.id;
    let details: any = { id: nodeId, label: node.data.label, category };

    if (category === 'Paper') {
      let paper: any = paperCache[nodeId];
      if (!paper) {
        try {
          paper = await getPaperDetails(nodeId);
        } catch {
          paper = null;
        }
      }
      
      if (paper) {
        details = {
          ...details,
          title: paper.title,
          abstract: paper.abstract,
          citationCount: paper.citationCount,
          publication: paper.publication,
          year: paper.year,
          authors: paper.authors,
          paperObj: paper
        };
      }
    } else if (category === 'Author') {
      details = {
        ...details,
        affiliation: 'Independent Academic Researcher',
        hIndex: 25,
        citations: 1800,
        papersCount: 14
      };
    } else {
      details = {
        ...details,
        desc: `Used as a primary structural entity in multiple paper clusters. Frequently integrated inside visual pre-training configurations.`,
        stats: `${Math.floor(Math.random() * 20) + 5} occurrences in current citation subgraphs.`
      };
    }

    const connectedEdges = edges.filter((e) => e.source === nodeId || e.target === nodeId);
    const relatedEntities = connectedEdges.map((e) => {
      const targetId = e.source === nodeId ? e.target : e.source;
      const targetNode = nodes.find((n) => n.id === targetId);
      return {
        id: targetId,
        label: targetNode ? targetNode.data.label : targetId,
        category: targetNode ? targetNode.data.category : 'Entity',
        rel: e.label
      };
    });

    setSelectedNode({ ...details, relatedEntities });
  };

  const handleSidebarViewDetails = () => {
    if (selectedNode && selectedNode.category === 'Paper') {
      setSelectedPaperId(selectedNode.id);
      addToRecentlyViewed(selectedNode.id);
      setActivePage('details');
    }
  };

  const handleSidebarChatClick = () => {
    if (!selectedNode) return;
    
    let q = '';
    if (selectedNode.category === 'Paper') {
      q = `Tell me about the citations and methods used in: "${selectedNode.title}"`;
    } else if (selectedNode.category === 'Author') {
      q = `Summarize the academic profile and core works of: "${selectedNode.label}"`;
    } else {
      q = `Explain how the ${selectedNode.category} "${selectedNode.label}" is used in visual models.`;
    }

    addChatMessage({
      id: `chat-node-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setActivePage('chat');
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full mx-auto rounded-2xl border border-brand-border bg-white overflow-hidden select-none relative shadow-subtle mx-4 my-2">
      
      {/* Central Flow Canvas */}
      <div className="flex-1 h-full relative bg-brand-bg">
        {/* Clean Light Background Pattern */}
        <div className="absolute inset-0 z-0 bg-graph-pattern opacity-60 pointer-events-none"></div>

        {/* Help Banner */}
        <div className="absolute top-4 left-4 z-10 p-4 rounded-xl border border-brand-border bg-white text-[12px] text-brand-textMuted shadow-sm max-w-[280px] leading-relaxed pointer-events-none">
          <span className="font-semibold text-brand-text block mb-1">Explore the Graph</span>
          Click and drag to pan. Use mouse wheel to zoom. Click any node to view relationships.
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges.map(e => ({
            ...e,
            style: { stroke: '#d1d5db', strokeWidth: 1.5 },
            animated: true
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#e5e7eb" gap={20} size={1} />
          <Controls className="!bg-white !border-brand-border !shadow-sm !rounded-lg overflow-hidden" />
          <MiniMap
            nodeStrokeColor={(n) => (n.type === 'customNode' ? '#e5e7eb' : '#d1d5db')}
            nodeColor={(n) => (n.type === 'customNode' ? '#ffffff' : '#f9fafb')}
            maskColor="rgba(250, 250, 250, 0.7)"
            className="!bg-white !border-brand-border !shadow-sm !rounded-xl"
          />
        </ReactFlow>
      </div>

      {/* Info Right Sidebar Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-96 h-full border-l border-brand-border bg-white p-6 flex flex-col justify-between shadow-float relative z-10 overflow-y-auto"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-50 text-brand-textMuted border border-brand-border">
                  {selectedNode.category} Node
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-brand-textMuted hover:text-brand-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h3 className="text-[18px] font-bold text-brand-text leading-snug">
                  {selectedNode.title || selectedNode.label}
                </h3>

                {/* Author subtitle list if paper */}
                {selectedNode.authors && (
                  <p className="text-[13px] text-brand-textMuted font-medium">
                    {selectedNode.authors.join(', ')}
                  </p>
                )}

                {/* Stats Table/List */}
                {selectedNode.category === 'Paper' && (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-gray-50 border border-brand-border rounded-xl">
                      <div className="text-[11px] font-semibold text-brand-textMuted uppercase tracking-wide">Citations</div>
                      <div className="text-[18px] font-bold text-brand-text mt-1">
                        {selectedNode.citationCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 border border-brand-border rounded-xl">
                      <div className="text-[11px] font-semibold text-brand-textMuted uppercase tracking-wide">Velocity</div>
                      <div className="text-[18px] font-bold text-brand-text mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4 text-brand-accent" />
                        {selectedNode.paperObj?.metrics?.citationVelocity || 120}
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.category === 'Author' && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 border border-brand-border rounded-xl">
                      <div className="text-[10px] font-semibold text-brand-textMuted uppercase">H-Index</div>
                      <div className="text-[15px] font-bold text-brand-text mt-1">{selectedNode.hIndex}</div>
                    </div>
                    <div className="p-2 bg-gray-50 border border-brand-border rounded-xl">
                      <div className="text-[10px] font-semibold text-brand-textMuted uppercase">Cites</div>
                      <div className="text-[15px] font-bold text-brand-text mt-1">{selectedNode.citations.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-gray-50 border border-brand-border rounded-xl">
                      <div className="text-[10px] font-semibold text-brand-textMuted uppercase">Papers</div>
                      <div className="text-[15px] font-bold text-brand-text mt-1">{selectedNode.papersCount}</div>
                    </div>
                  </div>
                )}

                {/* Main Text Content */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-[12px] font-bold text-brand-textMuted uppercase tracking-wider">Semantic Summary</h4>
                  <p className="text-[13px] leading-relaxed text-brand-textSoft max-h-[200px] overflow-y-auto scrollbar-thin pr-2">
                    {selectedNode.abstract || selectedNode.desc || 'No further description details available.'}
                  </p>
                </div>

                {/* Connected relationships list */}
                {selectedNode.relatedEntities && selectedNode.relatedEntities.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-[12px] font-bold text-brand-textMuted uppercase tracking-wider">Connected Relations</h4>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-thin pr-2">
                      {selectedNode.relatedEntities.slice(0, 10).map((rel: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-brand-border bg-gray-50 text-[12px] hover:border-gray-300 transition-colors"
                        >
                          <span className="font-semibold text-brand-text truncate max-w-[160px]" title={rel.label}>
                            {rel.label}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-brand-textMuted border border-brand-border shadow-sm">
                            {rel.rel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Foot Action buttons */}
            <div className="flex flex-col gap-3 mt-8 flex-shrink-0">
              {selectedNode.category === 'Paper' && (
                <button
                  onClick={handleSidebarViewDetails}
                  className="w-full h-11 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-[13px] font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  View Details
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleSidebarChatClick}
                className="w-full h-11 rounded-xl border border-brand-border bg-white text-brand-text text-[13px] font-semibold hover:bg-gray-50 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <MessageSquare className="h-4 w-4 text-brand-accent" />
                Chat About Node
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </div>
  );
};
export default KnowledgeGraphPage;

