import React from 'react';
import { useApp } from '../../context/AppContext';
import { getPaperDetails } from '../../services/api';
import type { Paper } from '../../types';
import { Bookmark, BookmarkCheck, Columns3, MessageSquare, ArrowLeft, Calendar, Quote, TrendingUp, BookOpen, ExternalLink, Download } from 'lucide-react';

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
    addChatMessage,
    paperCache,
    cachePapers
  } = useApp();

  const [paper, setPaper] = React.useState<Paper | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedPaperId) return;
      
      if (paperCache[selectedPaperId]) {
        setPaper(paperCache[selectedPaperId]);
        addToRecentlyViewed(selectedPaperId);
        return;
      }

      setIsLoading(true);
      try {
        const details = await getPaperDetails(selectedPaperId);
        if (details) {
          setPaper(details);
          cachePapers([details]);
          addToRecentlyViewed(details.id);
        }
      } catch (err) {
        console.error("Failed to load details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedPaperId, paperCache]);

  const isSaved = paper ? savedPaperIds.includes(paper.id) : false;
  const isComparing = paper ? comparePaperIds.includes(paper.id) : false;

  const handleBack = () => {
    setActivePage('search');
  };

  const handleCompareToggle = () => {
    if (!paper) return;
    if (isComparing) {
      removeFromCompare(paper.id);
    } else {
      addToCompare(paper.id);
    }
  };

  const handleChatClick = () => {
    if (!paper) return;
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
        content: `Here is a semantic analysis of **"${paper.title}"** (${paper.year}):\n\n### Core Contribution\nThe paper proposes approaches based on ${paper.topics?.join(', ') || 'various methods'} in this domain.\n\nWould you like to generate a comparative literature review or inspect its citation topology?`,
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

  if (isLoading) {
    return <div className="p-10 text-center text-brand-textMuted">Loading paper details...</div>;
  }

  if (!paper) {
    return <div className="p-10 text-center text-brand-textMuted">Paper not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-16 select-none space-y-6">
      {/* Back button and page tools */}
      <div className="flex items-center justify-between border-b border-brand-border pb-5 flex-wrap gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[14px] font-medium text-brand-textMuted hover:text-brand-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </button>

        <div className="flex items-center gap-3">
          {/* Compare */}
          <button
            onClick={handleCompareToggle}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-[13px] font-medium transition-colors ${
              isComparing
                ? 'bg-brand-surface text-brand-accent border-brand-accent shadow-sm'
                : 'bg-brand-surface text-brand-text border-brand-border hover:bg-brand-bg'
            }`}
          >
            <Columns3 className="h-4 w-4" />
            {isComparing ? 'In Comparison' : 'Compare'}
          </button>

          {/* Chat */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-2 h-10 px-4 rounded-lg border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-bg text-[13px] font-medium transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            Chat About Paper
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleSavePaper(paper.id)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-[13px] font-medium transition-colors ${
              isSaved
                ? 'bg-brand-text text-brand-surface border-brand-text'
                : 'bg-brand-surface text-brand-text border-brand-border hover:bg-brand-bg'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                Saved
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info, Abstract, Figures, References */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Core Info header */}
          <div className="space-y-6">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-brand-textMuted">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-brand-bg border border-brand-border text-brand-text">
                <Calendar className="h-3.5 w-3.5" />
                {paper.year}
              </span>
              <span className="px-3 py-1 rounded bg-brand-bg border border-brand-border text-brand-text">
                {paper.publication}
              </span>
            </div>

            <h1 className="text-[32px] font-semibold text-brand-text leading-tight">
              {paper.title}
            </h1>

            <p className="text-[16px] text-brand-textMuted leading-relaxed">
              {paper.authors.join(', ')}
            </p>

            <div className="flex gap-3 pt-2">
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-brand-bg border border-brand-border text-brand-text text-[13px] font-medium hover:bg-brand-surface transition-colors">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-brand-bg border border-brand-border text-brand-text text-[13px] font-medium hover:bg-brand-surface transition-colors">
                <ExternalLink className="h-4 w-4" />
                View Source
              </button>
            </div>
            
            <div className="h-px bg-brand-border my-6" />

            <div className="space-y-4">
              <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider">Abstract</h3>
              <p className="text-[15px] text-brand-text leading-relaxed font-normal">
                {paper.abstract}
              </p>
            </div>

            {/* Keywords/Topics */}
            <div className="flex flex-wrap gap-2 pt-4">
              {(paper.topics || []).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[12px] font-medium px-3 py-1 rounded-full bg-brand-bg text-brand-textMuted border border-brand-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Figures Gallery Card (If Available) */}
          {(paper.figures && paper.figures.length > 0) && (
            <div className="pt-8 border-t border-brand-border space-y-6">
              <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider">Extracted Figures & Diagrams</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paper.figures.map((figCaption, idx) => (
                  <div key={idx} className="border border-brand-border rounded-xl overflow-hidden bg-brand-bg">
                    <div className="h-40 bg-brand-surface flex items-center justify-center relative p-4 border-b border-brand-border">
                      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    </div>
                    <div className="p-4 text-[12px] text-brand-textMuted text-center leading-relaxed">
                      {figCaption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References Card */}
          {(paper.references && paper.references.length > 0) && (
            <div className="pt-8 border-t border-brand-border space-y-6">
              <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider">References ({paper.references.length})</h3>
              
              <div className="space-y-4 divide-y divide-brand-border">
                {paper.references.map((ref, idx) => (
                  <div key={idx} className={`flex items-start gap-4 text-[14px] text-brand-text ${idx > 0 ? 'pt-4' : ''}`}>
                    <span className="font-semibold text-brand-textMuted">[{idx + 1}]</span>
                    <div className="space-y-1 leading-relaxed">
                      <div className="font-medium">{ref.title}</div>
                      <div className="text-[13px] text-brand-textMuted">By {ref.authors} &bull; {ref.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Metrics, Parameters, Related papers, timeline */}
        <div className="space-y-8">
          
          {/* Key Metrics card */}
          <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
            <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider">Semantic Metrics</h3>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-brand-bg border border-brand-border rounded-lg">
                <div className="text-[11px] font-semibold text-brand-textMuted uppercase">Citation Count</div>
                <div className="text-[18px] font-semibold text-brand-text mt-2 flex items-center justify-center gap-2">
                  <Quote className="h-4 w-4 text-brand-textMuted" />
                  {paper.citationCount?.toLocaleString() || 0}
                </div>
              </div>
              <div className="p-4 bg-brand-bg border border-brand-border rounded-lg">
                <div className="text-[11px] font-semibold text-brand-textMuted uppercase">Velocity</div>
                <div className="text-[18px] font-semibold text-brand-text mt-2 flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-brand-textMuted" />
                  {paper.metrics?.citationVelocity.toLocaleString() || 0} / yr
                </div>
              </div>
            </div>

            {/* Model stats breakdown */}
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between p-3 rounded-lg bg-brand-bg border border-brand-border">
                <span className="text-brand-textMuted font-medium">Method:</span>
                <span className="text-brand-text font-semibold">{paper.method || 'Standard baseline'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-brand-bg border border-brand-border">
                <span className="text-brand-textMuted font-medium">Model:</span>
                <span className="text-brand-text font-semibold">{paper.model || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-brand-bg border border-brand-border">
                <span className="text-brand-textMuted font-medium">Target Dataset:</span>
                <span className="text-brand-text font-semibold">{paper.dataset || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          {(paper.timeline && paper.timeline.length > 0) && (
            <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
              <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider">Citation Timeline</h3>
              
              <div className="relative border-l-2 border-brand-border pl-5 ml-2 space-y-6">
                {paper.timeline.map((eventObj, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand-text ring-4 ring-brand-surface"></span>
                    <div className="text-[12px] font-semibold text-brand-text">{eventObj.year}</div>
                    <p className="text-[13px] text-brand-textMuted leading-relaxed mt-1">
                      {eventObj.event}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Papers Card */}
          {(paper.relatedPapers && paper.relatedPapers.length > 0) && (
            <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
              <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Related Papers
              </h3>

              <div className="space-y-3">
                {paper.relatedPapers.slice(0, 4).map((relId) => {
                  const relPaper = paperCache[relId];
                  if (!relPaper) return null;
                  return (
                    <div
                      key={relId}
                      onClick={() => handleRelatedPaperClick(relId)}
                      className="p-4 rounded-lg border border-brand-border bg-brand-bg hover:bg-brand-surface hover:border-brand-accent/50 cursor-pointer transition-colors group"
                    >
                      <h4 className="text-[13px] font-medium text-brand-text group-hover:text-brand-accent transition-colors line-clamp-2 leading-snug">
                        {relPaper.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-brand-textMuted mt-2">
                        <span>{relPaper.publication}</span>
                        <span className="font-semibold">{relPaper.citationCount?.toLocaleString()} cites</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
