import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ArrowLeft, Search, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export const ResearchGapsPage: React.FC = () => {
  const { setActivePage, setSearchQuery } = useApp();

  const [topicInput, setTopicInput] = useState('Vision Transformers in Plant Pathology & Agriculture');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const initialGaps = [
    {
      id: 'g1',
      title: 'Limited evaluation on real-world agricultural & in-field microclimate datasets',
      desc: 'While models like DINOv2 and ViT achieve high accuracy on standard benchmarks (ImageNet, PlantVillage), few studies investigate domain shift caused by real-world shadows, leaf occlusion, and varying outdoor illumination.',
      evidence: [
        'DINOv2: Learning Robust Visual Features without Supervision (Oquab et al., 2023)',
        'An Image is Worth 16x16 Words (Dosovitskiy et al., 2020)',
        'Survey on Agricultural Computer Vision (2024)'
      ],
      confidence: 'High',
      recommendation: 'Collect multi-spectral UAV datasets paired with ground-truth soil sensor readings.'
    },
    {
      id: 'g2',
      title: 'Edge quantization & latency bottlenecks on low-power IoT drone hardware',
      desc: 'ViT architectures with billions of parameters (ViT-Giant) require substantial GPU compute. There is a marked deficit in post-training 4-bit quantization benchmarks tailored specifically for real-time robotic field scouting.',
      evidence: [
        'Masked Autoencoders Are Scalable Vision Learners (He et al., 2022)',
        'LoRA: Low-Rank Adaptation of Large Models (Hu et al., 2021)'
      ],
      confidence: 'Medium',
      recommendation: 'Evaluate structured pruning combined with integer quantization on NVIDIA Jetson / Raspberry Pi 5 accelerators.'
    },
    {
      id: 'g3',
      title: 'Lack of multimodal cross-modal grounding connecting visual lesions to genomic pathogen taxonomies',
      desc: 'Current diagnostic models classify leaf phenotypes in isolation without cross-referencing published genomic resistance markers or dynamic weather forecast time-series data.',
      evidence: [
        'Attention Is All You Need (Vaswani et al., 2017)',
        'Graph RAG: Unifying Knowledge Graphs with LLM Reasoning (2024)'
      ],
      confidence: 'Medium',
      recommendation: 'Construct a GraphRAG topology integrating NCBI genomic taxonomy with plant phenotype computer vision.'
    }
  ];

  const gaps = initialGaps;

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 800);
  };

  const handleExploreInChat = (gapTitle: string) => {
    setSearchQuery(`Help me develop a research grant hypothesis addressing the following potential research gap: "${gapTitle}". Suggest an empirical methodology and experimental design.`);
    setActivePage('chat');
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1140px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
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
                <Activity className="w-5 h-5 text-rose-600" />
                Discover Potential Research Gaps
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Analyze academic literature to identify unexplored frontiers, benchmark deficits, and methodology voids.
              </p>
            </div>
          </div>

          {/* Input & Analyze */}
          <form onSubmit={handleAnalyze} className="relative flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter a research topic (e.g. Graph Neural Networks in Drug Discovery)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[14px] text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-[13px] rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 border-t border-gray-100">
            <span className="text-gray-400 font-bold uppercase">Popular Topics:</span>
            {[
              'Vision Transformers in Plant Pathology',
              'Test-Time Compute in Mathematical Reasoning',
              'Graph Neural Networks in Multi-Hop RAG',
              'Parameter-Efficient Fine-Tuning in Low-Resource NLP'
            ].map((t, idx) => (
              <button
                key={idx}
                onClick={() => setTopicInput(t)}
                className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── NOTICE BADGE ── */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-[12px] text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Epistemic Notice:</span> Gaps represent <strong>Potential Research Gaps</strong> synthesized from published literature voids and empirical limitations. They require domain verification and novel experimentation.
          </div>
        </div>

        {/* ── POTENTIAL GAPS LIST ── */}
        <div className="space-y-4">
          {gaps.map((gap, idx) => (
            <div
              key={gap.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      POTENTIAL RESEARCH GAP #{idx + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      gap.confidence === 'High' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      Confidence: {gap.confidence}
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-snug">
                    {gap.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleExploreInChat(gap.title)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shrink-0 shadow-sm transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Draft Proposal with AI</span>
                </button>
              </div>

              <p className="text-[13px] text-gray-600 leading-relaxed font-sans">
                {gap.desc}
              </p>

              {/* Supporting Evidence */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[12px] space-y-1">
                <span className="font-bold text-gray-700 block uppercase text-[10px] tracking-wider">
                  Supporting Academic Evidence:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                  {gap.evidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Direction */}
              <div className="text-[12px] text-blue-900 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <span className="font-bold">Suggested Direction: </span>
                {gap.recommendation}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
