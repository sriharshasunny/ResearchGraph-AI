import React from 'react';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Sparkles, Brain, Network, LineChart, Cpu } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActivePage } = useApp();

  const features = [
    {
      icon: Brain,
      title: 'Semantic Context Extraction',
      desc: 'Our models parse academic papers beyond keyword indexing. We extract methods, datasets, accuracy, advantages, and limitations automatically.'
    },
    {
      icon: Network,
      title: 'Interactive Knowledge Graphs',
      desc: 'Visualize citations, authorships, and techniques in a unified interactive network canvas. See how papers build on top of each other.'
    },
    {
      icon: Sparkles,
      title: 'AI Research Co-pilot',
      desc: 'Ask questions, prompt reviews, or query comparison vectors about complex algorithms. Get synthesized answers with direct citation links.'
    },
    {
      icon: LineChart,
      title: 'Analytics & Trend Discovery',
      desc: 'Analyze which visual models are trending, track dataset popularity shifts, and find historical citations growth per research year.'
    }
  ];

  const steps = [
    { num: '01', step: 'Index & Synthesize', desc: 'Input topics, papers, or query strings. Our engine indexes semantic relations.' },
    { num: '02', step: 'Connect Graph Entities', desc: 'Authors, methods, models, and datasets are mapped as nodes and edges in our database.' },
    { num: '03', step: 'Explore & Chat', desc: 'Interact with the research. Generate summaries, comparison matrices, and ask follow-up questions.' }
  ];

  return (
    <div className="relative min-h-screen bg-brand-bg text-brand-text font-sans overflow-x-hidden">
      
      {/* Nav */}
      <nav className="w-full flex items-center justify-between h-20 px-8 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-text text-brand-surface">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-brand-text">
            ResearchGraph
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setActivePage('login')}
            className="text-[14px] font-medium text-brand-textMuted hover:text-brand-text transition-colors"
          >
            Workspace
          </button>
          <button
            onClick={() => setActivePage('login')}
            className="text-[14px] font-medium text-brand-textMuted hover:text-brand-text transition-colors"
          >
            Knowledge Graph
          </button>
          <button
            onClick={() => setActivePage('login')}
            className="px-5 py-2.5 rounded-lg bg-brand-text text-brand-surface text-[14px] font-medium hover:bg-brand-textMuted transition-colors"
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-surface border border-brand-border text-[12px] font-semibold text-brand-textMuted mb-8 shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-brand-accent" />
          <span>Next-Generation Semantic Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-8"
        >
          Explore Academic Literature <br />
          <span className="text-brand-textMuted">Like a Semantic Map</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[18px] text-brand-textMuted max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Don't just search keywords. Parse relationships, map models to datasets, extract metrics, and generate reviews automatically with an AI designed for scientific rigor.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => setActivePage('login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-brand-text hover:bg-brand-textMuted text-brand-surface text-[15px] font-medium transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActivePage('login')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-brand-surface hover:bg-brand-bg border border-brand-border text-brand-text text-[15px] font-medium transition-colors"
          >
            Explore Demo
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-brand-border">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-semibold text-brand-text">Comprehensive Research Tools</h2>
          <p className="text-[16px] text-brand-textMuted mt-4">Everything a modern researcher needs in a single unified dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className="p-8 rounded-xl bg-brand-surface border border-brand-border shadow-sm flex flex-col md:flex-row gap-6 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-bg border border-brand-border text-brand-text flex-shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-brand-text mb-2">{feat.title}</h3>
                  <p className="text-[14px] text-brand-textMuted leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture Illustration */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-brand-border">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-semibold text-brand-text">Visualizing the Knowledge Graph</h2>
          <p className="text-[16px] text-brand-textMuted mt-4">See how papers relate dynamically by authorships, methods, and citation paths.</p>
        </div>

        {/* Mock Graphic Visual */}
        <div className="rounded-xl border border-brand-border bg-brand-surface shadow-sm p-8 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md flex flex-col gap-5">
              <div className="flex items-center gap-2 text-brand-text font-semibold text-[12px] uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-brand-textMuted" />
                <span>Intelligence Engine</span>
              </div>
              <h3 className="text-[24px] font-semibold text-brand-text leading-tight">Structured Semantic Data Parsing</h3>
              <p className="text-[15px] text-brand-textMuted leading-relaxed">
                Our parsing pipeline reads raw PDFs and identifies structural entities. Rather than relying on simple metadata, we extract the core logic stack:
              </p>
              <div className="flex flex-wrap gap-2 text-[12px] font-medium pt-2">
                <span className="px-3 py-1.5 rounded-md bg-brand-bg border border-brand-border text-brand-text">Authors</span>
                <span className="px-3 py-1.5 rounded-md bg-brand-bg border border-brand-border text-brand-text">Methods</span>
                <span className="px-3 py-1.5 rounded-md bg-brand-bg border border-brand-border text-brand-text">Models</span>
                <span className="px-3 py-1.5 rounded-md bg-brand-bg border border-brand-border text-brand-text">Datasets</span>
              </div>
            </div>

            {/* Visual Node-Edge Canvas Representation */}
            <div className="flex-1 w-full relative h-[300px] border border-brand-border bg-brand-bg rounded-lg p-4 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              
              {/* Nodes and Connective SVG lines mock */}
              <svg className="absolute inset-0 w-full h-full">
                <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#d4d4d4" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#d4d4d4" strokeWidth="1.5" />
                <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="#d4d4d4" strokeWidth="1.5" />
                <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="#d4d4d4" strokeWidth="2" />
              </svg>

              {/* Central Node */}
              <div className="absolute flex flex-col items-center justify-center p-4 bg-brand-text rounded-lg border border-brand-border text-center font-medium text-[12px] shadow-md z-10 text-brand-surface">
                <span>Attention Is All</span>
                <span>You Need</span>
                <span className="text-[10px] opacity-70 mt-1">Paper Node</span>
              </div>

              {/* Sub-Nodes */}
              <div className="absolute top-12 left-12 p-2.5 bg-brand-surface border border-brand-border shadow-sm rounded-md text-[11px] font-medium text-brand-text z-10">
                <span>Transformer Model</span>
              </div>
              <div className="absolute top-12 right-16 p-2.5 bg-brand-surface border border-brand-border shadow-sm rounded-md text-[11px] font-medium text-brand-text z-10">
                <span>Ashish Vaswani</span>
              </div>
              <div className="absolute bottom-12 left-16 p-2.5 bg-brand-surface border border-brand-border shadow-sm rounded-md text-[11px] font-medium text-brand-text z-10">
                <span>WMT 14 Dataset</span>
              </div>
              <div className="absolute bottom-12 right-16 p-2.5 bg-brand-surface border border-brand-border shadow-sm rounded-md text-[11px] font-medium text-brand-text z-10">
                <span>Self-Attention Method</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-brand-border">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-semibold text-brand-text">How it Works</h2>
          <p className="text-[16px] text-brand-textMuted mt-4">Accelerating literature exploration in three simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="p-8 rounded-xl bg-brand-surface border border-brand-border shadow-sm relative">
              <span className="text-[48px] font-bold text-brand-bg select-none block mb-4 border-b border-brand-border pb-4">
                {item.num}
              </span>
              <h3 className="text-[18px] font-semibold text-brand-text mb-3">{item.step}</h3>
              <p className="text-[14px] text-brand-textMuted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-8 border-t border-brand-border bg-brand-surface text-brand-textMuted text-[13px] text-center">
        <div className="flex justify-center gap-8 mb-6">
          <span className="hover:text-brand-text transition-colors cursor-pointer font-medium">Security</span>
          <span className="hover:text-brand-text transition-colors cursor-pointer font-medium">Terms of Service</span>
          <span className="hover:text-brand-text transition-colors cursor-pointer font-medium">API Integration</span>
          <span className="hover:text-brand-text transition-colors cursor-pointer font-medium">Semantic Scholar Partner</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ResearchGraph AI. Built for next-generation research intelligence.</p>
      </footer>
    </div>
  );
};
