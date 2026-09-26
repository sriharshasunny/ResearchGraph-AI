import { mockPapers } from '../data/mockData';
import type { Paper } from '../types';

export const searchPapers = async (query: string): Promise<Paper[]> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!query.trim()) return mockPapers;
  
  const lowerQuery = query.toLowerCase();
  return mockPapers.filter(paper => 
    paper.title.toLowerCase().includes(lowerQuery) || 
    paper.abstract.toLowerCase().includes(lowerQuery) ||
    paper.authors.some(author => author.toLowerCase().includes(lowerQuery))
  );
};
