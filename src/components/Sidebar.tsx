import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, MessageSquare, Network, Search, Bookmark, Settings, LayoutGrid } from 'lucide-react';
import type { PageType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();

  const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: 'Discover', icon: <Search className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      className="h-full bg-white/60 backdrop-blur-3xl border-r border-white/60 flex flex-col justify-between hidden md:flex shrink-0 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20"
    >
      
      {/* Brand */}
      <div 
        className={`h-20 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center'} border-b border-white/40 transition-all duration-300`} 
      >
        <button 
          onClick={toggleSidebar}
          className={`h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm shrink-0 hover:bg-blue-100 transition-colors ${isSidebarOpen ? 'mr-3' : ''}`}
        >
          <LayoutGrid className="w-4.5 h-4.5 text-brand-accent" />
        </button>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.span 
              onClick={() => setActivePage('dashboard')}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-[16px] font-extrabold text-brand-text tracking-tight whitespace-nowrap overflow-hidden cursor-pointer hover:text-brand-accent transition-colors"
            >
              ResearchGraph<span className="text-brand-accent">.</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className={`flex-1 py-6 ${isSidebarOpen ? 'px-4' : 'px-2'} space-y-1.5 overflow-y-auto scrollbar-thin`}>
        {isSidebarOpen ? (
          <div className="px-3 mb-3 text-[11px] font-bold text-brand-textMuted uppercase tracking-widest transition-opacity duration-300">Main Menu</div>
        ) : (
          <div className="h-[1px] w-8 mx-auto bg-gray-200 mb-3 mt-1 rounded-full"></div>
        )}
        
        {navItems.map(item => (
          <button
            key={item.id}
            title={!isSidebarOpen ? item.label : undefined}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-3'} rounded-xl transition-all font-semibold text-[13px] group ${
              activePage === item.id 
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-brand-accent shadow-[inset_0_1px_3px_rgba(255,255,255,0.5)] border border-white/60' 
                : 'text-brand-textSoft hover:bg-white/60 hover:text-brand-text border border-transparent'
            }`}
          >
            <div className={`shrink-0 transition-transform duration-300 ${activePage === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
        
        {isSidebarOpen ? (
          <div className="px-3 mt-8 mb-3 text-[11px] font-bold text-brand-textMuted uppercase tracking-widest transition-opacity duration-300">Library</div>
        ) : (
          <div className="h-[1px] w-8 mx-auto bg-gray-200 mt-8 mb-3 rounded-full"></div>
        )}
        
        <button
          title={!isSidebarOpen ? "Saved Papers" : undefined}
          onClick={() => setActivePage('search')}
          className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-3'} rounded-xl text-brand-textSoft hover:bg-white/60 hover:text-brand-text border border-transparent transition-all font-semibold text-[13px] group`}
        >
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-110"><Bookmark className="w-5 h-5" /></div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Saved Papers
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Profile */}
      <div className={`p-4 border-t border-white/40 ${isSidebarOpen ? '' : 'flex justify-center'}`}>
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between p-3' : 'justify-center p-1.5'} rounded-xl hover:bg-white/60 hover:shadow-sm border border-transparent hover:border-white/60 transition-all cursor-pointer group`}>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-brand-accent to-brand-violet p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-[11px] font-bold text-brand-text">JD</span>
              </div>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-[13px] font-bold text-brand-text leading-tight">Jane Doe</span>
                  <span className="text-[11px] text-brand-textMuted">Researcher</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isSidebarOpen && (
            <Settings className="w-4 h-4 text-brand-textMuted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
      </div>
    </motion.aside>
  );
};
