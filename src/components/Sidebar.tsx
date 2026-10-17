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
  Settings,
  UserRound,
} from 'lucide-react';
import type { PageType } from '../types';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';

const navItems = [
  { id: 'dashboard', label: 'Home', rail: 'Home', description: 'Dashboard & overview', icon: Home, accent: 'text-blue-600 bg-blue-100/80' },
  { id: 'search', label: 'Search', rail: 'Search', description: 'Find papers & authors', icon: Search, accent: 'text-fuchsia-600 bg-fuchsia-100/80' },
  { id: 'chat', label: 'Chat', rail: 'Chat', description: 'Ask research questions', icon: MessageSquare, accent: 'text-violet-600 bg-violet-100/80' },
  { id: 'graph', label: 'Graph', rail: 'Graph', description: 'Explore knowledge graph', icon: Network, accent: 'text-emerald-600 bg-emerald-100/80' },
  { id: 'compare', label: 'Compare', rail: 'Compare', description: 'Compare papers & methods', icon: GitCompare, accent: 'text-orange-500 bg-orange-100/80' },
  { id: 'literature', label: 'Review', rail: 'Review', description: 'Read & take notes', icon: BookOpen, accent: 'text-purple-600 bg-purple-100/80' },
  { id: 'gaps', label: 'Gaps', rail: 'Gaps', description: 'Find research opportunities', icon: Activity, accent: 'text-cyan-600 bg-cyan-100/80' },
  { id: 'saved', label: 'Saved', rail: 'Saved', description: 'Your saved papers', icon: Bookmark, accent: 'text-rose-600 bg-rose-100/80' },
  { id: 'history', label: 'History', rail: 'History', description: 'Recent activity', icon: Clock3, accent: 'text-amber-500 bg-amber-100/80' },
] as const;

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  const handleNavClick = useCallback((id: string) => {
    setActivePage(id as PageType);
    if (isSidebarOpen) toggleSidebar();
  }, [isSidebarOpen, setActivePage, toggleSidebar]);

  const utilityButton = (label: string, description: string, Icon: typeof Settings, onClick: () => void, accent: string) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 20 })}
      onMouseLeave={() => setTooltip(null)}
      onFocus={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 20 })}
      onBlur={() => setTooltip(null)}
      className={`relative flex items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSidebarOpen ? 'min-h-[58px] w-full gap-3 px-3.5' : 'mx-auto h-10 w-10 justify-center'}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${accent}`}>
        <Icon className="h-[18px] w-[18px] stroke-[1.9]" />
      </span>
      <span className={`min-w-0 overflow-hidden text-left transition-all duration-200 ${isSidebarOpen ? 'max-w-52 opacity-100' : 'max-w-0 opacity-0'}`}>
        <span className="block truncate text-[13px] font-semibold text-slate-800">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] text-slate-500">{description}</span>
      </span>
      {isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />}
    </button>
  );

  const navigation = (
    <>
      <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden py-3">
        <div className="flex flex-col gap-1.5 px-2.5">
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
                className={`relative flex items-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSidebarOpen ? 'min-h-[62px] w-full gap-3 px-3.5' : 'mx-auto h-[64px] w-full flex-col justify-center gap-1 px-1'} ${isActive ? 'bg-[linear-gradient(105deg,#EFF5FF,#E9F1FF)] text-blue-700 shadow-[0_5px_14px_-12px_rgba(37,99,235,.55)] before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${accent}`}>
                  <Icon className="h-[18px] w-[18px] stroke-[1.9]" />
                </span>
                <span className={`min-w-0 overflow-hidden font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-52 text-left opacity-100' : 'max-w-full whitespace-normal text-center text-[10px] leading-tight opacity-100'}`}>
                  <span className={`block truncate ${isSidebarOpen ? 'text-[13px] font-semibold text-slate-800' : ''}`}>{isSidebarOpen ? label : rail}</span>
                  {isSidebarOpen && <span className="mt-0.5 block truncate text-[11px] font-normal text-slate-500">{description}</span>}
                </span>
                {isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />}
              </button>
            );
          })}
        </div>
      </nav>
      <div className="shrink-0 border-t border-slate-200 px-2.5 py-3">
        <div className="flex flex-col gap-1">
          {isSidebarOpen && <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Account</p>}
          {utilityButton('Profile', 'View and edit profile', UserRound, () => setIsProfileOpen(true), 'text-sky-600 bg-sky-100/80')}
          {utilityButton('Settings', 'Preferences & privacy', Settings, () => setIsSettingsOpen(true), 'text-violet-600 bg-violet-100/80')}
        </div>
      </div>
    </>
  );

  return (
    <>
      {isSidebarOpen && <button type="button" aria-label="Close navigation menu" onClick={toggleSidebar} className="fixed inset-x-0 bottom-0 top-[68px] z-30 cursor-default bg-slate-950/20" />}

      <div className="relative z-40 hidden w-[88px] shrink-0 md:block">
        <aside
          aria-label="Primary navigation"
          className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 shadow-[12px_0_34px_-26px_rgba(15,23,42,0.42)] transition-[width] duration-[240ms] ease-out ${isSidebarOpen ? 'w-[340px]' : 'w-[88px]'}`}
        >
          {navigation}
        </aside>
      </div>

      <aside
        aria-label="Mobile navigation"
        className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[340px] max-w-[88vw] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-[240ms] ease-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {navigation}
      </aside>

      {tooltip && !isSidebarOpen && <span role="tooltip" className="pointer-events-none fixed left-[98px] z-[60] -translate-y-1/2 rounded-md border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg" style={{ top: tooltip.top }}>{tooltip.label}</span>}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

