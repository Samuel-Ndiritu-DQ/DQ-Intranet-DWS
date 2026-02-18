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
SET search_path TO public;

-- Step 3: Disable RLS temporarily to reset
ALTER TABLE public.glossary_terms DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Allow public read access to glossary_terms" ON public.glossary_terms;

-- Step 5: Re-enable RLS
ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Step 6: Create a fresh policy (matching exact pattern from dq_lanes, etc.)
CREATE POLICY "Allow public read access to glossary_terms"
  ON public.glossary_terms
  FOR SELECT
  USING (true);

-- Step 7: Grant explicit table permissions (REQUIRED for Supabase)
-- This is often the missing piece - RLS policy alone isn't enough
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.glossary_terms TO anon;
GRANT SELECT ON public.glossary_terms TO authenticated;

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
SELECT COUNT(*) as term_count FROM public.glossary_terms;

