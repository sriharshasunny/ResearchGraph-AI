import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  Network, Mail, Lock, User, ArrowRight, BrainCircuit, Sparkles, ArrowLeft, 
  Zap, Database, Layers, Info, X, Compass, Award, KeyRound, CheckCircle2,
  Play, ChevronDown, Activity, Cpu, Share2, Radio, FileText,
  Microscope, Binary, Eye, EyeOff, Loader2
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
  const sourcesSectionRef = useRef<HTMLDivElement>(null);
  const pipelineSectionRef = useRef<HTMLDivElement>(null);
  const sandboxSectionRef = useRef<HTMLDivElement>(null);

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
              <nav className="w-full px-4 sm:px-8 py-3 flex items-center justify-between bg-[#040816]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50 shadow-2xl shadow-black/80">
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
                      onClick={() => { scrollToSection(pipelineSectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2.5 px-3 text-sm font-semibold text-purple-300 hover:bg-purple-500/15 rounded-xl flex items-center gap-2.5"
                    >
                      <Zap className="w-4 h-4 text-amber-400" /> RAG Pipeline
                    </button>
                    <button 
                      onClick={() => { scrollToSection(sourcesSectionRef); setMobileMenuOpen(false); }}
                      className="text-left py-2.5 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15 rounded-xl flex items-center gap-2.5"
                    >
                      <Database className="w-4 h-4 text-emerald-400" /> Data Sources (45+ Repos)
                    </button>
                    <button 
                      onClick={() => { setActiveModal('ABOUT'); setMobileMenuOpen(false); }}
                      className="text-left py-2.5 px-3 text-sm font-semibold text-sky-300 hover:bg-sky-500/15 rounded-xl flex items-center gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" /> About ResearchGraph AI
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*        AUTHENTIC STARSHIP COCKPIT BRIDGE HERO VIEW (SEARCH BAR REMOVED)              */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div className="relative w-full min-h-[calc(100vh-65px)] flex flex-col justify-between overflow-hidden bg-transparent">
                
                {/* Top Canopy Arch Beam */}
                <div className="absolute top-0 left-0 right-0 h-9 pointer-events-none z-20 bg-gradient-to-b from-[#040816]/90 via-[#060c20]/60 to-transparent flex items-center justify-between px-6 sm:px-12 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2.5 text-[9px] font-mono text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="tracking-wider">COCKPIT BRIDGE // 3D HUD ONLINE</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-[9px] font-mono text-gray-400">
                    <span className="text-emerald-400 font-semibold">● 45 SOURCES SYNCHRONIZED</span>
                    <span className="text-cyan-400 font-semibold">GRAPH TOPOLOGY: ACTIVE</span>
                    <span>CANOPY PRESSURIZED</span>
                  </div>
                </div>

                {/* Left & Right Canopy Structural Pillar Struts */}
                <div className="absolute top-0 left-0 bottom-28 w-10 sm:w-14 pointer-events-none z-20 hidden md:block">
                  <div className="w-full h-full bg-gradient-to-r from-[#030612]/95 via-[#050b1a]/40 to-transparent border-r border-cyan-500/15 relative">
                    <div className="absolute top-1/4 left-1.5 w-1 h-14 bg-cyan-500/40 rounded-full"></div>
                    <div className="absolute top-1/2 left-1.5 w-1 h-20 bg-purple-500/40 rounded-full"></div>
                  </div>
                </div>

                <div className="absolute top-0 right-0 bottom-28 w-10 sm:w-14 pointer-events-none z-20 hidden md:block">
                  <div className="w-full h-full bg-gradient-to-l from-[#030612]/95 via-[#050b1a]/40 to-transparent border-l border-cyan-500/15 relative">
                    <div className="absolute top-1/3 right-1.5 w-1 h-16 bg-cyan-500/40 rounded-full"></div>
                    <div className="absolute bottom-1/3 right-1.5 w-1 h-24 bg-purple-500/40 rounded-full"></div>
                  </div>
                </div>

                {/* Ambient Radial Nebula Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-cyan-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none z-0"></div>

                {/* ─── HERO STAGE: LEFT HERO COPY + CENTER 3D KNOWLEDGE SPHERE ─── */}
                <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-14 lg:pt-16 pb-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
                  
                  {/* LEFT: HERO COPY & CALL TO ACTIONS */}
                  <motion.div 
                    initial={{ opacity: 0, x: -25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex-1 flex flex-col items-start text-left max-w-xl z-30"
                  >
                    {/* Brand Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-lg backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      AUTONOMOUS SCIENTIFIC INTELLIGENCE
                    </div>

                    {/* Massive Punchy Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] mb-4 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                      A Universe<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                        of Connected
                      </span><br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-fuchsia-400">
                        Knowledge
                      </span>
                    </h1>

                    {/* Subtitle Description */}
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-5 max-w-md drop-shadow">
                      RAG-powered research intelligence with high-dimensional knowledge graphs, 45+ academic repositories, and multi-LLMs to help you discover, connect and synthesize scientific breakthroughs.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <button 
                        onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center gap-2 border border-cyan-400/40 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        <Compass className="w-4 h-4 text-cyan-200" />
                        <span>Explore 3D Graph</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => setActiveModal('DEMO')}
                        className="px-5 py-3 rounded-xl bg-[#060c20]/90 border border-white/20 hover:border-cyan-400/50 text-gray-200 hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 backdrop-blur-xl hover:bg-white/10 shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                        <span>Live Simulation</span>
                      </button>
                    </div>

                    {/* 4 Stats Grid with Glowing Accents */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full pt-3 border-t border-white/15">
                      <div className="bg-[#050b1a]/90 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl p-2.5 backdrop-blur-md shadow-md transition-all group">
                        <span className="text-base sm:text-lg font-black text-cyan-400 block tracking-tight group-hover:scale-105 transition-transform">204M+</span>
                        <span className="text-gray-400 text-[10px] leading-tight block">Research Papers</span>
                      </div>
                      <div className="bg-[#050b1a]/90 border border-purple-500/20 hover:border-purple-500/50 rounded-xl p-2.5 backdrop-blur-md shadow-md transition-all group">
                        <span className="text-base sm:text-lg font-black text-purple-400 block tracking-tight group-hover:scale-105 transition-transform">45+</span>
                        <span className="text-gray-400 text-[10px] leading-tight block">Data Sources</span>
                      </div>
                      <div className="bg-[#050b1a]/90 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-2.5 backdrop-blur-md shadow-md transition-all group">
                        <span className="text-base sm:text-lg font-black text-emerald-400 block tracking-tight group-hover:scale-105 transition-transform">Multi-LLM</span>
                        <span className="text-gray-400 text-[10px] leading-tight block">Zero Hallucination</span>
                      </div>
                      <div className="bg-[#050b1a]/90 border border-sky-500/20 hover:border-sky-500/50 rounded-xl p-2.5 backdrop-blur-md shadow-md transition-all group">
                        <span className="text-base sm:text-lg font-black text-sky-400 block tracking-tight group-hover:scale-105 transition-transform">14ms</span>
                        <span className="text-gray-400 text-[10px] leading-tight block">Graph Latency</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* ─── CENTER: 3D KNOWLEDGE SPHERE ─── */}
                  <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[520px] lg:h-[520px] flex items-center justify-center flex-shrink-0 my-1">
                    <div className="absolute w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.3)_0%,rgba(99,102,241,0.18)_45%,transparent_72%)] blur-2xl pointer-events-none animate-pulse-slow"></div>

                    <div className="absolute inset-[-30%] z-10">
                      <iframe allowTransparency={true} src="/knowledge_globe.html" className="w-full h-full border-none pointer-events-auto" style={{ background: 'transparent' }} title="Knowledge Globe" />
                    </div>
                  </div>

                </div>

                {/* ─── BOTTOM COCKPIT COMMAND DECK (PRO DESIGNER TELEMETRY HUB - SEARCH BAR REPLACED) ─── */}
                <motion.div 
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.6 }}
                  className="relative z-30 w-full mt-1"
                >
                  {/* Glowing 3D Curved Arc Tracer Line */}
                  <div className="relative w-full h-8 sm:h-10 flex justify-center items-end overflow-hidden pointer-events-none">
                    <svg className="w-full h-12 text-cyan-400/80" viewBox="0 0 1200 65" preserveAspectRatio="none">
                      <path 
                        d="M 0 65 Q 600 -8 1200 65" 
                        fill="none" 
                        stroke="url(#cockpitCurveGlow)" 
                        strokeWidth="3.5" 
                        filter="drop-shadow(0 0 10px #06b6d4)" 
                      />
                      <path 
                        d="M 100 65 Q 600 10 1100 65" 
                        fill="none" 
                        stroke="#38bdf8" 
                        strokeWidth="1.5" 
                        strokeDasharray="9 7" 
                        opacity="0.8" 
                      />
                      <path 
                        d="M 585 6 Q 600 0 615 6" 
                        fill="none" 
                        stroke="#67e8f9" 
                        strokeWidth="2.5" 
                      />
                      <defs>
                        <linearGradient id="cockpitCurveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                          <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.95" />
                          <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                          <stop offset="75%" stopColor="#22d3ee" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Central Pedestal Badge */}
                  <div className="flex justify-center -mb-[2px] relative z-30">
                    <div className="px-6 py-1.5 rounded-t-2xl bg-[#060c22]/98 border-2 border-cyan-400/70 border-b-0 backdrop-blur-3xl text-center shadow-[0_-12px_25px_rgba(6,182,212,0.35)] flex flex-col items-center">
                      <span className="text-[10px] font-black text-cyan-300 uppercase tracking-[0.25em] block drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
                        RESEARCHGRAPH AI
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] block">
                        COCKPIT BRIDGE // TELEMETRY COMMAND
                      </span>
                    </div>
                  </div>

                  {/* Panoramic Curved Cockpit Bridge Console Deck */}
                  <div 
                    style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
                    className="w-full bg-gradient-to-b from-[#060c20]/98 via-[#040816] to-[#02050e] backdrop-blur-3xl border-t-2 border-cyan-400/60 px-4 sm:px-8 py-3 shadow-[0_-20px_50px_rgba(0,0,0,0.95)]"
                  >
                    <div className="max-w-[1550px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                      
                      {/* Left Deck: Multi-Source Repository Stream */}
                      <div 
                        onClick={() => scrollToSection(sourcesSectionRef)}
                        style={{ perspective: 800, transform: 'rotateY(6deg)' }}
                        className="hidden sm:flex items-center gap-3 flex-shrink-0 cursor-pointer group p-2.5 rounded-2xl bg-[#081026]/90 border border-cyan-500/40 hover:border-cyan-400 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      >
                        <div className="relative w-11 h-11 rounded-full border-2 border-cyan-400/60 bg-[#030612] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                          <div className="absolute inset-0 rounded-full border border-cyan-400/20"></div>
                          <div className="absolute w-full h-[1px] bg-cyan-500/40 top-1/2 -translate-y-1/2"></div>
                          <div className="absolute h-full w-[1px] bg-cyan-500/40 left-1/2 -translate-x-1/2"></div>
                          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-300 animate-spin"></div>
                          <Radio className="w-4 h-4 text-cyan-300 z-10" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider block group-hover:text-white transition-colors">
                            Multi-Source Stream
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono block">
                            45+ Academic Repositories Connected
                          </span>
                        </div>
                      </div>

                      {/* Center Console: Interactive Scientific Domain Command Deck (SEARCH BAR REPLACED) */}
                      <div className="flex-1 w-full max-w-2xl bg-[#081026]/95 border-2 border-cyan-400/60 rounded-2xl p-2.5 shadow-[0_0_30px_rgba(6,182,212,0.25)] flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                          <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                            ACTIVE DOMAIN CLUSTERS:
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {[
                            { name: 'AI & Neural', icon: BrainCircuit, color: 'text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/10' },
                            { name: 'Genomics', icon: Microscope, color: 'text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10' },
                            { name: 'Quantum', icon: Binary, color: 'text-purple-400 border-purple-500/40 hover:bg-purple-500/10' },
                            { name: 'Materials', icon: Sparkles, color: 'text-amber-400 border-amber-500/40 hover:bg-amber-500/10' },
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => scrollToSection(topologySectionRef)}
                                className={`px-2.5 py-1 rounded-lg border bg-[#050b1a] text-[11px] font-bold font-mono transition-all flex items-center gap-1.5 ${item.color}`}
                              >
                                <Icon className="w-3 h-3" />
                                <span>{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/30 flex-shrink-0"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Right Console: AI-Powered Insights */}
                      <div 
                        onClick={() => scrollToSection(pipelineSectionRef)}
                        style={{ perspective: 800, transform: 'rotateY(-6deg)' }}
                        className="hidden sm:flex items-center gap-3 flex-shrink-0 text-left cursor-pointer group p-2.5 rounded-2xl bg-[#081026]/90 border border-purple-500/40 hover:border-purple-400 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border-2 border-cyan-400/60 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                          <Cpu className="w-5 h-5 text-cyan-300 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                          <span className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider block group-hover:text-white transition-colors">
                            AI Synthesis Engine
                          </span>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-gray-300">
                            <span>• Direct Citations</span>
                            <span>• Methodologies</span>
                            <span>• Hypotheses</span>
                            <span>• Benchmarks</span>
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
                className="w-full py-24 px-4 sm:px-8 bg-[#04091a] relative z-20 border-t border-white/10"
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
                  <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
                    {[
                      { id: 'ai', label: 'Artificial Intelligence', icon: BrainCircuit, color: 'border-cyan-500 text-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.3)]' },
                      { id: 'bio', label: 'Genomics & Biomedicine', icon: Microscope, color: 'border-emerald-500 text-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
                      { id: 'quantum', label: 'Quantum Computing', icon: Binary, color: 'border-purple-500 text-purple-400 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
                      { id: 'materials', label: 'Materials Discovery', icon: Sparkles, color: 'border-amber-500 text-amber-400 bg-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
                      { id: 'neuro', label: 'Neurobiology', icon: Network, color: 'border-rose-500 text-rose-400 bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.3)]' },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = selectedDomain === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedDomain(tab.id as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                            isActive 
                              ? `${tab.color}` 
                              : 'border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 6 Dimensions Grid Cards - REDESIGNED PRO DESIGNER QUALITY */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { 
                        title: "Authors & Principal Investigators", 
                        count: "38.4M Entities", 
                        desc: "Maps global co-authorship networks, lab affiliations, citation trajectories, and multi-disciplinary mentorship lineage across leading universities.", 
                        color: "border-amber-500/30 text-amber-400 bg-gradient-to-br from-amber-500/10 via-[#0a1128] to-[#040816]", 
                        badge: "Graph Clustering",
                        icon: User 
                      },
                      { 
                        title: "Full-Text Research Literature", 
                        count: "204.8M Nodes", 
                        desc: "Vectorized full-text documents including mathematical derivations, empirical datasets, figure captions, and cross-domain methodology embeddings.", 
                        color: "border-cyan-500/30 text-cyan-400 bg-gradient-to-br from-cyan-500/10 via-[#0a1128] to-[#040816]", 
                        badge: "1536-Dim HNSW",
                        icon: FileText 
                      },
                      { 
                        title: "Autonomous Ontology & Concepts", 
                        count: "45,200 Taxonomies", 
                        desc: "Continuous neural clustering identifying emergent conceptual paradigms, resolving synonym clashes, and bridging disparate scientific vocabularies.", 
                        color: "border-purple-500/30 text-purple-400 bg-gradient-to-br from-purple-500/10 via-[#0a1128] to-[#040816]", 
                        badge: "LLM Extraction",
                        icon: Sparkles 
                      },
                      { 
                        title: "Empirical & Benchmark Datasets", 
                        count: "1.4M Repositories", 
                        desc: "Direct cryptographic links between published claims, benchmark performance tables, Hugging Face checkpoints, PDB structures, and code repos.", 
                        color: "border-emerald-500/30 text-emerald-400 bg-gradient-to-br from-emerald-500/10 via-[#0a1128] to-[#040816]", 
                        badge: "Verifiable Data",
                        icon: Database 
                      },
                      { 
                        title: "Directional Citation Networks", 
                        count: "1.24B Verified Edges", 
                        desc: "High-order citation topologies categorizing references into foundational pillars, conflicting empirical results, and incremental extensions.", 
                        color: "border-rose-500/30 text-rose-400 bg-gradient-to-br from-rose-500/10 via-[#0a1128] to-[#040816]", 
                        badge: "Semantic Edges",
                        icon: Share2 
                      },
                      { 
                        title: "Frontier Velocity Index", 
                        count: "Live Real-Time Index", 
                        desc: "Continuous algorithmic telemetry calculating acceleration spikes in preprints, patent filings, and cross-field convergence momentum.", 
                        color: "border-fuchsia-500/30 text-fuchsia-400 bg-gradient-to-br from-fuchsia-500/10 via-[#0a1128] to-[#040816]", 
                        badge: "Real-Time Feed",
                        icon: Activity 
                      },
                    ].map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <div 
                          key={idx} 
                          className={`p-6 sm:p-7 rounded-3xl border ${card.color} backdrop-blur-2xl relative overflow-hidden group hover:scale-[1.02] hover:border-cyan-400/60 transition-all duration-300 shadow-xl shadow-black/50`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Icon className="w-5 h-5" />
                              </div>
                              <h3 className="font-extrabold text-white text-base leading-snug">{card.title}</h3>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono font-bold text-gray-300 border border-white/10">
                              {card.badge}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-300 block mb-2">{card.count}</span>
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
                className="w-full py-24 px-4 sm:px-8 bg-[#030612] relative z-20 border-t border-white/10"
              >
                <div className="max-w-7xl mx-auto">
                  
                  {/* Section Header */}
                  <div className="text-center max-w-3xl mx-auto mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                      <Database className="w-3.5 h-3.5" /> 45+ Global Academic Repositories
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

                  {/* Sources Cards Grid - REDESIGNED PRO DESIGNER QUALITY */}
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
                        className="p-5 rounded-3xl bg-[#070e24]/80 border border-white/10 hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between group hover:scale-[1.02] shadow-lg shadow-black/40"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="font-extrabold text-white text-base group-hover:text-cyan-300 transition-colors">{source.name}</span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border bg-white/5 font-mono ${source.color}`}>
                              {source.tag}
                            </span>
                          </div>
                          <span className="text-cyan-400 font-extrabold text-sm block mb-1">{source.papers}</span>
                          <p className="text-[11px] text-gray-400 mb-4">{source.domain}</p>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {source.status}
                          </span>
                          <span className="group-hover:text-cyan-400 group-hover:translate-x-1 transition-all">Explore →</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Connect Sources Banner */}
                  <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-2xl">
                    <div>
                      <h3 className="text-xl font-extrabold text-white mb-1.5">Need custom institutional repository integration?</h3>
                      <p className="text-xs text-gray-300 max-w-xl">Connect proprietary lab data, institutional repositories, internal patent databases, and research PDFs with enterprise-grade AES-256 encryption.</p>
                    </div>
                    <button 
                      onClick={() => triggerTraversal('AUTH', 'REGISTER')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 flex-shrink-0"
                    >
                      <span>Connect Enterprise Sources</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              {/*      SCROLLABLE SECTION 3: RAG MULTI-LLM SYNTHESIS ARCHITECTURE                      */}
              {/* ════════════════════════════════════════════════════════════════════════════════════ */}
              <div 
                ref={pipelineSectionRef}
                className="w-full py-24 px-4 sm:px-8 bg-[#04091a] relative z-20 border-t border-white/10"
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

                  {/* 4-Stage Pipeline Cards - REDESIGNED PRO DESIGNER QUALITY */}
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
                        className="p-6 sm:p-7 rounded-3xl bg-[#070e24]/80 border border-white/10 hover:border-cyan-400/60 flex flex-col justify-between relative group hover:scale-[1.02] transition-all duration-300 shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-2xl font-black bg-gradient-to-r ${stage.color} bg-clip-text text-transparent`}>
                            {stage.step}
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 font-mono text-gray-300 font-bold">
                            {stage.tag}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-lg mb-1">{stage.title}</h3>
                          <span className="text-xs font-semibold text-cyan-400 block mb-3 font-mono">{stage.subtitle}</span>
                          <p className="text-xs text-gray-300 leading-relaxed mb-4">{stage.desc}</p>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
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
              <div 
                ref={sandboxSectionRef}
                className="w-full py-24 px-4 sm:px-8 bg-[#02050e] relative z-20 border-t border-white/10"
              >
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
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
                      <p className="text-sm text-gray-200 leading-relaxed p-4 rounded-xl bg-black/40 border border-white/5 min-h-[100px]">
                        <TypingEffect text={demoQueries[activeDemoQuery].summary} trigger={activeDemoQuery} />
                        <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse"></span>
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

              {/* ═══════════════ PRO SPRING-ANIMATED MODALS WITH INTERACTIVE TABS & ESC LISTENER ═══════════════ */}
              <AnimatePresence>
                {activeModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveModal(null)}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-2xl"
                  >
                    <motion.div 
                      initial={{ scale: 0.92, y: 25, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 320 } }}
                      exit={{ scale: 0.94, y: 20, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#070c1d]/98 border border-cyan-500/35 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-9 relative shadow-[0_0_80px_rgba(6,182,212,0.2)] text-left"
                    >
                      {/* Top Specular Glow Line */}
                      <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

                      {/* Close button with ESC tip */}
                      <div className="absolute top-5 right-5 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">ESC to close</span>
                        <button 
                          onClick={() => setActiveModal(null)}
                          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Internal Navigation Switcher */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl mb-7 max-w-fit">
                        {[
                          { id: 'HOW_IT_WORKS', label: 'Pipeline Docs', icon: Zap },
                          { id: 'SOURCES', label: '45+ Sources', icon: Database },
                          { id: 'ABOUT', label: 'About Platform', icon: Sparkles },
                          { id: 'DEMO', label: 'Live Demo', icon: Play },
                        ].map((tab) => {
                          const Icon = tab.icon;
                          const isCurrent = activeModal === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveModal(tab.id as InfoModalType)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isCurrent 
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                                  : 'text-gray-400 hover:text-white'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

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
                            <Sparkles className="w-4 h-4" /> About ResearchGraph AI
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
