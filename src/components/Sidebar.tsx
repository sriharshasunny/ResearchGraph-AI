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
      className="relative flex flex-col border border-brand-border/30 bg-brand-surface/60 backdrop-blur-xl z-30 shrink-0 m-4 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-visible"
      style={{ height: 'calc(100vh - 32px)' }}
    >
      {/* Brand Header */}
      <div className="flex items-center p-6 h-24 relative overflow-hidden shrink-0">
        <div className="flex items-center gap-4 cursor-pointer z-10 w-full" onClick={() => setActivePage('landing')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent to-brand-violet text-brand-bg shrink-0 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
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
          className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full border border-brand-border/50 bg-brand-surface text-brand-textMuted hover:text-brand-accent shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(0,209,255,0.3)] hover:border-brand-accent/30 transition-all z-40"
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden scrollbar-thin px-4 py-2">
        <nav className="space-y-1.5 w-full">
          {topMenuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.id as any)}
                className={`group flex w-full items-center gap-4 px-3 py-3 rounded-2xl text-left transition-all relative ${
                  isActive
                    ? 'bg-brand-accent/5'
                    : 'hover:bg-brand-border/20'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-brand-accent rounded-r-full shadow-[0_0_12px_rgba(0,209,255,0.8)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 relative z-10 ${isActive ? 'text-brand-accent drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]' : 'text-brand-textMuted group-hover:text-brand-text group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]'}`}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Icon className="h-5 w-5" />
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
                      <span className={`text-[14px] font-medium transition-colors ${isActive ? 'text-brand-text' : 'text-brand-textMuted group-hover:text-brand-text'}`}>
                        {item.label}
                      </span>
                      <span className="text-[11px] text-brand-textMuted/70 truncate">
                        {item.description}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {item.badge && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? 'bg-brand-accent text-brand-bg shadow-[0_0_8px_rgba(0,209,255,0.4)]' : 'bg-brand-border/50 text-brand-text'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-2 border-t border-brand-border/20 pt-4 pb-4 w-full">
          {bottomMenuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.id as any)}
                className={`group flex w-full items-center gap-4 px-3 py-3 rounded-2xl text-left transition-all relative ${
                  isActive
                    ? 'bg-brand-accent/5'
                    : 'hover:bg-brand-border/20'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-brand-accent rounded-r-full shadow-[0_0_12px_rgba(0,209,255,0.8)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ${isActive ? 'text-brand-accent drop-shadow-[0_0_8px_rgba(0,209,255,0.5)]' : 'text-brand-textMuted group-hover:text-brand-text'}`}>
                   <Icon className="h-5 w-5" />
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex flex-col overflow-hidden whitespace-nowrap min-w-[140px]"
                    >
                      <span className={`text-[14px] font-medium transition-colors ${isActive ? 'text-brand-text' : 'text-brand-textMuted group-hover:text-brand-text'}`}>
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}

          {/* User Profile */}
          <div className="group flex items-center gap-4 px-3 py-3 mt-2 rounded-2xl cursor-pointer hover:bg-brand-border/20 transition-all overflow-hidden relative">
            <div className="h-8 w-8 rounded-full bg-brand-border/50 flex items-center justify-center shrink-0 border border-brand-border/50 group-hover:border-brand-accent/50 group-hover:shadow-[0_0_10px_rgba(0,209,255,0.2)] transition-all">
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
                  <span className="text-[14px] font-semibold text-brand-text group-hover:text-brand-accent transition-colors">Researcher</span>
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
