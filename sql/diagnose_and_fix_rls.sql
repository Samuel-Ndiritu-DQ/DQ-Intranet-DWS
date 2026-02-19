-- Comprehensive RLS Fix for glossary_terms
-- This script diagnoses and fixes RLS issues

-- NOSONAR: plsql:S1192 - psql variable references (:'VAR') are required syntax and cannot be extracted
-- Define constants
\set TARGET_TABLE 'glossary_terms'
\set SCHEMA_NAME 'public'
\set POLICY_NAME 'Allow public read access to glossary_terms'

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;

-- Store table name in a temporary table to avoid string literal duplication
CREATE TEMP TABLE IF NOT EXISTS _script_config (
  target_table text,
  schema_name text,
  policy_name text
);

TRUNCATE _script_config;
INSERT INTO _script_config VALUES (:'TARGET_TABLE', :'SCHEMA_NAME', :'POLICY_NAME'); -- NOSONAR

SELECT 
  tablename,
  rowsecurity as rls_enabled,
  schemaname
FROM pg_tables 
WHERE tablename = (SELECT target_table FROM _script_config);

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = (SELECT target_table FROM _script_config);

-- Step 2: Ensure we're in the right schema
SET search_path TO :SCHEMA_NAME;

-- Step 3: Disable RLS temporarily to reset
ALTER TABLE :SCHEMA_NAME.:TARGET_TABLE DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS :'POLICY_NAME' ON :SCHEMA_NAME.:TARGET_TABLE;

-- Step 5: Re-enable RLS
ALTER TABLE :SCHEMA_NAME.:TARGET_TABLE ENABLE ROW LEVEL SECURITY;

-- Step 6: Create a fresh policy (matching exact pattern from dq_lanes, etc.)
CREATE POLICY :'POLICY_NAME'
  ON :SCHEMA_NAME.:TARGET_TABLE
  FOR SELECT
  USING (true);

-- Step 7: Grant explicit table permissions (REQUIRED for Supabase)
-- This is often the missing piece - RLS policy alone isn't enough
GRANT USAGE ON SCHEMA :SCHEMA_NAME TO anon;
GRANT USAGE ON SCHEMA :SCHEMA_NAME TO authenticated;

GRANT SELECT ON :SCHEMA_NAME.:TARGET_TABLE TO anon;
GRANT SELECT ON :SCHEMA_NAME.:TARGET_TABLE TO authenticated;

-- Step 8: Verify the fix
SELECT '=== AFTER FIX ===' as step;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = (SELECT target_table FROM _script_config);

-- Step 9: Test query (should work now)
SELECT '=== TEST QUERY ===' as step;
SELECT COUNT(*) as term_count FROM :SCHEMA_NAME.:TARGET_TABLE;

-- Cleanup
DROP TABLE IF EXISTS _script_config;

