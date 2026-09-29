import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Command, Search, Sparkles, LogOut } from 'lucide-react';

export const Navbar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
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
    <header className="h-14 shrink-0 bg-[#09090b] border-b border-zinc-800/60 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 relative">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-zinc-100 tracking-tight">{getPageTitle()}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          ONLINE
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Command Bar */}
        <div className="hidden md:flex items-center relative group">
           <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
           <input 
             type="text" 
             placeholder="Search papers, authors, topics..." 
             onKeyDown={handleGlobalSearch}
             className="w-64 lg:w-72 h-8 pl-8 pr-10 rounded-md bg-zinc-900 border border-zinc-800 text-[12px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all shadow-sm"
           />
           <div className="absolute right-1.5 flex items-center gap-1 opacity-60">
             <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-zinc-800 border border-zinc-700 rounded text-zinc-400 flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />K</kbd>
           </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </button>
          
          <div className="h-4 w-[1px] bg-zinc-800 mx-1"></div>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 transition-all font-medium text-[12px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Pro</span>
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              title="Log Out & Return to Landing Page"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
