-- ========================================
-- KAFFIY DASHBOARD HIZLI KURULUM
-- RLS devre dışı bırak ve kullanıcı oluştur
-- ========================================

-- 1. RLS'i devre dışı bırak
ALTER TABLE company_tb DISABLE ROW LEVEL SECURITY;
ALTER TABLE worker_tb DISABLE ROW LEVEL SECURITY;

-- 2. Halic Kahve'yi kontrol et
SELECT * FROM company_tb WHERE slug = 'halickahve';

-- 3. Dashboard kullanıcıları oluştur
INSERT INTO worker_tb (
    id,
    email,
    name,
    surname,
    role,
    company_id,
    is_active,
    created_at,
    updated_at
) VALUES 
    (gen_random_uuid(), 'developer@kaffiy.com', 'Developer', 'User', 'brand_admin', NULL, true, NOW(), NOW()),
    (gen_random_uuid(), 'cafe@kaffiy.com', 'Cafe', 'Owner', 'brand_admin', NULL, true, NOW(), NOW()),
    (gen_random_uuid(), 'admin@kaffiy.com', 'Admin', 'User', 'brand_admin', NULL, true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- 4. Mevcut kullanıcıları kontrol et
SELECT 
    email,
    name,
    surname,
    role,
    company_id,
    is_active
FROM worker_tb 
WHERE email IN ('gokceoguz27@gmail.com', 'developer@kaffiy.com', 'cafe@kaffiy.com', 'admin@kaffiy.com');

-- 5. Eğer Halic Kahve yoksa oluştur
INSERT INTO company_tb (
    name,
    slug,
    description,
    payment_tier,
    is_active,
    created_at,
    updated_at
) VALUES (
    'Halic Kahve',
    'halickahve',
    'Dashboard test kafesi',
    'premium',
    true,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- 6. Test kullanıcıyı Halic Kahve'ye bağla
UPDATE worker_tb 
SET company_id = (SELECT id FROM company_tb WHERE slug = 'halickahve'),
    role = 'brand_admin'
WHERE email = 'admin@kaffiy.com';

-- 7. Son kontrol
SELECT 
    c.id,
    c.name,
    c.slug,
    c.is_active,
    w.email as admin_email,
    w.role as admin_role,
    w.is_active as worker_active
FROM company_tb c
LEFT JOIN worker_tb w ON w.company_id = c.id AND w.email = 'admin@kaffiy.com'
WHERE c.slug = 'halickahve';

-- 8. RLS'i tekrar aktif et (isteğe bağlı)
-- ALTER TABLE company_tb ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE worker_tb ENABLE ROW LEVEL SECURITY;
