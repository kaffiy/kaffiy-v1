-- ========================================
-- WORKER_TB TABLO YAPISINI KONTROL ET
-- ========================================

-- Mevcut kolonları gör
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'worker_tb'
ORDER BY ordinal_position;

-- ========================================
-- ADMIN KULLANICI EKLEME (DÜZELTILMIŞ)
-- ========================================

-- Seçenek 1: Sadece gerekli kolonlarla ekle
INSERT INTO worker_tb (
  id,
  email,
  role,
  company_id,
  created_at,
  updated_at
)
SELECT 
  id,
  'gokceoguz27@gmail.com',
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  company_id = NULL;

-- Doğrulama
SELECT * FROM worker_tb WHERE email = 'gokceoguz27@gmail.com';

-- ========================================
-- EĞER NAME KOLONU VARSA AMA FARKLI ADLA
-- ========================================

-- Alternatif kolon isimleri:
-- full_name, worker_name, display_name, first_name, vb.

-- Tüm kolonları görmek için:
SELECT * FROM worker_tb LIMIT 1;
