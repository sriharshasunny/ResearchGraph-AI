import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Command, Search, Settings, LogOut } from 'lucide-react';

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
    <header className="h-14 shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 relative">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Command Bar */}
        <div className="hidden md:flex items-center relative group">
           <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
           <input 
             type="text" 
             placeholder="Search papers, authors, topics..." 
             onKeyDown={handleGlobalSearch}
             className="w-64 lg:w-72 h-8 pl-8 pr-10 rounded-full bg-gray-100 border border-transparent text-[12px] text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
           />
           <div className="absolute right-1.5 flex items-center gap-1 opacity-60">
             <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-gray-200 rounded text-gray-400 flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />K</kbd>
           </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          </button>
          
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
            <Settings className="w-4 h-4" />
          </button>

          {onLogout && (
            <button 
              onClick={onLogout}
              title="Log out"
              className="relative p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          
          <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
          
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm cursor-pointer ml-1">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};
