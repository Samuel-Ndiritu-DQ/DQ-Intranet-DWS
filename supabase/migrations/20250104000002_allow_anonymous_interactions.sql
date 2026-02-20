-- Migration: Allow Anonymous User Interactions
-- Description: Enables anonymous users to interact with communities without signing in
-- Date: 2025-01-04

-- Create a function to handle anonymous users by creating them on-the-fly
-- This ensures each anonymous user gets their own unique record
CREATE OR REPLACE FUNCTION ensure_user_exists(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM users_local WHERE id = user_uuid) THEN
    -- Create anonymous user record on-the-fly
    INSERT INTO users_local (id, email, username, role, created_at)
    VALUES (
      user_uuid,
      'anonymous-' || user_uuid::TEXT || '@system.local',
      'Guest User',
      'guest',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to ensure user exists before insert
CREATE OR REPLACE FUNCTION handle_anonymous_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user_id exists (create if anonymous)
  IF NEW.user_id IS NOT NULL THEN
    NEW.user_id = ensure_user_exists(NEW.user_id);
  END IF;
  
  -- Ensure created_by exists (create if anonymous)
  IF NEW.created_by IS NOT NULL THEN
    NEW.created_by = ensure_user_exists(NEW.created_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for community_posts
DROP TRIGGER IF EXISTS handle_anonymous_user_posts ON community_posts;
CREATE TRIGGER handle_anonymous_user_posts
  BEFORE INSERT ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_anonymous_user();

-- Create trigger for community_comments
DROP TRIGGER IF EXISTS handle_anonymous_user_comments ON community_comments;
CREATE TRIGGER handle_anonymous_user_comments
  BEFORE INSERT ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_anonymous_user();

-- Create trigger for community_reactions
DROP TRIGGER IF EXISTS handle_anonymous_user_reactions ON community_reactions;
CREATE TRIGGER handle_anonymous_user_reactions
  BEFORE INSERT ON community_reactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_anonymous_user();

-- Create trigger for community_assets
DROP TRIGGER IF EXISTS handle_anonymous_user_assets ON community_assets;
CREATE TRIGGER handle_anonymous_user_assets
  BEFORE INSERT ON community_assets
  FOR EACH ROW
  EXECUTE FUNCTION handle_anonymous_user();

-- Note: Anonymous users will be automatically created in users_local when they first interact
-- Each anonymous user gets their own unique record based on their localStorage UUID

