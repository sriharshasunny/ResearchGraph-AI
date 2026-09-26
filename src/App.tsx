import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './features/dashboard/Dashboard';
import { ChatPage } from './features/chat/ChatPage';
import { KnowledgeGraphPage } from './features/graph/KnowledgeGraphPage';
import { LaunchSequence } from './features/auth/LaunchSequence';
import { AuthPage } from './features/auth/AuthPage';

// A layout wrapper for the authenticated application
const MainAppLayout = () => {
  const { activePage } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Basic logout handling - push to auth route
    navigate('/auth');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-screen w-full bg-brand-bg text-brand-text overflow-hidden font-sans relative"
    >
      {/* Sci-Fi Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-brand-bg to-brand-bg">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-accent/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex h-full w-full">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar onLogout={handleLogout} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-0">
            {/* The activePage is still driven by AppContext within the dashboard, 
                so we don't need nested routes for dashboard sub-views right now. */}
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'chat' && <ChatPage />}
            {activePage === 'graph' && <KnowledgeGraphPage />}
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Route */}
        <Route 
          path="/auth" 
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-screen w-full"
            >
              <AuthPage onAuthComplete={() => navigate('/launch')} />
            </motion.div>
          } 
        />
        
        {/* Launch Sequence Route */}
        <Route path="/launch" element={<LaunchSequence onComplete={() => navigate('/app')} />} />
        
        {/* Main Application Route */}
        <Route path="/app/*" element={<MainAppLayout />} />

        {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
