export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citations: number;
  abstract: string;
  venue?: string;
  doi?: string;
  url?: string;
  pdfUrl?: string;
  field?: string;
  tldr?: string;
  keyFindings?: string[];
  bibtex?: string;
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

export type PageType = 'dashboard' | 'search' | 'graph' | 'chat' | 'details' | 'papers' | 'saved' | 'compare' | 'literature' | 'gaps' | 'history';
