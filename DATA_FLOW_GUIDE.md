# 🔄 Kaffiy Data Flow & Access Control

## Overview
This document defines the data access patterns and permissions for each interface in the Kaffiy ecosystem.

---

## 1️⃣ User UI (app.kaffiy.com) - **READ-ONLY for Campaigns**

### Access Level: **SELECT Only**
The mobile/user interface has limited permissions to protect cafe data.

### Data Flow:

#### A. Company Discovery (via Slug)
```typescript
// URL: app.kaffiy.com?shop_id=starbucks-ankara
const { data: company } = await supabase
  .from('company_tb')
  .select('id, name, slug, logo_url')
  .eq('slug', 'starbucks-ankara')
  .eq('is_active', true)
  .single();
```

#### B. View Active Campaigns
```typescript
// Get active campaigns for the cafe
const { data: campaigns } = await supabase
  .from('campaign_tb')
  .select('*')
  .eq('company_id', companyId)
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

#### C. View Own Loyalty Points
```typescript
// User can only see their own points
const { data: loyalty } = await supabase
  .from('royalty_tb')
  .select('points, level, company_id')
  .eq('user_id', userId)
  .eq('company_id', companyId)
  .single();
```

#### D. Scan QR Code & Earn Points
```typescript
// 1. Scan QR code
const { data: qr } = await supabase
  .from('qr_tb')
  .select('id, company_id, points_earned, status')
  .eq('qr_code', scannedCode)
  .eq('status', 'active')
  .single();

// 2. Log the scan (for analytics)
await supabase
  .from('qr_scan_log_tb')
  .insert({
    qr_id: qr.id,
    company_id: qr.company_id,
    user_id: userId,
    scanned_at: new Date(),
    ip_address: userIP,
    location_lat: lat,
    location_lng: lng
  });

// 3. Update loyalty points
await supabase
  .from('royalty_tb')
  .upsert({
    user_id: userId,
    company_id: qr.company_id,
    points: currentPoints + qr.points_earned,
    level: calculateLevel(newPoints)
  });

// 4. Mark QR as used
await supabase
  .from('qr_tb')
  .update({ status: 'used', used_by: userId })
  .eq('id', qr.id);
```

### RLS Policies (User UI):
```sql
-- Users can view active campaigns
CREATE POLICY "Public can view active campaigns"
ON campaign_tb FOR SELECT
USING (status = 'active');

-- Users can view their own loyalty points
CREATE POLICY "Users can view own loyalty points"
ON royalty_tb FOR SELECT
USING (user_id = auth.uid());

-- Users can scan active QR codes
CREATE POLICY "Public can view active QR codes"
ON qr_tb FOR SELECT
USING (status = 'active');
```

---

## 2️⃣ Merchant Dashboard (dashboard.kaffiy.com) - **CRUD for Own Company**

### Access Level: **Full CRUD for company_id**
Cafe owners can manage their own data but cannot see other cafes.

### Data Flow:

#### A. Authentication & Company ID Extraction
```typescript
// 1. User logs in
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'owner@cafe.com',
  password: 'password'
});

// 2. Get company_id from worker_tb
const { data: worker } = await supabase
  .from('worker_tb')
  .select('company_id, role')
  .eq('email', session.user.email)
  .single();

// 3. Store in context
setCompanyId(worker.company_id);
```

#### B. View Own Campaigns
```typescript
// Only see campaigns for their cafe
const { data: campaigns } = await supabase
  .from('campaign_tb')
  .select('*')
  .eq('company_id', companyId)
  .order('created_at', { ascending: false });
```

#### C. Create New Campaign
```typescript
// Create campaign for their cafe only
const { data: newCampaign } = await supabase
  .from('campaign_tb')
  .insert({
    company_id: companyId, // RLS ensures this matches their company
    title: 'Summer Special',
    type: 'discount',
    discount_percentage: 20,
    status: 'active',
    start_date: '2026-06-01',
    end_date: '2026-08-31'
  });
```

#### D. Generate QR Code
```typescript
// Generate unique QR code for their cafe
const qrCode = `KAFFIY_${companyId}_${Date.now()}`;

const { data: qr } = await supabase
  .from('qr_tb')
  .insert({
    company_id: companyId,
    qr_code: qrCode,
    points_earned: 50,
    status: 'active',
    expires_at: '2026-12-31'
  });

// Return QR code URL
const qrUrl = `https://app.kaffiy.com?shop_id=${companySlug}&qr=${qrCode}`;
```

#### E. View Customers (Who Visited Their Cafe)
```typescript
// Only see customers who have loyalty points at their cafe
const { data: customers } = await supabase
  .from('user_tb')
  .select(`
    id,
    email,
    name,
    royalty_tb!inner(points, level)
  `)
  .eq('royalty_tb.company_id', companyId)
  .order('royalty_tb.points', { ascending: false });
```

#### F. View QR Scan Analytics
```typescript
// See when their QR codes were scanned
const { data: scans } = await supabase
  .from('qr_scan_log_tb')
  .select('scanned_at, user_id, location_lat, location_lng')
  .eq('company_id', companyId)
  .gte('scanned_at', startDate)
  .lte('scanned_at', endDate)
  .order('scanned_at', { ascending: false });
```

### RLS Policies (Merchant Dashboard):
```sql
-- Cafe owners can view their own campaigns
CREATE POLICY "Cafe owners can view own campaigns"
ON campaign_tb FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Cafe owners can create campaigns for their company
CREATE POLICY "Cafe owners can create own campaigns"
ON campaign_tb FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT company_id FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Cafe owners can view QR scans for their company
CREATE POLICY "Cafe owners can view own QR scans"
ON qr_scan_log_tb FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
  )
);
```

---

## 3️⃣ Admin Dashboard (Kaffiy Global) - **FULL ACCESS**

### Access Level: **God Mode - All Tables**
Kaffiy team can see and manage everything.

### Data Flow:

#### A. View All Companies
```typescript
// No company_id filter - see everything
const { data: allCompanies } = await supabase
  .from('company_tb')
  .select('*')
  .order('created_at', { ascending: false });
```

#### B. Create New Cafe
```typescript
// Create new cafe and initial manager
const { data: newCafe } = await supabase
  .from('company_tb')
  .insert({
    name: 'New Cafe',
    slug: 'new-cafe',
    payment_tier: 'basic',
    is_active: true
  })
  .select()
  .single();

// Create manager account
await supabase
  .from('worker_tb')
  .insert({
    company_id: newCafe.id,
    email: 'manager@newcafe.com',
    role: 'manager',
    name: 'Cafe Manager'
  });
```

#### C. System-Wide Analytics

**Total Points Distributed by Cafe:**
```typescript
const { data: pointsStats } = await supabase
  .from('royalty_tb')
  .select('company_id, points')
  .then(data => {
    // Group by company_id
    const grouped = data.reduce((acc, row) => {
      acc[row.company_id] = (acc[row.company_id] || 0) + row.points;
      return acc;
    }, {});
    return grouped;
  });
```

**AI Token Usage by Cafe:**
```typescript
const { data: tokenUsage } = await supabase
  .from('token_usage_tb')
  .select('company_id, tokens_used, cost')
  .order('cost', { ascending: false });
```

**QR Scan Heatmap (Time-based):**
```typescript
const { data: scanHeatmap } = await supabase
  .from('qr_scan_log_tb')
  .select('company_id, scanned_at')
  .gte('scanned_at', last30Days)
  .then(data => {
    // Group by hour of day
    const hourlyScans = data.reduce((acc, scan) => {
      const hour = new Date(scan.scanned_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    return hourlyScans;
  });
```

**Top Performing Cafes:**
```typescript
const { data: topCafes } = await supabase
  .from('company_tb')
  .select(`
    id,
    name,
    royalty_tb(points),
    qr_scan_log_tb(count)
  `)
  .order('royalty_tb.points', { ascending: false })
  .limit(10);
```

### RLS Policies (Admin):
```sql
-- Admins can view all companies
CREATE POLICY "Admins can view all companies"
ON company_tb FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- Admins can create companies
CREATE POLICY "Admins can create companies"
ON company_tb FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);

-- Admins can view all token usage
CREATE POLICY "Admins can view all token usage"
ON token_usage_tb FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM worker_tb
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  )
);
```

---

## 🔐 Security Summary

### Data Isolation Matrix

| Table | User UI | Merchant Dashboard | Admin |
|-------|---------|-------------------|-------|
| `company_tb` | ❌ No Access | ✅ Own Company | ✅ All Companies |
| `worker_tb` | ❌ No Access | ✅ Own Workers | ✅ All Workers |
| `campaign_tb` | ✅ Active Only | ✅ Own Campaigns | ✅ All Campaigns |
| `qr_tb` | ✅ Active Only | ✅ Own QR Codes | ✅ All QR Codes |
| `royalty_tb` | ✅ Own Points | ✅ Own Cafe Customers | ✅ All Loyalty |
| `user_tb` | ✅ Own Profile | ✅ Own Customers | ✅ All Users |
| `qr_scan_log_tb` | ❌ No Access | ✅ Own Scans | ✅ All Scans |
| `token_usage_tb` | ❌ No Access | ✅ Own Usage | ✅ All Usage |

---

## 🎯 QR Code Tracking Feature

### How It Works:

1. **Cafe Owner Generates QR:**
   ```
   Dashboard → Create QR → Database (qr_tb)
   QR URL: app.kaffiy.com?shop_id=cafe-slug&qr=KAFFIY_123_456
   ```

2. **Customer Scans QR:**
   ```
   Mobile UI → Detect shop_id & qr params → Auto-load cafe
   → Log scan to qr_scan_log_tb (with timestamp, location, IP)
   → Update user's loyalty points
   → Mark QR as used
   ```

3. **Analytics Dashboard:**
   ```
   Admin → View qr_scan_log_tb
   → See which cafe's QR was scanned when
   → Heatmap: Peak scanning hours
   → Location map: Where customers scan
   ```

### Example Analytics Query:
```typescript
// Which cafe's QR codes are scanned most at 8 AM?
const { data: morningScans } = await supabase
  .from('qr_scan_log_tb')
  .select('company_id, count')
  .gte('scanned_at', '2026-01-01T08:00:00')
  .lt('scanned_at', '2026-01-01T09:00:00')
  .order('count', { ascending: false });
```

---

## 📊 Shared Types (Source of Truth)

All three projects should use the same TypeScript types:

**Location:** `Kaffiy-Dashboard/src/types/database.ts`

**Distribution Strategy:**
1. Keep types in Dashboard as source of truth
2. Copy to Mobile UI and Admin on each update
3. Or use symlinks (if same repo)

**Update Command:**
```bash
# From project root
cp Kaffiy-Dashboard/src/types/database.ts Kaffiy-Mobile-UI/src/types/
cp Kaffiy-Dashboard/src/types/database.ts Kaffiy-Admin/src/types/
```

---

## ✅ Implementation Checklist

### RLS Policies
- [ ] Apply `rls_policies.sql` to Supabase
- [ ] Test with different user roles
- [ ] Verify data isolation

### User UI
- [ ] Implement CompanyContext with slug lookup
- [ ] Add QR scan tracking
- [ ] Test loyalty point updates

### Merchant Dashboard
- [ ] Verify company_id filtering on all pages
- [ ] Add QR code generation
- [ ] Add scan analytics view

### Admin Dashboard
- [ ] Verify full access to all tables
- [ ] Add system-wide analytics
- [ ] Add QR scan heatmap

---

**Last Updated:** 2026-02-07  
**Status:** RLS Policies Defined, Ready for Implementation
