-- ========================================
-- ADMIN KULLANICI EKLEME (DOĞRU VERSİYON)
-- worker_tb: first_name + last_name kullanıyor
-- ========================================

-- ADIM 1: Admin kullanıcısını ekle
INSERT INTO worker_tb (
  id,
  company_id,
  shop_id,
  first_name,
  last_name,
  email,
  phone,
  role,
  permissions,
  is_active,
  last_login,
  created_at,
  updated_at
)
SELECT 
  id,
  NULL,                    -- company_id: Admin'ler company'ye bağlı değil
  NULL,                    -- shop_id: Admin'ler shop'a bağlı değil
  'Gökçe',                 -- first_name
  'Oğuz',                  -- last_name
  'gokceoguz27@gmail.com', -- email
  NULL,                    -- phone
  'brand_admin',           -- role: En yüksek yetki
  '{}',                    -- permissions: Boş object
  true,                    -- is_active
  NULL,                    -- last_login
  NOW(),                   -- created_at
  NOW()                    -- updated_at
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'brand_admin',
  company_id = NULL,
  shop_id = NULL,
  is_active = true;

-- ADIM 2: Doğrulama
SELECT 
  w.id,
  w.email,
  w.first_name,
  w.last_name,
  w.role,
  w.company_id,
  w.shop_id,
  w.is_active,
  u.email_confirmed_at
FROM worker_tb w
LEFT JOIN auth.users u ON w.id = u.id
WHERE w.email = 'gokceoguz27@gmail.com';

-- Beklenen sonuç:
-- ✅ role = 'brand_admin'
-- ✅ company_id = NULL
-- ✅ shop_id = NULL
-- ✅ is_active = true
-- ✅ email_confirmed_at = (bir tarih)

-- ========================================
-- GİRİŞ BİLGİLERİ
-- ========================================
-- Email: gokceoguz27@gmail.com
-- Şifre: 123
-- URL: http://localhost:5173
