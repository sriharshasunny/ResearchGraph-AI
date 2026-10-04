import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, ArrowLeft, Search, Sparkles, MessageSquare, 
  AlertCircle, Bookmark, Check, Plus, ExternalLink,
  ChevronDown, ChevronUp, X, Download, Copy, FileText
} from 'lucide-react';

interface ResearchGap {
  id: string;
  title: string;
  desc: string;
  evidence: { paperId: string; title: string; authors: string; year: number }[];
  confidenceScore: number; // 0 - 100
  confidenceLabel: 'High' | 'Medium' | 'Exploratory';
  confidenceReason: string;
  impactLevel: 'Breakthrough' | 'High Impact' | 'Incremental';
  recommendation: string;
  field: string;
}

export const ResearchGapsPage: React.FC = () => {
  const { setActivePage, setSearchQuery, setSelectedPaperId } = useApp();

  const [topicInput, setTopicInput] = useState('Vision Transformers in Plant Pathology & Agriculture');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterConfidence, setFilterConfidence] = useState<'All' | 'High' | 'Medium'>('All');
  const [filterImpact, setFilterImpact] = useState<'All' | 'Breakthrough' | 'High Impact' | 'Incremental'>('All');
  const [sortBy, setSortBy] = useState<'confidence' | 'impact' | 'title'>('confidence');

  // Epistemic notice collapsible & dismissible state
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false);
  const [isNoticeCollapsed, setIsNoticeCollapsed] = useState(false);

  // Saved gaps state
  const [savedGapIds, setSavedGapIds] = useState<string[]>(['g1']);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Proposal Draft State & Modal
  const [proposalGapIds, setProposalGapIds] = useState<string[]>(['g1']);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);

  const initialGaps: ResearchGap[] = [
    {
      id: 'g1',
      title: 'Limited evaluation on real-world agricultural & in-field microclimate domain shifts',
      desc: 'While models like DINOv2 and ViT achieve high benchmark accuracy (ImageNet, PlantVillage), few studies investigate domain shift caused by real-world shadows, leaf occlusion, soil reflectance, and outdoor illumination variations.',
      evidence: [
        { paperId: 'p3', title: 'DINOv2: Learning Robust Visual Features without Supervision', authors: 'M. Oquab et al.', year: 2023 },
        { paperId: 'p2', title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition', authors: 'A. Dosovitskiy et al.', year: 2020 }
      ],
      confidenceScore: 92,
      confidenceLabel: 'High',
      confidenceReason: 'Supported by 4 independent empirical benchmarks and 2 conflicting ablation studies across published literature.',
      impactLevel: 'Breakthrough',
      recommendation: 'Collect multi-spectral UAV in-field datasets paired with ground-truth environmental sensor telemetry.',
      field: 'Computer Vision & Agriculture'
    },
    {
      id: 'g2',
      title: 'Post-training edge quantization & latency bottlenecks on low-power IoT drone hardware',
      desc: 'ViT architectures with billions of parameters (ViT-Giant) require substantial GPU compute. There is a marked deficit in post-training 4-bit/8-bit quantization benchmarks tailored specifically for real-time field robotics.',
      evidence: [
        { paperId: 'p4', title: 'Masked Autoencoders Are Scalable Vision Learners (MAE)', authors: 'K. He et al.', year: 2022 },
        { paperId: 'p8', title: 'LoRA: Low-Rank Adaptation of Large Models', authors: 'E. Hu et al.', year: 2021 }
      ],
      confidenceScore: 84,
      confidenceLabel: 'High',
      confidenceReason: 'Grounded in documented compute profiling across mobile Jetson and Raspberry Pi benchmarks.',
      impactLevel: 'High Impact',
      recommendation: 'Evaluate structured pruning combined with integer quantization on NVIDIA Jetson Orin accelerators.',
      field: 'Edge Computing & Hardware Acceleration'
    },
    {
      id: 'g3',
      title: 'Absence of multimodal cross-modal grounding connecting visual lesions to pathogen genomic taxonomies',
      desc: 'Current diagnostic models classify leaf phenotypes in isolation without cross-referencing published genomic resistance markers or dynamic weather forecast time-series data.',
      evidence: [
        { paperId: 'p1', title: 'Attention Is All You Need', authors: 'A. Vaswani et al.', year: 2017 },
        { paperId: 'p5', title: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL', authors: 'DeepSeek-AI', year: 2025 }
      ],
      confidenceScore: 78,
      confidenceLabel: 'Medium',
      confidenceReason: 'Derived from cross-domain taxonomy deficits between NCBI pathogen genomes and computer vision literature.',
      impactLevel: 'Breakthrough',
      recommendation: 'Construct a GraphRAG knowledge topology integrating NCBI genomic taxonomy with plant phenotype computer vision.',
      field: 'Multimodal AI & Genomics'
    },
    {
      id: 'g4',
      title: 'Lack of uncertainty quantification in automated pathogen severity scoring',
      desc: 'Standard classification models output uncalibrated softmax confidence scores that fail to distinguish between unfamiliar disease phenotypes and blurry camera artifacts, risking false negative diagnoses in production greenhouses.',
      evidence: [
        { paperId: 'p3', title: 'DINOv2: Learning Robust Visual Features without Supervision', authors: 'M. Oquab et al.', year: 2023 }
      ],
      confidenceScore: 71,
      confidenceLabel: 'Medium',
      confidenceReason: 'Supported by clinical pathology calibration studies demonstrating overconfidence in OOD test scenarios.',
      impactLevel: 'Incremental',
      recommendation: 'Incorporate conformal prediction bands and Bayesian dropout ensembles for calibrated severity intervals.',
      field: 'Trustworthy AI & Calibration'
    }
  ];

  const [gaps] = useState<ResearchGap[]>(initialGaps);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 700);
  };

  const handleExploreInChat = (gapTitle: string) => {
    setSearchQuery(`Help me develop a research grant proposal addressing this research gap: "${gapTitle}". Break down theoretical justification, specific aims, empirical methodology, and expected results.`);
    setActivePage('chat');
  };

  const handleOpenPaper = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActivePage('details');
  };

  const toggleSaveGap = (gapId: string) => {
    if (savedGapIds.includes(gapId)) {
      setSavedGapIds(prev => prev.filter(id => id !== gapId));
      setSavedToast('Gap removed from saved library.');
    } else {
      setSavedGapIds(prev => [...prev, gapId]);
      setSavedToast('Gap saved to research library.');
    }
    setTimeout(() => setSavedToast(null), 2500);
  };

  const toggleAddToProposal = (gapId: string) => {
    if (proposalGapIds.includes(gapId)) {
      setProposalGapIds(prev => prev.filter(id => id !== gapId));
    } else {
      setProposalGapIds(prev => [...prev, gapId]);
    }
  };

  // Filter and sort gaps
  const filteredGaps = gaps
    .filter(g => {
      if (filterConfidence !== 'All' && g.confidenceLabel !== filterConfidence) return false;
      if (filterImpact !== 'All' && g.impactLevel !== filterImpact) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
      if (sortBy === 'impact') {
        const score = (lvl: string) => lvl === 'Breakthrough' ? 3 : lvl === 'High Impact' ? 2 : 1;
        return score(b.impactLevel) - score(a.impactLevel);
      }
      return a.title.localeCompare(b.title);
    });

  const selectedProposalGaps = gaps.filter(g => proposalGapIds.includes(g.id));

  const proposalMarkdown = `# Research Grant Proposal Outline\n` +
    `Generated by ResearchGraph AI · Topic: ${topicInput}\n\n` +
    `## Executive Summary\n` +
    `This proposal addresses ${selectedProposalGaps.length} critical, unresolved research gaps identified through systematic literature indexing.\n\n` +
    `## Specific Aims & Targeted Research Gaps\n` +
    selectedProposalGaps.map((g, idx) => (
      `### Aim ${idx + 1}: ${g.title}\n` +
      `- Problem Statement: ${g.desc}\n` +
      `- Proposed Methodology: ${g.recommendation}\n` +
      `- Confidence Rating: ${g.confidenceScore}% (${g.confidenceReason})\n`
    )).join('\n') +
    `\n## Experimental Plan & Benchmarks\n` +
    `- Dataset Procurement & Domain Shift Validation\n` +
    `- Ablation Studies & Metric Evaluation\n` +
    `- Open-Source Code, Model Weights, & Reproduction Protocol\n`;

  const handleCopyProposal = () => {
    navigator.clipboard.writeText(proposalMarkdown);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2000);
  };

  const handleDownloadProposal = () => {
    const blob = new Blob([proposalMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Research-Proposal-Outline-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1140px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('dashboard')}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 transition-colors"
                title="Return to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-600" />
                  Discover Potential Research Gaps
                </h1>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Analyze academic literature to identify unexplored frontiers, benchmark deficits, and methodology voids.
                </p>
              </div>
            </div>

            {proposalGapIds.length > 0 && (
              <button
                onClick={() => setIsProposalModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>Proposal Outline ({proposalGapIds.length})</span>
              </button>
            )}
          </div>

          {/* Input & Analyze */}
          <form onSubmit={handleAnalyze} className="relative flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter a research topic (e.g. Graph Neural Networks in Drug Discovery)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04] text-[14px] text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:bg-[#111D35] transition-colors"
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
          <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1 border-t border-gray-100 dark:border-white/[0.04]">
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
                className="px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/[0.04] hover:bg-blue-50 text-gray-600 dark:text-gray-300 hover:text-blue-700 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── COLLAPSIBLE & DISMISSIBLE EPISTEMIC NOTICE ── */}
        {!isNoticeDismissed && (
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[13px]">Epistemic Notice: Academic Void Synthesis</span>
                  {!isNoticeCollapsed && (
                    <p className="text-[12px] text-amber-800/90 mt-1 leading-relaxed">
                      These identified gaps represent potential opportunities derived from automated contrastive analysis of published benchmark metrics, empirical limitations, and author disclosures. They require rigorous domain verification, pilot experimentation, and primary literature corroboration prior to grant submission.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsNoticeCollapsed(!isNoticeCollapsed)}
                  className="p-1 rounded-lg hover:bg-amber-100/60 text-amber-700 transition-colors"
                  title={isNoticeCollapsed ? 'Expand notice' : 'Collapse notice'}
                >
                  {isNoticeCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsNoticeDismissed(true)}
                  className="p-1 rounded-lg hover:bg-amber-100/60 text-amber-700 transition-colors"
                  title="Dismiss notice"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FILTERS & SORT CONTROLS ── */}
        <div className="bg-white dark:bg-[#111D35] rounded-2xl p-4 border border-gray-200 dark:border-white/[0.06] shadow-sm flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">Filter by:</span>
            
            {/* Confidence filter */}
            <div className="flex items-center p-0.5 bg-gray-100 rounded-xl">
              {(['All', 'High', 'Medium'] as const).map(conf => (
                <button
                  key={conf}
                  onClick={() => setFilterConfidence(conf)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterConfidence === conf ? 'bg-white dark:bg-[#111D35] text-blue-700 shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                  }`}
                >
                  {conf === 'All' ? 'All Confidence' : `${conf} Conf`}
                </button>
              ))}
            </div>

            {/* Impact filter */}
            <div className="flex items-center p-0.5 bg-gray-100 rounded-xl">
              {(['All', 'Breakthrough', 'High Impact', 'Incremental'] as const).map(imp => (
                <button
                  key={imp}
                  onClick={() => setFilterImpact(imp)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterImpact === imp ? 'bg-white dark:bg-[#111D35] text-blue-700 shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                  }`}
                >
                  {imp}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#111D35] font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="confidence">Highest Confidence</option>
              <option value="impact">Highest Impact</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Toast confirmation */}
        {savedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-[12px] flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedToast}</span>
          </div>
        )}

        {/* ── POTENTIAL GAPS LIST ── */}
        <div className="space-y-4">
          {filteredGaps.map((gap, idx) => {
            const isSaved = savedGapIds.includes(gap.id);
            const isInProposal = proposalGapIds.includes(gap.id);

            return (
              <div
                key={gap.id}
                className="bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm hover:border-blue-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        POTENTIAL RESEARCH GAP #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {gap.field}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        gap.impactLevel === 'Breakthrough' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : gap.impactLevel === 'High Impact'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 dark:text-gray-200'
                      }`}>
                        {gap.impactLevel}
                      </span>
                    </div>

                    <h3 className="text-[16px] font-bold text-gray-900 dark:text-white leading-snug">
                      {gap.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => toggleSaveGap(gap.id)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                        isSaved ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/[0.06]'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save gap'}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => toggleAddToProposal(gap.id)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                        isInProposal ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/[0.06]'
                      }`}
                    >
                      {isInProposal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isInProposal ? 'In Proposal' : '+ Proposal'}</span>
                    </button>

                    <button
                      onClick={() => handleExploreInChat(gap.title)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Draft Proposal</span>
                    </button>
                  </div>
                </div>

                <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                  {gap.desc}
                </p>

                {/* ── CONFIDENCE METER WITH EXPLANATION ── */}
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-gray-700 dark:text-gray-200">Synthesized Confidence Rating:</span>
                    <span className="font-mono font-extrabold text-blue-600">{gap.confidenceScore}% ({gap.confidenceLabel})</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        gap.confidenceScore >= 85 ? 'bg-emerald-500' : gap.confidenceScore >= 75 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${gap.confidenceScore}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                    {gap.confidenceReason}
                  </p>
                </div>

                {/* ── SUPPORTING ACADEMIC EVIDENCE (CLICKABLE LINKS) ── */}
                <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 text-[12px] space-y-2">
                  <span className="font-bold text-gray-700 dark:text-gray-200 block uppercase text-[10px] tracking-wider">
                    Supporting Academic Evidence &amp; Literature Sources:
                  </span>
                  <div className="space-y-1.5">
                    {gap.evidence.map((ev, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-[12px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span className="font-medium text-gray-800 truncate">{ev.title}</span>
                          <span className="text-gray-400 shrink-0">({ev.authors}, {ev.year})</span>
                        </div>
                        <button
                          onClick={() => handleOpenPaper(ev.paperId)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 shrink-0 hover:underline"
                        >
                          <span>Open paper</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Direction */}
                <div className="text-[12px] text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                  <span className="font-bold">Suggested Empirical Direction: </span>
                  {gap.recommendation}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── PROPOSAL OUTLINE EDITOR MODAL ── */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D35] rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-white/[0.06] shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.04]">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Grant Proposal Outline Editor
                </h3>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Structured draft synthesizing {selectedProposalGaps.length} selected research gaps.
                </p>
              </div>
              <button
                onClick={() => setIsProposalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 dark:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto scrollbar-thin">
              <pre className="p-4 rounded-xl bg-gray-900 text-cyan-300 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">
                {proposalMarkdown}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.04]">
              <span className="text-[11px] text-gray-400">
                Ready for import into LaTeX / Word grant templates
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadProposal}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
                <button
                  onClick={handleCopyProposal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {copiedProposal ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedProposal ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
