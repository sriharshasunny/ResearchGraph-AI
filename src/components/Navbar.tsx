import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Command, Search, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activePage, setSearchQuery, setActivePage } = useApp();

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      setSearchQuery(e.currentTarget.value);
      setActivePage('search');
    }
  };

  const getPageTitle = () => {
    switch(activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'chat': return 'AI Research Assistant';
      case 'graph': return 'Knowledge Graph Explorer';
      case 'search': return 'Discover Papers';
      case 'details': return 'Paper Analysis';
      default: return 'ResearchGraph';
    }
  };

  return (
    <header className="h-20 bg-[#080d1a]/80 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6 sm:px-8 z-40 sticky top-0 relative shadow-lg shadow-black/40">
      <div className="flex items-center gap-3">
        <h1 className="text-[18px] font-extrabold text-white tracking-tight">{getPageTitle()}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-semibold text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          ENGINE ONLINE
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Command Bar */}
        <div className="hidden md:flex items-center relative group">
           <Search className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
           <input 
             type="text" 
             placeholder="Search papers, authors, topics..." 
             onKeyDown={handleGlobalSearch}
             className="w-72 lg:w-80 h-10 pl-10 pr-12 rounded-xl bg-[#0a0f1c]/90 border border-white/15 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all backdrop-blur-md shadow-inner"
           />
           <div className="absolute right-2.5 flex items-center gap-1 opacity-60">
             <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/15 rounded shadow-sm text-gray-400 flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />K</kbd>
           </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button className="relative p-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 transition-all">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-white/10 mx-0.5"></div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all font-bold text-[12px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pro Lab</span>
          </button>
        </div>
      </div>
    </header>
  );
};
