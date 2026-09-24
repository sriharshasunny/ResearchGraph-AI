import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    // Simulate backend authentication
    setTimeout(() => {
      // Always succeed for demo, but we could add logic to fail
      if (email === 'fail@test.com') {
        setIsAuthenticating(false);
        setError('Invalid credentials. Please try again.');
      } else {
        // Success
        onLoginSuccess();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-brand-textMuted" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-xl p-8 relative z-10 flex flex-col items-center"
      >
        <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center mb-6 shadow-sm">
          <Network className="h-6 w-6 text-brand-accent" />
        </div>
        
        <h1 className="text-2xl font-bold text-brand-text mb-2 tracking-tight">ResearchGraph AI</h1>
        <p className="text-sm text-brand-textMuted mb-8 text-center">
          Enter your credentials to access the semantic research workspace.
        </p>

        {error && (
          <div className="w-full mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-[13px] flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLaunch} className="w-full space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-brand-textMuted uppercase tracking-wider">Email / Username</label>
            <input 
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-brand-border bg-brand-bg text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="researcher@university.edu"
              disabled={isAuthenticating}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-brand-textMuted uppercase tracking-wider">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-brand-border bg-brand-bg text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="••••••••"
              disabled={isAuthenticating}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isAuthenticating}
              className={`group relative w-full h-12 flex items-center justify-center rounded-lg font-medium text-[15px] transition-all duration-300
                ${isAuthenticating 
                  ? 'bg-brand-border text-brand-textMuted cursor-not-allowed' 
                  : 'bg-brand-text text-brand-surface hover:bg-[#262626] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                }`}
            >
              {isAuthenticating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-brand-textMuted border-t-transparent animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity group-hover:animate-pulse" />
                  Launch Platform
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
