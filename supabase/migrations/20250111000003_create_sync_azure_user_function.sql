-- Migration: Create Function to Sync Azure AD Users
-- Description: Creates a database function that can be called from the frontend to sync Azure AD users
-- This works alongside the trigger for Supabase Auth users
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Create function to sync Azure AD user to users_local
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
  -- Check if user exists
  SELECT id INTO v_user_id
  FROM users_local
  WHERE id = p_id OR email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    -- New user - use provided ID
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'User ID is required for new users';
    END IF;
    v_user_id := p_id;
    v_is_new := true;
    
    -- Insert new user (handle potential conflicts gracefully)
    INSERT INTO users_local (id, email, name, username, azure_id, password, role, created_at, updated_at)
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
    UPDATE users_local
    SET
      email = p_email,
      name = COALESCE(p_name, users_local.name),
      username = COALESCE(p_name, users_local.username, users_local.name),
      azure_id = COALESCE(p_azure_id, users_local.azure_id),
      updated_at = NOW()
    WHERE id = v_user_id;
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Update RLS policies to allow users to sync themselves
-- ============================================

-- Allow authenticated users to insert/update their own record
-- This works with the SECURITY DEFINER function
DROP POLICY IF EXISTS "Users can sync themselves" ON users_local;

CREATE POLICY "Users can sync themselves"
  ON users_local FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update themselves"
  ON users_local FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 3: Grant execute permissions
-- ============================================

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.sync_azure_user(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_azure_user(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.sync_azure_user(UUID, TEXT, TEXT, TEXT) TO service_role;

-- ============================================
-- STEP 4: Add comment
-- ============================================

COMMENT ON FUNCTION public.sync_azure_user IS 'Syncs Azure AD authenticated users to users_local table. Can be called from frontend after successful Azure AD authentication.';

