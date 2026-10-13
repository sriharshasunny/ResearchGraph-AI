import React, { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  BookOpen,
  Bookmark,
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
  { id: 'dashboard', label: 'Home', rail: 'Home', icon: Home },
  { id: 'search', label: 'Search Papers', rail: 'Search', icon: Search },
  { id: 'chat', label: 'AI Research Assistant', rail: 'Chat', icon: MessageSquare },
  { id: 'graph', label: 'Knowledge Graph', rail: 'Graph', icon: Network },
  { id: 'compare', label: 'Compare Papers', rail: 'Compare', icon: GitCompare },
  { id: 'literature', label: 'Literature Review', rail: 'Review', icon: BookOpen },
  { id: 'gaps', label: 'Research Gaps', rail: 'Gaps', icon: Activity },
  { id: 'saved', label: 'Saved Papers', rail: 'Saved', icon: Bookmark },
  { id: 'history', label: 'History', rail: 'History', icon: Clock3 },
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

  const utilityButton = (label: string, Icon: typeof Settings, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 20 })}
      onMouseLeave={() => setTooltip(null)}
      onFocus={event => !isSidebarOpen && setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 20 })}
      onBlur={() => setTooltip(null)}
      className={`relative flex h-10 items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-10 justify-center'}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.8]" />
      <span className={`overflow-hidden whitespace-nowrap text-left text-xs font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-44 opacity-100' : 'max-w-0 opacity-0'}`}>{label}</span>
    </button>
  );

  const navigation = (
    <>
      <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden py-3">
        <div className="flex flex-col gap-1 px-2">
          {navItems.map(({ id, label, rail, icon: Icon }) => {
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
                className={`relative flex items-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSidebarOpen ? 'h-10 w-full gap-3 px-3' : 'mx-auto h-[64px] w-full flex-col justify-center gap-1 px-1'} ${isActive ? 'bg-blue-50 text-blue-700 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                <Icon className="h-5 w-5 shrink-0 stroke-[1.8]" />
                <span className={`overflow-hidden font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-48 whitespace-nowrap text-left text-xs opacity-100' : 'max-w-full whitespace-normal text-center text-[10px] leading-tight opacity-100'}`}>{isSidebarOpen ? label : rail}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <div className="shrink-0 border-t border-slate-200 px-2.5 py-3">
        <div className="flex flex-col gap-1">
          {utilityButton('Profile', UserRound, () => setIsProfileOpen(true))}
          {utilityButton('Settings', Settings, () => setIsSettingsOpen(true))}
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
          className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 shadow-[8px_0_28px_-24px_rgba(15,23,42,0.35)] transition-[width] duration-[240ms] ease-out ${isSidebarOpen ? 'w-[250px]' : 'w-[88px]'}`}
        >
          {navigation}
        </aside>
      </div>

      <aside
        aria-label="Mobile navigation"
        className={`fixed bottom-0 left-0 top-[68px] z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white text-slate-900 shadow-2xl transition-transform duration-[240ms] ease-out md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {navigation}
      </aside>

      {tooltip && !isSidebarOpen && <span role="tooltip" className="pointer-events-none fixed left-[98px] z-[60] -translate-y-1/2 rounded-md border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg" style={{ top: tooltip.top }}>{tooltip.label}</span>}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

