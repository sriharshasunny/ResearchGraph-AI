import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Sparkles, ArrowLeft, 
  Zap, Database, Layers, Info, X, Compass, Award, KeyRound, CheckCircle2,
  Play, ChevronDown, Activity, Cpu, Share2, Radio, FileText,
  Microscope, Binary
} from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';
import { InteractiveSpaceBackground } from '../../components/InteractiveSpaceBackground';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';
type InfoModalType = 'HOW_IT_WORKS' | 'SOURCES' | 'ABOUT' | 'DEMO' | null;

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<'ai' | 'bio' | 'quantum' | 'materials' | 'neuro'>('ai');
  const [activeDemoQuery, setActiveDemoQuery] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topologySectionRef = useRef<HTMLDivElement>(null);
  const sourcesSectionRef = useRef<HTMLDivElement>(null);
  const pipelineSectionRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
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

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 fixed inset-0">
      
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
              {/* ═══════════════ TOP NAVBAR ═══════════════ */}
              <nav className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[#040816]/85 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50 shadow-2xl shadow-black/80">
                {/* Brand Logo */}
                <div 
                  className="flex items-center gap-3 cursor-pointer group" 
                  onClick={() => {
                    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveModal(null);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl border border-cyan-500/40 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all">
                    <Network className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                      ResearchGraph <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">AI</span>
                    </span>
                    <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-bold tracking-wider">
                      v2.0
                    </span>
                  </div>
                </div>
                
                {/* Center Navigation Links */}
                <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-xl">
                  <button 
                    onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
                  >
                    Cockpit View
                  </button>

                  <button 
                    onClick={() => scrollToSection(topologySectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-cyan-300 rounded-full hover:bg-cyan-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Network className="w-3 h-3 text-cyan-400" />
                    3D Topology
                  </button>

                  <button 
                    onClick={() => scrollToSection(pipelineSectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-purple-300 rounded-full hover:bg-purple-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3 text-purple-400" />
                    RAG Pipeline
                  </button>

                  <button 
                    onClick={() => scrollToSection(sourcesSectionRef)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-emerald-300 rounded-full hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Database className="w-3 h-3 text-emerald-400" />
                    Data Sources
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">45+</span>
                  </button>

                  <button 
                    onClick={() => setActiveModal('ABOUT')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-sky-300 rounded-full hover:bg-sky-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Info className="w-3 h-3 text-sky-400" />
                    About Us
                  </button>
                </div>

                {/* Right Action Buttons: Log In & Sign Up */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <button 
                    onClick={() => triggerTraversal('AUTH', 'LOGIN')} 
                    className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-all px-3.5 sm:px-4 py-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => triggerTraversal('AUTH', 'REGISTER')} 
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 border border-cyan-400/30 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
                  >
                    <span>Sign Up Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
                    className="lg:hidden w-full bg-[#070b18]/95 border-b border-white/10 px-6 py-4 flex flex-col gap-2 relative z-40 backdrop-blur-2xl"
                  >
                    <button 
                      onClick={() => { scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-gray-300 hover:bg-white/5 rounded-lg"
                    >
                      Cockpit View
                    </button>
                    <button 
                      onClick={() => { scrollToSection(topologySectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-cyan-300 hover:bg-cyan-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Network className="w-4 h-4 text-cyan-400" /> 3D Topology
                    </button>
                    <button 
                      onClick={() => { scrollToSection(pipelineSectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-purple-300 hover:bg-purple-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-purple-400" /> RAG Pipeline
                    </button>
                    <button 
                      onClick={() => { scrollToSection(sourcesSectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Database className="w-4 h-4 text-emerald-400" /> Data Sources (45+ Repos)
                    </button>
                    <button 
                      onClick={() => { setActiveModal('ABOUT'); setMobileMenuOpen(false); }}
                      className="text-left py-2 px-3 text-sm font-medium text-sky-300 hover:bg-sky-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 text-sky-400" /> About ResearchGraph AI
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*        AUTHENTIC STARSHIP COCKPIT BRIDGE HERO VIEW (PURE CRISP UI ARCHITECTURE)      */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div className="relative w-full min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-transparent">
                
                {/* ─── COCKPIT CANOPY STRUCTURAL FRAME (TOP & SIDES) ─── */}
                {/* Top Canopy Arch Beam */}
                <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none z-20 bg-gradient-to-b from-[#060a18] via-[#070e24]/70 to-transparent flex items-center justify-between px-6 sm:px-12 border-b border-cyan-500/15">
                  <div className="flex items-center gap-2 text-[9px] font-mono text-cyan-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>COCKPIT HUD // CANOPY PRESSURIZED</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-[9px] font-mono text-gray-500">
                    <span>SENSORS: OPTIMAL</span>
                    <span>ORBITAL RECEPTORS: 45/45</span>
                    <span className="text-emerald-400">TELEMETRY: SYNCHRONIZED</span>
                  </div>
                </div>

                {/* Left Canopy Structural Pillar (Strut) */}
                <div className="absolute top-0 left-0 bottom-24 w-12 sm:w-16 pointer-events-none z-20 hidden md:block">
                  <div className="w-full h-full bg-gradient-to-r from-[#050916] via-[#070e24]/40 to-transparent border-r border-cyan-500/10 relative">
                    <div className="absolute top-1/4 left-2 w-1.5 h-16 bg-cyan-500/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-2 w-1.5 h-24 bg-purple-500/20 rounded-full"></div>
                    <div className="absolute bottom-1/4 left-2 w-1.5 h-12 bg-emerald-500/20 rounded-full"></div>
                  </div>
                </div>

                {/* Right Canopy Structural Pillar (Strut) */}
                <div className="absolute top-0 right-0 bottom-24 w-12 sm:w-16 pointer-events-none z-20 hidden md:block">
                  <div className="w-full h-full bg-gradient-to-l from-[#050916] via-[#070e24]/40 to-transparent border-l border-cyan-500/10 relative">
                    <div className="absolute top-1/3 right-2 w-1.5 h-20 bg-cyan-500/20 rounded-full"></div>
                    <div className="absolute bottom-1/3 right-2 w-1.5 h-28 bg-purple-500/20 rounded-full"></div>
                  </div>
                </div>

                {/* Ambient Radial Lighting over space background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none z-0"></div>
                
                {/* ─── TOP SECTION: FLOATING HUD PANELS ─── */}
                <div className="relative z-20 w-full max-w-[1550px] mx-auto px-4 sm:px-8 pt-6 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    
                    {/* Top-Left: Research Databases HUD Panel */}
                    <motion.div 
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => setActiveModal('SOURCES')}
                      className="hidden md:flex flex-col gap-1.5 px-4 py-2.5 rounded-2xl bg-[#060c1d]/90 border border-cyan-500/40 backdrop-blur-2xl shadow-xl shadow-black/80 hover:border-cyan-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-cyan-400" />
                          Research Databases
                        </span>
                        <span className="text-[9px] text-cyan-400/80 group-hover:text-cyan-300 font-mono transition-colors">
                          + more sources ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold shadow-sm">arXiv</span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold shadow-sm">PubMed</span>
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-bold shadow-sm">IEEE</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold shadow-sm">Semantic Scholar</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold shadow-sm">CrossRef</span>
                      </div>
                    </motion.div>

                    {/* Top-Center: RAG Pipeline HUD Flow */}
                    <motion.div 
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => setActiveModal('HOW_IT_WORKS')}
                      className="hidden lg:flex flex-col gap-1.5 px-5 py-2.5 rounded-2xl bg-[#060c1d]/90 border border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-black/80 hover:border-purple-400 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-purple-400" />
                          RAG Pipeline
                        </span>
                        <span className="text-[9px] text-purple-300/80 group-hover:text-purple-200 font-mono transition-colors">
                          Live Architecture ↗
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 font-semibold shadow-sm">
                          <Database className="w-3 h-3 text-blue-400" />
                          <span>Retrieve</span>
                        </div>
                        <span className="text-gray-500 font-bold">→</span>
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold shadow-sm">
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span>Augment</span>
                        </div>
                        <span className="text-gray-500 font-bold">→</span>
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold shadow-sm">
                          <BrainCircuit className="w-3 h-3 text-emerald-400" />
                          <span>Generate</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Top-Right: Large Language Models HUD */}
                    <motion.div 
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="hidden xl:flex flex-col gap-1.5 px-4 py-2.5 rounded-2xl bg-[#060c1d]/90 border border-emerald-500/40 backdrop-blur-2xl shadow-xl shadow-black/80"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                          Large Language Models
                        </span>
                        <span className="text-[9px] text-emerald-400/80 font-mono">
                          + custom models
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">GPT-4o</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-semibold">Claude 3.5</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-semibold">Gemini 1.5</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-semibold">Llama 3.1</span>
                        <span className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[10px] font-semibold">Mistral</span>
                      </div>
                    </motion.div>

                  </div>
                </div>

                {/* ─── MIDDLE HERO STAGE: LEFT TEXT + CENTER 3D KNOWLEDGE SPHERE + RIGHT LIVE ANALYTICS ─── */}
                <div className="relative z-20 w-full max-w-[1550px] mx-auto px-4 sm:px-8 py-2 lg:py-4 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6">
                  
                  {/* LEFT: HERO COPY & CALL TO ACTIONS */}
                  <motion.div 
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex-1 flex flex-col items-start text-left max-w-xl z-30"
                  >
                    {/* Brand Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-md backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      RESEARCHGRAPH AI
                    </div>

                    {/* Massive Punchy Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] mb-4 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                      A Universe<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                        of Connected
                      </span><br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400">
                        Knowledge
                      </span>
                    </h1>

                    {/* Subtitle Description */}
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 max-w-md drop-shadow">
                      RAG-powered research intelligence with knowledge graphs, multi-source data and LLMs to help you discover, connect and understand research like never before.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3.5 mb-8">
                      <button 
                        onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-2.5 border border-cyan-400/40 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        Explore 3D Graph <ArrowRight className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => setActiveModal('DEMO')}
                        className="px-5 py-3 rounded-xl bg-[#060c1d]/90 border border-white/20 hover:border-cyan-400/50 text-gray-200 hover:text-white font-bold text-sm transition-all flex items-center gap-2.5 backdrop-blur-xl hover:bg-white/10 shadow-lg"
                      >
                        <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                        Watch Demo
                      </button>
                    </div>

                    {/* 4 Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full pt-4 border-t border-white/15">
                      <div className="bg-[#060c1d]/60 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                        <span className="text-lg sm:text-xl font-black text-cyan-400 block tracking-tight">200M+</span>
                        <span className="text-gray-400 text-[11px] leading-tight block">Research Papers</span>
                      </div>
                      <div className="bg-[#060c1d]/60 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                        <span className="text-lg sm:text-xl font-black text-purple-400 block tracking-tight">45+</span>
                        <span className="text-gray-400 text-[11px] leading-tight block">Data Sources</span>
                      </div>
                      <div className="bg-[#060c1d]/60 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                        <span className="text-lg sm:text-xl font-black text-emerald-400 block tracking-tight">Multi-LLM</span>
                        <span className="text-gray-400 text-[11px] leading-tight block">AI Intelligence</span>
                      </div>
                      <div className="bg-[#060c1d]/60 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                        <span className="text-lg sm:text-xl font-black text-sky-400 block tracking-tight">Real-time</span>
                        <span className="text-gray-400 text-[11px] leading-tight block">Knowledge Graph</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* CENTER: 3D HOLOGRAPHIC PROJECTION PEDESTAL & INTERACTIVE SPHERE */}
                  <div className="relative w-[340px] h-[360px] sm:w-[460px] sm:h-[480px] lg:w-[520px] lg:h-[540px] flex items-center justify-center flex-shrink-0 my-2">
                    
                    {/* Concentric Holographic Light Rings */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500/25 animate-spin-slow pointer-events-none"></div>
                    <div className="absolute inset-6 rounded-full border border-purple-500/25 animate-reverse-spin pointer-events-none"></div>
                    
                    {/* The Real Interactive WebGL 3D Quantum Neural Core */}
                    <div className="relative w-full h-[85%] flex items-center justify-center z-10 cursor-grab active:cursor-grabbing">
                      <ThreeNeuralCore className="w-full h-full" theme="cyan" interactive={true} />
                    </div>

                    {/* Center Hex Badge on Globe: Knowledge Graph */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="absolute z-20 pointer-events-none flex flex-col items-center justify-center -translate-y-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-blue-600/40 border-2 border-cyan-400 backdrop-blur-md flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <Network className="w-6 h-6 text-cyan-300" />
                      </div>
                      <span className="mt-1 px-3 py-0.5 rounded-full bg-[#050a1a]/95 border border-cyan-500/60 text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider shadow-lg">
                        Knowledge Graph
                      </span>
                    </motion.div>

                    {/* Orbiting Category Badges */}
                    {/* 1. Authors (Top-Left, Amber) */}
                    <div className="absolute top-[6%] left-[18%] z-20 pointer-events-none animate-float-slow">
                      <span className="px-3 py-1 rounded-full bg-[#060d20]/90 border border-amber-400/60 text-amber-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-amber-500/25">
                        <User className="w-3 h-3 text-amber-400" />
                        Authors
                      </span>
                    </div>

                    {/* 2. Papers (Mid-Left, Blue) */}
                    <div className="absolute top-[36%] left-[0%] z-20 pointer-events-none animate-float-mid">
                      <span className="px-3 py-1 rounded-full bg-[#060d20]/90 border border-blue-400/60 text-blue-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-blue-500/25">
                        <FileText className="w-3 h-3 text-blue-400" />
                        Papers
                      </span>
                    </div>

                    {/* 3. Concepts (Bottom-Left, Purple) */}
                    <div className="absolute bottom-[22%] left-[8%] z-20 pointer-events-none animate-float-slow">
                      <span className="px-3 py-1 rounded-full bg-[#060d20]/90 border border-purple-400/60 text-purple-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-purple-500/25">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Concepts
                      </span>
                    </div>

                    {/* 4. Datasets (Top-Right, Green) */}
                    <div className="absolute top-[12%] right-[6%] z-20 pointer-events-none animate-float-mid">
                      <span className="px-3 py-1 rounded-full bg-[#060d20]/90 border border-emerald-400/60 text-emerald-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-emerald-500/25">
                        <Database className="w-3 h-3 text-emerald-400" />
                        Datasets
                      </span>
                    </div>

                    {/* 5. Citations (Mid-Right, Coral) */}
                    <div className="absolute top-[42%] right-[-2%] z-20 pointer-events-none animate-float-slow">
                      <span className="px-3 py-1 rounded-full bg-[#060d20]/90 border border-rose-400/60 text-rose-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-rose-500/25">
                        <Share2 className="w-3 h-3 text-rose-400" />
                        Citations
                      </span>
                    </div>

                    {/* 6. Research Trends (Bottom-Right, Violet) */}
                    <div className="absolute bottom-[20%] right-[6%] z-20 pointer-events-none animate-float-mid">
                      <span className="px-3 py-1 rounded-full bg-[#060d20]/90 border border-fuchsia-400/60 text-fuchsia-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-fuchsia-500/25">
                        <Activity className="w-3 h-3 text-fuchsia-400" />
                        Research Trends
                      </span>
                    </div>

                    {/* Floating 3D Scientific Paper Cards in Orbit */}
                    <div className="absolute top-[16%] left-[10%] z-15 pointer-events-none hidden sm:block opacity-85 transform -rotate-12 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-22 bg-[#0a1228]/90 backdrop-blur-md rounded-lg shadow-xl p-2 border border-cyan-500/40 text-[5px] text-gray-300 flex flex-col justify-between">
                        <div className="w-full h-1.5 bg-blue-500 rounded mb-1"></div>
                        <div className="space-y-1">
                          <div className="w-10 h-0.5 bg-gray-400 rounded"></div>
                          <div className="w-12 h-0.5 bg-gray-400 rounded"></div>
                          <div className="w-8 h-0.5 bg-gray-400 rounded"></div>
                        </div>
                        <div className="w-5 h-1 bg-cyan-400 rounded self-end"></div>
                      </div>
                    </div>

                    <div className="absolute top-[26%] right-[12%] z-15 pointer-events-none hidden sm:block opacity-85 transform rotate-6 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-22 bg-[#0a1228]/90 backdrop-blur-md rounded-lg shadow-xl p-2 border border-purple-500/40 text-[5px] text-gray-300 flex flex-col justify-between">
                        <div className="w-full h-1.5 bg-purple-500 rounded mb-1"></div>
                        <div className="space-y-1">
                          <div className="w-11 h-0.5 bg-gray-400 rounded"></div>
                          <div className="w-9 h-0.5 bg-gray-400 rounded"></div>
                          <div className="w-12 h-0.5 bg-gray-400 rounded"></div>
                        </div>
                        <div className="w-5 h-1 bg-emerald-400 rounded self-end"></div>
                      </div>
                    </div>

                    {/* ─── 3D COCKPIT EMITTER PEDESTAL UNDER THE MODEL ─── */}
                    <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-[380px] sm:w-[460px] h-[90px] pointer-events-none z-10 flex flex-col items-center justify-center">
                      {/* Vertical Hologram Light Beam Cone */}
                      <div className="absolute bottom-6 w-52 h-44 bg-gradient-to-t from-cyan-500/25 via-sky-400/10 to-transparent blur-md"></div>

                      {/* Concentric Elliptical Projection Rings with 3D Perspective */}
                      <div 
                        className="relative w-full h-[70px] flex items-center justify-center"
                        style={{ perspective: '800px' }}
                      >
                        {/* Outer Tiered Metallic Pedestal Disc */}
                        <div 
                          className="w-[340px] sm:w-[420px] h-[85px] rounded-full border-2 border-cyan-400/50 bg-[#060c20]/95 shadow-[0_0_35px_rgba(6,182,212,0.4)] flex items-center justify-center"
                          style={{ transform: 'rotateX(68deg)' }}
                        >
                          {/* Inner Glowing Ring */}
                          <div className="w-[260px] sm:w-[320px] h-[60px] rounded-full border border-cyan-300/80 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center justify-center">
                            {/* Central Laser Projector Aperture */}
                            <div className="w-16 h-8 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee] animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT: LIVE ANALYTICS HUD DISPLAY */}
                  <motion.div 
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="hidden lg:flex flex-col gap-3 w-[260px] z-30 flex-shrink-0"
                  >
                    <div className="rounded-2xl bg-[#060c1d]/90 border border-cyan-500/40 p-4 backdrop-blur-2xl shadow-2xl shadow-black relative overflow-hidden">
                      {/* Top Row: Live Analytics + Pulsing indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          Live Analytics
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          ● Live
                        </span>
                      </div>

                      {/* Equalizer Frequency Bar Graph */}
                      <div className="flex items-end gap-[3px] h-9 mb-4 px-1 py-1 bg-black/50 rounded-lg border border-white/10">
                        {[45, 75, 60, 90, 100, 80, 65, 85, 95, 70, 85, 60, 78, 92].map((height, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-cyan-600 via-sky-400 to-cyan-200 rounded-xs transition-all duration-300" 
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>

                      {/* Metrics List */}
                      <div className="space-y-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-gray-400">Papers Indexed</span>
                          <span className="text-cyan-300 font-extrabold text-sm">200M+</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-gray-400">Connections</span>
                          <span className="text-purple-300 font-extrabold text-sm">1.2B+</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <span className="text-gray-400">Concepts</span>
                          <span className="text-emerald-300 font-extrabold text-sm">45K+</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Research Domains</span>
                          <span className="text-sky-300 font-extrabold text-sm">120+</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Explore Button */}
                    <button 
                      onClick={() => triggerTraversal('AUTH', 'LOGIN')}
                      className="w-full py-2.5 rounded-xl bg-[#060c1d]/90 hover:bg-white/10 border border-white/15 hover:border-cyan-400/50 text-xs font-bold text-gray-200 hover:text-white transition-all flex items-center justify-center gap-2 backdrop-blur-xl shadow-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Open Full Telemetry Grid
                    </button>
                  </motion.div>

                </div>

                {/* ─── BOTTOM COCKPIT COMMAND DECK & SEARCH CONSOLE ─── */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="relative z-30 w-full mt-auto"
                >
                  {/* Central Pedestal Badge Mounting */}
                  <div className="flex justify-center -mb-[1px]">
                    <div className="px-8 py-2 rounded-t-2xl bg-[#070e24]/95 border-2 border-cyan-500/50 border-b-0 backdrop-blur-2xl text-center shadow-[0_-12px_30px_rgba(6,182,212,0.25)] flex flex-col items-center">
                      <span className="text-[11px] font-black text-cyan-300 uppercase tracking-[0.25em] block drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                        RESEARCHGRAPH AI
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] block">
                        INTEGRATING GLOBAL KNOWLEDGE
                      </span>
                    </div>
                  </div>

                  {/* Cockpit Command Deck Bar */}
                  <div className="w-full bg-[#050a1a]/95 backdrop-blur-3xl border-t-2 border-cyan-500/40 px-4 sm:px-8 py-4 shadow-[0_-15px_40px_rgba(0,0,0,0.9)]">
                    <div className="max-w-[1550px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                      
                      {/* Left Console: Multi-Source Retrieval */}
                      <div 
                        onClick={() => scrollToSection(sourcesSectionRef)}
                        className="hidden sm:flex items-center gap-3.5 flex-shrink-0 cursor-pointer group p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 transition-all shadow-inner"
                      >
                        {/* High-Tech Rotating Radar Grid */}
                        <div className="relative w-12 h-12 rounded-full border border-cyan-500/50 bg-[#030612] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                          <div className="absolute inset-0 rounded-full border border-cyan-400/20"></div>
                          <div className="absolute w-full h-[1px] bg-cyan-500/30 top-1/2 -translate-y-1/2"></div>
                          <div className="absolute h-full w-[1px] bg-cyan-500/30 left-1/2 -translate-x-1/2"></div>
                          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
                          <Radio className="w-4 h-4 text-cyan-400 z-10" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider block group-hover:text-cyan-300 transition-colors">
                            Multi-Source Retrieval
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono block">
                            45+ Academic Repositories Connected
                          </span>
                        </div>
                      </div>

                      {/* Center Console: Interactive Search Question Console */}
                      <form 
                        onSubmit={handleHeroSearch}
                        className="flex-1 w-full max-w-2xl"
                      >
                        <div className="flex items-center justify-between mb-1.5 px-1">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                            ASK A RESEARCH QUESTION
                          </span>
                          <span className="text-[9px] text-cyan-400 font-mono hidden sm:inline">
                            Direct Natural Language Search
                          </span>
                        </div>

                        <div className="relative h-12 bg-[#091129]/95 border-2 border-cyan-500/50 focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-500/40 rounded-xl flex items-center px-4 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all group">
                          <Search className="w-4 h-4 text-cyan-400 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='E.g., "How does graph neural networks improve drug discovery?"'
                            className="w-full bg-transparent text-white placeholder-gray-400 text-xs sm:text-sm font-sans focus:outline-none"
                          />
                          <button 
                            type="submit"
                            className="ml-2 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
                          >
                            <ArrowRight className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </form>

                      {/* Right Console: AI-Powered Insights */}
                      <div 
                        onClick={() => scrollToSection(pipelineSectionRef)}
                        className="hidden sm:flex items-center gap-3.5 flex-shrink-0 text-left cursor-pointer group p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/40 transition-all shadow-inner"
                      >
                        {/* Glowing AI Chip Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/25 to-purple-600/25 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                          <Cpu className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider block group-hover:text-cyan-300 transition-colors">
                            AI-Powered Insights
                          </span>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-gray-300">
                            <span>• Summarize</span>
                            <span>• Connect concepts</span>
                            <span>• Find related work</span>
                            <span>• Generate insights</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Downward Scroll Prompt */}
                  <div 
                    onClick={() => scrollToSection(topologySectionRef)}
                    className="w-full py-2 bg-[#02050e]/95 border-t border-white/10 flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-cyan-400 transition-colors group"
                  >
                    <span className="text-[10px] font-bold tracking-widest uppercase font-mono group-hover:tracking-wider transition-all">
                      Scroll to explore platform architecture & 3D topology
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
                  </div>
                </motion.div>

              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*      SCROLLABLE SECTION 1: 3D KNOWLEDGE GRAPH TOPOLOGY DEEP-DIVE                     */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div 
                ref={topologySectionRef}
                className="w-full py-20 px-4 sm:px-8 bg-[#04091a] relative z-20 border-t border-white/10"
              >
                <div className="max-w-7xl mx-auto">
                  
                  {/* Section Header */}
                  <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                      <Network className="w-3.5 h-3.5" /> High-Dimensional Knowledge Topologies
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                      Every Paper, Author & Concept<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                        Mapped in 3D Vector Space
                      </span>
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      Traditional keyword searches fail to capture cross-disciplinary connections. ResearchGraph AI projects 200M+ academic documents into a geometric graph, where conceptual proximity reflects mathematical relevance.
                    </p>
                  </div>

                  {/* Domain Filter Tabs */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
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
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                            isActive 
                              ? `${tab.color} shadow-lg shadow-cyan-950/50` 
                              : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 6 Dimensions Grid Cards */}
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
                        <div key={idx} className={`p-6 rounded-2xl border ${card.color} backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-5 h-5" />
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
              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*      SCROLLABLE SECTION 2: 45+ CONNECTED SCHOLARLY REPOSITORIES                      */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div 
                ref={sourcesSectionRef}
                className="w-full py-20 px-4 sm:px-8 bg-[#030612] relative z-20 border-t border-white/10"
              >
                <div className="max-w-7xl mx-auto">
                  
                  {/* Section Header */}
                  <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                      <Database className="w-3.5 h-3.5" /> 45+ Global Academic Databases
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                      Continuous Ingestion Across<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400">
                        The World's Scientific Repositories
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
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-white text-base">{source.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-white/5 font-mono ${source.color}`}>
                              {source.tag}
                            </span>
                          </div>
                          <span className="text-cyan-400 font-extrabold text-sm block mb-1">{source.papers}</span>
                          <p className="text-[11px] text-gray-400 mb-3">{source.domain}</p>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {source.status}
                          </span>
                          <span className="group-hover:text-cyan-400 transition-colors">Details →</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connect Sources Banner */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Need custom private repository integration?</h3>
                      <p className="text-xs text-gray-300">Connect institutional repositories, lab databases, internal patents, and private PDFs with enterprise end-to-end encryption.</p>
                    </div>
                    <button 
                      onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 flex-shrink-0"
                    >
                      Connect Enterprise Sources <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*      SCROLLABLE SECTION 3: RAG MULTI-LLM SYNTHESIS ARCHITECTURE                      */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div 
                ref={pipelineSectionRef}
                className="w-full py-20 px-4 sm:px-8 bg-[#04091a] relative z-20 border-t border-white/10"
              >
                <div className="max-w-7xl mx-auto">
                  
                  {/* Section Header */}
                  <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                      <Zap className="w-3.5 h-3.5" /> End-to-End Autonomous Pipeline
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                      How RAG & Multi-LLM Synthesis<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                        Delivers Hallucination-Free Answers
                      </span>
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                      Every generated literature review, hypothesis, and answer is mathematically anchored to peer-reviewed source literature with direct DOI citation links.
                    </p>
                  </div>

                  {/* 4-Stage Pipeline Cards */}
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
                      <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 flex flex-col justify-between relative group">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-2xl font-black bg-gradient-to-r ${stage.color} bg-clip-text text-transparent`}>
                            {stage.step}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300">
                            {stage.tag}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-lg mb-0.5">{stage.title}</h3>
                          <span className="text-xs font-semibold text-cyan-400 block mb-3">{stage.subtitle}</span>
                          <p className="text-xs text-gray-300 leading-relaxed mb-4">{stage.desc}</p>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${stage.color}`} style={{ width: `${(idx + 1) * 25}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*      SCROLLABLE SECTION 4: INTERACTIVE RESEARCH QUESTION SANDBOX                     */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div className="w-full py-20 px-4 sm:px-8 bg-[#02050e] relative z-20 border-t border-white/10">
                <div className="max-w-6xl mx-auto">
                  
                  {/* Section Header */}
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> Interactive Research Sandbox
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                      Test the Autonomous Engine<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500">
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
                        onClick={() => setActiveDemoQuery(idx)}
                        className={`p-4 rounded-2xl text-left transition-all border flex items-center justify-between gap-3 ${
                          activeDemoQuery === idx
                            ? 'bg-[#09132e] border-cyan-400 shadow-lg shadow-cyan-950/40 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1 uppercase tracking-wider">
                            {item.domain}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold">{item.query}</span>
                        </div>
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform ${activeDemoQuery === idx ? 'text-cyan-400 translate-x-1' : 'text-gray-500'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Sandbox Simulated Output Display */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#060c1f] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Query Target</span>
                        <h4 className="text-base sm:text-lg font-bold text-white">{demoQueries[activeDemoQuery].query}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                          {demoQueries[activeDemoQuery].nodesFound} Nodes
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
                          {demoQueries[activeDemoQuery].papersFound} Papers
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                          {demoQueries[activeDemoQuery].confidence} Confidence
                        </span>
                      </div>
                    </div>

                    {/* Synthesized Summary */}
                    <div className="mb-6">
                      <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                        <BrainCircuit className="w-3.5 h-3.5" /> Synthesized Multi-Paper Consensus
                      </span>
                      <p className="text-sm text-gray-200 leading-relaxed p-4 rounded-xl bg-black/40 border border-white/5">
                        {demoQueries[activeDemoQuery].summary}
                      </p>
                    </div>

                    {/* Cited Papers */}
                    <div className="mb-6">
                      <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Primary Anchor Literature
                      </span>
                      <div className="space-y-2">
                        {demoQueries[activeDemoQuery].papers.map((p, pIdx) => (
                          <div key={pIdx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-white block">{p.title}</span>
                              <span className="text-[11px] text-gray-400">{p.authors} • {p.journal} • {p.citations} citations</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 self-start sm:self-auto">
                              DOI: {p.doi}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Discovered Conceptual Bridges */}
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> Discovered Concept Bridges
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {demoQueries[activeDemoQuery].connections.map((conn, cIdx) => (
                          <span key={cIdx} className="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            {conn}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <span className="text-xs text-gray-400">Want to run custom full-text synthesis queries?</span>
                      <button 
                        onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
                      >
                        Launch Interactive Explorer <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*      SCROLLABLE SECTION 5: FINAL LAUNCHPAD CALL TO ACTION                            */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div className="w-full py-24 px-4 sm:px-8 bg-gradient-to-b from-[#02050e] to-[#04091a] relative z-20 border-t border-white/10">
                <div className="max-w-4xl mx-auto text-center">
                  
                  <div className="w-16 h-16 rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/30">
                    <Network className="w-8 h-8 text-cyan-300" />
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                    Ready to Enter the Universe of<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                      Connected Scientific Knowledge?
                    </span>
                  </h2>

                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
                    Join 140,000+ researchers, university labs, and innovators exploring 200M+ research publications with autonomous graph intelligence.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button 
                      onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-cyan-500/35 border border-cyan-400/40 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2.5"
                    >
                      Launch 3D Explorer Free <ArrowRight className="w-4 h-4" />
                    </button>

                    <button 
                      onClick={() => triggerTraversal('AUTH', 'LOGIN')}
                      className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/20 hover:border-cyan-400/40 text-gray-200 hover:text-white font-bold text-sm sm:text-base transition-all backdrop-blur-md hover:bg-white/10"
                    >
                      Sign In to Account
                    </button>
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*                                HIGH-TECH FOOTER                                    */}
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
                    <span>All 45+ Sources Connected • 100% Operational</span>
                  </div>

                  {/* Copyright & Quick Links */}
                  <div className="flex items-center gap-4 text-[11px]">
                    <button onClick={() => setActiveModal('SOURCES')} className="hover:text-cyan-400 transition-colors">Data Sources</button>
                    <button onClick={() => setActiveModal('HOW_IT_WORKS')} className="hover:text-cyan-400 transition-colors">Pipeline Docs</button>
                    <button onClick={() => setActiveModal('ABOUT')} className="hover:text-cyan-400 transition-colors">About Us</button>
                    <span>© 2026 ResearchGraph AI</span>
                  </div>

                </div>
              </footer>

              {/* ═══════════════ INTERACTIVE INFORMATION MODALS ═══════════════ */}
              <AnimatePresence>
                {activeModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl"
                  >
                    <motion.div 
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 15 }}
                      className="bg-[#0a0f1c] border border-white/15 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-cyan-500/10 text-left"
                    >
                      {/* Close button */}
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* --- MODAL 1: HOW IT WORKS --- */}
                      {activeModal === 'HOW_IT_WORKS' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Zap className="w-4 h-4" /> Autonomous Research Engine
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">How ResearchGraph AI Works</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Traditional search engines return isolated lists of PDFs. ResearchGraph AI ingests millions of papers, builds high-dimensional knowledge graphs, and synthesizes answers using state-of-the-art LLMs.
                          </p>

                          <div className="space-y-4 mb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-400 font-bold">1</div>
                              <div>
                                <h3 className="font-bold text-base text-white mb-1">Continuous Multi-Source Ingestion</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Automated pipelines continuously ingest preprints, peer-reviewed journals, and institutional datasets across arXiv, PubMed, IEEE Xplore, CrossRef, and OpenAlex.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-400 font-bold">2</div>
                              <div>
                                <h3 className="font-bold text-base text-white mb-1">Graph Neural Embedding & 3D Topology</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Extracts research concepts, authors, citations, datasets, and hypotheses into an interactive 3D knowledge graph where mathematical proximity denotes conceptual relationship.
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-start">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 text-purple-400 font-bold">3</div>
                              <div>
                                <h3 className="font-bold text-base text-white mb-1">Multi-LLM Synthesis & Hypothesis Generation</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                  Ensembles of GPT-4o, Claude 3.5, and Gemini synthesize literature reviews, generate novel research hypotheses, and validate claims with exact citation anchors.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Ready to accelerate your research?</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30"
                            >
                              Get Started Free
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- MODAL 2: DATA SOURCES --- */}
                      {activeModal === 'SOURCES' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Database className="w-4 h-4" /> Global Scholarly Catalog
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Connected Research Sources</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Direct, real-time API integrations across the world's most reputable academic repositories, covering 200M+ publications and 1.2B+ citation relationships.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                            {[
                              { name: 'arXiv', count: '13.4M Papers', desc: 'Physics, Mathematics, Computer Science, AI, and Quantitative Biology', tag: 'Open Access', color: 'border-red-500/30 text-red-400' },
                              { name: 'PubMed & NCBI', count: '36.2M Papers', desc: 'Biomedical, Life Sciences, Clinical Trials, Genomics, and Health', tag: 'NIH / Med', color: 'border-blue-500/30 text-blue-400' },
                              { name: 'IEEE Xplore', count: '8.1M Papers', desc: 'Electrical Engineering, Computer Hardware, Telecommunications, Robotics', tag: 'Engineering', color: 'border-sky-500/30 text-sky-400' },
                              { name: 'Semantic Scholar', count: '203M Papers', desc: 'Multi-disciplinary academic research catalog with semantic vector index', tag: 'Multi-Domain', color: 'border-yellow-500/30 text-yellow-400' },
                              { name: 'CrossRef', count: '140M DOIs', desc: 'Universal scientific citation networks, publisher metadata, and DOIs', tag: 'Citations', color: 'border-green-500/30 text-green-400' },
                              { name: 'OpenAlex', count: '250M Entities', desc: 'Global scholarly ontology mapping authors, institutions, and concepts', tag: 'Ontology', color: 'border-purple-500/30 text-purple-400' },
                            ].map((source, idx) => (
                              <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-bold text-white text-sm">{source.name}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-white/5 font-mono ${source.color}`}>{source.tag}</span>
                                </div>
                                <span className="text-cyan-400 font-extrabold text-xs block mb-1">{source.count}</span>
                                <p className="text-[11px] text-gray-400 leading-tight">{source.desc}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Want to connect custom institutional databases?</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs sm:text-sm hover:from-purple-400 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30"
                            >
                              Connect Your Sources
                            </button>
                          </div>
                        </div>
                      )}

                      {/* --- MODAL 3: ABOUT US --- */}
                      {activeModal === 'ABOUT' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">
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

                      {/* --- MODAL 4: INTERACTIVE DEMO WALKTHROUGH --- */}
                      {activeModal === 'DEMO' && (
                        <div>
                          <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Interactive Platform Demonstration
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Cockpit Research Traversal</h2>
                          <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Experience how ResearchGraph AI automates months of literature discovery into seconds of deep graph traversal.
                          </p>

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

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-400">Ready to explore with your own research queries?</span>
                            <button 
                              onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
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
                    {authMode === 'LOGIN' ? 'Welcome Back' : 'Create Researcher ID'}
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
                              placeholder="Dr. Elena Vance" 
                              required 
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
                          placeholder="researcher@lab.org" 
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
                          type="password" 
                          placeholder="••••••••••••" 
                          required 
                          className={`w-full bg-[#030712]/80 border border-white/15 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none transition-all text-sm ${
                            authMode === 'LOGIN' 
                              ? 'focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50' 
                              : 'focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50'
                          }`} 
                        />
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

                    <button 
                      type="submit" 
                      className={`w-full text-white rounded-xl py-3.5 mt-4 font-bold flex items-center justify-center gap-2 transition-all text-sm tracking-wide shadow-lg ${
                        authMode === 'LOGIN'
                          ? 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25 hover:shadow-cyan-500/40'
                          : 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40'
                      }`}
                    >
                      {authMode === 'LOGIN' ? 'Launch Platform' : 'Initialize Account'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Guest Instant Demo Access */}
                    <button
                      type="button"
                      onClick={onAuthComplete}
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Instant Demo Explorer
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
