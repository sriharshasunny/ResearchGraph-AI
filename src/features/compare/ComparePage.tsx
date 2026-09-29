import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GitCompare, ArrowLeft, Plus, X, Sparkles } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const {
    comparisonPaperIds,
    toggleComparisonPaper,
    allPapers,
    setActivePage,
    setSearchQuery
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);

  // Default to first 2 or 3 papers if none selected for immediate rich demonstration
  const selectedPapers = comparisonPaperIds.length >= 2 
    ? allPapers.filter(p => comparisonPaperIds.includes(p.id))
    : allPapers.slice(2, 5); // DINOv2, MAE, DeepSeek-R1

  const aspects = [
    { key: 'year', label: 'Publication Year' },
    { key: 'problem', label: 'Research Problem' },
    { key: 'method', label: 'Core Method' },
    { key: 'architecture', label: 'Network Architecture' },
    { key: 'dataset', label: 'Primary Datasets' },
    { key: 'training', label: 'Training Objective' },
    { key: 'metrics', label: 'Key Evaluation Metrics' },
    { key: 'results', label: 'Empirical Results' },
    { key: 'strengths', label: 'Key Strengths' },
    { key: 'limitations', label: 'Limitations & Bottlenecks' }
  ];

  // Specific data mapping for structured academic comparison
  const paperMetadataMap: Record<string, Record<string, string>> = {
    p1: {
      year: '2017 (NeurIPS)',
      problem: 'Recurrence and convolution limits in sequence modeling',
      method: 'Pure multi-head self-attention without recurrence',
      architecture: 'Transformer Encoder-Decoder (6 layers each)',
      dataset: 'WMT 2014 English-to-German & English-to-French',
      training: 'Cross-entropy with label smoothing (epsilon = 0.1)',
      metrics: 'BLEU score, training time in FLOPs',
      results: '28.4 BLEU on En-De, setting new global SOTA',
      strengths: 'Massively parallel training, long-range dependency capture',
      limitations: 'Quadratic O(N^2) memory and compute complexity in sequence length'
    },
    p2: {
      year: '2020 (ICLR)',
      problem: 'Reliance on convolutional inductive bias in computer vision',
      method: 'Standard Transformer applied directly to image patches',
      architecture: 'ViT-Base / ViT-Large (16x16 patch projection)',
      dataset: 'ImageNet-1K, ImageNet-21k, JFT-300M',
      training: 'Supervised classification on massive datasets',
      metrics: 'Top-1 Accuracy on ImageNet',
      results: '88.55% Top-1 accuracy on ImageNet with JFT pre-training',
      strengths: 'Scales with data compute better than ResNets',
      limitations: 'Requires enormous datasets (JFT) to avoid overfitting'
    },
    p3: {
      year: '2023 (TMLR)',
      problem: 'Self-supervised vision features requiring heavy fine-tuning',
      method: 'Discriminative self-distillation with DINO & iBOT objectives',
      architecture: 'ViT-Giant (1B parameters) with SwiGLU FFN',
      dataset: 'LVD-142M curated dataset',
      training: 'Multi-crop self-distillation with KoLeo regularizer',
      metrics: 'Linear probing accuracy, k-NN evaluation, video segmentation',
      results: '86.5% linear probe on ImageNet without fine-tuning weights',
      strengths: 'Outstanding out-of-the-box frozen representations',
      limitations: 'High compute cost for curated dataset filtering'
    },
    p4: {
      year: '2022 (CVPR)',
      problem: 'Generative pre-training scalability in high-dimensional visual data',
      method: 'Masked autoencoding of high-ratio (75%) random patches',
      architecture: 'Asymmetric Encoder (visible only) + Lightweight Decoder',
      dataset: 'ImageNet-1K (no external data)',
      training: 'Mean Squared Error (MSE) on normalized pixel values',
      metrics: 'Fine-tuning accuracy on ImageNet-1K',
      results: '87.8% Top-1 on ImageNet-1K using ViT-Huge',
      strengths: '3x or more faster pre-training with extreme patch masking',
      limitations: 'Features less suitable for linear probing without full fine-tuning'
    },
    p5: {
      year: '2025 (arXiv)',
      problem: 'Supervised fine-tuning bias and reward hacking in complex reasoning',
      method: 'Group Relative Policy Optimization (GRPO) test-time compute',
      architecture: 'MoE Architecture with Rule-Based Reward Models',
      dataset: 'AIME 2024, MATH-500, Codeforces benchmarks',
      training: 'Reinforcement learning with multi-step rollout reflection',
      metrics: 'Pass@1 accuracy on MATH and competitive programming',
      results: 'Matches OpenAI o1 performance across mathematics and code',
      strengths: 'Completely bypasses value model memory overhead',
      limitations: 'High inference latency during test-time rollouts'
    }
  };

  const handleAskAIAboutComparison = () => {
    const paperTitles = selectedPapers.map(p => `"${p.title}"`).join(' vs ');
    setSearchQuery(`Generate a structured comparative synthesis between ${paperTitles}. Analyze their architectural differences, empirical trade-offs, and which to use for specific practical research workflows.`);
    setActivePage('chat');
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1360px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Return to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-blue-600" />
                  Compare Research Papers
                </h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Side-by-side empirical methodology and architectural trade-off evaluation (2–4 papers).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddOpen(!isAddOpen)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-[12px] flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Paper ({selectedPapers.length}/4)</span>
              </button>

              <button
                onClick={handleAskAIAboutComparison}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI About These Papers</span>
              </button>
            </div>
          </div>

          {/* Add Paper Quick Selector Dropdown */}
          {isAddOpen && (
            <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Select to add:</span>
              {allPapers.filter(p => !selectedPapers.some(sp => sp.id === p.id)).map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    toggleComparisonPaper(p.id);
                    setIsAddOpen(false);
                  }}
                  className="px-3 py-1 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 rounded-lg text-[11px] font-medium transition-colors"
                >
                  + {p.title.slice(0, 35)}...
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── STRUCTURED COMPARISON TABLE ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 sm:p-5 w-48 text-[12px] font-bold uppercase tracking-wider text-gray-500 shrink-0">
                    Evaluation Aspect
                  </th>
                  {selectedPapers.map(paper => (
                    <th key={paper.id} className="p-4 sm:p-5 min-w-[260px] text-[14px] font-bold text-gray-900 border-l border-gray-200 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                            {paper.venue || 'arXiv'}
                          </span>
                          <h3 className="mt-1 leading-snug">{paper.title}</h3>
                          <p className="text-[11px] font-normal text-gray-500 mt-1">{paper.authors[0]} et al.</p>
                        </div>
                        {selectedPapers.length > 2 && (
                          <button
                            onClick={() => toggleComparisonPaper(paper.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-700">
                {aspects.map(aspect => (
                  <tr key={aspect.key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-gray-900 bg-gray-50/40 border-r border-gray-100 text-[12px] uppercase tracking-wider">
                      {aspect.label}
                    </td>
                    {selectedPapers.map(paper => {
                      const data = paperMetadataMap[paper.id] || {};
                      let val = data[aspect.key];

                      if (!val) {
                        if (aspect.key === 'year') val = String(paper.year);
                        else if (aspect.key === 'problem') val = paper.abstract.slice(0, 90) + '...';
                        else if (aspect.key === 'method') val = paper.field || 'General AI';
                        else if (aspect.key === 'results') val = `${paper.citations.toLocaleString()} total citations recorded.`;
                        else if (aspect.key === 'strengths') val = paper.keyFindings?.[0] || 'Scalable architecture with solid empirical foundations.';
                        else val = 'Empirical analysis in source publication.';
                      }

                      return (
                        <td key={paper.id} className="p-4 sm:p-5 border-l border-gray-100 leading-relaxed font-sans">
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar: Ask AI About These Papers */}
          <div className="p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[13px] text-gray-600 font-medium">
              Ready to delve deeper? Inquire about specific mathematical equations or ablation trade-offs.
            </div>
            <button
              onClick={handleAskAIAboutComparison}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[13px] rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI About These Papers</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
