import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const topMenuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'search', label: 'Research Search', icon: Search },
    { id: 'chat', label: 'AI Research Assistant', icon: Bot },
    { id: 'search', label: 'Papers', icon: Library }, // Mapping Papers to search for now
    { id: 'lit-review', label: 'Literature Review', icon: BookOpen },
    {
      id: 'compare',
      label: 'Paper Comparison',
      icon: Columns,
      badge: comparePaperIds.length > 0 ? comparePaperIds.length : undefined
    },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'analytics', label: 'Research Gaps', icon: Lightbulb },
    {
      id: 'saved',
      label: 'Saved Papers',
      icon: Bookmark,
      badge: savedPaperIds.length > 0 ? savedPaperIds.length : undefined
    },
    { id: 'profile', label: 'History', icon: History }, // Mapping History to profile for now
  ];

  const bottomMenuItems = [
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: isCollapsed ? '68px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 }}
      className="relative flex flex-col h-screen border-r border-brand-border bg-brand-surface z-30 shrink-0"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActivePage('landing')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-text text-brand-surface shrink-0">
            <Hexagon className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[15px] font-semibold text-brand-text whitespace-nowrap tracking-tight"
            >
              ResearchGraph
            </motion.span>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-textMuted hover:text-brand-text shadow-sm hover:scale-105 transition-all"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-thin px-3 py-4">
        <nav className="space-y-1">
          {topMenuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.id as any)}
                className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors relative ${
                  isActive
                    ? 'bg-brand-bg text-brand-text'
                    : 'text-brand-textMuted hover:bg-brand-bg hover:text-brand-text'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-brand-accent' : ''}`} />
                
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                    {item.label}
                  </motion.span>
                )}

                {item.badge && !isCollapsed && (
                  <span className="absolute right-3 top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-border px-1 text-[9px] font-semibold text-brand-text">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-1">
          {bottomMenuItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => setActivePage(item.id as any)}
                className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-bg text-brand-text'
                    : 'text-brand-textMuted hover:bg-brand-bg hover:text-brand-text'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-brand-accent' : ''}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* User Profile */}
          <div className="flex items-center gap-3 mt-4 px-2 py-2 rounded-lg cursor-pointer hover:bg-brand-bg transition-colors overflow-hidden">
            <div className="h-7 w-7 rounded-full bg-brand-border flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-brand-textMuted" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate leading-tight">
                <span className="text-[13px] font-semibold text-brand-text truncate">User Profile</span>
                <span className="text-[11px] text-brand-textMuted truncate">Free Plan</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
