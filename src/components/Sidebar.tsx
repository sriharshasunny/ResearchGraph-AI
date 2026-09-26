import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  Bot,
  Library,
  BookOpen,
  Columns,
  Network,
  Lightbulb,
  Bookmark,
  History,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Hexagon
} from 'lucide-react';


export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, savedPaperIds, comparePaperIds } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const topMenuItems = [
    { id: 'dashboard', label: 'Home', description: 'Workspace overview', icon: Home },
    { id: 'search', label: 'Research Search', description: 'Find academic papers', icon: Search },
    { id: 'chat', label: 'AI Research Assistant', description: 'Ask questions about papers', icon: Bot },
    { id: 'search', label: 'Papers', description: 'Explore research', icon: Library }, 
    { id: 'saved', label: 'Saved Papers', description: 'Your research library', icon: Bookmark, badge: savedPaperIds.length > 0 ? savedPaperIds.length : undefined },
    { id: 'compare', label: 'Paper Comparison', description: 'Compare selected papers', icon: Columns, badge: comparePaperIds.length > 0 ? comparePaperIds.length : undefined },
    { id: 'graph', label: 'Knowledge Graph', description: 'Explore research connections', icon: Network },
    { id: 'lit-review', label: 'Literature Review', description: 'Synthesize research', icon: BookOpen },
    { id: 'analytics', label: 'Research Gaps', description: 'Discover potential gaps', icon: Lightbulb },
    { id: 'profile', label: 'History', description: 'Recent activities', icon: History },
  ];

  const bottomMenuItems = [
    { id: 'profile', label: 'Settings', description: 'Platform preferences', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ width: '88px' }}
      animate={{ width: isExpanded ? '280px' : '88px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col border border-brand-border bg-white z-30 shrink-0 m-4 rounded-[24px] shadow-subtle overflow-visible"
      style={{ height: 'calc(100vh - 32px)' }}
    >
      {/* Brand Header */}
      <div className="flex items-center p-6 h-24 relative overflow-hidden shrink-0">
        <div className="flex items-center gap-4 cursor-pointer z-10 w-full" onClick={() => setActivePage('landing')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent to-blue-600 text-white shrink-0 shadow-md">
            <Hexagon className="h-6 w-6" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-[17px] font-bold text-brand-text whitespace-nowrap tracking-wide"
              >
                ResearchGraph
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full border border-brand-border bg-white text-brand-textMuted hover:text-brand-accent shadow-sm hover:shadow-md hover:border-blue-200 transition-all z-40"
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden scrollbar-thin px-4 py-2">
        <nav className="space-y-1 w-full">
          {topMenuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.id as any)}
                className={`group flex w-full items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                  isActive
                    ? 'bg-blue-50/50'
                    : 'hover:bg-gray-50'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 relative z-10 ${isActive ? 'text-brand-accent bg-blue-100/50' : 'text-brand-textMuted group-hover:text-brand-text group-hover:bg-gray-100/50'}`}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Icon className="h-[18px] w-[18px]" />
                  </motion.div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex flex-col overflow-hidden whitespace-nowrap min-w-[140px]"
                    >
                      <span className={`text-[13px] font-medium transition-colors ${isActive ? 'text-brand-accent' : 'text-brand-textSoft group-hover:text-brand-text'}`}>
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {item.badge && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? 'bg-brand-accent text-white shadow-sm' : 'bg-gray-100 text-brand-textMuted'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 space-y-1 border-t border-brand-border pt-4 pb-4 w-full">
          {bottomMenuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.id as any)}
                className={`group flex w-full items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                  isActive
                    ? 'bg-blue-50/50'
                    : 'hover:bg-gray-50'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-accent rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${isActive ? 'text-brand-accent bg-blue-100/50' : 'text-brand-textMuted group-hover:text-brand-text group-hover:bg-gray-100/50'}`}>
                   <Icon className="h-[18px] w-[18px]" />
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex flex-col overflow-hidden whitespace-nowrap min-w-[140px]"
                    >
                      <span className={`text-[13px] font-medium transition-colors ${isActive ? 'text-brand-accent' : 'text-brand-textSoft group-hover:text-brand-text'}`}>
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          {/* User Profile */}
          <div className="group flex items-center gap-4 px-3 py-3 mt-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all overflow-hidden relative">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-brand-border group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
              <User className="h-4 w-4 text-brand-textMuted group-hover:text-brand-accent transition-colors" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col overflow-hidden leading-tight whitespace-nowrap min-w-[140px]"
                >
                  <span className="text-[13px] font-semibold text-brand-text group-hover:text-brand-accent transition-colors">Researcher</span>
                  <span className="text-[11px] text-brand-textMuted">Pro Access</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
