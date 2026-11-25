import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export interface AuthStateSnapshot {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SignInResult {
  session: Session;
  user: User | null;
}

export interface SignUpOptions {
  fullName?: string;
  data?: Record<string, unknown>;
}

export interface SignUpResult {
  session: Session | null;
  user: User | null;
  requiresEmailConfirmation: boolean;
}

export interface SupabaseAuthAdapter {
  getSession(): Promise<{
    data: { session: Session | null };
    error: { message: string } | null;
  }>;
  onAuthStateChange(
    callback: (event: AuthChangeEvent | string, session: Session | null) => void
  ): {
    data: { subscription: { unsubscribe: () => void } };
  };
  signInWithPassword(credentials: { email: string; password: string }): Promise<{
    data: { session: Session | null; user: User | null };
    error: { message: string } | null;
  }>;
  signUp(credentials: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown> };
  }): Promise<{
    data: { session: Session | null; user: User | null };
    error: { message: string } | null;
  }>;
  signOut(): Promise<{
    error: { message: string } | null;
  }>;
}

export interface AuthController {
  getState: () => AuthStateSnapshot;
  subscribe: (listener: (state: AuthStateSnapshot) => void) => () => void;
  start: () => void;
  dispose: () => void;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, options?: SignUpOptions) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}

const sanitizeAuthErrorMessage = (error: unknown, fallback: string): string => {
  const raw =
    error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message.trim()
      : error instanceof Error
        ? error.message.trim()
        : '';

  if (!raw) return fallback;
  // Redact any accidental bearer/JWT strings before exposing messages to UI state.
  return raw
    .replace(/Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/gi, 'Bearer [redacted]')
    .replace(/eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, '[redacted-token]');
};

export const createAuthController = (auth: SupabaseAuthAdapter): AuthController => {
  let state: AuthStateSnapshot = {
    session: null,
    user: null,
    loading: true,
    error: null,
  };

  let epoch = 0;
  let active = false;
  let subscription: { unsubscribe: () => void } | null = null;
  const listeners = new Set<(snapshot: AuthStateSnapshot) => void>();

  const emit = (next: AuthStateSnapshot) => {
    state = next;
    for (const listener of listeners) {
      listener(state);
    }
  };

  const applyAuthenticatedSession = (nextSession: Session | null, nextError: string | null = null) => {
    emit({
      session: nextSession,
      user: nextSession?.user ?? null,
      loading: false,
      error: nextError,
    });
  };

  const start = () => {
    if (active) return;
    active = true;
    const startEpoch = epoch;

    const { data } = auth.onAuthStateChange((_event, nextSession) => {
      epoch += 1;
      if (!active) return;
      applyAuthenticatedSession(nextSession ?? null, null);
    });
    subscription = data.subscription;

    void auth
      .getSession()
      .then(({ data: sessionData, error }) => {
        if (!active) return;
        // If an auth-state event or explicit sign-in/out already happened since
        // start(), keep that newer state instead of overwriting with stale getSession().
        if (epoch !== startEpoch) {
          if (state.loading) {
            emit({ ...state, loading: false });
          }
          return;
        }
        if (error) {
          applyAuthenticatedSession(null, sanitizeAuthErrorMessage(error, 'Unable to restore session.'));
          return;
        }
        applyAuthenticatedSession(sessionData.session ?? null, null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (epoch !== startEpoch) {
          if (state.loading) {
            emit({ ...state, loading: false });
          }
          return;
        }
        applyAuthenticatedSession(null, sanitizeAuthErrorMessage(err, 'Unable to restore session.'));
      });
  };

  const dispose = () => {
    active = false;
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
  };

  const clearError = () => {
    if (state.error !== null) {
      emit({ ...state, error: null });
    }
  };

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    if (state.error !== null) {
      emit({ ...state, error: null });
    }

    const { data, error } = await auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const message = sanitizeAuthErrorMessage(error, 'Authentication failed.');
      emit({ ...state, error: message });
      throw new Error(message);
    }

    if (!data.session) {
      const message = 'Authentication did not establish an active session.';
      emit({ ...state, loading: false, error: message });
      throw new Error(message);
    }

    epoch += 1;
    const nextUser = data.session.user ?? data.user ?? null;
    emit({
      session: data.session,
      user: nextUser,
      loading: false,
      error: null,
    });

    return {
      session: data.session,
      user: nextUser,
    };
  };

  const signUp = async (
    email: string,
    password: string,
    options?: SignUpOptions
  ): Promise<SignUpResult> => {
    if (state.error !== null) {
      emit({ ...state, error: null });
    }

    const metadata: Record<string, unknown> = {
      ...(options?.data ?? {}),
      ...(options?.fullName?.trim() ? { full_name: options.fullName.trim() } : {}),
    };

    const { data, error } = await auth.signUp({
      email: email.trim(),
      password,
      ...(Object.keys(metadata).length > 0 ? { options: { data: metadata } } : {}),
    });

    if (error) {
      const message = sanitizeAuthErrorMessage(error, 'Registration failed.');
      emit({ ...state, error: message });
      throw new Error(message);
    }

    epoch += 1;
    if (data.session) {
      const nextUser = data.session.user ?? data.user ?? null;
      emit({
        session: data.session,
        user: nextUser,
        loading: false,
        error: null,
      });
      return {
        session: data.session,
        user: nextUser,
        requiresEmailConfirmation: false,
      };
    }

    emit({
      session: null,
      user: null,
      loading: false,
      error: null,
    });
    return {
      session: null,
      user: data.user ?? null,
      requiresEmailConfirmation: true,
    };
  };

  const signOut = async (): Promise<void> => {
    if (state.error !== null) {
      emit({ ...state, error: null });
    }

    const { error } = await auth.signOut();
    if (error) {
      const message = sanitizeAuthErrorMessage(error, 'Sign out failed.');
      emit({ ...state, error: message });
      throw new Error(message);
    }

    epoch += 1;
    applyAuthenticatedSession(null, null);
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start,
    dispose,
    clearError,
    signIn,
    signUp,
    signOut,
  };
};
