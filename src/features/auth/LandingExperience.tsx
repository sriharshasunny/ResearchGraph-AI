import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Building2,
  Database,
  FileText,
  GitBranch,
  Lightbulb,
  Menu,
  Network,
  Play,
  Quote,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

interface LandingExperienceProps {
  onLogin: () => void;
  onRegister: () => void;
  onSearch: (query: string) => void;
}

const sections = [
  { id: 'topology', label: '3D Topology' },
  { id: 'pipeline', label: 'RAG Pipeline' },
  { id: 'sources', label: 'Data Sources' },
  { id: 'about', label: 'About Us' },
];

const suggestedTopics = [
  'Vision Transformers',
  'Graph Neural Networks',
  'Self-supervised Learning',
  'Medical Imaging',
  'Climate Change',
  'Large Language Models',
];

const workflow = [
  { number: '01', title: 'Discover', detail: 'Find scholarly records across supported research metadata.', icon: Search },
  { number: '02', title: 'Collect', detail: 'Bring open-access papers and abstracts into your workspace.', icon: FileText },
  { number: '03', title: 'Retrieve', detail: 'Search indexed passages with configured embeddings and vector storage.', icon: Database },
  { number: '04', title: 'Understand', detail: 'Ask questions grounded in retrieved evidence and available graph links.', icon: Lightbulb },
];

const featuredVideos: Array<{ id: string; title: string; publisher: string; detail: string; duration?: string; productTour?: boolean }> = [
  {
    id: 'researchgraph-product-tour',
    title: 'A tour of ResearchGraph AI',
    publisher: 'ResearchGraph AI',
    detail: 'A short visual tour of paper discovery, connected research context, and graph exploration.',
    duration: '0:18',
    productTour: true,
  },
  {
    id: 'YVLwu3jE09c',
    title: 'What is a knowledge graph?',
    publisher: 'Neo4j',
    detail: 'A concise introduction to entities, relationships, and connected data.',
    duration: '2:36',
  },
  {
    id: 'y7sXDpffzQQ',
    title: 'Knowledge graphs, clearly explained',
    publisher: 'IBM Technology',
    detail: 'See how connected information helps systems understand context.',
  },
];

type FeaturedVideo = (typeof featuredVideos)[number];

const tourChapters = [
  { title: 'Find the work that matters', detail: 'Search scholarly papers and research topics.', tag: 'PAPER DISCOVERY', icon: Search },
  { title: 'See the research around it', detail: 'Explore authors, concepts, methods, and citations.', tag: 'CONNECTED CONTEXT', icon: Network },
  { title: 'Follow evidence to insight', detail: 'Keep source material close as your questions evolve.', tag: 'EVIDENCE FIRST', icon: FileText },
  { title: 'Build a workspace for ideas', detail: 'Bring connected research into one place.', tag: 'YOUR WORKSPACE', icon: Sparkles },
];

function ProductTourPoster() {
  return <div className="landing-tour-poster" aria-hidden="true">
    <div className="landing-tour-poster-copy"><span>RESEARCHGRAPH AI</span><strong>Research,<br /><b>connected.</b></strong><small>Explore the research universe.</small></div>
    <div className="landing-tour-poster-graph"><span className="tour-poster-orbit" /><span className="tour-poster-core">RG</span><span className="tour-poster-node n1" /><span className="tour-poster-node n2" /><span className="tour-poster-node n3" /><span className="tour-poster-node n4" /></div>
    <span className="landing-tour-poster-play"><Play size={18} fill="currentColor" /></span>
  </div>;
}

function ProductTourPlayer() {
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const duration = 18;
  const chapter = tourChapters[Math.min(Math.floor(elapsed / (duration / tourChapters.length)), tourChapters.length - 1)];
  const ChapterIcon = chapter.icon;

  useEffect(() => {
    if (!playing) return;
    const startedAt = Date.now() - elapsed * 1000;
    let timer = 0;
    const tick = () => {
      const next = Math.min(duration, (Date.now() - startedAt) / 1000);
      setElapsed(next);
      if (next >= duration) setPlaying(false);
      else timer = window.setTimeout(tick, 100);
    };
    timer = window.setTimeout(tick, 100);
    return () => window.clearTimeout(timer);
  }, [playing]);

  return <div className={`landing-tour-player${playing ? ' is-playing' : ''}`}>
    <div className="landing-tour-scene">
      <div className="landing-tour-scene-stars" />
      <div className="landing-tour-scene-brand"><Network size={16} /><span>ResearchGraph <b>AI</b></span></div>
      <div className="landing-tour-scene-copy" key={chapter.title}>
        <span className="landing-tour-scene-tag"><ChapterIcon size={13} />{chapter.tag}</span>
        <h3>{chapter.title}</h3>
        <p>{chapter.detail}</p>
      </div>
      <div className="landing-tour-scene-graph" aria-hidden="true">
        <span className="tour-scene-orbit orbit-a" /><span className="tour-scene-orbit orbit-b" />
        <span className="tour-scene-core"><Network size={27} /><small>RESEARCH<br />CORE</small></span>
        <span className="tour-scene-node node-a"><FileText size={13} />Papers</span><span className="tour-scene-node node-b"><Building2 size={13} />Authors</span>
        <span className="tour-scene-node node-c"><Lightbulb size={13} />Concepts</span><span className="tour-scene-node node-d"><Quote size={13} />Citations</span>
        <svg viewBox="0 0 430 320" preserveAspectRatio="none"><path d="M215 159 94 82M215 159 335 76M215 159 349 236M215 159 94 242M94 82 335 76M94 242 349 236" /></svg>
      </div>
    </div>
    <div className="landing-tour-controls">
      <button type="button" className="landing-tour-play-toggle" onClick={() => { if (elapsed >= duration) setElapsed(0); setPlaying(value => !value); }} aria-label={playing ? 'Pause product tour' : 'Play product tour'}>{playing ? 'Ⅱ' : <Play size={13} fill="currentColor" />}</button>
      <input type="range" min="0" max={duration} step="0.1" value={elapsed} aria-label="Product tour progress" onChange={event => { setElapsed(Number(event.currentTarget.value)); setPlaying(false); }} />
      <span>{`0:${String(Math.floor(elapsed)).padStart(2, '0')} / 0:18`}</span>
    </div>
  </div>;
}

const KnowledgeGraphFallback = () => (
  <div className="landing-static-graph" role="img" aria-label="Illustrative static knowledge graph preview">
    <svg viewBox="0 0 620 500" aria-hidden="true">
      <g className="landing-static-edges">
        <path d="M305 250 176 124M305 250 463 115M305 250 508 250M305 250 449 384M305 250 177 382M305 250 94 250M176 124 305 84M463 115 523 174M508 250 463 337M449 384 319 424M177 382 105 321M94 250 122 161M176 124 112 190M463 115 386 183M508 250 401 265M449 384 371 323M177 382 247 321" />
      </g>
      <g className="landing-static-paper" transform="translate(58 122) rotate(-8)">
        <rect width="100" height="68" rx="9" /><path d="M13 19h48M13 28h67M13 37h55M13 50h30" />
      </g>
      <g className="landing-static-paper" transform="translate(444 316) rotate(8)">
        <rect width="104" height="70" rx="9" /><path d="M13 19h51M13 28h76M13 37h58M13 50h37" />
      </g>
      <g className="landing-static-core">
        <circle cx="305" cy="250" r="72" />
        <circle cx="305" cy="250" r="58" />
        <text x="305" y="246">RESEARCH</text>
        <text x="305" y="265">CORE</text>
      </g>
      <g className="landing-static-points">
        <circle cx="176" cy="124" r="7" /><circle cx="463" cy="115" r="6" /><circle cx="508" cy="250" r="7" />
        <circle cx="449" cy="384" r="6" /><circle cx="177" cy="382" r="7" /><circle cx="94" cy="250" r="6" />
        <circle cx="305" cy="84" r="5" /><circle cx="319" cy="424" r="6" /><circle cx="386" cy="183" r="5" />
        <circle cx="247" cy="321" r="5" /><circle cx="122" cy="161" r="5" /><circle cx="401" cy="265" r="5" />
      </g>
    </svg>
    <span className="landing-static-label landing-static-label-papers"><FileText size={14} /> Papers</span>
    <span className="landing-static-label landing-static-label-authors"><Building2 size={14} /> Authors</span>
    <span className="landing-static-label landing-static-label-concepts"><Lightbulb size={14} /> Concepts</span>
    <span className="landing-static-label landing-static-label-citations"><Quote size={14} /> Citations</span>
    <span className="landing-static-note">Illustrative network</span>
  </div>
);

const LandingExperience: React.FC<LandingExperienceProps> = ({ onLogin, onRegister, onSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<FeaturedVideo | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [supportsWebGL, setSupportsWebGL] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [graphInView, setGraphInView] = useState(true);
  const demoCloseRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLElement>(null);
  const workflowLineRef = useRef<HTMLSpanElement>(null);
  const scrollProgressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    motionPreference.addEventListener('change', updateMotionPreference);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) || canvas.getContext('webgl');
    const webGLFrame = window.requestAnimationFrame(() => setSupportsWebGL(Boolean(gl)));
    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.landing-reveal'));
    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }
    const revealObserver = !motionPreference.matches && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
      : null;
    revealItems.forEach((item) => revealObserver?.observe(item));

    const sectionsObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      }, { threshold: [0.2, 0.45, 0.7] })
      : null;
    [document.getElementById('home'), ...sections.map(({ id }) => document.getElementById(id))]
      .filter((section): section is HTMLElement => Boolean(section))
      .forEach((section) => sectionsObserver?.observe(section));

    let scrollFrame = 0;
    const workflowElement = workflowRef.current;
    const line = workflowLineRef.current;
    let scrollTarget: Window | HTMLElement = window;
    let parent = workflowElement?.parentElement;
    while (parent && parent !== document.body) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight) {
        scrollTarget = parent;
        break;
      }
      parent = parent.parentElement;
    }
    const updateWorkflowProgress = () => {
      scrollFrame = 0;
      if (workflowElement && line) {
        const rect = workflowElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height * 0.45)));
        line.style.transform = 'scaleX(' + progress + ')';
      }
      const progressElement = scrollTarget === window ? document.documentElement : scrollTarget as HTMLElement;
      const scrollTop = scrollTarget === window ? window.scrollY : progressElement.scrollTop;
      const scrollLength = scrollTarget === window
        ? progressElement.scrollHeight - window.innerHeight
        : progressElement.scrollHeight - progressElement.clientHeight;
      const pageProgress = scrollLength > 0 ? Math.max(0, Math.min(1, scrollTop / scrollLength)) : 0;
      if (scrollProgressRef.current) scrollProgressRef.current.style.transform = 'scaleX(' + pageProgress + ')';
    };
    const scheduleWorkflowProgress = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateWorkflowProgress);
    };
    scrollTarget.addEventListener('scroll', scheduleWorkflowProgress, { passive: true });
    window.addEventListener('resize', scheduleWorkflowProgress, { passive: true });
    updateWorkflowProgress();

    const graphElement = graphRef.current;
    const graphObserver = graphElement && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => setGraphInView(Boolean(entries[0]?.isIntersecting)), { rootMargin: '140px 0px' })
      : null;
    if (graphElement && graphObserver) graphObserver.observe(graphElement);

    return () => {
      motionPreference.removeEventListener('change', updateMotionPreference);
      revealObserver?.disconnect();
      sectionsObserver?.disconnect();
      graphObserver?.disconnect();
      scrollTarget.removeEventListener('scroll', scheduleWorkflowProgress);
      window.removeEventListener('resize', scheduleWorkflowProgress);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(webGLFrame);
    };
  }, []);

  useEffect(() => {
    if (!demoOpen && !activeVideo) return;
    demoCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDemoOpen(false);
        setActiveVideo(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [demoOpen, activeVideo]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) onSearch(query);
  };

  const focusResearchSearch = () => {
    goTo('home');
    searchInputRef.current?.focus({ preventScroll: true });
  };

  const showInteractiveGraph = supportsWebGL && !reducedMotion && graphInView;

  return (
    <main className="landing-shell">
      <div className="landing-scroll-progress" aria-hidden="true"><span ref={scrollProgressRef} /></div>
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Main navigation">
          <button type="button" className="landing-brand" onClick={() => goTo('home')} aria-label="ResearchGraph AI home">
            <span className="landing-brand-mark"><Network size={21} strokeWidth={2.3} /></span>
            <span>ResearchGraph <b>AI</b></span>
          </button>
          <div className="landing-nav-links">
            <button type="button" className={activeSection === 'home' ? 'active' : ''} onClick={() => goTo('home')}>Home</button>
            {sections.map((section) => <button type="button" key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => goTo(section.id)}>{section.label}</button>)}
          </div>
          <div className="landing-nav-actions">
            <button type="button" className="landing-nav-search" onClick={focusResearchSearch} aria-label="Focus research search"><Search size={20} /></button>
            <button type="button" className="landing-login" onClick={onLogin}>Log In</button>
            <button type="button" className="landing-signup" onClick={onRegister}>Sign Up Free <ArrowRight size={16} /></button>
          </div>
          <button type="button" className="landing-menu-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen} aria-controls="landing-mobile-nav">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </nav>
        {mobileMenuOpen && <div id="landing-mobile-nav" className="landing-mobile-menu">
          <button type="button" onClick={() => goTo('home')}>Home</button>
          {sections.map((section) => <button type="button" key={section.id} onClick={() => goTo(section.id)}>{section.label}</button>)}
          <div><button type="button" onClick={onLogin}>Log In</button><button type="button" className="landing-signup" onClick={onRegister}>Sign Up Free <ArrowRight size={16} /></button></div>
        </div>}
      </header>

      <section id="home" className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span /> RESEARCH INTELLIGENCE, REIMAGINED</div>
          <h1 id="landing-title">Research,<br /><span className="landing-gradient-text">connected.</span></h1>
          <p className="landing-hero-description">Discover research papers, people, and ideas — and see how they connect across the research universe.</p>
          <form className="landing-search-form" onSubmit={submitSearch} role="search">
            <Search size={21} aria-hidden="true" />
            <input ref={searchInputRef} type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search papers, authors, concepts..." aria-label="Search papers, authors, and concepts" />
            <button type="submit" aria-label="Search research"><ArrowRight size={24} /></button>
          </form>
          <div className="landing-topic-group">
            <span className="landing-topic-lead">Explore a topic</span>
            <div className="landing-topic-row" aria-label="Explore popular research topics">
              {suggestedTopics.map((topic) => <button type="button" key={topic} onClick={() => onSearch(topic)}>{topic}</button>)}
            </div>
          </div>
          <div className="landing-hero-actions">
            <button type="button" className="landing-primary" onClick={onRegister}><Network size={17} /> Explore 3D Graph <ArrowRight size={17} /></button>
            <button type="button" className="landing-secondary" onClick={() => setDemoOpen(true)}><Play size={15} fill="currentColor" /> Watch Demo</button>
          </div>
        </div>

        <div ref={graphRef} className="landing-hero-visual" role="group" aria-label="Research knowledge graph preview">
          <div className="landing-visual-frame">
            {showInteractiveGraph ? <iframe title="Interactive illustrative ResearchGraph knowledge core" src="/knowledge_globe.html" loading="eager" allow="autoplay" /> : <KnowledgeGraphFallback />}
          </div>
        </div>
        <button type="button" className="landing-scroll-cue" onClick={() => goTo('topology')}><span><ArrowDown size={16} /></span> EXPLORE THE WORKFLOW</button>
      </section>

      <section id="topology" className="landing-section landing-topology" aria-labelledby="topology-title">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> CONNECT THE LITERATURE</div>
          <h2 id="topology-title">From papers to a living <span className="landing-gradient-text">knowledge graph</span></h2>
          <p>Start with a paper or topic, then follow the authors, methods, datasets, and citations connected to it. Each link adds context to the research landscape.</p>
        </div>
        <div className="landing-topology-grid">
          <div className="landing-network-card landing-reveal" role="img" aria-label="Illustrative connection map linking papers, authors, topics, citations, and datasets">
            <div className="landing-network-card-heading"><GitBranch size={16} /> Illustrative relationship map</div>
            <svg viewBox="0 0 560 340" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M280 170 280 53M280 170 464 170M280 170 280 287M280 170 96 170M280 53 464 170 280 287 96 170M96 170 186 70M464 170 374 70M96 170 186 270M464 170 374 270" /></svg>
            <div className="landing-network-node central"><Network size={20} /><span>Research</span></div>
            <div className="landing-network-node top"><FileText size={14} /> Papers</div>
            <div className="landing-network-node right"><Building2 size={14} /> Authors</div>
            <div className="landing-network-node bottom"><Lightbulb size={14} /> Concepts</div>
            <div className="landing-network-node left"><Quote size={14} /> Citations</div>
            <div className="landing-network-node upper-left"><Database size={14} /> Datasets</div>
          </div>
          <div className="landing-topology-copy landing-reveal">
            <article className="landing-feature-line"><span><BookOpen size={19} /></span><div><h3>Start with scholarly records</h3><p>Find paper metadata from supported sources and open the original record.</p></div></article>
            <article className="landing-feature-line"><span><Network size={19} /></span><div><h3>Trace related ideas</h3><p>Follow citations and shared concepts to discover adjacent work.</p></div></article>
            <article className="landing-feature-line"><span><FileText size={19} /></span><div><h3>Keep evidence close</h3><p>Review available passages alongside the paper they came from.</p></div></article>
            <button type="button" className="landing-text-link" onClick={onRegister}>Explore the workspace <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="landing-section landing-videos" aria-labelledby="videos-title">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> WATCH &amp; EXPLORE</div>
          <h2 id="videos-title">See how connected knowledge <span className="landing-gradient-text">changes the view</span></h2>
          <p>Short explainers from graph and AI teams introduce the ideas behind linked research. Open a video when you are ready to watch.</p>
        </div>
        <div className="landing-video-grid">
          {featuredVideos.map((video) => (
            <article className="landing-video-card landing-reveal" key={video.id}>
              <button type="button" className="landing-video-preview" onClick={() => setActiveVideo(video)} aria-label={`Play ${video.title} by ${video.publisher}`}>
                {video.productTour ? <ProductTourPoster /> : <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />}
                {!video.productTour && <span className="landing-video-play"><Play size={19} fill="currentColor" /></span>}
                {video.duration && <span className="landing-video-duration">{video.duration}</span>}
              </button>
              <div className="landing-video-copy">
                <span className="landing-video-publisher">{video.publisher}</span>
                <h3>{video.title}</h3>
                <p>{video.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="pipeline" ref={workflowRef} className="landing-section landing-pipeline" aria-labelledby="pipeline-title">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> GROUNDED RESEARCH WORKFLOW</div>
          <h2 id="pipeline-title">Move from a question to <span className="landing-gradient-text">useful evidence</span></h2>
          <p>Discovery, retrieval, and synthesis work together. AI answers depend on configured services and indexed research material.</p>
        </div>
        <div className="landing-workflow-track" aria-hidden="true"><span ref={workflowLineRef} /></div>
        <div className="landing-pipeline-steps">
          {workflow.map(({ number, title, detail, icon: Icon }) => <article className="landing-step landing-reveal" key={number}><div className="landing-step-top"><span>{number}</span><Icon size={19} /></div><h3>{title}</h3><p>{detail}</p></article>)}
        </div>
        <p className="landing-config-note">Available retrieval and answer-generation features depend on the services configured for your deployment.</p>
      </section>

      <section id="sources" className="landing-section landing-sources" aria-labelledby="sources-title">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> DATA SOURCES</div>
          <h2 id="sources-title">Built around <span className="landing-gradient-text">scholarly discovery</span></h2>
          <p>Start from research metadata and follow links to full-text material when it is available.</p>
        </div>
        <ul className="landing-source-list">
          <li className="landing-source-row landing-reveal"><span className="landing-source-icon"><Database size={19} /></span><div><h3><a href="https://openalex.org" target="_blank" rel="noreferrer">OpenAlex <ArrowRight size={13} /></a></h3><p>Scholarly works and metadata used for paper search and discovery.</p></div><span className="landing-source-tag">Metadata search</span></li>
          <li className="landing-source-row landing-reveal"><span className="landing-source-icon"><FileText size={19} /></span><div><h3><a href="https://arxiv.org" target="_blank" rel="noreferrer">arXiv <ArrowRight size={13} /></a></h3><p>Preprint metadata lookup for supported arXiv identifiers.</p></div><span className="landing-source-tag">Preprint records</span></li>
        </ul>
        <p className="landing-config-note">Vector storage, graph persistence, and language-model services are deployment integrations, not scholarly source providers.</p>
      </section>

      <section id="exploration" className="landing-exploration" aria-labelledby="exploration-title">
        <div className="landing-exploration-inner">
          <div className="landing-exploration-copy landing-reveal">
            <div className="landing-eyebrow"><span /> RESEARCH EXPLORATION</div>
            <h2 id="exploration-title">See the connections. <span>Find the next question.</span></h2>
            <p>Explore how a paper connects to methods, topics, authors, and evidence. The preview is illustrative; your workspace graph reflects the data available to your account.</p>
            <button type="button" className="landing-dark-action" onClick={onRegister}>Explore your research graph <ArrowRight size={17} /></button>
          </div>
          <div className="landing-exploration-visual landing-reveal" role="img" aria-label="Illustrative research relationship network">
            <div className="landing-exploration-meta"><span><Sparkles size={13} /> RESEARCH MAP</span><span>ILLUSTRATIVE PREVIEW</span></div>
            <svg viewBox="0 0 520 340" aria-hidden="true">
              <defs>
                <radialGradient id="landing-graph-core" cx="36%" cy="30%"><stop offset="0%" stopColor="#1B4D88" /><stop offset="100%" stopColor="#09172E" /></radialGradient>
                <linearGradient id="landing-graph-edge"><stop stopColor="#36D6F2" stopOpacity=".1" /><stop offset="50%" stopColor="#61ACFF" stopOpacity=".72" /><stop offset="100%" stopColor="#A783FF" stopOpacity=".18" /></linearGradient>
                <filter id="landing-graph-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <ellipse className="landing-exploration-orbit orbit-one" cx="260" cy="168" rx="198" ry="126" />
              <ellipse className="landing-exploration-orbit orbit-two" cx="260" cy="168" rx="151" ry="109" />
              <g className="landing-exploration-links"><path d="M260 168 110 82M260 168 405 75M260 168 445 202M260 168 366 290M260 168 138 286M260 168 71 210M110 82 260 38M405 75 445 202M445 202 366 290M366 290 138 286M138 286 71 210M71 210 110 82" /></g>
              <g className="landing-exploration-signals"><path d="M110 82 260 38 405 75M71 210 138 286 366 290M405 75 445 202" /></g>
              <circle className="landing-exploration-core-halo" cx="260" cy="168" r="66" />
              <circle className="landing-exploration-core" cx="260" cy="168" r="48" fill="url(#landing-graph-core)" />
              <circle className="landing-exploration-core-ring" cx="260" cy="168" r="38" />
              <text className="landing-exploration-core-label" x="260" y="164">Research</text><text className="landing-exploration-core-label" x="260" y="181">network</text>
              <g className="landing-exploration-points" filter="url(#landing-graph-glow)"><circle cx="110" cy="82" r="7" /><circle cx="405" cy="75" r="7" /><circle cx="445" cy="202" r="7" /><circle cx="366" cy="290" r="7" /><circle cx="138" cy="286" r="7" /><circle cx="71" cy="210" r="7" /><circle cx="260" cy="38" r="6" /></g>
            </svg>
            <span className="landing-explore-pill pill-one"><FileText size={14} /> Papers</span>
            <span className="landing-explore-pill pill-two"><Building2 size={14} /> Authors</span>
            <span className="landing-explore-pill pill-three"><Lightbulb size={14} /> Concepts</span>
            <span className="landing-explore-pill pill-four"><Quote size={14} /> Citations</span>
            <span className="landing-exploration-note">Illustrative relationship preview</span>
          </div>
        </div>
      </section>

      <section id="about" className="landing-final-cta landing-reveal" aria-labelledby="about-title">
        <div className="landing-final-mark"><Sparkles size={21} /></div>
        <div className="landing-final-copy"><div className="landing-eyebrow"><span /> ABOUT RESEARCHGRAPH AI</div><h2 id="about-title">Make the connections in research easier to see.</h2><p>Bring paper discovery, connected scholarly context, and evidence-focused tools into one research workspace.</p></div>
        <button type="button" className="landing-primary" onClick={onRegister}>Create your workspace <ArrowRight size={17} /></button>
      </section>

      <footer className="landing-footer"><button type="button" className="landing-brand" onClick={() => goTo('home')}><span className="landing-brand-mark"><Network size={18} /></span><span>ResearchGraph <b>AI</b></span></button><span>Explore research. Connect knowledge.</span><div><button type="button" onClick={onLogin}>Log In</button><button type="button" onClick={onRegister}>Sign Up Free</button></div></footer>

      {demoOpen && <div className="landing-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDemoOpen(false); }}>
        <section className="landing-demo-modal" role="dialog" aria-modal="true" aria-labelledby="landing-demo-title">
          <button ref={demoCloseRef} type="button" className="landing-modal-close" onClick={() => setDemoOpen(false)} aria-label="Close demo"><X size={19} /></button>
          <div className="landing-eyebrow"><span /> HOW THE WORKSPACE FITS TOGETHER</div>
          <h2 id="landing-demo-title">A closer look at the research workflow</h2>
          <p>Search supported scholarly sources, inspect paper records, and use retrieval tools when their required services are configured.</p>
          <div className="landing-demo-list"><div><Search size={18} /><span><b>Discover</b><small>Search scholarly metadata.</small></span></div><div><FileText size={18} /><span><b>Review</b><small>Inspect source records and available documents.</small></span></div><div><Network size={18} /><span><b>Connect</b><small>Explore related research in your workspace.</small></span></div></div>
          <button type="button" className="landing-primary" onClick={() => { setDemoOpen(false); onRegister(); }}>Explore 3D Graph <ArrowRight size={17} /></button>
        </section>
      </div>}
      {activeVideo && <div className="landing-modal-backdrop landing-video-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveVideo(null); }}>
        <section className="landing-video-modal" role="dialog" aria-modal="true" aria-labelledby="landing-video-title">
          <button ref={demoCloseRef} type="button" className="landing-modal-close" onClick={() => setActiveVideo(null)} aria-label="Close video"><X size={19} /></button>
          <div className="landing-video-player">{activeVideo.productTour
            ? <ProductTourPlayer />
            : <iframe title={activeVideo.title} src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}</div>
          <div className="landing-video-modal-copy"><span className="landing-video-publisher">{activeVideo.publisher}</span><h2 id="landing-video-title">{activeVideo.title}</h2></div>
        </section>
      </div>}
    </main>
  );
};

export default LandingExperience;

