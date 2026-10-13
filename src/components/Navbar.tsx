import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Search, Settings, LogOut, Menu, Network, ChevronDown, UserRound } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { setSearchQuery, setActivePage, toggleSidebar, isSidebarOpen } = useApp();
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
      <header className="sticky top-0 z-50 flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-200/90 bg-white/95 px-2.5 backdrop-blur sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" onClick={toggleSidebar} aria-label="Toggle navigation" aria-expanded={isSidebarOpen} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
            <Menu className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setActivePage('dashboard')} aria-label="ResearchGraph AI home" className="flex min-w-0 shrink-0 items-center gap-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
            <Network className="h-5 w-5 shrink-0 text-blue-600" />
            <span className="max-w-[122px] truncate text-[11px] font-semibold text-slate-900 sm:max-w-none sm:text-xs">ResearchGraph <span className="text-blue-600">AI</span></span>
          </button>
          <form role="search" onSubmit={submitSearch} className="relative ml-auto flex min-w-0 w-full max-w-[540px] items-center">
            <Search aria-hidden="true" className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              aria-label="Search papers, authors, and topics"
              placeholder="Search papers, authors, topics..."
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-[76px] text-[12px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button type="submit" aria-label="Submit search" className="absolute right-2 rounded-md px-1.5 py-1 text-slate-400 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium">{shortcut}</kbd></button>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative" ref={bellRef}>
            <button type="button" onClick={() => setIsBellOpen(value => !value)} aria-label="Notifications" aria-expanded={isBellOpen} className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
              <Bell className="h-[18px] w-[18px]" />
            </button>
            {isBellOpen && <div role="status" className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><p className="text-xs font-semibold text-slate-800">Notifications</p><p className="mt-2 text-xs text-slate-500">You&apos;re all caught up.</p></div>}
          </div>
          <button type="button" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings" className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:flex">
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <div className="relative" ref={avatarRef}>
            <button type="button" onClick={() => setIsAvatarOpen(value => !value)} aria-label="Open user menu" aria-haspopup="menu" aria-expanded={isAvatarOpen} className="flex items-center gap-1 rounded-full p-0.5 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">JD</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
            </button>
            {isAvatarOpen && (
              <div role="menu" className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                <button type="button" role="menuitem" onClick={() => { setIsAvatarOpen(false); setIsProfileOpen(true); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50"><UserRound className="h-4 w-4" />Profile</button>
                <button type="button" role="menuitem" onClick={() => { setIsAvatarOpen(false); onLogout?.(); }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" />Log out</button>
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

