import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './features/dashboard/Dashboard';
import { ChatPage } from './features/chat/ChatPage';
import { KnowledgeGraphPage } from './features/graph/KnowledgeGraphPage';
import { LaunchSequence } from './features/auth/LaunchSequence';

export const App: React.FC = () => {
  const { activePage } = useApp();
  const [showLaunch, setShowLaunch] = useState(true);

  if (showLaunch) {
    return <LaunchSequence onComplete={() => setShowLaunch(false)} />;
  }

  return (
    <div className="flex h-screen w-full bg-brand-bg text-brand-text overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-0">
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'chat' && <ChatPage />}
          {activePage === 'graph' && <KnowledgeGraphPage />}
          {/* Add other pages later if needed */}
        </main>
      </div>
    </div>
  );
};
