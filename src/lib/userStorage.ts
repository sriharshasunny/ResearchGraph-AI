export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export type UserStorageResource =
  | 'saved_papers'
  | 'scratchpad'
  | 'literature_review_draft'
  | 'reading_status'
  | 'paper_notes'
  | 'comparison_papers'
  | 'active_project'
  | 'chat_scope';

export const USER_STORAGE_NAMESPACE = 'researchgraph';

export const LEGACY_UNSCOPED_STORAGE_KEYS = [
  'researchgraph_saved_papers',
  'researchgraph_scratchpad',
  'rg_lit_review_draft',
] as const;

export const GLOBAL_PREFERENCE_STORAGE_KEYS = [
  'rg_theme',
  'rg_uiMode',
] as const;

const SAFE_USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeAuthenticatedUserId(userId: string | null | undefined): string | null {
  if (typeof userId !== 'string') {
    return null;
  }
  const trimmed = userId.trim();
  if (!trimmed || !SAFE_USER_ID_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function getUserStoragePrefix(userId: string | null | undefined): string | null {
  const normalized = normalizeAuthenticatedUserId(userId);
  return normalized ? `${USER_STORAGE_NAMESPACE}:${normalized}:` : null;
}

export function getUserStorageKey(
  userId: string | null | undefined,
  resource: UserStorageResource,
): string | null {
  const prefix = getUserStoragePrefix(userId);
  return prefix ? `${prefix}${resource}` : null;
}

export function resolveBrowserStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function readUserStorageString(
  userId: string | null | undefined,
  resource: UserStorageResource,
  storage: StorageLike | null = resolveBrowserStorage(),
): string | null {
  const key = getUserStorageKey(userId, resource);
  if (!key || !storage) {
    return null;
  }
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeUserStorageString(
  userId: string | null | undefined,
  resource: UserStorageResource,
  value: string,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  const key = getUserStorageKey(userId, resource);
  if (!key || !storage) {
    return false;
  }
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function readUserStorageJson<T>(
  userId: string | null | undefined,
  resource: UserStorageResource,
  fallback: T,
  validate?: (parsed: unknown) => parsed is T,
  storage: StorageLike | null = resolveBrowserStorage(),
): T {
  const raw = readUserStorageString(userId, resource, storage);
  if (raw === null) {
    return fallback;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (validate) {
      return validate(parsed) ? parsed : fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeUserStorageJson(
  userId: string | null | undefined,
  resource: UserStorageResource,
  value: unknown,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  try {
    return writeUserStorageString(userId, resource, JSON.stringify(value), storage);
  } catch {
    return false;
  }
}

export function clearUserWorkspaceStorage(
  userId: string | null | undefined,
  storage: StorageLike | null = resolveBrowserStorage(),
): string[] {
  const prefix = getUserStoragePrefix(userId);
  if (!prefix || !storage) {
    return [];
  }

  const keysToRemove: string[] = [];
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      storage.removeItem(key);
    }
  } catch {
    return keysToRemove;
  }
  return keysToRemove;
}
