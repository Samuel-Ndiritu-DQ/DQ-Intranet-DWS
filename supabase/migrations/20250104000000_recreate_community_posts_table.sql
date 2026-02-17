-- Migration: Recreate Community Posts Table
-- Description: Drops existing community_posts table and all dependencies, then creates a new table
-- Date: 2025-01-04

-- ============================================
-- STEP 1: Drop all dependencies first
-- ============================================

-- Drop views that depend on community_posts
DROP VIEW IF EXISTS community_posts_with_counts CASCADE;

-- Drop triggers that depend on community_posts
DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
DROP TRIGGER IF EXISTS update_member_activity_on_post ON community_posts;

-- Drop RLS policies on community_posts (they will be recreated automatically when table is dropped)
-- But we drop them explicitly to be safe
DROP POLICY IF EXISTS "Anyone can view active community posts" ON community_posts;
DROP POLICY IF EXISTS "Members can create posts in their communities" ON community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;

-- ============================================
-- STEP 2: Backup data from posts table (if it exists)
-- ============================================

-- Create a backup table to store posts data if posts table exists
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts') THEN
    -- Drop backup table if it exists from a previous failed migration
    DROP TABLE IF EXISTS posts_backup_migration;
    
    -- Create backup table with posts data
    CREATE TABLE posts_backup_migration AS
    SELECT 
      id,
      title,
      content,
      content_html,
      post_type,
      status,
      tags,
      metadata,
      event_date,
      event_location,
      created_by,
      community_id,
      created_at,
      updated_at
    FROM posts;
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Backed up % rows from posts table to posts_backup_migration', row_count;
  ELSE
    RAISE NOTICE 'posts table does not exist, skipping backup';
  END IF;
END $$;

-- ============================================
-- STEP 3: Drop dependent tables (CASCADE will handle foreign keys)
-- ============================================

-- Drop tables that reference community_posts
DROP TABLE IF EXISTS community_assets CASCADE;
DROP TABLE IF EXISTS community_reactions CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;

-- ============================================
-- STEP 4: Drop the main community_posts table
-- ============================================

DROP TABLE IF EXISTS community_posts CASCADE;

-- ============================================
-- STEP 5: Create new community_posts table
-- ============================================

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users_local(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_html TEXT,
  post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'media', 'poll', 'event', 'article', 'announcement')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted', 'flagged')),
  tags TEXT[],
  metadata JSONB,
  event_date TIMESTAMPTZ,
  event_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Add created_by column for compatibility with code that uses this field
  -- It will be synced with user_id via trigger if not explicitly set
  created_by UUID REFERENCES users_local(id) ON DELETE CASCADE,
  
  -- Ensure at least one of user_id or created_by is set
  CONSTRAINT community_posts_user_check CHECK (user_id IS NOT NULL OR created_by IS NOT NULL)
);

-- ============================================
-- STEP 6: Migrate data from posts table to community_posts
-- ============================================

-- Insert data from posts_backup_migration into community_posts
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts_backup_migration') THEN
    -- Insert posts data into new community_posts table
    INSERT INTO community_posts (
      id,
      community_id,
      user_id,
      created_by,
      title,
      content,
      content_html,
      post_type,
      status,
      tags,
      metadata,
      event_date,
      event_location,
      created_at,
      updated_at
    )
    SELECT 
      id,
      community_id,
      created_by, -- Use created_by as user_id (trigger will sync created_by)
      created_by, -- Set created_by explicitly
      title,
      content,
      content_html,
      COALESCE(post_type, 'text')::TEXT, -- Default to 'text' if null
      COALESCE(status, 'active')::TEXT, -- Default to 'active' if null
      tags,
      metadata,
      event_date,
      event_location,
      COALESCE(created_at, NOW()),
      COALESCE(updated_at, NOW())
    FROM posts_backup_migration
    WHERE community_id IS NOT NULL 
      AND created_by IS NOT NULL; -- Only migrate posts with valid community_id and created_by
    
    GET DIAGNOSTICS row_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % rows from posts table to community_posts', row_count;
    
    -- Drop backup table after successful migration
    DROP TABLE IF EXISTS posts_backup_migration;
  ELSE
    RAISE NOTICE 'No posts data to migrate (backup table does not exist)';
  END IF;
END $$;

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================

CREATE INDEX idx_community_posts_community_id ON community_posts(community_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_by ON community_posts(created_by);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_status ON community_posts(status);
CREATE INDEX idx_community_posts_post_type ON community_posts(post_type);
CREATE INDEX idx_community_posts_updated_at ON community_posts(updated_at DESC);

-- ============================================
-- STEP 8: Recreate dependent tables
-- ============================================

-- Community Comments Table
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_local(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_html TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX idx_community_comments_created_at ON community_comments(created_at DESC);
CREATE INDEX idx_community_comments_status ON community_comments(status);

-- Community Reactions Table
CREATE TABLE community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users_local(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'helpful', 'insightful', 'love', 'celebrate')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_reactions_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT community_reactions_unique_user_target UNIQUE (user_id, post_id, comment_id, reaction_type)
);

CREATE INDEX idx_community_reactions_post_id ON community_reactions(post_id);
CREATE INDEX idx_community_reactions_comment_id ON community_reactions(comment_id);
CREATE INDEX idx_community_reactions_user_id ON community_reactions(user_id);
CREATE INDEX idx_community_reactions_type ON community_reactions(reaction_type);

-- Community Assets Table (for uploaded media)
CREATE TABLE community_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users_local(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'document', 'link')),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_assets_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL) OR
    (post_id IS NULL AND comment_id IS NULL)
  )
);

CREATE INDEX idx_community_assets_community_id ON community_assets(community_id);
CREATE INDEX idx_community_assets_post_id ON community_assets(post_id);
CREATE INDEX idx_community_assets_comment_id ON community_assets(comment_id);
CREATE INDEX idx_community_assets_user_id ON community_assets(user_id);
CREATE INDEX idx_community_assets_type ON community_assets(asset_type);

-- ============================================
-- STEP 9: Create update triggers
-- ============================================

-- Function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync created_by and user_id bidirectionally
CREATE OR REPLACE FUNCTION sync_created_by_from_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If created_by is set but user_id is not, use created_by for user_id
  IF NEW.created_by IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id = NEW.created_by;
  -- If user_id is set but created_by is not, use user_id for created_by
  ELSIF NEW.user_id IS NOT NULL AND NEW.created_by IS NULL THEN
    NEW.created_by = NEW.user_id;
  -- If both are set but different, prefer user_id (or you could raise an error)
  ELSIF NEW.user_id IS NOT NULL AND NEW.created_by IS NOT NULL AND NEW.user_id != NEW.created_by THEN
    -- Keep both as-is, but log a warning (or you could raise an error)
    -- For now, we'll keep both values
    NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for community_posts updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to sync created_by with user_id
CREATE TRIGGER sync_community_posts_created_by
  BEFORE INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_created_by_from_user_id();

-- Trigger for community_comments
CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update member last_active_at
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_members
  SET last_active_at = NOW()
  WHERE community_id = NEW.community_id
  AND user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for member activity on post creation
CREATE TRIGGER update_member_activity_on_post
  AFTER INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_member_last_active();

-- Trigger for member activity on comment creation
CREATE TRIGGER update_member_activity_on_comment
  AFTER INSERT ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_member_last_active();

-- ============================================
-- STEP 10: Recreate views
-- ============================================

-- View: Community posts with reaction and comment counts
CREATE OR REPLACE VIEW community_posts_with_counts AS
SELECT 
  p.*,
  COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.reaction_type = 'like'), 0) as like_count,
  COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.reaction_type = 'helpful'), 0) as helpful_count,
  COALESCE(COUNT(DISTINCT r.id) FILTER (WHERE r.reaction_type = 'insightful'), 0) as insightful_count,
  COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active'), 0) as comment_count
FROM community_posts p
LEFT JOIN community_reactions r ON r.post_id = p.id
LEFT JOIN community_comments c ON c.post_id = p.id
WHERE p.status = 'active'
GROUP BY p.id;

-- ============================================
-- STEP 11: Grant Permissions
-- ============================================

-- Grant SELECT permissions to anon and authenticated users
GRANT SELECT ON community_posts TO anon;
GRANT SELECT ON community_posts TO authenticated;
GRANT SELECT ON community_comments TO anon;
GRANT SELECT ON community_comments TO authenticated;
GRANT SELECT ON community_reactions TO anon;
GRANT SELECT ON community_reactions TO authenticated;
GRANT SELECT ON community_assets TO anon;
GRANT SELECT ON community_assets TO authenticated;

-- Grant INSERT/UPDATE/DELETE permissions to authenticated users
GRANT INSERT, UPDATE, DELETE ON community_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON community_comments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON community_reactions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON community_assets TO authenticated;

-- Grant permissions on the view
GRANT SELECT ON community_posts_with_counts TO anon;
GRANT SELECT ON community_posts_with_counts TO authenticated;

-- ============================================
-- STEP 12: Disable RLS for Development
-- ============================================
-- WARNING: Only use in development! Re-enable RLS in production.

ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_assets DISABLE ROW LEVEL SECURITY;

