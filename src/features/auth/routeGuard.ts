import type { Session, User } from '@supabase/supabase-js';

export type ProtectedRouteDecision = 'loading' | 'unauthenticated' | 'authenticated';

export interface ProtectedRouteAuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
}

export function resolveProtectedRouteAccess(
  authState: ProtectedRouteAuthState,
): ProtectedRouteDecision {
  if (authState.loading) {
    return 'loading';
  }
  if (!authState.session || !authState.user) {
    return 'unauthenticated';
  }
  return 'authenticated';
}

export interface LogoutExecutionDeps {
  signOut: () => Promise<void>;
  resetPrivateState: () => void;
  navigateToAuth: () => void;
}

export type LogoutExecutionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function executeLogout(
  deps: LogoutExecutionDeps,
): Promise<LogoutExecutionResult> {
  try {
    await deps.signOut();
    deps.resetPrivateState();
    deps.navigateToAuth();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error && err.message.trim()
          ? err.message
          : 'Unable to sign out right now. Your session is still active; please try again.',
    };
  }
}
