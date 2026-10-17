import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Search, Settings, LogOut, Menu, Network, ChevronDown, UserRound, Sun, Moon } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { setSearchQuery, setActivePage, toggleSidebar, isSidebarOpen, theme, toggleTheme } = useApp();
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [shortcut, setShortcut] = useState('Ctrl K');
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    setShortcut(isMac ? '⌘ K' : 'Ctrl K');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (avatarRef.current && !avatarRef.current.contains(target)) setIsAvatarOpen(false);
      if (bellRef.current && !bellRef.current.contains(target)) setIsBellOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setActivePage('search');
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[68px] shrink-0 items-center gap-2 border-b border-slate-200/80 bg-gradient-to-r from-white/95 via-[#FCFDFF]/92 to-white/95 dark:from-[#0B1222]/95 dark:via-[#0E172A]/92 dark:to-[#0B1222]/95 px-3 shadow-[0_4px_20px_-8px_rgba(37,99,235,0.08)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors duration-200 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
          {/* Sidebar Toggle Button with Liquid Glass Hover */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
            aria-expanded={isSidebarOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-blue-100 dark:hover:border-slate-700 hover:bg-gradient-to-br hover:from-blue-50/90 hover:to-indigo-50/50 dark:hover:bg-slate-800/80 hover:text-blue-700 dark:hover:text-white hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <Menu className="h-[21px] w-[21px]" />
          </button>

          {/* Brand Logo with Liquid Gradient Badge */}
          <button
            type="button"
            onClick={() => setActivePage('dashboard')}
            aria-label="ResearchGraph AI home"
            className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl p-1 pr-2 text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/30 dark:hover:from-blue-950/40 dark:hover:to-indigo-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/80 dark:border-blue-400/30 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.3)] transition-transform duration-200 group-hover:scale-105">
              <Network className="h-5 w-5" />
            </span>
            <span className="max-w-[122px] truncate text-[13px] font-extrabold tracking-tight text-slate-900 dark:text-white sm:max-w-none sm:text-[17px]">
              ResearchGraph <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">AI</span>
            </span>
          </button>

          {/* Central Search Bar with Liquid Frosted Glass */}
          <form role="search" onSubmit={submitSearch} className="group relative ml-auto flex min-w-0 w-full max-w-[720px] items-center">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              aria-label="Search papers, authors, and topics"
              placeholder="Search papers, authors, topics..."
              className="h-10 w-full rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-gradient-to-r from-[#F1F5F9]/80 via-[#F8FAFC]/90 to-[#F1F5F9]/80 dark:from-[#131D31]/90 dark:via-[#162238]/90 dark:to-[#131D31]/90 pl-10 pr-[82px] text-[13px] font-medium text-slate-900 dark:text-white outline-none backdrop-blur-md transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#162238] focus:ring-4 focus:ring-blue-500/15 focus:shadow-[0_4px_18px_rgba(37,99,235,0.1)] sm:h-11"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2 rounded-lg px-1.5 py-1 text-slate-400 transition-colors hover:text-blue-700 dark:hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <kbd className="rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shadow-2xs backdrop-blur-xs">{shortcut}</kbd>
            </button>
          </form>
        </div>

        {/* Right Action Icons with Liquid Colors */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Notifications with Liquid Dot */}
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setIsBellOpen(value => !value)}
              aria-label="Notifications"
              aria-expanded={isBellOpen}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-blue-100 dark:hover:border-slate-700 hover:bg-gradient-to-br hover:from-blue-50/90 hover:to-indigo-50/50 dark:hover:bg-slate-800/80 hover:text-blue-700 dark:hover:text-white hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white shadow-xs" />
            </button>
            {isBellOpen && (
              <div role="status" className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0E172A]/95 p-4 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.15)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Notifications</p>
                  <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">0 unread</span>
                </div>
                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">You&apos;re all caught up with research alerts.</p>
              </div>
            )}
          </div>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-600 dark:text-slate-300 transition-all duration-200 hover:border-amber-100 hover:bg-gradient-to-br hover:from-amber-50/90 hover:to-orange-50/50 hover:text-amber-600 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-amber-400 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            {theme === 'dark' ? (
              <Sun className="h-[19px] w-[19px] text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-[19px] w-[19px] text-slate-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* User Avatar with Liquid Gradient Border */}
          <div className="relative" ref={avatarRef}>
            <button
              type="button"
              onClick={() => setIsAvatarOpen(value => !value)}
              aria-label="Open user menu"
              aria-haspopup="menu"
              aria-expanded={isAvatarOpen}
              className="group flex items-center gap-1.5 rounded-full p-0.5 transition-all duration-200 hover:bg-blue-50/60 dark:hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 dark:border-blue-400/30 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-[11.5px] font-bold text-white shadow-[0_2px_8px_rgba(37,99,235,0.35)] ring-2 ring-white dark:ring-slate-800 sm:h-10 sm:w-10">
                JD
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 sm:block" />
            </button>
            {isAvatarOpen && (
              <div role="menu" className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0E172A]/95 py-1.5 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.15)] dark:shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="border-b border-slate-100 dark:border-slate-800 px-3.5 py-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. Jane Doe</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">jane.doe@research.edu</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setIsAvatarOpen(false); setIsProfileOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-blue-50/70 dark:hover:bg-slate-800/70 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  <UserRound className="h-4 w-4" />Profile & Workspace
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setIsAvatarOpen(false); setIsSettingsOpen(true); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-blue-50/70 dark:hover:bg-slate-800/70 hover:text-blue-700 dark:hover:text-blue-400"
                >
                  <Settings className="h-4 w-4" />Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setIsAvatarOpen(false); onLogout?.(); }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4" />Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
