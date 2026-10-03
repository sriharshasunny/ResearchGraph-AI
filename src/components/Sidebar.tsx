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
    <div className="w-[76px] shrink-0 relative z-[9999]">
      {/* ── BACKDROP OVERLAY (visible when open) ── */}
      <div 
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 9998 }}
      />

      {/* ── SIDEBAR PANEL ── */}
      <aside
        style={{
          width: isSidebarOpen ? 250 : 76,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
        }}
        className="absolute inset-y-0 left-0 bg-[#06111F] text-white flex flex-col justify-between border-r border-[#0B1A38] select-none overflow-hidden"
      >
        {/* ── TOP BRAND & TOGGLE ── */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-14 flex items-center px-4 border-b border-[#0B1A38] shrink-0">
            <div 
              onClick={toggleSidebar}
              className="flex items-center gap-3 cursor-pointer group"
              title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 group-hover:bg-blue-500 group-hover:shadow-blue-500/40 transition-all duration-200 group-hover:scale-105">
                <Network className="w-[18px] h-[18px] text-white" />
              </div>
              <span 
                className="font-extrabold text-[14px] tracking-tight text-white whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{
                  maxWidth: isSidebarOpen ? 160 : 0,
                  opacity: isSidebarOpen ? 1 : 0,
                }}
              >
                ResearchGraph
              </span>
            </div>
          </div>

          {/* ── NAVIGATION GROUPS ── */}
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
                                : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                              }
                            `}
                          >
                            <div className={`shrink-0 transition-all duration-200 ${isActive ? 'text-white scale-105' : 'group-hover:scale-110 group-hover:text-white'}`}>
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
        <div className="p-3 border-t border-[#0B1A38] shrink-0">
          {!isSidebarOpen ? (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-white transition-all duration-200 cursor-pointer" title="Dashboard">
                <LayoutDashboard className="w-[18px] h-[18px]" />
              </div>
              <div className="p-2 rounded-lg hover:bg-white/[0.06] hover:text-white transition-all duration-200 cursor-pointer" title="Settings">
                <Settings className="w-[18px] h-[18px]" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between px-2">
              <span
                className="text-[10px] font-mono text-gray-600 uppercase tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300"
                style={{
                  maxWidth: isSidebarOpen ? 150 : 0,
                  opacity: isSidebarOpen ? 1 : 0,
                }}
              >
                v1.0.2 / Enterprise
              </span>
              <div className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all duration-200 cursor-pointer" title="Settings">
                <Settings className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
