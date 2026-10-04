import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Command, Search, Settings, LogOut, User, Moon, Sun, Laptop, HelpCircle, Menu, Network } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';

export const Navbar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { setSearchQuery, setActivePage, theme, setTheme, isSidebarOpen, toggleSidebar } = useApp();
  
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [cmdKey, setCmdKey] = useState('⌘');
  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect OS for keyboard shortcuts
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
      <header className="h-14 shrink-0 bg-white/90 dark:bg-[#06111F]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#0B1A38] flex items-center justify-between px-3 sm:px-4 z-40 sticky top-0 relative transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar} 
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-[#06111F]"
            title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 transition-all duration-200">
              <Network className="w-[16px] h-[16px] text-white" />
            </div>
            <span className="font-extrabold text-[15px] tracking-tight text-gray-900 dark:text-white hidden sm:block">
              ResearchGraph <span className="text-[#8B5CF6]">AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Command Bar */}
          <div className="hidden md:flex items-center relative group">
             <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
             <input 
               type="text" 
               placeholder="Search papers, authors, topics..." 
               onKeyDown={handleGlobalSearch}
               className="w-64 lg:w-72 h-8 pl-8 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent text-[12px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all shadow-sm"
             />
             <div className="absolute right-1.5 flex items-center gap-1 opacity-60">
               <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-gray-400 dark:text-gray-300 flex items-center gap-0.5"><Command className="w-2.5 h-2.5" />{cmdKey === '⌘' ? 'K' : ' K'}</kbd>
             </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            
            {/* Notifications */}
            <div className="relative" ref={bellRef}>
              <button 
                onClick={() => setIsBellOpen(!isBellOpen)}
                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              </button>
              
              {isBellOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden py-1">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-sm font-bold dark:text-white">Notifications</span>
                    <button className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                  </div>
                  <div className="p-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer">
                      <strong>DINOv2</strong> paper has a new citation.
                    </div>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => { setIsBellOpen(false); setIsSettingsOpen(true); }}
                      className="w-full p-2 text-xs text-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Notification Settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
            
            {/* Avatar Menu */}
            <div className="relative ml-1" ref={avatarRef}>
              <div 
                onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
              >
                JD
              </div>
              
              {isAvatarOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden py-1 flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex flex-col">
                    <span className="text-sm font-bold dark:text-white">Dr. Jane Doe</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">jane.doe@stanford.edu</span>
                    <span className="text-[10px] mt-1 text-blue-600 dark:text-blue-400 font-semibold">Stanford AI Lab</span>
                  </div>
                  
                  <button onClick={() => { setIsAvatarOpen(false); setIsProfileOpen(true); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" /> Profile
                  </button>
                  <button onClick={() => { setIsAvatarOpen(false); setIsSettingsOpen(true); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" /> Settings
                  </button>
                  
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1 px-4 py-2 flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Theme</span>
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button onClick={() => setTheme('light')} className={`flex-1 flex justify-center p-1 rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Sun className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 flex justify-center p-1 rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Moon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setTheme('system')} className={`flex-1 flex justify-center p-1 rounded-md transition-colors ${theme === 'system' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Laptop className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 mt-1">
                    <HelpCircle className="w-4 h-4 text-gray-400" /> Help & Shortcuts
                  </button>

                  {onLogout && (
                    <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  )}
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
