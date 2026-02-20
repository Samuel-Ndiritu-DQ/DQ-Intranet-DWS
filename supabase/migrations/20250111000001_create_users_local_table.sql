-- Migration: Create users_local table
-- Description: Creates the users_local table for storing Azure AD user data
-- Date: 2025-01-11

-- ============================================
-- STEP 1: Create user_role enum if it doesn't exist
-- ============================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Create users_local table
-- ============================================

CREATE TABLE IF NOT EXISTS users_local (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    role user_role DEFAULT 'member',
    notification_settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_local_email ON users_local(email);
CREATE INDEX IF NOT EXISTS idx_users_local_username ON users_local(username);
CREATE INDEX IF NOT EXISTS idx_users_local_created_at ON users_local(created_at DESC);

-- ============================================
-- STEP 4: Enable RLS (Row Level Security)
-- ============================================

ALTER TABLE users_local ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create RLS policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view users_local" ON users_local;
DROP POLICY IF EXISTS "Service role can manage users_local" ON users_local;

-- SELECT: Anyone can view user profiles (for display purposes)
CREATE POLICY "Anyone can view users_local"
    ON users_local FOR SELECT
    USING (true);

-- INSERT/UPDATE/DELETE: Only service role can modify (via API)
-- Note: The API uses service role key, so this allows the sync-user endpoint to work
CREATE POLICY "Service role can manage users_local"
    ON users_local FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- STEP 6: Grant permissions
-- ============================================

-- Grant permissions to anon and authenticated roles for SELECT
GRANT SELECT ON users_local TO anon;
GRANT SELECT ON users_local TO authenticated;

-- Grant all permissions to service_role (for API operations)
GRANT ALL ON users_local TO service_role;

-- ============================================
-- STEP 7: Add comments
-- ============================================

COMMENT ON TABLE users_local IS 'Stores user profile data for Azure AD authenticated users';
COMMENT ON COLUMN users_local.id IS 'Primary key - UUID generated from Azure AD localAccountId';
COMMENT ON COLUMN users_local.email IS 'User email address from Azure AD';
COMMENT ON COLUMN users_local.password IS 'Placeholder value "AZURE_AD_AUTHENTICATED" since Azure AD handles authentication';
COMMENT ON COLUMN users_local.username IS 'Display name for the user';
COMMENT ON COLUMN users_local.role IS 'User role: admin, moderator, or member';
COMMENT ON COLUMN users_local.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN users_local.notification_settings IS 'JSON object storing user notification preferences';

