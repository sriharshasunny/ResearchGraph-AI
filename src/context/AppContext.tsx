import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChatMessage, PageType } from '../types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    sender: 'assistant',
    content: 'Welcome to ResearchGraph AI. I can help you find papers, compare models, generate literature reviews, and explore the knowledge graph. What would you like to research today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>(['p1', 'p3']);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(['p1', 'p2', 'p4']);

  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChat = () => {
    setChatMessages([{
      id: 'welcome',
      sender: 'assistant',
      content: 'Chat cleared. How else can I assist your research?',
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
