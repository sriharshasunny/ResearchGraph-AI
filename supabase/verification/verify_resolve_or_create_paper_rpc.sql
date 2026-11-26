-- ResearchGraph AI — Stage 8B Read-Only Verification for resolve_or_create_paper RPC
--
-- SAFETY NOTICE:
--   * Every statement in this file is SELECT-only (read-only system catalog inspection).
--   * Safe to run repeatedly in Supabase SQL Editor or any read-only PostgreSQL session.

-- ============================================================================
-- CHECK 1: Function signature, SECURITY INVOKER, fixed search_path, and body checks
-- Expected: 1 row with check_status = 'PASS'
-- ============================================================================
SELECT
    'CHECK_1_RPC_DEFINITION' AS check_id,
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS identity_arguments,
    pg_get_function_result(p.oid) AS return_type,
    NOT p.prosecdef AS is_security_invoker,
    p.proconfig AS function_config,
    CASE
        WHEN p.oid IS NULL THEN 'FAIL: resolve_or_create_paper(jsonb, jsonb) missing'
        WHEN p.prosecdef THEN 'FAIL: must be SECURITY INVOKER, not SECURITY DEFINER'
        WHEN NOT coalesce(p.proconfig @> ARRAY['search_path=public']::text[], false)
            THEN 'FAIL: missing fixed search_path=public'
        WHEN lower(p.prosrc) NOT LIKE '%auth.uid()%'
            THEN 'FAIL: missing auth.uid() ownership check'
        WHEN lower(p.prosrc) NOT LIKE '%pg_advisory_xact_lock%'
            THEN 'FAIL: missing deterministic pg_advisory_xact_lock'
        WHEN lower(p.prosrc) NOT LIKE '%unique_violation%'
            THEN 'FAIL: missing unique_violation (23505) recovery block'
        WHEN lower(p.prosrc) NOT LIKE '%p0409%'
            THEN 'FAIL: missing P0409 alias-conflict error handling'
        ELSE 'PASS'
    END AS check_status
FROM (SELECT 'resolve_or_create_paper'::name AS proname) target
LEFT JOIN pg_namespace n
    ON n.nspname = 'public'
LEFT JOIN pg_proc p
    ON p.pronamespace = n.oid
   AND p.proname = target.proname
   AND pg_get_function_identity_arguments(p.oid) = 'p_identifiers jsonb, p_paper jsonb';


-- ============================================================================
-- CHECK 2: Function EXECUTE privilege audit (authenticated allowed; anon/PUBLIC denied)
-- Expected: 1 row with check_status = 'PASS'
-- ============================================================================
SELECT
    'CHECK_2_RPC_PRIVILEGES' AS check_id,
    n.nspname AS schema_name,
    p.proname AS function_name,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute,
    has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
    has_function_privilege('public', p.oid, 'EXECUTE') AS public_can_execute,
    CASE
        WHEN p.oid IS NULL THEN 'FAIL: function missing'
        WHEN has_function_privilege('public', p.oid, 'EXECUTE') THEN 'FAIL: PUBLIC must not have EXECUTE'
        WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'FAIL: anon must not have EXECUTE'
        WHEN NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
            THEN 'FAIL: authenticated missing EXECUTE'
        ELSE 'PASS'
    END AS check_status
FROM (SELECT 'resolve_or_create_paper'::name AS proname) target
LEFT JOIN pg_namespace n
    ON n.nspname = 'public'
LEFT JOIN pg_proc p
    ON p.pronamespace = n.oid
   AND p.proname = target.proname
   AND pg_get_function_identity_arguments(p.oid) = 'p_identifiers jsonb, p_paper jsonb';


-- ============================================================================
-- CHECK 3: Supporting table constraints and composite ownership FKs remain intact
-- Expected: 3 rows with check_status = 'PASS'
-- ============================================================================
WITH expected_constraints (table_name, constraint_name, expected_fragment) AS (
    VALUES
        ('papers', 'papers_owner_id_id_key', 'UNIQUE (owner_id, id)'),
        ('paper_identifiers', 'paper_identifiers_unique_per_owner', 'UNIQUE (owner_id, identifier_type, normalized_value)'),
        ('paper_identifiers', 'paper_identifiers_owner_paper_fk', 'FOREIGN KEY (owner_id, paper_id) REFERENCES papers(owner_id, id) ON DELETE CASCADE')
)
SELECT
    'CHECK_3_SUPPORTING_CONSTRAINTS' AS check_id,
    ec.table_name,
    ec.constraint_name,
    pg_get_constraintdef(con.oid) AS actual_definition,
    CASE
        WHEN con.oid IS NULL THEN 'FAIL: constraint missing'
        WHEN replace(lower(pg_get_constraintdef(con.oid)), 'public.', '') <> replace(lower(ec.expected_fragment), 'public.', '')
            THEN 'FAIL: constraint definition mismatch'
        ELSE 'PASS'
    END AS check_status
FROM expected_constraints ec
LEFT JOIN pg_namespace ns
    ON ns.nspname = 'public'
LEFT JOIN pg_class cls
    ON cls.relnamespace = ns.oid
   AND cls.relname = ec.table_name
LEFT JOIN pg_constraint con
    ON con.conrelid = cls.oid
   AND con.conname = ec.constraint_name
ORDER BY ec.table_name, ec.constraint_name;


-- ============================================================================
-- CHECK 4: RLS enablement and policy coverage on papers and paper_identifiers
-- Expected: 8 rows (4 operations x 2 tables) with check_status = 'PASS'
-- ============================================================================
WITH expected_policies (table_name, cmd, policy_name) AS (
    VALUES
        ('papers', 'SELECT', 'papers_select_own'),
        ('papers', 'INSERT', 'papers_insert_own'),
        ('papers', 'UPDATE', 'papers_update_own'),
        ('papers', 'DELETE', 'papers_delete_own'),
        ('paper_identifiers', 'SELECT', 'paper_identifiers_select_own'),
        ('paper_identifiers', 'INSERT', 'paper_identifiers_insert_own'),
        ('paper_identifiers', 'UPDATE', 'paper_identifiers_update_own'),
        ('paper_identifiers', 'DELETE', 'paper_identifiers_delete_own')
)
SELECT
    'CHECK_4_RLS_POLICIES' AS check_id,
    ep.table_name,
    ep.cmd,
    ep.policy_name,
    coalesce(cls.relrowsecurity, false) AS rls_enabled,
    pol.roles::text[] AS roles,
    CASE
        WHEN NOT coalesce(cls.relrowsecurity, false) THEN 'FAIL: RLS disabled'
        WHEN pol.policyname IS NULL THEN 'FAIL: policy missing'
        WHEN pol.roles::text[] <> ARRAY['authenticated']::text[] THEN 'FAIL: invalid roles'
        WHEN ep.cmd IN ('SELECT', 'DELETE')
             AND regexp_replace(lower(coalesce(pol.qual, '')), '\s+', '', 'g') <> '(owner_id=(selectauth.uid()asuid))'
            THEN 'FAIL: weak USING expression'
        WHEN ep.cmd = 'INSERT'
             AND regexp_replace(lower(coalesce(pol.with_check, '')), '\s+', '', 'g') <> '(owner_id=(selectauth.uid()asuid))'
            THEN 'FAIL: weak WITH CHECK expression'
        WHEN ep.cmd = 'UPDATE'
             AND (
                 regexp_replace(lower(coalesce(pol.qual, '')), '\s+', '', 'g') <> '(owner_id=(selectauth.uid()asuid))'
                 OR regexp_replace(lower(coalesce(pol.with_check, '')), '\s+', '', 'g') <> '(owner_id=(selectauth.uid()asuid))'
             )
            THEN 'FAIL: weak UPDATE expression'
        ELSE 'PASS'
    END AS check_status
FROM expected_policies ep
LEFT JOIN pg_namespace ns
    ON ns.nspname = 'public'
LEFT JOIN pg_class cls
    ON cls.relnamespace = ns.oid
   AND cls.relname = ep.table_name
LEFT JOIN pg_policies pol
    ON pol.schemaname = 'public'
   AND pol.tablename = ep.table_name
   AND pol.cmd = ep.cmd
   AND pol.policyname = ep.policy_name
ORDER BY ep.table_name, ep.cmd;
