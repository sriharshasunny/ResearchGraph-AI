import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  FileSearch,
  FileText,
  GitCompare,
  Layers3,
  MessageSquareText,
  Network,
  Search,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PageType } from '../../types';
import { ResearchKnowledgeCore } from '../../components/ResearchKnowledgeCore';

const shortcuts: Array<{ title: string; description: string; icon: typeof Search; page: PageType; tone: string }> = [
  { title: 'Search Papers', description: 'Discover relevant research', icon: FileSearch, page: 'search', tone: 'bg-blue-50 text-blue-700' },
  { title: 'AI Research Assistant', description: 'Ask questions across papers', icon: MessageSquareText, page: 'chat', tone: 'bg-violet-50 text-violet-700' },
  { title: 'Knowledge Graph', description: 'Explore connected ideas', icon: Network, page: 'graph', tone: 'bg-cyan-50 text-cyan-700' },
  { title: 'Compare Papers', description: 'Review methods side by side', icon: GitCompare, page: 'compare', tone: 'bg-emerald-50 text-emerald-700' },
  { title: 'Literature Review', description: 'Build a focused literature review', icon: BookOpen, page: 'literature', tone: 'bg-amber-50 text-amber-700' },
  { title: 'Research Gaps', description: 'Find open questions and directions', icon: Sparkles, page: 'gaps', tone: 'bg-rose-50 text-rose-700' },
];

const suggestedQueries = [
  'Vision Transformer',
  'Graph Neural Networks',
  'Self-supervised Learning',
  'Research gaps in medical imaging',
  'Compare DINOv2 and MAE',
];

export const Dashboard: React.FC = () => {
  const {
    setActivePage,
    setSearchQuery,
    savedPaperIds,
    allPapers,
    recentlyViewed,
    setSelectedPaperId,
    paperReadingStatus,
    activeProject,
    comparisonPaperIds,
    toggleSavedPaper,
    toggleComparisonPaper,
  } = useApp();
  const [query, setQuery] = useState('');

  const recentPapers = recentlyViewed
    .map(id => allPapers.find(paper => paper.id === id))
    .filter((paper): paper is (typeof allPapers)[number] => Boolean(paper))
    .slice(0, 4);
  const readingQueue = allPapers.filter(paper =>
    paperReadingStatus[paper.id] === 'reading' || paperReadingStatus[paper.id] === 'to_read'
  );
  const readingNowCount = allPapers.filter(paper => paperReadingStatus[paper.id] === 'reading').length;

  const openSearch = (searchTerm = query) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setActivePage('search');
  };

  const openPaper = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActivePage('details');
  };

  const stats: Array<{ label: string; value: number; icon: typeof Search; tone: string; page: PageType }> = [
    { label: 'Saved papers', value: savedPaperIds.length, icon: Bookmark, tone: 'bg-emerald-50 text-emerald-700', page: 'saved' },
    { label: 'Papers in workspace', value: allPapers.length, icon: Layers3, tone: 'bg-blue-50 text-blue-700', page: 'papers' },
    { label: 'Reading now', value: readingNowCount, icon: BookOpen, tone: 'bg-violet-50 text-violet-700', page: 'papers' },
    { label: 'Comparisons', value: comparisonPaperIds.length, icon: GitCompare, tone: 'bg-orange-50 text-orange-700', page: 'compare' },
  ];

  return (
    <div className="min-h-full bg-[#F5F7FB] px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
      <div className="mx-auto max-w-[1440px] space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          aria-labelledby="dashboard-search-title"
          className="relative isolate overflow-hidden rounded-[22px] bg-[#07152D] px-5 py-6 text-white shadow-[0_18px_45px_-28px_rgba(15,35,65,0.72)] sm:px-7 lg:px-9 lg:py-7"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_48%,rgba(14,116,220,0.28),transparent_42%),radial-gradient(ellipse_at_10%_100%,rgba(16,67,136,0.18),transparent_45%)]" />
          <div aria-hidden="true" className="absolute -right-24 -top-36 -z-10 h-[420px] w-[420px] rounded-full border border-blue-100/[0.07]" />
          <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] xl:grid-cols-[minmax(0,1.08fr)_minmax(400px,0.92fr)]">
            <div className="relative z-10 max-w-[690px] py-1 lg:py-3">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-blue-100">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                YOUR RESEARCH WORKSPACE
              </div>
              <h1 id="dashboard-search-title" className="max-w-[610px] text-[30px] font-semibold leading-[1.12] tracking-tight sm:text-[36px] lg:text-[40px]">
                Discover. Connect. Advance <span className="text-blue-400">Research</span> with AI.
              </h1>
              <p className="mt-3 max-w-[510px] text-[14px] leading-6 text-slate-300 sm:text-[15px]">
                Search papers, explore knowledge graphs, get AI insights and find new research directions.
              </p>

              <form
                role="search"
                onSubmit={event => {
                  event.preventDefault();
                  openSearch();
                }}
                className="mt-5 flex max-w-[650px] items-center gap-2 rounded-xl border border-white/70 bg-white p-1.5 pl-3.5 shadow-lg shadow-slate-950/15 focus-within:ring-4 focus-within:ring-blue-300/20"
              >
                <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  aria-label="Search academic papers, authors, and topics"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search papers, authors, datasets, methods, concepts..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
                />
                <button type="submit" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-3 flex max-w-[680px] flex-wrap items-center gap-2 text-[10px] text-blue-100/75 sm:text-[11px]">
                <span className="mr-0.5">Try:</span>
                {suggestedQueries.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => openSearch(term)}
                    className="rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-slate-100 transition hover:border-blue-300/50 hover:bg-blue-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mx-auto flex h-[320px] w-full max-w-[520px] items-center justify-center overflow-visible sm:h-[350px]" aria-label="Interactive research knowledge core">
              <ResearchKnowledgeCore />
            </div>
          </div>
        </motion.section>

        <section aria-label="Research overview">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tone, page }, index) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => setActivePage(page)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="group flex min-h-[78px] items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 text-left shadow-[0_3px_14px_-12px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:px-4"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0">
                  <span className="block text-[22px] font-bold leading-none tracking-tight text-slate-900">{value}</span>
                  <span className="mt-1.5 block truncate text-[11px] font-medium text-slate-500 sm:text-xs">{label}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,1fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Continue your research</h2>
                <p className="mt-0.5 text-xs text-slate-500">Pick up where you left off.</p>
              </div>
              <button type="button" onClick={() => setActivePage('history')} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">
                View history <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {recentPapers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentPapers.map(paper => {
                  const isSaved = savedPaperIds.includes(paper.id);
                  const isComparing = comparisonPaperIds.includes(paper.id);
                  const readingStatus = paperReadingStatus[paper.id];
                  return (
                    <article key={paper.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/80 sm:px-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500"><FileText className="h-4 w-4" /></span>
                      <button type="button" onClick={() => openPaper(paper.id)} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50">
                        <span className="block truncate text-[12px] font-semibold text-slate-800 group-hover:text-blue-700 sm:text-[13px]">{paper.title}</span>
                        <span className="mt-1 block truncate text-[10px] text-slate-500 sm:text-[11px]">
                          {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 ? ' et al.' : ''} · {paper.year || 'Year unavailable'}{paper.venue ? ` · ${paper.venue}` : ''}
                        </span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {paper.field && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-medium text-blue-800">{paper.field}</span>}
                          {readingStatus && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium capitalize text-slate-600">{readingStatus.replace('_', ' ')}</span>}
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => openPaper(paper.id)} className="hidden rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 sm:inline-flex">Open</button>
                        <button type="button" aria-label={isSaved ? 'Remove saved paper' : 'Save paper'} title={isSaved ? 'Remove saved paper' : 'Save paper'} onClick={() => toggleSavedPaper(paper.id)} className={`rounded-lg p-2 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isSaved ? 'text-blue-700' : 'text-slate-400'}`}>
                          <Bookmark className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button" aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'} title={isComparing ? 'Remove from comparison' : 'Add to comparison'} onClick={() => toggleComparisonPaper(paper.id)} className={`rounded-lg p-2 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isComparing ? 'text-blue-700' : 'text-slate-400'}`}>
                          <GitCompare className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-9 text-center">
                <p className="text-sm font-semibold text-slate-800">Your research journey starts here.</p>
                <p className="mt-1 text-xs text-slate-500">Explore academic papers and save the ones you want to revisit.</p>
                <button type="button" onClick={() => setActivePage('search')} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700">Search papers <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Current project</h2>
                <p className="mt-0.5 text-xs text-slate-500">Your active research workspace.</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Layers3 className="h-4 w-4" /></span>
            </div>
            <div className="p-4 sm:p-5">
              <h3 className="text-[13px] font-semibold leading-5 text-slate-900">{activeProject || 'Research workspace'}</h3>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Organize papers and ideas around your current research focus.</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                <span className="text-slate-500">{readingQueue.length} papers in your reading queue</span>
                <button type="button" onClick={() => setActivePage('saved')} className="font-semibold text-blue-700 hover:text-blue-900">Open library</button>
              </div>

              <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-800">Related research network</h4>
                    <p className="mt-0.5 text-[10px] text-slate-500">No linked entities yet. Open the graph to explore.</p>
                  </div>
                  <Network className="h-4 w-4 shrink-0 text-blue-600" />
                </div>
                <button type="button" onClick={() => setActivePage('graph')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
                  Explore knowledge graph <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="explore-tools-title">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 id="explore-tools-title" className="text-sm font-bold text-slate-900">Explore research tools</h2>
              <p className="mt-0.5 text-xs text-slate-500">Tools to accelerate your research workflow.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {shortcuts.map(({ title, description, icon: Icon, page, tone }) => (
              <button
                key={title}
                type="button"
                onClick={() => setActivePage(page)}
                className="group flex min-h-[74px] items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-[0_4px_15px_-13px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold text-slate-800 group-hover:text-blue-700">{title}</span>
                  <span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-slate-500">{description}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

