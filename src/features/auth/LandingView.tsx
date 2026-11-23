import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, X, Play } from 'lucide-react';

interface LandingViewProps {
  onNavigateAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateAuth }) => {
  const [activeModal, setActiveModal] = useState<'ABOUT' | 'DEMO' | null>(null);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  // Video Tour Data for Interactive Demo Modal
  const videoTourData = [
    {
      id: 'tour',
      title: 'Autonomous ResearchGraph Tour & 3D Synthesis',
      publisher: 'ResearchGraph Core Architecture',
      duration: '3:24',
      badge: 'Interactive Walkthrough',
      description: 'See live 3D graph vectorization, 45+ repository ingestion, and multi-LLM consensus synthesis operating in real-time.'
    },
    {
      id: 'neo4j',
      youtubeId: 'YVLwu3jE09c',
      title: 'What is a Knowledge Graph?',
      publisher: 'Neo4j Graph Database',
      duration: '2:36',
      badge: 'Graph Foundations',
      description: 'An authoritative introduction to nodes, edges, relationships, and how connected data transforms scientific discovery.'
    },
    {
      id: 'ibm',
      youtubeId: 'y7sXDpffzQQ',
      title: 'Knowledge Graphs, Clearly Explained',
      publisher: 'IBM Technology',
      duration: '6:12',
      badge: 'AI & Context',
      description: 'IBM Technology explains how connected information and ontological structures anchor LLMs to ground truth with zero hallucination.'
    },
    {
      id: 'stanford',
      youtubeId: 'JtDgmmQ60x8',
      title: 'Graph Neural Networks & Machine Learning on Graphs',
      publisher: 'Stanford Online • CS224W',
      duration: '4:50',
      badge: 'Deep Learning',
      description: 'Stanford CS224W lecture on Graph Neural Networks (GNNs), message passing algorithms, and topological embeddings for scientific discovery.'
    }
  ];

  // Bridge postMessage events from the 3D Citadel iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, payload } = event.data;

      if (type === 'NAVIGATE_AUTH') {
        const mode = (payload === 'SIGNUP' || payload === 'REGISTER') ? 'REGISTER' : 'LOGIN';
        onNavigateAuth(mode);
      } else if (type === 'LAUNCH_COCKPIT') {
        onNavigateAuth('LOGIN');
      } else if (type === 'SEARCH') {
        onNavigateAuth('LOGIN');
      } else if (type === 'OPEN_DEMO') {
        setActiveModal('DEMO');
      } else if (type === 'ABOUT') {
        setActiveModal('ABOUT');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigateAuth]);

  return (
    <div className="w-full h-full min-h-screen relative bg-[#04061a] overflow-hidden">
      {/* ─── 3D HANGING CITADEL & KNOWLEDGE UNIVERSE (WEBGL THREE.JS ENGINE) ─── */}
      <iframe
        src="/researchgraph_citadel_3d.html"
        className="w-full h-full border-0 block fixed inset-0 z-10"
        title="ResearchGraph AI 3D Knowledge Universe"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* ════════════════════════════════════════════════════════════ */}
      {/*               MODALS: ABOUT US & VIDEO DEMO                  */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[#091129] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'ABOUT' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                      <Network className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">About ResearchGraph AI</h2>
                      <span className="text-xs font-mono text-cyan-400">Autonomous Scientific Discovery Platform</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    ResearchGraph AI was developed to overcome the acute fragmentation of modern scientific research. With over 204M+ papers scattered across proprietary silos and isolated preprint archives, critical cross-disciplinary intersections frequently go undetected for years.
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    By combining hybrid vector-graph indexing with multi-LLM consensus verification (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro), ResearchGraph AI anchors every synthetic insight directly to peer-reviewed evidence with zero hallucination.
                  </p>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                    <div className="text-white font-semibold">CORE ARCHITECTURE SPECIFICATION:</div>
                    <div className="mt-1 text-cyan-300">• 204.8M Works Scanned across 45+ Scientific Fields</div>
                    <div className="text-cyan-300">• 1.24B Directional Citation Arcs Computed</div>
                    <div className="text-cyan-300">• Sub-14ms Multi-Hop Graph Traversal Latency</div>
                    <div className="text-cyan-300">• Real-Time Multi-Agent RAG Synthesis with Verified DOI Anchors</div>
                  </div>
                </div>
              )}

              {activeModal === 'DEMO' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {videoTourData.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVideoIdx(i)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          activeVideoIdx === i
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-lg font-bold text-white">{videoTourData[activeVideoIdx].title}</h3>
                  <p className="text-xs text-gray-300 mb-4">{videoTourData[activeVideoIdx].description}</p>

                  {videoTourData[activeVideoIdx].youtubeId ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/30 bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoTourData[activeVideoIdx].youtubeId}?autoplay=1&rel=0`}
                        title={videoTourData[activeVideoIdx].title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-black/60 border border-cyan-500/30 text-xs space-y-3 font-mono">
                      <div className="text-cyan-400 font-bold flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 text-cyan-400" />
                        <span>LIVE PLATFORM DEMONSTRATION SIMULATION</span>
                      </div>
                      <div className="text-gray-300">1. Broadcasting query across arXiv, PubMed, and OpenAlex</div>
                      <div className="text-gray-300">2. Vector clustering: 1,420 matched papers embedded into 3D topology</div>
                      <div className="text-gray-300">3. Multi-LLM consensus: 4 validated hypotheses synthesized</div>
                      <div className="text-emerald-400 font-semibold">✓ Ground truth confirmed with 100% verified citation badges</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
