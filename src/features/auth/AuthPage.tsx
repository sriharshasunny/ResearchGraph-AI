import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Mail, Lock, User, ArrowRight } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER';

export const AuthPage: React.FC<{ onAuthComplete: () => void }> = ({ onAuthComplete }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthComplete();
  };

  return (
    <div className="fixed inset-0 bg-black font-sans flex items-center justify-center lg:justify-start text-white overflow-hidden">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      </div>

      {/* Auth Container */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md lg:ml-[10%] px-6"
      >
        <div className="w-full bg-[#060B14]/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl border border-cyan-400/50 flex items-center justify-center bg-cyan-400/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Network className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-lg leading-tight tracking-wide">ResearchGraph AI</span>
              <span className="text-gray-400 text-[10px] font-medium tracking-wide">Explore. Connect. Discover.</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            {mode === 'LOGIN' ? 'Login to continue your research journey.' : 'Join the universe of academic knowledge.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {mode === 'REGISTER' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required
                  className="w-full bg-[#030712]/50 border border-gray-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                placeholder="Email Address" 
                required
                className="w-full bg-[#030712]/50 border border-gray-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                placeholder="Password" 
                required
                className="w-full bg-[#030712]/50 border border-gray-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {mode === 'LOGIN' && (
              <div className="flex items-center justify-between text-xs font-medium">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 bg-transparent text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0" />
                  <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>
                <button type="button" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity"></span>
              <div className="relative flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl py-3 px-4 transition-all group-hover:bg-transparent">
                <span className="font-bold text-white tracking-wide">
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
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {mode === 'LOGIN' ? 'Sign up' : 'Login'}
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  );
};
