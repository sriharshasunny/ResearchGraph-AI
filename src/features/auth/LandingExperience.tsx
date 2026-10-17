import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Database, FileText, Menu, Network, Play, Search, X } from 'lucide-react';

interface LandingExperienceProps {
  onLogin: () => void;
  onRegister: () => void;
}

const sections = [
  { id: 'topology', label: '3D Topology' },
  { id: 'pipeline', label: 'RAG Pipeline' },
  { id: 'sources', label: 'Data Sources' },
  { id: 'about', label: 'About Us' },
];

const LandingExperience: React.FC<LandingExperienceProps> = ({ onLogin, onRegister }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.landing-reveal'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((item) => observer.observe(item));

    const sectionsObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { threshold: [0.2, 0.45, 0.7] });
    [document.getElementById('home'), ...sections.map(({ id }) => document.getElementById(id))]
      .filter((section): section is HTMLElement => Boolean(section))
      .forEach((section) => sectionsObserver.observe(section));

    return () => { observer.disconnect(); sectionsObserver.disconnect(); };
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  return (
    <main className="landing-shell">
      <header className="landing-nav-wrap">
        <nav className="landing-nav" aria-label="Main navigation">
          <button className="landing-brand" onClick={() => goTo('home')} aria-label="ResearchGraph AI home">
            <span className="landing-brand-mark"><Network size={21} strokeWidth={2.3} /></span>
            <span>ResearchGraph <b>AI</b></span>
          </button>
          <div className="landing-nav-links">
            <button className={activeSection === 'home' ? 'active' : ''} onClick={() => goTo('home')}>Home</button>
            {sections.map((section) => <button key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => goTo(section.id)}>{section.label}</button>)}
          </div>
          <div className="landing-nav-actions">
            <button className="landing-icon-button" aria-label="Focus research search" onClick={() => { goTo('home'); window.setTimeout(() => searchRef.current?.focus(), 250); }}><Search size={18} /></button>
            <button className="landing-login" onClick={onLogin}>Log In</button>
            <button className="landing-signup" onClick={onRegister}>Sign Up Free <ArrowRight size={16} /></button>
          </div>
          <button className="landing-menu-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X /> : <Menu />}</button>
        </nav>
        {mobileMenuOpen && <div className="landing-mobile-menu">
          <button onClick={() => goTo('home')}>Home</button>
          {sections.map((section) => <button key={section.id} onClick={() => goTo(section.id)}>{section.label}</button>)}
          <div><button onClick={onLogin}>Log In</button><button className="landing-signup" onClick={onRegister}>Sign Up Free <ArrowRight size={16} /></button></div>
        </div>}
      </header>

      <section id="home" className="landing-hero">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span /> RESEARCHGRAPH AI</div>
          <h1>A Universe of <span className="landing-gradient-text">Connected Knowledge</span></h1>
          <p className="landing-hero-description">Explore scholarly work, trace connections across research, and build a clearer view of what you’re studying.</p>
          <form className="landing-search" onSubmit={(event) => { event.preventDefault(); onLogin(); }}>
            <Search size={20} aria-hidden="true" />
            <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search papers, authors, topics..." aria-label="Search papers, authors, topics" />
            <button type="submit">Explore <ArrowRight size={17} /></button>
          </form>
          <div className="landing-hero-actions">
            <button className="landing-primary" onClick={onRegister}>Explore 3D Graph <ArrowRight size={18} /></button>
            <button className="landing-secondary" onClick={() => setDemoOpen(true)}><Play size={15} fill="currentColor" /> Watch Demo</button>
          </div>
          <div className="landing-data-note"><span className="landing-status-dot" /> Research discovery with OpenAlex and arXiv metadata</div>
        </div>
        <div className="landing-hero-visual" aria-label="Interactive research knowledge graph visualization">
          <div className="landing-visual-orbit landing-orbit-one" /><div className="landing-visual-orbit landing-orbit-two" />
          <iframe title="Interactive ResearchGraph knowledge core" src="/knowledge_globe.html" loading="eager" allow="autoplay" />
          <div className="landing-visual-caption"><Network size={14} /> Interactive knowledge core <span>Illustrative network</span></div>
        </div>
        <button className="landing-scroll-cue" onClick={() => goTo('topology')}><span><ArrowDown size={16} /></span> SCROLL TO EXPLORE</button>
      </section>

      <section id="topology" className="landing-section landing-topology">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> CONNECT THE LITERATURE</div>
          <h2>From papers to a living <span className="landing-gradient-text">knowledge graph</span></h2>
          <p>Research is easier to navigate when its relationships are visible. Explore how papers, authors, topics, and other scholarly entities relate.</p>
        </div>
        <div className="landing-topology-grid">
          <div className="landing-network-card landing-reveal">
            <div className="landing-network-glow" />
            <div className="landing-network-node central"><Network size={22} /><span>Research</span></div>
            {[
              ['Paper', 'top'], ['Author', 'right'], ['Topic', 'bottom'], ['Citation', 'left'],
            ].map(([label, position]) => <div className={`landing-network-node ${position}`} key={label}><span className="landing-node-dot" />{label}</div>)}
            <svg viewBox="0 0 560 340" preserveAspectRatio="none" aria-hidden="true"><path d="M280 170 280 53M280 170 464 170M280 170 280 287M280 170 96 170M280 53 464 170 280 287 96 170Z" /></svg>
          </div>
          <div className="landing-topology-copy landing-reveal">
            <div className="landing-feature-line"><span><BookOpen size={19} /></span><div><h3>Start with scholarly records</h3><p>Find research using available academic metadata providers.</p></div></div>
            <div className="landing-feature-line"><span><Network size={19} /></span><div><h3>Follow meaningful relationships</h3><p>Move between works and related entities as graph data becomes available.</p></div></div>
            <div className="landing-feature-line"><span><FileText size={19} /></span><div><h3>Keep evidence in view</h3><p>Inspect source papers and supporting text alongside your exploration.</p></div></div>
            <button className="landing-text-link" onClick={onRegister}>Explore the workspace <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>

      <section id="pipeline" className="landing-section landing-pipeline">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> GROUNDED RESEARCH WORKFLOW</div>
          <h2>Move from a question to <span className="landing-gradient-text">useful evidence</span></h2>
          <p>ResearchGraph AI can combine scholarly discovery with retrieval over indexed material. Some steps require configured services.</p>
        </div>
        <div className="landing-pipeline-steps">
          {[
            { n: '01', title: 'Discover', text: 'Search supported scholarly metadata from OpenAlex and arXiv.', icon: Search },
            { n: '02', title: 'Collect', text: 'Use available open-access documents or abstracts as source material.', icon: FileText },
            { n: '03', title: 'Retrieve', text: 'Create embeddings and retrieve relevant passages when an embedding provider is configured.', icon: Database },
            { n: '04', title: 'Review', text: 'Generate grounded answers when an LLM is configured, with source context available for review.', icon: Network },
          ].map(({ n, title, text, icon: Icon }) => <article className="landing-step landing-reveal" key={n}><div className="landing-step-top"><span>{n}</span><Icon size={19} /></div><h3>{title}</h3><p>{text}</p></article>)}
        </div>
        <p className="landing-config-note">Available features depend on the services configured for your deployment.</p>
      </section>

      <section id="sources" className="landing-section landing-sources">
        <div className="landing-section-heading landing-reveal">
          <div className="landing-eyebrow"><span /> DATA SOURCES</div>
          <h2>Built around <span className="landing-gradient-text">scholarly discovery</span></h2>
          <p>Start from research metadata, then follow links to source material when it is available.</p>
        </div>
        <div className="landing-source-grid">
          <article className="landing-source-card landing-reveal"><span className="landing-source-icon"><Database size={20} /></span><div><h3>OpenAlex</h3><p>Scholarly works and related metadata for research discovery.</p></div><span className="landing-source-tag">Metadata</span></article>
          <article className="landing-source-card landing-reveal"><span className="landing-source-icon violet"><FileText size={20} /></span><div><h3>arXiv</h3><p>Preprint records and available paper information for supported topics.</p></div><span className="landing-source-tag">Preprints</span></article>
        </div>
        <p className="landing-config-note">Additional storage and AI services depend on the backend environment configuration.</p>
      </section>

      <section id="about" className="landing-section landing-about landing-reveal">
        <div className="landing-about-mark"><Network size={27} /></div>
        <div className="landing-about-copy"><div className="landing-eyebrow"><span /> ABOUT RESEARCHGRAPH AI</div><h2>Make the connections in research easier to see.</h2><p>ResearchGraph AI brings paper discovery, connected scholarly context, and evidence-focused tools into one workspace for exploring ideas.</p></div>
        <button className="landing-primary" onClick={onRegister}>Start exploring <ArrowRight size={18} /></button>
      </section>

      <footer className="landing-footer"><button className="landing-brand" onClick={() => goTo('home')}><span className="landing-brand-mark"><Network size={18} /></span><span>ResearchGraph <b>AI</b></span></button><span>Explore research. Connect knowledge.</span><div><button onClick={onLogin}>Log In</button><button onClick={onRegister}>Sign Up Free</button></div></footer>

      {demoOpen && <div className="landing-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDemoOpen(false); }}>
        <section className="landing-demo-modal" role="dialog" aria-modal="true" aria-labelledby="landing-demo-title">
          <button className="landing-modal-close" onClick={() => setDemoOpen(false)} aria-label="Close demo"><X size={19} /></button>
          <div className="landing-eyebrow"><span /> HOW THE WORKSPACE FITS TOGETHER</div>
          <h2 id="landing-demo-title">A closer look at the research workflow</h2>
          <p>Search supported scholarly sources, inspect available papers, and use retrieval tools when their required services are configured.</p>
          <div className="landing-demo-list"><div><Search size={18} /><span><b>Discover</b><small>Search scholarly metadata.</small></span></div><div><FileText size={18} /><span><b>Review</b><small>Open source records and available documents.</small></span></div><div><Network size={18} /><span><b>Connect</b><small>Explore related research in the workspace.</small></span></div></div>
          <button className="landing-primary" onClick={() => { setDemoOpen(false); onRegister(); }}>Explore 3D Graph <ArrowRight size={17} /></button>
        </section>
      </div>}
    </main>
  );
};

export default LandingExperience;

