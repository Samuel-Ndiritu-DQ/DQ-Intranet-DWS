-- Comprehensive RLS Fix for glossary_terms
-- This script diagnoses and fixes RLS issues

-- Define constants
\set TARGET_TABLE 'glossary_terms'
\set SCHEMA_NAME 'public'
\set POLICY_NAME 'Allow public read access to glossary_terms'

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;

SELECT 
  tablename,
  rowsecurity as rls_enabled,
  schemaname
FROM pg_tables 
WHERE tablename = :'TARGET_TABLE';

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = :'TARGET_TABLE';

-- Step 2: Ensure we're in the right schema
\set search_path_cmd 'SET search_path TO ' :'SCHEMA_NAME'
:search_path_cmd;

-- Step 3: Disable RLS temporarily to reset
\set disable_rls_cmd 'ALTER TABLE ' :'SCHEMA_NAME' '.' :'TARGET_TABLE' ' DISABLE ROW LEVEL SECURITY'
:disable_rls_cmd;

-- Step 4: Drop ALL existing policies (clean slate)
\set drop_policy_cmd 'DROP POLICY IF EXISTS "' :'POLICY_NAME' '" ON ' :'SCHEMA_NAME' '.' :'TARGET_TABLE'
:drop_policy_cmd;

-- Step 5: Re-enable RLS
\set enable_rls_cmd 'ALTER TABLE ' :'SCHEMA_NAME' '.' :'TARGET_TABLE' ' ENABLE ROW LEVEL SECURITY'
:enable_rls_cmd;

-- Step 6: Create a fresh policy (matching exact pattern from dq_lanes, etc.)
\set create_policy_cmd 'CREATE POLICY "' :'POLICY_NAME' '" ON ' :'SCHEMA_NAME' '.' :'TARGET_TABLE' ' FOR SELECT USING (true)'
:create_policy_cmd;

-- Step 7: Grant explicit table permissions (REQUIRED for Supabase)
-- This is often the missing piece - RLS policy alone isn't enough
\set grant_schema_anon 'GRANT USAGE ON SCHEMA ' :'SCHEMA_NAME' ' TO anon'
\set grant_schema_auth 'GRANT USAGE ON SCHEMA ' :'SCHEMA_NAME' ' TO authenticated'
\set grant_select_anon 'GRANT SELECT ON ' :'SCHEMA_NAME' '.' :'TARGET_TABLE' ' TO anon'
\set grant_select_auth 'GRANT SELECT ON ' :'SCHEMA_NAME' '.' :'TARGET_TABLE' ' TO authenticated'

:grant_schema_anon;
:grant_schema_auth;
:grant_select_anon;
:grant_select_auth;

-- Step 8: Verify the fix
SELECT '=== AFTER FIX ===' as step;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = :'TARGET_TABLE';

-- Step 9: Test query (should work now)
SELECT '=== TEST QUERY ===' as step;
\set test_query_cmd 'SELECT COUNT(*) as term_count FROM ' :'SCHEMA_NAME' '.' :'TARGET_TABLE'
:test_query_cmd;

