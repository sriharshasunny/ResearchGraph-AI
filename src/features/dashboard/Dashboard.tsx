import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
  FolderOpen,
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
  { title: 'Compare Papers', description: 'Review methods side by side', icon: GitCompare, page: 'compare', tone: 'bg-indigo-50 text-indigo-700' },
  { title: 'Literature Review', description: 'Build a focused literature review', icon: BookOpen, page: 'literature', tone: 'bg-blue-50 text-blue-700' },
  { title: 'Research Gaps', description: 'Find open questions and directions', icon: Sparkles, page: 'gaps', tone: 'bg-violet-50 text-violet-700' },
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
    { label: 'Saved papers', value: savedPaperIds.length, icon: Bookmark, tone: 'bg-cyan-50 text-cyan-700', page: 'saved' },
    { label: 'Papers in workspace', value: allPapers.length, icon: Layers3, tone: 'bg-blue-50 text-blue-700', page: 'papers' },
    { label: 'Reading now', value: readingNowCount, icon: BookOpen, tone: 'bg-violet-50 text-violet-700', page: 'papers' },
    { label: 'Comparisons', value: comparisonPaperIds.length, icon: GitCompare, tone: 'bg-indigo-50 text-indigo-700', page: 'compare' },
  ];

  return (
    <div className="min-h-full bg-[#F5F7FB] px-4 py-4 sm:px-6 lg:px-7 lg:py-5">
      <div className="mx-auto max-w-[1520px] space-y-4">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          aria-labelledby="dashboard-search-title"
          className="relative isolate overflow-hidden rounded-[22px] border border-[#E2E8F2] bg-[linear-gradient(118deg,#FFFFFF_0%,#F8FAFE_55%,#F2F6FD_100%)] px-5 py-6 text-[#18223B] shadow-[0_16px_42px_-32px_rgba(49,75,125,0.4)] sm:px-7 lg:px-10 lg:py-5 xl:px-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{ backgroundImage: 'radial-gradient(ellipse at 78% 45%, rgba(71,119,255,0.075), transparent 40%), radial-gradient(ellipse at 90% 60%, rgba(34,211,238,0.045), transparent 34%), linear-gradient(110deg, rgba(255,255,255,0.88), rgba(245,248,253,0.92))' }}
          />
          <div aria-hidden="true" className="absolute -right-20 -top-40 -z-10 h-[500px] w-[500px] rounded-full border border-blue-200/25" />
          <div className="grid items-center gap-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-5">
            <div className="relative z-10 max-w-[700px] py-1 lg:py-3">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#3E5E91] shadow-[0_2px_8px_rgba(75,110,170,.06)]">
                <Sparkles className="h-3.5 w-3.5 text-[#4777FF]" />
                YOUR RESEARCH WORKSPACE
              </div>
              <h1 id="dashboard-search-title" className="max-w-[700px] text-[30px] font-bold leading-[1.08] tracking-[-0.045em] text-[#18223B] sm:text-[38px] lg:text-[46px]">
                Discover. Connect. Advance<br className="hidden sm:block" /> <span className="bg-gradient-to-r from-[#4777FF] to-[#6685F2] bg-clip-text text-transparent">Research</span> with AI.
              </h1>
              <p className="mt-3 max-w-[540px] text-[14px] leading-6 text-[#66748C] sm:text-[16px] sm:leading-7">
                Search papers, explore knowledge graphs, get AI insights and find new research directions.
              </p>

              <form
                role="search"
                onSubmit={event => {
                  event.preventDefault();
                  openSearch();
                }}
                className="mt-5 flex h-[54px] max-w-[680px] items-center gap-2 rounded-xl border border-[#DFE6F1] bg-white/90 p-1.5 pl-4 shadow-[0_6px_22px_rgba(40,67,118,.07)] backdrop-blur-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-200/35 sm:h-[60px]"
              >
                <Search aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-[#78849B]" />
                <input
                  aria-label="Search academic papers, authors, and topics"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Ask anything about academic research..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px]"
                />
                <button type="submit" className="inline-flex h-full shrink-0 items-center gap-2 rounded-lg bg-[#4777FF] px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(71,119,255,.22)] transition hover:bg-[#3565ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:px-5">
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 flex max-w-[700px] flex-wrap items-center gap-2 text-[11px] text-[#78849B] sm:mt-4 sm:text-xs">
                <span className="mr-0.5">Try:</span>
                {suggestedQueries.map(term => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => openSearch(term)}
                    className="rounded-full border border-[#DCE4F0] bg-white/65 px-3 py-2 text-[#40506B] shadow-[0_1px_3px_rgba(40,67,118,.04)] transition hover:border-[#AFC3F7] hover:bg-[#EEF3FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mx-auto flex h-[310px] w-full items-center justify-center overflow-visible sm:h-[370px] lg:h-[430px] xl:h-[440px]" aria-label="Interactive research knowledge core">
              <ResearchKnowledgeCore />
            </div>
          </div>
        </motion.section>

        <section aria-label="Research overview">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            {stats.map(({ label, value, icon: Icon, tone, page }, index) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => setActivePage(page)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="group flex min-h-[88px] items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3.5 text-left shadow-[0_3px_14px_-12px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:min-h-[98px] sm:px-4"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0">
                  <span className="block text-[25px] font-bold leading-none tracking-tight text-slate-900">{value}</span>
                  <span className="mt-1.5 block truncate text-[11px] font-medium text-slate-500 sm:text-xs">{label}</span>
                </span>
                <ChevronRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </motion.button>
            ))}
          </div>
        </section>

        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.58fr)_minmax(360px,1fr)]">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="flex items-start gap-2.5">
                <Clock3 aria-hidden="true" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-slate-700" />
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Continue your research</h2>
                <p className="mt-0.5 text-xs text-slate-500">Pick up where you left off.</p>
                </div>
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
              <div className="flex min-h-[224px] flex-col items-center justify-center px-5 py-7 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><FileSearch className="h-6 w-6" /></span>
                <p className="text-sm font-semibold text-slate-800">Your research journey starts here.</p>
                <p className="mt-1 max-w-[360px] text-xs text-slate-500">Explore academic papers and save the ones you want to revisit.</p>
                <button type="button" onClick={() => setActivePage('search')} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">Search Papers <ArrowRight className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="flex items-start gap-2.5">
                <Layers3 aria-hidden="true" className="mt-0.5 h-[18px] w-[18px] shrink-0 text-blue-600" />
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900">Current project</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Your active research workspace.</p>
                </div>
              </div>
              <button type="button" onClick={() => setActivePage('papers')} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">View all <ArrowUpRight className="h-3.5 w-3.5" /></button>
            </div>
            <div className="p-4 sm:p-5">
              <div className="rounded-xl border border-slate-100 bg-[linear-gradient(135deg,#f8fbff,#f1f6ff)] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-blue-700 shadow-sm"><FolderOpen className="h-7 w-7" /></span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="truncate text-[14px] font-bold leading-5 text-slate-900">{activeProject || 'Research workspace'}</h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">Organize papers and ideas around your current research focus.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-600" />{allPapers.length} papers</span>
                  <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-blue-600" />{readingQueue.length} in reading queue</span>
                </div>
              </div>

              <button type="button" onClick={() => setActivePage('papers')} className="mt-3 flex w-full items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/80 px-3.5 py-2.5 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40">
                <FolderOpen className="h-4 w-4" /> Open workspace <ArrowRight className="ml-auto h-3.5 w-3.5" />
              </button>

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

