import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  createAuthController,
  type SignInResult,
  type SignUpOptions,
  type SignUpResult,
  type SupabaseAuthAdapter,
} from './authLifecycle';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  authClient?: SupabaseAuthAdapter;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, authClient }) => {
  const client = authClient ?? supabase.auth;
  const controller = useMemo(() => createAuthController(client), [client]);
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState
  );

  useEffect(() => {
    controller.start();
    return () => {
      controller.dispose();
    };
  }, [controller]);

  const value = useMemo<AuthContextType>(
    () => ({
      session: snapshot.session,
      user: snapshot.user,
      loading: snapshot.loading,
      error: snapshot.error,
      clearError: controller.clearError,
      signIn: controller.signIn,
      signUp: controller.signUp,
      signOut: controller.signOut,
    }),
    [snapshot, controller]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
