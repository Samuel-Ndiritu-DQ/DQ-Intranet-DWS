-- SQL Query to Check Users in Database
-- Run this in Supabase SQL Editor to check if users exist

-- ============================================
-- Check users_local table
-- ============================================
SELECT 
  id,
  email,
  name,
  username,
  azure_id,
  role,
  created_at,
  updated_at
FROM users_local
ORDER BY created_at DESC;

-- ============================================
-- Count users
-- ============================================
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as users_last_24h,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as users_last_7d
FROM users_local;

-- ============================================
-- Check auth.users table (if accessible)
-- ============================================
-- Note: This might require service role permissions
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'azure_id' as azure_id
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- Check if trigger exists
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';

-- ============================================
-- Check if function exists
-- ============================================
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

