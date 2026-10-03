import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChatMessage, PageType, Paper } from '../types';
import { mockPapers } from '../data/mockData';

export type ReadingStatus = 'to_read' | 'reading' | 'completed';

export type Theme = 'light' | 'dark' | 'system';
export type UIMode = 'simple' | 'expert';

interface AppContextType {
  activePage: PageType;
  setActivePage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  savedPaperIds: string[];
  toggleSavedPaper: (id: string) => void;
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  recentlyViewed: string[];
  addToRecentlyViewed: (id: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Theme and UI Mode
  theme: Theme;
  setTheme: (theme: Theme) => void;
  uiMode: UIMode;
  setUIMode: (mode: UIMode) => void;

  // Rich Interactive Workspace State
  paperReadingStatus: Record<string, ReadingStatus>;
  setPaperReadingStatus: (id: string, status: ReadingStatus) => void;
  paperNotes: Record<string, string>;
  setPaperNote: (id: string, note: string) => void;
  comparisonPaperIds: string[];
  toggleComparisonPaper: (id: string) => void;
  clearComparison: () => void;
  activeProject: string;
  setActiveProject: (p: string) => void;
  scratchpad: string;
  setScratchpad: (notes: string) => void;
  chatScope: string;
  setChatScope: (scope: string) => void;
  allPapers: Paper[];
  addCustomPaper: (paper: Paper) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [allPapers, setAllPapers] = useState<Paper[]>(mockPapers);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    sender: 'assistant',
    content: 'Welcome to your ResearchGraph AI Copilot. I can synthesize literature across foundational papers, construct comparative benchmarks, extract methodology trade-offs, and map citations. Ground me in your saved library or query indexed papers directly.',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>(['p1', 'p2', 'p5', 'p8']);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(['p1', 'p2', 'p3', 'p5', 'p6']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme and UI Mode
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('rg_theme') as Theme) || 'system');
  const [uiMode, setUIModeState] = useState<UIMode>(() => (localStorage.getItem('rg_uiMode') as UIMode) || 'simple');

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('rg_theme', newTheme);
    // Apply theme to document
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setUIMode = (mode: UIMode) => {
    setUIModeState(mode);
    localStorage.setItem('rg_uiMode', mode);
  };

  // Run initial theme application
  React.useEffect(() => {
    setTheme(theme);
  }, []);

  // Reading status
  const [paperReadingStatus, setPaperReadingStatusState] = useState<Record<string, ReadingStatus>>({
    p1: 'completed',
    p2: 'reading',
    p5: 'reading',
    p8: 'to_read'
  });

  // Paper personal notes
  const [paperNotes, setPaperNotes] = useState<Record<string, string>>({
    p1: 'Essential reference for self-attention scaling. Key equations 1 & 2 on scaled dot-product.',
    p2: 'Patch projection layer implementation in Section 3.1 is remarkably simple. Need to benchmark against ConvNeXt.',
    p5: 'GRPO algorithm bypasses value model memory overhead. Critical for test-time scaling experiments.'
  });

  // Comparison list
  const [comparisonPaperIds, setComparisonPaperIds] = useState<string[]>(['p2', 'p3']);

  // Active research project
  const [activeProject, setActiveProject] = useState('Vision-Language Scaling & Reasoning');

  // Scratchpad
  const [scratchpad, setScratchpadState] = useState(() => {
    return localStorage.getItem('researchgraph_scratchpad') || 
`# Working Hypothesis
- Exploring whether self-distillation (DINOv2) visual embeddings retain spatial compositionality better than contrastive text-image pairs (CLIP) when injected into cross-attention multimodal decoders.

# Key References To Revisit:
- Dosovitskiy et al. (ViT) patch resolution trade-offs
- Radford et al. (CLIP) zero-shot robustness
- DeepSeek-R1 test-time computation steps`;
  });

  const [chatScope, setChatScope] = useState<string>('all');

  const setScratchpad = (text: string) => {
    setScratchpadState(text);
    localStorage.setItem('researchgraph_scratchpad', text);
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages([{
      id: 'welcome',
      sender: 'assistant',
      content: 'Workspace chat cleared. How would you like to direct the research copilot next?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const toggleSavedPaper = (id: string) => {
    setSavedPaperIds((prev) => 
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p !== id);
      return [id, ...filtered].slice(0, 10);
    });
  };

  const setPaperReadingStatus = (id: string, status: ReadingStatus) => {
    setPaperReadingStatusState(prev => ({ ...prev, [id]: status }));
  };

  const setPaperNote = (id: string, note: string) => {
    setPaperNotes(prev => ({ ...prev, [id]: note }));
  };

  const toggleComparisonPaper = (id: string) => {
    setComparisonPaperIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id]; // Max 3
      return [...prev, id];
    });
  };

  const clearComparison = () => {
    setComparisonPaperIds([]);
  };

  const addCustomPaper = (paper: Paper) => {
    setAllPapers(prev => [paper, ...prev]);
    setSavedPaperIds(prev => [paper.id, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        searchQuery,
        setSearchQuery,
        chatMessages,
        addChatMessage,
        clearChat,
        savedPaperIds,
        toggleSavedPaper,
        selectedPaperId,
        setSelectedPaperId,
        recentlyViewed,
        addToRecentlyViewed,
        isSidebarOpen,
        toggleSidebar,
        theme,
        setTheme,
        uiMode,
        setUIMode,
        paperReadingStatus,
        setPaperReadingStatus,
        paperNotes,
        setPaperNote,
        comparisonPaperIds,
        toggleComparisonPaper,
        clearComparison,
        activeProject,
        setActiveProject,
        scratchpad,
        setScratchpad,
        chatScope,
        setChatScope,
        allPapers,
        addCustomPaper
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
