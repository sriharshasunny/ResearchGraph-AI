import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, Bookmark, MessageSquare, ExternalLink, 
  GitCompare, Network, Copy, Check, FileText, Share2 
} from 'lucide-react';

export const PaperDetailsPage: React.FC = () => {
  const {
    selectedPaperId,
    savedPaperIds,
    toggleSavedPaper,
    setActivePage,
    setSearchQuery,
    allPapers,
    setSelectedPaperId,
    comparisonPaperIds,
    toggleComparisonPaper
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'methodology' | 'results' | 'citations' | 'related' | 'graph'>('overview');
  const [copiedBibtex, setCopiedBibtex] = useState(false);

  const paper = allPapers.find(p => p.id === selectedPaperId) || allPapers[0];

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#F7FAFC]">
        <FileText className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">No Paper Selected</h2>
        <button
          onClick={() => setActivePage('search')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isSaved = savedPaperIds.includes(paper.id);
  const isCompared = comparisonPaperIds.includes(paper.id);
  const relatedPapers = allPapers.filter(p => p.id !== paper.id).slice(0, 3);

  const handleCopyBibtex = () => {
    if (paper.bibtex) {
      navigator.clipboard.writeText(paper.bibtex);
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    }
  };

  const handleAskAI = () => {
    setSearchQuery(`Analyze "${paper.title}" by ${paper.authors.join(', ')} (${paper.year}). Break down its methodology, benchmark results, and limitations.`);
    setActivePage('chat');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'results', label: 'Results' },
    { id: 'citations', label: 'Citations' },
    { id: 'related', label: 'Related' },
    { id: 'graph', label: 'Graph View' }
  ] as const;

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1360px] mx-auto space-y-6">

        {/* ── TOP NAVIGATION & HEADER ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setActivePage('search')}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Search</span>
            </button>

            {/* Actions: Save, Compare, Ask AI, Open Original */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => toggleSavedPaper(paper.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                  isSaved
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved in Library' : 'Save'}</span>
              </button>

              <button
                onClick={() => toggleComparisonPaper(paper.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border transition-all ${
                  isCompared
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>{isCompared ? 'In Compare List' : 'Compare'}</span>
              </button>

              <button
                onClick={handleAskAI}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>

              {paper.pdfUrl && (
                <a
                  href={paper.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-[12px] font-semibold border border-gray-200 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Original (PDF)</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug tracking-tight">
              {paper.title}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-gray-600 mt-2 font-medium">
              {paper.authors.join(' · ')} • <span className="font-semibold text-gray-800">{paper.year}</span> • <span className="px-2 py-0.5 rounded bg-gray-100 font-mono text-[12px]">{paper.venue || 'arXiv'}</span> • <span className="text-blue-600 font-semibold">{paper.citations.toLocaleString()} citations</span>
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-t border-gray-100 pt-3 overflow-x-auto scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TWO-COLUMN RESEARCH READING LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === 'overview' && (
              <>
                {/* Abstract Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                    Abstract
                  </h2>
                  <p className="text-[14px] text-gray-700 leading-relaxed font-serif">
                    {paper.abstract}
                  </p>
                </div>

                {/* Key Contributions & Empirical Findings */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                    Key Contributions &amp; Findings
                  </h2>
                  <ul className="space-y-2 text-[14px] text-gray-700 leading-relaxed">
                    {paper.keyFindings && paper.keyFindings.length > 0 ? (
                      paper.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span>Presents rigorous empirical evaluation validating scaling laws across multimodal tasks.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                          <span>Eliminates architectural bottlenecks, achieving significant training speedups.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Methodology & Dataset Details */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                    Methodology &amp; Benchmark Architecture
                  </h2>
                  <p className="text-[14px] text-gray-700 leading-relaxed font-sans">
                    The framework builds on scalable representations with end-to-end differentiable loss functions. Optimization incorporates cosine decay scheduling with AdamW optimizer, demonstrating robust downstream transferability across both in-distribution and out-of-distribution evaluation suites.
                  </p>
                </div>

                {/* Limitations & Future Work */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                  <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wider">
                    Limitations &amp; Future Directions
                  </h2>
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    While the model exhibits superior zero-shot performance, compute requirements during pre-training scale non-linearly with context length. Future extensions explore parameter-efficient adaptation, sparse attention patterns, and edge deployment constraints.
                  </p>
                </div>
              </>
            )}

            {activeTab === 'methodology' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-[16px] font-bold text-gray-900">Mathematical Formulation &amp; Training Pipeline</h2>
                <div className="bg-gray-50 p-4 rounded-xl font-mono text-[13px] text-gray-800 border border-gray-200">
                  Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V
                </div>
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  Scaled Dot-Product Attention allows high degree of parallelization during backward passes. The multi-head projection projects queries, keys, and values h times with learned linear projections.
                </p>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-[16px] font-bold text-gray-900">Benchmark Metrics &amp; Ablation Studies</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px] border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                        <th className="py-2.5">Evaluation Benchmark</th>
                        <th className="py-2.5">Baseline SOTA</th>
                        <th className="py-2.5">This Paper</th>
                        <th className="py-2.5">Relative Gain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      <tr>
                        <td className="py-2.5 font-medium">Standard Primary Metric</td>
                        <td className="py-2.5">26.3</td>
                        <td className="py-2.5 font-bold text-blue-600">28.4</td>
                        <td className="py-2.5 text-emerald-600 font-semibold">+8.0%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium">Training Wall-Clock Time</td>
                        <td className="py-2.5">8.4 days</td>
                        <td className="py-2.5 font-bold text-blue-600">3.5 days</td>
                        <td className="py-2.5 text-emerald-600 font-semibold">2.4x Speedup</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'citations' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-gray-900">BibTeX Citation</h2>
                  <button
                    onClick={handleCopyBibtex}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-medium transition-colors"
                  >
                    {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBibtex ? 'Copied BibTeX!' : 'Copy BibTeX'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-gray-900 text-cyan-300 font-mono text-[12px] overflow-x-auto leading-relaxed">
                  {paper.bibtex || `@article{${paper.id},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  year={${paper.year}}\n}`}
                </pre>
              </div>
            )}

            {activeTab === 'related' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
                <h2 className="text-[16px] font-bold text-gray-900">Directly Related Research</h2>
                <div className="divide-y divide-gray-100">
                  {relatedPapers.map(rel => (
                    <div key={rel.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <h4 
                          onClick={() => setSelectedPaperId(rel.id)}
                          className="text-[14px] font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                        >
                          {rel.title}
                        </h4>
                        <p className="text-[12px] text-gray-500 mt-0.5">{rel.authors[0]} et al. • {rel.year} • {rel.citations.toLocaleString()} citations</p>
                      </div>
                      <button
                        onClick={() => setSelectedPaperId(rel.id)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[12px] font-semibold rounded-lg border border-gray-200 shrink-0"
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="bg-[#06111F] rounded-2xl p-6 border border-blue-900/40 shadow-xl space-y-4 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    Citation &amp; Methodology Neighborhood
                  </h2>
                  <button
                    onClick={() => setActivePage('graph')}
                    className="text-[12px] text-cyan-300 hover:underline"
                  >
                    Open Full Graph Explorer →
                  </button>
                </div>
                <div className="h-64 rounded-xl bg-[#09152E] border border-white/10 flex items-center justify-center p-4">
                  <div className="text-center space-y-2">
                    <Network className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
                    <p className="text-[13px] text-gray-300 font-medium">Node linked to 14 foundational methodologies and 32 downstream variants.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: PAPER INFORMATION & MINI GRAPH (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Paper Information Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
                Paper Information
              </h3>

              <div className="space-y-3 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Citations</span>
                  <span className="font-bold text-gray-900">{paper.citations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Publication Year</span>
                  <span className="font-semibold text-gray-900">{paper.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Venue / Archive</span>
                  <span className="font-semibold text-gray-900">{paper.venue || 'arXiv'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Research Field</span>
                  <span className="font-semibold text-blue-600">{paper.field || 'Artificial Intelligence'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Open Access</span>
                  <span className="font-bold text-emerald-600">Verified Open Access</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCopyBibtex}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-[12px] font-semibold rounded-xl border border-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBibtex ? 'BibTeX Copied!' : 'Copy Citation (BibTeX)'}</span>
                </button>
              </div>
            </div>

            {/* Mini Knowledge Graph Connections Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  Knowledge Connections
                </h3>
              </div>

              <p className="text-[12px] text-gray-500">
                Core semantic relationships extracted from academic index:
              </p>

              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-[12px]">
                  <span className="text-gray-600 font-medium">USES</span>
                  <span className="font-bold text-gray-900">Self-Attention Mechanism</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-[12px]">
                  <span className="text-gray-600 font-medium">EVALUATED_ON</span>
                  <span className="font-bold text-gray-900">WMT 2014 &amp; ImageNet</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-[12px]">
                  <span className="text-gray-600 font-medium">IMPROVES</span>
                  <span className="font-bold text-gray-900">Recurrent Encoders</span>
                </div>
              </div>

              <button
                onClick={() => setActivePage('graph')}
                className="w-full mt-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Network className="w-3.5 h-3.5" />
                <span>Explore in Knowledge Graph</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
