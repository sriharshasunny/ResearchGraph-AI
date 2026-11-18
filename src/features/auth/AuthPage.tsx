Warning: truncated output (original token count: 35391)
Total output lines: 2066

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Network, Mail, Lock, User, ArrowRight, BrainCircuit, Sparkles, ArrowLeft, 
  Zap, Database, Layers, Info, X, Compass, Award, KeyRound, CheckCircle2,
  Play, ChevronDown, Activity, Cpu, Share2, Radio, FileText,
  Microscope, Binary, Eye, EyeOff, Loader2, Clock3
} from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';
import { InteractiveSpaceBackground } from '../../components/InteractiveSpaceBackground';
import { supabase } from '../../lib/supabase';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';
type InfoModalType = 'HOW_IT_WORKS' | 'SOURCES' | 'ABOUT' | 'DEMO' | null;

const TypingEffect: React.FC<{ text: string, trigger: any }> = ({ text, trigger }) => {
  const [displayedText, setDisplayedText] = useState('');

  React.useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(intervalId);
    }, 15);
    return () => clearInterval(intervalId);
  }, [text, trigger]);

  return <span>{displayedText}</span>;
};

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<'ai' | 'bio' | 'quantum' | 'materials' | 'neuro'>('ai');
  const [activeDemoQuery, setActiveDemoQuery] = useState(0);

  // Authentication State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topologySectionRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const sourcesSectionRef = useRef<HTMLDivElement>(null);
  const pipelineSectionRef = useRef<HTMLDivElement>(null);
  const sandboxSectionRef = useRef<HTMLDivElement>(null);

  const [selectedVideoIdx, setSelectedVideoIdx] = useState(0);
  const [activeSimChapter, setActiveSimChapter] = useState(0);
  const [isSimPlaying, setIsSimPlaying] = useState(true);

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'globe_wheel' && scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ top: e.data.deltaY, behavior: 'auto' });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const trimmedEmail = email.trim();
      if (authMode === 'REGISTER') {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: fullName.trim() }
          }
        });
        if (error) throw error;
        onAuthComplete();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });
        if (error) throw error;
        onAuthComplete();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const triggerTraversal = (destination: PageState, mode?: AuthMode) => {
    setPageState(destination);
    if (mode) setAuthMode(mode);
    setActiveModal(null);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveModal(null);
  };

  // Demo queries for the interactive sandbox
  const demoQueries = [
    {
      query: "How do Graph Neural Networks improve molecular drug discovery?",
      domain: "Biomedical AI",
      nodesFound: 428,
      papersFound: 1420,
      confidence: "98.4%",
      summary: "GNNs model molecular structures as graphs where atoms are nodes and covalent bonds are edges. Message-passing neural networks (MPNNs) effectively predict ADMET pharmacokinetics and bind affinities, reducing initial synthesis cycles by ~68% across recent Stanford and DeepMind clinical trials.",
      papers: [
        { title: "Pushing the Boundaries of Molecular Property Prediction with Graph Neural Networks", authors: "K. Yang et al.", journal: "ACS Cent. Sci.", citations: "1,842", doi: "10.1021/acscentsci.9b00476" },
        { title: "Geometric Deep Learning Grids for Structure-Based Drug Discovery", authors: "M. Bronstein et al.", journal: "Nature Biotech.", citations: "2,310", doi: "10.1038/s41587-021-00984-3" }
      ],
      connections: ["ADMET Profiling", "Message Passing Networks", "Protein-Ligand Docking", "E(3)-Equivariance"]
    },
    {
      query: "Topological quantum error correction using surface codes",
      domain: "Quantum Computing",
      nodesFound: 312,
      papersFound: 980,
      confidence: "97.1%",
      summary: "Surface codes encode logical qubits into 2D lattices of physical qubits using stabilizer measurements. Anyonic excitations (syndrome measurements) allow real-time decoding via Minimum Weight Perfect Matching (MWPM), demonstrating fault-tolerant threshold fidelity above 99.3%.",
      papers: [
        { title: "Fault-tolerant quantum computation with surface codes", authors: "A. G. Fowler et al.", journal: "Phys. Rev. A", citations: "3,140", doi: "10.1103/PhysRevA.86.032324" },
        { title: "Suppressing quantum errors by scaling a quantum error-correcting code", authors: "Google Quantum AI", journal: "Nature", citations: "1,120", doi: "10.1038/s41586-022-05434-1" }
      ],
      connections: ["MWPM Decoders", "Stabilizer Formalism", "Toric Code Topology", "Logical Qubits"]
    },
    {
      query: "Multi-modal foundation models for clinical oncology diagnosis",
      domain: "Clinical Oncology",
      nodesFound: 516,
      papersFound: 2180,
      confidence: "99.1%",
      summary: "Cross-attention transformers fusing whole slide pathology images (WSIs), genomic sequencing, and radiological CT/MRI scans demonstrate statistically significant AUC improvements (+0.14) over unimodal architectures in predicting 5-year patient survival rates.",
      papers: [
        { title: "Multimodal Foundation Models in Pathology and Oncology", authors: "F. Chen et al.", journal: "Cell Genomics", citations: "890", doi: "10.1016/j.xgen.2023.100345" },
        { title: "Deep learning-enabled medical computer vision in histopathology", authors: "J. Lipkova et al.", journal: "Nature Medicine", citations: "1,520", doi: "10.1038/s41591-022-01764-w" }
      ],
      connections: ["Whole Slide Imaging", "Survival Prediction AUC", "Cross-Attention Fusion", "Genomic Stratification"]
    },
    {
      query: "CRISPR-Cas12 target specificity compared to Cas9",
      domain: "Gene Editing",
      nodesFound: 384,
      papersFound: 1650,
      confidence: "98.8%",
      summary: "Cas12a (Cpf1) creates staggered double-strand breaks with 4-5 nucleotide 5'-overhangs using a single T-rich PAM (TTTV), demonstrating significantly reduced off-target cleavage compared to canonical SpCas9 in mammalian ex vivo therapeutic edits.",
      papers: [
        { title: "Cpf1 Is a Single RNA-Guided Endonuclease of a Class 2 CRISPR-Cas System", authors: "B. Zetsche, F. Zhang et al.", journal: "Cell", citations: "4,210", doi: "10.1016/j.cell.2015.09.038" },
        { title: "Genome-wide specificities of CRISPR-Cas9 vs Cas12a ribonucleoproteins", authors: "J. S. Kim et al.", journal: "Nature Biotech.", citations: "1,390", doi: "10.1038/nbt.3609" }
      ],
      connections: ["PAM Specificity (TTTV)", "Staggered Cleavage Overhangs", "Off-Target GUIDESeq", "Ex Vivo Gene Therapy"]
    }
  ];

  const landingVideos = [
    {
      id: 'tour',
      youtubeId: null,
      title: 'Autonomous ResearchGraph Tour & 3D Synthesis',
      publisher: 'ResearchGraph Core Team',
      duration: '3:24',
      badge: 'Interactive Walkthrough',
      tagColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
      description: 'See live 3D graph vectorization, 45+ repository ingestion, and multi-LLM consensus synthesis operating in real-time.',
      highlights: ['Sub-15ms Latency', 'Multi-Hop Graph Walks', '1536-Dim GNN Embeddings', 'Verifiable Citations']
    },
    {
      id: 'neo4j',
      youtubeId: 'YVLwu3jE09c',
      title: 'What is a Knowledge Graph?',
      publisher: 'Neo4j Graph Database',
      duration: '2:36',
      badge: 'Graph Foundations',
      tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      description: 'An authoritative introduction to nodes, edges, relationships, and how connected data transforms scientific discovery.',
      highlights: ['Semantic Property Graphs', 'Entities & Relationships', 'Relational vs Graph', 'Multi-Hop Traversal']
    },
    {
      id: 'ibm',
      youtubeId: 'y7sXDpffzQQ',
      title: 'Knowledge Graphs, Clearly Explained',
      publisher: 'IBM Technology',
      duration: '6:12',
      badge: 'AI & Context',
      tagColor: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
      description: 'IBM Technology explains how connected information and ontological structures anchor LLMs to ground truth with zero hallucination.',
      highlights: ['Contextual Grounding', 'Entity Disambiguation', 'Ontology Engineering', 'LLM Integration']
    },
    {
      id: 'stanford',
      youtubeId: 'JtDgmmQ60x8',
      title: 'Graph Neural Networks & Machine Learning on Graphs',
      publisher: 'Stanford Online • CS224W',
      duration: '4:50',
      badge: 'Deep Learning',
      tagColor: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      description: 'Stanford CS224W lecture on Graph Neural Networks (GNNs), message passing algorithms, and topological embeddings for scientific discovery.',
      highlights: ['Message Passing (MPNN)', 'Permutation Invariance', 'Graph Convolutional Networks', 'Biomedical Discovery']
    }
  ];

  const simulationChapters = [
    {
      title: '01 • Multimodal Document Ingestion',
      metric: '45+ Sources Active',
      detail: 'Continuous stream parsing LaTeX equations, tables, figures, and author networks across arXiv, PubMed, and IEEE.',
      badge: 'Ingestion Phase',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      title: '02 • 3D Topology & GNN Clustering',
      metric: '204.8M Nodes Mapped',
      detail: 'Spatial projection into 1536-dimensional manifold where conceptual similarity translates to geometric Euclidean distance.',
      badge: 'Graph Engine',
      color: 'from-cyan-400 to-emerald-400'
    },
    {
      title: '03 • Hybrid Dense & Graph Retrieval',
      metric: '14ms Traversal',
      detail: 'Traversing multi-hop citation paths across interdisciplinary bridge papers to uncover hidden cross-domain solutions.',
      badge: 'Retrieval Phase',
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: '04 • Multi-LLM Consensus Synthesis',
      metric: '100% Citation Grounding',
      detail: 'Ensemble consensus of GPT-4o, Claude 3.5, and Gemini generating verifiable literature reviews with direct DOI links.',
      badge: 'Synthesis Phase',
      color: 'from-emerald-400 to-teal-300'
    }
  ];

  useEffect(() => {
    if (!isSimPlaying || landingVideos[selectedVideoIdx].id !== 'tour') return;
    const timer = setInterval(() => {
      setActiveSimChapter(prev => (prev + 1) % 4);
    }, 4200);
    return () => clearInterval(timer);
  }, [isSimPlaying, selectedVideoIdx]);

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 fixed inset-0">
      
      {/* --- SMOOTH SCROLL PROGRESS BAR --- */}
      {pageState === 'LANDING' && (
        <motion.div
          style={{ scaleX }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 origin-left z-[100] shadow-[0_0_12px_rgba(6,182,212,0.8)]"
        />
      )}

      {/* --- INTERACTIVE 3D SPACE BACKGROUND --- */}
      <InteractiveSpaceBackground pageState={pageState} authMode={authMode} />

      {/* --- PAGE CONTENT CONTAINER --- */}
      <div 
        ref={scrollContainerRef}
        className="relative z-20 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <AnimatePresence mode="wait">
          
          {/* ==================================================== */}
          {/*                   LANDING PAGE                       */}
          {/* ==================================================== */}
          {pageState === 'LANDING' && (
            <motion.div 
              key="landing-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full flex flex-col relative"
            >
              {/* ═══════════════ PRO TOP NAVBAR WITH VIBRANT COLORED ICONS ═══════════════ */}
              <nav className="w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-[1520px] mx-auto mt-3 px-4 sm:px-7 py-2.5 flex items-center justify-between rounded-2xl bg-[#050b1c]/75 backdrop-blur-2xl border border-cyan-200/15 sticky top-3 z-50 shadow-[0_18px_42px_-25px_rgba(0,0,0,0.95)]">
                {/* Brand Logo with Glowing Aura */}
                <div 
                  className="flex items-center gap-3 cursor-pointer group" 
                  onClick={() => {
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveModal(null);
                  }}
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative w-10 h-10 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-gradient-to-br from-[#06122c] to-[#040816] shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-all">
                      <Network className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-100 transition-colors">
                      ResearchGraph <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">AI</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono font-bold tracking-wider shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      v2.4
                    </span>
                  </div>
                </div>
                
                {/* Center Navigation Links with Vivid Colored Icons */}
                <div className="hidden lg:flex items-center gap-1.5 bg-[#091124]/90 border border-white/15 rounded-full p-1.5 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  <button 
                    onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all flex items-center gap-2 group"
                  >
                    <Compass className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
                    <span>Cockpit View</span>
                  </button>

                  <button 
                    onClick={() => scrollToSection(topologySectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-cyan-200 rounded-full hover:bg-cyan-500/15 transition-all flex items-center gap-2 group"
                  >
                    <Network className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span>3D Topology</span>
                  </button>

                  <button 
                    onClick={() => scrollToSection(videoSectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-cyan-200 rounded-full hover:bg-cyan-500/15 transition-all flex items-center gap-2 group"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>Watch Tour</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-mono font-bold">4 Videos</span>
                  </button>

                  <button 
                    onClick={() => scrollToSection(pipelineSectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-purple-200 rounded-full hover:bg-purple-500/15 transition-all flex items-center gap-2 group"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>RAG Pipeline</span>
                  </button>

                  <button 
                    onClick={() => scrollToSection(sourcesSectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-emerald-200 rounded-full hover:bg-emerald-500/15 transition-all flex items-center gap-2 group"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Data Sources</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-mono font-bold">45+</span>
                  </button>

                  <button 
                    onClick={() => setActiveModal('ABOUT')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-sky-200 rounded-full hover:bg-sky-500/15 transition-all flex items-center gap-2 group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
                    <span>About Us</span>
                  </button>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button 
                    onClick={() => triggerTraversal('AUTH', 'LOGIN')} 
                    className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all px-3.5 sm:px-4 py-2 rounded-xl hover:bg-white/10 border border-white/10 hover:border-cyan-400/40"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => triggerTraversal('AUTH', 'REGISTER')} 
                    className="relative group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30"></div>
                    <div className="relative flex items-center gap-2">
                      <span>Launch Cockpit</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                  
                  {/* Mobile Menu Trigger */}
                  <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </nav>

              {/* Mobile Dropdown Menu with Colored Icons */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="lg:hidden w-full bg-[#070b18]/98 border-b border-white/15 px-6 py-4 flex flex-col gap-2 relative z-40 backdrop-blur-2xl"
                  >
                    <button 
                      onClick={() => { scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }}
                      className="text-left py-2.5 px-3 text-sm font-semibold text-gray-300 hover:bg-white/10 rounded-xl flex items-center gap-2.5"
                    >
                      <Compass className="w-4 h-4 text-cyan-400" /> Cockpit View
                    </button>
                    <button 
                      onClick={() => { scrollToSection(topologySectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2.5 px-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/15 rounded-xl flex items-center gap-2.5"
                    >
                      <Network className="w-4 h-4 text-indigo-400" /> 3D Topology
                    </button>
                    <button 
                      onClick={() => { scrollToSection(videoSectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2.5 px-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/15 rounded-xl flex items-center gap-2.5"
                    >
                      <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Watch Videos & Tour
                    </button>
                    <…23391 tokens truncated…iterature reviews and patent analysis.
                              </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                              <h3 className="font-bold text-sm text-emerald-300 mb-1 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                Verifiable Citations, Zero Hallucinations
                              </h3>
                              <p className="text-xs text-gray-300 leading-relaxed">
                                Every generated summary and hypothesis is grounded in verbatim citations, DOIs, and direct links to peer-reviewed source literature.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Join the scientific revolution today.</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/30"
                            >
                              Join Free Today
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- MODAL 4: INTERACTIVE DEMO & VIDEO WALKTHROUGH --- */}
                      {activeModal === 'DEMO' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Interactive Platform Demonstration
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Cockpit Research Traversal & Video Tour</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Experience how ResearchGraph AI automates months of literature discovery into seconds of deep graph traversal.
                          </p>

                          {/* Embedded Video / Interactive Player */}
                          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/90 border border-cyan-500/40 mb-6 shadow-2xl">
                            <iframe
                              src="https://www.youtube-nocookie.com/embed/YVLwu3jE09c?autoplay=1&rel=0&modestbranding=1"
                              title="What is a Knowledge Graph?"
                              className="w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>

                          <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 mb-6">
                            <div className="flex items-center justify-between mb-3 text-xs font-mono text-gray-400">
                              <span className="text-cyan-400 font-bold">SIMULATION: GNN DRUG DISCOVERY</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                ACTIVE SYNTHESIS
                              </span>
                            </div>

                            <div className="space-y-2.5 text-xs">
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">01</span>
                                <div>
                                  <span className="text-white font-semibold block">Parallel Ingestion Stream</span>
                                  <span className="text-gray-400 text-[11px]">Broadcasting query to arXiv, PubMed, IEEE, CrossRef (1,420 matched candidates)</span>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">02</span>
                                <div>
                                  <span className="text-cyan-300 font-semibold block">3D Topology & GNN Message Passing</span>
                                  <span className="text-gray-400 text-[11px]">Extracting ADMET prediction cluster & E(3)-equivariant graph neural networks</span>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">03</span>
                                <div>
                                  <span className="text-emerald-300 font-semibold block">Multi-LLM Consensus Synthesis</span>
                                  <span className="text-gray-400 text-[11px]">Ensemble generated 4 key hypotheses with 100% verified citation anchors</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                            <button
                              onClick={() => {
                                setActiveModal(null);
                                scrollToSection(videoSectionRef);
                              }}
                              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5" /> Watch all 4 videos in full theater
                            </button>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                              Launch Explorer Now <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* ==================================================== */}
          {/*                   AUTH / LOGIN / SIGNUP              */}
          {/* ==================================================== */}
          {pageState === 'AUTH' && (
            <motion.div 
              key="auth-page"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full min-h-screen flex items-center justify-center relative p-4 sm:p-8 z-50"
            >
              {/* BACK TO BASE BUTTON */}
              <button 
                onClick={() => triggerTraversal('LANDING')} 
                className="absolute top-6 left-6 z-[110] px-4 py-2 rounded-full bg-[#0a0f1c]/90 border border-white/15 flex items-center gap-2 hover:bg-white/10 hover:border-cyan-500/40 transition-all backdrop-blur-md shadow-xl"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-xs sm:text-sm text-gray-200">Return to Base</span>
              </button>

              <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 lg:gap-14 items-center justify-center relative z-20 pt-16 md:pt-0">
                
                {/* 3D QUANTUM NEURAL CORE HUD */}
                <div className="flex-1 flex flex-col items-center justify-center max-w-lg">
                  
                  {/* The Real WebGL 3D Quantum Core with Ambient Backglow */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
                    <div className={`absolute w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-colors duration-700 ${
                      authMode === 'LOGIN' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                    }`} />
                    <ThreeNeuralCore 
                      className="w-full h-full" 
                      theme={authMode === 'LOGIN' ? 'cyan' : 'purple'} 
                      interactive={true}
                    />
                  </div>
                  
                  {/* High-Tech Telemetry HUD */}
                  <div className="mt-2 text-center max-w-md px-4">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider border transition-colors duration-500 ${
                        authMode === 'LOGIN' 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                          : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-ping ${authMode === 'LOGIN' ? 'bg-cyan-400' : 'bg-purple-400'}`}></span>
                        <span>3D NEURAL UPLINK ACTIVE</span>
                      </div>
                      <span className="text-[10px] text-gray-300 font-mono bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                        ✦ DRAG TO ROTATE
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      {authMode === 'LOGIN' ? 'Quantum Knowledge Grid' : 'Neural Node Genesis'}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                      {authMode === 'LOGIN' 
                        ? 'Connected to the decentralized scientific graph. Authenticate to sync your papers and explore 3D citation maps.' 
                        : 'Generate your cryptographic researcher identity to contribute hypotheses and synthesize discoveries.'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-gray-400 border-t border-white/10 pt-3">
                      <div className="bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-cyan-400 font-bold block">204.8M</span> Papers
                      </div>
                      <div className="bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-purple-400 font-bold block">14ms</span> Latency
                      </div>
                      <div className="bg-white/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-emerald-400 font-bold block">TLS 1.3</span> Encrypted
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREMIUM GLASSMORPHIC AUTH CARD */}
                <div className={`w-full max-w-[440px] bg-[#080d1a]/95 backdrop-blur-3xl border rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative z-20 transition-all duration-500 ${
                  authMode === 'LOGIN' 
                    ? 'border-white/15 hover:border-cyan-500/40 shadow-cyan-950/20' 
                    : 'border-white/15 hover:border-purple-500/40 shadow-purple-950/20'
                }`}>
                  
                  {/* Subtle Top Specular Accent Line */}
                  <div className={`absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent transition-colors duration-500 ${
                    authMode === 'LOGIN' ? 'via-cyan-400/60' : 'via-purple-400/60'
                  }`} />

                  {/* Mode Switcher Tabs */}
                  <div className="flex p-1 bg-black/50 rounded-2xl border border-white/10 mb-6">
                    <button 
                      type="button"
                      onClick={() => setAuthMode('LOGIN')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        authMode === 'LOGIN' 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Sign In
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthMode('REGISTER')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                        authMode === 'REGISTER' 
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Create Account
                    </button>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
                    {authMode === 'LOGIN' ? 'Supabase Secure Login' : 'Create Researcher ID'}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm text-center mb-6">
                    {authMode === 'LOGIN' ? 'Access your research universe and knowledge maps.' : 'Join 140K+ researchers mapping scientific literature.'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {authMode === 'REGISTER' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                          <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                            <input 
                              type="text" 
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Dr. Elena Vance" 
                              required={authMode === 'REGISTER'} 
                              className="w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all text-sm" 
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${authMode === 'LOGIN' ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                          placeholder="admin@researchgraph.ai" 
                          required 
                          className={`w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                            authMode === 'LOGIN' 
                              ? 'focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50' 
                              : 'focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50'
                          }`} 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider block">Password</label>
                        {authMode === 'LOGIN' && (
                          <span className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer">Forgot?</span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${authMode === 'LOGIN' ? 'text-cyan-400' : 'text-purple-400'}`} />
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                          placeholder="••••••••••••" 
                          required 
                          className={`w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                            authMode === 'LOGIN' 
                              ? 'focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50' 
                              : 'focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50'
                          }`} 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Features checklist for register mode */}
                    {authMode === 'REGISTER' && (
                      <div className="text-[11px] text-gray-400 space-y-1 py-1">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Unlimited 3D Knowledge Graph querying</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Autonomous citation analysis and RAG summaries</span>
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {authError && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, height: 0 }}
                          className="w-full p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2"
                        >
                          <Info className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span className="text-xs text-red-200 font-semibold">{authError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      type="submit" 
                      disabled={isAuthenticating}
                      className={`w-full text-white rounded-xl py-3.5 mt-4 font-bold flex items-center justify-center gap-2 transition-all text-sm tracking-wide shadow-lg ${
                        isAuthenticating ? 'opacity-80 cursor-wait' : ''
                      } ${
                        authMode === 'LOGIN'
                          ? 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25 hover:shadow-cyan-500/40'
                          : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40'
                      }`}
                    >
                      {isAuthenticating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> 
                          {authMode === 'LOGIN' ? 'Authenticating...' : 'Initializing Account...'}
                        </>
                      ) : (
                        <>
                          {authMode === 'LOGIN' ? 'Launch Platform' : 'Initialize Account'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                  </form>

                  <div className="mt-6 text-center text-xs text-gray-400 border-t border-white/10 pt-5">
                    {authMode === 'LOGIN' ? "Don't have an account? " : "Already registered? "}
                    <button 
                      onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                      className={`font-semibold ml-1 transition-colors ${
                        authMode === 'LOGIN' ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-400 hover:text-purple-300'
                      }`}
                    >
                      {authMode === 'LOGIN' ? 'Sign up free' : 'Log in here'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

