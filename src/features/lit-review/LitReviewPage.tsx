import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { searchPapers } from '../../services/api';
import type { LitReview } from '../../types';
import { FileText, Sparkles, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';

export const LitReviewPage: React.FC = () => {
  const { reviews, addReview } = useApp();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'matrix' | 'gaps'>('summary');
  const [selectedReview, setSelectedReview] = useState<LitReview | null>(reviews[0] || null);
  const [progressStep, setProgressStep] = useState(0);

  const presets = [
    'Self-Supervised Vision Transformers',
    'Graph Representation Learning',
    'Low-Rank Adaptation (LoRA)',
    'RAG and Hallucination Mitigation'
  ];

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setProgressStep(0);

    // Run progressive steps loader
    const interval = setInterval(() => {
      setProgressStep((prev) => prev + 1);
    }, 1500);

    // Call API async while showing loader
    searchPapers(topic).then((fetchedPapers) => {
      clearInterval(interval);
      setProgressStep(4);
      
      const samplePapers = fetchedPapers.slice(0, 4);
      const newReview: LitReview = {
        id: `lr-${Date.now()}`,
        topic: topic,
        summary: `This literature review addresses the state of research in "${topic}". Based on the analyzed corpus of papers, the domain has seen rapid progress focusing on self-supervised optimization and parameter-efficient scaling. Current implementations achieve competitive results but suffer from hardware overhead and generalization challenges under distribution shifts.`,
        papers: samplePapers,
        comparisonTable: {
          headers: ['Paper Title', 'Year', 'Method', 'Dataset', 'Accuracy'],
          rows: samplePapers.map(p => [
            p.title.substring(0, 30) + '...',
            p.year.toString(),
            p.method || 'Standard baseline',
            p.dataset || 'Generic dataset',
            p.accuracy || 'N/A'
          ])
        },
        gaps: [
          { gap: 'Out-Of-Distribution Robustness', description: 'Models perform poorly when exposed to data collected outside their standard pre-training domain.', impact: 'High' },
          { gap: 'Resource Overhead', description: 'Training these models demands massive GPU farms, hindering smaller labs from participating in development.', impact: 'Medium' }
        ],
        futureWork: [
          'Develop highly distilled variants that maintain performance under a fraction of inference memory.',
          'Standardize cross-domain benchmarking procedures.'
        ],
        references: samplePapers.map(p => ({ title: p.title, authors: p.authors.join(', '), year: p.year }))
      };

      addReview(newReview);
      setSelectedReview(newReview);
      setIsGenerating(false);
    }).catch(err => {
      clearInterval(interval);
      setIsGenerating(false);
      console.error("Failed to generate literature review", err);
    });
  };

  const stepsList = [
    'Parsing paper indexes for query topics...',
    'Resolving citation network graphs...',
    'Building comparison matrices...',
    'Compiling executive summaries...'
  ];

  return (
    <div className="flex gap-6 max-w-6xl mx-auto h-[calc(100vh-100px)] relative overflow-hidden select-none bg-brand-surface border border-brand-border rounded-xl shadow-sm">
      
      {/* Left Review History Sidebar */}
      <aside className="w-64 border-r border-brand-border flex flex-col justify-between hidden md:flex flex-shrink-0 bg-brand-bg/50">
        <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
          <div className="p-5 text-[13px] font-semibold text-brand-text uppercase tracking-wider flex items-center gap-2 border-b border-brand-border flex-shrink-0">
            <FileText className="h-4 w-4 text-brand-textMuted" />
            Saved Reviews
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {reviews.map((rev) => (
              <button
                key={rev.id}
                onClick={() => {
                  setSelectedReview(rev);
                  setActiveTab('summary');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  selectedReview?.id === rev.id
                    ? 'bg-brand-surface border border-brand-border text-brand-text font-medium shadow-sm'
                    : 'text-brand-textMuted hover:bg-brand-border/30 border border-transparent'
                }`}
              >
                <div className="truncate">{rev.topic}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-surface">
        
        {/* Header / Input Section */}
        <div className="p-8 border-b border-brand-border bg-brand-surface flex-shrink-0">
          <form onSubmit={handleGenerate} className="flex gap-3 max-w-3xl">
            <input
              type="text"
              placeholder="Enter a literature review topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 h-12 px-5 rounded-lg border border-brand-border bg-brand-bg text-[14px] text-brand-text placeholder-brand-textMuted focus:outline-none focus:border-brand-accent transition-colors shadow-sm"
            />
            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="h-12 px-6 rounded-lg bg-brand-text hover:bg-brand-textMuted text-brand-surface text-[14px] font-medium transition-colors flex items-center gap-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
          </form>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 mt-4 items-center">
            <span className="text-[12px] font-semibold text-brand-textMuted uppercase mr-2">Topics:</span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setTopic(preset)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-brand-bg text-brand-textMuted hover:text-brand-text hover:border-brand-textMuted border border-brand-border transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Output Canvas */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto px-8 py-8 h-full">
            {isGenerating ? (
              /* Progressive Steps Loader */
              <div className="h-full flex flex-col items-center justify-center text-center">
                <RefreshCw className="h-8 w-8 text-brand-accent animate-spin mb-6" />
                <h4 className="text-[18px] font-semibold text-brand-text">Synthesizing Literature...</h4>
                <div className="mt-8 max-w-md w-full space-y-4">
                  {stepsList.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-left">
                      {progressStep > idx ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      ) : progressStep === idx ? (
                        <RefreshCw className="h-5 w-5 text-brand-accent animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-brand-border flex-shrink-0" />
                      )}
                      <span className={`text-[14px] ${progressStep === idx ? 'text-brand-text font-semibold' : 'text-brand-textMuted'}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedReview ? (
              /* Review Output Container */
              <div className="space-y-8 pb-12">
                
                {/* Review Header */}
                <div className="space-y-6">
                  <h3 className="text-[24px] font-semibold text-brand-text leading-tight">
                    {selectedReview.topic}
                  </h3>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-brand-border">
                    {(['summary', 'matrix', 'gaps'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-[13px] font-medium capitalize transition-colors border-b-2 ${
                          activeTab === tab
                            ? 'border-brand-accent text-brand-text'
                            : 'border-transparent text-brand-textMuted hover:text-brand-text'
                        }`}
                      >
                        {tab === 'matrix' ? 'Comparison Matrix' : tab === 'summary' ? 'Review Summary' : 'Research Gaps'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Outputs */}
                <div className="min-h-[300px]">
                  {activeTab === 'summary' && (
                    <div className="space-y-8">
                      {/* Executive Summary */}
                      <div className="text-[15px] leading-relaxed text-brand-text font-normal whitespace-pre-line">
                        {selectedReview.summary}
                      </div>

                      {/* Major Papers List */}
                      <div>
                        <h4 className="text-[13px] font-semibold text-brand-textMuted uppercase tracking-wider mb-4">Core Literature</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedReview.papers.map((paper, idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-brand-border bg-brand-surface flex flex-col justify-between group hover:border-brand-accent/50 transition-colors cursor-pointer">
                              <div className="space-y-2">
                                <span className="text-[10px] font-semibold text-brand-textMuted uppercase tracking-wide">
                                  Ref [{idx + 1}]
                                </span>
                                <h5 className="text-[14px] font-semibold text-brand-text line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
                                  {paper.title}
                                </h5>
                                <p className="text-[12px] text-brand-textMuted">{paper.authors.join(', ')} · {paper.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'matrix' && (
                    /* Comparison Grid Table */
                    <div className="overflow-x-auto rounded-xl border border-brand-border">
                      <table className="w-full text-[13px] text-left border-collapse">
                        <thead>
                          <tr className="bg-brand-bg border-b border-brand-border">
                            {selectedReview.comparisonTable.headers.map((h, i) => (
                              <th key={i} className="p-4 font-semibold text-brand-text whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReview.comparisonTable.rows.map((row, idx) => (
                            <tr key={idx} className="border-b border-brand-border last:border-0 hover:bg-brand-bg/50 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-4 text-brand-textMuted leading-relaxed">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'gaps' && (
                    /* Gaps and Future Work */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Gaps columns */}
                      <div className="space-y-4">
                        <h4 className="text-[13px] font-semibold text-brand-textMuted uppercase tracking-wider mb-4">Identified Gaps</h4>
                        <div className="space-y-4">
                          {selectedReview.gaps.map((gapObj, idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-brand-border bg-brand-bg">
                              <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                <span className="text-[14px] font-semibold text-brand-text">{gapObj.gap}</span>
                                <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded bg-brand-surface text-brand-textMuted border border-brand-border uppercase">
                                  {gapObj.impact}
                                </span>
                              </div>
                              <p className="text-[13px] leading-relaxed text-brand-textMuted">{gapObj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Future directions columns */}
                      <div className="space-y-4">
                        <h4 className="text-[13px] font-semibold text-brand-textMuted uppercase tracking-wider mb-4">Future Directions</h4>
                        <div className="space-y-3">
                          {selectedReview.futureWork.map((fw, idx) => (
                            <div key={idx} className="flex gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-bg text-[12px] font-semibold text-brand-textMuted flex-shrink-0">
                                {idx + 1}
                              </span>
                              <p className="text-[13px] text-brand-text leading-relaxed mt-0.5">
                                {fw}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reference list footer */}
                <div className="pt-8 mt-8 border-t border-brand-border">
                  <h4 className="text-[12px] font-semibold text-brand-textMuted uppercase tracking-wider mb-4">Bibliography</h4>
                  <div className="space-y-3 text-[13px] text-brand-textMuted">
                    {selectedReview.references.map((ref, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-medium text-brand-text">[{idx + 1}]</span>
                        <p>
                          <span className="font-medium text-brand-text">{ref.authors}</span>. "{ref.title}". ({ref.year}).
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center pb-20">
                <EmptyState
                  title="No Review Selected"
                  description="Select a review from the sidebar or generate a new one."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
