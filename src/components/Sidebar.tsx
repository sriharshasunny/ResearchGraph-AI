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
  { id: 'dashboard', label: 'Home', rail: 'Home', description: 'Dashboard & overview', icon: Home, accent: 'text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200/70 shadow-xs border border-white/80' },
  { id: 'search', label: 'Search', rail: 'Search', description: 'Find papers & authors', icon: Search, accent: 'text-fuchsia-600 bg-gradient-to-br from-fuchsia-100 to-fuchsia-200/70 shadow-xs border border-white/80' },
  { id: 'chat', label: 'Chat', rail: 'Chat', description: 'Ask research questions', icon: MessageSquare, accent: 'text-violet-600 bg-gradient-to-br from-violet-100 to-violet-200/70 shadow-xs border border-white/80' },
  { id: 'graph', label: 'Graph', rail: 'Graph', description: 'Explore knowledge graph', icon: Network, accent: 'text-emerald-600 bg-gradient-to-br from-emerald-100 to-teal-200/70 shadow-xs border border-white/80' },
  { id: 'compare', label: 'Compare', rail: 'Compare', description: 'Compare papers & methods', icon: GitCompare, accent: 'text-amber-600 bg-gradient-to-br from-amber-100 to-orange-200/70 shadow-xs border border-white/80' },
  { id: 'literature', label: 'Review', rail: 'Review', description: 'Read & take notes', icon: BookOpen, accent: 'text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200/70 shadow-xs border border-white/80' },
  { id: 'gaps', label: 'Gaps', rail: 'Gaps', description: 'Find research opportunities', icon: Activity, accent: 'text-cyan-600 bg-gradient-to-br from-cyan-100 to-cyan-200/70 shadow-xs border border-white/80' },
  { id: 'saved', label: 'Saved', rail: 'Saved', description: 'Your saved papers', icon: Bookmark, accent: 'text-rose-600 bg-gradient-to-br from-rose-100 to-rose-200/70 shadow-xs border border-white/80' },
  { id: 'history', label: 'History', rail: 'History', description: 'Recent activity', icon: Clock3, accent: 'text-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200/70 shadow-xs border border-white/80' },
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
        <div className="flex flex-col gap-1.5 px-2">
          {navItems.map(({ id, label, rail, description, icon: Icon, accent }) => {
            const isActive = activePage === id || (id === 'search' && (activePage === 'papers' || activePage === 'details'));
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavClick(id)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 20 })}
                onMouseLeave={() => setTooltip(null)}
                onFocus={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 20 })}
                onBlur={() => setTooltip(null)}
                className={`group relative flex items-center rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSidebarOpen ? 'min-h-[62px] w-full gap-2.5 px-3' : 'mx-auto h-[64px] w-full flex-col justify-center gap-1 px-1'} ${isActive ? 'border border-blue-200/70 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-violet-500/10 text-blue-700 shadow-[0_4px_16px_-4px_rgba(37,99,235,0.22)] before:absolute before:inset-y-2.5 before:left-0 before:w-[3.5px] before:rounded-r-full before:bg-gradient-to-b before:from-blue-600 before:to-indigo-500' : 'text-slate-600 hover:bg-gradient-to-r hover:from-slate-100/90 hover:via-blue-50/50 hover:to-indigo-50/30 hover:text-slate-950'}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${accent}`}>
                  <Icon className="h-[18px] w-[18px] stroke-[2]" />
                </span>
                <span className={`min-w-0 overflow-hidden font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-44 text-left opacity-100' : 'max-w-full whitespace-normal text-center text-[10px] leading-tight opacity-100'}`}>
                  <span className={`block truncate ${isSidebarOpen ? 'text-[13px] font-semibold text-slate-800' : ''}`}>{isSidebarOpen ? label : rail}</span>
                  {isSidebarOpen && <span className="mt-0.5 block truncate text-[11px] font-normal text-slate-500">{description}</span>}
                </span>
                {isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Account Section - Only Account icon kept with liquid glass styling */}
      <div className="shrink-0 border-t border-slate-200/80 bg-gradient-to-b from-transparent to-slate-50/50 px-2 py-3">
        <div className="flex flex-col gap-1">
          {isSidebarOpen && <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Account</p>}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            aria-label="Account profile"
            onMouseEnter={event => !isSidebarOpen && setTooltip({ label: 'Account', top: event.currentTarget.getBoundingClientRect().top + 20 })}
            onMouseLeave={() => setTooltip(null)}
            onFocus={event => !isSidebarOpen && setTooltip({ label: 'Account', top: event.currentTarget.getBoundingClientRect().top + 20 })}
            onBlur={() => setTooltip(null)}
            className={`group relative flex items-center rounded-xl text-slate-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-sky-50/90 hover:via-blue-50/60 hover:to-indigo-50/40 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSidebarOpen ? 'min-h-[58px] w-full gap-2.5 px-3' : 'mx-auto h-10 w-10 justify-center'}`}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/80 bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 text-sky-600 shadow-xs transition-transform duration-200 group-hover:scale-105">
              <UserRound className="h-[18px] w-[18px] stroke-[2]" />
            </span>
            <span className={`min-w-0 overflow-hidden text-left transition-all duration-200 ${isSidebarOpen ? 'max-w-44 opacity-100' : 'max-w-0 opacity-0'}`}>
              <span className="block truncate text-[13px] font-semibold text-slate-800">Account</span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500">Profile & Workspace</span>
            </span>
            {isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isSidebarOpen && <button type="button" aria-label="Close navigation menu" onClick={toggleSidebar} className="fixed inset-x-0 bottom-0 top-[68px] z-30 cursor-default bg-slate-950/20 backdrop-blur-xs" />}

      <div className="relative z-40 hidden w-[88px] shrink-0 md:block">
        <aside
          aria-label="Primary navigation"
          className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-slate-200/80 bg-gradient-to-b from-white via-[#FCFDFF] to-[#F5F8FF] text-slate-900 shadow-[10px_0_32px_-20px_rgba(37,99,235,0.18)] backdrop-blur-xl transition-[width] duration-[240ms] ease-out ${isSidebarOpen ? 'w-[289px]' : 'w-[88px]'}`}
        >
          {navigation}
        </aside>
      </div>

      <aside
        aria-label="Mobile navigation"
        className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[289px] max-w-[85vw] flex-col border-r border-slate-200/80 bg-gradient-to-b from-white via-[#FCFDFF] to-[#F5F8FF] text-slate-900 shadow-2xl backdrop-blur-xl transition-transform duration-[240ms] ease-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {navigation}
      </aside>

      {tooltip && !isSidebarOpen && <span role="tooltip" className="pointer-events-none fixed left-[98px] z-[60] -translate-y-1/2 rounded-md border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg" style={{ top: tooltip.top }}>{tooltip.label}</span>}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
