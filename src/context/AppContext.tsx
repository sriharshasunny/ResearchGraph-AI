import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ChatMessage, LitReview, Paper } from '../types';
import { mockLiteratureReviews } from '../data/mockData';

type ActivePage =
  | 'landing'
  | 'dashboard'
  | 'search'
  | 'chat'
  | 'graph'
  | 'lit-review'
  | 'compare'
  | 'details'
  | 'analytics'
  | 'profile'
  | 'saved';

interface SearchFilters {
  authors: string[];
  years: number[];
  publications: string[];
  keywords: string[];
  datasets: string[];
  methods: string[];
  models: string[];
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  savedPaperIds: string[];
  toggleSavePaper: (id: string) => void;
  comparePaperIds: string[];
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  recentlyViewedIds: string[];
  addToRecentlyViewed: (id: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  reviews: LitReview[];
  addReview: (review: LitReview) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  clearFilters: () => void;
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  paperCache: Record<string, Paper>;
  cachePapers: (papers: Paper[]) => void;
}

const defaultFilters: SearchFilters = {
  authors: [],
  years: [],
  publications: [],
  keywords: [],
  datasets: [],
  methods: [],
  models: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>(['vit-2021', 'clip-2021']);
  const [comparePaperIds, setComparePaperIds] = useState<string[]>(['vit-2021', 'dinov2-2023']);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['vit-2021', 'clip-2021', 'dinov2-2023']);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: 'Welcome to **ResearchGraph AI**! I am your semantic research assistant. Ask me to explain a concept, compare models, generate a literature review, or explore research gaps.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [reviews, setReviews] = useState<LitReview[]>(mockLiteratureReviews);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [paperCache, setPaperCache] = useState<Record<string, Paper>>({});

  const cachePapers = (papers: Paper[]) => {
    setPaperCache(prev => {
      const next = { ...prev };
      papers.forEach(p => {
        next[p.id] = p;
      });
      return next;
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSavePaper = (id: string) => {
    setSavedPaperIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((pId) => pId !== id) : [...prev, id];
      showToast(
        exists ? 'Paper removed from saved list' : 'Paper saved to workspace',
        exists ? 'info' : 'success'
      );
      return updated;
    });
  };

  const addToCompare = (id: string) => {
    setComparePaperIds((prev) => {
      if (prev.includes(id)) {
        showToast('Paper is already in comparison list', 'info');
        return prev;
      }
      if (prev.length >= 3) {
        showToast('Comparison is limited to 3 papers max', 'warning');
        return prev;
      }
      showToast('Paper added to comparison list', 'success');
      return [...prev, id];
    });
  };

  const removeFromCompare = (id: string) => {
    setComparePaperIds((prev) => {
      showToast('Paper removed from comparison list', 'info');
      return prev.filter((pId) => pId !== id);
    });
  };

  const clearCompare = () => {
    setComparePaperIds([]);
    showToast('Comparison list cleared', 'info');
  };

  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((pId) => pId !== id);
      return [id, ...filtered].slice(0, 8); // Limit to 8
    });
  };

  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content: 'Welcome to **ResearchGraph AI**! I am your semantic research assistant. Ask me to explain a concept, compare models, generate a literature review, or explore research gaps.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast('Chat history cleared', 'info');
  };

  const addReview = (review: LitReview) => {
    setReviews((prev) => [review, ...prev]);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activePage,
        setActivePage,
        selectedPaperId,
        setSelectedPaperId,
        savedPaperIds,
        toggleSavePaper,
        comparePaperIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        recentlyViewedIds,
        addToRecentlyViewed,
        chatMessages,
        addChatMessage,
        clearChat,
        reviews,
        addReview,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        clearFilters,
        toast,
        showToast,
        paperCache,
        cachePapers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
