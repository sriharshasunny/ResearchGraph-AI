-- ResearchGraph AI — Read-Only Supabase Schema, RLS, Privilege, and Integrity Verification Suite
--
-- SAFETY NOTICE:
--   * Every statement in this file is SELECT-only (read-only metadata and catalog inspection).
--   * Do NOT add CREATE, ALTER, DROP, TRUNCATE, INSERT, UPDATE, DELETE, GRANT, REVOKE, or DO blocks.
--   * Safe to run repeatedly in the Supabase SQL Editor or any read-only PostgreSQL session.
--   * A read-only catalog audit verifies schema/policy definitions only; live two-user runtime
--     isolation must be verified separately using controlled authenticated sessions.
--
-- Verified baseline migrations:
--   * 20261125171558_unified_research_data_model.sql
--   * 20261125171721_restrict_authenticated_table_privileges.sql

-- ============================================================================
-- CHECK A: Table existence, RLS enablement, and estimated live row counts
-- Expected: 6 rows, all table_exists = true, rls_enabled = true, check_status = 'PASS'
-- ============================================================================
WITH expected_tables (table_name) AS (
    VALUES
        ('workspaces'),
        ('papers'),
        ('paper_identifiers'),
        ('workspace_papers'),
        ('paper_assets'),
        ('paper_ingestion_status')
)
SELECT
    'CHECK_A_TABLE_AND_RLS' AS check_id,
    et.table_name,
    (c.oid IS NOT NULL) AS table_exists,
    coalesce(c.relrowsecurity, false) AS rls_enabled,
    coalesce(c.relforcerowsecurity, false) AS force_rls_enabled,
    coalesce(st.n_live_tup, c.reltuples::bigint, 0) AS estimated_row_count,
    CASE
        WHEN c.oid IS NOT NULL AND c.relrowsecurity THEN 'PASS'
        ELSE 'FAIL'
    END AS check_status
FROM expected_tables et
LEFT JOIN pg_namespace n
    ON n.nspname = 'public'
LEFT JOIN pg_class c
    ON c.relnamespace = n.oid
   AND c.relname = et.table_name
   AND c.relkind = 'r'
LEFT JOIN pg_stat_user_tables st
    ON st.relid = c.oid
ORDER BY et.table_name;


-- ============================================================================
-- CHECK B1: Required RLS policy coverage per table and operation
-- Required condition: owner_id = (select auth.uid())
--   * UPDATE requires ownership check in BOTH USING (qual) and WITH CHECK (with_check)
--   * INSERT requires ownership check in WITH CHECK (with_check)
--   * SELECT and DELETE require ownership check in USING (qual)
-- Expected: 22 rows, all check_status = 'PASS'
-- ============================================================================
WITH expected_policies (table_name, cmd, expected_policy_name) AS (
    VALUES
        ('workspaces', 'SELECT', 'workspaces_select_own'),
        ('workspaces', 'INSERT', 'workspaces_insert_own'),
        ('workspaces', 'UPDATE', 'workspaces_update_own'),
        ('workspaces', 'DELETE', 'workspaces_delete_own'),
        ('papers', 'SELECT', 'papers_select_own'),
        ('papers', 'INSERT', 'papers_insert_own'),
        ('papers', 'UPDATE', 'papers_update_own'),
        ('papers', 'DELETE', 'papers_delete_own'),
        ('paper_identifiers', 'SELECT', 'paper_identifiers_select_own'),
        ('paper_identifiers', 'INSERT', 'paper_identifiers_insert_own'),
        ('paper_identifiers', 'UPDATE', 'paper_identifiers_update_own'),
        ('paper_identifiers', 'DELETE', 'paper_identifiers_delete_own'),
        ('workspace_papers', 'SELECT', 'workspace_papers_select_own'),
        ('workspace_papers', 'INSERT', 'workspace_papers_insert_own'),
        ('workspace_papers', 'DELETE', 'workspace_papers_delete_own'),
        ('paper_assets', 'SELECT', 'paper_assets_select_own'),
        ('paper_assets', 'INSERT', 'paper_assets_insert_own'),
        ('paper_assets', 'DELETE', 'paper_assets_delete_own'),
        ('paper_ingestion_status', 'SELECT', 'paper_ingestion_status_select_own'),
        ('paper_ingestion_status', 'INSERT', 'paper_ingestion_status_insert_own'),
        ('paper_ingestion_status', 'UPDATE', 'paper_ingestion_status_update_own'),
        ('paper_ingestion_status', 'DELETE', 'paper_ingestion_status_delete_own')
),
actual_policies AS (
    SELECT
        p.tablename,
        p.policyname,
        p.cmd,
        p.permissive,
        p.roles::text[] AS roles,
        p.qual,
        p.with_check,
        regexp_replace(lower(coalesce(p.qual, '')), '\s+', '', 'g') AS norm_qual,
        regexp_replace(lower(coalesce(p.with_check, '')), '\s+', '', 'g') AS norm_with_check
    FROM pg_policies p
    WHERE p.schemaname = 'public'
)
SELECT
    'CHECK_B1_REQUIRED_RLS_POLICIES' AS check_id,
    ep.table_name,
    ep.cmd,
    ep.expected_policy_name,
    ap.policyname AS actual_policy_name,
    ap.permissive,
    ap.roles,
    ap.qual AS using_expression,
    ap.with_check AS with_check_expression,
    CASE
        WHEN ap.policyname IS NULL THEN 'FAIL: missing policy'
        WHEN ap.permissive <> 'PERMISSIVE' THEN 'FAIL: non-permissive policy'
        WHEN NOT (ap.roles @> ARRAY['authenticated']::text[])
             OR ap.roles && ARRAY['anon', 'public']::text[] THEN 'FAIL: invalid policy roles'
        WHEN ep.cmd IN ('SELECT', 'DELETE')
             AND ap.norm_qual NOT LIKE '%owner_id=(selectauth.uid()%' THEN 'FAIL: missing owner_id=(select auth.uid()) in USING'
        WHEN ep.cmd = 'INSERT'
             AND ap.norm_with_check NOT LIKE '%owner_id=(selectauth.uid()%' THEN 'FAIL: missing owner_id=(select auth.uid()) in WITH CHECK'
        WHEN ep.cmd = 'UPDATE'
             AND (
                 ap.norm_qual NOT LIKE '%owner_id=(selectauth.uid()%'
                 OR ap.norm_with_check NOT LIKE '%owner_id=(selectauth.uid()%'
             ) THEN 'FAIL: UPDATE policy must enforce ownership in both USING and WITH CHECK'
        ELSE 'PASS'
    END AS check_status
FROM expected_policies ep
LEFT JOIN actual_policies ap
    ON ap.tablename = ep.table_name
   AND ap.cmd = ep.cmd
   AND ap.policyname = ep.expected_policy_name
ORDER BY ep.table_name, ep.cmd;


-- ============================================================================
-- CHECK B2: Unexpected, misnamed, or incorrectly scoped RLS policies
-- Expected: 0 rows (empty result set)
-- ============================================================================
WITH expected_policies (table_name, cmd, policy_name) AS (
    VALUES
        ('workspaces', 'SELECT', 'workspaces_select_own'),
        ('workspaces', 'INSERT', 'workspaces_insert_own'),
        ('workspaces', 'UPDATE', 'workspaces_update_own'),
        ('workspaces', 'DELETE', 'workspaces_delete_own'),
        ('papers', 'SELECT', 'papers_select_own'),
        ('papers', 'INSERT', 'papers_insert_own'),
        ('papers', 'UPDATE', 'papers_update_own'),
        ('papers', 'DELETE', 'papers_delete_own'),
        ('paper_identifiers', 'SELECT', 'paper_identifiers_select_own'),
        ('paper_identifiers', 'INSERT', 'paper_identifiers_insert_own'),
        ('paper_identifiers', 'UPDATE', 'paper_identifiers_update_own'),
        ('paper_identifiers', 'DELETE', 'paper_identifiers_delete_own'),
        ('workspace_papers', 'SELECT', 'workspace_papers_select_own'),
        ('workspace_papers', 'INSERT', 'workspace_papers_insert_own'),
        ('workspace_papers', 'DELETE', 'workspace_papers_delete_own'),
        ('paper_assets', 'SELECT', 'paper_assets_select_own'),
        ('paper_assets', 'INSERT', 'paper_assets_insert_own'),
        ('paper_assets', 'DELETE', 'paper_assets_delete_own'),
        ('paper_ingestion_status', 'SELECT', 'paper_ingestion_status_select_own'),
        ('paper_ingestion_status', 'INSERT', 'paper_ingestion_status_insert_own'),
        ('paper_ingestion_status', 'UPDATE', 'paper_ingestion_status_update_own'),
        ('paper_ingestion_status', 'DELETE', 'paper_ingestion_status_delete_own')
)
SELECT
    'CHECK_B2_UNEXPECTED_RLS_POLICIES' AS check_id,
    p.tablename AS table_name,
    p.policyname,
    p.cmd,
    p.roles,
    p.qual,
    p.with_check,
    'FAIL: unexpected or misnamed policy' AS check_status
FROM pg_policies p
WHERE p.schemaname = 'public'
  AND p.tablename IN (
      'workspaces', 'papers', 'paper_identifiers',
      'workspace_papers', 'paper_assets', 'paper_ingestion_status'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM expected_policies ep
      WHERE ep.table_name = p.tablename
        AND ep.cmd = p.cmd
        AND ep.policy_name = p.policyname
  )
ORDER BY p.tablename, p.policyname;


-- ============================================================================
-- CHECK C1: Table privilege audit for authenticated and anon
-- Expected: 6 rows, all check_status = 'PASS'
--   * anon has zero grants
--   * authenticated has exact minimal grants (no UPDATE on workspace_papers/paper_assets;
--     no TRUNCATE, REFERENCES, or TRIGGER on any table)
-- ============================================================================
WITH expected_grants (table_name, expected_authenticated_privs) AS (
    VALUES
        ('workspaces', ARRAY['DELETE', 'INSERT', 'SELECT', 'UPDATE']::text[]),
        ('papers', ARRAY['DELETE', 'INSERT', 'SELECT', 'UPDATE']::text[]),
        ('paper_identifiers', ARRAY['DELETE', 'INSERT', 'SELECT', 'UPDATE']::text[]),
        ('workspace_papers', ARRAY['DELETE', 'INSERT', 'SELECT']::text[]),
        ('paper_assets', ARRAY['DELETE', 'INSERT', 'SELECT']::text[]),
        ('paper_ingestion_status', ARRAY['DELETE', 'INSERT', 'SELECT', 'UPDATE']::text[])
),
role_grants AS (
    SELECT
        g.table_name,
        coalesce(
            array_agg(g.privilege_type ORDER BY g.privilege_type)
                FILTER (WHERE g.grantee = 'authenticated'),
            ARRAY[]::text[]
        ) AS authenticated_privs,
        coalesce(
            array_agg(g.privilege_type ORDER BY g.privilege_type)
                FILTER (WHERE g.grantee = 'anon'),
            ARRAY[]::text[]
        ) AS anon_privs,
        coalesce(
            array_agg(g.privilege_type ORDER BY g.privilege_type)
                FILTER (WHERE g.grantee = 'PUBLIC'),
            ARRAY[]::text[]
        ) AS public_privs
    FROM information_schema.role_table_grants g
    WHERE g.table_schema = 'public'
      AND g.table_name IN (
          'workspaces', 'papers', 'paper_identifiers',
          'workspace_papers', 'paper_assets', 'paper_ingestion_status'
      )
    GROUP BY g.table_name
)
SELECT
    'CHECK_C1_TABLE_PRIVILEGES' AS check_id,
    eg.table_name,
    coalesce(rg.authenticated_privs, ARRAY[]::text[]) AS actual_authenticated_privs,
    eg.expected_authenticated_privs,
    coalesce(rg.anon_privs, ARRAY[]::text[]) AS actual_anon_privs,
    coalesce(rg.public_privs, ARRAY[]::text[]) AS actual_public_privs,
    CASE
        WHEN coalesce(rg.anon_privs, ARRAY[]::text[]) <> ARRAY[]::text[] THEN 'FAIL: anon has table grants'
        WHEN coalesce(rg.public_privs, ARRAY[]::text[]) <> ARRAY[]::text[] THEN 'FAIL: PUBLIC has table grants'
        WHEN coalesce(rg.authenticated_privs, ARRAY[]::text[]) && ARRAY['TRUNCATE', 'REFERENCES', 'TRIGGER']::text[]
            THEN 'FAIL: authenticated has unsafe privilege (TRUNCATE/REFERENCES/TRIGGER)'
        WHEN coalesce(rg.authenticated_privs, ARRAY[]::text[]) <> eg.expected_authenticated_privs
            THEN 'FAIL: authenticated privileges differ from expected allowlist'
        ELSE 'PASS'
    END AS check_status
FROM expected_grants eg
LEFT JOIN role_grants rg
    ON rg.table_name = eg.table_name
ORDER BY eg.table_name;


-- ============================================================================
-- CHECK C2: service_role privileges (reported separately; server-only)
-- Note: service_role bypasses RLS and is NEVER safe for browser or VITE_* usage.
-- ============================================================================
SELECT
    'CHECK_C2_SERVICE_ROLE_PRIVILEGES' AS check_id,
    g.table_name,
    array_agg(g.privilege_type ORDER BY g.privilege_type) AS service_role_privs,
    'SERVER_ONLY_NEVER_EXPOSE_TO_BROWSER' AS security_classification
FROM information_schema.role_table_grants g
WHERE g.table_schema = 'public'
  AND g.grantee = 'service_role'
  AND g.table_name IN (
      'workspaces', 'papers', 'paper_identifiers',
      'workspace_papers', 'paper_assets', 'paper_ingestion_status'
  )
GROUP BY g.table_name
ORDER BY g.table_name;


-- ============================================================================
-- CHECK D: Referential integrity, composite ownership FKs, PKs, and uniqueness
-- Expected: 11 rows, all check_status = 'PASS'
-- ============================================================================
WITH expected_constraints (
    table_name,
    constraint_type,
    expected_def_fragment,
    description
) AS (
    VALUES
        ('workspaces', 'f', 'FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE', 'workspaces owner_id references auth.users(id)'),
        ('workspaces', 'u', 'UNIQUE (owner_id, id)', 'workspaces composite unique key (owner_id, id)'),
        ('papers', 'f', 'FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE', 'papers owner_id references auth.users(id)'),
        ('papers', 'u', 'UNIQUE (owner_id, id)', 'papers composite unique key (owner_id, id)'),
        ('paper_identifiers', 'f', 'FOREIGN KEY (owner_id, paper_id) REFERENCES papers(owner_id, id) ON DELETE CASCADE', 'paper_identifiers composite owner FK to papers'),
        ('paper_identifiers', 'u', 'UNIQUE (owner_id, identifier_type, normalized_value)', 'paper_identifiers unique per owner and identifier type'),
        ('workspace_papers', 'p', 'PRIMARY KEY (workspace_id, paper_id)', 'workspace_papers primary key (workspace_id, paper_id)'),
        ('workspace_papers', 'f', 'FOREIGN KEY (owner_id, workspace_id) REFERENCES workspaces(owner_id, id) ON DELETE CASCADE', 'workspace_papers composite owner FK to workspaces'),
        ('workspace_papers', 'f', 'FOREIGN KEY (owner_id, paper_id) REFERENCES papers(owner_id, id) ON DELETE CASCADE', 'workspace_papers composite owner FK to papers'),
        ('paper_assets', 'f', 'FOREIGN KEY (owner_id, paper_id) REFERENCES papers(owner_id, id) ON DELETE CASCADE', 'paper_assets composite owner FK to papers'),
        ('paper_ingestion_status', 'p', 'PRIMARY KEY (owner_id, paper_id)', 'paper_ingestion_status primary key (owner_id, paper_id)'),
        ('paper_ingestion_status', 'f', 'FOREIGN KEY (owner_id, paper_id) REFERENCES papers(owner_id, id) ON DELETE CASCADE', 'paper_ingestion_status composite owner FK to papers')
),
actual_constraints AS (
    SELECT
        cls.relname AS table_name,
        con.conname AS constraint_name,
        con.contype::text AS constraint_type,
        pg_get_constraintdef(con.oid) AS constraint_def
    FROM pg_constraint con
    JOIN pg_class cls
        ON cls.oid = con.conrelid
    JOIN pg_namespace ns
        ON ns.oid = cls.relnamespace
    WHERE ns.nspname = 'public'
      AND cls.relname IN (
          'workspaces', 'papers', 'paper_identifiers',
          'workspace_papers', 'paper_assets', 'paper_ingestion_status'
      )
)
SELECT
    'CHECK_D_REFERENTIAL_INTEGRITY' AS check_id,
    ec.table_name,
    ec.description,
    ac.constraint_name,
    ac.constraint_def,
    CASE
        WHEN ac.constraint_name IS NOT NULL THEN 'PASS'
        ELSE 'FAIL: expected constraint missing or mismatched'
    END AS check_status
FROM expected_constraints ec
LEFT JOIN actual_constraints ac
    ON ac.table_name = ec.table_name
   AND ac.constraint_type = ec.constraint_type
   AND replace(lower(ac.constraint_def), 'public.', '') = replace(lower(ec.expected_def_fragment), 'public.', '')
ORDER BY ec.table_name, ec.description;


-- ============================================================================
-- CHECK E: Data API exposure and effective role access checks
-- Verifies intended authenticated PostgREST/Data API operations work with RLS
-- while anon has zero table access (without relying on RLS alone).
-- Expected: 6 rows, all check_status = 'PASS'
-- ============================================================================
WITH expected_api_access (table_name, allow_authenticated_update) AS (
    VALUES
        ('workspaces', true),
        ('papers', true),
        ('paper_identifiers', true),
        ('workspace_papers', false),
        ('paper_assets', false),
        ('paper_ingestion_status', true)
)
SELECT
    'CHECK_E_DATA_API_EXPOSURE' AS check_id,
    e.table_name,
    has_schema_privilege('authenticated', 'public', 'USAGE') AS authenticated_schema_usage,
    coalesce(c.relrowsecurity, false) AS rls_enabled,
    has_table_privilege('authenticated', format('public.%I', e.table_name), 'SELECT') AS auth_select,
    has_table_privilege('authenticated', format('public.%I', e.table_name), 'INSERT') AS auth_insert,
    has_table_privilege('authenticated', format('public.%I', e.table_name), 'UPDATE') AS auth_update,
    has_table_privilege('authenticated', format('public.%I', e.table_name), 'DELETE') AS auth_delete,
    has_table_privilege('anon', format('public.%I', e.table_name), 'SELECT,INSERT,UPDATE,DELETE') AS anon_any_dml,
    CASE
        WHEN c.oid IS NULL THEN 'FAIL: table missing'
        WHEN NOT coalesce(c.relrowsecurity, false) THEN 'FAIL: RLS disabled'
        WHEN NOT has_schema_privilege('authenticated', 'public', 'USAGE') THEN 'FAIL: authenticated lacks public USAGE'
        WHEN has_table_privilege('anon', format('public.%I', e.table_name), 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
            THEN 'FAIL: anon has table privilege'
        WHEN NOT (
            has_table_privilege('authenticated', format('public.%I', e.table_name), 'SELECT')
            AND has_table_privilege('authenticated', format('public.%I', e.table_name), 'INSERT')
            AND has_table_privilege('authenticated', format('public.%I', e.table_name), 'DELETE')
        ) THEN 'FAIL: authenticated missing required SELECT/INSERT/DELETE grant'
        WHEN has_table_privilege('authenticated', format('public.%I', e.table_name), 'UPDATE') <> e.allow_authenticated_update
            THEN 'FAIL: unexpected authenticated UPDATE exposure'
        ELSE 'PASS'
    END AS check_status
FROM expected_api_access e
LEFT JOIN pg_namespace n
    ON n.nspname = 'public'
LEFT JOIN pg_class c
    ON c.relnamespace = n.oid
   AND c.relname = e.table_name
   AND c.relkind = 'r'
ORDER BY e.table_name;


-- ============================================================================
-- CHECK F1: Expected updated_at triggers and non-SECURITY DEFINER trigger function
-- Expected: 2 rows (workspaces_set_updated_at, papers_set_updated_at), check_status = 'PASS'
-- ============================================================================
WITH expected_triggers (table_name, trigger_name) AS (
    VALUES
        ('workspaces', 'workspaces_set_updated_at'),
        ('papers', 'papers_set_updated_at')
)
SELECT
    'CHECK_F1_UPDATED_AT_TRIGGERS' AS check_id,
    et.table_name,
    et.trigger_name,
    t.tgenabled AS trigger_enabled_mode,
    pg_get_triggerdef(t.oid) AS trigger_definition,
    p.proname AS function_name,
    p.prosecdef AS is_security_definer,
    p.proconfig AS function_config,
    CASE
        WHEN t.oid IS NULL THEN 'FAIL: expected trigger missing'
        WHEN t.tgenabled = 'D' THEN 'FAIL: trigger is disabled'
        WHEN p.proname <> 'researchgraph_set_updated_at' THEN 'FAIL: unexpected trigger function'
        WHEN p.prosecdef THEN 'FAIL: trigger function must not be SECURITY DEFINER'
        WHEN NOT coalesce(p.proconfig @> ARRAY['search_path=public']::text[], false)
            THEN 'FAIL: trigger function missing fixed search_path=public'
        WHEN lower(pg_get_triggerdef(t.oid)) NOT LIKE '%before update%' THEN 'FAIL: trigger is not BEFORE UPDATE'
        ELSE 'PASS'
    END AS check_status
FROM expected_triggers et
LEFT JOIN pg_namespace n
    ON n.nspname = 'public'
LEFT JOIN pg_class c
    ON c.relnamespace = n.oid
   AND c.relname = et.table_name
   AND c.relkind = 'r'
LEFT JOIN pg_trigger t
    ON t.tgrelid = c.oid
   AND t.tgname = et.trigger_name
   AND NOT t.tgisinternal
LEFT JOIN pg_proc p
    ON p.oid = t.tgfoid
ORDER BY et.table_name;


-- ============================================================================
-- CHECK F2: Unexpected user triggers on the six unified tables
-- Expected: 0 rows (empty result set)
-- ============================================================================
SELECT
    'CHECK_F2_UNEXPECTED_TRIGGERS' AS check_id,
    c.relname AS table_name,
    t.tgname AS trigger_name,
    pg_get_triggerdef(t.oid) AS trigger_definition,
    'FAIL: unexpected non-internal trigger' AS check_status
FROM pg_trigger t
JOIN pg_class c
    ON c.oid = t.tgrelid
JOIN pg_namespace n
    ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND NOT t.tgisinternal
  AND c.relname IN (
      'workspaces', 'papers', 'paper_identifiers',
      'workspace_papers', 'paper_assets', 'paper_ingestion_status'
  )
  AND NOT (
      (c.relname = 'workspaces' AND t.tgname = 'workspaces_set_updated_at')
      OR (c.relname = 'papers' AND t.tgname = 'papers_set_updated_at')
  )
ORDER BY c.relname, t.tgname;
