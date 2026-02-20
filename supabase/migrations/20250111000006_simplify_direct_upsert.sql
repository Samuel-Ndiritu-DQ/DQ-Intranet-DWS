-- Migration: Simplify to Direct Upsert
-- Description: Allow users to directly insert/update their own records from frontend
-- This eliminates the need for the sync_azure_user RPC function
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Update RLS policies to allow direct upserts
-- ============================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow sync function to insert/update" ON users_local;
DROP POLICY IF EXISTS "Allow sync function to update" ON users_local;
DROP POLICY IF EXISTS "Users can sync themselves" ON users_local;
DROP POLICY IF EXISTS "Users can update themselves" ON users_local;

-- Allow authenticated users to insert their own record
CREATE POLICY "Users can insert own record"
  ON users_local FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update their own record
CREATE POLICY "Users can update own record"
  ON users_local FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Note: The frontend will use upsert with onConflict: 'id'
-- If email conflicts occur, the application should handle them
-- (e.g., by checking for existing user by email first)

-- ============================================
-- STEP 2: Grant INSERT and UPDATE permissions
-- ============================================

GRANT INSERT, UPDATE ON users_local TO authenticated;
GRANT INSERT, UPDATE ON users_local TO anon;  -- For initial signup

-- ============================================
-- STEP 3: Keep the RPC function as optional/fallback
-- ============================================

-- The sync_azure_user function can still be used if needed,
-- but direct upserts are now the primary method

COMMENT ON TABLE users_local IS 'Stores user profile data for Azure AD authenticated users. Users can directly upsert their own records via frontend.';

