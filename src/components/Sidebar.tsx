import React, { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, Search, MessageSquare, FileText, Bookmark, 
  GitCompare, Network, BookOpen, Activity, Clock, 
  LayoutDashboard, Settings
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
    // Auto-close sidebar after navigation for clean UX
    if (isSidebarOpen) toggleSidebar();
  }, [setActivePage, isSidebarOpen, toggleSidebar]);

  // Flatten items to compute stagger delay index
  let globalItemIndex = 0;

  return (
    <div 
      className="shrink-0 relative z-30 bg-white dark:bg-[#06111F] border-r border-gray-200 dark:border-[#0B1A38] h-full flex flex-col justify-between overflow-hidden"
      style={{
        width: isSidebarOpen ? 250 : 76,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── NAVIGATION GROUPS ── */}
      <div className="flex flex-col flex-1 min-h-0">
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 scrollbar-thin">
          <div className="flex flex-col gap-5">
              {navGroups.map((group, groupIdx) => {
                return (
                  <div key={groupIdx} className="flex flex-col gap-0.5">
                    {/* Group Title */}
                    <div 
                      className="h-5 flex items-center px-2 mb-1 overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isSidebarOpen ? 20 : 0,
                        opacity: isSidebarOpen ? 1 : 0,
                        marginBottom: isSidebarOpen ? 4 : 0,
                      }}
                    >
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
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
                              relative flex items-center rounded-xl transition-all duration-200 font-semibold text-[13px] group
                              ${isSidebarOpen ? 'px-3 py-2.5 gap-3' : 'justify-center py-2.5 mx-auto w-[50px]'}
                              ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white'
                              }
                            `}
                          >
                            <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-white scale-105' : 'group-hover:scale-110 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                              {item.icon}
                            </div>
                            <span
                              className="whitespace-nowrap text-left flex-1 overflow-hidden transition-all duration-300"
                              style={{
                                maxWidth: isSidebarOpen ? 180 : 0,
                                opacity: isSidebarOpen ? 1 : 0,
                                transitionDelay: isSidebarOpen ? `${itemDelay}s` : '0s',
                              }}
                            >
                              {item.label}
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
        
        {/* ── BOTTOM FOOTER ── */}
        <div className="p-3 border-t border-gray-200 dark:border-[#0B1A38] shrink-0">
          {!isSidebarOpen ? (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer" title="Dashboard">
                <LayoutDashboard className="w-[18px] h-[18px]" />
              </div>
              <div className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer" title="Settings">
                <Settings className="w-[18px] h-[18px]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2">
              <span
                className="text-[10px] font-mono text-gray-500 dark:text-gray-600 uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{
                  maxWidth: isSidebarOpen ? 150 : 0,
                  opacity: isSidebarOpen ? 1 : 0,
                }}
              >
                v1.0.2 / Enterprise
              </span>
              <div className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all duration-200 cursor-pointer" title="Settings">
                <Settings className="w-4 h-4 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" />
              </div>
            </div>
          )}
        </div>
    </div>
  );
};
