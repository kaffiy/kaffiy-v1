-- ========================================
-- ÇÖZÜM: company_id NULL olabilir hale getir
-- ========================================

-- ADIM 1: company_id constraint'ini kaldır
ALTER TABLE worker_tb 
ALTER COLUMN company_id DROP NOT NULL;

-- ADIM 2: Admin kullanıcısını ekle
INSERT INTO worker_tb (
  id, company_id, shop_id, first_name, last_name, email, 
  role, permissions, is_active, created_at, updated_at
)
SELECT 
  id, NULL, NULL, 'Gökçe', 'Oğuz', 'gokceoguz27@gmail.com',
  'brand_admin', '{}', true, NOW(), NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'brand_admin',
  company_id = NULL,
  is_active = true;

-- ADIM 3: Doğrulama
SELECT 
  w.id,
  w.email,
  w.first_name,
  w.last_name,
  w.role,
  w.company_id,
  w.is_active,
  u.email_confirmed_at
FROM worker_tb w
LEFT JOIN auth.users u ON w.id = u.id
WHERE w.email = 'gokceoguz27@gmail.com';

-- ========================================
-- ALTERNATİF: Kaffiy Admin şirketi oluştur
-- ========================================

-- Eğer constraint'i kaldırmak istemiyorsanız:

-- 1. Kaffiy Admin şirketi oluştur
INSERT INTO company_tb (
  id,
  name,
  slug,
  description,
  payment_tier,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Kaffiy Admin',
  'kaffiy-admin',
  'Kaffiy System Administration',
  'custom',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Admin kullanıcısını bu şirkete bağla
INSERT INTO worker_tb (
  id, company_id, shop_id, first_name, last_name, email, 
  role, permissions, is_active, created_at, updated_at
)
SELECT 
  id, 
  '00000000-0000-0000-0000-000000000001', -- Kaffiy Admin company_id
  NULL, 
  'Gökçe', 
  'Oğuz', 
  'gokceoguz27@gmail.com',
  'brand_admin', 
  '{}', 
  true, 
  NOW(), 
  NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'brand_admin',
  company_id = '00000000-0000-0000-0000-000000000001',
  is_active = true;
