import React from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import { Bookmark, FileText, Key, User } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const {
    savedPaperIds,
    toggleSavePaper,
    reviews,
    setActivePage,
    setSelectedPaperId,
  } = useApp();

  const savedPapers = savedPaperIds
    .map(id => mockPapers.find(p => p.id === id))
    .filter((p): p is typeof mockPapers[0] => p !== undefined);

  const handlePaperClick = (id: string) => {
    setSelectedPaperId(id);
    setActivePage('details');
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 select-none space-y-8">
      
      {/* Profile Header Grid */}
      <div className="flex flex-col md:flex-row gap-8 p-8 rounded-xl border border-brand-border bg-brand-surface shadow-sm items-center">
        <div className="h-24 w-24 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center flex-shrink-0">
          <User className="h-10 w-10 text-brand-textMuted" />
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <h2 className="text-[24px] font-semibold text-brand-text">Dr. Sriharsha</h2>
          <p className="text-[14px] font-medium text-brand-textMuted">Principal Computer Vision Researcher &bull; MILA</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[13px] text-brand-textMuted pt-2">
            <span>Saved Papers: <strong className="text-brand-text font-semibold">{savedPaperIds.length}</strong></span>
            <span>&bull;</span>
            <span>Literature Reviews: <strong className="text-brand-text font-semibold">{reviews.length}</strong></span>
            <span>&bull;</span>
            <span>Citations Tracked: <strong className="text-brand-text font-semibold">125,400</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Saved Papers & Reviews list (Span 2) */}
        <div className="md:col-span-2 space-y-8">
          {/* Saved papers */}
          <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
            <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Workspace Saved Papers
            </h3>

            {savedPapers.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {savedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-brand-border bg-brand-bg hover:border-brand-accent/30 transition-colors group"
                  >
                    <div
                      onClick={() => handlePaperClick(paper.id)}
                      className="space-y-1 cursor-pointer pr-4 flex-1 min-w-0"
                    >
                      <h4 className="text-[14px] font-medium text-brand-text group-hover:text-brand-accent transition-colors truncate">
                        {paper.title}
                      </h4>
                      <p className="text-[12px] text-brand-textMuted truncate">
                        {paper.authors.join(', ')} &bull; {paper.publication}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleSavePaper(paper.id)}
                      className="text-[12px] font-medium text-brand-textMuted hover:text-red-600 bg-brand-surface hover:bg-red-50 px-3 py-1.5 rounded-md border border-brand-border transition-colors flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-[13px] text-brand-textMuted border border-dashed border-brand-border rounded-lg bg-brand-bg">
                No saved papers in active workspace.
              </div>
            )}
          </div>

          {/* Generated reviews */}
          <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
            <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generated Review Logs
            </h3>

            {reviews.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => setActivePage('lit-review')}
                    className="p-4 rounded-lg border border-brand-border bg-brand-bg hover:bg-brand-surface cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="space-y-1 truncate pr-4">
                      <h4 className="text-[14px] font-medium text-brand-text group-hover:text-brand-accent transition-colors truncate">{rev.topic}</h4>
                      <p className="text-[12px] text-brand-textMuted truncate">Contains {rev.papers.length} syntheses and gaps analysis</p>
                    </div>
                    <span className="text-[11px] font-medium text-brand-textMuted bg-brand-surface px-2.5 py-1 rounded border border-brand-border shrink-0">
                      Lit Review
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-[13px] text-brand-textMuted border border-dashed border-brand-border rounded-lg bg-brand-bg">
                No generated review logs found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: API credentials keys */}
        <div className="space-y-8">
          
          {/* API Keys Configuration */}
          <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
            <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Integrations
            </h3>
            
            <div className="space-y-5 text-[13px] font-medium">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-brand-textMuted uppercase">Semantic Scholar API Key</label>
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••••••"
                  disabled
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-bg text-brand-textMuted focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-brand-textMuted uppercase">LLM API Key</label>
                <input
                  type="password"
                  placeholder="Insert Key to activate live Chat model..."
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-bg text-brand-text focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
            </div>

            <p className="text-[12px] text-brand-textMuted leading-relaxed font-normal bg-brand-bg p-3 rounded-md border border-brand-border">
              Keys are only stored inside local sandbox sessions and are never transmitted to external cloud storage logs.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default ProfilePage;
