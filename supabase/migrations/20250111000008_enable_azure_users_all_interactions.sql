-- Migration: Enable Azure AD Users to Post, Comment, React, Create Polls, and Upload Media
-- Description: Fixes RLS policies and foreign keys for all interaction tables to allow Azure AD users
--              to fully interact with communities marketplace
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Fix posts_v2 table (main posts table used by frontend)
-- ============================================

-- Fix foreign key if it references auth.users
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'posts_v2' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE posts_v2 DROP CONSTRAINT IF EXISTS posts_v2_user_id_fkey;
  END IF;
END $$;

-- Add foreign key to users_local if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'posts_v2' 
      AND constraint_name = 'posts_v2_user_id_fkey'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE posts_v2
      ADD CONSTRAINT posts_v2_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on posts_v2
ALTER TABLE posts_v2 ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view posts_v2" ON posts_v2;
DROP POLICY IF EXISTS "Users in users_local can create posts_v2" ON posts_v2;
DROP POLICY IF EXISTS "Users can update their own posts_v2" ON posts_v2;
DROP POLICY IF EXISTS "Users can delete their own posts_v2" ON posts_v2;
DROP POLICY IF EXISTS "Authenticated users can create posts_v2" ON posts_v2;

-- Create new policies
CREATE POLICY "Anyone can view posts_v2"
  ON posts_v2 FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts_v2"
  ON posts_v2 FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update posts_v2"
  ON posts_v2 FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete posts_v2"
  ON posts_v2 FOR DELETE
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON posts_v2 TO authenticated, anon;

-- ============================================
-- STEP 2: Fix comments table (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    -- Enable RLS
    ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view active comments" ON comments;
    DROP POLICY IF EXISTS "Users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
    
    -- Create new policies
    CREATE POLICY "Anyone can view comments"
      ON comments FOR SELECT
      USING (status = 'active' OR status IS NULL);
    
    CREATE POLICY "Users can create comments"
      ON comments FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can update comments"
      ON comments FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    CREATE POLICY "Users can delete comments"
      ON comments FOR DELETE
      USING (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 3: Fix reactions table (if exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions') THEN
    -- Enable RLS
    ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view reactions" ON reactions;
    DROP POLICY IF EXISTS "Users can create reactions" ON reactions;
    DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;
    DROP POLICY IF EXISTS "Authenticated users can create reactions" ON reactions;
    DROP POLICY IF EXISTS "Users can delete their own reactions" ON reactions;
    
    -- Create new policies
    CREATE POLICY "Anyone can view reactions"
      ON reactions FOR SELECT
      USING (true);
    
    CREATE POLICY "Users can create reactions"
      ON reactions FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can delete reactions"
      ON reactions FOR DELETE
      USING (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, DELETE ON reactions TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 4: Fix poll_options table (for polls)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poll_options') THEN
    -- Enable RLS
    ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view poll_options" ON poll_options;
    DROP POLICY IF EXISTS "Users can create poll_options" ON poll_options;
    DROP POLICY IF EXISTS "Users can update poll_options" ON poll_options;
    
    -- Create new policies
    CREATE POLICY "Anyone can view poll_options"
      ON poll_options FOR SELECT
      USING (true);
    
    CREATE POLICY "Users can create poll_options"
      ON poll_options FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can update poll_options"
      ON poll_options FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE ON poll_options TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 5: Fix poll_votes table (for poll voting)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'poll_votes') THEN
    -- Fix foreign key if needed - drop existing constraint
    ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_user_id_fkey;
    
    -- Add foreign key to users_local if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'poll_votes' 
        AND constraint_name = 'poll_votes_user_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE poll_votes
        ADD CONSTRAINT poll_votes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Enable RLS
    ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view poll_votes" ON poll_votes;
    DROP POLICY IF EXISTS "Users can create poll_votes" ON poll_votes;
    DROP POLICY IF EXISTS "Users can read own poll votes" ON poll_votes;
    
    -- Create new policies
    CREATE POLICY "Anyone can view poll_votes"
      ON poll_votes FOR SELECT
      USING (true);
    
    CREATE POLICY "Users can create poll_votes"
      ON poll_votes FOR INSERT
      WITH CHECK (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT ON poll_votes TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 6: Fix media_files table (for media uploads)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files') THEN
    -- Fix foreign key if needed - drop existing constraint
    ALTER TABLE media_files DROP CONSTRAINT IF EXISTS media_files_user_id_fkey;
    
    -- Add foreign key to users_local if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'media_files' 
        AND constraint_name = 'media_files_user_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE media_files
        ADD CONSTRAINT media_files_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Enable RLS
    ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Media files are viewable" ON media_files;
    DROP POLICY IF EXISTS "Users can create media files" ON media_files;
    DROP POLICY IF EXISTS "Users can delete own media files" ON media_files;
    
    -- Create new policies
    CREATE POLICY "Anyone can view media_files"
      ON media_files FOR SELECT
      USING (true);
    
    CREATE POLICY "Users can create media_files"
      ON media_files FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can update media_files"
      ON media_files FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    CREATE POLICY "Users can delete media_files"
      ON media_files FOR DELETE
      USING (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON media_files TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 7: Fix community_posts table (if exists and used)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_posts') THEN
    -- Fix foreign key - drop existing constraint
    ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
    
    -- Add foreign key to users_local if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints 
      WHERE table_name = 'community_posts' 
        AND constraint_name = 'community_posts_user_id_fkey'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE community_posts
        ADD CONSTRAINT community_posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
    END IF;
    
    -- Enable RLS
    ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Anyone can view community_posts" ON community_posts;
    DROP POLICY IF EXISTS "Users can create community_posts" ON community_posts;
    DROP POLICY IF EXISTS "Users can update community_posts" ON community_posts;
    DROP POLICY IF EXISTS "Users can delete community_posts" ON community_posts;
    
    -- Create new policies
    CREATE POLICY "Anyone can view community_posts"
      ON community_posts FOR SELECT
      USING (true);
    
    CREATE POLICY "Users can create community_posts"
      ON community_posts FOR INSERT
      WITH CHECK (true);
    
    CREATE POLICY "Users can update community_posts"
      ON community_posts FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    CREATE POLICY "Users can delete community_posts"
      ON community_posts FOR DELETE
      USING (true);
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON community_posts TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 8: Add comments
-- ============================================

COMMENT ON TABLE posts_v2 IS 'Main posts table - user_id references users_local.id (Azure AD users)';
COMMENT ON CONSTRAINT posts_v2_user_id_fkey ON posts_v2 IS 'Foreign key to users_local.id (Azure AD users)';

