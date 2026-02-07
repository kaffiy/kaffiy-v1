-- ========================================
-- KAFFIY DASHBOARD KULLANICILARI
-- Developer ve Kahve Sahibi hesapları
-- ========================================

-- Developer kullanıcısı
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
)
SELECT 
    gen_random_uuid(),
    'developer@kaffiy.com',
    'Developer',
    'User',
    'brand_admin', -- Dashboard'da admin yetkisi
    NULL, -- Tüm şirketlere erişim
    true,
    NOW(),
    NOW()
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Kahve sahibi kullanıcısı
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
)
SELECT 
    gen_random_uuid(),
    'cafe@kaffiy.com',
    'Cafe',
    'Owner',
    'brand_admin', -- Dashboard'da admin yetkisi
    NULL, -- Tüm şirketlere erişim
    true,
    NOW(),
    NOW()
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Test kullanıcı (şirket sahibi)
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
)
SELECT 
    gen_random_uuid(),
    'test@kaffiy.com',
    'Test',
    'User',
    'brand_admin',
    (SELECT id FROM company_tb WHERE slug = 'halickahve' LIMIT 1),
    true,
    NOW(),
    NOW()
ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Kontrol
SELECT 
    email,
    name,
    surname,
    role,
    company_id,
    is_active
FROM worker_tb 
WHERE email IN ('developer@kaffiy.com', 'cafe@kaffiy.com', 'test@kaffiy.com', 'gokceoguz27@gmail.com');
