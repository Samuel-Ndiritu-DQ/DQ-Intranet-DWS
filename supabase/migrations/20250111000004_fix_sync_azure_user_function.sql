-- Migration: Fix sync_azure_user Function
-- Description: Fixes the sync_azure_user function to properly handle conflicts and RLS
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Ensure azure_id column has an index for faster lookups
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_local_azure_id ON users_local(azure_id) WHERE azure_id IS NOT NULL;

-- ============================================
-- STEP 2: Create improved sync_azure_user function
-- ============================================

CREATE OR REPLACE FUNCTION public.sync_azure_user(
  p_id UUID,
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_azure_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  azure_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_new_user BOOLEAN
) AS $$
DECLARE
  v_is_new BOOLEAN := false;
  v_user_id UUID;
BEGIN
  -- Validate required parameters
  IF p_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;
  
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  -- Check if user exists by ID, email, or azure_id
  SELECT id INTO v_user_id
  FROM users_local
  WHERE id = p_id 
     OR email = p_email 
     OR (p_azure_id IS NOT NULL AND azure_id = p_azure_id)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    -- New user - attempt insert
    v_user_id := p_id;
    v_is_new := true;
    
    -- Insert new user, handling conflicts on id
    -- If email conflict occurs, exception handler will catch it
    INSERT INTO users_local (
      id, 
      email, 
      name, 
      username, 
      azure_id, 
      password, 
      role, 
      created_at, 
      updated_at
    )
    VALUES (
      v_user_id,
      p_email,
      p_name,
      COALESCE(p_name, split_part(p_email, '@', 1)),
      p_azure_id,
      'AZURE_AD_AUTHENTICATED',
      'member',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users_local.name),
      username = COALESCE(EXCLUDED.name, users_local.username, EXCLUDED.username),
      azure_id = COALESCE(EXCLUDED.azure_id, users_local.azure_id),
      updated_at = NOW();
  ELSE
    -- Existing user - update
    v_is_new := false;
    
    -- Update existing user
    -- Note: We don't update the id column if it's different, as that could break foreign keys
    -- Instead, we ensure the provided id matches or update other fields
    UPDATE users_local
    SET
      email = p_email,
      name = COALESCE(p_name, users_local.name),
      username = COALESCE(p_name, users_local.username, users_local.name),
      azure_id = COALESCE(p_azure_id, users_local.azure_id),
      updated_at = NOW()
    WHERE id = v_user_id;
    
    -- If the provided id is different, we keep the existing id
    -- This handles cases where the same user might have been created with different IDs
  END IF;

  -- Return the user data
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.azure_id,
    u.created_at,
    u.updated_at,
    v_is_new as is_new_user
  FROM users_local u
  WHERE u.id = v_user_id;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Handle unique constraint violations gracefully
    -- This typically means email conflict - find existing user and update
    SELECT id INTO v_user_id
    FROM users_local
    WHERE email = p_email OR (p_azure_id IS NOT NULL AND azure_id = p_azure_id)
    LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
      -- Update the existing user
      -- Don't change the id as it might have foreign key dependencies
      UPDATE users_local
      SET
        email = p_email,
        name = COALESCE(p_name, users_local.name),
        username = COALESCE(p_name, users_local.username, users_local.name),
        azure_id = COALESCE(p_azure_id, users_local.azure_id),
        updated_at = NOW()
      WHERE id = v_user_id;
      
      -- Keep the existing id, don't change it
      
      RETURN QUERY
      SELECT 
        u.id,
        u.email,
        u.name,
        u.azure_id,
        u.created_at,
        u.updated_at,
        false as is_new_user
      FROM users_local u
      WHERE u.id = v_user_id;
    ELSE
      RAISE;
    END IF;
  WHEN OTHERS THEN
    -- Log and re-raise other exceptions for debugging
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Ensure RLS policies allow the function to work
-- ============================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can sync themselves" ON users_local;
DROP POLICY IF EXISTS "Users can update themselves" ON users_local;

-- Create policy that allows the SECURITY DEFINER function to work
-- The function runs with elevated privileges, but we still need policies for direct access
CREATE POLICY "Allow sync function to insert/update"
  ON users_local FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow sync function to update"
  ON users_local FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 4: Grant execute permissions (ensure they exist)
-- ============================================

GRANT EXECUTE ON FUNCTION public.sync_azure_user(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_azure_user(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.sync_azure_user(UUID, TEXT, TEXT, TEXT) TO service_role;

-- ============================================
-- STEP 5: Update comment
-- ============================================

COMMENT ON FUNCTION public.sync_azure_user IS 'Syncs Azure AD authenticated users to users_local table. Handles conflicts on both id and email. Can be called from frontend after successful Azure AD authentication.';

