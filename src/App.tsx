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
      {/* Colorful Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-400/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-cyan-400/15 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
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
