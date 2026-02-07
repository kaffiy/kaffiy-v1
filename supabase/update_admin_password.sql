-- ========================================
-- UPDATE ADMIN PASSWORD
-- Change password for gokceoguz27@gmail.com to '123'
-- ========================================

-- IMPORTANT: This SQL must be run in Supabase Dashboard > SQL Editor

-- Update the password for the admin user
-- Note: Supabase stores passwords as hashed values
-- This uses the auth.users table's built-in password update function

-- Method 1: Using Supabase Dashboard (RECOMMENDED)
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find user: gokceoguz27@gmail.com
-- 3. Click on the user
-- 4. Click "Reset Password" or "Update User"
-- 5. Set new password: 123
-- 6. Save

-- Method 2: Using SQL (if Method 1 doesn't work)
-- This requires the user's UUID from auth.users table

-- First, get the user's ID
SELECT id, email FROM auth.users WHERE email = 'gokceoguz27@gmail.com';

-- Then, you can reset their password by sending a password reset email
-- Or use Supabase Dashboard to manually set it

-- ========================================
-- VERIFICATION
-- ========================================

-- After updating password, verify you can login:
-- Email: gokceoguz27@gmail.com
-- Password: 123

-- ========================================
-- SECURITY NOTE
-- ========================================

-- WARNING: '123' is a very weak password!
-- This is ONLY for development/testing
-- For production, use a strong password:
-- - At least 12 characters
-- - Mix of uppercase, lowercase, numbers, symbols
-- - Enable 2FA (Two-Factor Authentication)

-- ========================================
-- ALTERNATIVE: Create new admin with simple password
-- ========================================

-- If you can't update the password, you can create a new admin user
-- with a simple password directly in Supabase Dashboard:

-- 1. Go to Authentication > Users > Add User
-- 2. Email: admin@kaffiy.com (or any email you prefer)
-- 3. Password: 123
-- 4. Auto Confirm User: YES
-- 5. Click "Create User"

-- Then add to worker_tb:
/*
INSERT INTO worker_tb (
  id,
  email,
  name,
  role,
  company_id,
  created_at,
  updated_at
)
SELECT 
  id,
  'admin@kaffiy.com',
  'Kaffiy Admin',
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@kaffiy.com'
ON CONFLICT (id) DO NOTHING;
*/
