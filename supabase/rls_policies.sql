-- ========================================
-- KAFFIY ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures data isolation between cafes and users
-- ========================================

-- ========================================
-- 1. COMPANY TABLE (company_tb)
-- ========================================

-- Enable RLS
ALTER TABLE company_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Cafe owners can only see their own company
CREATE POLICY "Cafe owners can view own company"
ON company_tb
FOR SELECT
USING (
  id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Admins can see all companies
CREATE POLICY "Admins can view all companies"
ON company_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- Policy: Admins can create companies
CREATE POLICY "Admins can create companies"
ON company_tb
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- Policy: Admins can update companies
CREATE POLICY "Admins can update companies"
ON company_tb
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- 2. WORKER TABLE (worker_tb)
-- ========================================

ALTER TABLE worker_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Workers can view workers from their own company
CREATE POLICY "Workers can view own company workers"
ON worker_tb
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Managers can create workers for their company
CREATE POLICY "Managers can create workers for own company"
ON worker_tb
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
    AND (role = 'manager' OR role = 'admin')
  )
);

-- Policy: Admins can view all workers
CREATE POLICY "Admins can view all workers"
ON worker_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- 3. CAMPAIGN TABLE (campaign_tb)
-- ========================================

ALTER TABLE campaign_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active campaigns (for Mobile UI)
CREATE POLICY "Public can view active campaigns"
ON campaign_tb
FOR SELECT
USING (status = 'active');

-- Policy: Cafe owners can view their own campaigns
CREATE POLICY "Cafe owners can view own campaigns"
ON campaign_tb
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Cafe owners can create campaigns for their company
CREATE POLICY "Cafe owners can create own campaigns"
ON campaign_tb
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Cafe owners can update their own campaigns
CREATE POLICY "Cafe owners can update own campaigns"
ON campaign_tb
FOR UPDATE
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
ON campaign_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- 4. QR CODE TABLE (qr_tb)
-- ========================================

ALTER TABLE qr_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active QR codes (for scanning)
CREATE POLICY "Public can view active QR codes"
ON qr_tb
FOR SELECT
USING (status = 'active');

-- Policy: Cafe owners can view their own QR codes
CREATE POLICY "Cafe owners can view own QR codes"
ON qr_tb
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Cafe owners can create QR codes for their company
CREATE POLICY "Cafe owners can create own QR codes"
ON qr_tb
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Users can update QR codes when scanning (mark as used)
CREATE POLICY "Users can mark QR codes as used"
ON qr_tb
FOR UPDATE
USING (status = 'active')
WITH CHECK (status = 'used');

-- Policy: Admins can view all QR codes
CREATE POLICY "Admins can view all QR codes"
ON qr_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- 5. LOYALTY TABLE (royalty_tb)
-- ========================================

ALTER TABLE royalty_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own loyalty points
CREATE POLICY "Users can view own loyalty points"
ON royalty_tb
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can update their own loyalty points (when earning)
CREATE POLICY "Users can update own loyalty points"
ON royalty_tb
FOR UPDATE
USING (user_id = auth.uid());

-- Policy: Users can insert their own loyalty records
CREATE POLICY "Users can create own loyalty records"
ON royalty_tb
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Cafe owners can view loyalty points for their cafe
CREATE POLICY "Cafe owners can view loyalty for own cafe"
ON royalty_tb
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Admins can view all loyalty records
CREATE POLICY "Admins can view all loyalty records"
ON royalty_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- 6. USER TABLE (user_tb)
-- ========================================

ALTER TABLE user_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON user_tb
FOR SELECT
USING (id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_tb
FOR UPDATE
USING (id = auth.uid());

-- Policy: Anyone can create a user account
CREATE POLICY "Anyone can create user account"
ON user_tb
FOR INSERT
WITH CHECK (true);

-- Policy: Cafe owners can view customers who visited their cafe
CREATE POLICY "Cafe owners can view own customers"
ON user_tb
FOR SELECT
USING (
  id IN (
    SELECT user_id 
    FROM royalty_tb 
    WHERE company_id IN (
      SELECT company_id 
      FROM worker_tb 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
ON user_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- 7. TOKEN USAGE TABLE (token_usage_tb)
-- ========================================

ALTER TABLE token_usage_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all token usage
CREATE POLICY "Admins can view all token usage"
ON token_usage_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- Policy: Cafe owners can view their own token usage
CREATE POLICY "Cafe owners can view own token usage"
ON token_usage_tb
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- ========================================
-- 8. QR SCAN TRACKING TABLE (qr_scan_log_tb)
-- New table for tracking QR scans
-- ========================================

-- Create the table first
CREATE TABLE IF NOT EXISTS qr_scan_log_tb (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_id UUID REFERENCES qr_tb(id),
  company_id UUID REFERENCES company_tb(id),
  user_id UUID REFERENCES user_tb(id),
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8)
);

ALTER TABLE qr_scan_log_tb ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert scan logs (for tracking)
CREATE POLICY "Anyone can log QR scans"
ON qr_scan_log_tb
FOR INSERT
WITH CHECK (true);

-- Policy: Cafe owners can view scans for their QR codes
CREATE POLICY "Cafe owners can view own QR scans"
ON qr_scan_log_tb
FOR SELECT
USING (
  company_id IN (
    SELECT company_id 
    FROM worker_tb 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy: Admins can view all scan logs
CREATE POLICY "Admins can view all scan logs"
ON qr_scan_log_tb
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_qr_scan_log_company_id ON qr_scan_log_tb(company_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_log_scanned_at ON qr_scan_log_tb(scanned_at);
CREATE INDEX IF NOT EXISTS idx_qr_scan_log_qr_id ON qr_scan_log_tb(qr_id);

-- ========================================
-- NOTES
-- ========================================

-- To apply these policies in Supabase:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- 4. Verify policies in Table Editor > [table] > Policies tab

-- To test RLS:
-- 1. Create test users with different roles
-- 2. Use Supabase client with different auth tokens
-- 3. Verify data isolation works correctly
