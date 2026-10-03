import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, Search, MessageSquare, FileText, Bookmark, 
  GitCompare, Network, BookOpen, Activity, Clock, 
  LayoutDashboard, Settings
} from 'lucide-react';
import type { PageType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();

  const navGroups = [
    {
      title: 'Discover',
      items: [
        { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
        { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
        { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Library',
      items: [
        { id: 'details', label: 'Corpus', icon: <FileText className="w-5 h-5" /> },
        { id: 'saved', label: 'Saved Papers', icon: <Bookmark className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Analyze',
      items: [
        { id: 'compare', label: 'Compare', icon: <GitCompare className="w-5 h-5" /> },
        { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
        { id: 'literature', label: 'Literature Review', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'gaps', label: 'Research Gaps', icon: <Activity className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Activity',
      items: [
        { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
      ]
    }
  ];

  return (
    <motion.aside
      animate={{ width: isSidebarOpen ? 250 : 76 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="h-full shrink-0 bg-[#06111F] text-white flex flex-col justify-between border-r border-[#0B1A38] z-30 select-none relative transition-all"
    >
      {/* ── TOP BRAND & TOGGLE ── */}
      <div>
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#0B1A38]">
          <div 
            onClick={toggleSidebar}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors">
              <Network className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  <span className="font-extrabold text-[14px] tracking-tight text-white block">
                    ResearchGraph
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── NAVIGATION GROUPS ── */}
        <nav className="py-4 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-60px)] scrollbar-thin">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-2 pb-1"
                  >
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      {group.title}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      title={!isSidebarOpen ? item.label : undefined}
                      onClick={() => setActivePage(item.id as PageType)}
                      className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'} rounded-xl transition-all font-semibold text-[13px] group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                          : 'text-gray-400 hover:bg-[#0B1A38]/90 hover:text-white'
                      }`}
                    >
                      <div className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-105 text-white' : 'group-hover:scale-105'}`}>
                        {item.icon}
                      </div>
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden text-left flex-1"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      {/* ── BOTTOM BRAND MARK ── */}
      <div className="p-4 border-t border-[#0B1A38] text-center">
        {!isSidebarOpen ? (
          <div className="w-full flex flex-col items-center gap-4 text-gray-500">
            <div title="Dashboard"><LayoutDashboard className="w-5 h-5 hover:text-white transition-colors cursor-pointer" /></div>
            <div title="Settings"><Settings className="w-5 h-5 hover:text-white transition-colors cursor-pointer" /></div>
          </div>
        ) : (
          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest flex items-center justify-between">
            <span>v1.0.2 / Enterprise</span>
            <div title="Settings"><Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors" /></div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
