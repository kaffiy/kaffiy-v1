-- ========================================
-- HIZLI ÇÖZÜM: Halıc Kahve + Admin Kullanıcı
-- ========================================

-- ADIM 1: Halıc Kahve şirketini oluştur
INSERT INTO company_tb (
  name,
  slug,
  description,
  payment_tier,
  is_active,
  created_at,
  updated_at
) VALUES (
  'Halıc Kahve',
  'halickahve',
  'Test kafesi - Halıc Kahve',
  'premium',
  true,
  NOW(),
  NOW()
) 
ON CONFLICT (slug) DO UPDATE SET
  is_active = true,
  updated_at = NOW()
RETURNING id;

-- ADIM 2: Admin kullanıcısını Halıc Kahve'ye bağla
-- (Yukarıdaki sorgudan dönen company_id'yi kopyalayın veya aşağıdaki sorguyu kullanın)

INSERT INTO worker_tb (
  id, 
  company_id, 
  shop_id, 
  first_name, 
  last_name, 
  email, 
  role, 
  permissions, 
  is_active, 
  created_at, 
  updated_at
)
SELECT 
  u.id,
  c.id,  -- Halıc Kahve company_id
  NULL,
  'Gökçe',
  'Oğuz',
  'gokceoguz27@gmail.com',
  'brand_admin',
  '{}',
  true,
  NOW(),
  NOW()
FROM auth.users u
CROSS JOIN company_tb c
WHERE u.email = 'gokceoguz27@gmail.com'
  AND c.slug = 'halickahve'
ON CONFLICT (id) DO UPDATE SET
  role = 'brand_admin',
  company_id = (SELECT id FROM company_tb WHERE slug = 'halickahve'),
  is_active = true;

-- ADIM 3: Doğrulama
SELECT 
  w.id,
  w.email,
  w.first_name,
  w.last_name,
  w.role,
  c.name as company_name,
  c.slug as company_slug,
  w.is_active,
  u.email_confirmed_at
FROM worker_tb w
LEFT JOIN auth.users u ON w.id = u.id
LEFT JOIN company_tb c ON w.company_id = c.id
WHERE w.email = 'gokceoguz27@gmail.com';

-- Beklenen sonuç:
-- ✅ role = 'brand_admin'
-- ✅ company_name = 'Halıc Kahve'
-- ✅ company_slug = 'halickahve'
-- ✅ is_active = true
-- ✅ email_confirmed_at = (bir tarih)

-- ========================================
-- GİRİŞ BİLGİLERİ
-- ========================================
-- Email: gokceoguz27@gmail.com
-- Şifre: 123
-- URL: http://localhost:5173
-- Şirket: Halıc Kahve
