import React from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resolveProtectedRouteAccess } from '../features/auth/routeGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, session, user } = useAuth();
  const access = resolveProtectedRouteAccess({ loading, session, user });

  if (access === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Verifying session"
        className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020617] text-slate-100"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.14),transparent_55%),radial-gradient(circle_at_75%_65%,rgba(139,92,246,0.12),transparent_50%)]"
        />
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl border border-slate-800/80 bg-[#0B1222]/85 px-8 py-7 shadow-2xl backdrop-blur-xl">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-400/25 border-t-cyan-400" />
            <Sparkles className="absolute h-3.5 w-3.5 text-cyan-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold tracking-wide text-white">
              Restoring Research Session
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Verifying workspace credentials…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (access === 'unauthenticated') {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
