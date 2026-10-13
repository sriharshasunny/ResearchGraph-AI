import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Clock3,
  FileSearch,
  GitCompare,
  Layers3,
  MessageSquareText,
  Network,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThreeNeuralCore } from '../../components/ThreeNeuralCore';

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
    setSearchQuery(searchTerm.trim());
    setActivePage('search');
  };

  const openPaper = (paperId: string) => {
    setSelectedPaperId(paperId);
    setActivePage('details');
  };

  const stats = [
    { label: 'Saved papers', value: savedPaperIds.length, icon: Bookmark, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Papers in workspace', value: allPapers.length, icon: Layers3, color: 'text-blue-700 bg-blue-50' },
    { label: 'Reading now', value: readingNowCount, icon: BookOpen, color: 'text-violet-700 bg-violet-50' },
    { label: 'Comparisons', value: comparisonPaperIds.length, icon: GitCompare, color: 'text-amber-700 bg-amber-50' },
  ];

  const shortcuts = [
    { title: 'Search papers', description: 'Discover relevant literature', icon: FileSearch, page: 'search' as const, tone: 'text-blue-700 bg-blue-50' },
    { title: 'Ask AI', description: 'Explore a research question', icon: MessageSquareText, page: 'chat' as const, tone: 'text-violet-700 bg-violet-50' },
    { title: 'Compare papers', description: 'Review methods side by side', icon: GitCompare, page: 'compare' as const, tone: 'text-emerald-700 bg-emerald-50' },
    { title: 'Explore graph', description: 'Follow connected ideas', icon: Network, page: 'graph' as const, tone: 'text-cyan-700 bg-cyan-50' },
  ];

  const suggestedQueries = [
    'Find papers about RAG',
    'Compare DINOv2 and MAE',
    'Research gaps in GNNs',
    'Latest Vision Transformer research',
    'Self-supervised learning in agriculture',
  ];

  return (
    <div className="min-h-full bg-[#F5F7FB] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1320px] space-y-7">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.04 }}
          aria-labelledby="dashboard-search-title"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 54%, #164e63 100%)' }}
          className="relative isolate overflow-hidden rounded-[26px] bg-slate-950 px-6 py-7 text-white shadow-[0_20px_55px_-30px_rgba(15,45,75,0.75)] sm:px-9 sm:py-9 lg:px-11 lg:py-10"
        >
          <div aria-hidden="true" className="absolute -right-20 -top-32 -z-10 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -right-6 -top-16 -z-10 h-56 w-56 rounded-full border border-white/[0.08]" />
          <div aria-hidden="true" className="absolute bottom-[-120px] right-[16%] -z-10 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="max-w-[700px]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                YOUR RESEARCH WORKSPACE
              </div>
              <h2 id="dashboard-search-title" className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                What are you researching today?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-[15px]">
                Explore research. Connect knowledge. Discover what&apos;s next.
              </p>

              <form
                role="search"
                onSubmit={event => {
                  event.preventDefault();
                  openSearch();
                }}
                className="mt-6 flex max-w-[650px] items-center gap-2 rounded-2xl border border-white/70 bg-white p-1.5 pl-4 shadow-xl shadow-slate-950/10 focus-within:ring-4 focus-within:ring-cyan-300/20"
              >
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  aria-label="Search academic research"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Ask anything about academic research..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button type="submit" style={{ backgroundColor: '#1d4ed8', color: '#ffffff' }} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-blue-100/70">
                <span className="mr-1">Try</span>
                {suggestedQueries.map(term => (
                  <button
                    key={term}
                    onClick={() => openSearch(term)}
                    className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-blue-50 transition hover:border-cyan-200/50 hover:bg-white/[0.12]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mx-auto hidden h-[270px] w-full max-w-[300px] items-center justify-center lg:flex" role="img" aria-label="Animated research knowledge model">
              <div aria-hidden="true" className="absolute inset-7 rounded-full bg-cyan-300/15 blur-3xl" />
              <div aria-hidden="true" className="absolute h-[220px] w-[220px] rounded-full border border-cyan-100/[0.08]" />
              <div aria-hidden="true" className="absolute h-[178px] w-[178px] rounded-full border border-blue-100/[0.08]" />
              <div className="relative z-10 h-[250px] w-[250px]">
                <ThreeNeuralCore className="h-full w-full" interactive={false} theme="cyan" />
              </div>
              <div className="absolute left-2 top-9 rounded-full border border-white/15 bg-slate-950/35 px-2.5 py-1 text-[10px] font-medium text-cyan-100 backdrop-blur-sm">Papers</div>
              <div className="absolute right-0 top-14 rounded-full border border-white/15 bg-slate-950/35 px-2.5 py-1 text-[10px] font-medium text-blue-100 backdrop-blur-sm">Methods</div>
              <div className="absolute bottom-8 right-2 rounded-full border border-white/15 bg-slate-950/35 px-2.5 py-1 text-[10px] font-medium text-violet-100 backdrop-blur-sm">Knowledge graph</div>
            </div>
          </div>
        </motion.section>

        <section aria-label="Workspace overview">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900">Your research overview</h2>
              <p className="mt-1 text-xs text-slate-500">A clear view of your work in progress.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, color }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.06 + index * 0.04 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-5"
            >
              <span className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></span>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
              <div className="mt-1 text-xs font-medium text-slate-500 sm:text-[13px]">{label}</div>
            </motion.div>
          ))}
          </div>
        </section>

        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Continue your research</h2>
                <p className="mt-0.5 text-xs text-slate-500">Pick up where you left off.</p>
              </div>
              <button onClick={() => setActivePage('history')} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900">
                View history <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {recentPapers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentPapers.map(paper => (
                  <button
                    key={paper.id}
                    onClick={() => openPaper(paper.id)}
                    className="group flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><BookOpen className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-slate-800 transition group-hover:text-blue-700 sm:text-sm">{paper.title}</span>
                      <span className="mt-1 block truncate text-[11px] text-slate-500">{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''} · {paper.year}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-700">Your reading history will appear here.</p>
                <button onClick={() => openSearch('')} className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900">Find your first paper</button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">Current project</p>
                  <h2 className="mt-2 text-base font-bold leading-snug text-slate-900">{activeProject}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">Keep your papers and ideas moving forward.</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Layers3 className="h-4 w-4" /></span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                <span className="text-slate-500">{readingQueue.length} papers in your reading queue</span>
                <button onClick={() => setActivePage('saved')} className="font-semibold text-blue-700 hover:text-blue-900">Open library</button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)] sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Reading queue</h2>
                  <p className="mt-0.5 text-xs text-slate-500">{readingNowCount} currently in progress</p>
                </div>
                <Clock3 className="h-4 w-4 text-slate-400" />
              </div>
              {readingQueue.length > 0 ? (
                <div className="space-y-1">
                  {readingQueue.slice(0, 3).map(paper => (
                    <button key={paper.id} onClick={() => openPaper(paper.id)} className="group flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-slate-50">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${paperReadingStatus[paper.id] === 'reading' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 group-hover:text-blue-700">{paper.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">Save a paper to build your reading queue.</div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Explore your workspace</h2>
              <p className="mt-0.5 text-xs text-slate-500">Jump into the tools you use most.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {shortcuts.map(({ title, description, icon: Icon, page, tone }) => (
              <button
                key={title}
                onClick={() => setActivePage(page)}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_4px_18px_-14px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-slate-800 group-hover:text-blue-700">{title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">{description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

