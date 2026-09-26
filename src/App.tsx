import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './features/dashboard/Dashboard';
import { ChatPage } from './features/chat/ChatPage';
import { KnowledgeGraphPage } from './features/graph/KnowledgeGraphPage';
import { LaunchSequence } from './features/auth/LaunchSequence';
import { AuthPage } from './features/auth/AuthPage';

export const App: React.FC = () => {
  const { activePage } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLaunch(true);
  };

  if (!isAuthenticated) {
    return <AuthPage onAuthComplete={handleLogin} />;
  }

  if (showLaunch) {
    return <LaunchSequence onComplete={() => setShowLaunch(false)} />;
  }
  return (
    <div className="flex h-screen w-full bg-brand-bg text-brand-text overflow-hidden font-sans relative">
      {/* Sci-Fi Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-brand-bg to-brand-bg">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-accent/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]"></div>
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
