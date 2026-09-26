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
        return 'border-brand-accent/50 bg-brand-accent/10 text-brand-accent shadow-[0_0_15px_rgba(0,209,255,0.2)] hover:shadow-[0_0_25px_rgba(0,209,255,0.4)] transition-shadow';
      case 'Author':
        return 'border-purple-500/50 bg-purple-500/10 text-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-shadow';
      case 'Dataset':
        return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-shadow';
      case 'Method':
        return 'border-amber-500/50 bg-amber-500/10 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-shadow';
      case 'Model':
        return 'border-blue-500/50 bg-blue-500/10 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-shadow';
      default:
        return 'border-brand-border bg-brand-bg text-brand-text shadow-sm hover:shadow-md transition-shadow';
    }
  }, [category]);

  const Icon = useMemo(() => {
    switch (category) {
      case 'Paper':
        return FileText;
      case 'Author':
        return User;
      case 'Dataset':
        return Database;
      case 'Method':
        return Binary;
      case 'Model':
        return Layers;
      default:
        return FileText;
    }
  }, [category]);

  return (
    <div className={`px-4 py-3 rounded-xl border bg-white shadow-sm text-center flex flex-col items-center justify-center min-w-[150px] max-w-[200px] select-none ${colorStyles}`}>
      <Handle type="target" position={Position.Top} className="!bg-brand-border !w-2 !h-2" />
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">{category}</span>
      </div>
      <div className="text-[12px] font-medium leading-snug break-words max-w-full">
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
    // Find node details
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
      // Methods / Datasets / Models details
      details = {
        ...details,
        desc: `Used as a primary structural entity in multiple paper clusters. Frequently integrated inside visual pre-training configurations.`,
        stats: `${Math.floor(Math.random() * 20) + 5} occurrences in current citation subgraphs.`
      };
    }

    // Find linked entities
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
    <div className="flex h-[calc(100vh-100px)] max-w-6xl mx-auto rounded-xl border border-brand-border bg-brand-surface overflow-hidden select-none relative shadow-sm">
      
      {/* Central Flow Canvas */}
      <div className="flex-1 h-full relative bg-[#F9FAFB]">
        {/* Help Banner */}
        <div className="absolute top-4 left-4 z-10 p-4 rounded-xl border border-brand-border bg-brand-surface text-[12px] text-brand-textMuted shadow-sm max-w-[280px] leading-relaxed pointer-events-none">
          <span className="font-semibold text-brand-text block mb-1">Explore the Graph</span>
          Click and drag to pan. Use mouse wheel to zoom. Click any node to view relationships.
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#E5E7EB" gap={16} size={1} />
          <Controls className="!bg-brand-surface !border-brand-border !shadow-sm" />
          <MiniMap
            nodeStrokeColor={(n) => (n.type === 'customNode' ? '#000000' : '#E5E7EB')}
            nodeColor={(n) => (n.type === 'customNode' ? '#F3F4F6' : '#FFFFFF')}
            maskColor="rgba(249, 250, 251, 0.7)"
            className="!bg-brand-surface !border-brand-border !shadow-sm rounded-lg"
          />
        </ReactFlow>
      </div>

      {/* Info Right Sidebar Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 h-full border-l border-brand-border bg-brand-surface p-6 flex flex-col justify-between shadow-xl relative z-10 overflow-y-auto"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-brand-bg text-brand-textMuted border border-brand-border">
                  {selectedNode.category} Node
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg hover:bg-brand-bg text-brand-textMuted hover:text-brand-text transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-brand-text leading-snug">
                  {selectedNode.title || selectedNode.label}
                </h3>

                {/* Author subtitle list if paper */}
                {selectedNode.authors && (
                  <p className="text-[13px] text-brand-textMuted">
                    {selectedNode.authors.join(', ')}
                  </p>
                )}

                {/* Stats Table/List */}
                {selectedNode.category === 'Paper' && (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-brand-bg border border-brand-border rounded-lg">
                      <div className="text-[11px] font-semibold text-brand-textMuted uppercase">Citations</div>
                      <div className="text-[16px] font-medium text-brand-text mt-1">
                        {selectedNode.citationCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-brand-bg border border-brand-border rounded-lg">
                      <div className="text-[11px] font-semibold text-brand-textMuted uppercase">Velocity</div>
                      <div className="text-[16px] font-medium text-brand-text mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4 text-brand-textMuted" />
                        {selectedNode.paperObj?.metrics?.citationVelocity || 120}
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.category === 'Author' && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-brand-bg border border-brand-border rounded-lg">
                      <div className="text-[10px] font-semibold text-brand-textMuted uppercase">H-Index</div>
                      <div className="text-[14px] font-medium text-brand-text mt-1">{selectedNode.hIndex}</div>
                    </div>
                    <div className="p-2 bg-brand-bg border border-brand-border rounded-lg">
                      <div className="text-[10px] font-semibold text-brand-textMuted uppercase">Cites</div>
                      <div className="text-[14px] font-medium text-brand-text mt-1">{selectedNode.citations.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-brand-bg border border-brand-border rounded-lg">
                      <div className="text-[10px] font-semibold text-brand-textMuted uppercase">Papers</div>
                      <div className="text-[14px] font-medium text-brand-text mt-1">{selectedNode.papersCount}</div>
                    </div>
                  </div>
                )}

                {/* Main Text Content */}
                <div className="space-y-2 mt-4">
                  <h4 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider">Semantic Summary</h4>
                  <p className="text-[13px] leading-relaxed text-brand-text max-h-[160px] overflow-y-auto scrollbar-thin">
                    {selectedNode.abstract || selectedNode.desc || 'No further description details available.'}
                  </p>
                </div>

                {/* Connected relationships list */}
                {selectedNode.relatedEntities && selectedNode.relatedEntities.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h4 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider">Connected Relations</h4>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-thin">
                      {selectedNode.relatedEntities.slice(0, 10).map((rel: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-brand-border bg-brand-bg text-[12px]"
                        >
                          <span className="font-medium text-brand-text truncate max-w-[140px]" title={rel.label}>
                            {rel.label}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-brand-surface text-brand-textMuted border border-brand-border">
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
            <div className="flex flex-col gap-2 mt-8 flex-shrink-0">
              {selectedNode.category === 'Paper' && (
                <button
                  onClick={handleSidebarViewDetails}
                  className="w-full h-10 rounded-lg bg-brand-accent hover:bg-brand-accentHover text-white text-[13px] font-medium shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  View Details
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleSidebarChatClick}
                className="w-full h-10 rounded-lg border border-brand-border bg-brand-surface text-brand-text text-[13px] font-medium hover:bg-brand-bg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
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

