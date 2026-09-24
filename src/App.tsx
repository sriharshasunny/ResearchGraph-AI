import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';

// Import Feature Pages
import { LandingPage } from './features/landing/LandingPage';
import { Dashboard } from './features/dashboard/Dashboard';
import { SearchPage } from './features/search/SearchPage';
import { ChatPage } from './features/chat/ChatPage';
import { KnowledgeGraphPage } from './features/graph/KnowledgeGraphPage';
import { LitReviewPage } from './features/lit-review/LitReviewPage';
import { ComparePage } from './features/compare/ComparePage';
import { PaperDetailsPage } from './features/details/PaperDetailsPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { ProfilePage } from './features/profile/ProfilePage';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const { activePage } = useApp();

  // Full screen pages (no Sidebar or Top Nav)
  if (activePage === 'landing') {
    return (
      <div className="min-h-screen w-full bg-brand-bg text-brand-text">
        <LandingPage />
      </div>
    );
  }

  // Dashboard / Workspace layout (Sidebar + Nav)
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg relative animate-fade-in">
      {/* Main Sidebar */}
      <Sidebar />

      {/* Right Column Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top bar header */}
        <Navbar />

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-6xl mx-auto h-full">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'search' && <SearchPage />}
            {activePage === 'chat' && <ChatPage />}
            {activePage === 'graph' && <KnowledgeGraphPage />}
            {activePage === 'lit-review' && <LitReviewPage />}
            {activePage === 'compare' && <ComparePage />}
            {activePage === 'details' && <PaperDetailsPage />}
            {activePage === 'analytics' && <AnalyticsPage />}
            {activePage === 'profile' && <ProfilePage />}
          </div>
        </main>
      </div>

      {/* Global Action Notifications */}
      <Toast />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
