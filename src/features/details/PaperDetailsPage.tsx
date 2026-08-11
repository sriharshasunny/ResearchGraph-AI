import React from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
import { Bookmark, BookmarkCheck, Columns3, MessageSquare, ArrowLeft, Calendar, Quote, TrendingUp, BookOpen } from 'lucide-react';

export const PaperDetailsPage: React.FC = () => {
  const {
    selectedPaperId,
    setActivePage,
    savedPaperIds,
    toggleSavePaper,
    comparePaperIds,
    addToCompare,
    removeFromCompare,
    setSelectedPaperId,
    addToRecentlyViewed,
    addChatMessage
  } = useApp();

  const paper = mockPapers.find(p => p.id === selectedPaperId) || mockPapers[0];

  const isSaved = savedPaperIds.includes(paper.id);
  const isComparing = comparePaperIds.includes(paper.id);

  const handleBack = () => {
    setActivePage('search');
  };

  const handleCompareToggle = () => {
    if (isComparing) {
      removeFromCompare(paper.id);
    } else {
      addToCompare(paper.id);
    }
  };

  const handleChatClick = () => {
    addChatMessage({
      id: `chat-init-detail-${Date.now()}`,
      sender: 'user',
      content: `Explain the core contributions, advantages, and limitations of the paper: "${paper.title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Add default assistant response
    setTimeout(() => {
      addChatMessage({
        id: `chat-resp-detail-${Date.now()}`,
        sender: 'assistant',
        content: `Here is a semantic analysis of **"${paper.title}"** (${paper.year}):\n\n### Core Contribution\nThe paper proposes using **${paper.method}** combined with **${paper.model}** to address key bottlenecks in this domain. Evaluated on the **${paper.dataset}** dataset, it demonstrates **${paper.accuracy}**.\n\n### Key Advantages\n${paper.advantages.map(adv => `- ${adv}`).join('\n')}\n\n### Main Limitations\n${paper.limitations.map(lim => `- ${lim}`).join('\n')}\n\nWould you like to generate a comparative literature review or inspect its citation topology?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [{ id: paper.id, index: 1, title: paper.title }]
      });
    }, 1200);

    setActivePage('chat');
  };

  const handleRelatedPaperClick = (id: string) => {
    setSelectedPaperId(id);
    addToRecentlyViewed(id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-1 select-none pb-16">
      {/* Back button and page tools */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/30 pb-4 flex-wrap gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </button>

        <div className="flex items-center gap-2">
          {/* Compare */}
          <button
            onClick={handleCompareToggle}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-xl border text-xs font-bold transition-all ${
              isComparing
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Columns3 className="h-4 w-4" />
            {isComparing ? 'In Comparison' : 'Add to Compare'}
          </button>

          {/* Chat */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-750 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            Chat About Paper
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleSavePaper(paper.id)}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-xl border text-xs font-bold transition-all ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                Saved in Workspace
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Save Paper
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info, Abstract, Figures, References */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Core Info card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350">
                <Calendar className="h-3 w-3" />
                {paper.year}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/10">
                {paper.publication}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-slate-100 leading-snug">
              {paper.title}
            </h1>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-normal">
              By {paper.authors.join(', ')}
            </p>

            <div className="h-px bg-slate-200/60 dark:bg-slate-800/40" />

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Abstract</h3>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                {paper.abstract}
              </p>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {paper.keywords.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-slate-550 dark:text-slate-400 border border-slate-100 dark:border-slate-850/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Figures Gallery Card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Extracted Figures & Diagrams</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paper.figures.map((figCaption, idx) => (
                <div key={idx} className="border border-slate-200/60 dark:border-slate-850/60 rounded-xl overflow-hidden bg-slate-950/20 backdrop-blur-md">
                  {/* Mock Diagram Canvas */}
                  <div className="h-32 bg-slate-950/40 flex items-center justify-center relative p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
                    {/* SVG mockup nodes */}
                    <div className="flex gap-4 items-center z-10">
                      <div className="h-8 w-12 rounded bg-indigo-650/40 border border-indigo-500/20 text-[8px] flex items-center justify-center font-bold text-slate-300">Inputs</div>
                      <div className="h-2 w-4 bg-slate-500" />
                      <div className="h-10 w-16 rounded bg-purple-650/40 border border-purple-500/20 text-[8px] flex items-center justify-center font-bold text-slate-300">Attention Layer</div>
                      <div className="h-2 w-4 bg-slate-500" />
                      <div className="h-8 w-12 rounded bg-blue-650/40 border border-blue-500/20 text-[8px] flex items-center justify-center font-bold text-slate-300">Outputs</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-150/40 dark:border-slate-800/20 text-[10px] text-slate-500 text-center leading-normal font-semibold">
                    {figCaption}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* References Card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">References ({paper.references.length})</h3>
            
            <div className="space-y-3 divide-y divide-slate-150 dark:divide-slate-850">
              {paper.references.map((ref, idx) => (
                <div key={idx} className={`flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 ${idx > 0 ? 'pt-3' : ''}`}>
                  <span className="font-bold text-indigo-500">[{idx + 1}]</span>
                  <div className="space-y-0.5 leading-relaxed font-medium">
                    <div className="text-slate-800 dark:text-slate-200 font-bold">{ref.title}</div>
                    <div>By {ref.authors} &bull; {ref.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Metrics, Parameters, Related papers, timeline */}
        <div className="space-y-6">
          
          {/* Key Metrics card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Semantic Metrics</h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Citation Count</div>
                <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-1 flex items-center justify-center gap-1">
                  <Quote className="h-4 w-4 text-indigo-500" />
                  {paper.citationCount.toLocaleString()}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/40 rounded-xl">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Velocity</div>
                <div className="text-base font-black text-slate-800 dark:text-slate-200 mt-1 flex items-center justify-center gap-0.5">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  {paper.metrics.citationVelocity.toLocaleString()} / yr
                </div>
              </div>
            </div>

            {/* Model stats breakdown */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950/10 border border-slate-150/40 dark:border-slate-800/30">
                <span className="text-slate-400">Method:</span>
                <span className="text-slate-700 dark:text-indigo-400">{paper.method || 'Standard baseline'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950/10 border border-slate-150/40 dark:border-slate-800/30">
                <span className="text-slate-400">Model:</span>
                <span className="text-slate-700 dark:text-purple-400">{paper.model || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950/10 border border-slate-150/40 dark:border-slate-800/30">
                <span className="text-slate-400">Target Dataset:</span>
                <span className="text-slate-700 dark:text-blue-400">{paper.dataset || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Citation Timeline</h3>
            
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-4">
              {paper.timeline.map((eventObj, idx) => (
                <div key={idx} className="relative">
                  {/* Dot indicator */}
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900"></span>
                  <div className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400">{eventObj.year}</div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
                    {eventObj.event}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Papers Card */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Related Semantic Papers
            </h3>

            <div className="space-y-2">
              {paper.relatedPapers.slice(0, 4).map((relId) => {
                const relPaper = mockPapers.find(p => p.id === relId);
                if (!relPaper) return null;
                return (
                  <div
                    key={relId}
                    onClick={() => handleRelatedPaperClick(relId)}
                    className="p-3 rounded-xl border border-slate-150/80 dark:border-slate-850/60 bg-white/40 dark:bg-slate-900/20 hover:border-indigo-500/20 cursor-pointer shadow-sm group transition-all"
                  >
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {relPaper.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-450 mt-1 leading-none">
                      <span>{relPaper.publication}</span>
                      <span className="font-semibold">{relPaper.citationCount.toLocaleString()} cites</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
