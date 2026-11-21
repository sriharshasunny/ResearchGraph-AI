import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Search, ArrowRight, Sparkles, Play, CheckCircle2,
  Database, Layers, Binary, FileText, Users, Share2,
  BrainCircuit, Microscope, ChevronRight,
  ShieldCheck, Activity, Info, X, Cpu, Check, Menu
} from 'lucide-react';
import { ResearchKnowledgeCore } from '../../components/ResearchKnowledgeCore';

interface LandingViewProps {
  onNavigateAuth: (mode: 'LOGIN' | 'REGISTER') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateAuth }) => {
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

  // Example Topic Chips for Hero
  const exampleChips = [
    'Vision Transformers',
    'Graph Neural Networks',
    'CRISPR-Cas12 Specificity',
    'Topological Quantum Codes',
    'Multimodal Oncology AI'
  ];

  // 5-Step Workflow Data
  const workflowSteps = [
    {
      num: '01',
      title: 'Discover Research',
      tagline: 'Query Formulation',
      icon: Search,
      color: 'from-blue-500 to-cyan-500',
      badgeColor: 'bg-blue-50 border-blue-200 text-blue-700',
      desc: 'Enter any hypothesis, research challenge, or DOI into the unified knowledge bar. Natural language processing translates your prompt into high-dimensional semantic vectors.',
      metric: '200M+ Works Scanned',
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
      accent: 'border-blue-200 bg-blue-50/50 text-blue-700',
      iconBg: 'bg-blue-600 text-white',
      desc: 'Full-text embeddings including methodologies, mathematical formulas, experimental results, and abstract vectors across 45+ academic disciplines.'
    },
    {
      title: 'Authors & PIs',
      count: '12.4M Profiles',
      icon: Users,
      accent: 'border-indigo-200 bg-indigo-50/50 text-indigo-700',
      iconBg: 'bg-indigo-600 text-white',
      desc: 'Institutional affiliations, co-authorship networks, citation trajectories, and lab collaboration clusters mapped continuously across the globe.'
    },
    {
      title: 'Concepts & Ontologies',
      count: '1.8M Taxonomies',
      icon: BrainCircuit,
      accent: 'border-purple-200 bg-purple-50/50 text-purple-700',
      iconBg: 'bg-purple-600 text-white',
      desc: 'Dynamic scientific concept extraction tracking the evolution of emerging paradigms, theoretical frameworks, and interdisciplinary terminology.'
    },
    {
      title: 'Methods & Techniques',
      count: '340K+ Formulations',
      icon: Microscope,
      accent: 'border-cyan-200 bg-cyan-50/50 text-cyan-700',
      iconBg: 'bg-cyan-600 text-white',
      desc: 'Algorithmic architectures, clinical assay protocols, synthesis steps, and reproducible computational workflows isolated from method sections.'
    },
    {
      title: 'Empirical Datasets',
      count: '85K+ Repositories',
      icon: Database,
      accent: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
      iconBg: 'bg-emerald-600 text-white',
      desc: 'Published benchmark performance tables, Protein Data Bank (PDB) structures, Hugging Face checkpoints, and open research repositories.'
    },
    {
      title: 'Citation Networks',
      count: '1.24B Directional Edges',
      icon: Share2,
      accent: 'border-rose-200 bg-rose-50/50 text-rose-700',
      iconBg: 'bg-rose-600 text-white',
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
      citations: [
        { id: 1, title: 'Pushing the Boundaries of Molecular Property Prediction with GNNs', author: 'Yang et al., 2024', doi: '10.1021/acscentsci.9b00476' },
        { id: 2, title: 'Geometric Deep Learning Grids for Structure-Based Drug Discovery', author: 'Bronstein et al., 2023', doi: '10.1038/s41587-021-00984-3' }
      ],
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
      citations: [
        { id: 1, title: 'DINOv2: Learning Robust Visual Features without Supervision', author: 'Oquab et al., 2023', doi: '10.48550/arXiv.2304.07193' },
        { id: 2, title: 'Masked Autoencoders Are Scalable Vision Learners', author: 'He et al., 2022', doi: '10.1109/CVPR52688.2022.01553' }
      ],
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
      citations: [
        { id: 1, title: 'Suppressing quantum errors by scaling a quantum error-correcting code', author: 'Google Quantum AI, 2023', doi: '10.1038/s41586-022-05434-1' },
        { id: 2, title: 'High-rate quantum low-density parity-check codes', author: 'Panteleev & Kalachev, 2023', doi: '10.1109/TIT.2023.3283254' }
      ],
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
    <div className="w-full flex flex-col relative text-slate-900 font-sans selection:bg-blue-500/20">

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                       0. TOP NAVBAR                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <nav className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white/85 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-xs transition-all">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
              ResearchGraph <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 font-mono font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              v2.4
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 border border-slate-200/80 rounded-full px-3 py-1.5 backdrop-blur-md">
          <button
            onClick={() => scrollTo(heroRef)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full hover:bg-white transition-all"
          >
            Home
          </button>
          <button
            onClick={() => scrollTo(graphRef)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full hover:bg-white transition-all flex items-center gap-1"
          >
            <span>3D Topology</span>
          </button>
          <button
            onClick={() => scrollTo(pipelineRef)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full hover:bg-white transition-all"
          >
            RAG Pipeline
          </button>
          <button
            onClick={() => scrollTo(sourcesRef)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full hover:bg-white transition-all flex items-center gap-1.5"
          >
            <span>Data Sources</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-mono font-bold">OpenAlex + arXiv</span>
          </button>
          <button
            onClick={() => setActiveModal('ABOUT')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-full hover:bg-white transition-all"
          >
            About Us
          </button>
        </div>

        {/* Right Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateAuth('LOGIN')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => onNavigateAuth('LOGIN')}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Launch Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
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
            className="lg:hidden w-full bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-2 relative z-40 shadow-xl"
          >
            <button onClick={() => scrollTo(heroRef)} className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
              Home
            </button>
            <button onClick={() => scrollTo(graphRef)} className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
              3D Topology
            </button>
            <button onClick={() => scrollTo(pipelineRef)} className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
              RAG Pipeline
            </button>
            <button onClick={() => scrollTo(sourcesRef)} className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
              Data Sources (OpenAlex & arXiv)
            </button>
            <button onClick={() => { setActiveModal('ABOUT'); setMobileMenuOpen(false); }} className="text-left py-2 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
              About Us
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*              1. COMPLETELY REBUILT HERO SECTION             */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 lg:pt-12 lg:pb-18 overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column: Clean, Compact, Properly Spaced Hero Content */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-5 text-left">
            {/* Small Elegant Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold tracking-wider uppercase shadow-xs w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Research Intelligence, Reimagined</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-extrabold text-slate-900 tracking-tight leading-[1.14]">
              Research, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">connected.</span><br />
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">what matters.</span>
            </h1>

            {/* Compelling Description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Explore, analyze, and synthesize over 200M+ research papers, authors, and concepts through an autonomous knowledge graph powered by multi-LLM consensus.
            </p>

            {/* Prominent CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigateAuth('LOGIN')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group"
              >
                <span>Explore Research Graph</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setActiveModal('DEMO')}
                className="px-5 py-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold text-sm shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 text-blue-600 fill-blue-600 group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Hero Search Bar */}
            <form onSubmit={handleHeroSearchSubmit} className="relative w-full max-w-lg mt-2">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder="Search 200M+ papers, authors, or concepts..."
                  className="w-full bg-white border border-slate-200/90 rounded-2xl py-3.5 pl-11 pr-24 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-xs transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Neatly Designed Example Topic Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 mr-1">Trending:</span>
              {exampleChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-600 text-[11px] font-medium hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-4 gap-2 text-center max-w-lg">
              <div>
                <span className="block font-black text-slate-900 text-base sm:text-lg">204M+</span>
                <span className="block text-[10px] text-slate-500 font-medium">Papers</span>
              </div>
              <div>
                <span className="block font-black text-slate-900 text-base sm:text-lg">12.4M</span>
                <span className="block text-[10px] text-slate-500 font-medium">Authors</span>
              </div>
              <div>
                <span className="block font-black text-slate-900 text-base sm:text-lg">1.8M</span>
                <span className="block text-[10px] text-slate-500 font-medium">Concepts</span>
              </div>
              <div>
                <span className="block font-black text-slate-900 text-base sm:text-lg">1.24B</span>
                <span className="block text-[10px] text-slate-500 font-medium">Citations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Global Knowledge Model (Existing Centerpiece, Non-Overlapping Layout) */}
          <div className="lg:col-span-7 relative flex items-center justify-center overflow-visible">
            {/* Ambient Background Aura */}
            <div className="absolute inset-4 -z-10 rounded-full bg-gradient-to-tr from-blue-300/25 via-indigo-200/20 to-cyan-300/25 blur-3xl pointer-events-none" />

            {/* The Authentic ResearchGraph Knowledge Globe Model with container queries */}
            <div className="relative w-full max-w-[760px] mx-auto rounded-3xl bg-gradient-to-b from-white/75 to-slate-50/60 border border-slate-200/80 p-2 sm:p-4 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] backdrop-blur-md overflow-visible">
              <ResearchKnowledgeCore onNavigate={() => onNavigateAuth('LOGIN')} />
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*               2. HOW RESEARCHGRAPH WORKS                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={workflowRef} className="w-full bg-white border-y border-slate-200/80 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>Scientific Ingestion & Processing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              How ResearchGraph Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              A five-stage autonomous pipeline transforming fragmented scholarly literature into interconnected, actionable discovery.
            </p>
          </div>

          {/* 5-Step Horizontal Workflow (Desktop) / Vertical Stack (Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 relative">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeWorkflowStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                    isActive
                      ? 'bg-blue-50/40 border-blue-400 shadow-md ring-2 ring-blue-400/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                        {step.num}
                      </span>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mb-1">
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-blue-600 block mb-2.5">
                      {step.tagline}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-slate-800">{step.metric}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-blue-600 translate-x-1' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deep Insight Callout for the Selected Workflow Step */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block">
                  Stage {workflowSteps[activeWorkflowStep].num} Technical Specification
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {workflowSteps[activeWorkflowStep].detail}
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigateAuth('LOGIN')}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-blue-600 transition-colors shrink-0"
            >
              Test with Your Query
            </button>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*             3. EXPLORE THE RESEARCH UNIVERSE                */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={universeRef} className="w-full py-16 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Database className="w-3.5 h-3.5 text-purple-600" />
            <span>Universal Knowledge Taxonomy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Explore the Research Universe
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Science is more than isolated PDFs. Traverse six connected dimensions of discovery across millions of entities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universeDimensions.map((dim, idx) => {
            const Icon = dim.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl ${dim.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {dim.count}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                    {dim.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {dim.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Explore this dimension</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*           4. KNOWLEDGE GRAPH VISUALIZATION SECTION          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={graphRef} className="w-full bg-white border-y border-slate-200/80 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <Network className="w-3.5 h-3.5 text-indigo-600" />
              <span>Multi-Hop Graph Topology</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              See How Research Connects
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Traditional search engines return isolated links. ResearchGraph maps papers to authors, concepts, methods, and citations into an interactive topological network.
            </p>
          </div>

          {/* Domain Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'bio', label: 'Biomedical AI & Drug Discovery' },
              { id: 'quantum', label: 'Quantum Error Correction' },
              { id: 'oncology', label: 'Multimodal Oncology' },
              { id: 'crispr', label: 'CRISPR Specificity' },
              { id: 'materials', label: 'Autonomous Materials' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDomain(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeDomain === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Graph Showcase Board */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  Active Topology Node
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {domainData[activeDomain].title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Center: {domainData[activeDomain].centerNode}
                </span>
                <button
                  onClick={() => onNavigateAuth('LOGIN')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Open in 3D Cockpit
                </button>
              </div>
            </div>

            {/* Connected Papers and Interdisciplinary Bridges */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              
              {/* Left Column: 4 Connected Research Papers */}
              <div className="lg:col-span-8 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Connected Literature Nodes (4 of {domainData[activeDomain].connectedPapers.length} shown)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {domainData[activeDomain].connectedPapers.map((paper, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{paper.journal}</span>
                        <span>{paper.year}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mb-2">
                        {paper.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>{paper.authors}</span>
                        <span className="font-mono font-bold text-slate-700">★ {paper.citations}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Interdisciplinary Bridge Concepts */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
                  Cross-Domain Bridge Concepts
                </span>
                <div className="space-y-2.5">
                  {domainData[activeDomain].bridges.map((bridge, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-semibold text-slate-800">{bridge}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Active Bridge
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  These bridges connect this domain to external fields, allowing researchers to uncover cross-pollinating breakthroughs.
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*               5. AI RESEARCH ASSISTANT                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={assistantRef} className="w-full py-16 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Autonomous Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Your Autonomous AI Research Assistant
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Ask complex scientific questions across millions of papers. Every answer is grounded in verifiable peer-reviewed citations.
          </p>
        </div>

        {/* Realistic Chat Assistant Interface */}
        <div className="max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-lg overflow-hidden">
          
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm text-slate-800">
                ResearchGraph Consensus Engine
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                (Claude 3.5 Sonnet + GPT-4o + Gemini 1.5 Pro)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Citation Grounding: 99.4%
              </span>
            </div>
          </div>

          {/* Query Switcher Pills */}
          <div className="px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto">
            {assistantScenarios.map((sc, scIdx) => (
              <button
                key={scIdx}
                onClick={() => setActiveChatTab(scIdx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeChatTab === scIdx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {sc.domain}
              </button>
            ))}
          </div>

          {/* Interactive Chat Window */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* User Prompt */}
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                Dr
              </div>
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-sm text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                {assistantScenarios[activeChatTab].query}
              </div>
            </div>

            {/* AI Synthesized Response */}
            <div className="flex items-start gap-3.5 max-w-4xl ml-auto">
              <div className="bg-blue-50/70 border border-blue-200/70 p-5 sm:p-6 rounded-2xl rounded-tr-sm text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-blue-700 border-b border-blue-200/60 pb-2">
                  <span>● MULTI-LLM CONSENSUS SYNTHESIS</span>
                  <span>Confidence: {assistantScenarios[activeChatTab].confidence}</span>
                </div>

                <p>{assistantScenarios[activeChatTab].answer}</p>

                {/* Citation Anchors */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Verified Citation Anchors:
                  </span>
                  {assistantScenarios[activeChatTab].citations.map((cite) => (
                    <div
                      key={cite.id}
                      className="p-2.5 rounded-xl bg-white border border-blue-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {cite.id}
                        </span>
                        <span className="font-semibold text-slate-900 line-clamp-1">{cite.title}</span>
                        <span className="text-slate-500 text-[11px] shrink-0">({cite.author})</span>
                      </div>
                      <span className="font-mono text-[10px] text-blue-600 font-bold shrink-0">DOI: {cite.doi}</span>
                    </div>
                  ))}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {assistantScenarios[activeChatTab].metrics.map((m, mIdx) => (
                    <div key={mIdx} className="bg-white p-2.5 rounded-xl border border-blue-100 text-center">
                      <span className="block font-black text-slate-900 text-xs sm:text-sm">{m.value}</span>
                      <span className="block text-[10px] text-slate-500">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Capabilities Footer Banner */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-[11px] font-semibold text-slate-700">
            <span>✓ Ask Questions</span>
            <span>✓ Find Related Papers</span>
            <span>✓ Understand Concepts</span>
            <span>✓ Compare Methods</span>
            <span>✓ Explore Relations</span>
            <span>✓ Discover Gaps</span>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                   6. RAG PIPELINE SECTION                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={pipelineRef} className="w-full bg-white border-y border-slate-200/80 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Deterministic Retrieval Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              The Grounded RAG Pipeline
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Research Papers → Text Extraction → Chunking → Embeddings → Retrieval → AI Response
            </p>
          </div>

          {/* 6-Stage Stepped Pipeline Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { step: '01', title: 'Research Papers', icon: FileText, desc: 'Continuous automated ingestion from OpenAlex, arXiv, and CrossRef APIs.' },
              { step: '02', title: 'Text Extraction', icon: Layers, desc: 'High-precision PDF parsing isolating math, formulas, and tabular metrics.' },
              { step: '03', title: 'Chunking', icon: Binary, desc: 'Semantic boundary splitting preserving section context and citations.' },
              { step: '04', title: 'Embeddings', icon: Network, desc: '1536-dimensional scientific embeddings aligned with domain ontologies.' },
              { step: '05', title: 'Retrieval', icon: Search, desc: 'Hybrid retrieval blending graph walks, vector distance, and BM25 keywords.' },
              { step: '06', title: 'AI Response', icon: Sparkles, desc: 'Synthesized answers with 100% verified DOI anchors and zero hallucination.' }
            ].map((p, pIdx) => {
              const Icon = p.icon;
              return (
                <div
                  key={pIdx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {p.step}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 mb-1.5">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-200/50 flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
                    <span>STAGE COMPLETED</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                   7. DATA SOURCES SECTION                   */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section ref={sourcesRef} className="w-full py-16 lg:py-24 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authoritative Academic Provenance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Supported Data Sources
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Directly synchronized with the world's most trusted open academic indexes. No fabricated datasets or unverified claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* OpenAlex Card */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl border border-emerald-200">
                OA
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                200M+ Works
              </span>
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 mb-2">
              OpenAlex Scholarly Catalog
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              A fully open catalog of the global research system, mapping 200M+ publications, 12M+ authors, 100K+ institutions, and 65K+ venues.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Open Metadata</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Author Disambiguation</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Concept Taxonomies</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Institution Lineages</span>
            </div>
          </div>

          {/* arXiv Card */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xl border border-rose-200">
                ar<i>X</i>iv
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                2.4M+ Preprints
              </span>
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 mb-2">
              arXiv Open-Access Archive
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              The premier open-access repository for scholarly articles in physics, mathematics, computer science, quantitative biology, and statistics.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Daily Preprints</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Computer Science</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Quantitative Biology</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Theoretical Physics</span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                   8. FINAL CTA SECTION                      */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-8 sm:p-14 lg:p-16 text-center text-white overflow-hidden shadow-2xl shadow-blue-500/20">
          
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Start Exploring Today</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Discover connections hidden in research.
            </h2>

            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Explore papers, connect knowledge, and uncover new research directions with the world's most advanced scientific intelligence graph.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigateAuth('LOGIN')}
                className="px-8 py-4 rounded-xl bg-white text-blue-700 font-extrabold text-sm sm:text-base hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center gap-2 group"
              >
                <span>Launch ResearchGraph</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigateAuth('LOGIN')}
                className="px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-sm sm:text-base hover:bg-white/20 transition-all backdrop-blur-md"
              >
                Sign In to Cockpit
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-blue-100/80 font-medium">
              <span>✦ Free to explore</span>
              <span>✦ No credit card required</span>
              <span>✦ Sub-15ms graph traversal</span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                      9. GLOBAL FOOTER                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <footer className="w-full bg-white border-t border-slate-200/80 pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200/80">
            
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Network className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-slate-900">
                  ResearchGraph <span className="text-blue-600">AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Empowering researchers, laboratories, and universities worldwide with an interconnected, autonomous knowledge graph.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Systems Operational • 99.98%
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-3">
                Platform
              </span>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => scrollTo(heroRef)} className="hover:text-blue-600">Research Cockpit</button></li>
                <li><button onClick={() => scrollTo(graphRef)} className="hover:text-blue-600">3D Topology</button></li>
                <li><button onClick={() => scrollTo(pipelineRef)} className="hover:text-blue-600">RAG Pipeline</button></li>
                <li><button onClick={() => scrollTo(sourcesRef)} className="hover:text-blue-600">Data Sources</button></li>
              </ul>
            </div>

            {/* Col 3: Academic */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-3">
                Academic Sources
              </span>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><span className="hover:text-blue-600 cursor-pointer">OpenAlex Integration</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">arXiv Preprint Sync</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Citation Methodology</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">API Documentation</span></li>
              </ul>
            </div>

            {/* Col 4: Trust */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-3">
                Trust & Standards
              </span>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><span className="hover:text-blue-600 cursor-pointer">Zero Hallucination Policy</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Privacy & Data Governance</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Open Access Commitment</span></li>
                <li><span className="hover:text-blue-600 cursor-pointer">Institutional Licensing</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <span>© 2026 ResearchGraph AI. Built for researchers and academic institutions worldwide.</span>
            <div className="flex items-center gap-4">
              <span className="hover:text-blue-600 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-blue-600 cursor-pointer">Terms of Service</span>
              <span className="hover:text-blue-600 cursor-pointer">Security</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                     10. IN-APP MODALS                       */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ABOUT MODAL */}
              {activeModal === 'ABOUT' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" /> About ResearchGraph AI
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Pioneering Cognitive Research Intelligence
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    ResearchGraph AI was created to solve academic fragmentation. Every year, over 5 million new research papers are published across thousands of siloed journals and repositories. Researchers spend months manually reading disconnected PDFs and missing critical breakthroughs.
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-sm text-slate-800">Our Mission</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      To organize the world's academic literature into an interconnected, multi-dimensional cognitive universe where any hypothesis can be validated across disciplines in milliseconds.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => { setActiveModal(null); onNavigateAuth('LOGIN'); }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                    >
                      Join the Platform
                    </button>
                  </div>
                </div>
              )}

              {/* DEMO MODAL */}
              {activeModal === 'DEMO' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                    <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" /> Interactive Platform Demonstration
                  </div>

                  {/* Video Selector Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {videoTourData.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveVideoIdx(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                          activeVideoIdx === idx
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {videoTourData[activeVideoIdx].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {videoTourData[activeVideoIdx].description}
                  </p>

                  {/* Embedded Player or Interactive Simulation */}
                  {videoTourData[activeVideoIdx].youtubeId ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoTourData[activeVideoIdx].youtubeId}?autoplay=1&rel=0`}
                        title={videoTourData[activeVideoIdx].title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-blue-400 font-bold">
                        <span>SIMULATION: GNN DRUG DISCOVERY</span>
                        <span className="text-emerald-400">● ACTIVE SYNTHESIS</span>
                      </div>
                      <div className="space-y-2 text-slate-300 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                          Step 1 • Parallel query dispatch to arXiv & OpenAlex (1,420 matched candidates)
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                          Step 2 • 3D Topology clustering extracting ADMET & E(3)-equivariant networks
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                          Step 3 • Multi-LLM consensus synthesis generated 4 verifiable hypotheses
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Ready to explore with your research queries?</span>
                    <button
                      onClick={() => { setActiveModal(null); onNavigateAuth('LOGIN'); }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                    >
                      <span>Launch Cockpit</span>
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
