import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, MessageSquare, Network, Search, Bookmark, Settings, LayoutGrid, LogOut } from 'lucide-react';
import type { PageType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
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
      animate={{ width: isSidebarOpen ? 240 : 72 }}
      className="h-full bg-[#09090b] border-r border-zinc-800/60 flex flex-col justify-between hidden md:flex shrink-0 overflow-hidden relative z-20"
    >
      
      {/* Brand */}
      <div 
        className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center'} border-b border-zinc-800/60 transition-all duration-300`} 
      >
        <button 
          onClick={toggleSidebar}
          className={`h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-all shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`}
        >
          <LayoutGrid className="w-4 h-4 text-zinc-300" />
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
          <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest transition-opacity duration-300">Main Menu</div>
        ) : (
          <div className="h-[1px] w-6 mx-auto bg-zinc-800 mb-3 mt-1 rounded-full"></div>
        )}
        
        {navItems.map(item => (
          <button
            key={item.id}
            title={!isSidebarOpen ? item.label : undefined}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'} rounded-lg transition-all font-medium text-[13px] group ${
              activePage === item.id 
                ? 'bg-zinc-800/80 text-zinc-100' 
                : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
            }`}
          >
            <div className={`shrink-0 transition-transform duration-300 ${activePage === item.id ? 'scale-105' : 'group-hover:scale-105'}`}>
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
          <div className="px-3 mt-6 mb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest transition-opacity duration-300">Library</div>
        ) : (
          <div className="h-[1px] w-6 mx-auto bg-zinc-800 mt-6 mb-3 rounded-full"></div>
        )}
        
        <button
          title={!isSidebarOpen ? "Saved Papers" : undefined}
          onClick={() => setActivePage('search')}
          className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'} rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 transition-all font-medium text-[13px] group`}
        >
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105"><Bookmark className="w-5 h-5" /></div>
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

      {/* Profile & Logout */}
      <div className={`p-4 border-t border-zinc-800/60 space-y-2 ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between p-2' : 'justify-center p-1.5'} rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group`}>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <span className="text-[11px] font-bold text-zinc-300">JD</span>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-[13px] font-medium text-zinc-200 leading-tight">Jane Doe</span>
                  <span className="text-[11px] text-zinc-500">Researcher</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isSidebarOpen && (
            <Settings className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          title="Log Out & Return to Landing Page"
          className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'} rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium text-[13px] group`}
        >
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};
