-- Migration: Fix community_post_reactions_new and community_post_comments_new for Azure AD
-- Description: Fixes RLS policies and foreign keys for the new interaction tables used by frontend
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Fix community_post_reactions_new table
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_post_reactions_new') THEN
    -- Fix foreign key if it references auth.users
    ALTER TABLE community_post_reactions_new DROP CONSTRAINT IF EXISTS community_post_reactions_new_user_id_fkey;
    
    -- Add foreign key to users_local if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'community_post_reactions_new' 
        AND constraint_name = 'community_post_reactions_new_user_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE community_post_reactions_new
        ADD CONSTRAINT community_post_reactions_new_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Enable RLS
    ALTER TABLE community_post_reactions_new ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view reactions" ON community_post_reactions_new;
    DROP POLICY IF EXISTS "Authenticated users can create reactions" ON community_post_reactions_new;
    DROP POLICY IF EXISTS "Users can delete their own reactions" ON community_post_reactions_new;
    DROP POLICY IF EXISTS "Users can create reactions" ON community_post_reactions_new;
    DROP POLICY IF EXISTS "Users can delete own reactions" ON community_post_reactions_new;
    
    -- Create new policies
    CREATE POLICY "Anyone can view reactions"
      ON community_post_reactions_new FOR SELECT
      USING (true);
    
    CREATE POLICY "Users can create reactions"
      ON community_post_reactions_new FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can delete reactions"
      ON community_post_reactions_new FOR DELETE
      USING (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, DELETE ON community_post_reactions_new TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 2: Fix community_post_comments_new table
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_post_comments_new') THEN
    -- Fix foreign key if it references auth.users
    ALTER TABLE community_post_comments_new DROP CONSTRAINT IF EXISTS community_post_comments_new_user_id_fkey;
    
    -- Add foreign key to users_local if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'community_post_comments_new' 
        AND constraint_name = 'community_post_comments_new_user_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE community_post_comments_new
        ADD CONSTRAINT community_post_comments_new_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Enable RLS
    ALTER TABLE community_post_comments_new ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view active comments" ON community_post_comments_new;
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON community_post_comments_new;
    DROP POLICY IF EXISTS "Users can update their own comments" ON community_post_comments_new;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON community_post_comments_new;
    DROP POLICY IF EXISTS "Users can create comments" ON community_post_comments_new;
    DROP POLICY IF EXISTS "Users can update own comments" ON community_post_comments_new;
    DROP POLICY IF EXISTS "Users can delete own comments" ON community_post_comments_new;
    
    -- Create new policies
    CREATE POLICY "Anyone can view active comments"
      ON community_post_comments_new FOR SELECT
      USING (status = 'active' OR status IS NULL);
    
    CREATE POLICY "Users can create comments"
      ON community_post_comments_new FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can update comments"
      ON community_post_comments_new FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    CREATE POLICY "Users can delete comments"
      ON community_post_comments_new FOR DELETE
      USING (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON community_post_comments_new TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 3: Add comments
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_post_reactions_new') THEN
    COMMENT ON TABLE community_post_reactions_new IS 'Reactions table for posts - user_id references users_local.id (Azure AD users)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_post_comments_new') THEN
    COMMENT ON TABLE community_post_comments_new IS 'Comments table for posts - user_id references users_local.id (Azure AD users)';
  END IF;
END $$;

