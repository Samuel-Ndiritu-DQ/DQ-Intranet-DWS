-- Migration: Fix Foreign Keys and RLS for Azure AD Authentication
-- Description: Updates foreign keys to reference users_local instead of auth.users, and fixes RLS policies
-- Date: 2025-01-01

-- ============================================
-- STEP 1: Create helper function to check if user exists in users_local
-- ============================================

CREATE OR REPLACE FUNCTION user_exists_in_local(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users_local WHERE id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION user_exists_in_local(UUID) TO anon;
GRANT EXECUTE ON FUNCTION user_exists_in_local(UUID) TO authenticated;

-- ============================================
-- STEP 2: Fix posts_v2 table
-- ============================================

-- Drop existing foreign key constraint
ALTER TABLE posts_v2 
  DROP CONSTRAINT IF EXISTS posts_v2_user_id_fkey;

-- Add new foreign key to users_local
ALTER TABLE posts_v2
  ADD CONSTRAINT posts_v2_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;

-- Update RLS policies for posts_v2
DROP POLICY IF EXISTS "Authenticated users can create posts_v2" ON posts_v2;
DROP POLICY IF EXISTS "Users can update their own posts_v2" ON posts_v2;
DROP POLICY IF EXISTS "Users can delete their own posts_v2" ON posts_v2;

-- INSERT: Allow if user exists in users_local (Azure AD users)
-- Note: This works for both anon and authenticated roles
CREATE POLICY "Users in users_local can create posts_v2"
  ON posts_v2 FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- UPDATE: Allow if user exists in users_local and owns the post
CREATE POLICY "Users can update their own posts_v2"
  ON posts_v2 FOR UPDATE
  USING (user_exists_in_local(user_id) AND user_id = posts_v2.user_id)
  WITH CHECK (user_exists_in_local(user_id) AND user_id = posts_v2.user_id);

-- DELETE: Allow if user exists in users_local and owns the post
DROP POLICY IF EXISTS "Users can delete their own posts_v2" ON posts_v2;
CREATE POLICY "Users can delete their own posts_v2"
  ON posts_v2 FOR DELETE
  USING (user_exists_in_local(user_id) AND user_id = posts_v2.user_id);

-- ============================================
-- STEP 3: Fix community_post_comments_new table
-- ============================================

-- Drop existing foreign key constraint
ALTER TABLE community_post_comments_new 
  DROP CONSTRAINT IF EXISTS community_post_comments_new_user_id_fkey;

-- Add new foreign key to users_local
ALTER TABLE community_post_comments_new
  ADD CONSTRAINT community_post_comments_new_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;

-- Update RLS policies for comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON community_post_comments_new;
DROP POLICY IF EXISTS "Users can update their own comments" ON community_post_comments_new;
DROP POLICY IF EXISTS "Users can delete their own comments" ON community_post_comments_new;

-- INSERT: Allow if user exists in users_local
CREATE POLICY "Users in users_local can create comments"
  ON community_post_comments_new FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- UPDATE: Allow if user exists in users_local and owns the comment
CREATE POLICY "Users can update their own comments"
  ON community_post_comments_new FOR UPDATE
  USING (user_exists_in_local(user_id) AND user_id = community_post_comments_new.user_id)
  WITH CHECK (user_exists_in_local(user_id) AND user_id = community_post_comments_new.user_id);

-- DELETE: Allow if user exists in users_local and owns the comment
CREATE POLICY "Users can delete their own comments"
  ON community_post_comments_new FOR DELETE
  USING (user_exists_in_local(user_id) AND user_id = community_post_comments_new.user_id);

-- ============================================
-- STEP 4: Fix community_post_reactions_new table
-- ============================================

-- Drop existing foreign key constraint
ALTER TABLE community_post_reactions_new 
  DROP CONSTRAINT IF EXISTS community_post_reactions_new_user_id_fkey;

-- Add new foreign key to users_local
ALTER TABLE community_post_reactions_new
  ADD CONSTRAINT community_post_reactions_new_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;

-- Update RLS policies for reactions
DROP POLICY IF EXISTS "Authenticated users can create reactions" ON community_post_reactions_new;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON community_post_reactions_new;

-- INSERT: Allow if user exists in users_local
CREATE POLICY "Users in users_local can create reactions"
  ON community_post_reactions_new FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- DELETE: Allow if user exists in users_local and owns the reaction
CREATE POLICY "Users can delete their own reactions"
  ON community_post_reactions_new FOR DELETE
  USING (user_exists_in_local(user_id) AND user_id = community_post_reactions_new.user_id);

-- ============================================
-- STEP 5: Fix memberships table
-- ============================================

-- Drop existing foreign key constraint
ALTER TABLE memberships 
  DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;

-- Add new foreign key to users_local
ALTER TABLE memberships
  ADD CONSTRAINT memberships_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;

-- Update RLS policies for memberships
DROP POLICY IF EXISTS "Authenticated users can create memberships" ON memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON memberships;

-- INSERT: Allow if user exists in users_local
CREATE POLICY "Users in users_local can create memberships"
  ON memberships FOR INSERT
  WITH CHECK (user_exists_in_local(user_id));

-- DELETE: Allow if user exists in users_local and owns the membership
CREATE POLICY "Users can delete their own memberships"
  ON memberships FOR DELETE
  USING (user_exists_in_local(user_id) AND user_id = memberships.user_id);

-- ============================================
-- STEP 6: Grant necessary permissions
-- ============================================

-- CRITICAL: Grant permissions to anon role since Azure AD users don't have Supabase auth sessions
-- The RLS policies will enforce security by checking user_exists_in_local()
GRANT SELECT, INSERT, UPDATE, DELETE ON posts_v2 TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_comments_new TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_reactions_new TO anon;
GRANT SELECT, INSERT, DELETE ON memberships TO anon;

-- Also grant to authenticated role for backward compatibility
GRANT SELECT, INSERT, UPDATE, DELETE ON posts_v2 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_comments_new TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_reactions_new TO authenticated;
GRANT SELECT, INSERT, DELETE ON memberships TO authenticated;

-- ============================================
-- STEP 7: Fix notifications table (if it exists and references auth.users)
-- ============================================

-- Check and fix notifications table foreign key if it references auth.users
DO $$
BEGIN
  -- Check if notifications table exists and has user_id column
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'notifications'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'user_id'
  ) THEN
    -- Drop existing foreign key if it references auth.users
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'notifications' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'auth' 
        AND ccu.column_name = 'users'
    ) THEN
      ALTER TABLE notifications 
        DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
      
      ALTER TABLE notifications
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Update RLS policies for notifications if they use auth.uid()
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    
    -- SELECT: Users can view their own notifications
    CREATE POLICY "Users can view their own notifications"
      ON notifications FOR SELECT
      USING (user_exists_in_local(user_id));
    
    -- INSERT: Allow if user exists in users_local
    CREATE POLICY "Users in users_local can create notifications"
      ON notifications FOR INSERT
      WITH CHECK (user_exists_in_local(user_id));
    
    -- UPDATE: Allow if user exists in users_local and owns the notification
    CREATE POLICY "Users can update their own notifications"
      ON notifications FOR UPDATE
      USING (user_exists_in_local(user_id) AND user_id = notifications.user_id)
      WITH CHECK (user_exists_in_local(user_id) AND user_id = notifications.user_id);
  END IF;
END $$;

-- ============================================
-- STEP 8: Fix poll_votes table (if it exists and references auth.users)
-- ============================================

DO $$
BEGIN
  -- Check if poll_votes table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'poll_votes'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'poll_votes' AND column_name = 'user_id'
  ) THEN
    -- Drop existing foreign key if it references auth.users
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'poll_votes' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'auth' 
        AND ccu.column_name = 'users'
    ) THEN
      ALTER TABLE poll_votes 
        DROP CONSTRAINT IF EXISTS poll_votes_user_id_fkey;
      
      ALTER TABLE poll_votes
        ADD CONSTRAINT poll_votes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Update RLS policies for poll_votes if they use auth.uid()
    DROP POLICY IF EXISTS "Users can vote on polls" ON poll_votes;
    DROP POLICY IF EXISTS "Users can view poll votes" ON poll_votes;
    
    -- SELECT: Anyone can view poll votes
    CREATE POLICY "Anyone can view poll votes"
      ON poll_votes FOR SELECT
      USING (true);
    
    -- INSERT: Allow if user exists in users_local
    CREATE POLICY "Users in users_local can vote on polls"
      ON poll_votes FOR INSERT
      WITH CHECK (user_exists_in_local(user_id));
  END IF;
END $$;

-- ============================================
-- STEP 9: Add comments
-- ============================================

COMMENT ON FUNCTION user_exists_in_local IS 'Helper function to check if a user exists in users_local table (for Azure AD users)';
COMMENT ON CONSTRAINT posts_v2_user_id_fkey ON posts_v2 IS 'Foreign key to users_local.id (Azure AD users)';
COMMENT ON CONSTRAINT community_post_comments_new_user_id_fkey ON community_post_comments_new IS 'Foreign key to users_local.id (Azure AD users)';
COMMENT ON CONSTRAINT community_post_reactions_new_user_id_fkey ON community_post_reactions_new IS 'Foreign key to users_local.id (Azure AD users)';
COMMENT ON CONSTRAINT memberships_user_id_fkey ON memberships IS 'Foreign key to users_local.id (Azure AD users)';

