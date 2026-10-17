import type { Paper } from '../types';

interface OpenAlexWork {
  id: string;
  title?: string | null;
  authorships?: Array<{ author?: { display_name?: string | null } }>;
  publication_year?: number | null;
  cited_by_count?: number | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  doi?: string | null;
  primary_location?: {
    landing_page_url?: string | null;
    pdf_url?: string | null;
    source?: { display_name?: string | null } | null;
  } | null;
  best_oa_location?: { pdf_url?: string | null } | null;
  open_access?: { is_oa?: boolean | null; oa_url?: string | null } | null;
}

export interface PaperSearchOptions {
  year?: number;
  openAccessOnly?: boolean;
  sort?: 'relevance' | 'newest' | 'citations';
  page?: number;
}

export interface PaperSearchResult {
  papers: Paper[];
  totalCount?: number;
}

const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface IngestionStatus {
  paper_id: string;
  canonical_paper_id?: string;
  status: 'discovered' | 'metadata_available' | 'downloading' | 'extracting' | 'indexing' | 'ready' | 'abstract_only' | 'failed';
  stage?: string;
  message?: string;
  error?: string;
  chunk_count?: number;
  vector_ready?: boolean;
  graph_ready?: boolean;
  updated_at?: string;
}

export interface RagCitation {
  index: number;
  paper_id: string;
  title: string;
  doi?: string | null;
  url?: string | null;
  page?: number | null;
  section?: string | null;
  chunk_id: string;
  supporting_passage: string;
}

export interface RagResponse {
  answer: string;
  answer_type: 'grounded_generation' | 'retrieval_only' | 'insufficient_context';
  citations: RagCitation[];
  graph_evidence: Array<{ paper_id?: string; paper_title?: string; relation?: string; entity?: string; entity_type?: string; evidence?: string; page?: number }>;
}

export interface ResearchGraph {
  paper_id: string;
  indexed: boolean;
  nodes: Array<{ id: string; label: string; type: string; paperId?: string; sourceUrl?: string }>;
  edges: Array<{ id: string; source: string; target: string; relation: string; evidence?: string; page?: number }>;
}

const backendRequest = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  if (!backendBaseUrl) throw new Error('Research backend is not configured. Set VITE_API_BASE_URL to your FastAPI service URL.');
  let response: Response;
  try {
    response = await fetch(`${backendBaseUrl}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    });
  } catch {
    throw new Error('Research backend is unavailable. Set VITE_API_BASE_URL to the deployed FastAPI service.');
  }
  const data = await response.json().catch(() => ({})) as { detail?: string };
  if (!response.ok) throw new Error(data.detail || `Research request failed (${response.status}).`);
  return data as T;
};

export const ingestPaper = (paperId: string) => backendRequest<IngestionStatus>('/api/papers/ingest', {
  method: 'POST', body: JSON.stringify({ paper_id: paperId }),
});

export const getPaperIngestionStatus = (paperId: string) => backendRequest<IngestionStatus>(`/api/paper-status?paper_id=${encodeURIComponent(paperId)}`);

export const getPaperDetails = async (paperId: string): Promise<Paper> => {
  const data = await backendRequest<{ id: string; title: string; authors: Array<string | { name: string }>; abstract?: string; year?: number; doi?: string; venue?: string; source?: string; source_url?: string; pdf_url?: string; open_access?: boolean }>(`/api/paper?id=${encodeURIComponent(paperId)}`);
  return {
    id: data.id,
    title: data.title,
    authors: data.authors.map(author => typeof author === 'string' ? author : author.name),
    year: data.year || 0,
    citations: 0,
    citationCountAvailable: false,
    abstract: data.abstract || 'Abstract not available.',
    venue: data.venue,
    doi: data.doi,
    source: data.source,
    url: data.source_url,
    pdfUrl: data.pdf_url,
    openAccess: data.open_access,
  };
};

export const askResearchQuestion = (question: string, paperIds: string[], signal?: AbortSignal) => backendRequest<RagResponse>('/api/rag/query', {
  method: 'POST', body: JSON.stringify({ question, paper_ids: paperIds }), signal,
});

export const getPaperGraph = (paperId: string) => backendRequest<ResearchGraph>(`/api/graph/paper?paper_id=${encodeURIComponent(paperId)}`);
export const getResearchGraph = () => backendRequest<ResearchGraph>('/api/graph');

export const searchGraph = (query: string) => backendRequest<{ results: ResearchGraph['nodes'] }>(`/api/graph/search?q=${encodeURIComponent(query)}`);

const restoreAbstract = (invertedIndex?: Record<string, number[]> | null) => {
  if (!invertedIndex) return 'Abstract not available.';

  const entries = Object.entries(invertedIndex).flatMap(([word, positions]) =>
    positions.map(position => [position, word] as const)
  );
  if (entries.length === 0) return 'Abstract not available.';

  const words: string[] = [];
  for (const [position, word] of entries) words[position] = word;
  return words.filter(Boolean).join(' ') || 'Abstract not available.';
};

const academicUrl = (value?: string | null) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

const toPaper = (work: OpenAlexWork): Paper => {
  const doi = work.doi?.replace(/^https?:\/\/doi\.org\//i, '');
  const url = academicUrl(work.primary_location?.landing_page_url) || academicUrl(work.id);
  const pdfUrl = academicUrl(work.primary_location?.pdf_url)
    || academicUrl(work.best_oa_location?.pdf_url)
    || academicUrl(work.open_access?.oa_url);

  return {
    id: work.id,
    title: work.title || 'Untitled paper',
    authors: (work.authorships || [])
      .map(authorship => authorship.author?.display_name)
      .filter((author): author is string => Boolean(author)),
    year: work.publication_year || 0,
    citations: work.cited_by_count ?? 0,
    abstract: restoreAbstract(work.abstract_inverted_index),
    venue: work.primary_location?.source?.display_name || undefined,
    doi,
    url,
    pdfUrl,
    source: 'OpenAlex',
    openAccess: Boolean(work.open_access?.is_oa),
    citationCountAvailable: work.cited_by_count !== null && work.cited_by_count !== undefined,
    bibtex: undefined,
  };
};

export const searchPapers = async (query: string, options: PaperSearchOptions = {}, signal?: AbortSignal): Promise<PaperSearchResult> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return { papers: [], totalCount: 0 };

  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search', trimmedQuery);
  url.searchParams.set('per-page', '25');
  url.searchParams.set('page', String(Math.max(1, options.page || 1)));
  const sort = options.sort === 'newest'
    ? 'publication_date:desc'
    : options.sort === 'citations'
      ? 'cited_by_count:desc'
      : 'relevance_score:desc';
  url.searchParams.set('sort', sort);
  const filters: string[] = [];
  if (options.year) filters.push(`publication_year:${options.year}`);
  if (options.openAccessOnly) filters.push('open_access.is_oa:true');
  if (filters.length) url.searchParams.set('filter', filters.join(','));
  url.searchParams.set('select', 'id,title,authorships,publication_year,cited_by_count,abstract_inverted_index,doi,primary_location,best_oa_location,open_access');

  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Paper search failed (${response.status}). Please try again.`);
  }

  const data = await response.json() as { meta?: { count?: number }; results?: OpenAlexWork[] };
  return { papers: (data.results || []).map(toPaper), totalCount: data.meta?.count };
};
