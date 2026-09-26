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
    <header className="h-20 bg-white/60 backdrop-blur-3xl border-b border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between px-8 z-40 sticky top-0 relative">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-80"></div>
      
      <div className="flex items-center gap-4">
        <h1 className="text-[18px] font-extrabold text-brand-text tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Command Bar */}
        <div className="hidden md:flex items-center relative group">
           <Search className="absolute left-3 w-4 h-4 text-brand-textMuted group-focus-within:text-brand-accent transition-colors" />
           <input 
             type="text" 
             placeholder="Search papers, authors, topics..." 
             onKeyDown={handleGlobalSearch}
             className="w-72 h-10 pl-10 pr-12 rounded-xl bg-white/60 border border-white/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] text-[13px] text-brand-text placeholder-brand-textMuted focus:outline-none focus:bg-white focus:border-brand-accent/40 focus:ring-2 focus:ring-brand-accent/20 transition-all backdrop-blur-md"
           />
           <div className="absolute right-2 flex items-center gap-1 opacity-60">
             <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/80 border border-gray-200 rounded shadow-sm text-brand-textMuted"><Command className="w-3 h-3 inline-block" /> K</kbd>
           </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl text-brand-textMuted hover:bg-white hover:text-brand-accent hover:shadow-sm transition-all border border-transparent hover:border-white/60">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 transition-all font-bold text-[12px] uppercase tracking-wider border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            Upgrade
          </button>
        </div>
      </div>
    </header>
  );
};
