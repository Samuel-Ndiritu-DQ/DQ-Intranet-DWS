-- Migration: Verify and Fix Azure AD Setup
-- Description: Verifies the previous migration was applied and fixes any remaining issues
-- Date: 2025-01-01

-- ============================================
-- STEP 1: Verify user_exists_in_local function exists
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'user_exists_in_local'
  ) THEN
    CREATE OR REPLACE FUNCTION user_exists_in_local(user_id_param UUID)
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM users_local WHERE id = user_id_param
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    RAISE NOTICE 'Created user_exists_in_local function';
  ELSE
    RAISE NOTICE 'user_exists_in_local function already exists';
  END IF;
  
  -- Ensure function is executable by anon and authenticated
  GRANT EXECUTE ON FUNCTION user_exists_in_local(UUID) TO anon;
  GRANT EXECUTE ON FUNCTION user_exists_in_local(UUID) TO authenticated;
END $$;

-- ============================================
-- STEP 2: Ensure all foreign keys point to users_local
-- ============================================

-- Fix posts_v2
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'posts_v2' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  ) THEN
    ALTER TABLE posts_v2 DROP CONSTRAINT IF EXISTS posts_v2_user_id_fkey;
    ALTER TABLE posts_v2 ADD CONSTRAINT posts_v2_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed posts_v2 foreign key';
  END IF;
END $$;

-- Fix community_post_comments_new
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'community_post_comments_new' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  ) THEN
    ALTER TABLE community_post_comments_new DROP CONSTRAINT IF EXISTS community_post_comments_new_user_id_fkey;
    ALTER TABLE community_post_comments_new ADD CONSTRAINT community_post_comments_new_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed community_post_comments_new foreign key';
  END IF;
END $$;

-- Fix community_post_reactions_new
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'community_post_reactions_new' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  ) THEN
    ALTER TABLE community_post_reactions_new DROP CONSTRAINT IF EXISTS community_post_reactions_new_user_id_fkey;
    ALTER TABLE community_post_reactions_new ADD CONSTRAINT community_post_reactions_new_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed community_post_reactions_new foreign key';
  END IF;
END $$;

-- Fix memberships
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'memberships' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  ) THEN
    ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;
    ALTER TABLE memberships ADD CONSTRAINT memberships_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed memberships foreign key';
  END IF;
END $$;

-- ============================================
-- STEP 3: Ensure RLS policies are correct
-- ============================================

-- Drop and recreate all policies to ensure they're correct
-- This is safe because we're using IF EXISTS

-- Posts policies
DROP POLICY IF EXISTS "Users in users_local can create posts_v2" ON posts_v2;
CREATE POLICY "Users in users_local can create posts_v2"
  ON posts_v2 FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- Comments policies  
DROP POLICY IF EXISTS "Users in users_local can create comments" ON community_post_comments_new;
CREATE POLICY "Users in users_local can create comments"
  ON community_post_comments_new FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- Reactions policies
DROP POLICY IF EXISTS "Users in users_local can create reactions" ON community_post_reactions_new;
CREATE POLICY "Users in users_local can create reactions"
  ON community_post_reactions_new FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- Memberships policies
DROP POLICY IF EXISTS "Users in users_local can create memberships" ON memberships;
CREATE POLICY "Users in users_local can create memberships"
  ON memberships FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- ============================================
-- STEP 4: Ensure permissions are granted to anon role
-- ============================================

-- Grant all necessary permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON posts_v2 TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_comments_new TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_reactions_new TO anon;
GRANT SELECT, INSERT, DELETE ON memberships TO anon;

-- Also ensure authenticated role has permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON posts_v2 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_comments_new TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_reactions_new TO authenticated;
GRANT SELECT, INSERT, DELETE ON memberships TO authenticated;

-- ============================================
-- STEP 5: Verify users_local table permissions
-- ============================================

-- Ensure anon can SELECT from users_local (needed for user_exists_in_local function)
GRANT SELECT ON users_local TO anon;
GRANT SELECT ON users_local TO authenticated;

-- ============================================
-- STEP 6: Create diagnostic function
-- ============================================

CREATE OR REPLACE FUNCTION test_user_insert(user_id_param UUID, community_id_param UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT user_exists_in_local(user_id_param) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN QUERY SELECT FALSE, 'User does not exist in users_local table'::TEXT;
    RETURN;
  END IF;
  
  -- Try to insert membership
  BEGIN
    INSERT INTO memberships (user_id, community_id)
    VALUES (user_id_param, community_id_param);
    RETURN QUERY SELECT TRUE, 'Successfully inserted membership'::TEXT;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION test_user_insert IS 'Test function to verify user can insert into memberships table';

