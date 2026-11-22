import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Search, ArrowRight, Sparkles, Play, CheckCircle2,
  Database, Layers, Binary, FileText, Users, Share2,
  BrainCircuit, Microscope, ChevronDown, X, Menu,
  ArrowUpRight
} from 'lucide-react';
import { ResearchKnowledgeCore } from '../../components/ResearchKnowledgeCore';

interface LandingViewProps {
  onNavigateAuth: (mode: 'LOGIN' | 'REGISTER') => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

// ══════════════════════════════════════════════════════════════════
//  UFO / AUTONOMOUS RESEARCH SPACECRAFT (HERO PATROL + SCROLL TRAVEL)
// ══════════════════════════════════════════════════════════════════
const ResearchSpacecraftUFO: React.FC<{
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ scrollContainerRef }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [ambientTime, setAmbientTime] = useState(0);

  // Ambient patrol timer for hero hovering
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setAmbientTime((t) => t + 0.035);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Track scroll progress along the page container
  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scrollTop / totalScrollable)));
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  // S-Curve Flight Waypoints across 7 sections
  // [progress, xPercent, yPercent, tiltAngle, scale]
  const waypoints = [
    { p: 0.00, x: 84, y: 16, tilt: -6,  scale: 0.95 },  // Hero upper right survey
    { p: 0.16, x: 10, y: 28, tilt: 14,  scale: 1.00 },  // Discovery Pipeline left
    { p: 0.34, x: 91, y: 44, tilt: -12, scale: 1.05 },  // 6 Dimensions right
    { p: 0.52, x: 8,  y: 58, tilt: 12,  scale: 1.00 },  // Knowledge Graph left
    { p: 0.68, x: 91, y: 72, tilt: -10, scale: 1.05 },  // AI Assistant right
    { p: 0.84, x: 9,  y: 84, tilt: 8,   scale: 1.00 },  // RAG Pipeline left
    { p: 1.00, x: 50, y: 94, tilt: 0,   scale: 1.15 }   // Final CTA bottom center
  ];

  const p = scrollProgress;
  let currentWp = waypoints[0];
  let nextWp = waypoints[waypoints.length - 1];

  for (let i = 0; i < waypoints.length - 1; i++) {
    if (p >= waypoints[i].p && p <= waypoints[i + 1].p) {
      currentWp = waypoints[i];
      nextWp = waypoints[i + 1];
      break;
    }
  }

  const range = (nextWp.p - currentWp.p) || 0.001;
  const t = (p - currentWp.p) / range;
  // Smooth cubic ease-in-out
  const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Base waypoint position
  let targetX = currentWp.x + (nextWp.x - currentWp.x) * easeT;
  let targetY = currentWp.y + (nextWp.y - currentWp.y) * easeT;
  let targetTilt = currentWp.tilt + (nextWp.tilt - currentWp.tilt) * easeT;
  const targetScale = currentWp.scale + (nextWp.scale - currentWp.scale) * easeT;

  // When at Hero (p < 0.05), add gentle sinusoidal atmospheric patrol hovering
  const isHero = p < 0.06;
  if (isHero) {
    targetX += Math.sin(ambientTime * 0.45) * 4.5 + Math.cos(ambientTime * 0.2) * 2;
    targetY += Math.cos(ambientTime * 0.4) * 3.2;
    targetTilt += Math.sin(ambientTime * 0.45) * 5;
  } else {
    // Subtle float while browsing any section
    targetY += Math.sin(ambientTime * 0.8) * 1.5;
  }

  // Periodic subtle scanning tractor beam (pulses every ~8s for 2.5s)
  const beamCycle = (ambientTime * 0.5) % 8;
  const beamActive = beamCycle > 5.5;

  return (
    <div
      className="fixed pointer-events-none z-40 transition-transform duration-200 ease-out hidden lg:block"
      style={{
        left: `${targetX}%`,
        top: `${targetY}%`,
        transform: `translate(-50%, -50%) rotate(${targetTilt}deg) scale(${targetScale})`,
      }}
    >
      {/* Downward Conical Scanning Tractor Beam */}
      <div 
        className={`absolute top-[80%] left-1/2 -translate-x-1/2 w-36 h-56 pointer-events-none overflow-hidden transition-opacity duration-700 ${
          beamActive || p > 0.08 ? 'opacity-85' : 'opacity-20'
        }`}
      >
        <div
          className="w-full h-full"
          style={{
            background: 'conic-gradient(from 180deg at 50% 0%, rgba(6,182,212,0.35) 0deg, rgba(99,102,241,0.22) 22deg, transparent 38deg, transparent 322deg, rgba(99,102,241,0.22) 338deg, rgba(6,182,212,0.35) 360deg)',
            filter: 'blur(2px)',
            maskImage: 'linear-gradient(to bottom, black 15%, transparent 95%)'
          }}
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full border border-cyan-400/40 bg-cyan-400/15 animate-ping opacity-35" />
      </div>

      {/* Atmospheric Hover Glow Behind UFO */}
      <div className="absolute -inset-4 rounded-full bg-cyan-400/25 blur-xl pointer-events-none animate-pulse" />

      {/* Sleek Saucer Craft Body (SVG) */}
      <svg
        width="96"
        height="58"
        viewBox="0 0 92 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_10px_22px_rgba(6,182,212,0.45)]"
      >
        <defs>
          <linearGradient id="ufoHullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="40%" stopColor="#1E293B" />
            <stop offset="75%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="ufoDomeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CFFAFE" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <radialGradient id="ufoThrusterGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Cockpit Canopy Dome */}
        <ellipse cx="46" cy="18" rx="18" ry="11" fill="url(#ufoDomeGrad)" opacity="0.92" />
        <ellipse cx="44" cy="16" rx="10" ry="5" fill="#FFFFFF" opacity="0.65" />

        {/* Autonomous AI Navigation Core */}
        <circle cx="46" cy="18" r="3.2" fill="#FFFFFF" />
        <circle cx="46" cy="18" r="5" stroke="#38BDF8" strokeWidth="1" className="animate-ping" opacity="0.8" />

        {/* Saucer Outer Ring Hull */}
        <path
          d="M6 31 C6 24, 86 24, 86 31 C86 42, 6 42, 6 31 Z"
          fill="url(#ufoHullGrad)"
          stroke="#38BDF8"
          strokeWidth="1.2"
        />

        {/* Sensor Ring Beads */}
        <circle cx="18" cy="32" r="1.8" fill="#38BDF8" />
        <circle cx="28" cy="34" r="1.8" fill="#67E8F9" />
        <circle cx="39" cy="35" r="2.0" fill="#A5F3FC" />
        <circle cx="46" cy="35.5" r="2.2" fill="#FFFFFF" />
        <circle cx="53" cy="35" r="2.0" fill="#A5F3FC" />
        <circle cx="64" cy="34" r="1.8" fill="#67E8F9" />
        <circle cx="74" cy="32" r="1.8" fill="#38BDF8" />

        {/* Bottom Reactor Core */}
        <ellipse cx="46" cy="36" rx="14" ry="4.5" fill="url(#ufoThrusterGrad)" opacity="0.9" />
        <ellipse cx="46" cy="37" rx="7" ry="2.2" fill="#FFFFFF" />
      </svg>

      {/* Ion Propulsion Light Trail */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-80">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
      </div>

      {/* Autonomous Status HUD */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#030712]/85 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>RECON SURVEYOR • {(p * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateAuth, scrollContainerRef }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [activeDomain, setActiveDomain] = useState<'bio' | 'quantum' | 'oncology' | 'crispr' | 'materials'>('bio');
  const [activeChatTab, setActiveChatTab] = useState(0);
  const [activeModal, setActiveModal] = useState<'ABOUT' | 'DEMO' | null>(null);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  // Section Refs for smooth scrolling
  const heroRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);
  const universeRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Compact Trending Topic Chips
  const exampleChips = [
    'Vision Transformers',
    'Graph Neural Networks',
    'CRISPR-Cas12 Specificity',
    'Topological Quantum Codes',
    'Multimodal Oncology AI'
  ];

  // 5-Step Scientific Discovery Pipeline
  const workflowSteps = [
    {
      num: '01',
      title: 'Discover Research',
      tagline: 'Query Formulation',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-50 border-blue-200 text-blue-700',
      desc: 'Enter any hypothesis, research challenge, or DOI into the unified knowledge bar. Natural language processing translates your prompt into high-dimensional semantic vectors.',
      metric: '204M+ Works Scanned',
      detail: 'Supports Boolean operators, complex mathematical expressions, and direct DOI ingestion.'
    },
    {
      num: '02',
      title: 'Semantic Search',
      tagline: 'Hybrid Dense Retrieval',
      icon: Binary,
      color: 'from-cyan-500 to-sky-500',
      badgeColor: 'bg-cyan-50 border-cyan-200 text-cyan-700',
      desc: 'Dense embeddings match conceptual intent rather than simple keywords, capturing synonyms, paraphrased claims, and cross-domain methodologies across all literature.',
      metric: '<14ms Query Latency',
      detail: 'Hybrid architecture blending BM25 exact lexical matching with 1536-dim vector similarity.'
    },
    {
      num: '03',
      title: 'Extract Knowledge',
      tagline: 'Claim & Entity Mining',
      icon: Layers,
      color: 'from-indigo-500 to-blue-500',
      badgeColor: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      desc: 'Deep parsing algorithms isolate empirical benchmarks, experimental protocols, mathematical equations, and dataset references from unstructured PDF papers.',
      metric: '99.4% Extraction Precision',
      detail: 'Transforms tables, LaTeX proofs, and figure captions into structured knowledge nodes.'
    },
    {
      num: '04',
      title: 'Connect Research',
      tagline: 'Multi-Hop Graph Traversal',
      icon: Network,
      color: 'from-purple-500 to-indigo-500',
      badgeColor: 'bg-purple-50 border-purple-200 text-purple-700',
      desc: 'Constructs directional citation arcs between papers, identifying foundational lineages, co-authorship communities, and unexplored intersections between disciplines.',
      metric: '1.24B Verified Edges',
      detail: 'Multi-hop graph algorithms reveal non-obvious bridges between disparate fields.'
    },
    {
      num: '05',
      title: 'Explore Insights',
      tagline: 'Multi-LLM Grounded Consensus',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      badgeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      desc: 'An ensemble of leading foundation models synthesizes literature reviews and hypothesis validations with 100% verified citation badges and direct source anchors.',
      metric: 'Zero Hallucinations',
      detail: 'Every generated claim links directly to its source paper paragraph and DOI.'
    }
  ];

  // 6 Dimensions of the Research Universe
  const universeDimensions = [
    {
      title: 'Research Papers',
      count: '204.8M Nodes',
      icon: FileText,
      desc: 'Full-text embeddings including methodologies, mathematical formulas, experimental results, and abstract vectors across 45+ academic disciplines.'
    },
    {
      title: 'Authors & PIs',
      count: '12.4M Profiles',
      icon: Users,
      desc: 'Institutional affiliations, co-authorship networks, citation trajectories, and lab collaboration clusters mapped continuously across the globe.'
    },
    {
      title: 'Concepts & Ontologies',
      count: '1.8M Taxonomies',
      icon: BrainCircuit,
      desc: 'Dynamic scientific concept extraction tracking the evolution of emerging paradigms, theoretical frameworks, and interdisciplinary terminology.'
    },
    {
      title: 'Methods & Techniques',
      count: '340K+ Formulations',
      icon: Microscope,
      desc: 'Algorithmic architectures, clinical assay protocols, synthesis steps, and reproducible computational workflows isolated from method sections.'
    },
    {
      title: 'Empirical Datasets',
      count: '85K+ Repositories',
      icon: Database,
      desc: 'Published benchmark performance tables, Protein Data Bank (PDB) structures, Hugging Face checkpoints, and open research repositories.'
    },
    {
      title: 'Citation Networks',
      count: '1.24B Directional Edges',
      icon: Share2,
      desc: 'Directional citation graphs distinguishing between background mentions, foundational methodology extensions, and conflicting empirical claims.'
    }
  ];

  // Knowledge Graph Domain Data
  const domainData = {
    bio: {
      title: 'Biomedical AI & Molecular Therapeutics',
      centerNode: 'Graph Neural Networks (MPNN)',
      connectedPapers: [
        { title: 'Pushing the Boundaries of Molecular Property Prediction with GNNs', authors: 'K. Yang et al.', journal: 'ACS Cent. Sci.', year: '2024', citations: '1,842' },
        { title: 'Geometric Deep Learning for Structure-Based Drug Discovery', authors: 'M. Bronstein et al.', journal: 'Nature Biotech.', year: '2023', citations: '2,310' },
        { title: 'De Novo Molecular Generation via E(3)-Equivariant Diffusion', authors: 'T. Xu et al.', journal: 'ICLR Oral', year: '2024', citations: '920' },
        { title: 'Targeted Protein Degradation Prediction Using Directed Message Passing', authors: 'H. Stärk et al.', journal: 'NeurIPS', year: '2023', citations: '780' }
      ],
      bridges: ['ADMET Pharmacokinetics', 'E(3)-Equivariance', 'Binding Affinity', 'Docking Free Energy']
    },
    quantum: {
      title: 'Quantum Information & Error Correction',
      centerNode: 'Surface Code Stabilizers',
      connectedPapers: [
        { title: 'Fault-Tolerant Quantum Computation with Surface Codes', authors: 'A. G. Fowler et al.', journal: 'Phys. Rev. A', year: '2024', citations: '3,140' },
        { title: 'Suppressing Quantum Errors by Scaling a Quantum Error-Correcting Code', authors: 'Google Quantum AI', journal: 'Nature', year: '2023', citations: '1,120' },
        { title: 'Real-Time Neural Decoding of Anyonic Syndrome Measurements', authors: 'E. Dennis et al.', journal: 'PRX Quantum', year: '2024', citations: '650' },
        { title: 'Fault-Tolerant Logical Qubits in Neutral Atom Arrays', authors: 'D. Bluvstein et al.', journal: 'Nature', year: '2024', citations: '890' }
      ],
      bridges: ['MWPM Decoders', 'Stabilizer Formalism', 'Toric Topology', 'Logical Threshold Fidelity']
    },
    oncology: {
      title: 'Multimodal Clinical Oncology & Genomics',
      centerNode: 'Cross-Attention Foundation Models',
      connectedPapers: [
        { title: 'Multimodal Foundation Models in Pathology and Oncology', authors: 'F. Chen et al.', journal: 'Cell Genomics', year: '2024', citations: '890' },
        { title: 'Deep Learning-Enabled Computer Vision in Histopathology', authors: 'J. Lipkova et al.', journal: 'Nature Med.', year: '2023', citations: '1,520' },
        { title: 'Predicting 5-Year Survival via Genomic-Histological Transformer Fusion', authors: 'R. Vaidya et al.', journal: 'Lancet Digital', year: '2024', citations: '740' },
        { title: 'Spatial Transcriptomics Graph Integration in Tumor Microenvironments', authors: 'A. Rao et al.', journal: 'Science', year: '2023', citations: '1,150' }
      ],
      bridges: ['Whole Slide Imaging (WSI)', 'Survival AUC (+0.14)', 'Spatial Transcriptomics', 'Genomic Stratification']
    },
    crispr: {
      title: 'Synthetic Genomics & CRISPR Specificity',
      centerNode: 'Cas12a / Cpf1 Cleavage Specificity',
      connectedPapers: [
        { title: 'Cpf1 Is a Single RNA-Guided Endonuclease of Class 2 CRISPR', authors: 'B. Zetsche et al.', journal: 'Cell', year: '2023', citations: '4,210' },
        { title: 'Genome-Wide Specificities of Cas9 vs Cas12a Ribonucleoproteins', authors: 'J. S. Kim et al.', journal: 'Nature Biotech.', year: '2024', citations: '1,390' },
        { title: 'Engineered High-Fidelity Cas12a Variants for Therapeutic Edits', authors: 'M. Kleinstiver et al.', journal: 'Nat. Chem. Bio.', year: '2023', citations: '810' },
        { title: 'Cellular Epigenome Landscape Modulates CRISPR Cleavage Kinetics', authors: 'S. Qi et al.', journal: 'Molecular Cell', year: '2024', citations: '640' }
      ],
      bridges: ['PAM Specificity (TTTV)', 'Staggered 5-Overhangs', 'GUIDE-Seq Profiling', 'Ex Vivo Therapeutics']
    },
    materials: {
      title: 'Autonomous Materials Discovery',
      centerNode: 'Crystal Graph Convolutional Networks (CGCNN)',
      connectedPapers: [
        { title: 'Scaling Deep Learning for Materials Discovery (GNoME)', authors: 'A. Merchant et al.', journal: 'Nature', year: '2023', citations: '2,890' },
        { title: 'Crystal Graph Convolutional Neural Networks for Elemental Properties', authors: 'T. Xie et al.', journal: 'Phys. Rev. Lett.', year: '2024', citations: '3,450' },
        { title: 'Active Learning for Synthesis Planning of Inorganic Crystals', authors: 'K. Persson et al.', journal: 'Chem. Mater.', year: '2024', citations: '940' },
        { title: 'High-Throughput DFT Stability Screening for Solid-State Electrolytes', authors: 'G. Ceder et al.', journal: 'Energy Env. Sci.', year: '2023', citations: '1,280' }
      ],
      bridges: ['DFT Convex Hull', 'Space Group Symmetry', 'Solid-State Electrolytes', 'Inorganic Synthesis']
    }
  };

  // AI Assistant Interactive Chat Scenarios
  const assistantScenarios = [
    {
      query: 'How do Graph Neural Networks improve molecular drug discovery compared to classical fingerprint baselines?',
      domain: 'Biomedical AI',
      models: 'Consensus: Claude 3.5 Sonnet + GPT-4o + Gemini 1.5 Pro',
      confidence: '99.2%',
      citationsCount: 6,
      answer: 'Graph Neural Networks (GNNs) represent molecules as topological graphs where atoms are nodes and covalent bonds are edges with directional features. Unlike fixed-length Morgan or ECFP fingerprints, message-passing neural networks (MPNNs) iteratively aggregate local chemical environments, preserving spatial conformations and stereochemical invariants.',
      metrics: [
        { label: 'ADMET RMSE Reduction', value: '-34.8%' },
        { label: 'Synthesis Lead Time', value: '-68%' },
        { label: 'Grounded DOI Anchors', value: '100%' }
      ]
    },
    {
      query: 'What are the architectural differences between DINOv2 self-supervision and Masked Autoencoders (MAE)?',
      domain: 'Computer Vision',
      models: 'Consensus: Claude 3.5 Sonnet + GPT-4o + Gemini 1.5 Pro',
      confidence: '98.9%',
      citationsCount: 5,
      answer: 'While MAE optimizes an autoencoding reconstruction objective by predicting raw pixel values of heavily masked patches (75% mask ratio), DINOv2 uses a discriminative self-distillation framework with student-teacher networks, Sinkhorn-Knopp centering, and KoLeo regularization. Consequently, DINOv2 produces ready-to-use frozen visual representations with state-of-the-art k-NN classification accuracy without fine-tuning.',
      metrics: [
        { label: 'Linear Probe Accuracy', value: '+8.4%' },
        { label: 'Dense Matching Precision', value: '94.2%' },
        { label: 'Verification Grounding', value: '100%' }
      ]
    },
    {
      query: 'Identify open research gaps in fault-tolerant topological quantum error correction.',
      domain: 'Quantum Computing',
      models: 'Consensus: Claude 3.5 Sonnet + GPT-4o + Gemini 1.5 Pro',
      confidence: '97.6%',
      citationsCount: 8,
      answer: 'Analysis across 980 recent surface code preprints reveals three dominant research gaps: (1) Real-time sub-microsecond MWPM decoding latency bottlenecks on classical FPGA controllers as physical qubit count exceeds 1,000; (2) Leakage errors from computational qubit states into non-computational states that bypass stabilizer syndrome measurements; and (3) Physical qubit overhead for magic state distillation in non-Clifford gates.',
      metrics: [
        { label: 'Identified Whitespace Gaps', value: '3 Critical' },
        { label: 'Decoded Preprints', value: '980 Works' },
        { label: 'Consensus Agreement', value: '99.4%' }
      ]
    }
  ];

  // Video Demo Data for Interactive Demo Modal
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

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateAuth('LOGIN');
  };

  const handleChipClick = (chip: string) => {
    setHeroSearchQuery(chip);
    onNavigateAuth('LOGIN');
  };

  return (
    <div className="w-full flex flex-col relative text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════ */}
      {/*              AUTONOMOUS RESEARCH SPACECRAFT (UFO)           */}
      {/* ════════════════════════════════════════════════════════════ */}
      <ResearchSpacecraftUFO scrollContainerRef={scrollContainerRef} />

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                       0. TOP NAVBAR                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <nav className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-[#060B19]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-md transition-all">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => scrollTo(heroRef)}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              ResearchGraph <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-mono font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              v2.4
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
          <button
            onClick={() => scrollTo(heroRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
          >
            Cockpit
          </button>
          <button
            onClick={() => scrollTo(workflowRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
          >
            RAG Pipeline
          </button>
          <button
            onClick={() => scrollTo(universeRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all flex items-center gap-1"
          >
            <span>3D Topology</span>
          </button>
          <button
            onClick={() => scrollTo(graphRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => scrollTo(sourcesRef)}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            <span>Data Sources</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">45+</span>
          </button>
          <button
            onClick={() => setActiveModal('ABOUT')}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-all"
          >
            About Us
          </button>
        </div>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateAuth('LOGIN')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigateAuth('LOGIN')}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Launch Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden w-full bg-[#060B19] border-b border-white/10 px-6 py-4 flex flex-col gap-2 relative z-40 shadow-xl"
          >
            <button onClick={() => scrollTo(heroRef)} className="text-left py-2 px-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl">
              Cockpit
            </button>
            <button onClick={() => scrollTo(workflowRef)} className="text-left py-2 px-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl">
              Pipeline
            </button>
            <button onClick={() => scrollTo(universeRef)} className="text-left py-2 px-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl">
              3D Topology
            </button>
            <button onClick={() => scrollTo(graphRef)} className="text-left py-2 px-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl">
              Knowledge Graph
            </button>
            <button onClick={() => scrollTo(sourcesRef)} className="text-left py-2 px-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl">
              Data Sources (OpenAlex & arXiv)
            </button>
            <button onClick={() => { setActiveModal('ABOUT'); setMobileMenuOpen(false); }} className="text-left py-2 px-3 text-sm font-semibold text-gray-200 hover:bg-white/5 rounded-xl">
              About Us
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*    1. CINEMATIC SPACE HERO: ROTATING GLOBE & ORBITAL NODES   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#060B19]"
      >
        {/* Layer 1: Scenic Cosmic Horizon Background (Clean, No Text Overlays) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/landing_hero_universe.jpg')",
          }}
        />

        {/* Layer 2: Deep Space Contrast Gradient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060B19]/95 via-[#060B19]/80 to-transparent pointer-events-none lg:w-[62%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060B19] via-transparent to-transparent pointer-events-none h-44 bottom-0 top-auto" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B19]/80 via-transparent to-transparent pointer-events-none h-24 top-0" />

        {/* Ambient Cosmic Radial Glows */}
        <div className="absolute top-[22%] right-[20%] w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[8%] w-[420px] h-[420px] rounded-full bg-purple-600/20 blur-[130px] pointer-events-none" />

        {/* Main Hero Container */}
        <div className="relative z-10 w-full max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-12 lg:pb-8 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* ─── LEFT COLUMN: REFINED HERO CONTENT & SEARCH ─── */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-5 text-left">
              {/* Small Badge (Exact Prompt Wording) */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] w-fit backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>RESEARCH INTELLIGENCE · REIMAGINED</span>
              </div>

              {/* Main Headline (Exact Prompt Structure & Mockup) */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.12]">
                Research,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Connected.</span>
                <span className="inline-block w-1 h-8 sm:h-11 bg-cyan-400 ml-1.5 align-middle animate-pulse" />
              </h1>

              {/* Compelling Description (Exact Reference Mockup Text) */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal drop-shadow-sm">
                Discover, explore, and connect research papers, authors, and ideas through an intelligent knowledge graph powered by AI.
              </p>

              {/* Dual Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigateAuth('LOGIN')}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group"
                >
                  <Network className="w-4 h-4 text-cyan-200" />
                  <span>Explore Research Graph</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveModal('DEMO')}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-md shadow-sm hover:border-white/30 transition-all flex items-center gap-2 group"
                >
                  <Play className="w-4 h-4 text-cyan-300 fill-cyan-300 group-hover:scale-110 transition-transform" />
                  <span>Watch Overview</span>
                </button>
              </div>

              {/* 3 Action Feature Pills from Reference Mockup */}
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-lg">
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white leading-tight">Discover</span>
                    <span className="text-[10px] text-gray-400 leading-tight">Find relevant work</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white leading-tight">Connect</span>
                    <span className="text-[10px] text-gray-400 leading-tight">Follow context</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold text-white leading-tight">Understand</span>
                    <span className="text-[10px] text-gray-400 leading-tight">Get deeper insights</span>
                  </div>
                </div>
              </div>

              {/* Deep Glass Research Search Bar Beneath Buttons */}
              <form onSubmit={handleHeroSearchSubmit} className="relative w-full max-w-lg mt-1">
                <div className="relative flex items-center bg-[#070D1E]/90 border border-cyan-500/30 rounded-2xl p-1.5 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.5)] focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <Search className="ml-3 w-4 h-4 text-cyan-400 pointer-events-none" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Ask anything about 200M+ academic papers..."
                    className="w-full bg-transparent py-2.5 pl-3 pr-24 text-sm text-white placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <span>Ask AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Compact Trending Topic Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-gray-400">
                <span className="font-semibold text-gray-300 mr-1">Trending:</span>
                {exampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px] font-medium hover:border-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all backdrop-blur-xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── RIGHT COLUMN: ROTATING GLOBE & CLEAN ORBITAL LABELS (NO CARDS) ─── */}
            <div className="lg:col-span-7 relative flex items-center justify-center overflow-visible min-h-[480px] sm:min-h-[560px] lg:translate-x-[15px] lg:-translate-y-20">
              {/* Atmospheric Backglow Centered on Citadel Dais */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-500/15 to-purple-500/15 blur-[95px] pointer-events-none" />

              {/* The Authentic Rotating Globe Centerpiece with 7 Orbital Labels */}
              <div className="relative w-full max-w-[720px] mx-auto overflow-visible select-none pointer-events-auto">
                <ResearchKnowledgeCore onNavigate={() => onNavigateAuth('LOGIN')} />
              </div>
            </div>

          </div>
        </div>

        {/* ─── BOTTOM HERO TELEMETRY STRIP ─── */}
        <div className="relative z-20 w-full max-w-5xl mx-auto px-4 pb-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#091129]/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-between">
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center gap-2.5">
                <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-black text-white text-base sm:text-lg font-mono leading-none">200M+</span>
                  <span className="text-[11px] text-gray-400">Research Papers</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <Users className="w-5 h-5 text-cyan-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-black text-white text-base sm:text-lg font-mono leading-none">12.4M+</span>
                  <span className="text-[11px] text-gray-400">Authors</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <Network className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-black text-white text-base sm:text-lg font-mono leading-none">1.8M+</span>
                  <span className="text-[11px] text-gray-400">Research Concepts</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="block font-black text-white text-base sm:text-lg font-mono leading-none">250M+</span>
                  <span className="text-[11px] text-gray-400">Citations</span>
                </div>
              </div>
            </div>

            {/* Scroll Down Trigger Chevron */}
            <button
              onClick={() => scrollTo(workflowRef)}
              className="ml-3 p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all shrink-0 animate-bounce"
              aria-label="Scroll to exploration sections"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*   2. REDESIGNED RESEARCH DISCOVERY PIPELINE (FROSTED DECK)   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={workflowRef} className="py-20 lg:py-24 bg-[#F8FAFC] text-slate-900 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold font-mono tracking-wider uppercase mb-3">
              Research Discovery Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Raw PDF to High-Dimensional Knowledge Graph
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Experience the 5 continuous pipelines that normalize unstructured preprints into verified semantic structures with zero hallucination.
            </p>
          </div>

          {/* Interactive Modern Visual Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-10">
            {workflowSteps.map((step, idx) => {
              const IconComp = step.icon;
              const isActive = activeWorkflowStep === idx;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all border ${
                    isActive
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-mono font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {step.num}
                    </span>
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {step.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Combined Light Scientific UI Surface & Dark Technical Console */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Light Scientific Surface */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                  STAGE {workflowSteps[activeWorkflowStep].num} • {workflowSteps[activeWorkflowStep].tagline}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {workflowSteps[activeWorkflowStep].metric}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {workflowSteps[activeWorkflowStep].title}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {workflowSteps[activeWorkflowStep].desc}
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>{workflowSteps[activeWorkflowStep].detail}</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onNavigateAuth('LOGIN')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>Test {workflowSteps[activeWorkflowStep].title} Live</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Dark Technical Telemetry Console */}
            <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 text-white font-mono text-xs border border-slate-800 space-y-3 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span>PIPELINE_EXECUTOR::V2.4</span>
                <span className="text-emerald-400 font-bold">● ONLINE</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="text-blue-400">&gt; INPUT: Multimodal Academic Corpus Stream</div>
                <div className="text-cyan-300">&gt; LATENCY: 12.4ms per vector cluster</div>
                <div className="text-purple-300">&gt; TOPOLOGY: Directional citation mesh</div>
                <div className="text-emerald-300">&gt; INTEGRITY: 100% verified DOI anchors</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                Autonomous validation engine guarantees that every claim maps directly to a peer-reviewed PDF paragraph.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*   3. THE 6 DIMENSIONS OF THE RESEARCH UNIVERSE (COSMIC)      */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={universeRef} className="py-20 lg:py-24 bg-[#060B19] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 text-xs font-bold font-mono tracking-wider uppercase mb-3">
              Ontological Taxonomy
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The 6 Dimensions of the Research Universe
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
              Every academic artifact is indexed across multi-relational layers, transforming isolated PDF documents into a living, queryable knowledge network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universeDimensions.map((dim, idx) => {
              const IconComp = dim.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-[#091129]/80 border border-white/10 hover:border-cyan-400/40 hover:bg-[#0D183B] transition-all backdrop-blur-md group shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6 text-cyan-300" />
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                      {dim.count}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {dim.title}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                    {dim.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*    4. INTERACTIVE KNOWLEDGE GRAPH EXPLORER (LIGHT DECK)      */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={graphRef} className="py-20 lg:py-24 bg-white text-slate-900 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold font-mono tracking-wider uppercase mb-3">
              Interactive Topology Explorer
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Cross-Disciplinary Graph Traversal
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Select any frontier domain below to inspect connected seminal papers, citation bridges, and emergent methodology hubs.
            </p>
          </div>

          {/* Domain Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {(['bio', 'quantum', 'oncology', 'crispr', 'materials'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveDomain(key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeDomain === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {domainData[key].title}
              </button>
            ))}
          </div>

          {/* Graph Hub & Connected Papers Display */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">Focal Hub Node</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {domainData[activeDomain].centerNode}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {domainData[activeDomain].bridges.map((bridge, i) => (
                  <span key={i} className="text-xs font-medium px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    ✦ {bridge}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domainData[activeDomain].connectedPapers.map((paper, i) => (
                <div
                  key={i}
                  onClick={() => onNavigateAuth('LOGIN')}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span className="text-blue-600 font-bold">{paper.journal} • {paper.year}</span>
                    <span>{paper.citations} citations</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 flex items-center justify-between">
                    <span>{paper.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                  </h4>
                  <div className="text-xs text-slate-500">
                    {paper.authors}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*      5. AI ASSISTANT: MULTI-LLM CONSENSUS (COSMIC)          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={assistantRef} className="py-20 lg:py-24 bg-[#070D1E] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-400/30 text-emerald-300 text-xs font-bold font-mono tracking-wider uppercase mb-3">
              Multi-LLM Consensus Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ensemble Reasoning Grounded in Verified Literature
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
              Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro cross-verify hypotheses simultaneously, citing direct DOI anchors to eliminate hallucinations.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
            {assistantScenarios.map((scen, idx) => (
              <button
                key={idx}
                onClick={() => setActiveChatTab(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  activeChatTab === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {scen.domain}
              </button>
            ))}
          </div>

          {/* Active Chat Scenario Card */}
          <div className="rounded-3xl bg-[#091129] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-3">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
                  QUERY: {assistantScenarios[activeChatTab].domain}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  "{assistantScenarios[activeChatTab].query}"
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                  {assistantScenarios[activeChatTab].confidence} Confidence
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <span className="text-xs font-mono text-gray-400 block mb-2">
                {assistantScenarios[activeChatTab].models}
              </span>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                {assistantScenarios[activeChatTab].answer}
              </p>
            </div>

            {/* Metrics and Citations Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assistantScenarios[activeChatTab].metrics.map((met, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#060B19] border border-white/10">
                  <span className="text-[11px] text-gray-400 uppercase font-mono block mb-1">{met.label}</span>
                  <span className="text-lg font-bold text-cyan-300 font-mono">{met.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*        6. 6-STAGE RAG PIPELINE (FROSTED LIGHT DECK)          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={pipelineRef} className="py-20 lg:py-24 bg-[#F1F5F9] text-slate-900 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-bold font-mono tracking-wider uppercase mb-3">
              Stepped RAG Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Deterministic Retrieval-Augmented Generation
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              How ResearchGraph AI ensures absolute scientific fidelity from user prompt to final cited output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Intent Parsing & Vectorization', desc: 'Queries are decomposed into mathematical formulas, scientific entities, and dense 1536-dimensional embeddings.' },
              { step: '02', title: 'Hybrid Dense + Sparse Search', desc: 'Simultaneous BM25 lexical matching and vector similarity retrieve top-k authoritative source candidate papers.' },
              { step: '03', title: 'Knowledge Graph Re-Ranking', desc: 'Directional citation graphs weight papers based on citation velocity, methodology extensions, and peer validation.' },
              { step: '04', title: 'Context Window Synthesis', desc: 'Key paragraphs, empirical benchmark tables, and LaTeX equations are injected into the multi-model context window.' },
              { step: '05', title: 'Cross-LLM Consensus Check', desc: 'Independent foundation models compare claims; divergent statements are re-checked against original PDF paragraphs.' },
              { step: '06', title: 'Verified Output & DOI Anchors', desc: 'Synthesized response is returned with clickable DOI badges that highlight the exact source paragraphs.' }
            ].map((p, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <span className="text-xs font-mono font-bold text-blue-600 block mb-2">STEP {p.step}</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*        7. ENTERPRISE DATA SOURCES (COSMIC TELEMETRY)         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={sourcesRef} className="py-20 lg:py-24 bg-[#060B19] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-400/30 text-blue-300 text-xs font-bold font-mono tracking-wider uppercase mb-3">
              Federated Repository Sync
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Continuously Synchronized with OpenAlex & arXiv
            </h2>
            <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
              Real-time ingestion workers poll global preprint archives and bibliographic ontologies every 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* OpenAlex Card */}
            <div className="p-8 rounded-3xl bg-[#091129] border border-emerald-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                  OPENALEX GLOBAL ONTOLOGY
                </span>
                <span className="text-xs text-gray-400 font-mono">SYNC: ACTIVE</span>
              </div>
              <h3 className="text-2xl font-bold text-white">250M+ Works & 12.4M Authors</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Complete coverage of CrossRef, PubMed, DOAJ, and institutional repositories with full author disambiguation and institution mappings.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Synchronized across 45+ academic disciplines</span>
              </div>
            </div>

            {/* arXiv Card */}
            <div className="p-8 rounded-3xl bg-[#091129] border border-cyan-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                  ARXIV PREPRINT PIPELINE
                </span>
                <span className="text-xs text-gray-400 font-mono">SYNC: HOURLY</span>
              </div>
              <h3 className="text-2xl font-bold text-white">2.4M+ Preprints & LaTeX Sources</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Instant indexing of frontier CS, Physics, Quantitative Biology, and Mathematics preprints within 60 minutes of release.
              </p>
              <div className="pt-2 text-xs font-mono text-cyan-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Full LaTeX equations & benchmark table extraction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*          8. FINAL HIGH-CONVERSION CTA & FOOTER              */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-[#060B19] via-[#091129] to-[#030712] text-white relative text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold font-mono tracking-wider uppercase">
            Start Exploring Today
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Accelerate Your Research with Connected Intelligence
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join thousands of scientists, machine learning engineers, and researchers exploring over 204M+ publications through ResearchGraph AI.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigateAuth('REGISTER')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <span>Launch ResearchGraph AI Cockpit</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveModal('DEMO')}
              className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-cyan-300 fill-cyan-300" />
              <span>Watch Video Tour</span>
            </button>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="mt-24 pt-12 border-t border-white/10 text-xs text-gray-400 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">ResearchGraph AI</span>
            <span>&copy; {new Date().getFullYear()} • Semantic Academic Knowledge Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveModal('ABOUT')} className="hover:text-white transition-colors">
              Methodology Paper
            </button>
            <button onClick={() => setActiveModal('ABOUT')} className="hover:text-white transition-colors">
              Open Governance
            </button>
            <button onClick={() => onNavigateAuth('LOGIN')} className="hover:text-white transition-colors">
              Platform Sign In
            </button>
          </div>
        </footer>
      </section>

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
                    <div>CORE SPECIFICATION:</div>
                    <div className="mt-1 text-cyan-300">• 204.8M Works Scanned across 45+ Scientific Fields</div>
                    <div className="text-cyan-300">• 1.24B Directional Citation Arcs Computed</div>
                    <div className="text-cyan-300">• Sub-14ms Multi-Hop Graph Traversal Latency</div>
                  </div>
                </div>
              )}

              {activeModal === 'DEMO' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
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
                      <div className="text-cyan-400 font-bold">LIVE PLATFORM DEMONSTRATION SIMULATION</div>
                      <div className="text-gray-300">1. Broadcasting query across arXiv, PubMed, and OpenAlex</div>
                      <div className="text-gray-300">2. Vector clustering: 1,420 matched papers embedded into 3D topology</div>
                      <div className="text-gray-300">3. Multi-LLM consensus: 4 validated hypotheses synthesized</div>
                      <div className="text-emerald-400">✓ Ground truth confirmed with 100% verified citation badges</div>
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
