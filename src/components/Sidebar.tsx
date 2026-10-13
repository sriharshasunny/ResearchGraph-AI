import React, { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  BookOpen,
  Bookmark,
  Clock3,
  FileText,
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

const navGroups = [
  {
    title: 'Discover',
    items: [
      { id: 'dashboard', label: 'Home', icon: Home },
      { id: 'search', label: 'Search', icon: Search },
      { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    ],
  },
  {
    title: 'Library',
    items: [
      { id: 'papers', label: 'Papers', icon: FileText },
      { id: 'saved', label: 'Saved Papers', icon: Bookmark },
    ],
  },
  {
    title: 'Analyze',
    items: [
      { id: 'compare', label: 'Compare', icon: GitCompare },
      { id: 'graph', label: 'Knowledge Graph', icon: Network },
      { id: 'literature', label: 'Literature Review', icon: BookOpen },
      { id: 'gaps', label: 'Research Gaps', icon: Activity },
    ],
  },
  {
    title: 'Activity',
    items: [{ id: 'history', label: 'History', icon: Clock3 }],
  },
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
    if (isSidebarOpen) toggleSidebar();
  }, [setActivePage, isSidebarOpen, toggleSidebar]);

  const renderUtilityButton = (label: string, Icon: typeof Settings, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={event => showTooltip(label, event)}
      onMouseLeave={() => setTooltip(null)}
      onFocus={event => showTooltip(label, event)}
      onBlur={() => setTooltip(null)}
      className={`relative flex h-12 items-center rounded-[14px] text-white/60 transition duration-150 hover:scale-[1.03] hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-12 justify-center'}`}
    >
      <Icon className="h-[22px] w-[22px] shrink-0 stroke-[1.9]" />
      <span className={`overflow-hidden whitespace-nowrap text-left text-[13px] font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}`}>{label}</span>
    </button>
  );

  return (
    <div className="relative z-30 w-[76px] shrink-0">
      <div
        onClick={toggleSidebar}
        aria-hidden="true"
        className={`fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 ${isSidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        style={{ zIndex: 20 }}
      />

      <aside
        style={{
          width: isSidebarOpen ? 250 : 76,
          transition: 'width 0.26s cubic-bezier(0.2, 0.8, 0.2, 1)',
          zIndex: 30,
        }}
        className="absolute inset-y-0 left-0 flex flex-col border-r border-white/[0.07] bg-[#071326] text-white shadow-[8px_0_28px_-24px_rgba(2,8,23,0.7)]"
      >
        <div className={`flex h-[68px] shrink-0 items-center border-b border-white/[0.07] ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'}`}>
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            aria-label="ResearchGraph AI home"
            onMouseEnter={event => showTooltip('ResearchGraph AI', event)}
            onMouseLeave={() => setTooltip(null)}
            onFocus={event => showTooltip('ResearchGraph AI', event)}
            onBlur={() => setTooltip(null)}
            className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-300 transition hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
          >
            <Network className="h-[21px] w-[21px] stroke-[1.8]" />
          </button>
          {isSidebarOpen && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold tracking-tight text-white">ResearchGraph <span className="text-blue-300">AI</span></p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Research workspace</p>
            </div>
          )}
        </div>

        <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className="flex flex-col gap-4">
            {navGroups.map(group => (
              <div key={group.title}>
                {isSidebarOpen && (
                  <p className="mb-1 px-5 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    {group.title}
                  </p>
                )}
                <div className="flex flex-col gap-1 px-3">
                  {group.items.map(({ id, label, icon: Icon }) => {
                    const isActive = activePage === id || (id === 'papers' && activePage === 'details');
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
                        className={`relative flex h-12 items-center rounded-[14px] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-12 justify-center'} ${isActive ? 'bg-blue-600 text-white shadow-[0_6px_18px_-10px_rgba(37,99,235,0.9)]' : 'text-white/60 hover:scale-[1.03] hover:bg-white/[0.08] hover:text-white'}`}
                      >
                        <Icon className={`h-[22px] w-[22px] shrink-0 stroke-[1.9] ${isActive ? 'text-white' : ''}`} />
                        <span className={`overflow-hidden whitespace-nowrap text-left text-[13px] font-medium transition-all duration-200 ${isSidebarOpen ? 'max-w-40 opacity-100' : 'max-w-0 opacity-0'}`}>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/[0.07] px-3 py-3">
          <div className="flex flex-col gap-1">
            {renderUtilityButton('Settings', Settings, () => setIsSettingsOpen(true))}
            {renderUtilityButton('Profile', UserRound, () => setIsProfileOpen(true))}
          </div>
        </div>
      </aside>

      {tooltip && !isSidebarOpen && (
        <span
          role="tooltip"
          className="pointer-events-none fixed left-[86px] z-[60] -translate-y-1/2 rounded-lg border border-white/10 bg-[#0F172A] px-2.5 py-1.5 text-xs font-medium text-white opacity-100 shadow-lg"
          style={{ top: tooltip.top }}
        >
          {tooltip.label}
        </span>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

