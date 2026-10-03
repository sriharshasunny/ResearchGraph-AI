import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GitCompare, ArrowLeft, Plus, X, Sparkles, Download, Search, CheckCircle2, AlertTriangle, LayoutPanelLeft } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const {
    comparisonPaperIds,
    toggleComparisonPaper,
    allPapers,
    setActivePage,
    setSearchQuery
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [baselineId, setBaselineId] = useState<string | null>(null);

  // Allow up to 10 papers
  const selectedPapers = comparisonPaperIds.length >= 2 
    ? allPapers.filter(p => comparisonPaperIds.includes(p.id)).slice(0, 10)
    : allPapers.slice(2, 5); // Default DINOv2, MAE, DeepSeek-R1

  const aspects = [
    { key: 'year', label: 'Publication Year', group: 'Overview' },
    { key: 'problem', label: 'Research Problem', group: 'Problem & Method' },
    { key: 'method', label: 'Core Method', group: 'Problem & Method' },
    { key: 'architecture', label: 'Network Architecture', group: 'Architecture' },
    { key: 'dataset', label: 'Primary Datasets', group: 'Data & Training' },
    { key: 'training', label: 'Training Objective', group: 'Data & Training' },
    { key: 'metrics', label: 'Key Evaluation Metrics', group: 'Results & Metrics' },
    { key: 'results', label: 'Empirical Results', group: 'Results & Metrics' },
    { key: 'strengths', label: 'Key Strengths', group: 'Overview' },
    { key: 'limitations', label: 'Limitations & Bottlenecks', group: 'Limitations' },
    { key: 'reproducibility', label: 'Reproducibility', group: 'Limitations' }
  ];

  // Specific data mapping
  const paperMetadataMap: Record<string, Record<string, string>> = {
    p1: {
      year: '2017 (NeurIPS)', problem: 'Recurrence and convolution limits in sequence modeling',
      method: 'Pure multi-head self-attention without recurrence', architecture: 'Transformer Encoder-Decoder (6 layers each)',
      dataset: 'WMT 2014 English-to-German & English-to-French', training: 'Cross-entropy with label smoothing (epsilon = 0.1)',
      metrics: 'BLEU score, training time in FLOPs', results: '28.4 BLEU on En-De, setting new global SOTA',
      strengths: 'Massively parallel training, long-range dependency capture', limitations: 'Quadratic O(N^2) memory and compute complexity in sequence length', reproducibility: 'Code released (Tensor2Tensor)'
    },
    p2: {
      year: '2020 (ICLR)', problem: 'Reliance on convolutional inductive bias in computer vision',
      method: 'Standard Transformer applied directly to image patches', architecture: 'ViT-Base / ViT-Large (16x16 patch projection)',
      dataset: 'ImageNet-1K, ImageNet-21k, JFT-300M', training: 'Supervised classification on massive datasets',
      metrics: 'Top-1 Accuracy on ImageNet', results: '88.55% Top-1 accuracy on ImageNet with JFT pre-training',
      strengths: 'Scales with data compute better than ResNets', limitations: 'Requires enormous datasets (JFT) to avoid overfitting', reproducibility: 'Code and weights released (JAX/Flax)'
    },
    p3: {
      year: '2023 (TMLR)', problem: 'Self-supervised vision features requiring heavy fine-tuning',
      method: 'Discriminative self-distillation with DINO & iBOT objectives', architecture: 'ViT-Giant (1B parameters) with SwiGLU FFN',
      dataset: 'LVD-142M curated dataset', training: 'Multi-crop self-distillation with KoLeo regularizer',
      metrics: 'Linear probing accuracy, k-NN evaluation, video segmentation', results: '86.5% linear probe on ImageNet without fine-tuning weights',
      strengths: 'Outstanding out-of-the-box frozen representations', limitations: 'High compute cost for curated dataset filtering', reproducibility: 'Code and weights released (PyTorch)'
    },
    p4: {
      year: '2022 (CVPR)', problem: 'Generative pre-training scalability in high-dimensional visual data',
      method: 'Masked autoencoding of high-ratio (75%) random patches', architecture: 'Asymmetric Encoder (visible only) + Lightweight Decoder',
      dataset: 'ImageNet-1K (no external data)', training: 'Mean Squared Error (MSE) on normalized pixel values',
      metrics: 'Fine-tuning accuracy on ImageNet-1K', results: '87.8% Top-1 on ImageNet-1K using ViT-Huge',
      strengths: '3x or more faster pre-training with extreme patch masking', limitations: 'Features less suitable for linear probing without full fine-tuning', reproducibility: 'Code released (PyTorch)'
    },
    p5: {
      year: '2025 (arXiv)', problem: 'Supervised fine-tuning bias and reward hacking in complex reasoning',
      method: 'Group Relative Policy Optimization (GRPO) test-time compute', architecture: 'MoE Architecture with Rule-Based Reward Models',
      dataset: 'AIME 2024, MATH-500, Codeforces benchmarks', training: 'Reinforcement learning with multi-step rollout reflection',
      metrics: 'Pass@1 accuracy on MATH and competitive programming', results: 'Matches OpenAI o1 performance across mathematics and code',
      strengths: 'Completely bypasses value model memory overhead', limitations: 'High inference latency during test-time rollouts', reproducibility: 'Code and weights released (DeepSeek)'
    }
  };

  const handleAskAIAboutComparison = () => {
    const paperTitles = selectedPapers.map(p => `"${p.title}"`).join(' vs ');
    setSearchQuery(`Generate a structured comparative synthesis between ${paperTitles}. Analyze their architectural differences, empirical trade-offs, and which to use for specific practical research workflows.`);
    setActivePage('chat');
  };

  const getCellValue = (paperId: string, aspectKey: string) => {
    const paper = selectedPapers.find(p => p.id === paperId)!;
    const data = paperMetadataMap[paperId] || {};
    let val = data[aspectKey];
    if (!val) {
      if (aspectKey === 'year') val = String(paper.year);
      else if (aspectKey === 'problem') val = paper.abstract.slice(0, 90) + '...';
      else if (aspectKey === 'method') val = paper.field || 'General AI';
      else if (aspectKey === 'results') val = `${paper.citations.toLocaleString()} total citations recorded.`;
      else if (aspectKey === 'strengths') val = paper.keyFindings?.[0] || 'Scalable architecture with solid empirical foundations.';
      else val = 'Empirical analysis in source publication.';
    }
    return val;
  };

  const isDifferentFromBaseline = (paperId: string, aspectKey: string) => {
    if (!baselineId || paperId === baselineId) return false;
    return getCellValue(paperId, aspectKey) !== getCellValue(baselineId, aspectKey);
  };

  const hasDifferencesInRow = (aspectKey: string) => {
    const values = selectedPapers.map(p => getCellValue(p.id, aspectKey));
    return new Set(values).size > 1;
  };

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-60px)] flex flex-col p-4 sm:p-6 lg:p-8 pb-24 bg-[var(--surface-bg,#F7FAFC)]">
      <div className="max-w-[1440px] w-full mx-auto space-y-6 flex-1 flex flex-col">

        {/* ── HEADER ── */}
        <div className="bg-[var(--surface,#ffffff)] rounded-2xl p-6 border border-[var(--border,#e5e7eb)] shadow-sm space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-2 rounded-xl text-[var(--text-muted,#9ca3af)] hover:text-[var(--text,#111827)] hover:bg-[var(--surface-raised,#f3f4f6)] transition-colors"
                title="Return to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text,#111827)] tracking-tight flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-[var(--accent,#2563eb)]" />
                  Compare Papers
                </h1>
                <p className="text-[13px] text-[var(--text-muted,#6b7280)] mt-0.5">
                  Structured side-by-side empirical benchmarking (up to 10 papers).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 mr-4 text-[13px] font-medium text-[var(--text,#374151)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showDiffOnly} onChange={(e) => setShowDiffOnly(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 bg-gray-100 border-gray-300" />
                  Show differences only
                </label>
              </div>

              <button
                onClick={() => setIsAddOpen(!isAddOpen)}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border,#e5e7eb)] text-[var(--text,#374151)] bg-[var(--surface,#ffffff)] hover:bg-[var(--surface-raised,#f9fafb)] font-semibold text-[12px] flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[var(--accent,#2563eb)]" />
                <span>Add ({selectedPapers.length}/10)</span>
              </button>
              <button className="px-3.5 py-1.5 rounded-xl border border-[var(--border,#e5e7eb)] text-[var(--text,#374151)] bg-[var(--surface,#ffffff)] hover:bg-[var(--surface-raised,#f9fafb)] font-semibold text-[12px] flex items-center gap-1.5 shadow-sm transition-all">
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Add Paper Quick Selector Dropdown */}
          {isAddOpen && (
            <div className="pt-3 border-t border-[var(--border,#f3f4f6)] flex flex-col gap-3">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search the index to add papers..." className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider">Suggested:</span>
                {allPapers.filter(p => !selectedPapers.some(sp => sp.id === p.id)).map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      toggleComparisonPaper(p.id);
                    }}
                    className="px-3 py-1 bg-[var(--surface-raised,#f9fafb)] hover:bg-blue-50 hover:text-blue-700 border border-[var(--border,#e5e7eb)] rounded-lg text-[11px] font-medium transition-colors"
                  >
                    + {p.title.slice(0, 35)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── AI SUMMARY BOX ── */}
        {selectedPapers.length >= 2 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm shrink-0">
            <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Summary: Which should I use?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-gray-700">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p><strong>For robust feature extraction:</strong> <span className="font-medium text-gray-900">{selectedPapers[0]?.title}</span> provides the best out-of-the-box frozen representations without requiring extensive fine-tuning.</p>
                </div>
                <div className="flex items-start gap-2">
                  <LayoutPanelLeft className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p><strong>For high-throughput pre-training:</strong> <span className="font-medium text-gray-900">{selectedPapers[1]?.title || 'MAE'}</span> scales better visually with high masking ratios (75%) but requires fine-tuning.</p>
                </div>
              </div>
              <div className="bg-white/60 p-3 rounded-xl border border-white">
                <p className="font-medium text-gray-900 mb-1">Key Conflict:</p>
                <p>The papers disagree on the necessity of <span className="font-mono text-xs bg-gray-200 px-1 rounded">reconstruction</span> vs <span className="font-mono text-xs bg-gray-200 px-1 rounded">distillation</span>. MAE argues pixel reconstruction forces holistic understanding, while DINOv2 claims it wastes capacity on high-frequency noise.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── STRUCTURED COMPARISON TABLE ── */}
        <div className="bg-[var(--surface,#ffffff)] rounded-2xl border border-[var(--border,#e5e7eb)] shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="sticky top-0 z-20 bg-[var(--surface,#ffffff)] shadow-[0_1px_0_0_var(--border,#e5e7eb)]">
                <tr>
                  <th className="p-4 sm:p-5 w-48 min-w-[200px] text-[12px] font-bold uppercase tracking-wider text-[var(--text-muted,#6b7280)] sticky left-0 z-30 bg-[var(--surface,#ffffff)] border-r border-[var(--border,#f3f4f6)] shadow-[1px_0_0_0_var(--border,#e5e7eb)]">
                    Evaluation Aspect
                  </th>
                  {selectedPapers.map((paper, idx) => (
                    <th key={paper.id} className="p-4 sm:p-5 w-72 min-w-[280px] max-w-[320px] text-[14px] font-bold text-[var(--text,#111827)] border-l border-[var(--border,#e5e7eb)] align-top relative bg-[var(--surface,#ffffff)] group">
                      <div className="flex flex-col h-full justify-between gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500', 'bg-rose-500'][idx % 7]}`} />
                            <span className="text-[10px] font-mono font-bold text-[var(--accent,#2563eb)] uppercase bg-blue-50 px-2 py-0.5 rounded">
                              {paper.venue || 'arXiv'}
                            </span>
                          </div>
                          {selectedPapers.length > 2 && (
                            <button
                              onClick={() => toggleComparisonPaper(paper.id)}
                              className="text-[var(--text-muted,#9ca3af)] hover:text-red-600 p-1"
                              title="Remove from comparison"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div>
                          <h3 className="leading-snug line-clamp-2 text-[14px]">{paper.title}</h3>
                          <p className="text-[12px] font-normal text-[var(--text-muted,#6b7280)] mt-1">{paper.authors[0]} et al.</p>
                        </div>
                        <button 
                          onClick={() => setBaselineId(baselineId === paper.id ? null : paper.id)}
                          className={`self-start text-[11px] font-medium px-2 py-1 rounded border transition-colors ${baselineId === paper.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {baselineId === paper.id ? '★ Baseline' : 'Set as baseline'}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border,#f3f4f6)] text-[13px] text-[var(--text,#374151)] relative z-0">
                {aspects.filter(a => !showDiffOnly || hasDifferencesInRow(a.key)).map(aspect => (
                  <tr key={aspect.key} className="hover:bg-[var(--surface-raised,#f9fafb)] transition-colors group/row">
                    <td className="p-4 sm:p-5 font-bold text-[var(--text,#111827)] bg-[var(--surface,#ffffff)] border-r border-[var(--border,#f3f4f6)] text-[12px] uppercase tracking-wider sticky left-0 z-10 shadow-[1px_0_0_0_var(--border,#e5e7eb)] group-hover/row:bg-[var(--surface-raised,#f9fafb)] transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-[var(--text-muted,#9ca3af)] font-mono">{aspect.group}</span>
                        <span>{aspect.label}</span>
                      </div>
                    </td>
                    {selectedPapers.map(paper => {
                      const val = getCellValue(paper.id, aspect.key);
                      const isDiff = isDifferentFromBaseline(paper.id, aspect.key);
                      
                      return (
                        <td key={paper.id} className={`p-4 sm:p-5 border-l border-[var(--border,#f3f4f6)] leading-relaxed font-sans relative group/cell ${isDiff ? 'bg-amber-50/30' : ''}`}>
                          <div className="flex flex-col gap-2">
                            <span>{val}</span>
                            <button className="hidden group-hover/cell:flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mt-1 absolute bottom-2 right-2 shadow-sm">
                              <Sparkles className="w-3 h-3" />
                              Explain simply
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
