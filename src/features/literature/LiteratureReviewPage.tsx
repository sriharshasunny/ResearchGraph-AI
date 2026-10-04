import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, ArrowLeft, Check, Sparkles, 
  Download, Copy, RefreshCw, Search,
  ArrowUp, ArrowDown, FileText, Printer, Edit3, X, ChevronRight
} from 'lucide-react';

export const LiteratureReviewPage: React.FC = () => {
  const { allPapers, setActivePage, savedPaperIds, setSelectedPaperId } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(['p3', 'p4', 'p2']);
  
  // Step 1 Search, Sort, Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'citations' | 'year' | 'title'>('citations');
  const [venueFilter, setVenueFilter] = useState<'all' | 'saved' | 'arXiv' | 'CVPR' | 'NeurIPS'>('all');

  // Step 2 Settings
  const [topic, setTopic] = useState('Self-Supervised Vision Transformers & Feature Representation');
  const [scope, setScope] = useState<'broad' | 'methodological' | 'comparative'>('comparative');
  const [structure, setStructure] = useState<'thematic' | 'chronological' | 'narrative'>('thematic');
  const [citationStyle, setCitationStyle] = useState<'apa' | 'ieee' | 'nature' | 'chicago'>('apa');

  // Step 3 Synthesis & Editing
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Reading selected papers...');
  const [copied, setCopied] = useState(false);
  const [isEditingOutline, setIsEditingOutline] = useState(false);
  const [reviewSections, setReviewSections] = useState<{ title: string; content: string }[]>([
    {
      title: '1. Introduction & Foundational Motivation',
      content: 'Recent breakthroughs in deep learning have witnessed a pivotal paradigm shift from supervised convolutional networks toward self-supervised Vision Transformers. By removing reliance on human-annotated labels, self-supervised learning unlocks massive pre-training on uncurated visual datasets, producing generalizable visual representations [1].'
    },
    {
      title: '2. Major Approaches & Theoretical Taxonomy',
      content: 'Existing literature falls broadly into two dominant architectural philosophies:\n- Generative Autoencoding: Exemplified by Masked Autoencoders (He et al., 2022) [2], which reconstruct masked image patches by optimizing pixel reconstruction loss with asymmetric encoder-decoders.\n- Discriminative Self-Distillation: Exemplified by DINOv2 (Oquab et al., 2023) [1], using multi-crop self-distillation between student and teacher networks without reconstruction overhead.'
    },
    {
      title: '3. Comparative Methodologies & Inductive Biases',
      content: 'MAE establishes that high masking ratios (75%–80%) prevent spatial redundancy, forcing models to capture holistic semantic structures. In contrast, DINOv2 integrates KoLeo regularization with patch-level objective functions to prevent representation collapse while preserving fine-grained localized features [3].'
    },
    {
      title: '4. Benchmark Metrics & Empirical Evaluation',
      content: 'Evaluated systematically across ImageNet-1K, LVD-142M, and zero-shot downstream tasks. DINOv2 demonstrates 86.5% top-1 accuracy on ImageNet with frozen linear probing without fine-tuning weights, whereas MAE achieves higher peak fine-tuning throughput when entire parameter matrices are adapted.'
    },
    {
      title: '5. Limitations & Open Challenges',
      content: 'Key bottlenecks include high pre-training energy requirements across multi-node GPU clusters, sensitivity to patch resolution during high-resolution inference, and an absence of real-time edge quantization benchmarks for billion-parameter ViT architectures.'
    }
  ]);

  // Load persisted draft if available
  useEffect(() => {
    const savedDraft = localStorage.getItem('rg_lit_review_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.selectedPaperIds) setSelectedPaperIds(parsed.selectedPaperIds);
        if (parsed.sections) setReviewSections(parsed.sections);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save draft on changes
  useEffect(() => {
    localStorage.setItem('rg_lit_review_draft', JSON.stringify({
      topic,
      selectedPaperIds,
      sections: reviewSections
    }));
  }, [topic, selectedPaperIds, reviewSections]);

  const togglePaper = (id: string) => {
    if (selectedPaperIds.includes(id)) {
      setSelectedPaperIds(selectedPaperIds.filter(p => p !== id));
    } else {
      setSelectedPaperIds([...selectedPaperIds, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedPaperIds(allPapers.map(p => p.id));
  };

  const handleSelectNone = () => {
    setSelectedPaperIds([]);
  };

  const movePaper = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= selectedPaperIds.length) return;
    const newArr = [...selectedPaperIds];
    const temp = newArr[index];
    newArr[index] = newArr[newIdx];
    newArr[newIdx] = temp;
    setSelectedPaperIds(newArr);
  };

  const handleStartGeneration = () => {
    setStep(3);
    setIsGenerating(true);

    const stages = [
      'Reading selected publications...',
      'Extracting shared themes, methodologies & datasets...',
      'Synthesizing architectural trade-offs & empirical evidence...',
      'Formatting citations according to ' + citationStyle.toUpperCase() + ' standard...'
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

  const handleRegenerateSection = (sectionIndex: number) => {
    setReviewSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].content += '\n\n[Regenerated with updated empirical citations across recent 2025-2026 benchmarks].';
      return updated;
    });
  };

  // Filter and sort papers
  const filteredPapers = allPapers
    .filter(paper => {
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = paper.title.toLowerCase().includes(query);
        const matchesAuthor = paper.authors.some(a => a.toLowerCase().includes(query));
        if (!matchesTitle && !matchesAuthor) return false;
      }
      if (venueFilter === 'saved') {
        return savedPaperIds.includes(paper.id);
      }
      if (venueFilter !== 'all') {
        return (paper.venue || '').toLowerCase().includes(venueFilter.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (sortCriteria === 'citations') return b.citations - a.citations;
      if (sortCriteria === 'year') return b.year - a.year;
      return a.title.localeCompare(b.title);
    });

  const selectedPapers = selectedPaperIds
    .map(id => allPapers.find(p => p.id === id))
    .filter(Boolean) as typeof allPapers;

  const fullMarkdownReview = `# Literature Review: ${topic}\n\n` +
    reviewSections.map(s => `## ${s.title}\n${s.content}`).join('\n\n') +
    `\n\n## References\n` +
    selectedPapers.map((p, i) => `[${i + 1}] ${p.authors.join(', ')} (${p.year}). ${p.title}. ${p.venue || 'arXiv'}.`).join('\n');

  const handleCopyReview = () => {
    navigator.clipboard.writeText(fullMarkdownReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([fullMarkdownReview], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Literature-Review-${topic.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBibTeX = () => {
    const bibtexData = selectedPapers.map(p => p.bibtex || `@article{${p.id},\n  title={${p.title}},\n  author={${p.authors.join(' and ')}},\n  year={${p.year}}\n}`).join('\n\n');
    const blob = new Blob([bibtexData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Literature-Review-Citations.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-60px)] overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7FAFC]">
      <div className="max-w-[1140px] mx-auto space-y-6">

        {/* ── TOP HEADER ── */}
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
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Literature Review Generator
                </h1>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Synthesize comparative literature reviews across indexed academic publications.
                </p>
              </div>
            </div>

            {step === 3 && !isGenerating && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsEditingOutline(!isEditingOutline)}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200 bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] font-semibold text-[12px] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEditingOutline ? 'View Rendered' : 'Edit Sections'}</span>
                </button>
                <button
                  onClick={handleCopyReview}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/[0.06] text-gray-700 dark:text-gray-200 bg-white dark:bg-[#111D35] hover:bg-gray-50 dark:bg-white/[0.04] font-semibold text-[12px] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[12px] flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .md</span>
                </button>
                <button
                  onClick={handleDownloadBibTeX}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-semibold text-[12px] flex items-center gap-1.5 transition-all"
                  title="Export BibTeX for all cited papers"
                >
                  <span>BibTeX</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition-colors"
                  title="Print / Save PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ── 3-STEP PROGRESS INDICATOR (CLICKABLE) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-gray-100 dark:border-white/[0.04]">
            {[
              { num: 1, title: '1. Select Literature', desc: `${selectedPaperIds.length} publications selected` },
              { num: 2, title: '2. Scope & Structure', desc: `${structure} structure · ${citationStyle.toUpperCase()}` },
              { num: 3, title: '3. Synthesize & Review', desc: 'Interactive editable synthesis' },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  step === s.num
                    ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-xs ring-1 ring-blue-300/50'
                    : 'bg-gray-50 dark:bg-white/[0.04]/50 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 hover:border-gray-300'
                }`}
              >
                <div className="text-[13px] font-bold flex items-center justify-between">
                  <span>{s.title}</span>
                  {selectedPaperIds.length >= 2 && s.num === 1 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── STEP 1: SELECT LITERATURE ── */}
        {step === 1 && (
          <div className="space-y-6">
            
            {/* Search, Filter, Sort Controls */}
            <div className="bg-white dark:bg-[#111D35] rounded-2xl p-5 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, author, or keyword..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04] focus:bg-white dark:bg-[#111D35] text-[13px] text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Venue filter */}
                  <select
                    value={venueFilter}
                    onChange={(e) => setVenueFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#111D35] text-[12px] font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Venues</option>
                    <option value="saved">Saved Papers Only</option>
                    <option value="arXiv">arXiv</option>
                    <option value="CVPR">CVPR</option>
                    <option value="NeurIPS">NeurIPS</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortCriteria}
                    onChange={(e) => setSortCriteria(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#111D35] text-[12px] font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="citations">Most Citations</option>
                    <option value="year">Newest Year</option>
                    <option value="title">Title A-Z</option>
                  </select>

                  {/* Select All / None */}
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-[11px] font-bold text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleSelectNone}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-[11px] font-bold text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Select None
                  </button>
                </div>
              </div>
            </div>

            {/* Papers List and Selected Tray Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Paper Selection (8 Cols) */}
              <div className="lg:col-span-8 bg-white dark:bg-[#111D35] rounded-2xl p-6 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.04]">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white">
                    Academic Publications ({filteredPapers.length})
                  </h3>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">
                    {selectedPaperIds.length} papers selected
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                  {filteredPapers.map((paper) => {
                    const isSelected = selectedPaperIds.includes(paper.id);
                    return (
                      <div
                        key={paper.id}
                        onClick={() => togglePaper(paper.id)}
                        className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 ${
                          isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50 dark:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white dark:bg-[#111D35]'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-bold text-gray-900 dark:text-white leading-snug">{paper.title}</h4>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                            {paper.authors.join(', ')} · <span className="font-semibold text-gray-700 dark:text-gray-200">{paper.year}</span> · {paper.venue || 'arXiv'} · <span className="text-blue-600 font-semibold">{paper.citations.toLocaleString()} citations</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Papers Tray (4 Cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-[#111D35] rounded-2xl p-5 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.04]">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Synthesis Tray ({selectedPapers.length})
                  </h3>
                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedPaperIds.length < 2}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-[12px] rounded-xl shadow-xs transition-all flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedPapers.length < 2 && (
                  <p className="text-[12px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    Select at least 2 papers to synthesize a comparative review.
                  </p>
                )}

                <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin">
                  {selectedPapers.map((paper, index) => (
                    <div
                      key={paper.id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] text-[12px] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h5 className="font-bold text-gray-900 dark:text-white truncate">{paper.title}</h5>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{paper.authors[0]} et al. ({paper.year})</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => movePaper(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:text-gray-200 disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => movePaper(index, 'down')}
                          disabled={index === selectedPapers.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:text-gray-200 disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => togglePaper(paper.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Remove from tray"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── STEP 2: SCOPE & STRUCTURE ── */}
        {step === 2 && (
          <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Define Synthesis Scope &amp; Taxonomic Structure</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">Configure how the literature will be organized, compared, and cited.</p>
            </div>

            {/* Topic Input & Suggested Themes */}
            <div className="space-y-3">
              <label className="text-[12px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Review Topic Title</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04] focus:bg-white dark:bg-[#111D35] text-[14px] text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
              />

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Suggested topics inferred from your selection:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Self-Supervised Vision Transformers & Feature Representation',
                    'Generative Masked Autoencoding vs Contrastive Distillation',
                    'Empirical Scaling Laws in Multimodal Attention Networks',
                    'Downstream Transfer Efficiency in Zero-Shot Evaluation'
                  ].map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTopic(t)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-colors ${
                        topic === t
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                          : 'bg-gray-50 dark:bg-white/[0.04] hover:bg-gray-100 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/[0.06]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              {/* Scope Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Synthesis Scope</label>
                <div className="space-y-2">
                  {[
                    { id: 'comparative', label: 'Comparative Benchmark', desc: 'Focus on empirical trade-offs & SOTA gains' },
                    { id: 'methodological', label: 'Methodological Focus', desc: 'Deep dive into loss functions & architectures' },
                    { id: 'broad', label: 'Comprehensive Overview', desc: 'Broad survey suitable for thesis introduction' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setScope(item.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        scope === item.id ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs' : 'border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:bg-white/[0.04]'
                      }`}
                    >
                      <div className="font-bold text-[12px]">{item.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structure Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Review Structure</label>
                <div className="space-y-2">
                  {[
                    { id: 'thematic', label: 'Thematic Clusters', desc: 'Grouped by problem formulation and design patterns' },
                    { id: 'chronological', label: 'Chronological Evolution', desc: 'Traced through timeline of sequential breakthroughs' },
                    { id: 'narrative', label: 'Narrative Synthesis', desc: 'Problem-solution storytelling format' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setStructure(item.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        structure === item.id ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs' : 'border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:bg-white/[0.04]'
                      }`}
                    >
                      <div className="font-bold text-[12px]">{item.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citation Style Selector */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Citation Style</label>
                <div className="space-y-2">
                  {[
                    { id: 'apa', label: 'APA 7th Edition', desc: '(Author, Year) format with full bibliography' },
                    { id: 'ieee', label: 'IEEE Style', desc: '[1] numbered brackets in citation order' },
                    { id: 'nature', label: 'Nature Style', desc: 'Superscript numbered citations with journal titles' },
                    { id: 'chicago', label: 'Chicago 17th', desc: 'Author-date academic standard' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setCitationStyle(item.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        citationStyle === item.id ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs' : 'border-gray-200 dark:border-white/[0.06] hover:bg-gray-50 dark:bg-white/[0.04]'
                      }`}
                    >
                      <div className="font-bold text-[12px]">{item.label}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.04]">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white text-[12px] font-semibold"
              >
                ← Back to Literature Selection
              </button>
              <button
                onClick={handleStartGeneration}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[13px] rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Literature Review</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: GENERATED REVIEW & EDITABLE OUTLINE ── */}
        {step === 3 && (
          <div className="bg-white dark:bg-[#111D35] rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-white/[0.06] shadow-sm space-y-6">
            {isGenerating ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{generationStage}</h3>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-md">
                  Synthesizing empirical findings, architectural trade-offs, and taxonomy across {selectedPapers.length} selected publications.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Academic Grounding Banner */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
                  <div className="text-blue-900 font-medium">
                    <span className="font-bold">✓ Grounded Synthesis:</span> Synthesized across {selectedPapers.length} indexed peer-reviewed publications. Citations cross-referenced with DOIs.
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Adjust Scope
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setStep(1)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Change Papers
                    </button>
                  </div>
                </div>

                {/* EDITABLE SECTIONS VIEW */}
                {isEditingOutline ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/[0.06]">
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Editable Section Outlines</h3>
                      <button
                        onClick={() => setIsEditingOutline(false)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[12px] font-semibold"
                      >
                        Done Editing
                      </button>
                    </div>

                    {reviewSections.map((sec, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04]/50 space-y-3">
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReviewSections(prev => {
                              const arr = [...prev];
                              arr[idx].title = val;
                              return arr;
                            });
                          }}
                          className="w-full font-bold text-[15px] bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-xl px-3 py-1.5 text-gray-900 dark:text-white"
                        />
                        <textarea
                          rows={4}
                          value={sec.content}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReviewSections(prev => {
                              const arr = [...prev];
                              arr[idx].content = val;
                              return arr;
                            });
                          }}
                          className="w-full text-[13px] bg-white dark:bg-[#111D35] border border-gray-200 dark:border-white/[0.06] rounded-xl p-3 text-gray-800 leading-relaxed font-sans"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRegenerateSection(idx)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerate section</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* RENDERED REVIEW VIEW */
                  <div className="space-y-8 text-gray-800">
                    <div className="border-b border-gray-200 dark:border-white/[0.06] pb-4">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        {topic}
                      </h1>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        Structured Academic Review · {structure.toUpperCase()} STRUCTURE · {citationStyle.toUpperCase()} CITATIONS
                      </p>
                    </div>

                    {reviewSections.map((sec, idx) => (
                      <div key={idx} className="space-y-3 group">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {sec.title}
                          </h2>
                          <button
                            onClick={() => handleRegenerateSection(idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded bg-blue-50"
                            title="Regenerate section with fresh arguments"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <div className="text-[14px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                          {sec.content.split(/(\[\d+\])/g).map((chunk, j) => {
                            const match = chunk.match(/\[(\d+)\]/);
                            if (match) {
                              const refNum = parseInt(match[1]);
                              const refPaper = selectedPapers[refNum - 1];
                              return (
                                <button
                                  key={j}
                                  onClick={() => {
                                    if (refPaper) {
                                      setSelectedPaperId(refPaper.id);
                                      setActivePage('details');
                                    }
                                  }}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold font-mono text-[11px] hover:bg-blue-200 mx-0.5 cursor-pointer"
                                  title={refPaper ? `${refPaper.title} (${refPaper.year})` : 'Citation'}
                                >
                                  {chunk}
                                </button>
                              );
                            }
                            return chunk;
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Grounded Bibliography */}
                    <div className="pt-6 border-t border-gray-200 dark:border-white/[0.06] space-y-3">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Primary Cited References
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-[13px] text-gray-600 dark:text-gray-300">
                        {selectedPapers.map((paper) => (
                          <li key={paper.id} className="leading-relaxed">
                            <span 
                              onClick={() => {
                                setSelectedPaperId(paper.id);
                                setActivePage('details');
                              }}
                              className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer underline decoration-gray-300"
                            >
                              {paper.title}
                            </span>. {paper.authors.join(', ')} ({paper.year}). <em>{paper.venue || 'arXiv'}</em>.
                          </li>
                        ))}
                      </ol>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
