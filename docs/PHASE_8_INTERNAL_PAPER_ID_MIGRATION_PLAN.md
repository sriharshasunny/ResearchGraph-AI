# Phase 8.0 — Internal Paper UUID and External Identifier Migration Plan

**Status:** Plan Only (No Implementation)  
**Repository:** `sriharshasunny/ResearchGraph-AI`  
**Branch:** `feature/unified-workspace-rag-kg`  
**Baseline Commit Audited:** `4ce2816dceecaaf5b5da230fe6605b95462b8cb3`

---

## 1. Executive Summary

ResearchGraph AI currently uses **external provider strings**—specifically canonical OpenAlex URLs (`https://openalex.org/W...`), arXiv IDs (`arxiv:1706.03762`), or raw search-result IDs—as the primary `paper_id` across FastAPI endpoints, SQLite ingestion status rows, ChromaDB vector metadata and chunk IDs, Neo4j `:Paper` node keys and evidence relationships, and React `AppContext` + per-user `localStorage`.

Meanwhile, the Supabase Postgres database already contains the unified six-table schema (`supabase/migrations/20261125171558_unified_research_data_model.sql` and `20261125171721_restrict_authenticated_table_privileges.sql`), where `public.papers.id` is an internal `uuid` and external identifiers live as aliases in `public.paper_identifiers`. However, **none of the active runtime backend or frontend flows currently read or write those Postgres tables**.

Moving to internal paper UUIDs solves three structural limitations:
1. **Cross-provider aliasing:** One paper discovered via OpenAlex (`W2626778328`), DOI (`10.48550/arXiv.1706.03762`), or arXiv (`arxiv:1706.03762`) resolves to a single user-owned internal `papers.id` UUID instead of bifurcating chunks, graph nodes, and ingestion status.
2. **Future private uploads & workspace unification:** Uploaded PDFs or non-indexed manuscripts receive a first-class internal UUID without requiring an OpenAlex or arXiv ID.
3. **Referential ownership integrity:** Every paper-scoped record (`paper_identifiers`, `workspace_papers`, `paper_assets`, `paper_ingestion_status`, Chroma metadata, Neo4j `:Paper` nodes) binds cleanly to `(owner_id, paper_id)` via database constraints and owner-scoped storage keys.

This plan specifies a zero-data-loss, backwards-compatible, five-stage migration (**Stages 8A–8E**) with strict owner isolation, non-destructive handling of legacy data, and explicit acceptance criteria per stage.

---

## 2. Current Architecture Findings

Verified directly against branch `feature/unified-workspace-rag-kg` (`4ce2816dceecaaf5b5da230fe6605b95462b8cb3`):

- **Authentication & Route Security (Implemented in Phases 1–4):**
  - `src/context/AuthContext.tsx` manages Supabase browser sessions.
  - `src/services/api.ts` (`backendRequest()`) attaches `Authorization: Bearer <access_token>` from `supabase.auth.getSession()`.
  - `backend/auth.py` verifies `ES256`/`RS256` JWTs locally via Supabase JWKS (`leeway=0`, strict `exp`/`iat`/`sub`/`aud`/`iss`/`role` validation) and legacy `HS256` tokens remotely via `${SUPABASE_URL}/auth/v1/user` using `SUPABASE_PUBLISHABLE_KEY`. No `SUPABASE_SERVICE_ROLE_KEY` is currently configured or referenced in Python code.
  - `backend/main.py` protects every private and placeholder endpoint via `Depends(get_current_user)` while keeping `/`, `/api/health`, and `/api/search` public.
- **Per-User Frontend Isolation (Implemented in Phase 2):**
  - `src/lib/userStorage.ts` and `src/context/workspaceIsolation.ts` scope browser workspace persistence under `researchgraph:<user_id>:*`.
  - `AppContext` (`src/context/AppContext.tsx`) resets private in-memory state on user changes/logout and never reads legacy unscoped keys.
- **Data Store Owner Isolation (Implemented in Phase 5):**
  - `backend/pipeline.py` enforces non-empty `owner_id` across SQLite `paper_statuses`, ChromaDB chunk writes/queries (`owner_id` + `paper_id` filters + post-validation), and Neo4j writes/reads (`owner_id`-scoped node keys, node/relationship `owner_id`, and post-validation).
- **What Does NOT Exist Yet (Verified Absent):**
  - No Postgres/PostgREST repository client in `backend/` (no `supabase-py` or `psycopg` dependency in `backend/requirements.txt`).
  - No reads/writes to Supabase `workspaces`, `papers`, `paper_identifiers`, `workspace_papers`, `paper_assets`, or `paper_ingestion_status`.
  - No identifier resolver normalizing DOIs/PMIDs/PMCIDs/ISBNs or mapping multiple external IDs to one canonical `papers.id`.
  - Frontend `Paper.id` is still populated directly from OpenAlex work URLs or backend provider IDs (`src/services/api.ts`, `src/features/search/SearchPage.tsx`).

---

## 3. Current External-ID Dependency Map

Every observed location where external provider identifiers are treated as permanent primary paper IDs:

| # | Area | Exact File & Function / Symbol | Current External-ID Usage | Impact of UUID Migration |
|---|---|---|---|---|
| 1 | **Metadata retrieval & normalization** | `backend/pipeline.py`: `_normalize_openalex()`, `_arxiv_metadata()`, `get_paper_metadata()` | Sets normalized `"id"` to `work.get("id")` (OpenAlex URL) or `f"arxiv:{arxiv_id}"`. `get_paper_metadata()` branches strictly on `_arxiv_metadata()` vs `_openalex_id()`. | Must separate canonical internal `paper_id` (`uuid`) from provider record `"external_id"` / identifier list; `get_paper_metadata()` cannot assume a bare UUID is an OpenAlex/DOI/arXiv string. |
| 2 | **Paper search results** | `src/services/api.ts`: `toPaper()`, `searchPapers()`; `backend/pipeline.py`: `search_openalex()` | Sets frontend `Paper.id = work.id` (`https://openalex.org/W...`) directly from OpenAlex search response; sets `Paper.doi` stripped of `https://doi.org/`. | Public OpenAlex search results do **not** yet have a ResearchGraph internal UUID until resolved/persisted in the user's library/backend. |
| 3 | **DOI and arXiv resolution** | `backend/pipeline.py`: `_openalex_id()`, `_arxiv_metadata()`, `ARXIV_RE` | Converts `W\d+` -> `https://openalex.org/W...`; converts `10.*` or `https://doi.org/*` -> `${OPENALEX}/https://doi.org/...`; converts arXiv IDs -> `arxiv:<id>`. Note `_arxiv_metadata()` captures `v\d+` directly in `canonical = f"arxiv:{arxiv_id}"`, so `arXiv:1706.03762` and `arXiv:1706.03762v7` resolve to **two different IDs**. | Needs dedicated pure normalization (`identifier_type`, `normalized_value`, `original_value`) and explicit arXiv version policy before DB resolution. |
| 4 | **Ingestion initiation & retries** | `backend/main.py`: `IngestRequest`, `ingest()`; `backend/pipeline.py`: `start_ingestion()`, `ingest_paper()`; `src/features/search/SearchPage.tsx`: `startIngestion()`, polling `useEffect` | `POST /api/papers/ingest` takes `{"paper_id": external_id}` (`1..500` chars), passes `request.paper_id` to `start_ingestion(user_id, paper_id)` and `ingest_paper(user_id, paper_id)`. Inside `ingest_paper()`, `_save_status` writes initial status under `paper_id` and records `canonical_paper_id = metadata["id"]` when redirected/canonicalized; `SearchPage.tsx` polls `getPaperIngestionStatus(current.canonical_paper_id || id)`. | Resolver must resolve external ID (or accept existing owner internal UUID) -> internal UUID **before** queueing background ingestion, and return `paper_id` (internal UUID) + `external_id` / `canonical_paper_id` so UI keys and status polling track consistently. |
| 5 | **SQLite ingestion status** | `backend/pipeline.py`: `_status_conn()`, `_save_status()`, `get_ingestion_status()`, `paper_statuses` table | `PRIMARY KEY (owner_id, paper_id)` stores `paper_id` as external provider string (`https://openalex.org/...` or `arxiv:...`) inside `status.sqlite3`. `backend/main.py`: `paper_status_by_id()`, `paper_status()`. | Must transition `paper_id` to internal paper UUID string (and later transition to Supabase `paper_ingestion_status` in a later phase; in Phase 8C SQLite can key by internal UUID during transition). |
| 6 | **ChromaDB chunk metadata & IDs** | `backend/pipeline.py`: `_chunks()`, `ingest_paper()` (`abstract_only`), `_index_chunks()`, `_query_chunks()`, `get_paper_chunks()` | `_chunks()` hashes `f"{owner_id}\|{metadata['id']}\|{page}\|{start}\|{body}"`; `abstract_only` hashes `f"{owner_id}\|{canonical}\|abstract\|{abstract}"`. Stores `metadata["paper_id"] = canonical_external_id`. `_query_chunks()` filters `{"$and": [{"owner_id": owner_id}, {"paper_id": {"$in": allowed_paper_ids}}]}`. `get_paper_chunks()` filters `paper_id`. | Once switched to internal UUID, `paper_id` metadata and chunk SHA-256 input change, meaning existing owner-scoped Chroma vectors keyed by external ID will not match UUID queries unless mapped/re-indexed or explicitly queried during dual-read backfill. |
| 7 | **Neo4j paper keys & relationships** | `backend/pipeline.py`: `_extract_graph()`, `_scoped_graph_key()`, `_write_graph()` | Sets `paper_key = _scoped_graph_key(owner_id, "Paper", metadata["id"])` where `metadata["id"]` is the external ID. Stores `p.paper_id = external_id` and `r.paper_id = external_id`. Evidence ID hashes `f"{owner_id}\|{paper_id}\|..."`. | `_scoped_graph_key(owner_id, "Paper", internal_uuid)` creates a distinct Neo4j node key; backfill or dual-lookup mapping `(owner_id, external_id) -> internal_uuid` is required for continuity. |
| 8 | **RAG retrieval & citations** | `backend/pipeline.py`: `query_research()`, `_query_chunks()`, `_query_graph()`; `backend/main.py`: `RagRequest`, `rag()`, `legacy_chat()`; `src/features/chat/ChatPage.tsx`: `handleSendMessage()`, `contextPaperIds`, citations | `RagRequest.paper_ids` receives external IDs from `ChatPage.tsx` (`selectedPaperId`, `allPapers.id`). Citations return `citation["paper_id"]` (from Chroma metadata) -> mapped in `ChatPage.tsx` (`id: citation.paper_id`) -> `handleOpenSource(paperId)` -> `setSelectedPaperId(paperId)`. | RAG `paper_ids` and returned `citations[].paper_id` must align: during compatibility mode, backend can accept external IDs or internal UUIDs, resolve allowed IDs to internal UUIDs (or both mapped during transition), and include `paper_id` (UUID) + external citation identifiers (`doi`, `url`). |
| 9 | **Graph retrieval** | `backend/pipeline.py`: `get_graph()`, `get_graph_for_paper()`, `get_graph_search()`; `backend/main.py`: `/api/graph`, `/api/graph/paper`, `/api/graph/paper/{paper_id:path}`, `/api/graph/search`; `src/features/graph/KnowledgeGraphPage.tsx`; `src/features/details/PaperDetailsPage.tsx` | Graph nodes emit `paperId: item.get("paper_id")` (external ID). Clicking "Open Paper" in `KnowledgeGraphPage.tsx` (line 422–423) passes `selectedNodeData.paperId` to `setSelectedPaperId()` -> `PaperDetailsPage` calls `getPaperDetails(selectedPaperId)` and `getPaperGraph(selectedPaperId)`. | `Paper` node `paperId` and `/api/graph/paper` lookup must accept internal UUIDs (with external fallback during compatibility) so `Open Paper` in Knowledge Graph resolves both saved papers and graph metadata. |
| 10 | **Frontend selected, saved, compared & recent papers** | `src/types/index.ts` (`Paper.id`, `ChatMessage`); `src/context/AppContext.tsx`; `src/features/saved/SavedPage.tsx`; `src/features/compare/ComparePage.tsx`; `src/features/dashboard/Dashboard.tsx`; `src/features/details/PaperDetailsPage.tsx` | `savedPaperIds: string[]`, `selectedPaperId: string \| null`, `recentlyViewed: string[]`, `comparisonPaperIds: string[]`, `paperReadingStatus: Record<string, ReadingStatus>`, `paperNotes: Record<string, string>` all join strictly on `paper.id` (which is currently the external OpenAlex/arXiv ID!). Also `ChatPage.tsx` (`+ Compare` compares `src.id` with `comparisonPaperIds`). | `Paper` interface must distinguish ephemeral search ID vs canonical `internalPaperId` (or resolve before persistence) so saving/comparing/annotating works across search, chat citations, and graph nodes without breaking existing `p1`/external IDs in user `localStorage`. |
| 11 | **User-scoped `localStorage` data** | `src/lib/userStorage.ts`; `src/context/workspaceIsolation.ts` | Stores `researchgraph:<user_id>:saved_papers`, `reading_status`, `paper_notes`, `literature_review_draft` (`selectedPaperIds`), all keyed by old `Paper.id` strings. | Existing saved papers for authenticated users in `localStorage` already carry external IDs (`https://openalex.org/W...`, etc.). Migration Stage 8E must preserve and resolve them non-destructively rather than dropping unresolved items. |
| 12 | **API request & response contracts** | `backend/main.py`; `src/services/api.ts`: `ingestPaper()`, `getPaperIngestionStatus()`, `getPaperDetails()`, `askResearchQuestion()`, `getPaperGraph()`, `getResearchGraph()`, `searchGraph()` | Path/query/body params (`id`, `paper_id`, `paper_ids`) currently assume a single string space (`1..500` chars). `GET /api/paper` and `GET /api/papers/{paper_id:path}` call `get_paper_metadata()` directly (OpenAlex/arXiv only), failing with 404 if passed an internal UUID! | Must distinguish internal UUID inputs from external identifiers cleanly so passing a UUID never gets routed into OpenAlex/DOI lookup and returns 404 incorrectly. |

---

## 4. Existing Database Model Assessment

Inspected `supabase/migrations/20261125171558_unified_research_data_model.sql` and `20261125171721_restrict_authenticated_table_privileges.sql`:

### What Already Fits the Target Architecture Well
- `public.papers`: `id uuid primary key default gen_random_uuid()`, `owner_id uuid not null references auth.users(id) on delete cascade`, composite unique constraint `papers_owner_id_id_key unique (owner_id, id)`, `source_provider`, `access_type`, `metadata jsonb`, `updated_at` trigger.
- `public.paper_identifiers`: `id uuid primary key`, `(owner_id, paper_id)` composite FK referencing `public.papers (owner_id, id) on delete cascade`, `identifier_type` check (`'doi', 'openalex', 'arxiv', 'pmid', 'pmcid', 'isbn', 'other'`), `original_value`, `normalized_value`, `source_provider`, `is_primary`, and **`constraint paper_identifiers_unique_per_owner unique (owner_id, identifier_type, normalized_value)`**.
- `public.paper_ingestion_status`: `primary key (owner_id, paper_id)`, composite FK `(owner_id, paper_id) -> public.papers (owner_id, id) on delete cascade`.
- `public.workspace_papers` & `public.paper_assets`: both bind `(owner_id, paper_id)` cleanly via composite FKs, preventing cross-owner attachments.
- RLS and minimal role grants (`anon` revoked; `authenticated` restricted to `SELECT/INSERT/DELETE` + `UPDATE` where intended).

### Schema & Contract Gaps Identified for Future Phases
1. **Multiple `is_primary = true` identifiers per paper:** `paper_identifiers` has a boolean `is_primary` column, but no partial unique index (`unique (owner_id, paper_id) where is_primary`) or `(owner_id, paper_id, identifier_type)` constraint preventing accidental duplicate primary flags if desired. *(Non-blocking for Stage 8B if enforced in resolver logic, or optional small additive index later.)*
2. **Optional `error_message` vs `message` parity in `paper_ingestion_status`:** Current SQLite status payloads return `"message"` (human summary, e.g., `"Full text, semantic index, and evidence-backed graph are ready."`) and `"error"`, whereas `paper_ingestion_status` has `error_message text` and no `message` column. Stage 8C must define whether `message` is derived by status enum in the backend API or added to `paper_ingestion_status` in an explicit future migration.
3. **Resolving without a Supabase service dependency installed:** `backend/requirements.txt` currently has no `supabase` or `psycopg` library; Stage 8B must add the chosen server client (`httpx`/`requests` to PostgREST with user JWT, `psycopg`, or pinned `supabase` package) cleanly.

---

## 5. Target Internal / External Identity Contract

### A. Internal Identity Rules
1. `papers.id` (`uuid`) is the permanent, immutable ResearchGraph paper identity for a specific user's library entry (`(owner_id, id)`).
2. All database foreign keys (`paper_identifiers.paper_id`, `workspace_papers.paper_id`, `paper_assets.paper_id`, `paper_ingestion_status.paper_id`) store internal paper UUIDs.
3. ChromaDB chunk metadata `paper_id` stores the internal paper UUID string (`str(paper_uuid)`), and chunk IDs include `owner_id` and internal `paper_uuid`.
4. Neo4j `:Paper` (`:ResearchEntity:Paper`) `paper_id` property, `:Paper` scoped `key` (`_scoped_graph_key(owner_id, "Paper", str(paper_uuid))`), and evidence relationship `paper_id` store the internal paper UUID string.
5. `paper_ingestion_status` (and transitional SQLite `paper_statuses`) keys rows by `(owner_id, str(paper_uuid))`.
6. External identifiers (`https://openalex.org/W...`, `10.xxxx/...`, `arxiv:...`) are **never** used as internal database primary keys.

### B. External Identifier Rules
1. `public.paper_identifiers` stores all known external aliases pointing to a user's `papers.id`.
2. Each row records `owner_id`, `paper_id`, `identifier_type`, `original_value`, `normalized_value`, `source_provider`, and `is_primary`.
3. Every lookup and uniqueness check is strictly scoped by `owner_id`. Two authenticated users (User A and User B) resolving the exact same DOI receive **two distinct** owner-scoped `papers.id` UUIDs.
4. Multiple external identifiers (e.g., an `openalex` ID and a `doi` and an `arxiv` ID) may resolve to the same canonical `papers.id` for a given `owner_id`.
5. Constraint `paper_identifiers_unique_per_owner` guarantees one `(owner_id, identifier_type, normalized_value)` tuple can never map to two different papers.

### C. Idempotent, Concurrency-Safe Identity Resolver
Given `(owner_id, external_identifiers[], paper_metadata)`:

1. **Validate inputs:** Reject empty `owner_id` and normalize all supplied `(identifier_type, raw_value)` candidates; fail fast on invalid formats.
2. **Lookup existing owner-scoped aliases:** Query `paper_identifiers` where `owner_id = authenticated_owner_id` matching any `(identifier_type, normalized_value)` in the candidate set.
3. **Conflict check before writing:**
   - If all matched alias rows point to **one single `paper_id`**, reuse that `paper_id` and insert any newly discovered secondary aliases (`ON CONFLICT (owner_id, identifier_type, normalized_value) DO NOTHING`, then re-verify matched `paper_id`).
   - If two supplied aliases in the same request point to **two different existing `paper_id`s** (for example, `openalex:W1` maps to `UUID_1` and `doi:10.1/x` maps to `UUID_2`), **do NOT silently merge** `UUID_1` and `UUID_2`. Return an explicit HTTP `409 Conflict` error (`IdentifierConflictError`) containing both paper IDs and the conflicting aliases so a later explicit user-confirmed merge workflow can handle it safely.
   - **Never merge two existing `papers` rows on title/author similarity alone.**
4. **Atomic creation for new papers & concurrency handling:**
   - If zero existing alias rows match, execute inside a single transaction (or PostgreSQL RPC / serialized retry loop):
     1. Insert row into `public.papers (owner_id, title, abstract, publication_year, venue, source_provider, source_url, pdf_url, open_access, access_type, metadata)`.
     2. Insert primary and secondary rows into `public.paper_identifiers`.
   - **Race-condition safety (two concurrent requests for the same unindexed DOI by the same user):**
     - If Transaction B hits `unique_violation` (`23505`) on `paper_identifiers_unique_per_owner`, Transaction B **rolls back** its uncommitted `papers` insert cleanly (leaving zero orphaned `papers` rows) and re-queries `paper_identifiers` for `(owner_id, identifier_type, normalized_value)` to return the winning `paper_id` created by Transaction A.
     - Note: With raw PostgREST calls lacking multi-statement transaction rollback, creating `papers` then `paper_identifiers` across two separate HTTP requests would risk orphaned `papers` rows on race collisions unless wrapped in a Postgres SQL function / transactional connection (`psycopg`). This directly drives the Stage 8B backend Postgres strategy recommendation in Section 10.

---

## 6. Identifier Normalization Rules and Unresolved Decisions

Every normalizer must preserve `original_value` (trimmed input string as received from user/provider, capped at 1000 chars per DB check constraint) and compute canonical `normalized_value`:

| Identifier Type | Accepted Input Examples | Proposed Normalization Rule | Example `normalized_value` | Validation |
|---|---|---|---|---|
| `doi` | `10.48550/arXiv.1706.03762`, `doi:10.48550/ARXIV.1706.03762`, `https://doi.org/10.48550/arXiv.1706.03762` | Strip URL prefixes (`https://doi.org/`, `http://doi.org/`, `https://dx.doi.org/`, `doi:`), URL-decode percent escapes, trim whitespace, lowercase ASCII (`10.\d{4,9}/\S+`). | `10.48550/arxiv.1706.03762` | Must start with `10.` and contain `/`. |
| `openalex` | `W2626778328`, `w2626778328`, `https://openalex.org/W2626778328`, `https://api.openalex.org/works/W2626778328` | Extract canonical Work ID (`W` + digits), uppercase `W`. **Finalized in Stage 8A:** `normalized_value` is bare `W<digits>` (`W2626778328`) while preserving exact input URL/ID in `original_value`. | `W2626778328` | Regex `^W\d+$`. |
| `arxiv` | `1706.03762`, `arXiv:1706.03762`, `1706.03762v7`, `https://arxiv.org/abs/1706.03762v7`, `https://arxiv.org/pdf/1706.03762.pdf`, `hep-th/9901001v2`, `math.AG/9901001v2`, `nlin.CD/0501001` | Strip `arxiv:` prefix, `arxiv.org/abs/` or `/pdf/` URL wrapper, trailing `.pdf`, and version suffix (`v\d+`); lowercase legacy archive/category names (`math.ag/9901001`). | `1706.03762` | Modern `\d{4}\.\d{4,5}` or legacy archive/7-digits with optional valid version `[1-9]\d*`. |
| `pmid` | `31452104`, `pmid:31452104`, `https://pubmed.ncbi.nlm.nih.gov/31452104/` | Strip `pmid:` prefix and PubMed URL path, strip whitespace, validate positive integer digits. | `31452104` | Regex `^[1-9]\d{0,15}$`. |
| `pmcid` | `PMC6712345`, `pmc6712345`, `https://pmc.ncbi.nlm.nih.gov/articles/PMC6712345/` | Strip prefix/URL, trim, uppercase `PMC` prefix + digits. | `PMC6712345` | Regex `^PMC[1-9]\d*$`. |
| `isbn` | `978-0-306-40615-7`, `0-8044-2957-X`, `ISBN:080442957x` | Strip `isbn:` prefix and hyphens/spaces, uppercase trailing `X`, validate ISBN-10 / ISBN-13 check digits, and convert valid ISBN-10 to canonical 13-digit ISBN-13 while preserving `original_value`. | `9780804429573` | Valid 10-char or 13-char ISBN checksum. |
| `other` | Provider-specific opaque ID (only when `identifier_type="other"` explicitly) | Trim surrounding whitespace, preserve case and opaque contents, reject control characters and lengths > 1000. | (trimmed string) | Non-empty `1..1000` chars; never auto-inferred on fallback. |

### Finalized Stage 8A arXiv Version & OpenAlex Decisions
1. **arXiv Version Stripping (`Final Decision`):** `normalize_arxiv()` strips `v<n>` from `normalized_value` (`1706.03762v5`, `1706.03762v7` -> `1706.03762`) and preserves the exact trimmed input in `original_value`.
   - **Schema limitation documented:** Because `paper_identifiers` enforces `unique (owner_id, identifier_type, normalized_value)`, `paper_identifiers` can retain only **one row** per `(owner_id, 'arxiv', normalized_value)` — so it cannot store every historical version string on its own if the same user later submits both `v5` and `v7`. Stage 8B must preserve additional observed arXiv versions inside `papers.metadata` (e.g., an `arxiv_versions` list) or a dedicated version-history structure.
2. **OpenAlex Canonical Format (`Final Decision`):** `normalize_openalex()` uses compact bare `W<digits>` (`W2626778328`) as `normalized_value`, keeping resolver URLs intact in `original_value`.
3. **Auto-Detection (`Final Decision`):** `parse_external_identifier()` detects canonical hyphenated UUIDs first, accepts unambiguous typed/prefixed/URL identifiers, rejects bare ambiguous numeric strings (such as bare PMID vs ISBN), and never falls back silently to `"other"`.

---

## 7. Proposed API Compatibility Design

Clients currently pass external IDs everywhere (`GET /api/paper?id=...`, `POST /api/papers/ingest`, `GET /api/paper-status`, `/api/rag/query`, `/api/graph/paper`). During Stages 8C–8E we must preserve backwards compatibility without ever passing an internal UUID to OpenAlex or arXiv!

### Disambiguation Rule
Before calling OpenAlex/DOI/arXiv metadata fetchers, inspect whether the incoming identifier parses as a strict RFC 4122 **UUID** (`uuid.UUID(value)`):
- **If it IS a valid UUID:** Look up the paper strictly in the authenticated user's `papers` / `paper_ingestion_status` / Chroma / Neo4j stores where `owner_id = user_id AND id = paper_uuid`. **Never** pass an internal UUID to `_openalex_id()` or `_arxiv_metadata()`. Return `404` if not owned by the caller.
- **If it is NOT a UUID:** Treat it as an external identifier (`external_id`), normalize & resolve it (or look up existing owner-scoped alias in `paper_identifiers`) before proceeding.

### Compatibility Matrix by Endpoint

| Endpoint | Accepted Input (Transition) | Compatibility Behavior & Response Additions |
|---|---|---|
| `GET /api/search` (Public) | `q`, `limit` | Remains public OpenAlex search. Items carry external metadata only (`id` = OpenAlex URL or explicit `external_id`), no fake internal UUID. |
| `POST /api/papers/resolve` *(New, Stage 8B/8C, Private)* | `{"external_id": "...", "identifier_type": "optional", "metadata": {...}}` or `{"identifiers": [...]}` | Idempotently resolves external identifier(s) for `user_id` -> returns canonical internal paper object `{paper_id: "<uuid>", identifiers: [...], created: bool}`. Rejects conflicting aliases with HTTP `409`. |
| `POST /api/papers/ingest` (Private) | Supports `{"paper_id": "<uuid>"}` **OR** legacy `{"paper_id": "<external_id>"}` (plus optional `external_id`) | If non-UUID external ID is supplied: resolves/creates canonical `(user_id, paper_uuid)` via Stage 8B resolver first, then queues ingestion for `paper_uuid`. Response returns **internal UUID** `paper_id` **plus** `canonical_paper_id` (matching existing frontend expectations or `external_id`) and `status`. |
| `GET /api/paper-status` & `GET /api/papers/{paper_id:path}/status` (Private) | Accepts internal `uuid` **OR** external ID | If UUID: reads status directly for `(user_id, paper_uuid)`. If external ID: resolves `(user_id, identifier)` -> `paper_uuid` (if found, returns status; if unknown external ID, returns `discovered` without creating a paper). Checks transitional SQLite `(owner_id, uuid)` fallback if needed during Stage 8C. |
| `GET /api/paper` & `GET /api/papers/{paper_id:path}` (Private) | Accepts internal `uuid` **OR** external ID | If UUID: loads stored user paper metadata + aliases from `papers` & `paper_identifiers` (or refreshes from provider using stored `external_id`). If external ID: fetches provider metadata as before and annotates with `paper_id` (UUID) if the user already owns a matching canonical paper. |
| `GET /api/papers/{paper_id:path}/chunks` (Private) | Accepts internal `uuid` **OR** external ID | Resolves external ID -> `paper_uuid` for `user_id`, then queries `get_paper_chunks(user_id, paper_uuid)`. |
| `POST /api/rag/query` & `POST /api/chat` (Private) | `paper_ids` list of internal UUIDs **OR** external IDs (mixed allowed during transition) | Resolves any non-UUID items in `paper_ids` via `(user_id, paper_identifiers)` to `paper_uuid`s (ignoring unknown non-indexed external IDs without erroring so `insufficient_context` still works cleanly). Citations return internal `paper_id` (`uuid`) plus external citation metadata (`doi`, `url`, `external_id`). |
| `GET /api/graph`, `/api/graph/paper`, `/api/graph/paper/{paper_id:path}`, `/api/graph/search` (Private) | `paper_id` accepts UUID or external ID | Resolves external `paper_id` -> `paper_uuid` before querying Neo4j; `:Paper` nodes return internal `paperId` (`uuid`) and external `sourceUrl`. |

### Example Compatibility Payloads

**Resolve / Ingest request using external DOI:**
```json
POST /api/papers/ingest
{
  "paper_id": "https://doi.org/10.48550/arXiv.1706.03762"
}
```

**Response (`202 Accepted`):**
```json
{
  "paper_id": "a1b2c3d4-0000-4000-8000-000000000123",
  "external_id": "10.48550/arxiv.1706.03762",
  "canonical_paper_id": "a1b2c3d4-0000-4000-8000-000000000123",
  "identifiers": [
    { "identifier_type": "doi", "normalized_value": "10.48550/arxiv.1706.03762" },
    { "identifier_type": "openalex", "normalized_value": "W2626778328" }
  ],
  "status": "metadata_available",
  "stage": "queued",
  "vector_ready": false,
  "graph_ready": false,
  "message": "Paper accepted for indexing."
}
```
*(Note: Returning `"canonical_paper_id"` equal to the resolved internal UUID during transition ensures unmodified polling logic `getPaperIngestionStatus(current.canonical_paper_id || id)` in `SearchPage.tsx:73` automatically switches from polling by external ID to polling by internal UUID!)*

---

## 8. Staged Implementation Roadmap

The proposed dependency order (**8A → 8B → 8C → 8D → 8E**) follows a bottom-up invariant chain so each stage can be verified, reviewed, and committed independently without leaving broken runtime callers.

*(Reordering note: Stage 8C depends on Stage 8B's paper resolver, Stage 8D depends on internal UUIDs entering the ingestion pipeline in Stage 8C, and Stage 8E updates the UI once backend endpoints speak internal UUIDs while retaining external compatibility. This keeps every commit deployable.)*

### Stage 8A — Pure Identifier Normalization & Validation
- **Scope:** New pure Python module (e.g., `backend/identifiers.py`) + comprehensive unit tests (`backend/tests/test_identifiers.py`).
- **Behavior:** Typed normalizers for `doi`, `openalex`, `arxiv`, `pmid`, `pmcid`, `isbn`, `other`; strict UUID detector (`is_uuid()`); extractor extracting normalized alias candidates from OpenAlex/arXiv metadata dicts (`doi`, `openalex`, `arxiv`).
- **No changes** to databases, API routes, or React code.

### Stage 8B — Canonical Paper & Identifier Persistence Service
- **Scope:** New server-side repository module (e.g., `backend/paper_store.py`) + pinned PostgreSQL/Supabase client dependency in `backend/requirements.txt` & `requirements.txt` + `POST /api/papers/resolve` endpoint (or internal helper + unit/mocked repository tests + optional controlled integration test script).
- **Behavior:** Idempotent, transaction-safe `resolve_or_create_paper(owner_id, candidates, metadata)` handling alias reuse, secondary alias attachment, `23505` concurrency race recovery, and HTTP `409` alias conflict detection.
- **Prerequisite:** Requires final security strategy decision in Section 10 (forwarded user JWT with RLS vs server Postgres client with explicit `owner_id` scoping + `set_config('request.jwt.claim.sub', ...)` / parameterized owner queries).

### Stage 8C — Internal UUID Ingestion Pipeline & Status Compatibility
- **Scope:** `backend/main.py`, `backend/pipeline.py`, and status-compatibility bridge.
- **Behavior:**
  - `POST /api/papers/ingest` resolves external IDs (or validates existing internal UUID ownership) via Stage 8B **before** calling `start_ingestion(owner_id, paper_uuid)`.
  - `_save_status()` and `get_ingestion_status()` write/read keyed by internal `str(paper_uuid)` cleanly (with dual-lookup support or Supabase `paper_ingestion_status` persistence cleanly cut over without touching legacy `papers` SQLite rows).
  - Status endpoints (`/api/paper-status`, `/api/papers/{id}/status`) accept either UUID or resolvable external ID.
  - Note: Keep Chroma/Neo4j temporarily consistent with Stage 8C boundary OR couple Chroma/Neo4j `paper_id` transition carefully: **Critical insight** — if Stage 8C passes `paper_uuid` to `ingest_paper()`, Chroma (`_chunks` / `_query_chunks`) and Neo4j (`_write_graph` / `_query_graph`) receive `metadata["id"]` as `paper_uuid`. Therefore, **Stage 8C and 8D write switches must agree on what `metadata["id"]` contains!** Specifically: Stage 8C resolves `paper_uuid`, stores it on status + `Paper` lookup, and passes `paper_uuid` alongside `provider_metadata` explicitly cleanly—or Stage 8C handles status + API resolution while passing both `paper_uuid` and `external_id` until Stage 8D switches Chroma/Neo4j `paper_id` keys atomically! Splitting cleanly ensures RAG never writes UUIDs to Chroma while still querying Chroma with external IDs.

### Stage 8D — Vector & Graph Identity Migration + Controlled Backfill
- **Scope:** `backend/pipeline.py` (`_chunks`, `_index_chunks`, `_query_chunks`, `get_paper_chunks`, `_write_graph`, `_query_graph`, `get_graph_for_paper`, `get_graph`, `get_graph_search`), offline/admin backfill script (`scripts/backfill_owner_paper_uuids.py` or equivalent dry-run tool), and tests.
- **Behavior:**
  - All new Chroma chunks store internal `paper_id = str(paper_uuid)` and compute deterministic chunk IDs using `owner_id|paper_uuid|...`.
  - All new Neo4j `:Paper` nodes use `key = _scoped_graph_key(owner_id, "Paper", str(paper_uuid))` and `p.paper_id = str(paper_uuid)`, `r.paper_id = str(paper_uuid)`.
  - Dual-ID retrieval safety during transition (or post-backfill): if an owner still has verified owner-scoped Chroma/Neo4j records under `external_id` prior to backfill completion, read paths resolve `paper_uuid -> {str(paper_uuid), *known_external_aliases}` ONLY for that authenticated `owner_id`, strictly preserving owner filtering and rejecting ownerless records! Once backfill completes and is verified, legacy external-ID fallback reads can be retired.

### Stage 8E — Frontend Identity Migration & `localStorage` Compatibility
- **Scope:** `src/types/index.ts`, `src/services/api.ts`, `src/context/AppContext.tsx`, `src/context/workspaceIsolation.ts`, `src/features/search/SearchPage.tsx`, `SavedPage.tsx`, `ComparePage.tsx`, `ChatPage.tsx`, `PaperDetailsPage.tsx`, `KnowledgeGraphPage.tsx`, `LiteratureReviewPage.tsx`.
- **Behavior:**
  - Extend `Paper` type to distinguish permanent internal UUID (`paperId?: string` / canonical `id` once saved/resolved) vs provider aliases (`externalId?: string`, `identifiers?: PaperIdentifier[]`).
  - Save / Ingest actions resolve external search results to internal UUIDs cleanly; `localStorage` saved-paper migration resolves legacy external IDs lazily upon sign-in while **preserving any unresolved/offline records intact**.
  - Landing page (`LandingView`/`LandingExperience`), `AuthPage`, and `LaunchSequence` remain completely untouched.

---

## 9. Data Migration and Backfill Strategy

Every existing data artifact falls into one of three strictly separated categories:

### Category 1: Existing Owner-Scoped Records with Verifiable Identity
Includes records created after Phase 5:
- SQLite `paper_statuses(owner_id, paper_id)` rows where `owner_id` is a valid Supabase user UUID and `paper_id` is a valid external ID (`https://openalex.org/W...` or `arxiv:...`).
- ChromaDB vectors whose metadata already contains both valid `owner_id` (UUID) and external `paper_id`.
- Neo4j `:Paper` nodes and relationships whose `owner_id` matches a valid user UUID and `paper_id` is an external ID.

**Migration steps (dry-run capable, idempotent):**
1. For each `(owner_id, external_paper_id)`, normalize the external ID using Stage 8A normalizers and call `resolve_or_create_paper(owner_id, ...)`, creating/reusing `paper_uuid` in Postgres `papers` + `paper_identifiers`.
2. Copy SQLite `paper_statuses` metadata into `paper_ingestion_status(owner_id, paper_uuid)` (never deleting SQLite until verified).
3. For Chroma vectors with `owner_id = U` and `paper_id = external_id`: either copy-upsert new vectors with `paper_id = str(paper_uuid)` and UUID chunk IDs (verifying count & embedding fidelity before optionally retiring duplicate external-keyed copies) OR keep dual-ID read compatibility until re-ingested.
4. For Neo4j nodes with `owner_id = U` and `paper_id = external_id`: create/merge `:Paper {key: scoped(U, "Paper", paper_uuid)}` preserving existing entity edges cleanly under `r.paper_id = str(paper_uuid)`, keeping legacy edges intact until verified.

### Category 2: Legacy Records Without a Verified Owner
Includes:
- Pre-Phase-5 SQLite `papers` table rows (ownerless).
- Pre-Phase-5 ChromaDB vectors missing `owner_id`.
- Pre-Phase-5 Neo4j nodes/relationships with `owner_id IS NULL`.
- Pre-Phase-2 browser `localStorage` unscoped keys (`researchgraph_saved_papers`, `researchgraph_scratchpad`, `rg_lit_review_draft`).

**Mandatory Rule:**
- **DO NOT** assign ownership to ownerless records.
- **DO NOT** copy them into Postgres `papers` / `paper_identifiers`.
- **DO NOT** delete them.
- **DO NOT** expose them in authenticated RAG, Knowledge Graph, or status retrieval.

### Category 3: Unresolved or Conflicting Identifiers
Includes:
- External IDs in user-scoped `localStorage` (`researchgraph:<user_id>:saved_papers`) that were never ingested on the backend, are synthetic/malformed, or were added while offline.
- Aliases returning HTTP `409 Conflict` because two aliases map to two different existing `papers.id` rows for the same owner.

**Mandatory Rule:**
- Keep unresolved user `localStorage` entries untouched and readable in the UI with a non-destructive badge/reconcile-on-next-online-sync status; never drop or delete a user's saved papers just because the backend could not resolve an external ID.
- Surface `409` alias conflicts explicitly without silently merging papers.

---

## 10. Security and Ownership Safeguards

### Comparing Postgres Access Strategies (`authenticated` JWT + RLS vs Server DB Credentials)

| Aspect | Option A: Backend Forwards User JWT to PostgREST / Sets Session Claims under RLS | Option B: Backend Uses `service_role` or Direct Postgres Role |
|---|---|---|
| **DB Credentials Required** | Public `SUPABASE_PUBLISHABLE_KEY` + user's verified `Authorization: Bearer <jwt>` | High-privilege `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` |
| **RLS Enforcement** | Database RLS (`owner_id = (select auth.uid())`) enforces every query automatically as defense-in-depth | Bypassed (`service_role` bypasses RLS completely unless Postgres sets transaction-local `role = authenticated` + `request.jwt.claims`) |
| **Multi-statement Transactions** | PostgREST RPC functions (`CREATE FUNCTION ...` without `SECURITY DEFINER`, running as caller `SECURITY INVOKER`) can execute atomic paper + identifier resolution under RLS! | Native `BEGIN ... COMMIT` / `SAVEPOINT` in `psycopg`, handles `23505` race recovery trivially |
| **Risk Profile** | Lowest privilege blast radius; zero RLS bypass risk | High blast radius if an authorization check or `WHERE owner_id = %s` clause is ever omitted |

### Recommended Backend Security Strategy
1. **Primary recommendation (`Option A` via Verified User JWT + RLS + `SECURITY INVOKER` Postgres Function):**
   - Backend verifies the incoming JWT via `get_current_user()` (`backend/auth.py`).
   - Backend passes that verified JWT to PostgREST / Postgres RPC (using `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`, keeping zero `SUPABASE_SERVICE_ROLE_KEY` in the runtime API!).
   - An atomic `SECURITY INVOKER` SQL function in Postgres performs lookup + insert + `ON CONFLICT` / `unique_violation` re-select in one database transaction **while RLS (`auth.uid() = owner_id`) remains 100% active**.
2. **Background Task & Offline Backfill Exception:**
   - **Important edge case:** Long-running background ingestion (`ingest_paper` in `BackgroundTasks`) may outlive a short-lived user access token if updating `paper_ingestion_status` 60 seconds later!
   - If background workers write Postgres status after JWT expiry or run offline admin backfills (`Category 1` records), **only then** use a dedicated server-only credential (`service_role` / DB role) strictly inside the background/CLI layer—**never** expose it to `VITE_*`, **never** read it from frontend input, and enforce explicit `WHERE owner_id = :verified_owner_id` assertions on every query.
3. **Invariant Checklist (All Stages):**
   - `owner_id` comes solely from `get_current_user()` (never JSON/query/headers).
   - No silent adoption of ownerless Chroma/Neo4j/SQLite records.
   - Zero modifications to landing page, `AuthPage`, or `LaunchSequence`.

---

## 11. Test Matrix

| Scenario | Test Level | Target Assertion |
|---|---|---|
| Same DOI submitted repeatedly (`10.1000/abc`, `https://doi.org/10.1000/ABC`) | Unit (8A) + Integration (8B) | Normalizes identically; second call reuses exact same `paper_id` UUID without creating a duplicate `papers` row. |
| Same paper discovered via OpenAlex (`W1`) then later DOI (`10.1/x`) | Integration (8B) + API (8C) | Attaching secondary alias on resolve returns same `paper_id` UUID; second lookup by DOI returns first `paper_id`. |
| Same paper discovered via arXiv and OpenAlex | Unit (8A) + Integration (8B) | Cross-linked OpenAlex record with arXiv alias or arXiv metadata links to one canonical `paper_id`. |
| Different owners (`USER_A`, `USER_B`) submit identical DOI / OpenAlex ID | Integration (8B, 8C, 8D) | Creates two separate `papers.id` UUIDs (`uuid_a != uuid_b`); neither user can query the other's aliases, chunks, graph, or status. |
| One `(owner_id, type, normalized_value)` attempting to map to two papers | Integration (8B DB constraint) | Database raises `unique_violation` (`23505`); resolver never breaks `paper_identifiers_unique_per_owner`. |
| Concurrent requests resolving the same unindexed identifier by same owner | Integration (8B concurrency test) | One transaction wins creation, loser catches `23505`, rolls back cleanly with **zero orphaned `papers` rows**, and both callers receive identical `paper_id`. |
| Conflicting identifiers resolving to two different existing papers for same owner | Unit / Integration (8B, 8C) | Returns explicit `409 Conflict` (`IdentifierConflictError`); refuses silent merge. |
| arXiv versioned (`1706.03762v7`) vs unversioned (`1706.03762`) | Unit (8A) + Integration (8B) | Validates against decided normalization policy cleanly; preserves `original_value`. |
| Failed transaction & ingestion retry behavior | Integration (8B, 8C) | Rolled-back DB call leaves clean state; retrying `POST /api/papers/ingest` recovers cleanly using existing `paper_uuid`. |
| Chroma and Neo4j internal UUID consistency | Unit / Fake-Store (8D) | Chunk `metadata["paper_id"]`, Neo4j `:Paper.paper_id`, `:Paper.key`, and edge `paper_id` all equal `str(paper_uuid)`. |
| Legacy ownerless vs owner-scoped records during backfill | Integration / SQLite / Fake Chroma & Neo4j (8D) | Legacy ownerless records remain ignored & untouched; only verified `(owner_id, external_id)` records map to new UUIDs. |
| Frontend saved-paper & `localStorage` compatibility | Node unit tests (8E) | Old external-ID `saved_papers` hydrate safely; reconciled items map to internal UUID without discarding unresolved offline entries. |
| User A and User B end-to-end isolation | Unit + Integration + Controlled Live Test (Post-8E) | Verified cross-user zero leakage across Supabase RLS, FastAPI routes, ChromaDB, Neo4j, and React `AppContext`. |

*Distinction note:* Unit tests (Stage 8A–8E) run in `pytest` / `node --test` with synthetic data and mocked DB/HTTP stores; PostgreSQL RLS & transaction-concurrency integration tests require a controlled Postgres/Supabase instance with two test users; live OpenAlex/OpenAI/Chroma Cloud/Neo4j Aura smoke tests remain separate manual/CI environment checks.

---

## 12. Rollback and Recovery Strategy

- **No destructive schema or store drops:** Every stage keeps existing SQLite `paper_statuses`, legacy `papers`, old Chroma vectors, and old Neo4j nodes intact.
- **Stage 8A/8B Rollback:** Pure additive modules; reverting stops calling resolver without affecting active ingestion or RAG.
- **Stage 8C Rollback:** Feature-flag or revert ingestion router to pass external IDs to `start_ingestion()`/`ingest_paper()`; old SQLite status rows remain intact.
- **Stage 8D Rollback:** Because Chroma/Neo4j dual-read compatibility preserves owner-scoped reads and backfill does not delete source vectors/nodes before verification, reverting reads restores external-ID querying without data loss.
- **Stage 8E Rollback:** Frontend reads old `researchgraph:<user_id>:saved_papers` payloads safely if backed up with non-destructive fields (e.g., keeping `externalId` alongside `paperId` rather than overwriting irreversible fields until verified).

---

## 13. Risks and Open Decisions

1. **arXiv Versioning (`Finalized in Stage 8A`):** `normalize_arxiv()` strips `v<n>` from `normalized_value` and preserves the input string in `original_value`; Stage 8B must store additional observed arXiv versions in `papers.metadata` or a version-history structure because `paper_identifiers` enforces one row per `(owner_id, 'arxiv', normalized_value)`.
2. **OpenAlex Canonical Format (`Finalized in Stage 8A`):** Bare Work ID (`W2626778328`) is used for `normalized_value` while `original_value` retains any full resolver URL.
3. **Open Decision — Background Ingestion Auth Lifecycle:** Confirm whether `ingest_paper()` updates `paper_ingestion_status` via a narrow server-side Postgres writer (to tolerate JWT expiration during long PDF processing) or keeps short-lived SQLite transitions in Stage 8C until a Postgres worker credential policy is approved.
4. **Risk — Search-Result Pre-Save UI State Coupling:** Currently `SearchPage.tsx`, `SavedPage.tsx`, `ComparePage.tsx`, and `PaperDetailsPage.tsx` share `allPapers` entries keyed by `paper.id`. Stage 8E must prevent stale IDs when an unpersisted search result (`external_id`) receives an internal `paper_uuid` upon clicking **Save** or **Index paper**.
5. **Risk — Dual-ID Chroma/Neo4j Filtering Limit:** Expanding `paper_ids` to `{uuid, *aliases}` during Stage 8D backfill could exceed the 50-paper cap on `/api/rag/query` if expanded before validation; internal cap (`50`) must apply to the user-selected paper list *before* internal alias expansion.

---

## 14. Stage-by-Stage Acceptance Criteria

- **Stage 8A Accepted When:**
  - All identifier normalizers (`doi`, `openalex`, `arxiv`, `pmid`, `pmcid`, `isbn`, `other`) + UUID guard exist with explicit version/format rules documented and unit-tested (`pytest`), with zero regressions on existing 79 backend tests and frontend build/lint.
- **Stage 8B Accepted When:**
  - Atomic idempotent `resolve_or_create_paper` resolves, reuses aliases, prevents cross-owner collisions, handles concurrent `23505` inserts with zero orphaned `papers` rows, raises explicit `409` conflicts rather than merging distinct papers, and passes unit + concurrency tests.
- **Stage 8C Accepted When:**
  - `POST /api/papers/ingest`, `/api/paper-status`, `/api/papers/{id}/status`, and `/api/paper` accept both external IDs and internal UUIDs without routing UUIDs to OpenAlex/arXiv, return resolved internal `paper_id` UUIDs + external aliases, ignore client-supplied `owner_id`, and pass all API + backend tests.
- **Stage 8D Accepted When:**
  - Newly indexed Chroma chunks and Neo4j `:Paper`/edge records use internal `paper_uuid`, empty paper selections still execute zero store queries, owner isolation passes fake-store and backfill dry-run tests, and ownerless legacy records remain untouched and unexposed.
- **Stage 8E Accepted When:**
  - `Paper` types distinguish internal UUID vs external identifiers, Search/Saved/Compare/Details/Chat/Graph/Literature workflows pass TypeScript build, lint, and `node --test` isolation suites, existing user `localStorage` papers preserve unresolved entries without data loss, and landing/auth/launch UI remain unchanged.
