import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { createAuthController, type SupabaseAuthAdapter } from '../src/context/authLifecycle.ts';

const makeUser = (id = '00000000-0000-4000-8000-000000000001', email = 'researcher@example.edu'): User =>
  ({
    id,
    email,
    app_metadata: {},
    user_metadata: { full_name: 'Dr. Ada Lovelace' },
    aud: 'authenticated',
    created_at: '2026-11-25T00:00:00Z',
  }) as User;

const makeSession = (user = makeUser()): Session =>
  ({
    access_token: 'synthetic.jwt.access',
    refresh_token: 'synthetic-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  }) as Session;

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const createMockAuth = (overrides: Partial<SupabaseAuthAdapter> = {}) => {
  const listeners = new Set<(event: AuthChangeEvent | string, session: Session | null) => void>();
  let unsubscribedCount = 0;

  const adapter: SupabaseAuthAdapter = {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback) => {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              unsubscribedCount += 1;
              listeners.delete(callback);
            },
          },
        },
      };
    },
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
    signUp: async () => ({ data: { session: null, user: null }, error: null }),
    signOut: async () => ({ error: null }),
    ...overrides,
  };

  return {
    adapter,
    emitAuthEvent: (event: AuthChangeEvent | string, session: Session | null) => {
      for (const listener of listeners) {
        listener(event, session);
      }
    },
    getUnsubscribedCount: () => unsubscribedCount,
    getListenerCount: () => listeners.size,
  };
};

test('1. Initial session exists restores user and session and clears loading', async () => {
  const session = makeSession();
  const mock = createMockAuth({
    getSession: async () => ({ data: { session }, error: null }),
  });

  const controller = createAuthController(mock.adapter);
  assert.equal(controller.getState().loading, true);

  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const state = controller.getState();
  assert.equal(state.loading, false);
  assert.equal(state.session?.user.id, session.user.id);
  assert.equal(state.user?.email, 'researcher@example.edu');
  assert.equal(state.error, null);
  controller.dispose();
});

test('2. Initial session does not exist clears loading with null user and session', async () => {
  const mock = createMockAuth({
    getSession: async () => ({ data: { session: null }, error: null }),
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const state = controller.getState();
  assert.equal(state.loading, false);
  assert.equal(state.session, null);
  assert.equal(state.user, null);
  assert.equal(state.error, null);
  controller.dispose();
});

test('3. Session restoration waits while loading and prevents stale getSession overwrite', async () => {
  const pendingSession = createDeferred<{ data: { session: Session | null }; error: null }>();
  const freshSession = makeSession(makeUser('00000000-0000-4000-8000-000000000002', 'fresh@example.edu'));
  const mock = createMockAuth({
    getSession: () => pendingSession.promise,
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  assert.equal(controller.getState().loading, true);

  // Newer auth event arrives before initial getSession() resolves.
  mock.emitAuthEvent('SIGNED_IN', freshSession);
  assert.equal(controller.getState().loading, false);
  assert.equal(controller.getState().user?.email, 'fresh@example.edu');

  // Late null getSession() must not overwrite the newer authenticated session.
  pendingSession.resolve({ data: { session: null }, error: null });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(controller.getState().user?.email, 'fresh@example.edu');
  controller.dispose();
});

test('4. Login success updates centralized session and user', async () => {
  const session = makeSession();
  let capturedEmail = '';
  const mock = createMockAuth({
    signInWithPassword: async ({ email }) => {
      capturedEmail = email;
      return { data: { session, user: session.user }, error: null };
    },
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const result = await controller.signIn('  researcher@example.edu  ', 'secret-pass');
  assert.equal(capturedEmail, 'researcher@example.edu');
  assert.equal(result.session.user.id, session.user.id);
  assert.equal(controller.getState().session?.user.id, session.user.id);
  assert.equal(controller.getState().user?.id, session.user.id);
  assert.equal(controller.getState().error, null);
  controller.dispose();
});

test('5. Login failure propagates meaningful error without setting session', async () => {
  const mock = createMockAuth({
    signInWithPassword: async () => ({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    }),
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  await assert.rejects(
    () => controller.signIn('researcher@example.edu', 'wrong-pass'),
    /Invalid login credentials/
  );
  assert.equal(controller.getState().session, null);
  assert.equal(controller.getState().user, null);
  assert.equal(controller.getState().error, 'Invalid login credentials');
  controller.dispose();
});

test('6. Registration with a session authenticates immediately and forwards full_name metadata', async () => {
  const session = makeSession();
  let capturedFullName: unknown;
  const mock = createMockAuth({
    signUp: async ({ options }) => {
      capturedFullName = options?.data?.full_name;
      return { data: { session, user: session.user }, error: null };
    },
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const result = await controller.signUp('researcher@example.edu', 'strong-pass', {
    fullName: '  Dr. Ada Lovelace  ',
  });
  assert.equal(capturedFullName, 'Dr. Ada Lovelace');
  assert.equal(result.requiresEmailConfirmation, false);
  assert.equal(result.session?.user.id, session.user.id);
  assert.equal(controller.getState().session?.user.id, session.user.id);
  controller.dispose();
});

test('7. Registration without a session requires confirmation and does not authenticate', async () => {
  const unconfirmedUser = makeUser();
  const mock = createMockAuth({
    signUp: async () => ({
      data: { session: null, user: unconfirmedUser },
      error: null,
    }),
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const result = await controller.signUp('researcher@example.edu', 'strong-pass', {
    fullName: 'Dr. Ada Lovelace',
  });
  assert.equal(result.requiresEmailConfirmation, true);
  assert.equal(result.session, null);
  assert.equal(controller.getState().session, null);
  assert.equal(controller.getState().user, null);
  controller.dispose();
});

test('8. Authentication state changes update session and dispose unsubscribes cleanly', async () => {
  const firstSession = makeSession(makeUser('00000000-0000-4000-8000-000000000001', 'a@example.edu'));
  const refreshedSession = makeSession(makeUser('00000000-0000-4000-8000-000000000001', 'a@example.edu'));
  const mock = createMockAuth();

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(mock.getListenerCount(), 1);
  mock.emitAuthEvent('SIGNED_IN', firstSession);
  assert.equal(controller.getState().user?.email, 'a@example.edu');

  mock.emitAuthEvent('TOKEN_REFRESHED', refreshedSession);
  assert.equal(controller.getState().session, refreshedSession);

  // Session expiration / sign-out event clears session.
  mock.emitAuthEvent('SIGNED_OUT', null);
  assert.equal(controller.getState().session, null);
  assert.equal(controller.getState().user, null);

  controller.dispose();
  assert.equal(mock.getUnsubscribedCount(), 1);
  assert.equal(mock.getListenerCount(), 0);
});

test('9. Logout success calls supabase signOut and clears centralized session', async () => {
  const session = makeSession();
  let signOutCalls = 0;
  const mock = createMockAuth({
    getSession: async () => ({ data: { session }, error: null }),
    signOut: async () => {
      signOutCalls += 1;
      return { error: null };
    },
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(controller.getState().session?.user.id, session.user.id);

  await controller.signOut();
  assert.equal(signOutCalls, 1);
  assert.equal(controller.getState().session, null);
  assert.equal(controller.getState().user, null);
  assert.equal(controller.getState().error, null);
  controller.dispose();
});

test('10. Logout failure propagates error and preserves error state', async () => {
  const session = makeSession();
  const mock = createMockAuth({
    getSession: async () => ({ data: { session }, error: null }),
    signOut: async () => ({ error: { message: 'Network error while signing out' } }),
  });

  const controller = createAuthController(mock.adapter);
  controller.start();
  await new Promise((resolve) => setTimeout(resolve, 0));

  await assert.rejects(() => controller.signOut(), /Network error while signing out/);
  assert.equal(controller.getState().error, 'Network error while signing out');
  assert.equal(controller.getState().session?.user.id, session.user.id);
  controller.dispose();
});
