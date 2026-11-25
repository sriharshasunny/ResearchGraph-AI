import assert from 'node:assert/strict';
import test from 'node:test';
import type { Session, User } from '@supabase/supabase-js';
import type { Paper } from '../src/types/index.ts';
import {
  clearUserWorkspaceStorage,
  getUserStorageKey,
  getUserStoragePrefix,
  normalizeAuthenticatedUserId,
  readUserStorageJson,
  readUserStorageString,
  writeUserStorageJson,
  writeUserStorageString,
  type StorageLike,
} from '../src/lib/userStorage.ts';
import {
  DEFAULT_SCRATCHPAD,
  createEmptyLiteratureDraft,
  createEmptyWorkspaceState,
  loadLiteratureDraftForUser,
  loadWorkspaceStateForUser,
  saveLiteratureDraftForUser,
  saveWorkspacePaperNotes,
  saveWorkspaceReadingStatus,
  saveWorkspaceSavedPapers,
  saveWorkspaceScratchpad,
} from '../src/context/workspaceIsolation.ts';
import {
  executeLogout,
  resolveProtectedRouteAccess,
} from '../src/features/auth/routeGuard.ts';

const USER_A = '00000000-0000-4000-8000-000000000001';
const USER_B = '00000000-0000-4000-8000-000000000002';

const makeUser = (id: string, email: string): User =>
  ({
    id,
    email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-11-26T00:00:00Z',
  }) as User;

const makeSession = (user: User): Session =>
  ({
    access_token: 'synthetic.jwt.access',
    refresh_token: 'synthetic-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  }) as Session;

const makePaper = (id: string, title: string): Paper => ({
  id,
  title,
  authors: ['A. Researcher'],
  year: 2025,
  citations: 42,
  abstract: `Abstract for ${title}`,
});

function createMemoryStorage(initialEntries: Record<string, string> = {}): StorageLike & {
  snapshot: () => Record<string, string>;
} {
  const store = new Map<string, string>(Object.entries(initialEntries));
  return {
    get length() {
      return store.size;
    },
    key(index: number): string | null {
      const keys = Array.from(store.keys());
      return index >= 0 && index < keys.length ? keys[index] : null;
    },
    getItem(key: string): string | null {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    snapshot(): Record<string, string> {
      return Object.fromEntries(store.entries());
    },
  };
}

test('route protection blocks unauthenticated requests, waits while loading, and permits valid sessions', () => {
  assert.equal(
    resolveProtectedRouteAccess({ loading: true, session: null, user: null }),
    'loading',
  );
  assert.equal(
    resolveProtectedRouteAccess({ loading: false, session: null, user: null }),
    'unauthenticated',
  );
  const userA = makeUser(USER_A, 'a@research.edu');
  const sessionA = makeSession(userA);
  assert.equal(
    resolveProtectedRouteAccess({ loading: false, session: sessionA, user: null }),
    'unauthenticated',
  );
  assert.equal(
    resolveProtectedRouteAccess({ loading: false, session: null, user: userA }),
    'unauthenticated',
  );
  assert.equal(
    resolveProtectedRouteAccess({ loading: false, session: sessionA, user: userA }),
    'authenticated',
  );
});

test('logout flow clears state and redirects only after signOut succeeds, and preserves state on failure', async () => {
  const calls: string[] = [];
  const successResult = await executeLogout({
    signOut: async () => {
      calls.push('signOut');
    },
    resetPrivateState: () => {
      calls.push('resetPrivateState');
    },
    navigateToAuth: () => {
      calls.push('navigateToAuth');
    },
  });
  assert.deepEqual(successResult, { ok: true });
  assert.deepEqual(calls, ['signOut', 'resetPrivateState', 'navigateToAuth']);

  const failedCalls: string[] = [];
  const failureResult = await executeLogout({
    signOut: async () => {
      failedCalls.push('signOut');
      throw new Error('Network unavailable');
    },
    resetPrivateState: () => {
      failedCalls.push('resetPrivateState');
    },
    navigateToAuth: () => {
      failedCalls.push('navigateToAuth');
    },
  });
  assert.deepEqual(failureResult, { ok: false, error: 'Network unavailable' });
  assert.deepEqual(failedCalls, ['signOut']);
});

test('userStorage validates UUID identity and produces deterministic namespaced keys', () => {
  assert.equal(normalizeAuthenticatedUserId(USER_A), USER_A);
  assert.equal(normalizeAuthenticatedUserId(` ${USER_A} `), USER_A);
  assert.equal(normalizeAuthenticatedUserId(null), null);
  assert.equal(normalizeAuthenticatedUserId(undefined), null);
  assert.equal(normalizeAuthenticatedUserId(''), null);
  assert.equal(normalizeAuthenticatedUserId('jane.doe@research.edu'), null);
  assert.equal(normalizeAuthenticatedUserId('not-a-uuid'), null);

  assert.equal(getUserStoragePrefix(USER_A), `researchgraph:${USER_A}:`);
  assert.equal(
    getUserStorageKey(USER_A, 'saved_papers'),
    `researchgraph:${USER_A}:saved_papers`,
  );
  assert.equal(getUserStorageKey('not-a-uuid', 'saved_papers'), null);
});

test('saved papers are isolated per authenticated user without leaking across accounts', () => {
  const storage = createMemoryStorage();
  const paperA = makePaper('paper-a1', 'User A Quantum Graph Paper');
  const paperB = makePaper('paper-b1', 'User B Protein Folding Paper');

  assert.equal(saveWorkspaceSavedPapers(USER_A, [paperA], ['paper-a1'], storage), true);
  assert.equal(saveWorkspaceSavedPapers(USER_B, [paperB], ['paper-b1'], storage), true);

  const loadedA = loadWorkspaceStateForUser(USER_A, storage);
  const loadedB = loadWorkspaceStateForUser(USER_B, storage);

  assert.deepEqual(loadedA.allPapers.map((p) => p.id), ['paper-a1']);
  assert.deepEqual(loadedA.savedPaperIds, ['paper-a1']);
  assert.deepEqual(loadedB.allPapers.map((p) => p.id), ['paper-b1']);
  assert.deepEqual(loadedB.savedPaperIds, ['paper-b1']);

  // Unauthenticated state never reads either user's saved papers
  const guest = loadWorkspaceStateForUser(null, storage);
  assert.deepEqual(guest.allPapers, []);
  assert.deepEqual(guest.savedPaperIds, []);
});

test('scratchpad, reading status, and paper notes are isolated per user and reset on logout', () => {
  const storage = createMemoryStorage();

  assert.equal(saveWorkspaceScratchpad(USER_A, 'User A private hypothesis', storage), true);
  assert.equal(saveWorkspaceReadingStatus(USER_A, { 'paper-a1': 'completed' }, storage), true);
  assert.equal(saveWorkspacePaperNotes(USER_A, { 'paper-a1': 'User A private annotation' }, storage), true);

  const loadedA = loadWorkspaceStateForUser(USER_A, storage);
  assert.equal(loadedA.scratchpad, 'User A private hypothesis');
  assert.deepEqual(loadedA.paperReadingStatus, { 'paper-a1': 'completed' });
  assert.deepEqual(loadedA.paperNotes, { 'paper-a1': 'User A private annotation' });

  const loadedB = loadWorkspaceStateForUser(USER_B, storage);
  assert.equal(loadedB.scratchpad, DEFAULT_SCRATCHPAD);
  assert.deepEqual(loadedB.paperReadingStatus, {});
  assert.deepEqual(loadedB.paperNotes, {});

  const resetState = createEmptyWorkspaceState(null);
  assert.equal(resetState.ownerUserId, null);
  assert.equal(resetState.scratchpad, DEFAULT_SCRATCHPAD);
  assert.deepEqual(resetState.paperNotes, {});
  assert.deepEqual(resetState.paperReadingStatus, {});
  assert.deepEqual(resetState.comparisonPaperIds, []);
  assert.deepEqual(resetState.recentlyViewed, []);
  assert.equal(resetState.selectedPaperId, null);
});

test('literature review draft is isolated per user and returns clean defaults when missing', () => {
  const storage = createMemoryStorage();

  const savedA = saveLiteratureDraftForUser(
    USER_A,
    {
      topic: 'User A Graph RAG Synthesis',
      selectedPaperIds: ['paper-a1'],
      sections: [{ title: '1. Overview', content: 'Private User A synthesis text' }],
    },
    storage,
  );
  assert.equal(savedA, true);

  const draftA = loadLiteratureDraftForUser(USER_A, storage);
  assert.equal(draftA.topic, 'User A Graph RAG Synthesis');
  assert.deepEqual(draftA.selectedPaperIds, ['paper-a1']);
  assert.equal(draftA.sections.length, 1);

  const draftB = loadLiteratureDraftForUser(USER_B, storage);
  assert.deepEqual(draftB, createEmptyLiteratureDraft());

  // Unauthenticated draft write is a safe no-op
  assert.equal(saveLiteratureDraftForUser(null, draftA, storage), false);
});

test('legacy unscoped keys are never read, adopted, modified, or deleted by user operations', () => {
  const legacySaved = JSON.stringify([makePaper('legacy-1', 'Legacy Unscoped Paper')]);
  const legacyDraft = JSON.stringify({
    topic: 'Legacy Topic',
    selectedPaperIds: ['legacy-1'],
    sections: [{ title: 'Legacy', content: 'Do not adopt' }],
  });

  const storage = createMemoryStorage({
    researchgraph_saved_papers: legacySaved,
    researchgraph_scratchpad: 'Legacy scratchpad note',
    rg_lit_review_draft: legacyDraft,
    rg_theme: 'dark',
    rg_uiMode: 'expert',
    'sb-project-auth-token': '{"access_token":"secret"}',
  });

  const userAState = loadWorkspaceStateForUser(USER_A, storage);
  assert.deepEqual(userAState.allPapers, []);
  assert.equal(userAState.scratchpad, DEFAULT_SCRATCHPAD);

  const userADraft = loadLiteratureDraftForUser(USER_A, storage);
  assert.deepEqual(userADraft, createEmptyLiteratureDraft());

  // User A edits their own storage and then clears their workspace
  saveWorkspaceSavedPapers(USER_A, [makePaper('paper-a1', 'User A Paper')], ['paper-a1'], storage);
  saveWorkspaceScratchpad(USER_A, 'User A scratchpad', storage);
  saveLiteratureDraftForUser(USER_A, { topic: 'A', selectedPaperIds: [], sections: [] }, storage);

  const removed = clearUserWorkspaceStorage(USER_A, storage);
  assert.deepEqual(removed.sort(), [
    `researchgraph:${USER_A}:literature_review_draft`,
    `researchgraph:${USER_A}:saved_papers`,
    `researchgraph:${USER_A}:scratchpad`,
  ]);

  // Verify legacy keys, global preferences, and Supabase auth token remain untouched
  assert.equal(storage.getItem('researchgraph_saved_papers'), legacySaved);
  assert.equal(storage.getItem('researchgraph_scratchpad'), 'Legacy scratchpad note');
  assert.equal(storage.getItem('rg_lit_review_draft'), legacyDraft);
  assert.equal(storage.getItem('rg_theme'), 'dark');
  assert.equal(storage.getItem('rg_uiMode'), 'expert');
  assert.equal(storage.getItem('sb-project-auth-token'), '{"access_token":"secret"}');
});

test('clearUserWorkspaceStorage deletes only the target user namespace and preserves other users', () => {
  const storage = createMemoryStorage({
    [`researchgraph:${USER_A}:saved_papers`]: JSON.stringify([makePaper('a1', 'Paper A')]),
    [`researchgraph:${USER_A}:scratchpad`]: 'Scratch A',
    [`researchgraph:${USER_B}:saved_papers`]: JSON.stringify([makePaper('b1', 'Paper B')]),
    [`researchgraph:${USER_B}:scratchpad`]: 'Scratch B',
    rg_theme: 'light',
    rg_uiMode: 'simple',
    'sb-demo-auth-token': 'supabase-session',
  });

  clearUserWorkspaceStorage(USER_A, storage);

  assert.equal(storage.getItem(`researchgraph:${USER_A}:saved_papers`), null);
  assert.equal(storage.getItem(`researchgraph:${USER_A}:scratchpad`), null);
  assert.ok(storage.getItem(`researchgraph:${USER_B}:saved_papers`) !== null);
  assert.equal(storage.getItem(`researchgraph:${USER_B}:scratchpad`), 'Scratch B');
  assert.equal(storage.getItem('rg_theme'), 'light');
  assert.equal(storage.getItem('rg_uiMode'), 'simple');
  assert.equal(storage.getItem('sb-demo-auth-token'), 'supabase-session');
});

test('corrupt JSON and unavailable storage fail safely without throwing', () => {
  const corruptStorage = createMemoryStorage({
    [`researchgraph:${USER_A}:saved_papers`]: '{corrupt-json',
    [`researchgraph:${USER_A}:literature_review_draft`]: 'not json [',
    [`researchgraph:${USER_A}:reading_status`]: '{"p1":"invalid_status"}',
    [`researchgraph:${USER_A}:paper_notes`]: '["not-a-record"]',
  });

  const loaded = loadWorkspaceStateForUser(USER_A, corruptStorage);
  assert.deepEqual(loaded.allPapers, []);
  assert.deepEqual(loaded.paperReadingStatus, {});
  assert.deepEqual(loaded.paperNotes, {});
  assert.deepEqual(loadLiteratureDraftForUser(USER_A, corruptStorage), createEmptyLiteratureDraft());

  const throwingStorage: StorageLike = {
    get length() {
      return 1;
    },
    key() {
      throw new Error('SecurityError');
    },
    getItem() {
      throw new Error('SecurityError');
    },
    setItem() {
      throw new Error('QuotaExceededError');
    },
    removeItem() {
      throw new Error('SecurityError');
    },
  };

  assert.equal(readUserStorageString(USER_A, 'scratchpad', throwingStorage), null);
  assert.equal(writeUserStorageString(USER_A, 'scratchpad', 'note', throwingStorage), false);
  assert.deepEqual(readUserStorageJson(USER_A, 'saved_papers', [], undefined, throwingStorage), []);
  assert.equal(writeUserStorageJson(USER_A, 'saved_papers', [], throwingStorage), false);
  assert.deepEqual(clearUserWorkspaceStorage(USER_A, throwingStorage), []);
});
