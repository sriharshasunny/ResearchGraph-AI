import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FileText,
  Network,
  Columns3,
  Bookmark,
  BarChart3,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { mockAuthors } from '../data/mockData';

interface MenuItem {
  id: 'landing' | 'dashboard' | 'search' | 'chat' | 'graph' | 'lit-review' | 'compare' | 'details' | 'analytics' | 'profile' | 'saved';
  label: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, theme, toggleTheme, savedPaperIds, comparePaperIds } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search Papers', icon: Search },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'lit-review', label: 'Literature Review', icon: FileText },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    {
      id: 'compare',
      label: 'Paper Comparison',
      icon: Columns3,
      badge: comparePaperIds.length > 0 ? comparePaperIds.length : undefined
    },
    {
      id: 'saved',
      label: 'Saved Papers',
      icon: Bookmark,
      badge: savedPaperIds.length > 0 ? savedPaperIds.length : undefined
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen border-r border-slate-200/80 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl transition-colors duration-300 select-none z-30"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-slate-200/60 dark:border-slate-800/30">
        <div className="flex items-center gap-2 overflow-hidden" onClick={() => setActivePage('landing')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white cursor-pointer hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer whitespace-nowrap"
            >
              ResearchGraph AI
            </motion.span>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md hover:scale-110 transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const isActive = activePage === item.id || (item.id === 'profile' && activePage === 'profile');
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20 text-indigo-600 dark:text-indigo-400 shadow-sm border-l-4 border-indigo-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
              
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                  {item.label}
                </motion.span>
              )}

              {item.badge && !isCollapsed && (
                <span className="absolute right-3 top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/80 px-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-850">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info & Theme Toggle */}
      <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/30 bg-slate-50/40 dark:bg-slate-950/10">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all duration-200"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-5 w-5 text-amber-500 flex-shrink-0 animate-spin-slow" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>

        <div
          onClick={() => setActivePage('profile')}
          className="flex items-center gap-3 mt-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors duration-200 overflow-hidden"
        >
          <img
            src={mockAuthors[3].avatar}
            alt="User Avatar"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/30 flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col truncate leading-tight">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Dr. Sriharsha</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Academic Researcher</span>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
