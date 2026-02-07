-- ========================================
-- CREATE ADMIN USER FOR KAFFIY
-- Email: gokceoguz27@gmail.com
-- Role: admin (full system access)
-- ========================================

-- Step 1: Create admin user in Supabase Auth
-- NOTE: This needs to be done via Supabase Dashboard > Authentication > Users
-- Click "Add User" and use:
-- Email: gokceoguz27@gmail.com
-- Password: tumtavsan2020!
-- Auto Confirm User: YES

-- Step 2: After creating the user in Supabase Dashboard, get the user ID
-- Then run this SQL to add them to worker_tb as admin:

-- IMPORTANT: Replace 'USER_ID_FROM_SUPABASE_AUTH' with the actual UUID
-- You can find this in Supabase Dashboard > Authentication > Users

INSERT INTO worker_tb (
  id,
  email,
  name,
  role,
  company_id,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_SUPABASE_AUTH', -- Replace with actual user ID from auth.users
  'gokceoguz27@gmail.com',
  'Gökçe Oğuz',
  'admin', -- Admin role for full system access
  NULL, -- Admins don't belong to a specific company
  NOW(),
  NOW()
);

-- ========================================
-- ALTERNATIVE: If you want to find existing user ID
-- ========================================

-- First, check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'gokceoguz27@gmail.com';

-- If user exists, insert into worker_tb using their ID:
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
  'gokceoguz27@gmail.com',
  'Gökçe Oğuz',
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- VERIFICATION
-- ========================================

-- Verify the admin user was created
SELECT 
  w.id,
  w.email,
  w.name,
  w.role,
  w.company_id,
  u.email_confirmed_at
FROM worker_tb w
LEFT JOIN auth.users u ON w.id = u.id
WHERE w.email = 'gokceoguz27@gmail.com';

-- Expected result:
-- - role should be 'admin'
-- - company_id should be NULL
-- - email_confirmed_at should have a timestamp

-- ========================================
-- GRANT ADMIN PERMISSIONS
-- ========================================

-- Ensure admin role exists in worker_tb role enum
-- (This should already be defined in your schema)

-- Update RLS policies to recognize admin role
-- (Already defined in rls_policies.sql)

-- ========================================
-- NOTES
-- ========================================

-- 1. Admin users have company_id = NULL
-- 2. Admin role bypasses all RLS restrictions
-- 3. Admins can access all three dashboards:
--    - Kaffiy-Admin (admin.kaffiy.com)
--    - Kaffiy-Dashboard (dashboard.kaffiy.com) - view all cafes
--    - Kaffiy-Mobile-UI (app.kaffiy.com) - test as customer

-- 4. To login:
--    Email: gokceoguz27@gmail.com
--    Password: tumtavsan2020!

-- 5. After login, the system will:
--    - Check worker_tb for role
--    - Grant full access if role = 'admin'
--    - Allow viewing/managing all companies
