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
import { graphData, mockPapers, mockAuthors } from '../../data/mockData';
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

// Custom Node component to display glassmorphic labels
const CustomNode: React.FC<any> = ({ data }) => {
  const { label, category } = data;

  const colorStyles = useMemo(() => {
    switch (category) {
      case 'Paper':
        return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400';
      case 'Author':
        return 'border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400';
      case 'Dataset':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
      case 'Method':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400';
      case 'Model':
        return 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default:
        return 'border-slate-500/40 bg-slate-500/10 text-slate-700 dark:text-slate-400';
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
    <div className={`px-4.5 py-3 rounded-2xl border backdrop-blur-md shadow-xl text-center flex flex-col items-center justify-center min-w-[150px] max-w-[200px] select-none ${colorStyles}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2" />
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-wider opacity-80">{category}</span>
      </div>
      <div className="text-[10.5px] font-extrabold leading-tight break-words max-w-full">
        {label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
};

export const KnowledgeGraphPage: React.FC = () => {
  const { setActivePage, setSelectedPaperId, addToRecentlyViewed, addChatMessage } = useApp();
  const [nodes, , onNodesChange] = useNodesState(graphData.nodes);
  const [edges, , onEdgesChange] = useEdgesState(graphData.edges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Custom Node Types mapping for React Flow
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  // Handle clicking a node to display details in sidebar
  const onNodeClick = (_: any, node: any) => {
    // Find node details
    const category = node.data.category;
    const nodeId = node.data.id;
    let details: any = { id: nodeId, label: node.data.label, category };

    if (category === 'Paper') {
      const paper = mockPapers.find((p) => p.id === nodeId);
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
      const author = mockAuthors.find((a) => `author-${a.name.replace(/\s+/g, '-').toLowerCase()}` === nodeId || a.id === nodeId);
      if (author) {
        details = {
          ...details,
          affiliation: author.affiliation,
          hIndex: author.hIndex,
          citations: author.citations,
          papersCount: author.papersCount
        };
      } else {
        details = {
          ...details,
          affiliation: 'Independent Academic Researcher',
          hIndex: 25,
          citations: 1800,
          papersCount: 14
        };
      }
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
    <div className="flex h-[calc(100vh-100px)] max-w-7xl mx-auto px-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm overflow-hidden select-none relative">
      
      {/* Central Flow Canvas */}
      <div className="flex-1 h-full relative">
        {/* Help Banner */}
        <div className="absolute top-4 left-4 z-10 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/40 bg-white/80 dark:bg-slate-950/80 text-[10px] font-semibold text-slate-500 dark:text-slate-400 backdrop-blur-md shadow max-w-[240px] leading-normal pointer-events-none">
          💡 **Explore the Graph**: Click and drag to pan. Use mouse wheel to zoom. Click any node to open details in the sidebar panel.
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
          <Background color="#cbd5e1" gap={16} size={1} className="dark:opacity-10" />
          <Controls className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800" />
          <MiniMap
            nodeStrokeColor={(n) => (n.type === 'customNode' ? '#6366f1' : '#ccc')}
            nodeColor={(n) => (n.type === 'customNode' ? '#818cf8' : '#eee')}
            maskColor="rgba(15, 23, 42, 0.08)"
            className="!bg-white/80 dark:!bg-slate-900/80 !border-slate-200 dark:!border-slate-800/50"
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
            className="w-80 h-full border-l border-slate-200/80 dark:border-slate-800/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 flex flex-col justify-between shadow-2xl relative z-10 overflow-y-auto"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3.5 mb-4.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/20">
                  {selectedNode.category} Node
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-3.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 leading-snug">
                  {selectedNode.title || selectedNode.label}
                </h3>

                {/* Author subtitle list if paper */}
                {selectedNode.authors && (
                  <p className="text-[11px] font-medium text-slate-500">
                    By {selectedNode.authors.join(', ')}
                  </p>
                )}

                {/* Stats Table/List */}
                {selectedNode.category === 'Paper' && (
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Citations</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-250 mt-1">
                        {selectedNode.citationCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Velocity</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-250 mt-1 flex items-center justify-center gap-0.5">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        {selectedNode.paperObj?.metrics?.citationVelocity || 120}
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.category === 'Author' && (
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">H-Index</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-250 mt-0.5">{selectedNode.hIndex}</div>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Cites</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-250 mt-0.5">{selectedNode.citations.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Papers</div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-250 mt-0.5">{selectedNode.papersCount}</div>
                    </div>
                  </div>
                )}

                {/* Main Text Content */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Semantic Summary</h4>
                  <p className="text-[11.5px] leading-relaxed text-slate-650 dark:text-slate-350 max-h-[140px] overflow-y-auto scrollbar-none">
                    {selectedNode.abstract || selectedNode.desc || 'No further description details available.'}
                  </p>
                </div>

                {/* Connected relationships list */}
                {selectedNode.relatedEntities && selectedNode.relatedEntities.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Connected Relations</h4>
                    <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-thin pr-0.5">
                      {selectedNode.relatedEntities.slice(0, 10).map((rel: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-900/40 text-[10.5px]"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-300 truncate max-w-[130px]" title={rel.label}>
                            {rel.label}
                          </span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/10">
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
            <div className="flex flex-col gap-2 mt-6 flex-shrink-0">
              {selectedNode.category === 'Paper' && (
                <button
                  onClick={handleSidebarViewDetails}
                  className="w-full h-9 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold shadow flex items-center justify-center gap-1"
                >
                  View Details Page
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={handleSidebarChatClick}
                className="w-full h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
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
