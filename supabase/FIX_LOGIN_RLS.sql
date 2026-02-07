-- ========================================
-- RLS FIX: Kullanıcıların kendi rollerini görmesini sağla
-- ========================================

-- 1. Önce eski politikayı temizleyelim (çakışma olmasın)
DROP POLICY IF EXISTS "Users can view their own worker profile" ON worker_tb;
DROP POLICY IF EXISTS "Admins can view all workers" ON worker_tb;

-- 2. Kullanıcı kendi profilini görebilsin (Login kontrolü için ŞART)
CREATE POLICY "Users can view their own worker profile"
ON worker_tb
FOR SELECT
USING (
  auth.uid() = id
  OR
  email = auth.jwt() ->> 'email'
);

-- 3. Adminler herkesi görebilsin
CREATE POLICY "Admins can view all workers"
ON worker_tb
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'brand_admin'
  )
);

-- ========================================
-- DOĞRULAMA
-- ========================================
-- Bu sorgu, giriş yapan kullanıcının kendi rolünü görmesini sağlar.
