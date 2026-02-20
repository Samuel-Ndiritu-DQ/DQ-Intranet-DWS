-- Migration: Clarify Azure Column Mapping
-- Description: Documents and ensures proper mapping of Azure AD data to users_local columns
-- Date: 2025-01-11

-- ============================================
-- COLUMN MAPPING DOCUMENTATION
-- ============================================
-- 
-- Azure AD Data → users_local Columns:
-- 
-- 1. Azure Email → email column
--    - Source: claims.emails[0] || claims.email || claims.preferred_username || account.username
--    - Stored in: email (TEXT UNIQUE NOT NULL)
--    - Purpose: Primary email address for the user
--
-- 2. Azure Display Name → name column
--    - Source: account.name || claims.name
--    - Stored in: name (TEXT)
--    - Purpose: Full display name (e.g., "John Doe")
--
-- 3. Azure Display Name or Email Prefix → username column
--    - Source: name || split_part(email, '@', 1)
--    - Stored in: username (TEXT UNIQUE)
--    - Purpose: Username/handle for the user (e.g., "johndoe" or "john.doe")
--
-- 4. Azure Identifier → azure_id column
--    - Source: account.localAccountId || account.homeAccountId
--    - Stored in: azure_id (TEXT)
--    - Purpose: Unique Azure AD identifier for linking
--
-- ============================================
-- NO NEW COLUMNS NEEDED
-- ============================================
-- 
-- We do NOT need separate columns for:
-- - Azure email vs "local" email (Azure is the source of truth)
-- - Azure username vs "local" username (Azure provides the username)
-- - Azure name vs "local" name (Azure provides the name)
--
-- The existing columns already store Azure AD values directly.
-- If you need to track additional Azure-specific metadata, consider:
-- - Adding a JSONB column for Azure metadata (e.g., tenant_id, upn, etc.)
-- - Or storing in notification_settings JSONB field
--
-- ============================================
-- OPTIONAL: Add Azure metadata column (if needed)
-- ============================================

-- Uncomment if you need to store additional Azure AD metadata:
-- ALTER TABLE users_local 
-- ADD COLUMN IF NOT EXISTS azure_metadata JSONB DEFAULT '{}'::jsonb;
--
-- COMMENT ON COLUMN users_local.azure_metadata IS 'Additional Azure AD metadata (tenant_id, upn, object_id, etc.)';

-- ============================================
-- Update column comments for clarity
-- ============================================

COMMENT ON COLUMN users_local.email IS 'User email address from Azure AD (primary identifier)';
COMMENT ON COLUMN users_local.name IS 'Full display name from Azure AD (e.g., "John Doe")';
COMMENT ON COLUMN users_local.username IS 'Username/handle derived from Azure AD name or email prefix (e.g., "johndoe")';
COMMENT ON COLUMN users_local.azure_id IS 'Azure AD unique identifier (localAccountId or homeAccountId)';

