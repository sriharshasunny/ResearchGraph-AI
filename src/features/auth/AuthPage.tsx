import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight, Search, BrainCircuit, Database, ChevronDown } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30">
      
      {/* Hero Section (100vh) */}
      <div className="relative min-h-screen w-full flex flex-col">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/login_bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/30"></div>
          {/* Gradient to darken the right side for the login box, and bottom for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-[#030712]/90"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/50 to-[#030712]"></div>
        </div>

        {/* Top Navigation */}
        <nav className="relative z-50 w-full px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-extrabold text-xl tracking-wide">ResearchGraph</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-300">
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#data" className="hover:text-cyan-400 transition-colors">Data Sources</a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: About & Pitch */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col gap-6 pt-10 lg:pt-0"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Research Intelligence v2.0</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] leading-[1.1]">
              Uncover the <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">Hidden Patterns</span><br/>
              in Science.
            </h1>
            
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed drop-shadow-md">
              ResearchGraph AI maps the universe of academic knowledge. Instantly connect papers, discover authors, and visualize complex algorithms through an interactive semantic graph.
            </p>
            
            <div className="flex flex-col gap-5 mt-6">
              <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm p-3 rounded-2xl w-fit border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Search className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-200 font-semibold text-sm">Semantic Search across 200M+ papers</span>
              </div>
              <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm p-3 rounded-2xl w-fit border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Network className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-200 font-semibold text-sm">Interactive 3D Knowledge Graphs</span>
              </div>
              <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm p-3 rounded-2xl w-fit border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <BrainCircuit className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-gray-200 font-semibold text-sm">AI-powered Insights & Summaries</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Login Box */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center lg:justify-end pb-20 lg:pb-0"
          >
            <div className="w-full max-w-[420px] bg-[#060B14]/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
              
              {/* Corner glows */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px]"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[50px]"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                  {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-400 text-sm mb-8">
                  {mode === 'LOGIN' ? 'Login to continue your research journey.' : 'Join the universe of academic knowledge.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'REGISTER' && (
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <input 
                        type="text" placeholder="Full Name" required
                        className="w-full bg-[#030712]/80 border border-gray-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="email" placeholder="Email Address" required
                      className="w-full bg-[#030712]/80 border border-gray-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="password" placeholder="Password" required
                      className="w-full bg-[#030712]/80 border border-gray-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                    />
                  </div>

                  {mode === 'LOGIN' && (
                    <div className="flex items-center justify-between text-xs font-medium pt-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-[#030712] text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0" />
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                      </label>
                      <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button type="submit" className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-4 block">
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <div className="relative flex items-center justify-center gap-2 bg-[#060B14] group-hover:bg-transparent rounded-xl py-3.5 px-4 transition-all duration-300">
                      <span className="font-bold text-white tracking-wide text-sm">
                        {mode === 'LOGIN' ? 'Launch Platform' : 'Start Researching'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-gray-400">
                  {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors font-bold ml-1"
                  >
                    {mode === 'LOGIN' ? 'Sign up' : 'Login'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">Discover More</span>
          <ChevronDown className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      {/* Section: How it works */}
      <section id="how-it-works" className="relative z-10 w-full py-32 bg-[#030712] border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20 flex flex-col items-center">
            <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-3">The Engine</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How ResearchGraph Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl">
              Our platform ingests millions of academic sources to build a continuously updating, connected universe of intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#060B14] border border-gray-800 hover:border-blue-500/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">1. Query</h3>
              <p className="text-gray-400 leading-relaxed">
                Enter a concept, algorithm, or author. Our semantic engine understands the deep context of your research, moving far beyond basic keyword matching.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[#060B14] border border-gray-800 hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Network className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">2. Visualize</h3>
              <p className="text-gray-400 leading-relaxed">
                Watch as papers, authors, and datasets automatically link together in a stunning, interactive 3D knowledge graph, revealing hidden connections.
              </p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[#060B14] border border-gray-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">3. Discover</h3>
              <p className="text-gray-400 leading-relaxed">
                Let AI identify critical research gaps, summarize complex findings, and suggest your next breakthrough reading material automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Data Sources */}
      <section id="data" className="relative z-10 w-full py-32 bg-[#060B14] border-t border-gray-800/50 overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Connected to the World's Knowledge.</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              ResearchGraph AI is continuously synced with the most prestigious academic databases, pre-print servers, and institutional repositories.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <span className="font-semibold text-gray-200">arXiv & bioRxiv</span>
                <span className="text-cyan-400 font-mono text-sm">Real-time</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <span className="font-semibold text-gray-200">IEEE Xplore</span>
                <span className="text-cyan-400 font-mono text-sm">Indexed</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <span className="font-semibold text-gray-200">PubMed Central</span>
                <span className="text-cyan-400 font-mono text-sm">Indexed</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <span className="font-semibold text-gray-200">ACM Digital Library</span>
                <span className="text-cyan-400 font-mono text-sm">Indexed</span>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
             <div className="w-80 h-80 rounded-full border border-gray-700/50 flex items-center justify-center relative animate-[spin_60s_linear_infinite]">
                <div className="absolute top-0 -translate-y-1/2 w-16 h-16 rounded-2xl bg-[#030712] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Database className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="absolute bottom-0 translate-y-1/2 w-16 h-16 rounded-2xl bg-[#030712] border border-purple-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Network className="w-6 h-6 text-purple-400" />
                </div>
                <div className="w-56 h-56 rounded-full border border-gray-700/50 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center backdrop-blur-md animate-[spin_10s_linear_infinite_reverse]">
                    <BrainCircuit className="w-10 h-10 text-white drop-shadow-md" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-gray-800 bg-[#02050A]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-gray-500" />
            <span className="font-bold text-gray-400 tracking-wide">ResearchGraph AI</span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 ResearchGraph AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
