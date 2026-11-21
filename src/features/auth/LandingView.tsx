import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, ArrowRight, Search, BrainCircuit, Sparkles, 
  Zap, Database, Layers, Info, X, Compass, Award, CheckCircle2,
  Play, ChevronDown, Activity, Share2, FileText,
  Microscope, Binary, GitCompare, Orbit, User
} from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';

interface LandingViewProps {
  onNavigateAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

// Typewriter effect for simulated synthesis
const TypingText: React.FC<{ text: string; trigger: any }> = ({ text, trigger }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 12);
    return () => clearInterval(timer);
  }, [text, trigger]);

  return <span>{displayed}</span>;
};

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'graph' | 'rag' | 'gaps' | 'compare'>('graph');
  const [selectedDomain, setSelectedDomain] = useState<'ai' | 'bio' | 'quantum' | 'materials' | 'neuro'>('ai');
  const [activeDemoIdx, setActiveDemoIdx] = useState(0);
  const [activeModal, setActiveModal] = useState<'ABOUT' | 'SOURCES' | 'PIPELINE' | 'VIDEO' | null>(null);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topologyRef = useRef<HTMLDivElement>(null);
  const cockpitRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const sandboxRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
    setActiveModal(null);
  };

  // Scroll reveal trigger
  useEffect(() => {
    const targets = document.querySelectorAll('.landing-reveal, .landing-reveal-left, .landing-reveal-right, .landing-reveal-scale');
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateAuth('LOGIN');
  };

  // Interactive Hypothesis Sandbox Queries
  const demoQueries = [
    {
      query: "How do Graph Neural Networks improve molecular drug discovery?",
      domain: "Biomedical AI",
      category: "Molecular Biology & AI",
      nodesFound: 428,
      papersFound: 1420,
      confidence: "98.4%",
      latency: "12ms",
      summary: "GNNs model molecular structures as geometric graphs where atoms are nodes and chemical bonds are edges. Message-passing neural networks (MPNNs) predict ADMET pharmacokinetics and binding affinities, reducing initial synthesis cycles by ~68% across Stanford and DeepMind clinical trials.",
      papers: [
        { title: "Pushing the Boundaries of Molecular Property Prediction with Graph Neural Networks", authors: "K. Yang et al.", journal: "ACS Cent. Sci.", citations: "1,842", doi: "10.1021/acscentsci.9b00476" },
        { title: "Geometric Deep Learning Grids for Structure-Based Drug Discovery", authors: "M. Bronstein et al.", journal: "Nature Biotech.", citations: "2,310", doi: "10.1038/s41587-021-00984-3" }
      ],
      connections: ["ADMET Profiling", "Message Passing Networks", "Protein-Ligand Docking", "E(3)-Equivariance"]
    },
    {
      query: "Topological quantum error correction using surface codes",
      domain: "Quantum Computing",
      category: "Quantum Physics & Information",
      nodesFound: 312,
      papersFound: 980,
      confidence: "97.1%",
      latency: "9ms",
      summary: "Surface codes encode logical qubits into 2D lattices of physical qubits using stabilizer measurements. Anyonic excitations allow real-time decoding via Minimum Weight Perfect Matching (MWPM), demonstrating fault-tolerant threshold fidelity above 99.3%.",
      papers: [
        { title: "Fault-tolerant quantum computation with surface codes", authors: "A. G. Fowler et al.", journal: "Phys. Rev. A", citations: "3,140", doi: "10.1103/PhysRevA.86.032324" },
        { title: "Suppressing quantum errors by scaling a quantum error-correcting code", authors: "Google Quantum AI", journal: "Nature", citations: "1,120", doi: "10.1038/s41586-022-05434-1" }
      ],
      connections: ["MWPM Decoders", "Stabilizer Formalism", "Toric Code Topology", "Logical Qubits"]
    },
    {
      query: "Multi-modal foundation models for clinical oncology diagnosis",
      domain: "Clinical Oncology",
      category: "Translational Medicine",
      nodesFound: 516,
      papersFound: 2180,
      confidence: "99.1%",
      latency: "14ms",
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
      category: "Synthetic Genomics",
      nodesFound: 384,
      papersFound: 1650,
      confidence: "98.8%",
      latency: "11ms",
      summary: "Cas12a (Cpf1) creates staggered double-strand breaks with 4-5 nucleotide 5'-overhangs using a single T-rich PAM (TTTV), demonstrating significantly reduced off-target cleavage compared to canonical SpCas9 in mammalian ex vivo therapeutic edits.",
      papers: [
        { title: "Cpf1 Is a Single RNA-Guided Endonuclease of a Class 2 CRISPR-Cas System", authors: "B. Zetsche, F. Zhang et al.", journal: "Cell", citations: "4,210", doi: "10.1016/j.cell.2015.09.038" },
        { title: "Genome-wide specificities of CRISPR-Cas9 vs Cas12a ribonucleoproteins", authors: "J. S. Kim et al.", journal: "Nature Biotech.", citations: "1,390", doi: "10.1038/nbt.3609" }
      ],
      connections: ["PAM Specificity (TTTV)", "Staggered Cleavage Overhangs", "Off-Target GUIDESeq", "Ex Vivo Gene Therapy"]
    }
  ];

  // Video Tour Hub Data
  const videoTourData = [
    {
      id: 'tour',
      title: 'Autonomous ResearchGraph Tour & 3D Synthesis',
      publisher: 'ResearchGraph Core Architecture',
      duration: '3:24',
      badge: 'Interactive Walkthrough',
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
      description: 'Stanford CS224W lecture on Graph Neural Networks (GNNs), message passing algorithms, and topological embeddings for scientific discovery.',
      highlights: ['Message Passing (MPNN)', 'Permutation Invariance', 'Graph Convolutional Networks', 'Biomedical Discovery']
    }
  ];

  return (
    <div ref={scrollContainerRef} className="w-full flex flex-col relative text-white font-sans selection:bg-cyan-500/30">
      
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*                                0. PRO TOP NAVBAR                                   */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <nav className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[#030712]/80 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-50 shadow-2xl shadow-black/80">
        
        {/* Brand Logo with Glowing Orbital Aura */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-10 h-10 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-gradient-to-br from-[#06122c] to-[#040816] shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-all">
              <Network className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-100 transition-colors">
              ResearchGraph <span className="gradient-text-animated">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono font-bold tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              v2.4
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-[#091124]/90 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-2xl shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => scrollTo(cockpitRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all flex items-center gap-1.5 group"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span>Cockpit</span>
          </button>

          <button 
            onClick={() => scrollTo(topologyRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-cyan-200 rounded-full hover:bg-cyan-500/15 transition-all flex items-center gap-1.5 group"
          >
            <Orbit className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>3D Topology</span>
          </button>

          <button 
            onClick={() => scrollTo(pipelineRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-purple-200 rounded-full hover:bg-purple-500/15 transition-all flex items-center gap-1.5 group"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>RAG Pipeline</span>
          </button>

          <button 
            onClick={() => scrollTo(sourcesRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-emerald-200 rounded-full hover:bg-emerald-500/15 transition-all flex items-center gap-1.5 group"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Data Sources</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-mono font-bold">45+</span>
          </button>

          <button 
            onClick={() => scrollTo(sandboxRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-sky-200 rounded-full hover:bg-sky-500/15 transition-all flex items-center gap-1.5 group"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Live Sandbox</span>
          </button>

          <button 
            onClick={() => setActiveModal('ABOUT')}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-sky-200 rounded-full hover:bg-sky-500/15 transition-all flex items-center gap-1.5 group"
          >
            <Info className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span>About Us</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button 
            onClick={() => onNavigateAuth('LOGIN')} 
            className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all px-3.5 sm:px-4 py-2 rounded-xl hover:bg-white/10 border border-white/10 hover:border-cyan-400/40"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigateAuth('REGISTER')} 
            className="relative group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all overflow-hidden shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.98] border border-cyan-400/40"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300"></div>
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

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden w-full bg-[#070b18]/98 border-b border-white/15 px-6 py-4 flex flex-col gap-2 relative z-40 backdrop-blur-2xl"
          >
            <button 
              onClick={() => scrollTo(cockpitRef)}
              className="text-left py-2 px-3 text-sm font-semibold text-gray-300 hover:bg-white/10 rounded-xl flex items-center gap-2.5"
            >
              <Compass className="w-4 h-4 text-cyan-400" /> Cockpit View
            </button>
            <button 
              onClick={() => scrollTo(topologyRef)}
              className="text-left py-2 px-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/15 rounded-xl flex items-center gap-2.5"
            >
              <Orbit className="w-4 h-4 text-purple-400" /> 3D Topology
            </button>
            <button 
              onClick={() => scrollTo(pipelineRef)}
              className="text-left py-2 px-3 text-sm font-semibold text-purple-300 hover:bg-purple-500/15 rounded-xl flex items-center gap-2.5"
            >
              <Zap className="w-4 h-4 text-amber-400" /> RAG Pipeline
            </button>
            <button 
              onClick={() => scrollTo(sourcesRef)}
              className="text-left py-2 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15 rounded-xl flex items-center gap-2.5"
            >
              <Database className="w-4 h-4 text-emerald-400" /> Data Sources (45+ Repos)
            </button>
            <button 
              onClick={() => scrollTo(sandboxRef)}
              className="text-left py-2 px-3 text-sm font-semibold text-sky-300 hover:bg-sky-500/15 rounded-xl flex items-center gap-2.5"
            >
              <BrainCircuit className="w-4 h-4 text-sky-400" /> Live Sandbox
            </button>
            <button 
              onClick={() => { setActiveModal('ABOUT'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 text-sm font-semibold text-gray-300 hover:bg-white/10 rounded-xl flex items-center gap-2.5"
            >
              <Info className="w-4 h-4 text-sky-400" /> About ResearchGraph AI
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*      1. THE GALACTIC HERO SECTION (MATCHING REFERENCE ARTWORK & PRO DESIGN)          */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-transparent">
        
        {/* Top Status Bar with Live Telemetry */}
        <div className="w-full h-9 bg-gradient-to-b from-[#040816]/90 via-[#060c20]/60 to-transparent flex items-center justify-between px-6 sm:px-12 border-b border-cyan-500/20 z-20 pointer-events-none">
          <div className="flex items-center gap-2.5 text-[9px] font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="tracking-wider">RESEARCH INTELLIGENCE, REIMAGINED</span>
          </div>
          <div className="hidden sm:flex items-center gap-5 text-[9px] font-mono text-gray-400">
            <span className="text-purple-400 font-semibold">✦ 3D VECTOR TOPOLOGY: ACTIVE</span>
            <span className="text-cyan-400 font-semibold">● MULTI-LLM RAG CONSENSUS</span>
            <span className="text-emerald-400 font-semibold">● 45+ SOURCES SYNCHRONIZED</span>
          </div>
        </div>

        {/* Ambient Nebula Glow Behind 3D Core */}
        <div className="absolute top-[35%] right-[20%] -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-500/[0.12] via-purple-600/[0.08] to-transparent blur-[160px] pointer-events-none z-0"></div>
        <div className="absolute top-[20%] left-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-purple-600/[0.08] to-fuchsia-500/[0.04] blur-[140px] pointer-events-none z-0"></div>

        {/* ── MAIN HERO GRID: LEFT HEADLINE + RIGHT 3D NEURAL CORE ── */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-14 lg:pt-16 pb-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          
          {/* LEFT: HERO COPY & CALL TO ACTIONS */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col items-start text-left max-w-xl z-30"
          >
            {/* Reference Badge: RESEARCH INTELLIGENCE, REIMAGINED */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/15 to-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-lg backdrop-blur-md animate-neon-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              ✦ RESEARCH INTELLIGENCE, REIMAGINED
            </div>

            {/* Massive Punchy Headline: "Research, Connected." */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black tracking-tight leading-[1.04] mb-4 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              Research,<br />
              <span className="gradient-text-animated">
                Connected.
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-5 max-w-lg drop-shadow-md">
              Discover, explore, and connect research papers, authors, and ideas through an intelligent knowledge graph powered by AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-5">
              <button 
                onClick={() => onNavigateAuth('REGISTER')}
                className="group px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/35 flex items-center gap-2.5 border border-cyan-400/40 hover:scale-[1.04] active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4 text-cyan-200" />
                <span>Explore Research Graph</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setActiveModal('VIDEO')}
                className="group px-5 py-3 rounded-2xl glass-card hover:border-cyan-400/50 text-gray-200 hover:text-white font-bold text-sm transition-all flex items-center gap-2.5 hover:bg-white/10 shadow-lg"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
                  <Play className="w-3 h-3 text-cyan-300 fill-cyan-300 group-hover:scale-110 transition-transform" />
                </div>
                <span>Watch Overview</span>
              </button>
            </div>

            {/* Feature Pills Row (Exact from uploaded image: Discover, Connect, Understand) */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              {[
                { icon: Search, label: 'Discover', desc: 'Find relevant work', color: 'text-cyan-400', border: 'border-cyan-500/30' },
                { icon: Share2, label: 'Connect', desc: 'Follow context', color: 'text-purple-400', border: 'border-purple-500/30' },
                { icon: Sparkles, label: 'Understand', desc: 'Get deeper insights', color: 'text-emerald-400', border: 'border-emerald-500/30' },
              ].map((pill, idx) => {
                const Icon = pill.icon;
                return (
                  <div key={idx} className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl glass-card border ${pill.border} hover:bg-white/10 transition-all cursor-default group`}>
                    <Icon className={`w-4 h-4 ${pill.color} group-hover:scale-110 transition-transform`} />
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">{pill.label}</span>
                      <span className="text-[10px] text-gray-400 block leading-tight">{pill.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Natural Language Prompt bar in Hero */}
            <form 
              onSubmit={handleHeroSearch}
              className="w-full max-w-lg group relative"
            >
              <div className="relative flex items-center bg-[#070e24]/90 border border-cyan-500/40 rounded-2xl px-4 py-2.5 backdrop-blur-2xl focus-within:border-cyan-300 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all">
                <Search className="w-4 h-4 text-cyan-400 mr-2.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask anything about 200M+ academic papers..."
                  className="w-full bg-transparent text-white placeholder-gray-400 text-xs sm:text-sm font-sans focus:outline-none"
                />
                <button 
                  type="submit"
                  className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95"
                >
                  <span>Ask AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </motion.div>

          {/* RIGHT: 3D HOLOGRAPHIC NEURAL CORE + ORBITAL FLOATING BADGES */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px] flex items-center justify-center flex-shrink-0"
          >
            {/* Radiant Atmosphere Pulsing Halo */}
            <div className="absolute w-[85%] h-[85%] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.22)_0%,rgba(147,51,234,0.14)_45%,transparent_72%)] blur-3xl pointer-events-none animate-pulse"></div>
            
            {/* Concentric Orbital Guides */}
            <div className="absolute w-[104%] h-[104%] rounded-full border border-dashed border-cyan-500/15 animate-orbit-spin pointer-events-none"></div>
            <div className="absolute w-[80%] h-[80%] rounded-full border border-purple-500/10 pointer-events-none" style={{ animation: 'orbit-spin 40s linear infinite reverse' }}></div>

            {/* The 3D Neural Core Model */}
            <div className="absolute inset-[6%] z-10">
              <ThreeNeuralCore className="w-full h-full" interactive={true} theme="cyan" />
            </div>

            {/* ── FLOATING ORBITAL BADGES (EXACTLY CORRESPONDING TO THE USER'S IMAGE) ── */}
            {/* Top Purple: Papers 200M+ */}
            <motion.div 
              animate={{ y: [-4, 5, -4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 right-[12%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(sourcesRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/40 to-fuchsia-600/40 flex items-center justify-center border border-purple-400/40">
                  <FileText className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 font-bold block uppercase tracking-wider">Papers</span>
                  <span className="text-xs font-black text-white">200M+</span>
                </div>
              </div>
            </motion.div>

            {/* Top Cyan: Authors 12.4M+ */}
            <motion.div 
              animate={{ y: [4, -5, 4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute top-[8%] -left-[4%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(topologyRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/40 to-blue-600/40 flex items-center justify-center border border-cyan-400/40">
                  <User className="w-3.5 h-3.5 text-cyan-300" />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-300 font-bold block uppercase tracking-wider">Authors</span>
                  <span className="text-xs font-black text-white">12.4M+</span>
                </div>
              </div>
            </motion.div>

            {/* Mid Left: Knowledge Graph AI-Powered */}
            <motion.div 
              animate={{ y: [-3, 6, -3] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[38%] -left-[14%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(topologyRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/40 to-teal-600/40 flex items-center justify-center border border-emerald-400/40">
                  <Network className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">Knowledge Graph</span>
                  <span className="text-[9px] text-gray-300">AI-Powered 3D Lattice</span>
                </div>
              </div>
            </motion.div>

            {/* Mid Right: Datasets 85K+ */}
            <motion.div 
              animate={{ y: [5, -4, 5] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute top-[28%] -right-[12%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(sourcesRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500/40 to-orange-600/40 flex items-center justify-center border border-amber-400/40">
                  <Database className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">Datasets</span>
                  <span className="text-xs font-black text-white">85K+</span>
                </div>
              </div>
            </motion.div>

            {/* Center Left: AI Insights Summarize · Compare */}
            <motion.div 
              animate={{ y: [3, -5, 3] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="absolute bottom-[28%] -left-[10%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(pipelineRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500/40 to-blue-600/40 flex items-center justify-center border border-sky-400/40">
                  <BrainCircuit className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <div>
                  <span className="text-[10px] text-sky-300 font-bold block uppercase tracking-wider">AI Insights</span>
                  <span className="text-[9px] text-gray-300">Summarize • Compare</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Right: Citations 250M+ */}
            <motion.div 
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              className="absolute bottom-[24%] -right-[14%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-fuchsia-400/40 shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(topologyRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-fuchsia-500/40 to-pink-600/40 flex items-center justify-center border border-fuchsia-400/40">
                  <Share2 className="w-3.5 h-3.5 text-fuchsia-300" />
                </div>
                <div>
                  <span className="text-[10px] text-fuchsia-300 font-bold block uppercase tracking-wider">Citations</span>
                  <span className="text-xs font-black text-white">250M+</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Center: Concepts 1.8M+ */}
            <motion.div 
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              className="absolute -bottom-2 left-[20%] z-20 glass-card-vibrant px-3.5 py-2 rounded-2xl border border-indigo-400/40 shadow-[0_0_20px_rgba(129,140,248,0.3)] hover:scale-105 transition-transform cursor-pointer"
              onClick={() => scrollTo(topologyRef)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/40 to-purple-600/40 flex items-center justify-center border border-indigo-400/40">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 font-bold block uppercase tracking-wider">Concepts</span>
                  <span className="text-xs font-black text-white">1.8M+</span>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* ── BOTTOM DOCKED TELEMETRY TICKER BAR (FROM THE USER'S IMAGE) ── */}
        <div className="relative z-30 w-full mt-4">
          
          {/* Laser Arc Line */}
          <div className="relative w-full h-8 flex justify-center items-end overflow-hidden pointer-events-none">
            <svg className="w-full h-10 text-cyan-400/80" viewBox="0 0 1200 50" preserveAspectRatio="none">
              <path d="M 0 50 Q 600 -5 1200 50" fill="none" stroke="url(#heroLaser)" strokeWidth="3" filter="drop-shadow(0 0 10px #06b6d4)" />
              <path d="M 150 50 Q 600 8 1050 50" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="8 6" opacity="0.6" />
              <defs>
                <linearGradient id="heroLaser" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                  <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                  <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Frosted Telemetry Pill Dock */}
          <div className="w-full bg-gradient-to-b from-[#060c20]/95 via-[#040816]/98 to-[#02050e] backdrop-blur-3xl border-t border-cyan-400/40 px-4 sm:px-8 py-3.5 shadow-[0_-20px_50px_rgba(0,0,0,0.9)]">
            <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-around gap-4 sm:gap-8">
              {[
                { icon: FileText, value: '200M+', label: 'Research Papers', color: 'text-purple-400' },
                { icon: User, value: '12.4M+', label: 'Authors', color: 'text-cyan-400' },
                { icon: Sparkles, value: '1.8M+', label: 'Research Concepts', color: 'text-indigo-400' },
                { icon: Share2, value: '250M+', label: 'Citations', color: 'text-fuchsia-400' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 group cursor-default">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-cyan-400/50 transition-all shadow-inner">
                      <Icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div>
                      <span className={`text-sm sm:text-base font-black ${stat.color} block tracking-tight`}>{stat.value}</span>
                      <span className="text-[11px] text-gray-400 block font-medium">{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Centered Scroll Prompt */}
          <div 
            onClick={() => scrollTo(cockpitRef)}
            className="w-full py-2 bg-[#02050e]/95 border-t border-white/[0.06] flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-cyan-400 transition-colors group"
          >
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono group-hover:tracking-wider transition-all">
              Scroll to explore platform architecture
            </span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*          2. INTERACTIVE RESEARCH COCKPIT SHOWCASE (TABBED FEATURE OBSERVER)          */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={cockpitRef}
        className="w-full py-24 px-4 sm:px-8 relative z-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #02050e 0%, #07122e 50%, #030712 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 section-divider"></div>
        <div className="absolute top-1/3 left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-[180px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 landing-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-3 animate-neon-border">
              <Compass className="w-3.5 h-3.5" /> Autonomous Research Superpowers
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Everything Needed to Accelerate<br />
              <span className="gradient-text-animated">
                Scientific Discovery in One Cockpit
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Traditional academic search returns lists of isolated PDF links. ResearchGraph AI unites citation graphs, dense multimodal embeddings, and multi-LLM ensembles into a living cognitive workspace.
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 landing-reveal">
            {[
              { id: 'graph', label: '3D Knowledge Graph', icon: Orbit, badge: 'High-Dimensional' },
              { id: 'rag', label: 'Multi-LLM RAG Engine', icon: Zap, badge: 'Zero Hallucination' },
              { id: 'gaps', label: 'Research Gap Discovery', icon: Sparkles, badge: 'Autonomous Hypotheses' },
              { id: 'compare', label: 'Paper Benchmark Matrix', icon: GitCompare, badge: 'Empirical Compare' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 border ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-[1.02]' 
                      : 'glass-card border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/30'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono ${isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/5 text-gray-500'}`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Stage Display */}
          <div className="landing-reveal p-6 sm:p-10 rounded-3xl glass-card-vibrant border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
            
            {/* Tab 1: Graph Topology */}
            {activeFeatureTab === 'graph' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                    TOPOLOGICAL VECTOR MANIFOLD
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Every Paper, Author & Concept Mapped in 3D Space
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    By embedding 200M+ academic documents with Graph Neural Networks, conceptual relevance is projected as physical proximity. Trace interdisciplinary bridges between bioinformatics, physics, and deep learning.
                  </p>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>Sub-15ms multi-hop citation graph walks</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>1,536-dimensional semantic vector representations</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span>Direct co-authorship & institutional network mapping</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigateAuth('REGISTER')}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30"
                  >
                    <span>Launch 3D Topology Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="lg:col-span-7 bg-[#040816]/90 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative min-h-[320px] flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                    <span className="text-cyan-400 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      TOPOLOGY_SIMULATION // CLUSTER_428
                    </span>
                    <span className="text-gray-400">1,536-Dim Euclidean Manifold</span>
                  </div>
                  
                  {/* Visual Node Cluster Representation */}
                  <div className="py-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name: "Message Passing GNNs", count: "1,420 Papers", color: "border-cyan-400/50 bg-cyan-500/10 text-cyan-300" },
                      { name: "Molecular Docking", count: "890 Papers", color: "border-purple-400/50 bg-purple-500/10 text-purple-300" },
                      { name: "ADMET Prediction", count: "640 Papers", color: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300" },
                      { name: "E(3)-Equivariance", count: "310 Papers", color: "border-sky-400/50 bg-sky-500/10 text-sky-300" },
                      { name: "AlphaFold Derivatives", count: "1,120 Papers", color: "border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-300" },
                      { name: "Clinical Benchmarks", count: "540 Repos", color: "border-amber-400/50 bg-amber-500/10 text-amber-300" },
                    ].map((node, i) => (
                      <div key={i} className={`p-3.5 rounded-xl border ${node.color} flex flex-col justify-between hover:scale-105 transition-all shadow-md`}>
                        <span className="text-xs font-bold block">{node.name}</span>
                        <span className="text-[10px] opacity-75 font-mono mt-1">{node.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span>Graph Density: 0.94</span>
                    <span className="text-emerald-400 font-bold">● 428 Clusters Synchronized</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: RAG Multi-LLM Engine */}
            {activeFeatureTab === 'rag' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                    MULTI-AGENT ENSEMBLE CONSENSUS
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Zero-Hallucination Answers Grounded in Primary Citations
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    Rather than relying on a single model, ResearchGraph AI queries an ensemble of GPT-4o, Claude 3.5, and Gemini with exact DOI source literature anchoring.
                  </p>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Mathematical claim verification across peer-reviewed sources</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Ensemble consensus filtering out outdated or retracted preprints</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Exact line-number DOI citations attached to every assertion</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-[#040816]/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">RAG_CONSENSUS_VERIFIER // 3 MODELS</span>
                    <span className="text-cyan-400">Grounding Accuracy: 99.4%</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">Claude 3.5</span>
                      <p className="text-xs text-gray-200">Synthesized 14 clinical trials with exact AUC confidence bounds.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">GPT-4o</span>
                      <p className="text-xs text-gray-200">Cross-referenced pharmacological dosages with FDA clinical registries.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">Gemini 1.5</span>
                      <p className="text-xs text-gray-200">Validated 100% citation integrity and resolved conflicting findings.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Research Gaps */}
            {activeFeatureTab === 'gaps' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                    HYPOTHESIS GENERATOR
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Uncover Unstudied Questions Between Disciplines
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    By mapping the boundary edges of existing knowledge graphs, the engine highlights uncharted questions with high publication potential.
                  </p>
                </div>
                <div className="lg:col-span-7 bg-[#040816]/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-3">
                  <span className="text-xs font-mono text-purple-400 font-bold block mb-2">IDENTIFIED RESEARCH FRONTIERS</span>
                  {[
                    { gap: "Cross-Modal Contrastive Learning in Rare Pediatric Oncology", score: "96.4% Novelty Index" },
                    { gap: "Topological Anyon Stabilization in Room-Temperature Superlattices", score: "94.8% Novelty Index" },
                    { gap: "Off-Target GUIDESeq Minimization via Prime-Editing Oligos", score: "98.1% Novelty Index" },
                  ].map((g, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{g.gap}</span>
                      <span className="text-[10px] font-mono text-purple-300 font-bold">{g.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Paper Comparison */}
            {activeFeatureTab === 'compare' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    EMPIRICAL BENCHMARKING
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Structured Side-by-Side Methodology Extraction
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    Compare datasets, architectures, hyperparameters, and results across dozens of papers simultaneously in unified tabular matrices.
                  </p>
                </div>
                <div className="lg:col-span-7 bg-[#040816]/90 border border-amber-500/30 rounded-2xl p-5 shadow-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 font-mono">
                        <th className="pb-2">Metric</th>
                        <th className="pb-2 text-cyan-300">DINOv2</th>
                        <th className="pb-2 text-purple-300">MAE</th>
                        <th className="pb-2 text-emerald-300">CLIP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-200">
                      <tr>
                        <td className="py-2.5 font-bold">Pre-training Task</td>
                        <td className="py-2.5">Self-distillation</td>
                        <td className="py-2.5">Masked Autoencoder</td>
                        <td className="py-2.5">Contrastive Text-Img</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">ImageNet-1k Top-1</td>
                        <td className="py-2.5 text-cyan-400 font-bold">86.5%</td>
                        <td className="py-2.5 text-purple-400 font-bold">85.9%</td>
                        <td className="py-2.5 text-emerald-400 font-bold">88.3%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold">Freeze Feature Eval</td>
                        <td className="py-2.5 text-emerald-400 font-bold">Superior</td>
                        <td className="py-2.5 text-amber-400">Moderate</td>
                        <td className="py-2.5 text-cyan-400 font-bold">Strong</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*              3. HIGH-DIMENSIONAL 3D TOPOLOGY DEEP-DIVE SECTION                     */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={topologyRef}
        className="w-full py-24 px-4 sm:px-8 relative z-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #030712 0%, #08112c 50%, #030612 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 section-divider"></div>
        <div className="absolute top-1/4 right-[-10%] w-[550px] h-[550px] rounded-full bg-purple-600/[0.06] blur-[160px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 landing-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase mb-3 animate-neon-border">
              <Orbit className="w-3.5 h-3.5" /> High-Dimensional Knowledge Topologies
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Explore 200M+ Academic Nodes<br />
              <span className="gradient-text-animated">
                Mapped in 3D Vector Space
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Select an academic domain below to inspect how ResearchGraph AI structures conceptual relationships and institutional networks.
            </p>
          </div>

          {/* Domain Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12 landing-reveal">
            {[
              { id: 'ai', label: 'Artificial Intelligence', icon: BrainCircuit, color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10' },
              { id: 'bio', label: 'Genomics & Biomedicine', icon: Microscope, color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
              { id: 'quantum', label: 'Quantum Computing', icon: Binary, color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
              { id: 'materials', label: 'Materials Discovery', icon: Sparkles, color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
              { id: 'neuro', label: 'Neurobiology', icon: Network, color: 'border-rose-500 text-rose-400 bg-rose-500/10' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedDomain === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDomain(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                    isActive 
                      ? `${tab.color} shadow-lg shadow-cyan-950/50 scale-[1.02]` 
                      : 'glass-card border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 6 Dimensions Entity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Authors & PIs", count: "38.4M Entities", desc: "Maps co-authorship networks, institutional affiliations, and h-index citation trajectories across global labs.", color: "border-amber-500/30 text-amber-400 bg-amber-500/5", icon: User },
              { title: "Research Papers", count: "204.8M Nodes", desc: "Full-text embeddings including methodologies, mathematical theorems, experimental datasets, and abstract vectors.", color: "border-blue-500/30 text-blue-400 bg-blue-500/5", icon: FileText },
              { title: "Extracted Concepts", count: "45,200 Clusters", desc: "Autonomous ontology extraction identifying emerging paradigm shifts, theoretical frameworks, and taxonomies.", color: "border-purple-500/30 text-purple-400 bg-purple-500/5", icon: Sparkles },
              { title: "Empirical Datasets", count: "1.4M Repositories", desc: "Direct associations between published claims, benchmark performance tables, Hugging Face repos, and PDB structures.", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5", icon: Database },
              { title: "Citation Networks", count: "1.24B Verified Edges", desc: "Directional citation graphs distinguishing between background mentions, conflicting results, and fundamental extensions.", color: "border-rose-500/30 text-rose-400 bg-rose-500/5", icon: Share2 },
              { title: "Research Trends", count: "Live Velocity Index", desc: "Real-time tracking of preprint momentum, rapid citation velocity, and interdisciplinary convergence spikes.", color: "border-fuchsia-500/30 text-fuchsia-400 bg-fuchsia-500/5", icon: Activity },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx} 
                  className={`landing-reveal p-6 rounded-2xl border ${card.color} glass-card-vibrant relative overflow-hidden group hover:scale-[1.03] hover:shadow-xl transition-all duration-300`} 
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-white text-base">{card.title}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400">{card.count}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*              4. 45+ SCHOLARLY REPOSITORIES & FEDERATED INGESTION                     */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={sourcesRef}
        className="w-full py-24 px-4 sm:px-8 relative z-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #030612 0%, #061028 50%, #030712 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 section-divider"></div>
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 landing-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-3 animate-neon-border">
              <Database className="w-3.5 h-3.5" /> 45+ Global Academic Repositories
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Continuous 24/7 Ingestion Across<br />
              <span className="gradient-text-animated">
                The World's Scientific Libraries
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              ResearchGraph AI automatically polls, parses, and normalizes preprints and peer-reviewed journals 24/7, providing instant access to 200M+ publications through standardized vector endpoints.
            </p>
          </div>

          {/* Sources Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { name: 'arXiv', papers: '13.4M Preprints', domain: 'Physics, Math, CS & AI', tag: 'Open Access', status: 'Continuous Sync', color: 'border-red-500/40 text-red-400' },
              { name: 'PubMed & NCBI', papers: '36.2M Citations', domain: 'Biomedical & Clinical Health', tag: 'NIH / Medline', status: 'Live Ingestion', color: 'border-blue-500/40 text-blue-400' },
              { name: 'IEEE Xplore', papers: '8.1M Papers', domain: 'Electrical Eng & Robotics', tag: 'Peer-Reviewed', status: 'API Connected', color: 'border-sky-500/40 text-sky-400' },
              { name: 'Semantic Scholar', papers: '203M Corpus', domain: 'All Scientific Fields', tag: 'Vector Graph', status: 'Real-time Feed', color: 'border-amber-500/40 text-amber-400' },
              { name: 'CrossRef', papers: '140M DOIs', domain: 'Global Citations & Publishers', tag: 'Universal DOI', status: 'Connected', color: 'border-emerald-500/40 text-emerald-400' },
              { name: 'OpenAlex', papers: '250M Entities', domain: 'Scholarly Ontologies & PIs', tag: 'Open Data', status: 'Active Sync', color: 'border-purple-500/40 text-purple-400' },
              { name: 'bioRxiv / medRxiv', papers: '5.2M Preprints', domain: 'Life Sciences & Therapeutics', tag: 'Preprints', status: 'Hourly Poll', color: 'border-teal-500/40 text-teal-400' },
              { name: 'Nature Portfolio', papers: '18.6M Articles', domain: 'High-Impact Multi-Disciplinary', tag: 'Springer Nature', status: 'Cataloged', color: 'border-indigo-500/40 text-indigo-400' },
            ].map((source, idx) => (
              <div 
                key={idx} 
                className="landing-reveal-scale p-5 rounded-2xl glass-card border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5"
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-extrabold text-white text-base group-hover:text-cyan-300 transition-colors">{source.name}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border bg-white/5 font-mono ${source.color}`}>
                      {source.tag}
                    </span>
                  </div>
                  <span className="text-cyan-400 font-extrabold text-base block mb-1 group-hover:scale-105 transition-transform origin-left">{source.papers}</span>
                  <p className="text-[11px] text-gray-400 mb-3">{source.domain}</p>
                </div>
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                    {source.status}
                  </span>
                  <span className="group-hover:text-cyan-400 transition-colors font-bold">Details &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          {/* Connect Enterprise Sources Banner */}
          <div className="landing-reveal p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-purple-950/60 to-cyan-950/60 border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-2">
                ✦ ENTERPRISE RESEARCH CONNECTIONS
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">Need custom private repository integration?</h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">Connect institutional repositories, lab databases, internal patents, and private PDFs with enterprise end-to-end encryption.</p>
            </div>
            <button 
              onClick={() => onNavigateAuth('REGISTER')}
              className="relative z-10 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-2 flex-shrink-0 hover:scale-105 active:scale-95 border border-cyan-400/40"
            >
              <span>Connect Enterprise Sources</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*              5. INTERACTIVE REAL-TIME HYPOTHESIS SANDBOX                             */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={sandboxRef}
        className="w-full py-24 px-4 sm:px-8 relative z-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #030712 0%, #070d24 50%, #02050e 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 section-divider"></div>
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14 landing-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase mb-3 animate-neon-border">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Research Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Test the Autonomous Engine<br />
              <span className="gradient-text-animated">
                In Real-Time
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Select a scientific hypothesis below to see how ResearchGraph AI traverses the knowledge graph and compiles an authoritative, cited answer.
            </p>
          </div>

          {/* Sample Query Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {demoQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDemoIdx(idx)}
                className={`landing-reveal-scale p-4 rounded-2xl text-left transition-all border flex items-center justify-between gap-3 ${
                  activeDemoIdx === idx
                    ? 'bg-[#0c183a] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] text-white scale-[1.01]'
                    : 'glass-card border-white/10 text-gray-300 hover:text-white hover:border-cyan-500/30 hover:bg-white/[0.06]'
                }`}
                style={{ transitionDelay: `${idx * 60}ms` }}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1 uppercase tracking-wider">
                    {item.domain} • {item.category}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold">{item.query}</span>
                </div>
                <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform ${activeDemoIdx === idx ? 'text-cyan-400 translate-x-1' : 'text-gray-500'}`} />
              </button>
            ))}
          </div>

          {/* Sandbox Simulated Output Display */}
          <div className="landing-reveal p-6 sm:p-8 rounded-3xl bg-[#060c1f]/90 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6 relative z-10">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Query Target</span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">{demoQueries[activeDemoIdx].query}</h4>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <span className="px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold">
                  {demoQueries[activeDemoIdx].nodesFound} Nodes
                </span>
                <span className="px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold">
                  {demoQueries[activeDemoIdx].papersFound} Papers
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                  {demoQueries[activeDemoIdx].confidence} Confidence
                </span>
              </div>
            </div>

            {/* Synthesized Summary */}
            <div className="mb-6 relative z-10">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" /> Synthesized Multi-Paper Consensus
              </span>
              <p className="text-sm text-gray-200 leading-relaxed p-4 rounded-xl bg-black/50 border border-white/10 min-h-[90px] shadow-inner">
                <TypingText text={demoQueries[activeDemoIdx].summary} trigger={activeDemoIdx} />
                <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse"></span>
              </p>
            </div>

            {/* Cited Papers */}
            <div className="mb-6 relative z-10">
              <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Primary Anchor Literature
              </span>
              <div className="space-y-2">
                {demoQueries[activeDemoIdx].papers.map((p, pIdx) => (
                  <div key={pIdx} className="p-3.5 rounded-xl glass-card border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-white block">{p.title}</span>
                      <span className="text-[11px] text-gray-400">{p.authors} • {p.journal} • {p.citations} citations</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto font-semibold">
                      DOI: {p.doi}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discovered Conceptual Bridges */}
            <div className="relative z-10">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Discovered Concept Bridges
              </span>
              <div className="flex flex-wrap gap-2">
                {demoQueries[activeDemoIdx].connections.map((conn, cIdx) => (
                  <span key={cIdx} className="px-3 py-1.5 rounded-full glass-card border border-white/15 text-xs text-gray-200 font-semibold flex items-center gap-2 hover:border-emerald-400/50 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
                    {conn}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
              <span className="text-xs text-gray-400">Want to run custom full-text synthesis queries?</span>
              <button 
                onClick={() => onNavigateAuth('REGISTER')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <span>Launch Interactive Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*              6. THE 4-STAGE AUTONOMOUS RAG PIPELINE TIMELINE                         */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={pipelineRef}
        className="w-full py-24 px-4 sm:px-8 relative z-20 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #02050e 0%, #061128 50%, #030712 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 section-divider"></div>
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 landing-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-3 animate-neon-border">
              <Zap className="w-3.5 h-3.5" /> End-to-End Autonomous Execution
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              How RAG & Multi-LLM Synthesis<br />
              <span className="gradient-text-animated">
                Delivers Zero-Hallucination Answers
              </span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Every synthesized conclusion, literature review, and hypothesis is mathematically grounded to peer-reviewed source literature.
            </p>
          </div>

          {/* 4 Stepped Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: "01",
                title: "Ingest & Chunk",
                subtitle: "PDF Structural Parsing",
                desc: "High-throughput document processors parse LaTeX equations, figure captions, experimental tables, and citation markers into semantic chunks.",
                tag: "Multimodal OCR",
                color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400"
              },
              {
                step: "02",
                title: "Embed & Index",
                subtitle: "GNN + Dense Vectors",
                desc: "Dual embeddings combine dense language semantics with Graph Neural Network message passing to preserve topological citation context.",
                tag: "1536-Dim Vectors",
                color: "from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400"
              },
              {
                step: "03",
                title: "Hybrid Retrieval",
                subtitle: "Dense + Graph Traversal",
                desc: "Combines cosine vector similarity with multi-hop graph walks to unearth non-obvious interdisciplinary bridge papers across domains.",
                tag: "Sub-15ms Latency",
                color: "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400"
              },
              {
                step: "04",
                title: "LLM Synthesis",
                subtitle: "Ensemble Consensus",
                desc: "Ensembles of GPT-4o, Claude 3.5, and Gemini synthesize literature reviews, validate mathematical claims, and cross-reference citations.",
                tag: "Zero Hallucination",
                color: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400"
              },
            ].map((stage, idx) => (
              <div 
                key={idx} 
                className="landing-reveal-scale p-6 rounded-3xl glass-card border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-2"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-black bg-gradient-to-r ${stage.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left`}>
                    {stage.step}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300">
                    {stage.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg mb-0.5 group-hover:text-cyan-300 transition-colors">{stage.title}</h3>
                  <span className="text-xs font-semibold text-cyan-400 block mb-3">{stage.subtitle}</span>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">{stage.desc}</p>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stage.color} group-hover:animate-pulse`} style={{ width: `${(idx + 1) * 25}%` }}></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*              7. INSTITUTIONAL TRUST & RESEARCHER PROOF METRICS                       */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-20 px-4 sm:px-8 relative z-20 border-t border-white/[0.08] bg-[#02050e]/95">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center landing-reveal">
            <div className="p-4 rounded-2xl glass-card border border-white/10">
              <span className="text-3xl sm:text-4xl font-black gradient-text-animated block">140,000+</span>
              <span className="text-xs text-gray-400 font-semibold mt-1 block">Active Researchers</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-cyan-400 block">120+</span>
              <span className="text-xs text-gray-400 font-semibold mt-1 block">Countries & Labs</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">99.4%</span>
              <span className="text-xs text-gray-400 font-semibold mt-1 block">Citation Grounding</span>
            </div>
            <div className="p-4 rounded-2xl glass-card border border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-purple-400 block">&lt;15ms</span>
              <span className="text-xs text-gray-400 font-semibold mt-1 block">Graph Traversal Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*              8. GRAND FINALE CELESTIAL LAUNCHPAD CTA                                 */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <section 
        className="w-full py-28 px-4 sm:px-8 relative z-20 overflow-hidden text-center"
        style={{ background: 'linear-gradient(180deg, #02050e 0%, #060c24 50%, #030712 100%)' }}
      >
        <div className="absolute top-0 left-0 right-0 section-divider"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-500/[0.1] via-purple-500/[0.08] to-transparent blur-[160px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 landing-reveal">
          
          <div className="w-[72px] h-[72px] rounded-3xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-blue-600/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(6,182,212,0.35)] animate-glow-pulse">
            <Network className="w-9 h-9 text-cyan-300" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Ready to Enter the Universe of<br />
            <span className="gradient-text-animated">
              Connected Scientific Knowledge?
            </span>
          </h2>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            Join 140,000+ researchers, university labs, and innovators exploring 200M+ research publications with autonomous graph intelligence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => onNavigateAuth('REGISTER')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-cyan-500/40 border border-cyan-400/40 hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <span>Launch 3D Explorer Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button 
              onClick={() => onNavigateAuth('LOGIN')}
              className="px-8 py-4 rounded-2xl glass-card hover:border-cyan-400/40 text-gray-200 hover:text-white font-bold text-sm sm:text-base transition-all backdrop-blur-md hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              Sign In to Account
            </button>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*                                9. HIGH-TECH FOOTER                                 */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-[#02040b] border-t border-white/10 px-4 sm:px-8 py-10 relative z-20 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Mission */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-cyan-500/40 flex items-center justify-center bg-cyan-500/10">
              <Network className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">ResearchGraph AI</span>
              <span className="text-[10px] text-gray-400">Autonomous 3D Scientific Knowledge Navigation</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All 45+ Repositories Synchronized • 100% Operational</span>
          </div>

          {/* Copyright & Quick Links */}
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => scrollTo(sourcesRef)} className="hover:text-cyan-400 transition-colors">Data Sources</button>
            <button onClick={() => scrollTo(pipelineRef)} className="hover:text-cyan-400 transition-colors">Pipeline Docs</button>
            <button onClick={() => setActiveModal('ABOUT')} className="hover:text-cyan-400 transition-colors">About Us</button>
            <span>© 2026 ResearchGraph AI</span>
          </div>

        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      {/*                                10. INFORMATION MODALS                              */}
      {/* ════════════════════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#0a0f1c] border border-cyan-500/30 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-cyan-500/20 text-left"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {activeModal === 'ABOUT' && (
                <div>
                  <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">
                    <Info className="w-4 h-4" /> About ResearchGraph AI
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Pioneering Cognitive Research</h2>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    We are on a mission to democratize scientific discovery by organizing the world's academic literature into an interconnected, multi-dimensional cognitive universe.
                  </p>
                  <div className="space-y-3.5 mb-8">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h3 className="font-bold text-sm text-cyan-300 mb-1 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-cyan-400" />
                        Breaking Academic Silos
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Researchers often spend months reading disconnected papers within their own domain. ResearchGraph AI bridges the gaps between neuroscience, machine learning, physics, and genomics to uncover interdisciplinary breakthroughs.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <h3 className="font-bold text-sm text-purple-300 mb-1 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        Built for Academics, Labs & Innovators
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Trusted by over 140,000+ researchers, PhD candidates, biotech labs, and research institutions across 120+ countries to supercharge literature reviews and patent analysis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'VIDEO' && (
                <div>
                  <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-3">
                    <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Interactive Platform Demonstration
                  </div>

                  {/* Video Selector Tabs */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
                    {videoTourData.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveVideoIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          activeVideoIdx === idx
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                            : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${activeVideoIdx === idx ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'}`} />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">{videoTourData[activeVideoIdx].title}</h2>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                    {videoTourData[activeVideoIdx].description}
                  </p>

                  {/* Video Player or Interactive Simulation */}
                  {videoTourData[activeVideoIdx].youtubeId ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-cyan-500/30 mb-6 shadow-2xl bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoTourData[activeVideoIdx].youtubeId}?autoplay=1&rel=0`}
                        title={videoTourData[activeVideoIdx].title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 mb-6">
                      <div className="flex items-center justify-between mb-3 text-xs font-mono text-gray-400">
                        <span className="text-cyan-400 font-bold">SIMULATION: GNN DRUG DISCOVERY</span>
                        <span className="text-emerald-400 font-bold">● ACTIVE SYNTHESIS</span>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">Step 1 • Parallel Query Dispatch</span>
                          <span className="text-white font-semibold">Broadcasting to arXiv, PubMed, IEEE, CrossRef (1,420 matched candidates)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">Step 2 • 3D Topology Clustering</span>
                          <span className="text-cyan-300 font-semibold">Extracting ADMET prediction cluster & E(3)-equivariant graph neural networks</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-gray-400 uppercase font-mono block">Step 3 • Multi-LLM Consensus Synthesis</span>
                          <span className="text-emerald-300 font-semibold">Ensemble generated 4 key hypotheses with 100% verified citation anchors</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-400">Ready to explore with your own research queries?</span>
                    <button 
                      onClick={() => onNavigateAuth('REGISTER')}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
                    >
                      <span>Launch Explorer Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};