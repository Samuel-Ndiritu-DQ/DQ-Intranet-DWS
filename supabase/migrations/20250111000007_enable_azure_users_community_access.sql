-- Migration: Enable Azure AD Users to Join Communities and Interact
-- Description: Fixes foreign keys and RLS policies to allow Azure AD users (users_local) 
--              to join/leave communities and interact with all marketplace features
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Fix memberships table foreign key
-- ============================================

-- Drop existing foreign key if it references auth.users
DO $$ 
BEGIN
  -- Check if foreign key exists and references auth.users
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'memberships' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'user_id'
  ) THEN
    -- Drop the constraint (we'll recreate it)
    ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_user_id_fkey;
  END IF;
END $$;

-- Add foreign key to users_local (if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'memberships' 
      AND constraint_name = 'memberships_user_id_fkey'
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE memberships
      ADD CONSTRAINT memberships_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users_local(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================
-- STEP 2: Update RLS policies for memberships
-- ============================================

-- Drop ALL existing policies on memberships (comprehensive cleanup)
DROP POLICY IF EXISTS "Authenticated users can create memberships" ON memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON memberships;
DROP POLICY IF EXISTS "Allow authenticated insert memberships" ON memberships;
DROP POLICY IF EXISTS "Allow delete own memberships" ON memberships;
DROP POLICY IF EXISTS "Users can insert own record" ON memberships;
DROP POLICY IF EXISTS "Users can update own record" ON memberships;
DROP POLICY IF EXISTS "Anyone can view membership counts" ON memberships;
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
DROP POLICY IF EXISTS "Anyone can view memberships" ON memberships;
DROP POLICY IF EXISTS "Users can join communities" ON memberships;
DROP POLICY IF EXISTS "Users can leave communities" ON memberships;
DROP POLICY IF EXISTS "Allow public read memberships" ON memberships;
DROP POLICY IF EXISTS "Memberships are viewable" ON memberships;
DROP POLICY IF EXISTS "Memberships are viewable by everyone" ON memberships;
DROP POLICY IF EXISTS "Users can create memberships" ON memberships;
DROP POLICY IF EXISTS "Users can update memberships" ON memberships;
DROP POLICY IF EXISTS "Users can delete memberships" ON memberships;

-- SELECT: Anyone can view memberships (for member counts)
CREATE POLICY "Anyone can view memberships"
  ON memberships FOR SELECT
  USING (true);

-- INSERT: Allow users to join communities
-- Allow any insert - application validates user exists in users_local
CREATE POLICY "Users can join communities"
  ON memberships FOR INSERT
  WITH CHECK (true);

-- DELETE: Allow users to leave communities
-- Allow any delete - application validates ownership
CREATE POLICY "Users can leave communities"
  ON memberships FOR DELETE
  USING (true);

-- ============================================
-- STEP 3: Ensure communities table policies allow interaction
-- ============================================

-- Drop ALL existing policies on communities (comprehensive cleanup)
DROP POLICY IF EXISTS "Allow authenticated create communities" ON communities;
DROP POLICY IF EXISTS "Allow update own communities" ON communities;
DROP POLICY IF EXISTS "Users can create communities" ON communities;
DROP POLICY IF EXISTS "Users can update communities" ON communities;
DROP POLICY IF EXISTS "Allow public read communities" ON communities;
DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
DROP POLICY IF EXISTS "Communities are viewable" ON communities;
DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
DROP POLICY IF EXISTS "Community owners can update" ON communities;
DROP POLICY IF EXISTS "Anyone can view communities" ON communities;

-- SELECT: Anyone can view communities
CREATE POLICY "Anyone can view communities"
  ON communities FOR SELECT
  USING (true);

-- INSERT: Allow creating communities (application validates user)
CREATE POLICY "Users can create communities"
  ON communities FOR INSERT
  WITH CHECK (true);

-- UPDATE: Allow updating communities (application validates ownership)
CREATE POLICY "Users can update communities"
  ON communities FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 4: Fix posts table RLS policies
-- ============================================

-- Ensure posts table exists and has proper foreign key
DO $$
BEGIN
  -- Check if posts table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can create posts" ON posts;
    DROP POLICY IF EXISTS "Users can update posts" ON posts;
    DROP POLICY IF EXISTS "Users can delete posts" ON posts;
    DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
    DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
    DROP POLICY IF EXISTS "Users can update own posts" ON posts;
    DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
    
    -- SELECT: Anyone can view posts
    CREATE POLICY "Anyone can view posts"
      ON posts FOR SELECT
      USING (true);
    
    -- INSERT: Allow creating posts (application validates user)
    CREATE POLICY "Users can create posts"
      ON posts FOR INSERT
      WITH CHECK (true);
    
    -- UPDATE: Allow updating posts (application validates ownership)
    CREATE POLICY "Users can update own posts"
      ON posts FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    -- DELETE: Allow deleting posts (application validates ownership)
    CREATE POLICY "Users can delete own posts"
      ON posts FOR DELETE
      USING (true);
  END IF;
END $$;

-- ============================================
-- STEP 5: Fix comments table RLS policies
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    -- Drop existing policies that use auth.uid()
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
    DROP POLICY IF EXISTS "Anyone can view active comments" ON comments;
    DROP POLICY IF EXISTS "Users can create comments" ON comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON comments;
    DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
    
    -- SELECT: Anyone can view active comments
    CREATE POLICY "Anyone can view active comments"
      ON comments FOR SELECT
      USING (status = 'active' OR status IS NULL);
    
    -- INSERT: Allow creating comments (application validates user)
    CREATE POLICY "Users can create comments"
      ON comments FOR INSERT
      WITH CHECK (true);
    
    -- UPDATE: Allow updating comments (application validates ownership)
    CREATE POLICY "Users can update own comments"
      ON comments FOR UPDATE
      USING (true)
      WITH CHECK (true);
    
    -- DELETE: Allow deleting comments (application validates ownership)
    CREATE POLICY "Users can delete own comments"
      ON comments FOR DELETE
      USING (true);
  END IF;
END $$;

-- ============================================
-- STEP 6: Fix reactions table RLS policies
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions') THEN
    -- Drop existing policies that use auth.uid()
    DROP POLICY IF EXISTS "Authenticated users can create reactions" ON reactions;
    DROP POLICY IF EXISTS "Users can delete their own reactions" ON reactions;
    DROP POLICY IF EXISTS "Anyone can view reactions" ON reactions;
    DROP POLICY IF EXISTS "Users can create reactions" ON reactions;
    DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;
    
    -- SELECT: Anyone can view reactions
    CREATE POLICY "Anyone can view reactions"
      ON reactions FOR SELECT
      USING (true);
    
    -- INSERT: Allow creating reactions (application validates user)
    CREATE POLICY "Users can create reactions"
      ON reactions FOR INSERT
      WITH CHECK (true);
    
    -- DELETE: Allow deleting reactions (application validates ownership)
    CREATE POLICY "Users can delete own reactions"
      ON reactions FOR DELETE
      USING (true);
  END IF;
END $$;

-- ============================================
-- STEP 7: Grant necessary permissions
-- ============================================

-- Grant permissions on memberships
GRANT SELECT, INSERT, DELETE ON memberships TO authenticated, anon;

-- Grant permissions on communities
GRANT SELECT, INSERT, UPDATE ON communities TO authenticated, anon;

-- Grant permissions on posts (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO authenticated, anon;
  END IF;
END $$;

-- Grant permissions on comments (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated, anon;
  END IF;
END $$;

-- Grant permissions on reactions (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions') THEN
    GRANT SELECT, INSERT, DELETE ON reactions TO authenticated, anon;
  END IF;
END $$;

-- ============================================
-- STEP 8: Add comments
-- ============================================

COMMENT ON TABLE memberships IS 'Community memberships - user_id references users_local.id (Azure AD users)';
COMMENT ON CONSTRAINT memberships_user_id_fkey ON memberships IS 'Foreign key to users_local.id (Azure AD users)';

