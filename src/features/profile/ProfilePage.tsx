import React from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers, mockAuthors } from '../../data/mockData';
import { Bookmark, FileText, Settings, Key, Moon, Sun } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    savedPaperIds,
    toggleSavePaper,
    reviews,
    setActivePage,
    setSelectedPaperId,
    theme,
    toggleTheme
  } = useApp();

  const savedPapers = savedPaperIds
    .map(id => mockPapers.find(p => p.id === id))
    .filter((p): p is typeof mockPapers[0] => p !== undefined);

  const handlePaperClick = (id: string) => {
    setSelectedPaperId(id);
    setActivePage('details');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 select-none pb-16">
      
      {/* Profile Header Grid */}
      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm items-center">
        <img
          src={mockAuthors[3].avatar}
          alt="Dr. Sriharsha Avatar"
          className="h-20 w-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
        />
        <div className="space-y-1.5 text-center md:text-left flex-1">
          <h2 className="text-lg font-extrabold text-slate-850 dark:text-slate-100">Dr. Sriharsha</h2>
          <p className="text-xs font-semibold text-slate-500">Principal Computer Vision Researcher &bull; MILA</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[11px] text-slate-450 pt-2 font-medium">
            <span>Saved Papers: <strong className="text-slate-800 dark:text-slate-200">{savedPaperIds.length}</strong></span>
            <span>&bull;</span>
            <span>Literature Reviews: <strong className="text-slate-800 dark:text-slate-200">{reviews.length}</strong></span>
            <span>&bull;</span>
            <span>Citations Tracked: <strong className="text-slate-800 dark:text-slate-200">125,400</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Saved Papers & Reviews list (Span 2) */}
        <div className="md:col-span-2 space-y-6">
          {/* Saved papers */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <Bookmark className="h-4.5 w-4.5 text-indigo-500" />
              Workspace Saved Papers
            </h3>

            {savedPapers.length > 0 ? (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {savedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150/80 dark:border-slate-850/60 bg-white/40 dark:bg-slate-900/20 shadow-sm"
                  >
                    <div
                      onClick={() => handlePaperClick(paper.id)}
                      className="space-y-0.5 cursor-pointer group pr-4 truncate"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {paper.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {paper.authors.join(', ')} &bull; {paper.publication}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSavePaper(paper.id)}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded-lg border border-red-200/10 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No saved papers in active workspace.
              </div>
            )}
          </div>

          {/* Generated reviews */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-purple-500" />
              Generated Review Logs
            </h3>

            {reviews.length > 0 ? (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => setActivePage('lit-review')}
                    className="p-3.5 rounded-xl border border-slate-150/80 dark:border-slate-850/60 bg-white/40 dark:bg-slate-900/20 hover:border-indigo-500/20 cursor-pointer shadow-sm flex items-center justify-between"
                  >
                    <div className="space-y-0.5 truncate pr-4">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{rev.topic}</h4>
                      <p className="text-[10px] text-slate-450 truncate">Contains {rev.papers.length} syntheses and gaps analysis</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-450 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/10">
                      Lit Review
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No generated review logs found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings, theme, API credentials keys */}
        <div className="space-y-6">
          
          {/* General UI Settings */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-indigo-500" />
              Display settings
            </h3>

            {/* Theme option */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Selected Color Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { if (theme === 'dark') toggleTheme(); }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-55/10 border-indigo-500 text-indigo-650'
                      : 'bg-white/10 border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Light Mode
                </button>
                <button
                  onClick={() => { if (theme === 'light') toggleTheme(); }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-950/20 border-indigo-500 text-indigo-400'
                      : 'bg-white/10 border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </button>
              </div>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="h-4.5 w-4.5 text-emerald-500" />
              API integrations
            </h3>
            
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Semantic Scholar API Key</label>
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••••••"
                  disabled
                  className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Gemini Flash API Key</label>
                <input
                  type="password"
                  placeholder="Insert Key to activate live Chat model..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <p className="text-[9px] text-slate-450 leading-relaxed font-semibold">
              ⚠️ Keys are only stored inside local sandbox sessions and are never transmitted to external cloud storage logs.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ProfilePage;
