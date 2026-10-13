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
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'search', label: 'Search Papers', icon: Search },
  { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'compare', label: 'Compare Papers', icon: GitCompare },
  { id: 'literature', label: 'Literature Review', icon: BookOpen },
  { id: 'gaps', label: 'Research Gaps', icon: Activity },
  { id: 'saved', label: 'Saved Papers', icon: Bookmark },
  { id: 'history', label: 'History', icon: Clock3 },
] as const;

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  const showTooltip = (label: string, event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    if (!isSidebarOpen) setTooltip({ label, top: event.currentTarget.getBoundingClientRect().top + 24 });
  };

  const handleNavClick = useCallback((id: string) => {
    setActivePage(id as PageType);
    if (!window.matchMedia('(min-width: 768px)').matches && isSidebarOpen) toggleSidebar();
  }, [isSidebarOpen, setActivePage, toggleSidebar]);

  const utilityButton = (label: string, Icon: typeof Settings, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={event => showTooltip(label, event)}
      onMouseLeave={() => setTooltip(null)}
      onFocus={event => showTooltip(label, event)}
      onBlur={() => setTooltip(null)}
      className={`relative flex h-10 items-center rounded-lg text-slate-300 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-10 justify-center'}`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.8]" />
      <span className={`overflow-hidden whitespace-nowrap text-left text-[12px] font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}`}>{label}</span>
    </button>
  );

  return (
    <>
      <div className={`relative z-30 hidden shrink-0 transition-[width] duration-300 md:block ${isSidebarOpen ? 'md:w-[250px]' : 'md:w-[76px]'}`}>
        <aside
          style={{ width: isSidebarOpen ? 250 : 76 }}
          className="absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-white/[0.08] bg-[#071326] text-white shadow-[8px_0_28px_-24px_rgba(2,8,23,0.7)] transition-[width] duration-300"
        >
          <button type="button" onClick={() => handleNavClick('dashboard')} aria-label="ResearchGraph AI home" className={`flex h-[64px] shrink-0 items-center border-b border-white/[0.07] text-left ${isSidebarOpen ? 'gap-3 px-5' : 'justify-center'}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cyan-300"><Network className="h-6 w-6 stroke-[1.7]" /></span>
            {isSidebarOpen && <span className="min-w-0 whitespace-nowrap text-[12px] font-semibold tracking-tight">ResearchGraph <span className="text-blue-300">AI</span></span>}
          </button>

          <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden py-3">
            <div className="flex flex-col gap-1 px-2.5">
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = activePage === id || (id === 'search' && (activePage === 'papers' || activePage === 'details'));
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleNavClick(id)}
                    aria-label={label}
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={event => showTooltip(label, event)}
                    onMouseLeave={() => setTooltip(null)}
                    onFocus={event => showTooltip(label, event)}
                    onBlur={() => setTooltip(null)}
                    className={`relative flex h-10 items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-10 justify-center'} ${isActive ? 'bg-blue-600 text-white shadow-[0_6px_18px_-10px_rgba(37,99,235,0.9)]' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.8]" />
                    <span className={`overflow-hidden whitespace-nowrap text-left text-[12px] font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-44 opacity-100' : 'max-w-0 opacity-0'}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="shrink-0 border-t border-white/[0.08] px-2.5 py-3">
            <div className="flex flex-col gap-1">
              {utilityButton('Profile', UserRound, () => setIsProfileOpen(true))}
              {utilityButton('Settings', Settings, () => setIsSettingsOpen(true))}
            </div>
          </div>
        </aside>
      </div>

      {isSidebarOpen && <button type="button" aria-label="Close navigation menu" onClick={toggleSidebar} className="fixed inset-0 z-[45] bg-slate-950/45 md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-white/[0.08] bg-[#071326] text-white shadow-2xl transition-transform duration-300 md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Mobile navigation">
        <button type="button" onClick={() => handleNavClick('dashboard')} className="flex h-[64px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 text-left" aria-label="ResearchGraph AI home">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-cyan-300"><Network className="h-6 w-6 stroke-[1.7]" /></span>
          <span className="text-[12px] font-semibold tracking-tight">ResearchGraph <span className="text-blue-300">AI</span></span>
        </button>
        <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto py-3">
          <div className="flex flex-col gap-1 px-2.5">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activePage === id || (id === 'search' && (activePage === 'papers' || activePage === 'details'));
              return <button key={id} type="button" onClick={() => handleNavClick(id)} aria-current={isActive ? 'page' : undefined} className={`flex h-10 items-center gap-3 rounded-lg px-3 text-left text-[12px] font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/[0.07]'}`}><Icon className="h-[18px] w-[18px]" />{label}</button>;
            })}
          </div>
        </nav>
        <div className="flex flex-col gap-1 border-t border-white/[0.08] px-2.5 py-3">
          <button type="button" onClick={() => { setIsProfileOpen(true); toggleSidebar(); }} className="flex h-10 items-center gap-3 rounded-lg px-3 text-left text-xs text-slate-300 hover:bg-white/[0.07]"><UserRound className="h-[18px] w-[18px]" />Profile</button>
          <button type="button" onClick={() => { setIsSettingsOpen(true); toggleSidebar(); }} className="flex h-10 items-center gap-3 rounded-lg px-3 text-left text-xs text-slate-300 hover:bg-white/[0.07]"><Settings className="h-[18px] w-[18px]" />Settings</button>
        </div>
      </aside>

      {tooltip && !isSidebarOpen && <span role="tooltip" className="pointer-events-none fixed left-[86px] z-[60] hidden -translate-y-1/2 rounded-md border border-white/10 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg md:block" style={{ top: tooltip.top }}>{tooltip.label}</span>}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

