import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas

# Custom NumberedCanvas to support "Page X of Y" and professional headers/footers
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super().showPage()
        super().save()

    def draw_page_elements(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on the cover page
            return

        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(HexColor("#64748b")) # slate-500

        # Header
        self.drawString(54, 750, "ResearchGraph AI — Comprehensive Technical Documentation")
        self.setStrokeColor(HexColor("#cbd5e1")) # slate-300
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)

        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 40, page_text)
        self.drawString(54, 40, "Confidential - Academic & Project Reference Guide")
        self.line(54, 52, 558, 52)

        self.restoreState()

def build_pdf():
    pdf_filename = "ResearchGraph_AI_Documentation.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )

    styles = getSampleStyleSheet()

    # Define custom styles to match a premium dark/light editorial palette
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=36,
        textColor=HexColor("#1e1b4b"), # deep indigo
        spaceAfter=15
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=HexColor("#475569"), # slate-600
        spaceAfter=40
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=HexColor("#1e1b4b"), # deep indigo
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=HexColor("#4338ca"), # indigo-700
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14.5,
        textColor=HexColor("#334155"), # slate-700
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=HexColor("#334155"),
        leftIndent=20,
        firstLineIndent=-10,
        spaceAfter=5
    )

    code_style = ParagraphStyle(
        'CodeCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=HexColor("#0f172a"),
        backColor=HexColor("#f8fafc"),
        borderColor=HexColor("#cbd5e1"),
        borderWidth=0.5,
        borderPadding=8,
        spaceBefore=8,
        spaceAfter=10
    )

    callout_style = ParagraphStyle(
        'CalloutCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=HexColor("#1e3a8a"), # blue-900
        backColor=HexColor("#eff6ff"), # blue-50
        borderColor=HexColor("#bfdbfe"), # blue-200
        borderWidth=0.5,
        borderPadding=10,
        spaceBefore=8,
        spaceAfter=10
    )

    story = []

    # ================= PAGE 1: COVER PAGE =================
    story.append(Spacer(1, 100))
    story.append(Paragraph("ResearchGraph AI", title_style))
    story.append(Paragraph("A Comprehensive Technical Reference Guide: Architecture, Technology Stack, Features, Comparative Analysis, and Academic Value", subtitle_style))
    
    # Cover Divider Line
    t_divider = Table([[""]], colWidths=[504], rowHeights=[3])
    t_divider.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), HexColor("#4338ca")),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_divider)
    story.append(Spacer(1, 150))

    # Meta Details Table
    meta_data = [
        [Paragraph("<b>Prepared For:</b> Academic Research & Project Evaluation", body_style)],
        [Paragraph("<b>Prepared By:</b> Antigravity AI Engineering Suite", body_style)],
        [Paragraph("<b>Framework Stack:</b> React 19, TypeScript, Vite 8, Tailwind CSS v3", body_style)],
        [Paragraph("<b>Date of Compilation:</b> August 2026", body_style)],
        [Paragraph("<b>Project Version:</b> v1.0.0 (Production Mock)", body_style)]
    ]
    meta_table = Table(meta_data, colWidths=[400])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(meta_table)
    story.append(PageBreak())

    # ================= PAGE 2: TABLE OF CONTENTS & INTRODUCTION =================
    story.append(Paragraph("Table of Contents", h1_style))
    story.append(Spacer(1, 10))
    
    toc_data = [
        ["1. Executive Summary & Definition of the Project", "Page 3"],
        ["2. How the Application Works (Features & Workflows)", "Page 3"],
        ["3. File & Directory Structure Structure (A to Z)", "Page 4"],
        ["4. Architectural Logic & State Flow", "Page 5"],
        ["5. Technology Stack & Packages", "Page 6"],
        ["6. Comparative Literature Analysis (Why It's Better)", "Page 6"],
        ["7. Advantages & Structural Limitations", "Page 7"],
        ["8. Existing Academic Implementations & Future Work", "Page 8"],
    ]
    toc_table = Table(toc_data, colWidths=[420, 84])
    toc_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, HexColor("#f1f5f9")),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9.5),
        ('TEXTCOLOR', (0,0), (-1,-1), HexColor("#334155")),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(toc_table)
    story.append(Spacer(1, 25))

    story.append(Paragraph("1. Executive Summary & Project Definition", h1_style))
    story.append(Paragraph(
        "<b>ResearchGraph AI</b> is a state-of-the-art visual environment designed to revolutionize the way academic "
        "literature is searched, analyzed, and synthesized. Traditional bibliographic search engines (such as Google "
        "Scholar or PubMed) rely on list-based displays that strip out the structural and citation networks linking papers "
        "together. This creates immense cognitive friction for researchers who must read dozens of abstracts, manually "
        "construct relationship models, and piece together literature gaps.",
        body_style
    ))
    story.append(Paragraph(
        "ResearchGraph AI resolves these limitations by representing research papers as dynamic, interconnected nodes "
        "within an interactive, web-based workspace. Powered by customized graph visualizations, an embedded AI research "
        "assistant, automated gap analyzers, and tabular multi-paper comparison matrices, the platform allows users "
        "to discover influential citation paths, analyze methodologies, and visualize research clusters at a glance. "
        "The project is structured to offer an immersive, modern user experience that matches the highest standards of "
        "contemporary dashboard design.",
        body_style
    ))
    story.append(PageBreak())

    # ================= PAGE 3: HOW THE APPLICATION WORKS =================
    story.append(Paragraph("2. How the Application Works (Features & Workflows)", h1_style))
    
    story.append(Paragraph("A. Workspace Navigation & Custom Layouts", h2_style))
    story.append(Paragraph(
        "The application provides a seamless, single-page application (SPA) layout with a left-hand navigation sidebar "
        "and a fluid content area. The UI features a glassmorphic dark mode theme with subtle radial glows and grid "
        "overlays to ensure a premium feel. Transitions are animated smoothly using framer-motion.",
        body_style
    ))

    story.append(Paragraph("B. Interactive Knowledge Graph Explorer", h2_style))
    story.append(Paragraph(
        "Built using <b>React Flow</b> (via <i>@xyflow/react</i>), this feature maps research entities dynamically. "
        "The graph groups nodes into 5 categories: Papers, Authors, Datasets, Methods, and Models. "
        "Nodes are positioned in circular, concentric rings to maximize visual order:",
        body_style
    ))
    story.append(Paragraph("• <b>Concentric Circle 1 (Radius 250px):</b> Central core paper nodes.", bullet_style))
    story.append(Paragraph("• <b>Concentric Circle 2 (Radius 450px):</b> Author nodes connected to papers.", bullet_style))
    story.append(Paragraph("• <b>Concentric Circle 3 (Radius 650px):</b> Associated Datasets, Methods, and Models.", bullet_style))
    story.append(Paragraph(
        "Connections (edges) depict specific semantic relationships: <i>WRITTEN_BY</i>, <i>TESTED_ON</i>, <i>USES</i>, "
        "<i>IMPROVES</i>, and <i>CITES</i> (represented by dashed blue directional lines). Selecting a node highlights its "
        "neighborhood, and clicking a paper loads its detailed specifications instantly.",
        body_style
    ))

    story.append(Paragraph("C. AI Semantic Chat Assistant", h2_style))
    story.append(Paragraph(
        "The chat page simulates a conversation with an LLM. It processes natural language queries like 'explain ViT advantages' "
        "or 'give me a summary of CLIP'. The assistant formats its output with markdown bolding, inline tables comparing models, "
        "or customized Python code blocks demonstrating training loops. It also includes interactive citations that link "
        "directly to paper detail pages in the workspace.",
        body_style
    ))

    story.append(Paragraph("D. Synthesis Matrix (Literature Review & Gaps)", h2_style))
    story.append(Paragraph(
        "The Literature Review tab automatically aggregates chosen papers into structured thematic reviews. "
        "It generates a comparison grid summarizing datasets, training objectives, and accuracies. "
        "Crucially, it parses methodologies to extract <i>Research Gaps</i> (e.g. O(N^2) complexity limit of self-attention) "
        "and maps their impact (High/Medium) and potential resolution pathways.",
        body_style
    ))

    story.append(Paragraph("E. Multi-Paper Comparison Matrix", h2_style))
    story.append(Paragraph(
        "This tool enables users to select up to 3 papers side-by-side. The application dynamically compiles a vertical table "
        "comparing metrics: Publication Year, Key Dataset, Core Method, Baseline Model, Accuracy Score, Advantages, and Limitations. "
        "This saves researchers hours of manual comparative note-taking.",
        body_style
    ))
    
    story.append(Paragraph("F. Recharts Analytics Dashboard", h2_style))
    story.append(Paragraph(
        "Provides visual stats, including annual publication timelines, top-growing research domains (Generative AI, Computer Vision, "
        "NLP), dataset usage, and model popularity ratings. Charts render fluidly and automatically scale to light/dark themes.",
        body_style
    ))
    story.append(PageBreak())

    # ================= PAGE 4: DIRECTORY STRUCTURE =================
    story.append(Paragraph("3. File & Directory Structure (A to Z)", h1_style))
    story.append(Paragraph(
        "The project is structured following clean React-TypeScript modularity rules. Below is a comprehensive list "
        "of directories and files making up the codebase:",
        body_style
    ))

    # File Structure visual representation using Code Style
    structure_text = (
        "researchgraph-ai/\n"
        "├── .gitignore                 # Files and folders to exclude from version control\n"
        "├── .oxlintrc.json             # Configuration rules for the lightning-fast Oxlint linter\n"
        "├── README.md                  # Project overview and basic local start instructions\n"
        "├── package.json               # Package script entries and module dependencies\n"
        "├── postcss.config.js          # Styling post-processor settings (Tailwind)\n"
        "├── tailwind.config.js         # Tailored brand color palettes, fonts, and dark mode class\n"
        "├── tsconfig.json              # TypeScript root project settings\n"
        "├── vite.config.ts             # Bundler settings with React SWC and path resolution\n"
        "├── public/                    # Static asset files accessible directly from root URL\n"
        "└── src/                       # Main source code directory\n"
        "    ├── main.tsx               # Entry point of the DOM tree that initializes React 19\n"
        "    ├── index.css              # Global custom utility classes and scrollbar configurations\n"
        "    ├── App.tsx                # Page controller routing active views\n"
        "    ├── App.css                # Styles for container dimensions and core frame layout\n"
        "    ├── types/                 # TypeScript interfaces and entity data structures\n"
        "    │   └── index.ts           # Exports interfaces: Paper, Author, ChatMessage, LitReview\n"
        "    ├── context/               # React Context Providers for global state\n"
        "    │   └── AppContext.tsx     # Holds active page, theme, comparison lists, saved history\n"
        "    ├── data/                  # Static mock database\n"
        "    │   └── mockData.ts        # Exports 100+ generated papers, authors, graph nodes, reviews\n"
        "    ├── components/            # Reusable UI modules shared across feature sub-systems\n"
        "    │   ├── Navbar.tsx         # Top bar displaying search input, profile status, dark mode toggle\n"
        "    │   ├── Sidebar.tsx        # Navigation sidebar with responsive active tabs\n"
        "    │   ├── PaperCard.tsx      # Standardized card displaying citation stats, abstract, save buttons\n"
        "    │   ├── EmptyState.tsx     # Fallback graphic for empty search or comparison results\n"
        "    │   ├── LoadingSkeleton.tsx# Visual placeholder shown during page transitions\n"
        "    │   └── Toast.tsx          # System notifications showing success/info/warning alerts\n"
        "    └── features/              # Feature directories representing primary layout pages\n"
        "        ├── landing/           # Elegant introduction panel with product pitch and start buttons\n"
        "        ├── dashboard/         # Grid system summarizing overall status, recents, and updates\n"
        "        ├── search/            # Filter panel (years, domains, datasets) and search card layout\n"
        "        ├── chat/              # Chat message queue with interactive citation components\n"
        "        ├── graph/             # Node canvas using React Flow mapping bibliographic webs\n"
        "        ├── lit-review/        # Review compilation and gap-analysis accordion panels\n"
        "        ├── compare/           # Multi-column grid side-by-side comparison tables\n"
        "        ├── details/           # Paper-specific profiles displaying timelines, methods, references\n"
        "        ├── analytics/         # Recharts charts displaying statistics on fields\n"
        "        └── profile/           # User configuration page detailing saved and active paper logs"
    )
    story.append(Paragraph(structure_text.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))
    story.append(PageBreak())

    # ================= PAGE 5: ARCHITECTURAL LOGIC =================
    story.append(Paragraph("4. Architectural Logic & State Flow", h1_style))
    story.append(Paragraph(
        "ResearchGraph AI behaves as an integrated ecosystem where user actions in one panel propagate state changes "
        "across other views immediately. The architecture can be summarized using the following operational blocks:",
        body_style
    ))

    # Architecture block description
    story.append(Paragraph("A. The Unified State Engine (AppContext.tsx)", h2_style))
    story.append(Paragraph(
        "Instead of storing isolated state variables inside separate components, all crucial parameters "
        "live in the global <b>AppContext Provider</b>. These include:",
        body_style
    ))
    story.append(Paragraph("• <b>activePage:</b> Dictates which feature component to mount in <i>App.tsx</i>.", bullet_style))
    story.append(Paragraph("• <b>selectedPaperId:</b> The paper currently inspected inside the <i>PaperDetailsPage</i>.", bullet_style))
    story.append(Paragraph("• <b>comparePaperIds:</b> Array containing 0 to 3 paper IDs queued for side-by-side mapping.", bullet_style))
    story.append(Paragraph("• <b>savedPaperIds:</b> User-selected papers flagged for reference, stored in memory.", bullet_style))
    story.append(Paragraph("• <b>chatMessages:</b> History of prompt responses including citation references.", bullet_style))
    story.append(Paragraph("• <b>searchQuery & filters:</b> Input configurations driving matching logic on search nodes.", bullet_style))
    
    story.append(Paragraph("B. Data Access Layer & Graph Generation", h2_style))
    story.append(Paragraph(
        "The mock database (<i>mockData.ts</i>) exports 5 hand-curated core papers containing complete lists of advantages, "
        "limitations, future work, metrics, and references. It then uses a seeded pseudo-random generator to programmatically "
        "compile 105 more papers, creating a dense database of 110 publications. The file dynamically maps "
        "connections, populating citation and relatedness vectors.",
        body_style
    ))
    story.append(Paragraph(
        "The <i>generateGraphData()</i> function runs a concentric circle layout mapping node coordinates. "
        "The custom node styles render dynamically in React Flow, reacting to zoom, hover, and selection behaviors.",
        body_style
    ))

    story.append(Paragraph("C. Visualizing Flow Diagram", h2_style))
    
    # Textual Flow diagram
    flow_diagram = (
        "┌─────────────────────────────────────────────────────────────────┐\n"
        "│                      React Entry (main.tsx)                     │\n"
        "└────────────────────────────────┬────────────────────────────────┘\n"
        "                                 ▼\n"
        "┌─────────────────────────────────────────────────────────────────┐\n"
        "│              Global Context Engine (AppContext.tsx)             │\n"
        "│     - theme, activePage, searchFilters, compareList, savedList   │\n"
        "└────────────────────────────────┬────────────────────────────────┘\n"
        "                                 ▼\n"
        "┌─────────────────────────────────────────────────────────────────┐\n"
        "│                       Layout Router (App.tsx)                   │\n"
        "└───────┬────────────────────────┬────────────────────────┬───────┘\n"
        "        ▼                        ▼                        ▼\n"
        "┌───────────────┐        ┌───────────────┐        ┌───────────────┐\n"
        "│ Sidebar & Nav │        │ Features (e.g.│        │ Floating Toast│\n"
        "│ Navigation,   │        │ Graph, Chat,  │        │ Notifications │\n"
        "│ search filters│        │ Lit Review)   │        │               │\n"
        "└───────────────┘        └───────────────┘        └───────────────┘"
    )
    story.append(Paragraph(flow_diagram.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))
    story.append(PageBreak())

    # ================= PAGE 6: TECHNICAL STACK & COMPARATIVE LITERATURE =================
    story.append(Paragraph("5. Technology Stack & Packages", h1_style))
    
    tech_data = [
        ["Technology", "Version", "Role in Project", "Primary Value"],
        ["React", "19.2.8", "Core View Engine", "State-driven declarative rendering and component composition."],
        ["TypeScript", "~6.0.2", "Static Type Safety", "Strict type verification of papers, authors, and context parameters."],
        ["Vite", "^8.2.0", "Module Bundler", "Extremely fast HMR (Hot Module Replacement) and optimized build steps."],
        ["TailwindCSS", "^3.4.1", "Visual CSS System", "Consistent color systems, dark/light utility classes, glassmorphic UI."],
        ["@xyflow/react", "^12.11.2", "Graph Visualization", "Render nodes and edges inside React Flow with zoom and pan."],
        ["Recharts", "^3.10.1", "Data Analytics Charts", "Renders SVG layouts of paper publishing trends and topic metrics."],
        ["Framer Motion", "^12.43.0", "Micro-Animations", "Handles transitions, page fading, and smooth hover state behaviors."],
        ["Oxlint", "^1.75.0", "Fast Linter Engine", "Performs rapid, memory-safe static analysis to catch syntax issues."]
    ]
    tech_table = Table(tech_data, colWidths=[90, 50, 140, 224])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#1e1b4b")),
        ('TEXTCOLOR', (0,0), (-1,0), HexColor("#ffffff")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9.5),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8.5),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ('TOPPADDING', (0,1), (-1,-1), 5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("6. Comparative Literature Analysis (Why It's Better)", h1_style))
    story.append(Paragraph(
        "To evaluate why ResearchGraph AI is a superior layout for academic researchers, we compare it against traditional "
        "search systems and single-feature academic tools across key design dimensions:",
        body_style
    ))

    comp_data = [
        ["Dimension", "Google Scholar", "Connected Papers", "ResearchGraph AI (Ours)"],
        ["Layout System", "Linear list matching text queries.", "Node map showing paper similarity.", "Concentric graph linking papers, models, datasets & methods."],
        ["Relationship Types", "Only lists total citation count.", "Only shows document distance similarity.", "Explicit links: CITES, WRITTEN_BY, TESTED_ON, USES, IMPROVES."],
        ["AI Assistance", "None.", "None.", "Conversational assistant with inline citations and table generators."],
        ["Side-by-Side Comparison", "Manual (opening multiple tabs).", "None (must select individually).", "Dynamic multi-paper comparison matrix (up to 3 papers)."],
        ["Gap Analysis", "None.", "None.", "Automated analysis isolating methodologies, gaps, and future paths."]
    ]
    comp_table = Table(comp_data, colWidths=[80, 110, 130, 184])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), HexColor("#4338ca")),
        ('TEXTCOLOR', (0,0), (-1,0), HexColor("#ffffff")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, HexColor("#cbd5e1")),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ('TOPPADDING', (0,1), (-1,-1), 5),
    ]))
    story.append(comp_table)
    story.append(PageBreak())

    # ================= PAGE 7: ADVANTAGES & LIMITATIONS =================
    story.append(Paragraph("7. Advantages & Structural Limitations", h1_style))
    
    story.append(Paragraph("Project Advantages", h2_style))
    story.append(Paragraph(
        "<b>1. Reduction in Cognitive Load:</b> By consolidating graphs, chat, reviews, and charts into a single workspace, "
        "researchers do not have to switch between search engines, pdf readers, and spreadsheets.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. Multi-Dimensional Categorization:</b> Connections aren't restricted to citations. Visualizing "
        "which paper introduced a dataset or improved a model provides deep architectural context instantly.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. High-Fidelity UI/UX:</b> Features smooth dark mode, custom radial animations, search filtering badges, and "
        "instant interactive states which make literature tracking highly engaging.",
        body_style
    ))
    story.append(Paragraph(
        "<b>4. Structured Syntheses:</b> The comparison matrix and review gaps summarize core metrics immediately, "
        "speeding up writing academic introductions and thesis reviews.",
        body_style
    ))

    story.append(Paragraph("Project Limitations & Constraints", h2_style))
    story.append(Paragraph(
        "While ResearchGraph AI offers a substantial leap forward, it has several structural limitations that must be "
        "addressed in subsequent production iterations:",
        body_style
    ))
    
    story.append(Paragraph(
        "<b>• Graph Visualization Scalability:</b> Rendering force-directed graphs containing thousands of nodes "
        "causes visual clutter and slows rendering. The current implementation addresses this by rendering a sample "
        "concentric web of ~32 papers. Expanding this to support infinite scroll or clustered nodes is necessary for large fields.",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Mock Data Constraints:</b> All queries, search results, and chat messages run on simulated mock data. "
        "There is no live server-side connection to active search engines (like Semantic Scholar API) or live large language "
        "models (like Gemini Flash API) to query real-time papers.",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Client-Side Memory Persistence:</b> State parameters like saved paper queues, compare lists, and chat history "
        "are kept in local state memory. Reloading the browser clears these lists, as no database persistence (like SQLite, "
        "PostgreSQL, or local storage syncing) is currently set up.",
        body_style
    ))

    # Warning alert box for limitations
    story.append(Paragraph(
        "<b>Warning:</b> Due to the client-side execution, do not upload heavy custom data collections directly. "
        "The system memory limits may trigger performance bottlenecks in browser layout threads if node sizes exceed 500.",
        callout_style
    ))
    story.append(PageBreak())

    # ================= PAGE 8: EXISTING WORK & FUTURE PATHWAYS =================
    story.append(Paragraph("8. Existing Academic Implementations & Future Work", h1_style))
    story.append(Paragraph(
        "ResearchGraph AI builds upon a rich history of citation analysis and visualization tools in "
        "academia. Below are several prominent existing systems that share this space, and how our work "
        "draws inspiration from or enhances their foundations:",
        body_style
    ))

    story.append(Paragraph(
        "<b>1. Connected Papers:</b> Uses visual similarity graphs to show related documents. However, it does not display "
        "explicit relation types (e.g. USES method, TESTED_ON dataset) and lacks integrated AI assistance.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. ResearchRabbit:</b> Often described as the 'Spotify of research'. It excels at discovery but lacks "
        "a tabular side-by-side comparison builder and an automated gap/literature reviewer tool.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. Litmaps:</b> Visualizes citation timelines over time, showing how ideas evolved. It provides excellent history, "
        "but lacks conversational querying and inline reference citations.",
        body_style
    ))

    story.append(Paragraph("Future Pathways & Extensions (A to Z Roadmap)", h2_style))
    story.append(Paragraph(
        "To transition this mock layout into an industry-grade commercial workspace, the following changes "
        "are planned for the roadmap:",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Real LLM Integration:</b> Bind the Chat Assistant to a live LLM API. The assistant would call "
        "agentic tools to query database vectors, search new papers online, and summarize papers on the fly.",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Academic Search API Sync:</b> Integrate with the Semantic Scholar API, CrossRef, and arXiv APIs. This "
        "will allow the search input to query the complete corpus of academic literature (~200 million papers) instead of the 110 mock records.",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Vector Embeddings & RAG:</b> Implement a Retrieval-Augmented Generation (RAG) backend. The backend would store "
        "PDF vector embeddings in a vector database (e.g. Pinecone) to let researchers ask questions directly to a paper's full text.",
        body_style
    ))
    story.append(Paragraph(
        "<b>• Database Persistence & Accounts:</b> Implement user authentication (Firebase Auth/Clerk) and database storage "
        "(PostgreSQL) to sync saved paper workspaces, custom comparative tables, and literature review drafts across devices.",
        body_style
    ))
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("<i>End of Technical Reference Document.</i>", body_style))

    # Build the document using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generation complete: ResearchGraph_AI_Documentation.pdf")

if __name__ == "__main__":
    build_pdf()
