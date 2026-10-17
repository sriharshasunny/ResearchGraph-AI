import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingExperience from './LandingExperience';
import { Mail, Lock, User, ArrowRight, Sparkles, ArrowLeft, Info, KeyRound, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';
import { InteractiveSpaceBackground } from '../../components/InteractiveSpaceBackground';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

type PageState = 'LANDING' | 'AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const { setActivePage, setSearchQuery } = useApp();
  const [pageState, setPageState] = useState<PageState>('LANDING');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [searchAfterAuth, setSearchAfterAuth] = useState(false);

  // Authentication State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        if (searchAfterAuth) setActivePage('search');
        // Proceed to platform if successful
        onAuthComplete();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password
        });
        if (error) throw error;
        if (searchAfterAuth) setActivePage('search');
        // Proceed to platform if successful
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
  };

  const searchAfterLogin = (query: string) => {
    setSearchQuery(query);
    setSearchAfterAuth(true);
    triggerTraversal('AUTH', 'LOGIN');
  };


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
              className="w-full relative"
            >
              <LandingExperience
                onLogin={() => triggerTraversal('AUTH', 'LOGIN')}
                onRegister={() => triggerTraversal('AUTH', 'REGISTER')}
                onSearch={searchAfterLogin}
              />
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
                className="absolute top-6 left-6 z-[110] px-4 py-2 rounded-full bg-[#0a0f1c]/90 border border-white/15 flex items-center gap-2 hover:bg-white dark:bg-[#111D35]/10 hover:border-cyan-500/40 transition-all backdrop-blur-md shadow-xl"
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
                      <span className="text-[10px] text-gray-300 font-mono bg-white dark:bg-[#111D35]/10 px-2.5 py-1 rounded-full border border-white/15">
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
                      <div className="bg-white dark:bg-[#111D35]/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-cyan-400 font-bold block">204.8M</span> Papers
                      </div>
                      <div className="bg-white dark:bg-[#111D35]/5 rounded-lg py-1.5 px-2 border border-white/5">
                        <span className="text-purple-400 font-bold block">14ms</span> Latency
                      </div>
                      <div className="bg-white dark:bg-[#111D35]/5 rounded-lg py-1.5 px-2 border border-white/5">
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

