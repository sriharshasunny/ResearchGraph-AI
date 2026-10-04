import React, { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, Search, MessageSquare, FileText, Bookmark, 
  GitCompare, Network, BookOpen, Activity, Clock, 
  Crown, ArrowRight, Sparkles
} from 'lucide-react';
import type { PageType } from '../types';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, isSidebarOpen, toggleSidebar } = useApp();

  const navGroups = [
    {
      title: 'Discover',
      items: [
        { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
        { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
        { id: 'chat', label: 'AI Assistant', icon: <MessageSquare className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Library',
      items: [
        { id: 'details', label: 'Corpus', icon: <FileText className="w-5 h-5" /> },
        { id: 'saved', label: 'Saved Papers', icon: <Bookmark className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Analyze',
      items: [
        { id: 'compare', label: 'Compare', icon: <GitCompare className="w-5 h-5" /> },
        { id: 'graph', label: 'Knowledge Graph', icon: <Network className="w-5 h-5" /> },
        { id: 'literature', label: 'Literature Review', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'gaps', label: 'Research Gaps', icon: <Activity className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Activity',
      items: [
        { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
      ]
    }
  ];

  const handleNavClick = useCallback((id: string) => {
    setActivePage(id as PageType);
    if (isSidebarOpen) toggleSidebar();
  }, [setActivePage, isSidebarOpen, toggleSidebar]);

  let globalItemIndex = 0;

  return (
    <div className="w-[76px] shrink-0 relative z-30">
      {/* Backdrop */}
      <div 
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 20 }} // Below Sidebar (30) and Navbar (40)
      />

      {/* Sidebar Panel */}
      <aside
        style={{
          width: isSidebarOpen ? 250 : 76,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 30, // Above backdrop, below Navbar
        }}
        className="absolute inset-y-0 left-0 bg-white dark:bg-[#111D35] dark:bg-[#0B1426] flex flex-col justify-between border-r border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06] select-none overflow-hidden shadow-xl dark:shadow-none"
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Navigation Groups - padding top adjusted since header was removed */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-5 scrollbar-thin">
            <div className="flex flex-col gap-6">
              {navGroups.map((group, groupIdx) => {
                return (
                  <div key={groupIdx} className="flex flex-col gap-0.5">
                    {/* Group Title — gray in light, colored in dark */}
                    <div 
                      className="h-5 flex items-center px-6 mb-1 overflow-hidden"
                      style={{
                        maxHeight: isSidebarOpen ? 20 : 0,
                        opacity: isSidebarOpen ? 1 : 0,
                        transition: 'max-height 0.3s, opacity 0.3s',
                      }}
                    >
                      <span className="text-[11px] font-bold text-gray-400 dark:text-blue-400/70 uppercase tracking-widest whitespace-nowrap">
                        {group.title}
                      </span>
                    </div>

                    {/* Nav Items */}
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const isActive = activePage === item.id;
                        const itemDelay = globalItemIndex * 0.03;
                        globalItemIndex++;
                        return (
                          <button
                            key={item.id}
                            title={!isSidebarOpen ? item.label : undefined}
                            onClick={() => handleNavClick(item.id)}
                            className={`
                              relative flex items-center rounded-xl font-medium text-[13px] group overflow-hidden mx-3
                              ${isSidebarOpen ? 'px-3 py-2.5 gap-3' : 'justify-center py-2.5 mx-auto w-[46px]'}
                              ${isActive
                                ? 'bg-blue-50 text-blue-600 dark:bg-gradient-to-r dark:from-[#3B28CC] dark:to-[#6938F5] dark:text-white dark:shadow-[0_0_15px_rgba(105,56,245,0.4)] dark:border-t dark:border-white/20'
                                : 'text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:bg-white/[0.04] dark:text-gray-400 dark:hover:bg-white dark:bg-[#111D35]/[0.04] dark:hover:text-white'
                              }
                            `}
                          >
                            {/* Left accent bar — light mode only */}
                            {isActive && <div className="absolute inset-y-0 left-0 w-1 bg-blue-600 dark:bg-transparent rounded-r-md"></div>}
                            <div className={`shrink-0 ${isActive ? 'text-blue-600 dark:text-white' : 'text-gray-400 dark:text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:text-gray-300 dark:group-hover:text-white'}`}>
                              {item.icon}
                            </div>
                            <span
                              className="whitespace-nowrap text-left flex-1 overflow-hidden flex items-center justify-between"
                              style={{
                                maxWidth: isSidebarOpen ? 180 : 0,
                                opacity: isSidebarOpen ? 1 : 0,
                                transition: `max-width 0.3s, opacity 0.3s`,
                                transitionDelay: isSidebarOpen ? `${itemDelay}s` : '0s',
                              }}
                            >
                              {item.label}
                              {item.id === 'chat' && <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-300 shrink-0" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
        
        {/* Bottom Footer — Upgrade to Pro */}
        <div className="p-4 shrink-0 border-t border-gray-200 dark:border-white/[0.06] dark:border-white/[0.06]">
          {isSidebarOpen ? (
            <div className="bg-blue-50 dark:bg-gradient-to-r dark:from-[#21115C] dark:to-[#3F1C99] dark:border-t dark:border-white/10 dark:shadow-[0_0_15px_rgba(105,56,245,0.2)] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-100/60 dark:hover:from-[#2B1770] dark:hover:to-[#4D23B0] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-[#111D35] dark:bg-[#FBBC05]/20 flex items-center justify-center shrink-0 shadow-sm dark:shadow-none text-blue-600 dark:text-[#FBBC05]">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-gray-900 dark:text-white dark:text-white">Upgrade to Pro</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-indigo-200">Unlock advanced features</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-white dark:bg-[#111D35]/10 flex items-center justify-center shrink-0">
                <ArrowRight className="w-3 h-3 text-blue-600 dark:text-white" />
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-gradient-to-br dark:from-[#21115C] dark:to-[#3F1C99] dark:border-t dark:border-white/10 dark:shadow-[0_0_10px_rgba(105,56,245,0.3)] flex items-center justify-center cursor-pointer hover:bg-blue-100/60 transition-colors shadow-sm dark:shadow-none">
               <Crown className="w-5 h-5 text-blue-600 dark:text-[#FBBC05]" />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
