import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Sparkles, GraduationCap, SlidersHorizontal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery, setActivePage } = useApp();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActivePage('search');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-brand-border bg-brand-bg/80 backdrop-blur-md px-8 transition-all">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
        <div className="relative group flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-brand-textMuted group-focus-within:text-brand-accent transition-colors" />
          <input
            type="text"
            placeholder="Ask anything about academic research..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 pl-11 pr-24 rounded-full border border-brand-border bg-brand-surface text-brand-text placeholder-brand-textMuted focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all duration-200 shadow-sm"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded-full text-brand-textMuted hover:text-brand-text hover:bg-brand-bg transition-colors"
              title="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            {searchQuery && (
              <button
                type="submit"
                className="px-3 py-1 rounded-full bg-brand-accent text-white text-xs font-medium hover:bg-brand-accentHover transition-colors"
              >
                Search
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Right Action Bar */}
      <div className="flex items-center gap-5">
        {/* Workspace Quick View */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-surface text-xs font-medium text-brand-textMuted shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
          <span>Semantic Index V3.4</span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-textMuted hover:text-brand-text transition-colors shadow-sm">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-accent border border-brand-surface"></span>
        </button>

        <div className="h-6 w-px bg-brand-border"></div>

        {/* Platform Info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right leading-tight hidden sm:flex">
            <span className="text-[10px] font-medium text-brand-textMuted uppercase tracking-wider">Workspace</span>
            <span className="text-sm font-semibold text-brand-text">ResearchGraph AI</span>
          </div>
          <div className="h-9 w-9 flex items-center justify-center rounded-full bg-brand-surface border border-brand-border text-brand-accent shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
