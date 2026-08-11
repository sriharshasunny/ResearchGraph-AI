import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockPapers } from '../../data/mockData';
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
    'Self-Supervised Vision Transformers (SSL-ViT)',
    'Graph Representation Learning for Drug Discovery',
    'Low-Rank Adaptation (LoRA) and LLM Parameter Efficiency',
    'Retrieval-Augmented Generation (RAG) and Hallucination Mitigation'
  ];

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setProgressStep(0);

    // Run progressive steps loader
    const interval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          
          // Generate new LitReview mock object
          const samplePapers = mockPapers.slice(0, 4);
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
          return 0;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const stepsList = [
    'Parsing paper indexes for query topics...',
    'Resolving citation network graphs...',
    'Building comparison matrices...',
    'Compiling executive summaries...'
  ];

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-1 h-[calc(100vh-100px)] relative overflow-hidden select-none">
      
      {/* Left Review History Sidebar */}
      <aside className="w-64 border-r border-slate-200/80 dark:border-slate-800/40 flex flex-col justify-between hidden md:flex flex-shrink-0 bg-slate-50/20 dark:bg-slate-950/10 p-4">
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/60 dark:border-slate-800/30 pb-3">
            <FileText className="h-4.5 w-4.5 text-indigo-500" />
            Generated Reviews
          </div>

          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none pr-0.5">
            {reviews.map((rev) => (
              <button
                key={rev.id}
                onClick={() => {
                  setSelectedReview(rev);
                  setActiveTab('summary');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedReview?.id === rev.id
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-650 dark:text-indigo-400 shadow-sm'
                    : 'bg-transparent border-transparent text-slate-650 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'
                }`}
              >
                <div className="line-clamp-2 leading-snug">{rev.topic}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border border-indigo-100 dark:border-indigo-950/45 bg-indigo-50/25 dark:bg-indigo-950/10 rounded-xl text-[10px] text-indigo-600 dark:text-indigo-400 leading-normal">
          ⚡ Literatures are synthesized instantly utilizing metadata schemas and cross-citations.
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Form Input Section */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm mb-6 flex-shrink-0">
          <form onSubmit={handleGenerate} className="flex gap-3">
            <input
              type="text"
              placeholder="Enter a literature review topic (e.g. Self-Supervised Vision Transformers)..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200/85 dark:border-slate-800/85 bg-white dark:bg-slate-950/40 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!topic.trim() || isGenerating}
              className="h-11 px-5 rounded-xl bg-indigo-650 hover:bg-indigo-755 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
          </form>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-3 items-center">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mr-1">Presets:</span>
            {presets.slice(0, 3).map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopic(preset);
                }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded bg-slate-100/50 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/10 transition-all"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Output Canvas */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isGenerating ? (
            /* Progressive Steps Loader */
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white/20 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Synthesizing Literature Review...</h4>
              <div className="mt-4 max-w-sm w-full space-y-2">
                {stepsList.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-left text-xs font-medium">
                    {progressStep > idx ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    ) : progressStep === idx ? (
                      <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-350 dark:border-slate-800 flex-shrink-0" />
                    )}
                    <span className={progressStep === idx ? 'text-slate-850 dark:text-slate-100 font-bold' : 'text-slate-400 dark:text-slate-500'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedReview ? (
            /* Review Output Container */
            <div className="space-y-6 pb-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/60 dark:border-slate-800/30 pb-3 flex-wrap gap-3">
                <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 leading-snug">
                  {selectedReview.topic}
                </h3>
                
                {/* Tabs */}
                <div className="flex bg-slate-100/80 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200/20">
                  {(['summary', 'matrix', 'gaps'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold capitalize transition-all ${
                        activeTab === tab
                          ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 border border-slate-200/50 dark:border-slate-800/80 shadow-sm'
                          : 'text-slate-550 dark:text-slate-450 hover:text-slate-900'
                      }`}
                    >
                      {tab === 'matrix' ? 'Comparison Matrix' : tab === 'summary' ? 'Review Summary' : 'Research Gaps'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Outputs */}
              <div className="min-h-[220px]">
                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    {/* Executive Summary Card */}
                    <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm">
                      <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-3">Executive Summary</h4>
                      <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-350 whitespace-pre-line font-medium">
                        {selectedReview.summary}
                      </p>
                    </div>

                    {/* Major Papers List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReview.papers.map((paper, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-150 dark:border-slate-850 bg-white/30 dark:bg-slate-900/20 backdrop-blur-md flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                              Core reference [{idx + 1}]
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                              {paper.title}
                            </h5>
                            <p className="text-[10px] text-slate-500">{paper.authors.join(', ')}</p>
                          </div>
                          <div className="text-[10px] text-slate-650 dark:text-slate-350 italic mt-3 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-lg border border-slate-100">
                            "{paper.abstract.substring(0, 110)}..."
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'matrix' && (
                  /* Comparison Grid Table */
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/45 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/30 border-b border-slate-200/60 dark:border-slate-800/50">
                          {selectedReview.comparisonTable.headers.map((h, i) => (
                            <th key={i} className="p-4 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReview.comparisonTable.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/30">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-4 text-slate-650 dark:text-slate-350 leading-relaxed">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'gaps' && (
                  /* Gaps and Future Work */
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Gaps columns (Span 2) */}
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest pl-1">Identified Research Gaps</h4>
                      <div className="space-y-4">
                        {selectedReview.gaps.map((gapObj, idx) => (
                          <div key={idx} className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/45 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md flex gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{gapObj.gap}</span>
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-150 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                                  {gapObj.impact} Impact
                                </span>
                              </div>
                              <p className="text-[11.5px] leading-relaxed text-slate-500">{gapObj.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Future directions columns (Span 1) */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest pl-1">Future Directions</h4>
                      <div className="p-5 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 backdrop-blur-md space-y-4">
                        {selectedReview.futureWork.map((fw, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] font-bold text-indigo-650 dark:text-indigo-400 flex-shrink-0">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
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
              <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850/40 bg-slate-50/40 dark:bg-slate-950/10">
                <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-3.5">Review References</h4>
                <div className="space-y-2 text-[11px] text-slate-500">
                  {selectedReview.references.map((ref, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="font-semibold">[{idx + 1}]</span>
                      <p>
                        <span className="font-bold text-slate-750 dark:text-slate-350">{ref.authors}</span>. "{ref.title}". ({ref.year}).
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <EmptyState
              title="No Literature Reviews Generated"
              description="Type a research topic in the generator input box at the top to build a comprehensive literature analysis."
            />
          )}
        </div>
      </div>

    </div>
  );
};
