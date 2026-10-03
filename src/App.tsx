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
import { SearchPage } from './features/search/SearchPage';
import { PaperDetailsPage } from './features/details/PaperDetailsPage';
import { SavedPage } from './features/saved/SavedPage';
import { ComparePage } from './features/compare/ComparePage';
import { LiteratureReviewPage } from './features/literature/LiteratureReviewPage';
import { ResearchGapsPage } from './features/gaps/ResearchGapsPage';
import { HistoryPage } from './features/history/HistoryPage';

const MainAppLayout = () => {
  const { activePage } = useApp();
  const navigate = useNavigate();
  const handleLogout = () => navigate('/auth');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-screen w-full bg-[#F7FAFC] text-gray-900 overflow-hidden font-sans relative"
    >
      <div className="absolute inset-0 pointer-events-none z-0 bg-[#F7FAFC]">
      </div>
      <div className="relative z-10 flex h-full w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Navbar onLogout={handleLogout} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-0">
            {activePage === 'dashboard'  && <Dashboard />}
            {activePage === 'chat'       && <ChatPage />}
            {activePage === 'graph'      && <KnowledgeGraphPage />}
            {(activePage === 'search' || activePage === 'papers') && <SearchPage />}
            {activePage === 'details'    && <PaperDetailsPage />}
            {activePage === 'saved'      && <SavedPage />}
            {activePage === 'compare'    && <ComparePage />}
            {activePage === 'literature' && <LiteratureReviewPage />}
            {activePage === 'gaps'       && <ResearchGapsPage />}
            {activePage === 'history'    && <HistoryPage />}
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
        <Route path="/launch" element={<LaunchSequence onComplete={() => navigate('/app')} />} />
        <Route path="/app/*" element={<MainAppLayout />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
