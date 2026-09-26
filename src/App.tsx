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
    <div className="flex h-screen w-full bg-[#f8fafc] text-brand-text overflow-hidden font-sans relative">
      {/* Smooth Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/30 blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-0">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'chat' && <ChatPage />}
            {activePage === 'graph' && <KnowledgeGraphPage />}
          </main>
        </div>
      </div>
    </div>
  );
};
