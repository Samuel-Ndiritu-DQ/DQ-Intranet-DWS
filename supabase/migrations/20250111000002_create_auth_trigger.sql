-- Migration: Create Database Trigger for Automatic User Syncing
-- Description: Creates a trigger on auth.users to automatically sync users to users_local table
-- This replaces the API-based sync-user endpoint
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Ensure users_local table structure matches requirements
-- ============================================

-- Add name column if it doesn't exist (for compatibility with trigger)
ALTER TABLE users_local 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add azure_id column if it doesn't exist
ALTER TABLE users_local 
ADD COLUMN IF NOT EXISTS azure_id TEXT;

-- Add updated_at column if it doesn't exist
ALTER TABLE users_local 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing records: copy username to name if name is null and username exists
UPDATE users_local 
SET name = username 
WHERE name IS NULL AND username IS NOT NULL;

-- Update existing records to set updated_at if null
UPDATE users_local 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- ============================================
-- STEP 3: Create function to sync user automatically
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_azure_id TEXT;
BEGIN
  -- Extract name and azure_id from metadata
  v_name := NEW.raw_user_meta_data->>'name';
  v_azure_id := NEW.raw_user_meta_data->>'azure_id';
  
  -- Insert or update user in users_local table
  INSERT INTO public.users_local (id, email, name, azure_id, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_azure_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users_local.name),
    azure_id = COALESCE(EXCLUDED.azure_id, users_local.azure_id),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 4: Create trigger on auth.users
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 5: Update RLS policies for users_local
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users_local;
DROP POLICY IF EXISTS "Service role can manage all" ON users_local;
DROP POLICY IF EXISTS "Anyone can view users_local" ON users_local;
DROP POLICY IF EXISTS "Service role can manage users_local" ON users_local;

-- SELECT: Users can view their own data
CREATE POLICY "Users can view own data" 
  ON public.users_local FOR SELECT 
  USING (auth.uid() = id);

-- ALL: Service role can manage all (for admin operations)
CREATE POLICY "Service role can manage all" 
  ON public.users_local FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- ============================================
-- STEP 6: Add comments
-- ============================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically syncs users from auth.users to users_local table when users are created or updated in Supabase Auth';

