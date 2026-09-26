import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Preformatted
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render 'Page X of Y' 
    along with running headers and footers.
    """
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
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))

        # Don't draw header on cover page (Page 1) if desired, but here we can check title flag or pageNumber
        if self._pageNumber > 1:
            # Header line and text
            self.drawString(54, 752, "ResearchGraph AI — Technical Project Report")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer line and text on all pages
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 50, 558, 50)

        self.drawString(54, 36, "ResearchGraph AI Project Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.restoreState()


def get_custom_styles():
    styles = getSampleStyleSheet()

    # Base adjustments
    styles['Normal'].textColor = colors.HexColor("#1E293B")
    styles['Normal'].fontSize = 10
    styles['Normal'].leading = 14

    # Custom styles
    doc_title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1E3A8A"),
        alignment=1, # Center
        spaceAfter=15
    )

    doc_subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        alignment=1, # Center
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#1E3A8A"),
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2563EB"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14.5,
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    diagram_style = ParagraphStyle(
        'Diagram_Text',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F8FAFC"),
        borderColor=colors.HexColor("#E2E8F0"),
        borderWidth=1,
        borderPadding=10,
        spaceBefore=8,
        spaceAfter=12
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1E3A8A"),
        backColor=colors.HexColor("#EFF6FF"),
        borderColor=colors.HexColor("#BFDBFE"),
        borderWidth=1,
        borderPadding=10,
        spaceBefore=8,
        spaceAfter=10
    )

    return {
        'DocTitle': doc_title_style,
        'DocSubtitle': doc_subtitle_style,
        'H1': h1_style,
        'H2': h2_style,
        'Body': body_style,
        'Bullet': bullet_style,
        'Diagram': diagram_style,
        'Callout': callout_style
    }


def make_table(data, col_widths=None, is_header=True):
    """Utility to construct styled reportlab tables."""
    table_data = []
    styles = get_custom_styles()

    for row_idx, row in enumerate(data):
        formatted_row = []
        for cell in row:
            if row_idx == 0 and is_header:
                p_style = ParagraphStyle(
                    'TH',
                    parent=styles['Body'],
                    fontName='Helvetica-Bold',
                    fontSize=9.5,
                    leading=12,
                    textColor=colors.white
                )
            else:
                p_style = ParagraphStyle(
                    'TD',
                    parent=styles['Body'],
                    fontName='Helvetica',
                    fontSize=9,
                    leading=12,
                    textColor=colors.HexColor("#1E293B")
                )
            formatted_row.append(Paragraph(str(cell), p_style))
        table_data.append(formatted_row)

    t = Table(table_data, colWidths=col_widths)
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
    ]
    for r in range(1, len(data)):
        if r % 2 == 0:
            t_style.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor("#F8FAFC")))
    t.setStyle(TableStyle(t_style))
    return t


# Content generators for each part

def get_abstract_and_overview_elements(st):
    elems = []
    elems.append(Paragraph("ResearchGraph AI — Abstract & System Overview", st['DocTitle']))
    elems.append(Paragraph("AI-Driven Academic Intelligence Platform integrating Vector Search, Knowledge Graphs, and LLMs", st['DocSubtitle']))
    elems.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    elems.append(Paragraph("1. Abstract", st['H1']))
    abstract_text = (
        "<b>ResearchGraph AI</b> is an advanced academic research intelligence platform designed to transform literature review, "
        "scientific exploration, and hypothesis discovery by integrating Artificial Intelligence, Vector Search, Knowledge Graphs, "
        "and Large Language Models (LLMs) into a unified <b>GraphRAG (Graph-Augmented Retrieval Generation)</b> framework.<br/><br/>"
        "Traditional scientific search tools rely primarily on keyword matching or isolated vector similarity, which fail to capture "
        "complex inter-relations among papers, authors, algorithms, datasets, and research domains. ResearchGraph AI bridges this gap "
        "by harvesting open academic data from <b>OpenAlex</b> and <b>arXiv</b>, performing deep PDF extraction using <b>PyMuPDF</b>, "
        "generating semantic vector embeddings with <b>BAAI/BGE-large-en-v1.5</b> stored in <b>ChromaDB</b>, and constructing a "
        "rich multi-relational Knowledge Graph in <b>Neo4j</b>.<br/><br/>"
        "By fusing vector similarity retrieval with structural graph reasoning through <b>FastAPI</b> and <b>LangChain</b>, the platform "
        "enables citation-grounded natural language Q&A, automated literature review generation, multi-paper benchmarking, "
        "and automated research gap discovery. The user-facing interface, built with <b>React, TypeScript, and Tailwind CSS</b>, provides "
        "interactive visual analytics and intuitive graph exploration. Experimental validation demonstrates significant reductions in "
        "literature review duration, complete elimination of ungrounded LLM hallucinations, and enhanced domain contextual synthesis."
    )
    elems.append(Paragraph(abstract_text, st['Callout']))

    elems.append(Paragraph("2. Limitations of Existing Systems", st['H1']))
    elems.append(Paragraph("Traditional literature discovery tools suffer from fundamental architectural constraints:", st['Body']))
    elems.append(Paragraph("• <b>Keyword Matching Bottlenecks:</b> Legacy academic databases (e.g., standard search portals) depend on keyword occurrences, failing to retrieve semantically relevant papers that express concepts using alternate terminology.", st['Bullet']))
    elems.append(Paragraph("• <b>Isolated Vector RAG Limitations:</b> Standard vector search engines retrieve isolated text chunks based on cosine distance. However, they lack structural awareness regarding relationships between authors, datasets, baseline models, and methodological lineage.", st['Bullet']))
    elems.append(Paragraph("• <b>Manual Synthesis Overhead:</b> Researchers spend dozens of hours manually scanning paper abstracts, extracting methodology details, and comparing benchmark results across published literature.", st['Bullet']))
    elems.append(Paragraph("• <b>Generative Hallucination Risks:</b> Standard LLM chatbots often generate plausible-sounding but unverified citations or false claims due to lack of strict grounding in authoritative knowledge graphs and document repositories.", st['Bullet']))

    elems.append(Paragraph("3. Advantages & Limitations Matrix", st['H1']))
    matrix_data = [
        ["System Architecture", "Key Advantages", "Critical Limitations"],
        [
            "Traditional Keyword Search\n(Google Scholar, Scopus)",
            "• Rapid keyword lookup\n• Established citation counts",
            "• Misses semantic intent\n• No automated synthesis\n• Manual relational linkage"
        ],
        [
            "Standard Vector RAG\n(Dense Embedding Search)",
            "• Captures semantic similarity\n• Handles natural language",
            "• Lacks graph relational reasoning\n• Chunk fragmentation\n• Ignores entity hierarchies"
        ],
        [
            "Proposed ResearchGraph AI\n(Hybrid GraphRAG)",
            "• Unified Semantic & Graph Search\n• Verifiable citation answers\n• Automated Literature Review\n• Research Gap Identification",
            "• Higher setup complexity\n• Requires dual-database indexing (ChromaDB + Neo4j)"
        ]
    ]
    elems.append(make_table(matrix_data, col_widths=[130, 180, 194]))
    elems.append(Spacer(1, 12))

    elems.append(Paragraph("4. How ResearchGraph AI Overcomes Existing Limitations", st['H1']))
    elems.append(Paragraph("• <b>Hybrid GraphRAG Architecture:</b> Combines dense vector search (ChromaDB) with structured multi-hop graph querying (Neo4j) to supply LLMs with rich entity context and precise document chunks.", st['Bullet']))
    elems.append(Paragraph("• <b>Verifiable Citation Grounding:</b> Enforces strict citation referencing using paper DOIs and metadata, guaranteeing zero-hallucination responses.", st['Bullet']))
    elems.append(Paragraph("• <b>Automated Multi-Paper Comparison:</b> Automatically extracts datasets, algorithms, performance metrics, advantages, and limitations into structured comparison tables.", st['Bullet']))
    elems.append(Paragraph("• <b>Automated Research Gap Identification:</b> Analyzes graph connectivity and paper limitations to highlight unaddressed research questions and emerging directions.", st['Bullet']))

    return elems


def get_chapter4_elements(st):
    elems = []
    elems.append(Paragraph("CHAPTER 4: SYSTEM REQUIREMENTS", st['DocTitle']))
    elems.append(Paragraph("Functional, Non-Functional, Hardware, Software Specifications & Use Cases", st['DocSubtitle']))
    elems.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    elems.append(Paragraph("4.1 Introduction", st['H1']))
    elems.append(Paragraph(
        "System requirements define the hardware, software, functional, and non-functional specifications required for the successful "
        "implementation of the proposed system. These requirements ensure that the platform performs efficiently, remains scalable, "
        "and provides a seamless experience to researchers and students. ResearchGraph AI is designed as a web-based application "
        "capable of integrating Artificial Intelligence, Knowledge Graphs, Vector Databases, and Large Language Models into a unified academic research platform.",
        st['Body']
    ))

    elems.append(Paragraph("4.2 Functional Requirements", st['H1']))
    fr_list = [
        ("FR1: User Search", "The system shall allow users to search research papers using natural language queries and support semantic search instead of simple keyword matching."),
        ("FR2: Research Paper Retrieval", "The system shall retrieve research papers from academic repositories such as OpenAlex and arXiv and display paper metadata including title, authors, publication year, journal, abstract, and DOI."),
        ("FR3: Semantic Search", "The system shall convert user queries into vector embeddings and retrieve the most semantically relevant paper chunks from the vector database."),
        ("FR4: Knowledge Graph Generation", "The system shall identify entities such as papers, authors, datasets, methods, and algorithms, automatically establish semantic relationships among these entities, and store them in Neo4j."),
        ("FR5: AI Chat Assistant", "The system shall answer research-related questions using an LLM, generate citation-supported responses, and summarize research papers."),
        ("FR6: Literature Review Generation", "The system shall automatically generate literature reviews from selected research papers, summarizing methodologies, datasets, advantages, and limitations."),
        ("FR7: Paper Comparison", "The system shall compare multiple research papers based on Dataset, Methodology, Algorithms, Accuracy, Advantages, and Limitations."),
        ("FR8: Research Gap Identification", "The system shall identify unexplored research areas by analyzing trends and limitations across multiple papers."),
        ("FR9: Knowledge Graph Visualization", "The system shall display relationships among papers, authors, datasets, and models using an interactive graph."),
        ("FR10: User Profile", "The system shall allow users to save papers, maintain search history, and store generated literature reviews.")
    ]
    for code, desc in fr_list:
        elems.append(Paragraph(f"• <b>{code}:</b> {desc}", st['Bullet']))

    elems.append(Spacer(1, 8))
    elems.append(Paragraph("4.3 Non-Functional Requirements", st['H1']))
    nfr_data = [
        ["Attribute", "Specification & Requirement"],
        ["Performance", "Search results retrieved within seconds; graph rendering loads efficiently; AI response generation latency minimized."],
        ["Scalability", "Architecture supports continuous indexing of newly published papers and seamless expansion of Neo4j Knowledge Graph."],
        ["Reliability", "Provides highly accurate retrieval, consistent paper metadata, and 100% verifiable citations."],
        ["Availability", "Accessible through modern web browsers with high backend service uptime."],
        ["Security", "User authentication protects personal workspaces; secure HTTPS connections for API endpoints; confidential user data."],
        ["Usability", "Intuitive UI requiring no specialized technical skills; simple module navigation."],
        ["Maintainability", "Modular architecture facilitating modular model upgrades and new academic API data source additions."],
        ["Portability", "Cross-platform compatibility (Windows, Linux, macOS) via web browser; deployable on cloud platforms."]
    ]
    elems.append(make_table(nfr_data, col_widths=[120, 384]))

    elems.append(Spacer(1, 10))
    elems.append(Paragraph("4.4 Hardware Requirements", st['H1']))
    hw_dev = [
        ["Component", "Development Specification", "Production Server Specification"],
        ["Processor / CPU", "Intel Core i5 (or equivalent)", "Multi-core Cloud Server (8+ vCPU)"],
        ["RAM", "Minimum 8 GB (16 GB Recommended)", "16 GB RAM or Higher"],
        ["Storage", "20 GB Free Disk Space", "High-Speed SSD Storage"],
        ["Network", "Stable Broadband Connection", "High-Speed Internet Line"]
    ]
    elems.append(make_table(hw_dev, col_widths=[120, 190, 194]))

    elems.append(Spacer(1, 10))
    elems.append(Paragraph("4.5 Software Requirements", st['H1']))
    sw_data = [
        ["Software Tool / Tech", "Purpose in System"],
        ["Operating System", "Windows 10/11, Linux (Ubuntu/Debian)"],
        ["Programming Languages", "Python 3.10+, TypeScript"],
        ["Frontend Framework", "React + Tailwind CSS"],
        ["Backend Framework", "FastAPI"],
        ["Vector Database", "ChromaDB"],
        ["Graph Database", "Neo4j (Neo4j Aura / Local Enterprise)"],
        ["Relational Database", "PostgreSQL"],
        ["AI Orchestration", "LangChain"],
        ["PDF Processing", "PyMuPDF (Fitz)"],
        ["Embedding Model", "BAAI/BGE-large-en-v1.5 / E5"],
        ["Large Language Model", "Gemini / Llama 3"],
        ["IDE & Version Control", "Visual Studio Code, Git & GitHub"]
    ]
    elems.append(make_table(sw_data, col_widths=[160, 344]))

    elems.append(Spacer(1, 10))
    elems.append(Paragraph("4.6 Actors & 4.7 Use Cases", st['H1']))
    elems.append(Paragraph("• <b>Researcher:</b> Primary user who executes semantic searches, compares papers, generates literature reviews, views knowledge graphs, and chats with the AI assistant.", st['Bullet']))
    elems.append(Paragraph("• <b>Administrator:</b> System administrator responsible for database maintenance, repository indexing pipelines, monitoring performance, and managing system configurations.", st['Bullet']))

    elems.append(Paragraph("4.8 Use Case Diagram (Text Representation)", st['H2']))
    uc_ascii = (
        "                    +----------------+\n"
        "                    |   Researcher   |\n"
        "                    +----------------+\n"
        "                           |\n"
        "      ---------------------------------------------\n"
        "      |       |        |        |        |        |\n"
        "      ▼       ▼        ▼        ▼        ▼        ▼\n"
        " Search   Compare   AI Chat   Literature  Graph  Save\n"
        " Papers    Papers              Review     View   Papers\n\n"
        "                    +----------------+\n"
        "                    | Administrator  |\n"
        "                    +----------------+\n"
        "                           |\n"
        "      ------------------------------------------\n"
        "      |                |                        |\n"
        "      ▼                ▼                        ▼\n"
        " Update Papers   Manage Database        Monitor System"
    )
    elems.append(Preformatted(uc_ascii, st['Diagram']))

    return elems


def get_chapter5_elements(st):
    elems = []
    elems.append(Paragraph("CHAPTER 5: SYSTEM DESIGN", st['DocTitle']))
    elems.append(Paragraph("System Architecture, Data Flow Diagrams, UML & Component Specifications", st['DocSubtitle']))
    elems.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    elems.append(Paragraph("5.1 Introduction", st['H1']))
    elems.append(Paragraph(
        "System design is a crucial stage in software development that defines the architecture, components, data flow, "
        "and interactions within the proposed system. A well-designed architecture improves scalability, maintainability, "
        "and performance while simplifying future enhancements.<br/><br/>"
        "The proposed ResearchGraph AI platform follows a modular architecture that separates data collection, document processing, "
        "knowledge extraction, semantic retrieval, and response generation into independent components.",
        st['Body']
    ))

    elems.append(Paragraph("5.2 Overall System Architecture", st['H1']))
    arch_ascii = (
        "                         User\n"
        "                           │\n"
        "                           ▼\n"
        "                Web Application (React)\n"
        "                           │\n"
        "                           ▼\n"
        "                 FastAPI Backend Server\n"
        "                           │\n"
        "      ┌────────────────────┼───────────────────┐\n"
        "      │                    │                   │\n"
        "      ▼                    ▼                   ▼\n"
        " Paper Collection     Vector Database      Knowledge Graph\n"
        "(OpenAlex/arXiv)      (ChromaDB)           (Neo4j)\n"
        "      │                    │                   │\n"
        "      ▼                    ▼                   ▼\n"
        " PDF Processing      Semantic Search      Graph Traversal\n"
        "      │                    │                   │\n"
        "      └────────────────────┼───────────────────┘\n"
        "                           ▼\n"
        "                  Large Language Model\n"
        "                           │\n"
        "                           ▼\n"
        "                  Citation-backed Response"
    )
    elems.append(Preformatted(arch_ascii, st['Diagram']))

    elems.append(Paragraph("5.3 Architectural Description", st['H1']))
    elems.append(Paragraph("• <b>Presentation Layer:</b> Web interface built with React, TypeScript, and Tailwind CSS. Provides dashboards for Search, AI Chat, Literature Review, Comparison, and Graph Visualization.", st['Bullet']))
    elems.append(Paragraph("• <b>Application Layer:</b> FastAPI backend controller managing business logic, routing, AI model integration, and DB queries asynchronously.", st['Bullet']))
    elems.append(Paragraph("• <b>Data Collection Layer:</b> Ingests metadata and PDFs from OpenAlex and arXiv APIs.", st['Bullet']))
    elems.append(Paragraph("• <b>Document Processing Layer:</b> Parses PDFs using PyMuPDF and splits text into context-preserving chunks using LangChain.", st['Bullet']))
    elems.append(Paragraph("• <b>Semantic Retrieval Layer:</b> BAAI/BGE-large-en-v1.5 embeddings indexed in ChromaDB for dense vector similarity search.", st['Bullet']))
    elems.append(Paragraph("• <b>Knowledge Graph Layer:</b> Neo4j property graph mapping papers, authors, datasets, methods, and algorithms with rich relationships.", st['Bullet']))
    elems.append(Paragraph("• <b>AI Response Generation Layer:</b> LangChain combines vector chunks and graph contexts to feed the LLM for citation-backed output.", st['Bullet']))

    elems.append(Paragraph("5.4 Data Flow Diagram (Level 0)", st['H1']))
    dfd0_ascii = (
        "           +------------------+\n"
        "           |      User        |\n"
        "           +--------+---------+\n"
        "                    |\n"
        "                    v\n"
        "        +-----------------------+\n"
        "        |  ResearchGraph AI     |\n"
        "        +-----------------------+\n"
        "          |         |        |\n"
        "          |         |        |\n"
        "          ▼         ▼        ▼\n"
        " Vector DB     Neo4j Graph   LLM\n"
        "          |         |        |\n"
        "          +---------+--------+\n"
        "                    |\n"
        "                    ▼\n"
        "              Final Response"
    )
    elems.append(Preformatted(dfd0_ascii, st['Diagram']))

    elems.append(Paragraph("5.5 Data Flow Diagram (Level 1)", st['H1']))
    dfd1_ascii = (
        "User\n"
        " │\n"
        " ▼\n"
        "Search Query\n"
        " │\n"
        " ▼\n"
        "FastAPI Backend\n"
        " │\n"
        " ├───────────────► Convert Query into Embedding\n"
        " │\n"
        " ▼\n"
        "Vector Search (ChromaDB)\n"
        " │\n"
        " ▼\n"
        "Relevant Research Chunks\n"
        " │\n"
        " ▼\n"
        "Extract Query Entities\n"
        " │\n"
        " ▼\n"
        "Neo4j Graph Search\n"
        " │\n"
        " ▼\n"
        "Graph Relationships\n"
        " │\n"
        " ▼\n"
        "Merge Retrieved Information\n"
        " │\n"
        " ▼\n"
        "Large Language Model (Gemini / Llama 3)\n"
        " │\n"
        " ▼\n"
        "Citation-supported Response\n"
        " │\n"
        " ▼\n"
        "User Interface Display"
    )
    elems.append(Preformatted(dfd1_ascii, st['Diagram']))

    elems.append(Paragraph("5.6 Class Diagram", st['H1']))
    class_ascii = (
        "+----------------+\n"
        "| User           |\n"
        "+----------------+\n"
        "| userId         |\n"
        "| name           |\n"
        "| email          |\n"
        "+----------------+\n"
        "        |\n"
        "        ▼\n"
        "+----------------+\n"
        "| ResearchPaper  |\n"
        "+----------------+\n"
        "| paperId        |\n"
        "| title          |\n"
        "| abstract       |\n"
        "| year           |\n"
        "| doi            |\n"
        "+----------------+\n"
        "        |\n"
        "        ▼\n"
        "+----------------+\n"
        "| Embedding      |\n"
        "+----------------+\n"
        "| vector         |\n"
        "| chunkId        |\n"
        "+----------------+\n"
        "        |\n"
        "        ▼\n"
        "+----------------+\n"
        "| KnowledgeGraph |\n"
        "+----------------+\n"
        "| nodeId         |\n"
        "| relation       |\n"
        "+----------------+\n"
        "        |\n"
        "        ▼\n"
        "+----------------+\n"
        "| AI Assistant   |\n"
        "+----------------+\n"
        "| generateReply()|\n"
        "+----------------+"
    )
    elems.append(Preformatted(class_ascii, st['Diagram']))

    elems.append(Paragraph("5.7 Sequence Diagram & Activity Flow", st['H1']))
    seq_ascii = (
        "User ──► Frontend ──► FastAPI Backend\n"
        "                         │\n"
        "                         ├─► Query ChromaDB (Vector Search)\n"
        "                         │       └──► Return Top Chunks\n"
        "                         │\n"
        "                         ├─► Query Neo4j (Graph Reasoning)\n"
        "                         │       └──► Return Entities & Relations\n"
        "                         │\n"
        "                         └─► Synthesize Context to LLM\n"
        "                                 └──► Return Citation Response ──► User"
    )
    elems.append(Preformatted(seq_ascii, st['Diagram']))

    elems.append(Paragraph("5.8 Component & Deployment Diagrams", st['H1']))
    dep_ascii = (
        " User Browser  ──►  React Frontend (Vercel)\n"
        "                           │\n"
        "                           ▼\n"
        "                    FastAPI Server (Render / Cloud)\n"
        "                           │\n"
        "     ┌─────────────────────┼─────────────────────┐\n"
        "     ▼                     ▼                     ▼\n"
        " ChromaDB Vector DB    Neo4j Aura Graph     PostgreSQL DB\n"
        "     │\n"
        "     ▼\n"
        " Gemini / OpenAI API"
    )
    elems.append(Preformatted(dep_ascii, st['Diagram']))

    elems.append(Paragraph("5.9 Design Advantages", st['H1']))
    elems.append(Paragraph("• <b>Modular Architecture:</b> Allows independent updates to frontend components, databases, and AI models without breaking system integrity.", st['Bullet']))
    elems.append(Paragraph("• <b>Explainable GraphRAG:</b> Combines semantic vector similarity with explicit graph relationships for verifiable AI reasoning.", st['Bullet']))
    elems.append(Paragraph("• <b>Extensible Integration:</b> Effortlessly supports additional paper repositories (IEEE, Springer) or newer LLMs.", st['Bullet']))

    return elems


def get_chapter6_elements(st):
    elems = []
    elems.append(Paragraph("CHAPTER 6: IMPLEMENTATION & TECHNOLOGY STACK", st['DocTitle']))
    elems.append(Paragraph("Detailed Technology Justifications, Implementation Pipeline & GraphRAG Mechanics", st['DocSubtitle']))
    elems.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    elems.append(Paragraph("6.1 Introduction", st['H1']))
    elems.append(Paragraph(
        "The implementation of ResearchGraph AI follows a modular architecture where each technology is responsible "
        "for a specific functionality within the system. The frontend provides an interactive interface for researchers, "
        "while the backend manages document processing, semantic retrieval, graph operations, and communication with Large Language Models.",
        st['Body']
    ))

    elems.append(Paragraph("6.2 Technology Stack Summary", st['H1']))
    stack_data = [
        ["Layer / Module", "Selected Technology", "Role & Rationale"],
        ["Frontend UI", "React + TypeScript + Tailwind", "SPA with Virtual DOM speed, type safety, and utility-first styling."],
        ["Backend API", "FastAPI (Python)", "High-speed asynchronous Python web framework with auto OpenAPI docs."],
        ["Paper Harvesting", "OpenAlex API & arXiv API", "Access to millions of open-access research metadata and PDFs."],
        ["PDF Parser", "PyMuPDF (Fitz)", "Ultra-fast text & metadata extraction from complex double-column academic PDFs."],
        ["Text Chunking", "LangChain Recursive Text Splitter", "Splits text into 400-600 word chunks with overlapping context bounds."],
        ["Embedding Model", "BAAI/BGE-large-en-v1.5", "Top-ranking open embedding model producing 1024-dim dense vectors."],
        ["Vector Database", "ChromaDB", "Lightweight, highly performant vector store optimized for cosine similarity."],
        ["Knowledge Graph", "Neo4j Graph Database", "Industry-standard property graph database mapping nodes and relationships."],
        ["AI Framework", "LangChain Framework", "Orchestrates vector search, Cypher queries, prompt templates, and LLMs."],
        ["LLM Service", "Gemini / Llama 3", "Generates natural language summaries, comparisons, and citation answers."]
    ]
    elems.append(make_table(stack_data, col_widths=[110, 160, 234]))

    elems.append(Spacer(1, 10))
    elems.append(Paragraph("6.3 Detailed Technology Rationale", st['H1']))
    elems.append(Paragraph("• <b>Why React & TypeScript?</b> React's Virtual DOM ensures instant visual updates during graph interactions, while TypeScript enforces strict data typing between API payloads and UI components.", st['Bullet']))
    elems.append(Paragraph("• <b>Why FastAPI?</b> Built on Starlette and Pydantic, FastAPI provides standard Python async execution, vital for concurrent AI model calls, vector lookups, and graph queries.", st['Bullet']))
    elems.append(Paragraph("• <b>Why Neo4j?</b> Native property graph representation allows executing multi-hop Cypher queries (e.g., finding which datasets are used by papers citing a baseline algorithm).", st['Bullet']))
    elems.append(Paragraph("• <b>Why ChromaDB?</b> Provides high-throughput vector indexing and similarity search with zero cloud lock-in.", st['Bullet']))
    elems.append(Paragraph("• <b>Why BAAI/BGE-large-en-v1.5?</b> Outperforms standard embeddings on MTEB benchmarks for scientific domain retrieval.", st['Bullet']))

    elems.append(Paragraph("6.4 PDF Processing, Chunking & Embedding Pipeline", st['H1']))
    pipeline_ascii = (
        "OpenAlex / arXiv API  ──►  Download PDF\n"
        "                                │\n"
        "                                ▼\n"
        "                 PyMuPDF Extractor (Fitz)\n"
        "                                │\n"
        "                                ▼\n"
        "               LangChain Recursive Text Chunking\n"
        "                     (400-600 words, 50 overlap)\n"
        "                                │\n"
        "                                ▼\n"
        "               BAAI/BGE-large Embedding Generation\n"
        "                                │\n"
        "             ┌──────────────────┴──────────────────┐\n"
        "             ▼                                     ▼\n"
        "  ChromaDB Vector Store               Neo4j Knowledge Graph\n"
        "  (Dense Vector Chunks)               (Nodes & Entity Edges)"
    )
    elems.append(Preformatted(pipeline_ascii, st['Diagram']))

    elems.append(Paragraph("6.5 Knowledge Graph Node & Edge Structure", st['H1']))
    elems.append(Paragraph("• <b>Nodes:</b> Paper, Author, Methodology, Dataset, Algorithm, ResearchDomain.", st['Bullet']))
    elems.append(Paragraph("• <b>Relationships:</b> (Paper)-[:WRITTEN_BY]->(Author), (Paper)-[:USES_METHOD]->(Methodology), (Paper)-[:BENCHMARKED_ON]->(Dataset), (Paper)-[:CITES]->(Paper).", st['Bullet']))

    elems.append(Paragraph("6.6 Why GraphRAG Instead of Traditional RAG?", st['H1']))
    graphrag_text = (
        "Standard Retrieval-Augmented Generation (RAG) isolates document chunks based strictly on vector cosine similarity. "
        "While effective for localized context lookup, standard RAG fails when answering global research questions such as "
        "<i>'What are the trending datasets across all transformer papers published in 2024?'</i> or <i>'Which methods overcome the speed limitation of paper X?'</i><br/><br/>"
        "<b>ResearchGraph AI's GraphRAG Solution:</b> By executing dual-retrieval (vector search in ChromaDB + sub-graph traversal in Neo4j), "
        "the LLM receives both exact text passages and structured multi-hop relational paths. This hybrid context enables "
        "accurate literature reviews, verifiable citation generation, multi-paper comparison matrices, and automatic research gap discovery."
    )
    elems.append(Paragraph(graphrag_text, st['Callout']))

    return elems


def build_pdf_file(filename, title, elements_list):
    """Builds a single PDF using NumberedCanvas."""
    out_dir = r"C:\Users\sriha\.gemini\antigravity-ide\scratch\researchgraph_ai_docs"
    filepath = os.path.join(out_dir, filename)

    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    story = []
    st = get_custom_styles()

    for idx, elem_group in enumerate(elements_list):
        if idx > 0:
            story.append(PageBreak())
        story.extend(elem_group)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated PDF: {filepath}")
    return filepath


def main():
    st = get_custom_styles()

    print("Generating ResearchGraph AI PDF Documents...")

    # 1. Consolidated PDF (Abstract, Existing vs Proposed, Requirements, Tech Stack, Architecture, Workflow)
    build_pdf_file(
        "ResearchGraph_AI_Consolidated_Executive_Summary.pdf",
        "Executive Project Summary",
        [
            get_abstract_and_overview_elements(st),
            get_chapter4_elements(st),
            get_chapter5_elements(st),
            get_chapter6_elements(st)
        ]
    )

    # 2. Master All-in-One Report PDF
    build_pdf_file(
        "ResearchGraph_AI_Master_Project_Report.pdf",
        "Master Project Report",
        [
            get_abstract_and_overview_elements(st),
            get_chapter4_elements(st),
            get_chapter5_elements(st),
            get_chapter6_elements(st)
        ]
    )

    # 3. Separate PDF: Abstract and Overview
    build_pdf_file(
        "ResearchGraph_AI_Abstract_and_Overview.pdf",
        "Abstract & Overview",
        [get_abstract_and_overview_elements(st)]
    )

    # 4. Separate PDF: Chapter 4 System Requirements
    build_pdf_file(
        "ResearchGraph_AI_Chapter4_System_Requirements.pdf",
        "Chapter 4: System Requirements",
        [get_chapter4_elements(st)]
    )

    # 5. Separate PDF: Chapter 5 System Design
    build_pdf_file(
        "ResearchGraph_AI_Chapter5_System_Design.pdf",
        "Chapter 5: System Design",
        [get_chapter5_elements(st)]
    )

    # 6. Separate PDF: Chapter 6 Implementation & Tech Stack
    build_pdf_file(
        "ResearchGraph_AI_Chapter6_Implementation_TechStack.pdf",
        "Chapter 6: Implementation & Tech Stack",
        [get_chapter6_elements(st)]
    )

    print("All 6 PDF documents generated successfully!")

if __name__ == "__main__":
    main()
