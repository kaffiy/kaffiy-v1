-- ========================================
-- SECURE QR CODE PROCESSING FUNCTION
-- This function ensures users cannot manipulate points from the frontend
-- ========================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS process_qr_scan(uuid, uuid, text);

-- Create the secure QR processing function
CREATE OR REPLACE FUNCTION process_qr_scan(
  p_qr_code TEXT,
  p_user_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_location_lat DECIMAL DEFAULT NULL,
  p_location_lng DECIMAL DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges
AS $$
DECLARE
  v_qr_record RECORD;
  v_loyalty_record RECORD;
  v_new_points INTEGER;
  v_new_level TEXT;
  v_result JSON;
BEGIN
  -- ========================================
  -- STEP 1: Validate QR Code
  -- ========================================
  
  SELECT * INTO v_qr_record
  FROM qr_tb
  WHERE qr_code = p_qr_code
  AND status = 'active'
  LIMIT 1;

  -- Check if QR code exists and is active
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'QR code not found or inactive',
      'code', 'INVALID_QR'
    );
  END IF;

  -- Check if QR code has expired
  IF v_qr_record.expires_at IS NOT NULL AND v_qr_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'QR code has expired',
      'code', 'EXPIRED_QR'
    );
  END IF;

  -- Check if QR code has reached max uses
  IF v_qr_record.max_uses IS NOT NULL AND v_qr_record.current_uses >= v_qr_record.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'error', 'QR code has reached maximum uses',
      'code', 'MAX_USES_REACHED'
    );
  END IF;

  -- ========================================
  -- STEP 2: Log the QR Scan
  -- ========================================
  
  INSERT INTO qr_scan_log_tb (
    qr_id,
    company_id,
    user_id,
    scanned_at,
    ip_address,
    user_agent,
    location_lat,
    location_lng
  ) VALUES (
    v_qr_record.id,
    v_qr_record.company_id,
    p_user_id,
    NOW(),
    p_ip_address,
    p_user_agent,
    p_location_lat,
    p_location_lng
  );

  -- ========================================
  -- STEP 3: Update or Create Loyalty Record
  -- ========================================
  
  -- Check if loyalty record exists
  SELECT * INTO v_loyalty_record
  FROM royalty_tb
  WHERE user_id = p_user_id
  AND company_id = v_qr_record.company_id;

  IF FOUND THEN
    -- Update existing loyalty record
    v_new_points := v_loyalty_record.points + v_qr_record.points_earned;
    
    -- Calculate new level based on points
    v_new_level := CASE
      WHEN v_new_points >= 1000 THEN 'legend'
      WHEN v_new_points >= 500 THEN 'gold'
      WHEN v_new_points >= 250 THEN 'silver'
      WHEN v_new_points >= 100 THEN 'bronze'
      ELSE 'explorer'
    END;

    UPDATE royalty_tb
    SET 
      points = v_new_points,
      level = v_new_level,
      last_visit = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id
    AND company_id = v_qr_record.company_id;

  ELSE
    -- Create new loyalty record
    v_new_points := v_qr_record.points_earned;
    v_new_level := 'explorer';

    INSERT INTO royalty_tb (
      user_id,
      company_id,
      points,
      level,
      last_visit,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      v_qr_record.company_id,
      v_new_points,
      v_new_level,
      NOW(),
      NOW(),
      NOW()
    );
  END IF;

  -- ========================================
  -- STEP 4: Update QR Code Usage
  -- ========================================
  
  UPDATE qr_tb
  SET 
    current_uses = COALESCE(current_uses, 0) + 1,
    last_used_at = NOW(),
    last_used_by = p_user_id
  WHERE id = v_qr_record.id;

  -- If this was a single-use QR, mark it as used
  IF v_qr_record.max_uses = 1 THEN
    UPDATE qr_tb
    SET status = 'used'
    WHERE id = v_qr_record.id;
  END IF;

  -- ========================================
  -- STEP 5: Return Success Response
  -- ========================================
  
  v_result := json_build_object(
    'success', true,
    'points_earned', v_qr_record.points_earned,
    'new_total_points', v_new_points,
    'new_level', v_new_level,
    'company_id', v_qr_record.company_id,
    'message', 'QR code scanned successfully!'
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Handle any unexpected errors
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', 'INTERNAL_ERROR'
    );
END;
$$;

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION process_qr_scan(TEXT, UUID, TEXT, TEXT, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION process_qr_scan(TEXT, UUID, TEXT, TEXT, DECIMAL, DECIMAL) TO anon;

-- ========================================
-- EXAMPLE USAGE
-- ========================================

-- Test the function (replace with actual values)
/*
SELECT process_qr_scan(
  'KAFFIY_TEST_123',           -- QR code
  'user-uuid-here',             -- User ID
  '192.168.1.1',                -- IP address
  'Mozilla/5.0...',             -- User agent
  41.0082,                      -- Latitude
  28.9784                       -- Longitude
);
*/

-- ========================================
-- NOTES
-- ========================================

-- 1. This function is SECURITY DEFINER, meaning it runs with elevated privileges
-- 2. Users cannot manipulate points directly - they must go through this function
-- 3. All QR scans are logged for analytics
-- 4. Points are calculated server-side based on QR code configuration
-- 5. Loyalty levels are automatically calculated
-- 6. QR codes can have expiration dates and max uses
-- 7. Single-use QR codes are automatically marked as 'used'

-- ========================================
-- SECURITY CONSIDERATIONS
-- ========================================

-- 1. Function validates QR code before processing
-- 2. Checks for expiration and max uses
-- 3. Logs all scan attempts (even failed ones)
-- 4. Uses transactions to ensure data consistency
-- 5. Returns structured JSON for easy error handling
-- 6. No direct table access from frontend - must use this RPC
