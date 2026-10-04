import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Search, Settings, LogOut, Menu, Network, ChevronDown, Sun, Moon } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { setSearchQuery, setActivePage, toggleSidebar, theme, setTheme } = useApp();
  
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [cmdKey, setCmdKey] = useState('⌘');
  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
      setCmdKey('⌘');
    } else {
      setCmdKey('Ctrl');
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setIsAvatarOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      setSearchQuery(e.currentTarget.value);
      setActivePage('search');
    }
  };

  return (
    <>
      <header className="h-[64px] shrink-0 bg-white dark:bg-[#111D35] dark:bg-[#0B1426] border-b border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0 relative">
        <div className="flex items-center gap-4">
          {/* Hamburger Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:bg-white/[0.04] dark:hover:bg-white dark:bg-[#111D35]/[0.04]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('dashboard')}>
            <Network className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-[16px] tracking-tight text-gray-900 dark:text-white dark:text-white">
              ResearchGraph <span className="font-bold text-blue-600 dark:text-blue-400">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          {/* Search Bar */}
          <div className="hidden md:flex items-center relative ml-8">
            <div className="absolute left-3.5 w-5 h-5 flex items-center justify-center z-10">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search papers, authors, topics..."
              onKeyDown={handleGlobalSearch}
              className="w-[280px] lg:w-[480px] h-10 pl-11 pr-14 rounded-full bg-gray-100 dark:bg-[#111D35] border border-transparent dark:border-white/[0.06] text-[13px] text-gray-900 dark:text-white dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
            />
            <div className="absolute right-2.5 flex items-center gap-1">
              <kbd className="px-2 py-1 text-[11px] font-medium bg-gray-200 dark:bg-white dark:bg-[#111D35]/[0.08] rounded text-gray-500 dark:text-gray-400 dark:text-gray-400 flex items-center gap-0.5">{cmdKey === '⌘' ? '⌘' : 'Ctrl'} K</kbd>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 mr-1 rounded-full transition-all text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-white dark:bg-indigo-600/20 dark:hover:bg-indigo-500/30"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setIsBellOpen(!isBellOpen)}
                className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white dark:bg-[#111D35]/[0.06]"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B1426]"></span>
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white dark:bg-[#111D35]/[0.06] rounded-full hidden sm:flex"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="relative ml-1.5 flex items-center gap-1 cursor-pointer hover:opacity-80" onClick={() => setIsAvatarOpen(!isAvatarOpen)} ref={avatarRef}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white/20 dark:ring-white/10">
                JD
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 dark:text-gray-400" />
              {isAvatarOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-[#111D35] dark:bg-[#111D35] rounded-xl shadow-xl shadow-sm dark:shadow-none border border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] overflow-hidden py-1 flex flex-col z-50">
                  <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:bg-white/[0.04] dark:hover:bg-white dark:bg-[#111D35]/[0.04] text-red-600 dark:text-red-400 flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
