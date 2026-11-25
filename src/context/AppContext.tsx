import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChatMessage, PageType, Paper } from '../types';
import { useAuth } from './AuthContext';
import { normalizeAuthenticatedUserId } from '../lib/userStorage';
import {
  CLEAR_CHAT_MESSAGE_CONTENT,
  createEmptyWorkspaceState,
  createWelcomeChatMessage,
  loadWorkspaceStateForUser,
  saveWorkspacePaperNotes,
  saveWorkspaceReadingStatus,
  saveWorkspaceSavedPapers,
  saveWorkspaceScratchpad,
  type ReadingStatus,
  type WorkspaceState,
} from './workspaceIsolation';

export type { ReadingStatus } from './workspaceIsolation';

export type UIMode = 'simple' | 'expert';

interface InternalWorkspaceState extends WorkspaceState {
  persistSavedPapers: boolean;
}

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

  // UI Mode
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
  addSearchResults: (papers: Paper[]) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  workspaceVersion: number;
  resetPrivateState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const readStoredUIMode = (): UIMode => {
  try {
    return (localStorage.getItem('rg_uiMode') as UIMode) || 'simple';
  } catch {
    return 'simple';
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const activeUserId = authLoading ? null : normalizeAuthenticatedUserId(user?.id);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);

  // Global application preferences (preserved across users & logout)
  const [uiMode, setUIModeState] = useState<UIMode>(readStoredUIMode);

  const setUIMode = useCallback((mode: UIMode) => {
    setUIModeState(mode);
    try {
      localStorage.setItem('rg_uiMode', mode);
    } catch {
      // ignore storage errors for non-critical preferences
    }
  }, []);

  // Global Dark Mode Theme State
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('rg_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('rg_theme', newTheme);
    } catch {
      // ignore
    }
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Isolated per-user private workspace state
  const [workspace, setWorkspace] = useState<InternalWorkspaceState>(() => ({
    ...loadWorkspaceStateForUser(activeUserId),
    persistSavedPapers: false,
  }));

  useEffect(() => {
    setWorkspace({
      ...loadWorkspaceStateForUser(activeUserId),
      persistSavedPapers: false,
    });
  }, [activeUserId]);

  // Immediately reflect empty/new-user state on the render pass where activeUserId changes
  const effectiveWorkspace: InternalWorkspaceState =
    workspace.ownerUserId === activeUserId
      ? workspace
      : { ...loadWorkspaceStateForUser(activeUserId), persistSavedPapers: false };

  useEffect(() => {
    if (!activeUserId || workspace.ownerUserId !== activeUserId || !workspace.persistSavedPapers) {
      return;
    }
    saveWorkspaceSavedPapers(activeUserId, workspace.allPapers, workspace.savedPaperIds);
  }, [activeUserId, workspace.ownerUserId, workspace.persistSavedPapers, workspace.allPapers, workspace.savedPaperIds]);

  const updateWorkspace = useCallback(
    (updater: (prev: InternalWorkspaceState) => InternalWorkspaceState) => {
      setWorkspace((prev) => {
        const base: InternalWorkspaceState =
          prev.ownerUserId === activeUserId
            ? prev
            : { ...loadWorkspaceStateForUser(activeUserId), persistSavedPapers: false };
        return updater(base);
      });
    },
    [activeUserId],
  );

  const resetPrivateState = useCallback(() => {
    setWorkspace({
      ...createEmptyWorkspaceState(activeUserId),
      persistSavedPapers: false,
    });
    setWorkspaceVersion((prev) => prev + 1);
  }, [activeUserId]);

  const setActivePage = useCallback((activePage: PageType) => {
    updateWorkspace((prev) => ({ ...prev, activePage }));
  }, [updateWorkspace]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    updateWorkspace((prev) => ({ ...prev, searchQuery }));
  }, [updateWorkspace]);

  const setSelectedPaperId = useCallback((selectedPaperId: string | null) => {
    updateWorkspace((prev) => ({ ...prev, selectedPaperId }));
  }, [updateWorkspace]);

  const setActiveProject = useCallback((activeProject: string) => {
    updateWorkspace((prev) => ({ ...prev, activeProject }));
  }, [updateWorkspace]);

  const setChatScope = useCallback((chatScope: string) => {
    updateWorkspace((prev) => ({ ...prev, chatScope }));
  }, [updateWorkspace]);

  const setScratchpad = useCallback((text: string) => {
    updateWorkspace((prev) => ({ ...prev, scratchpad: text }));
    saveWorkspaceScratchpad(activeUserId, text);
  }, [activeUserId, updateWorkspace]);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    updateWorkspace((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, msg],
    }));
  }, [updateWorkspace]);

  const clearChat = useCallback(() => {
    updateWorkspace((prev) => ({
      ...prev,
      chatMessages: [createWelcomeChatMessage(CLEAR_CHAT_MESSAGE_CONTENT)],
    }));
  }, [updateWorkspace]);

  const toggleSavedPaper = useCallback((id: string) => {
    updateWorkspace((prev) => ({
      ...prev,
      savedPaperIds: prev.savedPaperIds.includes(id)
        ? prev.savedPaperIds.filter((p) => p !== id)
        : [...prev.savedPaperIds, id],
      persistSavedPapers: activeUserId !== null,
    }));
  }, [activeUserId, updateWorkspace]);

  const addToRecentlyViewed = useCallback((id: string) => {
    updateWorkspace((prev) => {
      const filtered = prev.recentlyViewed.filter((p) => p !== id);
      return {
        ...prev,
        recentlyViewed: [id, ...filtered].slice(0, 10),
      };
    });
  }, [updateWorkspace]);

  const setPaperReadingStatus = useCallback((id: string, status: ReadingStatus) => {
    updateWorkspace((prev) => {
      const nextStatus = { ...prev.paperReadingStatus, [id]: status };
      saveWorkspaceReadingStatus(activeUserId, nextStatus);
      return {
        ...prev,
        paperReadingStatus: nextStatus,
      };
    });
  }, [activeUserId, updateWorkspace]);

  const setPaperNote = useCallback((id: string, note: string) => {
    updateWorkspace((prev) => {
      const nextNotes = { ...prev.paperNotes, [id]: note };
      saveWorkspacePaperNotes(activeUserId, nextNotes);
      return {
        ...prev,
        paperNotes: nextNotes,
      };
    });
  }, [activeUserId, updateWorkspace]);

  const toggleComparisonPaper = useCallback((id: string) => {
    updateWorkspace((prev) => {
      const curr = prev.comparisonPaperIds;
      let next: string[];
      if (curr.includes(id)) {
        next = curr.filter((x) => x !== id);
      } else if (curr.length >= 3) {
        next = [...curr.slice(1), id];
      } else {
        next = [...curr, id];
      }
      return { ...prev, comparisonPaperIds: next };
    });
  }, [updateWorkspace]);

  const clearComparison = useCallback(() => {
    updateWorkspace((prev) => ({ ...prev, comparisonPaperIds: [] }));
  }, [updateWorkspace]);

  const addCustomPaper = useCallback((paper: Paper) => {
    updateWorkspace((prev) => ({
      ...prev,
      allPapers: [paper, ...prev.allPapers],
      savedPaperIds: prev.savedPaperIds.includes(paper.id)
        ? prev.savedPaperIds
        : [paper.id, ...prev.savedPaperIds],
      persistSavedPapers: activeUserId !== null,
    }));
  }, [activeUserId, updateWorkspace]);

  const addSearchResults = useCallback((papers: Paper[]) => {
    updateWorkspace((prev) => {
      const papersById = new Map(prev.allPapers.map((paper) => [paper.id, paper]));
      for (const paper of papers) papersById.set(paper.id, paper);
      return {
        ...prev,
        allPapers: [...papersById.values()],
      };
    });
  }, [updateWorkspace]);

  return (
    <AppContext.Provider
      value={{
        activePage: effectiveWorkspace.activePage,
        setActivePage,
        searchQuery: effectiveWorkspace.searchQuery,
        setSearchQuery,
        chatMessages: effectiveWorkspace.chatMessages,
        addChatMessage,
        clearChat,
        savedPaperIds: effectiveWorkspace.savedPaperIds,
        toggleSavedPaper,
        selectedPaperId: effectiveWorkspace.selectedPaperId,
        setSelectedPaperId,
        recentlyViewed: effectiveWorkspace.recentlyViewed,
        addToRecentlyViewed,
        isSidebarOpen,
        toggleSidebar,
        uiMode,
        setUIMode,
        paperReadingStatus: effectiveWorkspace.paperReadingStatus,
        setPaperReadingStatus,
        paperNotes: effectiveWorkspace.paperNotes,
        setPaperNote,
        comparisonPaperIds: effectiveWorkspace.comparisonPaperIds,
        toggleComparisonPaper,
        clearComparison,
        activeProject: effectiveWorkspace.activeProject,
        setActiveProject,
        scratchpad: effectiveWorkspace.scratchpad,
        setScratchpad,
        chatScope: effectiveWorkspace.chatScope,
        setChatScope,
        allPapers: effectiveWorkspace.allPapers,
        addCustomPaper,
        addSearchResults,
        theme,
        toggleTheme,
        setTheme,
        workspaceVersion,
        resetPrivateState,
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
