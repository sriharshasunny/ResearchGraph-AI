import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, MessageSquare, Network, Search, Bookmark, Settings, LayoutGrid } from 'lucide-react';
import type { PageType } from '../types';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage } = useApp();

  const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: 'Discover', icon: <Search className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-brand-border flex flex-col justify-between hidden md:flex shrink-0">
      
      {/* Brand */}
      <div className="h-20 flex items-center px-6 border-b border-brand-border cursor-pointer" onClick={() => setActivePage('dashboard')}>
        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm mr-3">
          <LayoutGrid className="w-4 h-4 text-brand-accent" />
        </div>
        <span className="text-[16px] font-extrabold text-brand-text tracking-tight">ResearchGraph<span className="text-brand-accent">.</span></span>
      </div>

      {/* Nav */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-3 text-[11px] font-bold text-brand-textMuted uppercase tracking-widest">Main Menu</div>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold text-[13px] group ${
              activePage === item.id 
                ? 'bg-blue-50 text-brand-accent shadow-sm' 
                : 'text-brand-textSoft hover:bg-gray-50 hover:text-brand-text'
            }`}
          >
            <div className={`transition-transform duration-300 ${activePage === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            {item.label}
          </button>
        ))}
        
        <div className="px-3 mt-8 mb-3 text-[11px] font-bold text-brand-textMuted uppercase tracking-widest">Library</div>
        <button
          onClick={() => setActivePage('search')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-textSoft hover:bg-gray-50 hover:text-brand-text transition-all font-semibold text-[13px] group"
        >
          <div className="transition-transform duration-300 group-hover:scale-110"><Bookmark className="w-5 h-5" /></div>
          Saved Papers
        </button>
      </div>

      {/* Profile */}
      <div className="p-4 border-t border-brand-border">
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent to-brand-violet p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-[11px] font-bold text-brand-text">JD</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-brand-text leading-tight">Jane Doe</span>
              <span className="text-[11px] text-brand-textMuted">Researcher</span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-brand-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </aside>
  );
};
