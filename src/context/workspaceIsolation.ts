import type { ChatMessage, PageType, Paper } from '../types';
import {
  normalizeAuthenticatedUserId,
  readUserStorageJson,
  readUserStorageString,
  resolveBrowserStorage,
  writeUserStorageJson,
  writeUserStorageString,
  type StorageLike,
} from '../lib/userStorage.ts';

export type ReadingStatus = 'to_read' | 'reading' | 'completed';

export interface LiteratureReviewSection {
  title: string;
  content: string;
}

export interface LiteratureDraftData {
  topic: string;
  selectedPaperIds: string[];
  sections: LiteratureReviewSection[];
}

export interface WorkspaceState {
  ownerUserId: string | null;
  activePage: PageType;
  searchQuery: string;
  allPapers: Paper[];
  chatMessages: ChatMessage[];
  savedPaperIds: string[];
  selectedPaperId: string | null;
  recentlyViewed: string[];
  paperReadingStatus: Record<string, ReadingStatus>;
  paperNotes: Record<string, string>;
  comparisonPaperIds: string[];
  activeProject: string;
  scratchpad: string;
  chatScope: string;
}

export const DEFAULT_SCRATCHPAD = `# Working Hypothesis
- Capture your active research questions, comparisons, and experiment notes here.

# Key References To Revisit:
- Add papers from Research Search to keep them in your workspace index.`;

const DEFAULT_WELCOME_MESSAGE_CONTENT =
  'Ask a question about papers you have added to the research index. Answers use retrieved passages and show the source paper and page when available.';

export const CLEAR_CHAT_MESSAGE_CONTENT =
  'Chat cleared. Add open-access papers from Research Search to the index, then ask a question grounded in their passages.';

export function createWelcomeChatMessage(
  content: string = DEFAULT_WELCOME_MESSAGE_CONTENT,
  timestamp: string = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
): ChatMessage {
  return {
    id: 'welcome',
    sender: 'assistant',
    content,
    timestamp,
  };
}

export function createEmptyWorkspaceState(
  ownerUserId: string | null = null,
): WorkspaceState {
  return {
    ownerUserId: normalizeAuthenticatedUserId(ownerUserId),
    activePage: 'dashboard',
    searchQuery: '',
    allPapers: [],
    chatMessages: [createWelcomeChatMessage()],
    savedPaperIds: [],
    selectedPaperId: null,
    recentlyViewed: [],
    paperReadingStatus: {},
    paperNotes: {},
    comparisonPaperIds: [],
    activeProject: 'Research workspace',
    scratchpad: DEFAULT_SCRATCHPAD,
    chatScope: 'all',
  };
}

function isPaperArray(parsed: unknown): parsed is Paper[] {
  return (
    Array.isArray(parsed) &&
    parsed.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string' &&
        typeof (item as { title?: unknown }).title === 'string',
    )
  );
}

function isReadingStatusMap(
  parsed: unknown,
): parsed is Record<string, ReadingStatus> {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return false;
  }
  return Object.values(parsed as Record<string, unknown>).every(
    (value) => value === 'to_read' || value === 'reading' || value === 'completed',
  );
}

function isStringRecord(parsed: unknown): parsed is Record<string, string> {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return false;
  }
  return Object.values(parsed as Record<string, unknown>).every(
    (value) => typeof value === 'string',
  );
}

export function loadWorkspaceStateForUser(
  userId: string | null | undefined,
  storage: StorageLike | null = resolveBrowserStorage(),
): WorkspaceState {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return createEmptyWorkspaceState(null);
  }

  const savedPapers = readUserStorageJson<Paper[]>(
    normalizedUserId,
    'saved_papers',
    [],
    isPaperArray,
    storage,
  );
  const scratchpad = readUserStorageString(
    normalizedUserId,
    'scratchpad',
    storage,
  );
  const paperReadingStatus = readUserStorageJson<Record<string, ReadingStatus>>(
    normalizedUserId,
    'reading_status',
    {},
    isReadingStatusMap,
    storage,
  );
  const paperNotes = readUserStorageJson<Record<string, string>>(
    normalizedUserId,
    'paper_notes',
    {},
    isStringRecord,
    storage,
  );

  return {
    ...createEmptyWorkspaceState(normalizedUserId),
    allPapers: savedPapers,
    savedPaperIds: savedPapers.map((paper) => paper.id),
    scratchpad: scratchpad !== null ? scratchpad : DEFAULT_SCRATCHPAD,
    paperReadingStatus,
    paperNotes,
  };
}

export function saveWorkspaceSavedPapers(
  userId: string | null | undefined,
  allPapers: Paper[],
  savedPaperIds: string[],
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return false;
  }
  const savedSet = new Set(savedPaperIds);
  const savedPapers = allPapers.filter((paper) => savedSet.has(paper.id));
  return writeUserStorageJson(normalizedUserId, 'saved_papers', savedPapers, storage);
}

export function saveWorkspaceScratchpad(
  userId: string | null | undefined,
  scratchpad: string,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return false;
  }
  return writeUserStorageString(normalizedUserId, 'scratchpad', scratchpad, storage);
}

export function saveWorkspaceReadingStatus(
  userId: string | null | undefined,
  paperReadingStatus: Record<string, ReadingStatus>,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return false;
  }
  return writeUserStorageJson(normalizedUserId, 'reading_status', paperReadingStatus, storage);
}

export function saveWorkspacePaperNotes(
  userId: string | null | undefined,
  paperNotes: Record<string, string>,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return false;
  }
  return writeUserStorageJson(normalizedUserId, 'paper_notes', paperNotes, storage);
}

export function createEmptyLiteratureDraft(): LiteratureDraftData {
  return {
    topic: '',
    selectedPaperIds: [],
    sections: [],
  };
}

function isLiteratureDraftData(parsed: unknown): parsed is Partial<LiteratureDraftData> {
  return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
}

export function loadLiteratureDraftForUser(
  userId: string | null | undefined,
  storage: StorageLike | null = resolveBrowserStorage(),
): LiteratureDraftData {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return createEmptyLiteratureDraft();
  }

  const parsed = readUserStorageJson<Partial<LiteratureDraftData>>(
    normalizedUserId,
    'literature_review_draft',
    {},
    isLiteratureDraftData,
    storage,
  );

  const topic = typeof parsed.topic === 'string' ? parsed.topic : '';
  const selectedPaperIds = Array.isArray(parsed.selectedPaperIds)
    ? parsed.selectedPaperIds.filter((id): id is string => typeof id === 'string')
    : [];
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.filter(
        (section): section is LiteratureReviewSection =>
          typeof section === 'object' &&
          section !== null &&
          typeof (section as { title?: unknown }).title === 'string' &&
          typeof (section as { content?: unknown }).content === 'string',
      )
    : [];

  return {
    topic,
    selectedPaperIds,
    sections,
  };
}

export function saveLiteratureDraftForUser(
  userId: string | null | undefined,
  draft: LiteratureDraftData,
  storage: StorageLike | null = resolveBrowserStorage(),
): boolean {
  const normalizedUserId = normalizeAuthenticatedUserId(userId);
  if (!normalizedUserId) {
    return false;
  }
  return writeUserStorageJson(
    normalizedUserId,
    'literature_review_draft',
    {
      topic: draft.topic,
      selectedPaperIds: draft.selectedPaperIds,
      sections: draft.sections,
    },
    storage,
  );
}
