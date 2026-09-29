import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, MessageSquare, Network, Search, Bookmark, Settings, LogOut, FileText, GitCompare, BookOpen, Clock, Activity } from 'lucide-react';
import type { PageType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'papers', label: 'Papers', icon: <FileText className="w-5 h-5" /> },
    { id: 'saved', label: 'Saved Papers', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-5 h-5" /> },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
    { id: 'literature', label: 'Literature Review', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'gaps', label: 'Research Gaps', icon: <Activity className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 72 }}
      className="h-full bg-[#0D1326] border-r border-[#1C263A] flex flex-col justify-between hidden md:flex shrink-0 overflow-hidden relative z-20 text-white"
    >
      
      {/* Brand */}
      <div 
        className={`h-16 flex items-center ${isSidebarOpen ? 'px-6' : 'justify-center'} border-b border-[#1C263A] transition-all duration-300`} 
      >
        <button 
          onClick={toggleSidebar}
          className={`h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-all shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`}
        >
          <Network className="w-4 h-4 text-white" />
        </button>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.span 
              onClick={() => setActivePage('dashboard')}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-[16px] font-bold text-white tracking-tight whitespace-nowrap overflow-hidden cursor-pointer hover:text-blue-400 transition-colors"
            >
              ResearchGraph AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className={`flex-1 py-4 ${isSidebarOpen ? 'px-4' : 'px-2'} space-y-1 overflow-y-auto scrollbar-thin`}>
        {navItems.map(item => (
          <button
            key={item.id}
            title={!isSidebarOpen ? item.label : undefined}
            onClick={() => setActivePage(item.id as any)}
            className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'} rounded-xl transition-all font-medium text-[13px] group ${
              activePage === item.id || (activePage === 'details' && item.id === 'papers')
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-400 hover:bg-[#1C263A] hover:text-white'
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
      </div>

      {/* Profile & Logout */}
      <div className={`p-4 border-t border-[#1C263A] space-y-2 ${isSidebarOpen ? '' : 'flex flex-col items-center'}`}>
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between p-2' : 'justify-center p-1.5'} rounded-xl hover:bg-[#1C263A] transition-colors cursor-pointer group`}>
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
              <span className="text-[11px] font-bold text-white">JD</span>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-[13px] font-bold text-white leading-tight">Jane Doe</span>
                  <span className="text-[11px] text-gray-400">Researcher</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isSidebarOpen && (
            <Settings className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          title="Log Out"
          className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'} rounded-xl text-gray-400 hover:text-white hover:bg-rose-500/80 transition-all font-medium text-[13px] group`}
        >
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <LogOut className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
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
