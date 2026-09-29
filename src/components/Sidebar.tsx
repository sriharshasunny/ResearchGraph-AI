import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, Search, MessageSquare, FileText, Bookmark, 
  GitCompare, Network, BookOpen, Activity, Clock, 
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { PageType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsModal } from './SettingsModal';
import { ProfileModal } from './ProfileModal';

export const Sidebar: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'details', label: 'Papers', icon: <FileText className="w-5 h-5" /> },
    { id: 'saved', label: 'Saved Papers', icon: <Bookmark className="w-5 h-5" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-5 h-5" /> },
    { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
    { id: 'literature', label: 'Literature Review', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'gaps', label: 'Research Gaps', icon: <Activity className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: isSidebarOpen ? 250 : 76 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="h-full shrink-0 bg-[#06111F] text-white flex flex-col justify-between border-r border-[#0B1A38] z-30 select-none relative"
      >
        {/* ── TOP BRAND & TOGGLE ── */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#0B1A38]">
            <div 
              onClick={() => setActivePage('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                <Network className="w-5 h-5 text-white" />
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    <span className="font-extrabold text-[15px] tracking-tight text-white block">
                      ResearchGraph
                    </span>
                    <span className="text-[10px] font-semibold tracking-widest text-cyan-400 block -mt-1 uppercase">
                      AI OS
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* ── NAVIGATION LIST ── */}
          <nav className="py-4 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
            {navItems.map((item) => {
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  title={!isSidebarOpen ? item.label : undefined}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'} rounded-xl transition-all font-semibold text-[13px] group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-gray-400 hover:bg-[#0B1A38]/90 hover:text-white'
                  }`}
                >
                  <div className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-105 text-white' : 'group-hover:scale-105'}`}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── BOTTOM ACTIONS: SETTINGS, PROFILE, LOGOUT ── */}
        <div className="p-3 border-t border-[#0B1A38] space-y-1.5">
          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title={!isSidebarOpen ? 'Settings' : undefined}
            className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2'} rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium text-[13px]`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Profile Card */}
          <div
            onClick={() => setIsProfileOpen(true)}
            title={!isSidebarOpen ? 'Researcher Profile' : undefined}
            className={`flex items-center ${isSidebarOpen ? 'justify-between px-3 py-2' : 'justify-center p-2'} rounded-xl hover:bg-white/5 transition-colors cursor-pointer group`}
          >
            <div className={`flex items-center ${isSidebarOpen ? 'gap-2.5' : 'justify-center'}`}>
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                JD
              </div>
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex flex-col overflow-hidden whitespace-nowrap text-left"
                  >
                    <span className="text-[12px] font-bold text-white leading-tight">Dr. Jane Doe</span>
                    <span className="text-[10px] text-gray-400 leading-tight">Stanford AI Lab</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              title={!isSidebarOpen ? 'Log Out' : undefined}
              className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2'} rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all font-medium text-[13px]`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden text-rose-300"
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </motion.aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
