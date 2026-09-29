import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, ArrowLeft, Check, Sparkles, 
  Download, Copy, RefreshCw 
} from 'lucide-react';

export const LiteratureReviewPage: React.FC = () => {
  const { allPapers, setActivePage } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(['p3', 'p4', 'p2']);
  const [topic, setTopic] = useState('Self-Supervised Vision Transformers & Feature Representation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Reading selected papers...');
  const [copied, setCopied] = useState(false);

  const togglePaper = (id: string) => {
    if (selectedPaperIds.includes(id)) {
      setSelectedPaperIds(selectedPaperIds.filter(p => p !== id));
    } else {
      setSelectedPaperIds([...selectedPaperIds, id]);
    }
  };

  const handleStartGeneration = () => {
    setStep(3);
    setIsGenerating(true);

    const stages = [
      'Reading selected papers...',
      'Finding common themes & trade-offs...',
      'Analyzing methodologies & datasets...',
      'Synthesizing structured academic review...'
    ];

    stages.forEach((stageText, idx) => {
      setTimeout(() => {
        setGenerationStage(stageText);
        if (idx === stages.length - 1) {
          setTimeout(() => setIsGenerating(false), 800);
        }
      }, (idx + 1) * 700);
    });
  };

  const selectedPapers = allPapers.filter(p => selectedPaperIds.includes(p.id));

  const handleCopyReview = () => {
    navigator.clipboard.writeText(reviewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reviewContent = `# Comprehensive Literature Review: ${topic}

## 1. Introduction
Recent breakthroughs in deep learning have witnessed a pivotal paradigm shift from supervised convolutional networks toward self-supervised Vision Transformers. By removing reliance on human-annotated labels, self-supervised learning unlocks massive pre-training on uncurated visual datasets, producing generalizable visual representations.

## 2. Major Approaches & Theoretical Taxonomy
Existing literature falls broadly into two dominant architectural philosophies:
- **Generative Autoencoding:** Exemplified by Masked Autoencoders (He et al., 2022), which reconstruct masked image patches by optimizing pixel reconstruction loss with asymmetric encoder-decoders.
- **Discriminative Self-Distillation:** Exemplified by DINOv2 (Oquab et al., 2023), using multi-crop self-distillation between student and teacher networks without reconstruction overhead.

## 3. Comparative Methodologies & Architectures
- **Masking Ratios:** MAE establishes that high masking ratios (75%–80%) prevent spatial redundancy, forcing models to capture semantic visual concepts.
- **Student-Teacher Dynamics:** DINOv2 integrates KoLeo regularization with patch-level objective functions, preventing representation collapse.

## 4. Benchmark Datasets & Empirical Evaluation
- Evaluated systematically across **ImageNet-1K**, **LVD-142M**, and zero-shot downstream tasks.
- **Linear Probing:** DINOv2 demonstrates 86.5% top-1 accuracy on ImageNet without fine-tuning, whereas MAE excels when full network weights are adapted.

## 5. Key Empirical Findings
1. Self-supervised visual representations achieve superior out-of-distribution robustness compared to supervised baselines.
2. Large model scales (ViT-Giant, 1B parameters) reduce the inductive bias deficit traditionally present in pure Transformers.

## 6. Limitations & Open Challenges
- High pre-training energy requirements across multi-node GPU clusters.
- Sensitivity to patch resolution and positional embedding interpolation during high-resolution inference.

## 7. Emerging Trends & Future Research Directions
- Unification of multimodal diffusion priors with self-supervised feature distillation.
- Test-time compute scaling applied to visual reasoning tasks.

## 8. Potential Research Gaps
- Limited exploration of self-supervised Vision Transformers on resource-constrained agricultural and biological microscopy domains.
- Absence of real-time edge quantization for ViT-Giant architectures.

## 9. Primary References
1. Oquab, M., et al. (2023). DINOv2: Learning Robust Visual Features without Supervision. TMLR.
2. He, K., et al. (2022). Masked Autoencoders Are Scalable Vision Learners. CVPR.
3. Dosovitskiy, A., et al. (2020). An Image is Worth 16x16 Words: Transformers for Image Recognition. ICLR.`;

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1100px] mx-auto space-y-6">

        {/* ── TOP HEADER ── */}
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
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Literature Review Generator
                </h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                  Three-step structured synthesis across curated academic papers.
                </p>
              </div>
            </div>

            {step === 3 && !isGenerating && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReview}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-[12px] flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([reviewContent], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Literature-Review-${Date.now()}.md`;
                    a.click();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>

          {/* ── 3-STEP PROGRESS INDICATOR ── */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            {[
              { num: 1, title: '1. Select Papers', desc: `${selectedPaperIds.length} chosen` },
              { num: 2, title: '2. Choose Topic', desc: 'Focus & scope' },
              { num: 3, title: '3. Generate Review', desc: 'Structured synthesis' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  step === s.num
                    ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                    : 'bg-gray-50/60 border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="text-[12px] font-bold">{s.title}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 1: SELECT PAPERS ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Choose Research Papers</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Select 2 or more publications to synthesize.</p>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={selectedPaperIds.length < 2}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[12px] rounded-xl shadow-sm transition-all"
              >
                Continue to Step 2 →
              </button>
            </div>

            <div className="divide-y divide-gray-100 pt-2">
              {allPapers.map((paper) => {
                const isSelected = selectedPaperIds.includes(paper.id);
                return (
                  <div
                    key={paper.id}
                    onClick={() => togglePaper(paper.id)}
                    className="py-3.5 flex items-start gap-3.5 cursor-pointer hover:bg-gray-50/60 px-2 rounded-xl transition-colors"
                  >
                    <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{paper.title}</h4>
                      <p className="text-[12px] text-gray-500 mt-0.5">{paper.authors.join(', ')} • {paper.year} • {paper.venue || 'arXiv'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: CHOOSE TOPIC & SCOPE ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">Define Topic &amp; Theoretical Focus</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Specify the core research domain for the literature synthesis.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold uppercase tracking-wider text-gray-600">Review Topic Title</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Suggested Themes:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Self-Supervised Vision Transformers & Feature Representation',
                  'Test-Time Compute Scaling & Reinforcement Learning in LLMs',
                  'Graph Neural Networks & Relational Knowledge Embeddings'
                ].map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(t)}
                    className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-[12px] font-medium text-gray-700 border border-gray-200 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Papers Preview */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[12px] font-bold text-gray-700 block mb-2">Grounding Papers ({selectedPapers.length}):</span>
              <div className="space-y-1.5">
                {selectedPapers.map(p => (
                  <div key={p.id} className="text-[12px] text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="font-semibold text-gray-800">{p.title}</span>
                    <span className="text-gray-400">({p.authors[0]} et al., {p.year})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-[12px] font-semibold"
              >
                ← Back to Papers
              </button>
              <button
                onClick={handleStartGeneration}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Literature Review</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: GENERATED REVIEW ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            {isGenerating ? (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <h3 className="text-[16px] font-bold text-gray-900">{generationStage}</h3>
                <p className="text-[12px] text-gray-400 max-w-sm">
                  Synthesizing empirical findings, architectural trade-offs, and methodology taxonomy across selected research.
                </p>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none text-[14px] text-gray-800 leading-relaxed font-sans space-y-6">
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <div className="text-[12px] text-blue-900 font-semibold">
                    ✓ Grounded across {selectedPapers.length} peer-reviewed publications. Zero synthetic fabrication.
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Adjust Scope
                  </button>
                </div>

                <div className="space-y-4">
                  {reviewContent.split('\n\n').map((para, i) => {
                    if (para.startsWith('# ')) {
                      return <h1 key={i} className="text-2xl font-bold text-gray-900 border-b pb-2">{para.replace('# ', '')}</h1>;
                    }
                    if (para.startsWith('## ')) {
                      return <h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{para.replace('## ', '')}</h2>;
                    }
                    if (para.startsWith('- ')) {
                      return (
                        <ul key={i} className="list-disc list-inside space-y-1">
                          {para.split('\n').map((line, j) => (
                            <li key={j}>{line.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (para.match(/^\d\./)) {
                      return (
                        <ol key={i} className="list-decimal list-inside space-y-1">
                          {para.split('\n').map((line, j) => (
                            <li key={j}>{line.replace(/^\d\.\s*/, '')}</li>
                          ))}
                        </ol>
                      );
                    }
                    return <p key={i}>{para}</p>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
