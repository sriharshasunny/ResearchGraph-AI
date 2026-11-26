# Supabase Schema and RLS Verification Guide

## 1. Purpose

[verify_unified_research_data_model.sql](../supabase/verification/verify_unified_research_data_model.sql) provides a repeatable, **read-only (`SELECT`-only)** catalog audit for ResearchGraph AI's unified PostgreSQL schema in Supabase.

It verifies that the deployed schema continues to satisfy its database-side ownership, Row Level Security (RLS), role privilege, referential-integrity, Data API exposure, and `updated_at` trigger invariants before future backend phases migrate active research workflows onto Postgres.

It does **not** create, alter, drop, insert, update, or delete any database objects or rows.

---

## 2. Verified Project Baseline

- **Project**: `ResearchGraph_AI` (ref: `uhwsbovuzmwvbgrynfiy`)
- **Region**: `ap-south-1`
- **Engine**: PostgreSQL 17 (`ACTIVE_HEALTHY`)
- **Applied migrations**:
  - `20261125171558_unified_research_data_model.sql`
  - `20261125171721_restrict_authenticated_table_privileges.sql`
- **Baseline tables**: All 6 expected tables exist in `public`, have RLS enabled, and contain 0 rows at the Phase 7 baseline. Do not insert test fixtures into the live production database during schema verification.

---

## 3. Expected Schema Contract

### Expected Tables
1. `public.workspaces`
2. `public.papers`
3. `public.paper_identifiers`
4. `public.workspace_papers`
5. `public.paper_assets`
6. `public.paper_ingestion_status`

### Required RLS Policies (`pg_policies`)
Every policy targets role `authenticated` (`PERMISSIVE`) and enforces `owner_id = (select auth.uid())` (`USING` on `SELECT`/`DELETE`, `WITH CHECK` on `INSERT`, and both `USING` and `WITH CHECK` on `UPDATE`):

| Table | Required Operations | Policy Names |
|---|---|---|
| `workspaces` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `workspaces_{select,insert,update,delete}_own` |
| `papers` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `papers_{select,insert,update,delete}_own` |
| `paper_identifiers` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `paper_identifiers_{select,insert,update,delete}_own` |
| `workspace_papers` | `SELECT`, `INSERT`, `DELETE` | `workspace_papers_{select,insert,delete}_own` |
| `paper_assets` | `SELECT`, `INSERT`, `DELETE` | `paper_assets_{select,insert,delete}_own` |
| `paper_ingestion_status` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | `paper_ingestion_status_{select,insert,update,delete}_own` |

### Required Table Privileges
- **`anon`**: **zero** privileges on all 6 tables (and zero `PUBLIC` grants).
- **`authenticated`**:
  - `workspaces`, `papers`, `paper_identifiers`, `paper_ingestion_status`: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
  - `workspace_papers`, `paper_assets`: `SELECT`, `INSERT`, `DELETE` (no `UPDATE`)
  - No `TRUNCATE`, `REFERENCES`, or `TRIGGER` privileges on any table.
- **`service_role`**: reported separately by Check C2 as `SERVER_ONLY_NEVER_EXPOSE_TO_BROWSER`. Never place a service-role key in `VITE_*` variables or browser code.

### Required Referential Integrity & Uniqueness
- `workspaces.owner_id -> auth.users(id) ON DELETE CASCADE` and `UNIQUE (owner_id, id)`
- `papers.owner_id -> auth.users(id) ON DELETE CASCADE` and `UNIQUE (owner_id, id)`
- `workspace_papers`: `PRIMARY KEY (workspace_id, paper_id)` and composite owner-aware FKs:
  - `(owner_id, workspace_id) -> public.workspaces(owner_id, id) ON DELETE CASCADE`
  - `(owner_id, paper_id) -> public.papers(owner_id, id) ON DELETE CASCADE`
- `paper_identifiers`: composite FK `(owner_id, paper_id) -> public.papers(owner_id, id) ON DELETE CASCADE` and `UNIQUE (owner_id, identifier_type, normalized_value)`
- `paper_assets`: composite FK `(owner_id, paper_id) -> public.papers(owner_id, id) ON DELETE CASCADE` (plus unique storage object and asset version constraints)
- `paper_ingestion_status`: `PRIMARY KEY (owner_id, paper_id)` and composite FK `(owner_id, paper_id) -> public.papers(owner_id, id) ON DELETE CASCADE`

### Triggers
- `workspaces_set_updated_at` (`BEFORE UPDATE` on `public.workspaces`)
- `papers_set_updated_at` (`BEFORE UPDATE` on `public.papers`)
- Both execute `public.researchgraph_set_updated_at()` (`SECURITY INVOKER`, fixed `search_path = public`).

---

## 4. How to Run the Verification Suite

### Option A: Supabase SQL Editor (Recommended)
1. Open the `ResearchGraph_AI` project in the Supabase Dashboard and go to **SQL Editor**.
2. Paste the contents of `supabase/verification/verify_unified_research_data_model.sql`.
3. Click **Run**. Because every statement is read-only `SELECT`, the script will not mutate data or schema objects.
4. Review each result grid (`CHECK_A_TABLE_AND_RLS`, `CHECK_B1_REQUIRED_RLS_POLICIES`, `CHECK_B2_UNEXPECTED_RLS_POLICIES`, `CHECK_C1_TABLE_PRIVILEGES`, `CHECK_C2_SERVICE_ROLE_PRIVILEGES`, `CHECK_D_REFERENTIAL_INTEGRITY`, `CHECK_E_DATA_API_EXPOSURE`, `CHECK_F1_UPDATED_AT_TRIGGERS`, `CHECK_F2_UNEXPECTED_TRIGGERS`).

### Option B: Read-Only `psql` Session (When Direct DB Access Is Configured)
Run with read-only transaction enforcement (never store database passwords or connection strings in the repository):
```sh
PGOPTIONS="-c default_transaction_read_only=on" psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/verification/verify_unified_research_data_model.sql
```

---

## 5. Interpreting Results

| Query (`check_id`) | Expected Healthy Result |
|---|---|
| `CHECK_A_TABLE_AND_RLS` | 6 rows; `table_exists = true`, `rls_enabled = true`, `check_status = 'PASS'` |
| `CHECK_B1_REQUIRED_RLS_POLICIES` | 22 rows; every policy has `check_status = 'PASS'` |
| `CHECK_B2_UNEXPECTED_RLS_POLICIES` | **0 rows** (empty) |
| `CHECK_C1_TABLE_PRIVILEGES` | 6 rows; `actual_anon_privs = {}`, `actual_public_privs = {}`, `check_status = 'PASS'` |
| `CHECK_C2_SERVICE_ROLE_PRIVILEGES` | Informational list of `service_role` privileges (`SERVER_ONLY_NEVER_EXPOSE_TO_BROWSER`) |
| `CHECK_D_REFERENTIAL_INTEGRITY` | 12 rows; every expected PK, UK, and composite owner FK has `check_status = 'PASS'` |
| `CHECK_E_DATA_API_EXPOSURE` | 6 rows; `authenticated` has expected DML + schema usage, `anon_any_dml = false`, `check_status = 'PASS'` |
| `CHECK_F1_UPDATED_AT_TRIGGERS` | 2 rows (`workspaces`, `papers`); `is_security_definer = false`, `check_status = 'PASS'` |
| `CHECK_F2_UNEXPECTED_TRIGGERS` | **0 rows** (empty) |

---

## 6. Verification History & Static vs. Runtime Scope

### Phase 7 & Phase 7.1 Execution Notes
- Read-only checks from the Phase 7 script were executed against the live `ResearchGraph_AI` (`uhwsbovuzmwvbgrynfiy`) Supabase project, surfacing a PostgreSQL `character_data[]` vs `text[]` type mismatch in Check C1.
- Phase 7.1 corrected Check C1 by casting `g.privilege_type::text` before `array_agg`, hardened Check B1 to require exact equality on normalized expressions (`(owner_id=(selectauth.uid()asuid))`) and exact role array `ARRAY['authenticated']::text[]`, and corrected the Check D comment to 12 expected constraints.
- The corrected privilege inventory was independently verified, with all six table privilege configurations matching the expected allowlists.
- A complete successful rerun of the committed `supabase/verification/verify_unified_research_data_model.sql` file must be executed and confirmed in a live read-only Supabase session before marking the updated script itself as live-verified.

### Static Metadata Checks vs. Live Two-User Integration Testing

- **What this SQL suite proves (static metadata checks):** All 6 tables exist, RLS is enabled, every expected ownership policy uses `owner_id = (select auth.uid())`, `anon` has no grants, `authenticated` grants exclude unsafe operations (`TRUNCATE`, `REFERENCES`, `TRIGGER`, and `UPDATE` on `workspace_papers`/`paper_assets`), composite foreign keys prevent cross-owner joins, and `updated_at` triggers are intact.
- **What a read-only catalog audit CANNOT prove:** It **does not** execute live queries under real User A and User B JWT sessions, so it cannot by itself prove runtime cross-user `SELECT`/`INSERT`/`UPDATE`/`DELETE` rejection against PostgREST or Supabase Auth.
- **Required follow-up test (deferred):** Before enabling frontend/backend Postgres workspace features, run an isolated two-user integration test in a controlled test environment using two genuine authenticated user sessions (User A and User B) verifying:
  1. User A can CRUD User A's `workspaces` and `papers`.
  2. User B receives zero rows when selecting User A's rows and is rejected when inserting/updating/deleting rows with User A's `owner_id` or linking User A's paper to User B's workspace.
  3. Unauthenticated `anon` requests fail with permission denied.

---

## 7. Investigating Failures Safely

If any check returns `FAIL` or an unexpected row:
1. **Do NOT disable RLS, grant `anon` privileges, switch policies to `user_metadata`, or convert functions to `SECURITY DEFINER`.**
2. Compare `pg_policies`, `role_table_grants`, or `pg_constraint` output against the source migrations in `supabase/migrations/`.
3. Check whether an unreviewed manual edit in the Supabase Dashboard altered a policy (`qual` / `with_check`) or restored default `anon`/`PUBLIC` grants.
4. Author and apply a new forward SQL migration under `supabase/migrations/` to restore the minimal grants, policies, or constraints cleanly.
