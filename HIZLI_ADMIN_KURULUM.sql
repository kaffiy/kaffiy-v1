-- ========================================
-- HIZLI ADMIN KULLANICI OLUSTURMA
-- ========================================

-- ADIM 1: Supabase Dashboard'a git
-- https://supabase.com/dashboard/project/ivuhmjtnnhieguiblnbr

-- ADIM 2: Authentication > Users > Add User
-- Email: gokceoguz27@gmail.com
-- Password: 123
-- Auto Confirm User: ISARETLEYIN!

-- ADIM 3: Asagidaki SQL'i calistir (SQL Editor'da)

-- Kullaniciyi kontrol et
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'gokceoguz27@gmail.com';

-- Worker tablosuna admin olarak ekle
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
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  company_id = NULL;

-- Dogrulama
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

-- Beklenen sonuc:
-- role = 'admin'
-- company_id = NULL
-- email_confirmed_at = (bir tarih)

-- ========================================
-- GIRIS BILGILERI
-- ========================================
-- Email: gokceoguz27@gmail.com
-- Sifre: 123
-- URL: http://localhost:5173
