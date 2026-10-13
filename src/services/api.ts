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
  open_access?: { oa_url?: string | null } | null;
}

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

const toPaper = (work: OpenAlexWork): Paper => {
  const doi = work.doi?.replace(/^https?:\/\/doi\.org\//i, '');
  const url = work.primary_location?.landing_page_url || work.id;

  return {
    id: work.id,
    title: work.title || 'Untitled paper',
    authors: (work.authorships || [])
      .map(authorship => authorship.author?.display_name)
      .filter((author): author is string => Boolean(author)),
    year: work.publication_year || 0,
    citations: work.cited_by_count || 0,
    abstract: restoreAbstract(work.abstract_inverted_index),
    venue: work.primary_location?.source?.display_name || 'Unknown venue',
    doi,
    url,
    pdfUrl: work.primary_location?.pdf_url || work.best_oa_location?.pdf_url || work.open_access?.oa_url || undefined,
    bibtex: undefined,
  };
};

export const searchPapers = async (query: string, signal?: AbortSignal): Promise<Paper[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('search', trimmedQuery);
  url.searchParams.set('per-page', '25');
  url.searchParams.set('sort', 'relevance_score:desc');
  url.searchParams.set('select', 'id,title,authorships,publication_year,cited_by_count,abstract_inverted_index,doi,primary_location,best_oa_location,open_access');

  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Paper search failed (${response.status}). Please try again.`);
  }

  const data = await response.json() as { results?: OpenAlexWork[] };
  return (data.results || []).map(toPaper);
};

