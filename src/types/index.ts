export interface Reference {
  title: string;
  authors: string;
  year: number;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  doi?: string;
  source?: string;
  openAccess?: boolean;
  pdfUrl?: string;
  landingPage?: string;
  topics?: string[];
  publication?: string;
  citationCount?: number;
  dataset?: string;
  method?: string;
  model?: string;
  accuracy?: string;
  advantages?: string[];
  limitations?: string[];
  futureWork?: string[];
  references?: Reference[];
  relatedPapers?: string[]; // Paper IDs
  citations?: string[]; // Paper IDs that cite this
  figures?: string[]; // Placeholders
  timeline?: { year: number; event: string }[];
  metrics?: {
    citationVelocity: number;
    influentialCitations: number;
  };
}

export interface Author {
  id: string;
  name: string;
  affiliation: string;
  hIndex: number;
  citations: number;
  papersCount: number;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: { id: string; index: number; title: string }[];
  papers?: Paper[];
  codeSnippet?: { language: string; code: string };
  table?: { headers: string[]; rows: string[][] };
  relatedConcepts?: string[];
}

export interface LitReview {
  id: string;
  topic: string;
  summary: string;
  papers: Paper[];
  comparisonTable: {
    headers: string[];
    rows: string[][];
  };
  gaps: { gap: string; description: string; impact: string }[];
  futureWork: string[];
  references: Reference[];
}
