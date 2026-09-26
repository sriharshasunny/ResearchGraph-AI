import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Sparkles, User, Mic, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery, setActivePage } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('search');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-24 w-full items-center justify-between bg-brand-bg/80 backdrop-blur-xl px-10 transition-all border-b border-brand-border/30">
      {/* Left: Logo Mobile Only */}
      <div className="flex items-center gap-3 md:hidden">
         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent to-brand-violet text-brand-bg shadow-[0_0_10px_rgba(0,209,255,0.3)]">
            <Hexagon className="h-6 w-6" />
         </div>
      </div>

      {/* Center: Command Bar */}
      <div className="flex-1 flex justify-center max-w-3xl mx-auto px-4 w-full hidden md:flex">
        <form onSubmit={handleSearchSubmit} className="relative w-full group">
          <div className="absolute inset-0 bg-brand-accent/5 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-focus-within:opacity-100 group-hover:opacity-50"></div>
          <div className="relative flex items-center bg-brand-surface/80 border border-brand-border/40 rounded-2xl px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 focus-within:border-brand-accent/50 focus-within:shadow-[0_0_20px_rgba(0,209,255,0.15)] focus-within:bg-brand-surface">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-accent/10 text-brand-accent mr-4 group-focus-within:shadow-[0_0_15px_rgba(0,209,255,0.2)] transition-all">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Ask anything about academic research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-[16px] text-brand-text placeholder-brand-textMuted/60 focus:outline-none"
            />
            <div className="flex items-center gap-3 ml-2 shrink-0">
               <span className="hidden lg:flex text-[11px] font-medium tracking-wide text-brand-textMuted px-2.5 py-1.5 rounded-lg bg-brand-border/30 border border-brand-border/50 shadow-inner">⌘ K</span>
               <button type="button" className="p-2.5 text-brand-textMuted hover:text-brand-accent transition-all rounded-xl hover:bg-brand-accent/10 hover:shadow-[0_0_10px_rgba(0,209,255,0.2)]">
                 <Mic className="h-5 w-5" />
               </button>
            </div>
          </div>
        </form>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full border border-brand-border/30 bg-brand-surface/60 shadow-sm backdrop-blur-sm">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(0,209,255,0.8)]"></span>
          </div>
          <span className="text-[11px] font-bold text-brand-textMuted uppercase tracking-widest">Research Engine Online</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-3 rounded-2xl border border-brand-border/30 bg-brand-surface hover:bg-brand-border/20 text-brand-textMuted hover:text-brand-text transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(0,209,255,0.8)]"></span>
          </button>
          
          <button className="p-1 rounded-2xl border border-brand-border/30 bg-brand-surface hover:border-brand-accent/50 transition-all overflow-hidden group hover:shadow-[0_0_15px_rgba(0,209,255,0.15)]">
            <div className="h-10 w-10 rounded-xl bg-brand-bg flex items-center justify-center group-hover:bg-brand-accent/10 transition-colors">
              <User className="h-5 w-5 text-brand-textMuted group-hover:text-brand-accent" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
