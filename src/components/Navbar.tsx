import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Sparkles, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery, setActivePage } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('search');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl px-6 transition-colors duration-300">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search papers, authors, techniques (e.g. Vision Transformer)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900"
            >
              Enter
            </button>
          )}
        </div>
      </form>

      {/* Right Action Bar */}
      <div className="flex items-center gap-4">
        {/* Workspace Quick View */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/20 dark:bg-indigo-950/10 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Semantic Index: V3.4 (1.2M nodes)</span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* Platform Info */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right leading-none hidden sm:flex">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">PROJECT SPACE</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">CV-Transformer-SSL</span>
          </div>
          <div className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex text-slate-600 dark:text-slate-400">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
};
