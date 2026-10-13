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
      className={`relative flex h-12 items-center rounded-[14px] text-slate-500 transition duration-150 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-12 justify-center'}`}
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
        className="absolute inset-y-0 left-0 flex flex-col border-r border-slate-200 bg-white text-slate-700 shadow-[8px_0_28px_-24px_rgba(15,23,42,0.22)]"
      >
        <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className="flex flex-col gap-4">
            {navGroups.map(group => (
              <div key={group.title}>
                {isSidebarOpen && (
                    <p className="mb-1 px-5 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
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
                        className={`relative flex h-12 items-center rounded-[14px] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ${isSidebarOpen ? 'w-full gap-3 px-3' : 'mx-auto w-12 justify-center'} ${isActive ? 'bg-blue-50 text-blue-700 shadow-[inset_3px_0_0_#2563eb]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
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

        <div className="shrink-0 border-t border-slate-200 px-3 py-3">
          <div className="flex flex-col gap-1">
            {renderUtilityButton('Settings', Settings, () => setIsSettingsOpen(true))}
            {renderUtilityButton('Profile', UserRound, () => setIsProfileOpen(true))}
          </div>
        </div>
      </aside>

      {tooltip && !isSidebarOpen && (
        <span
          role="tooltip"
          className="pointer-events-none fixed left-[86px] z-[60] -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 opacity-100 shadow-lg"
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

