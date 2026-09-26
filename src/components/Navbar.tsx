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
    <header className="h-20 bg-brand-surface/50 backdrop-blur-xl border-b border-brand-border flex items-center justify-between px-8 z-40 sticky top-0 relative">
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
             className="w-72 h-10 pl-10 pr-12 rounded-xl bg-brand-bg/50 border border-brand-border shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-[13px] text-brand-text placeholder-brand-textMuted focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all backdrop-blur-md"
           />
           <div className="absolute right-2 flex items-center gap-1 opacity-60">
             <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-brand-surface border border-brand-border rounded shadow-sm text-brand-textMuted"><Command className="w-3 h-3 inline-block" /> K</kbd>
           </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl text-brand-textMuted hover:bg-gray-50 hover:text-brand-text transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-brand-border mx-1"></div>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all font-bold text-[12px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Upgrade
          </button>
        </div>
      </div>
    </header>
  );
};
