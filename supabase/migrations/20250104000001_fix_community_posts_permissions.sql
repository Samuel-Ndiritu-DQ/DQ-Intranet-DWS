-- Migration: Fix Community Posts Permissions
-- Description: Grants necessary permissions to fix 403 errors
-- Date: 2025-01-04

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

-- Grant INSERT/UPDATE/DELETE permissions to anonymous users (no sign-in required)
GRANT INSERT, UPDATE, DELETE ON community_posts TO anon;
GRANT INSERT, UPDATE, DELETE ON community_comments TO anon;
GRANT INSERT, UPDATE, DELETE ON community_reactions TO anon;
GRANT INSERT, UPDATE, DELETE ON community_assets TO anon;

-- Grant permissions on the view
GRANT SELECT ON community_posts_with_counts TO anon;
GRANT SELECT ON community_posts_with_counts TO authenticated;

-- Ensure RLS is disabled for development
ALTER TABLE community_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_assets DISABLE ROW LEVEL SECURITY;

