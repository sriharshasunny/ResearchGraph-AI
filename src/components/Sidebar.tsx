import React, { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  BookOpen,
  Bookmark,
  ChevronRight,
  Clock3,
  GitCompare,
  Home,
  MessageSquare,
  Network,
  Search,
  UserRound,
} from 'lucide-react';
import type { PageType } from '../types';
import { ProfileModal } from './ProfileModal';

const navItems = [
  { id: 'dashboard', label: 'Home', rail: 'Home', description: 'Dashboard & overview', icon: Home, accent: 'text-blue-600 dark:text-blue-400 bg-gradient-to-br from-blue-100 to-blue-200/70 dark:from-blue-950/80 dark:to-blue-900/50 shadow-xs border border-white/80 dark:border-blue-500/20' },
  { id: 'search', label: 'Search', rail: 'Search', description: 'Find papers & authors', icon: Search, accent: 'text-fuchsia-600 dark:text-fuchsia-400 bg-gradient-to-br from-fuchsia-100 to-fuchsia-200/70 dark:from-fuchsia-950/80 dark:to-fuchsia-900/50 shadow-xs border border-white/80 dark:border-fuchsia-500/20' },
  { id: 'chat', label: 'Chat', rail: 'Chat', description: 'Ask research questions', icon: MessageSquare, accent: 'text-violet-600 dark:text-violet-400 bg-gradient-to-br from-violet-100 to-violet-200/70 dark:from-violet-950/80 dark:to-violet-900/50 shadow-xs border border-white/80 dark:border-violet-500/20' },
  { id: 'graph', label: 'Graph', rail: 'Graph', description: 'Explore knowledge graph', icon: Network, accent: 'text-emerald-600 dark:text-emerald-400 bg-gradient-to-br from-emerald-100 to-teal-200/70 dark:from-emerald-950/80 dark:to-teal-900/50 shadow-xs border border-white/80 dark:border-emerald-500/20' },
  { id: 'compare', label: 'Compare', rail: 'Compare', description: 'Compare papers & methods', icon: GitCompare, accent: 'text-amber-600 dark:text-amber-400 bg-gradient-to-br from-amber-100 to-orange-200/70 dark:from-amber-950/80 dark:to-orange-900/50 shadow-xs border border-white/80 dark:border-amber-500/20' },
  { id: 'literature', label: 'Review', rail: 'Review', description: 'Read & take notes', icon: BookOpen, accent: 'text-purple-600 dark:text-purple-400 bg-gradient-to-br from-purple-100 to-purple-200/70 dark:from-purple-950/80 dark:to-purple-900/50 shadow-xs border border-white/80 dark:border-purple-500/20' },
  { id: 'gaps', label: 'Gaps', rail: 'Gaps', description: 'Find research opportunities', icon: Activity, accent: 'text-cyan-600 dark:text-cyan-400 bg-gradient-to-br from-cyan-100 to-cyan-200/70 dark:from-cyan-950/80 dark:to-cyan-900/50 shadow-xs border border-white/80 dark:border-cyan-500/20' },
  { id: 'saved', label: 'Saved', rail: 'Saved', description: 'Your saved papers', icon: Bookmark, accent: 'text-rose-600 dark:text-rose-400 bg-gradient-to-br from-rose-100 to-rose-200/70 dark:from-rose-950/80 dark:to-rose-900/50 shadow-xs border border-white/80 dark:border-rose-500/20' },
  { id: 'history', label: 'History', rail: 'History', description: 'Recent activity', icon: Clock3, accent: 'text-indigo-600 dark:text-indigo-400 bg-gradient-to-br from-indigo-100 to-indigo-200/70 dark:from-indigo-950/80 dark:to-indigo-900/50 shadow-xs border border-white/80 dark:border-indigo-500/20' },
] as const;

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  const handleNavClick = useCallback((id: string) => {
    setActivePage(id as PageType);
    if (isSidebarOpen) toggleSidebar();
  }, [isSidebarOpen, setActivePage, toggleSidebar]);

  const navigation = (
    <>
      <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden py-3">
        <div className="flex flex-col gap-1 px-2">
          {navItems.map(({ id, label, rail, description, icon: Icon, accent }) => {
            const isActive = activePage === id || (id === 'search' && (activePage === 'papers' || activePage === 'details'));
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 16 })}
                onMouseLeave={() => setTooltip(null)}
                onFocus={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 16 })}
                onBlur={() => setTooltip(null)}
                className={`group relative flex items-center rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                  isSidebarOpen
                    ? 'h-[54px] w-full px-2.5'
                    : 'mx-auto h-[56px] w-full flex-col justify-center px-1'
                } ${
                  isActive
                    ? 'border border-blue-200/70 dark:border-blue-500/30 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-violet-500/10 dark:from-blue-600/25 dark:via-indigo-600/20 dark:to-violet-600/15 text-blue-700 dark:text-blue-400 shadow-xs before:absolute before:inset-y-2 before:left-0 before:w-[3.5px] before:rounded-r-full before:bg-gradient-to-b before:from-blue-600 before:to-indigo-500'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gradient-to-r hover:from-slate-100/90 hover:via-blue-50/50 hover:to-indigo-50/30 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center min-w-0 w-full">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-transform duration-150 group-hover:scale-105 ${accent} ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                    <Icon className="h-[18px] w-[18px] stroke-[2]" />
                  </span>
                  <div
                    className={`min-w-0 overflow-hidden text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isSidebarOpen
                        ? 'max-w-44 ml-3 opacity-100 translate-x-0'
                        : 'max-w-0 ml-0 opacity-0 -translate-x-2 pointer-events-none'
                    }`}
                  >
                    <span className="block truncate text-[13px] font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                    <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{description}</span>
                  </div>
                  {isSidebarOpen && (
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  )}
                </div>
                {!isSidebarOpen && (
                  <span className="mt-1 block text-[10px] font-medium leading-none text-slate-600 dark:text-slate-400">
                    {rail}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Account Section - Only Account icon kept with liquid glass styling */}
      <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/40 px-2 py-2.5">
        <div className="flex flex-col gap-1">
          {isSidebarOpen && <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Account</p>}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            aria-label="Account profile"
            onMouseEnter={event => !isSidebarOpen && setTooltip({ label: 'Account', top: event.currentTarget.getBoundingClientRect().top + 16 })}
            onMouseLeave={() => setTooltip(null)}
            onFocus={event => !isSidebarOpen && setTooltip({ label: 'Account', top: event.currentTarget.getBoundingClientRect().top + 16 })}
            onBlur={() => setTooltip(null)}
            className={`group relative flex items-center rounded-xl text-slate-600 dark:text-slate-300 transition-colors duration-150 hover:bg-gradient-to-r hover:from-sky-50/90 hover:via-blue-50/60 hover:to-indigo-50/40 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              isSidebarOpen ? 'h-[52px] w-full px-2.5' : 'mx-auto h-[54px] w-full flex-col justify-center px-1'
            }`}
          >
            <div className="flex items-center min-w-0 w-full">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/80 dark:border-slate-700 bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 dark:from-sky-950 dark:via-blue-900/60 dark:to-indigo-950 text-sky-600 dark:text-sky-400 shadow-xs transition-transform duration-150 group-hover:scale-105 ${!isSidebarOpen ? 'mx-auto' : ''}`}>
                <UserRound className="h-[18px] w-[18px] stroke-[2]" />
              </span>
              <div
                className={`min-w-0 overflow-hidden text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSidebarOpen
                    ? 'max-w-44 ml-3 opacity-100 translate-x-0'
                    : 'max-w-0 ml-0 opacity-0 -translate-x-2 pointer-events-none'
                }`}
              >
                <span className="block truncate text-[13px] font-semibold text-slate-800 dark:text-slate-200">Account</span>
                <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">Profile & Workspace</span>
              </div>
              {isSidebarOpen && (
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              )}
            </div>
            {!isSidebarOpen && (
              <span className="mt-1 block text-[10px] font-medium leading-none text-slate-600 dark:text-slate-400">
                Profile
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={toggleSidebar}
          className="fixed inset-x-0 bottom-0 top-[68px] z-30 cursor-default bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      <div className="relative z-40 hidden w-[80px] shrink-0 md:block">
        <aside
          aria-label="Primary navigation"
          className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-[#FCFDFF] to-[#F5F8FF] dark:from-[#0B1222] dark:via-[#0E172A] dark:to-[#080E1A] text-slate-900 dark:text-slate-100 shadow-[6px_0_24px_-12px_rgba(37,99,235,0.12)] dark:shadow-[6px_0_24px_-12px_rgba(0,0,0,0.5)] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width] [transform:translateZ(0)] ${
            isSidebarOpen ? 'w-[260px]' : 'w-[80px]'
          }`}
        >
          {navigation}
        </aside>
      </div>

      <aside
        aria-label="Mobile navigation"
        className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[260px] max-w-[85vw] flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-[#FCFDFF] to-[#F5F8FF] dark:from-[#0B1222] dark:via-[#0E172A] dark:to-[#080E1A] text-slate-900 dark:text-slate-100 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navigation}
      </aside>

      {tooltip && !isSidebarOpen && (
        <span
          role="tooltip"
          className="pointer-events-none fixed left-[90px] z-[60] -translate-y-1/2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg transition-opacity duration-150"
          style={{ top: tooltip.top }}
        >
          {tooltip.label}
        </span>
      )}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
