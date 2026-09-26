import type { Paper } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// In case the backend isn't running, we provide a direct fallback for OpenAlex
// as it does not require an API key and supports CORS natively.
const OPENALEX_DIRECT_URL = 'https://api.openalex.org/works';

export const searchPapers = async (query: string): Promise<Paper[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Backend failed');
    const data = await response.json();
    return data.papers;
  } catch (error) {
    console.warn("Backend unavailable, falling back to direct OpenAlex API", error);
    try {
      const response = await fetch(`${OPENALEX_DIRECT_URL}?search=${encodeURIComponent(query)}&per-page=15&sort=cited_by_count:desc`);
      if (!response.ok) throw new Error('OpenAlex API failed');
      const data = await response.json();
      
      return data.results.map((work: any) => {
        const authors = work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean) || [];
        
        let abstract = "Abstract not available.";
        if (work.abstract_inverted_index) {
          const words = Math.max(...Object.values(work.abstract_inverted_index).map((positions: any) => Math.max(...positions))) + 1;
          const abstract_arr = new Array(words).fill("");
          Object.entries(work.abstract_inverted_index).forEach(([word, positions]: [string, any]) => {
            positions.forEach((pos: number) => {
              abstract_arr[pos] = word;
            });
          });
          abstract = abstract_arr.join(" ");
        }

        return {
          id: work.id,
          title: work.title || 'Untitled',
          authors,
          abstract,
          year: work.publication_year || new Date().getFullYear(),
          doi: work.doi || '',
          source: 'OpenAlex',
          openAccess: work.open_access?.is_oa || false,
          pdfUrl: work.open_access?.oa_url,
          citations: work.cited_by_count || 0,
          dataset: '',
          method: '',
          model: '',
          topics: work.concepts?.slice(0, 5).map((c: any) => c.display_name) || [],
          publication: work.primary_location?.source?.display_name || 'Preprint'
        } as Paper;
      });
    } catch (fallbackError) {
      console.error("Direct fallback failed", fallbackError);
      return [];
    }
  }
};

export const getPaperDetails = async (id: string): Promise<Paper | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/papers/${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('Backend failed');
        return await response.json();
    } catch (error) {
        console.warn("Backend unavailable, falling back to direct OpenAlex API for details");
        try {
            const url = id.startsWith('https://') ? id : `${OPENALEX_DIRECT_URL}/${id}`;
            const response = await fetch(url);
            if (!response.ok) return null;
            const work = await response.json();
            
            const authors = work.authorships?.map((a: any) => a.author?.display_name).filter(Boolean) || [];
            
            let abstract = "Abstract not available.";
            if (work.abstract_inverted_index) {
              const words = Math.max(...Object.values(work.abstract_inverted_index).map((positions: any) => Math.max(...positions))) + 1;
              const abstract_arr = new Array(words).fill("");
              Object.entries(work.abstract_inverted_index).forEach(([word, positions]: [string, any]) => {
                positions.forEach((pos: number) => {
                  abstract_arr[pos] = word;
                });
              });
              abstract = abstract_arr.join(" ");
            }

            return {
              id: work.id,
              title: work.title || 'Untitled',
              authors,
              abstract,
              year: work.publication_year || new Date().getFullYear(),
              doi: work.doi || '',
              source: 'OpenAlex',
              openAccess: work.open_access?.is_oa || false,
              pdfUrl: work.open_access?.oa_url,
              citations: work.cited_by_count || 0,
              dataset: '',
              method: '',
              model: '',
              topics: work.concepts?.slice(0, 5).map((c: any) => c.display_name) || [],
              publication: work.primary_location?.source?.display_name || 'Preprint'
            } as Paper;
        } catch (e) {
            return null;
        }
    }
};

// ... other API endpoints ...
