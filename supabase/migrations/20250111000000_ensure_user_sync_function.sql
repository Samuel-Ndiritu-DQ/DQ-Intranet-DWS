-- Migration: Ensure User Sync Function
-- Description: Creates a helper function to ensure user data is synced to users_local table
-- This provides a database-level safety net for user data capture
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Create function to ensure user exists in users_local
-- ============================================

CREATE OR REPLACE FUNCTION ensure_user_in_local(
  p_id UUID,
  p_email TEXT,
  p_username TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'member'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM users_local
  WHERE id = p_id OR email = p_email
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- User exists, update if needed
    UPDATE users_local
    SET 
      email = p_email,
      username = COALESCE(p_username, username),
      role = COALESCE(p_role, role, 'member'),
      password = COALESCE(password, 'AZURE_AD_AUTHENTICATED')
    WHERE id = v_user_id;
    
    RETURN v_user_id;
  ELSE
    -- User doesn't exist, insert new record
    INSERT INTO users_local (id, email, username, password, role, created_at)
    VALUES (
      p_id,
      p_email,
      p_username,
      'AZURE_AD_AUTHENTICATED',
      COALESCE(p_role, 'member'),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      username = COALESCE(EXCLUDED.username, users_local.username),
      role = COALESCE(EXCLUDED.role, users_local.role),
      password = COALESCE(EXCLUDED.password, users_local.password);
    
    RETURN p_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail - this is a safety net function
    RAISE WARNING 'Error in ensure_user_in_local: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role and anon (for API calls)
GRANT EXECUTE ON FUNCTION ensure_user_in_local(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION ensure_user_in_local(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_in_local(UUID, TEXT, TEXT, TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION ensure_user_in_local IS 'Helper function to ensure user data exists in users_local table. Can be called as a safety net if sync-user API fails.';

-- ============================================
-- STEP 2: Create view to check for users missing from users_local
-- ============================================

-- Note: This view is informational only since Azure AD users don't exist in auth.users
-- But we can create a view to help identify any sync issues

CREATE OR REPLACE VIEW users_sync_status AS
SELECT 
  id,
  email,
  username,
  role,
  created_at,
  CASE 
    WHEN created_at < NOW() - INTERVAL '1 day' THEN 'synced'
    WHEN created_at >= NOW() - INTERVAL '1 day' THEN 'recent'
    ELSE 'unknown'
  END as sync_status
FROM users_local
ORDER BY created_at DESC;

-- Grant select permission
GRANT SELECT ON users_sync_status TO anon;
GRANT SELECT ON users_sync_status TO authenticated;

COMMENT ON VIEW users_sync_status IS 'View to check user sync status in users_local table';

