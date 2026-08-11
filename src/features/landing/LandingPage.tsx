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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-650/10 blur-[130px] pointer-events-none"></div>

      {/* Nav */}
      <nav className="w-full flex items-center justify-between h-20 px-8 border-b border-white/5 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            ResearchGraph AI
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span
            onClick={() => setActivePage('dashboard')}
            className="text-sm font-medium text-slate-350 hover:text-white transition-colors cursor-pointer"
          >
            Dashboard
          </span>
          <span
            onClick={() => setActivePage('graph')}
            className="text-sm font-medium text-slate-350 hover:text-white transition-colors cursor-pointer"
          >
            Knowledge Graph
          </span>
          <button
            onClick={() => setActivePage('dashboard')}
            className="px-5 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-sm font-semibold shadow-lg shadow-indigo-600/20 border border-indigo-500/30 transition-all hover:scale-105"
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/30 text-xs font-semibold text-indigo-350 mb-6 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Next-Generation Semantic Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          Explore Academic Literature <br />
          <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-450 bg-clip-text text-transparent">
            Like a Semantic Map
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Don't just search keywords. Parse relationships, map models to datasets, extract metrics, and generate reviews automatically with an AI designed for scientific rigor.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => setActivePage('dashboard')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:scale-105 transition-transform"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setActivePage('search')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-white/10 transition-colors"
          >
            Explore Demo
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Comprehensive Research Tools</h2>
          <p className="text-slate-400 text-sm mt-2">Everything a modern researcher needs in a single unified dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md flex gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{feat.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture Illustration */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Visualizing the Knowledge Graph</h2>
          <p className="text-slate-400 text-sm mt-2">See how papers relate dynamically by authorships, methods, and citation paths.</p>
        </div>

        {/* Mock Graphic Visual */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-md p-6 max-w-4xl mx-auto overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 -z-10" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-10 px-6">
            <div className="max-w-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Cpu className="h-4 w-4 animate-spin-slow" />
                <span>INTELLIGENCE ENGINE</span>
              </div>
              <h3 className="text-2xl font-bold text-white leading-tight">Structured Semantic Data Parsing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our parsing pipeline reads raw PDFs and identifies structural entities. Rather than relying on simple metadata, we extract the core logic stack:
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded bg-slate-800 border border-white/5 text-slate-350">Authors</span>
                <span className="px-3 py-1 rounded bg-slate-800 border border-white/5 text-indigo-400">Methods</span>
                <span className="px-3 py-1 rounded bg-slate-800 border border-white/5 text-purple-400">Models</span>
                <span className="px-3 py-1 rounded bg-slate-800 border border-white/5 text-blue-400">Datasets</span>
              </div>
            </div>

            {/* Visual Node-Edge Canvas Representation */}
            <div className="flex-1 w-full relative h-[250px] border border-white/5 bg-slate-950/70 rounded-xl p-4 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              
              {/* Nodes and Connective SVG lines mock */}
              <svg className="absolute inset-0 w-full h-full">
                <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
                <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="1.5" />
                <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="#2563eb" strokeWidth="1.5" />
                <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 5" />
              </svg>

              {/* Central Node */}
              <div className="absolute flex flex-col items-center justify-center p-3.5 bg-indigo-650 rounded-xl border border-indigo-400/30 text-center font-bold text-xs shadow-lg shadow-indigo-600/30">
                <span>Attention Is All</span>
                <span>You Need</span>
                <span className="text-[9px] font-medium text-indigo-300 mt-1">Paper Node</span>
              </div>

              {/* Sub-Nodes */}
              <div className="absolute top-10 left-10 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-semibold text-slate-300">
                <span>Transformer Model</span>
              </div>
              <div className="absolute top-10 right-14 p-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-[10px] font-semibold text-indigo-400">
                <span>Ashish Vaswani</span>
              </div>
              <div className="absolute bottom-10 left-12 p-2 bg-slate-900 border border-purple-500/20 rounded-lg text-[10px] font-semibold text-purple-400">
                <span>WMT 14 Dataset</span>
              </div>
              <div className="absolute bottom-10 right-14 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-semibold text-slate-300">
                <span>Self-Attention Method</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">How it Works</h2>
          <p className="text-slate-400 text-sm mt-2">Accelerating literature exploration in three simple steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-slate-900/20 border border-white/5 relative">
              <span className="absolute -top-6 left-6 text-5xl font-black bg-gradient-to-b from-indigo-500/30 to-transparent bg-clip-text text-transparent select-none">
                {item.num}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-2">{item.step}</h3>
              <p className="text-sm text-slate-455 mt-3 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-8 border-t border-white/5 bg-slate-950 text-slate-500 text-center text-xs">
        <div className="flex justify-center gap-6 mb-4">
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Security</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">API Integration</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">Semantic Scholar API Partner</span>
        </div>
        <p>&copy; {new Date().getFullYear()} ResearchGraph AI. Built for next-generation research intelligence.</p>
      </footer>
    </div>
  );
};
