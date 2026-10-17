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

const KnowledgeGraphFallback = () => (
  <div className="landing-static-graph" role="img" aria-label="Illustrative static knowledge graph preview">
    <svg viewBox="0 0 620 500" aria-hidden="true">
      <g className="landing-static-edges">
        <path d="M305 250 176 124M305 250 463 115M305 250 508 250M305 250 449 384M305 250 177 382M305 250 94 250M176 124 305 84M463 115 523 174M508 250 463 337M449 384 319 424M177 382 105 321M94 250 122 161M176 124 112 190M463 115 386 183M508 250 401 265M449 384 371 323M177 382 247 321" />
      </g>
      <circle className="landing-static-orbit landing-static-orbit-one" cx="305" cy="250" r="166" />
      <circle className="landing-static-orbit landing-static-orbit-two" cx="305" cy="250" r="212" />
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
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [query, setQuery] = useState('');
  const [supportsWebGL, setSupportsWebGL] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [graphInView, setGraphInView] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const demoCloseRef = useRef<HTMLButtonElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLElement>(null);
  const workflowLineRef = useRef<HTMLSpanElement>(null);

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
      if (!workflowElement || !line) return;
      const rect = workflowElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height * 0.45)));
      line.style.transform = 'scaleX(' + progress + ')';
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
    if (!demoOpen) return;
    demoCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDemoOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [demoOpen]);

  useEffect(() => {
    const focusSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('home')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        window.setTimeout(() => searchRef.current?.focus(), reducedMotion ? 0 : 250);
      }
    };
    window.addEventListener('keydown', focusSearchShortcut);
    return () => window.removeEventListener('keydown', focusSearchShortcut);
  }, [reducedMotion]);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) onSearch(trimmedQuery);
  };

  const showInteractiveGraph = supportsWebGL && !reducedMotion && graphInView;

  return (
    <main className="landing-shell">
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
            <button type="button" className="landing-icon-button" aria-label="Focus research search" onClick={() => { goTo('home'); window.setTimeout(() => searchRef.current?.focus(), reducedMotion ? 0 : 250); }}><Search size={18} /></button>
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
          <h1 id="landing-title">A Universe of <span className="landing-gradient-text">Connected Knowledge</span></h1>
          <p className="landing-hero-description">Discover scholarly work, follow the relationships between ideas, and build a clearer view of your research landscape. ResearchGraph AI brings literature discovery and evidence-focused tools into one workspace.</p>
          <form className="landing-search" role="search" onSubmit={submitSearch}>
            <Search size={19} aria-hidden="true" />
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, authors, topics, institutions..." aria-label="Search papers, authors, topics, and institutions" />
            <kbd aria-hidden="true">Ctrl K</kbd>
            <button type="submit" aria-label="Search"><ArrowRight size={19} /></button>
          </form>
          <div className="landing-topic-row" aria-label="Suggested research topics">
            <span>Explore</span>
            {suggestedTopics.map((topic) => <button type="button" key={topic} onClick={() => { setQuery(topic); searchRef.current?.focus(); }}>{topic}</button>)}
          </div>
          <div className="landing-hero-actions">
            <button type="button" className="landing-primary" onClick={onRegister}><Network size={17} /> Explore 3D Graph <ArrowRight size={17} /></button>
            <button type="button" className="landing-secondary" onClick={() => setDemoOpen(true)}><Play size={15} fill="currentColor" /> Watch Demo</button>
          </div>
          <p className="landing-data-note"><span className="landing-status-dot" /> Scholarly discovery powered by supported research sources</p>
        </div>

        <div ref={graphRef} className="landing-hero-visual" role="group" aria-label="Research knowledge graph preview">
          <div className="landing-visual-frame">
            <div className="landing-visual-orbit landing-orbit-one" aria-hidden="true" />
            <div className="landing-visual-orbit landing-orbit-two" aria-hidden="true" />
            {showInteractiveGraph ? <iframe title="Interactive illustrative ResearchGraph knowledge core" src="/knowledge_globe.html" loading="eager" allow="autoplay" /> : <KnowledgeGraphFallback />}
            <div className="landing-visual-caption"><Network size={14} /> Knowledge graph preview <span>Illustrative</span></div>
          </div>
        </div>
        <button type="button" className="landing-scroll-cue" onClick={() => goTo('topology')}><span><ArrowDown size={16} /></span> EXPLORE THE WORKFLOW</button>
      </section>

      <section id="topology" className="landing-section landing-topology" aria-labelledby="topology-title">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> CONNECT THE LITERATURE</div>
          <h2 id="topology-title">From papers to a living <span className="landing-gradient-text">knowledge graph</span></h2>
          <p>Research becomes easier to navigate when its relationships are visible. Follow works, authors, topics, citations, and datasets as connected parts of a larger scholarly landscape.</p>
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
            <article className="landing-feature-line"><span><BookOpen size={19} /></span><div><h3>Start with scholarly records</h3><p>Search real paper metadata and follow source links when available.</p></div></article>
            <article className="landing-feature-line"><span><Network size={19} /></span><div><h3>Follow meaningful relationships</h3><p>Move between papers and related entities as graph data is indexed.</p></div></article>
            <article className="landing-feature-line"><span><FileText size={19} /></span><div><h3>Keep evidence in view</h3><p>Review retrieved passages alongside the papers they came from.</p></div></article>
            <button type="button" className="landing-text-link" onClick={onRegister}>Explore the workspace <ArrowRight size={16} /></button>
          </div>
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
            <svg viewBox="0 0 520 340" aria-hidden="true">
              <g className="landing-exploration-links"><path d="M260 168 110 82M260 168 405 75M260 168 445 202M260 168 366 290M260 168 138 286M260 168 71 210M110 82 260 38M405 75 445 202M445 202 366 290M366 290 138 286M138 286 71 210M71 210 110 82" /></g>
              <circle className="landing-exploration-core" cx="260" cy="168" r="48" />
              <text className="landing-exploration-core-label" x="260" y="164">Research</text><text className="landing-exploration-core-label" x="260" y="181">network</text>
              <circle cx="110" cy="82" r="8" /><circle cx="405" cy="75" r="8" /><circle cx="445" cy="202" r="8" /><circle cx="366" cy="290" r="8" /><circle cx="138" cy="286" r="8" /><circle cx="71" cy="210" r="8" /><circle cx="260" cy="38" r="7" />
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
    </main>
  );
};

export default LandingExperience;

