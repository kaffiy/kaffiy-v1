# Kaffiy System Integration Plan

## 🎯 Overview
This document outlines the integration strategy for the three Kaffiy interfaces.

## 📱 Three Interfaces

### 1. Kaffiy-Dashboard (Cafe Owners)
**Purpose:** Cafe owners manage their business operations
**URL:** `dashboard.kaffiy.com`
**Authentication:** Email/Password via Supabase Auth
**Data Scope:** Filtered by `company_id` from `worker_tb`
**Key Features:**
- View their cafe's customers
- Manage campaigns
- Track loyalty points
- Manage team members
- View analytics

**Database Access Pattern:**
```typescript
// User logs in → Get worker record → Extract company_id → Filter all queries
const { data: worker } = await supabase
  .from("worker_tb")
  .select("company_id")
  .eq("email", user.email)
  .single();

// Then all queries use this company_id
const { data: campaigns } = await supabase
  .from("campaign_tb")
  .select("*")
  .eq("company_id", worker.company_id);
```

### 2. Kaffiy-Mobile-UI (Customers)
**Purpose:** Customers interact with cafes, earn points, redeem rewards
**URL:** `app.kaffiy.com` or Mobile App
**Authentication:** Email/Password or Social Login
**Data Scope:** Filtered by `user_id` from `user_tb`
**Key Features:**
- Browse nearby cafes
- Scan QR codes
- View loyalty points
- Redeem rewards
- View campaign offers
- Follow other users

**Database Access Pattern:**
```typescript
// User logs in → Get user_id → Filter all queries
const { data: { user } } = await supabase.auth.getUser();

// Queries filtered by user_id
const { data: loyalty } = await supabase
  .from("royalty_tb")
  .select("*")
  .eq("user_id", user.id);
```

### 3. Kaffiy-Admin (Kaffiy Team)
**Purpose:** Kaffiy team manages all cafes and system operations
**URL:** `admin.kaffiy.com`
**Authentication:** Admin-level Supabase Auth
**Data Scope:** Full access to all data
**Key Features:**
- Create new cafes
- Manage all companies
- View system-wide analytics
- Manage subscriptions
- Support operations

**Database Access Pattern:**
```typescript
// Admin has full access - no company_id filter
const { data: allCompanies } = await supabase
  .from("company_tb")
  .select("*");

// Can create new cafes
const { data: newCafe } = await supabase
  .from("company_tb")
  .insert({
    name: "New Cafe",
    slug: "new-cafe",
    payment_tier: "basic"
  });
```

## 🔐 Authentication Flow

### Dashboard (Cafe Owners)
1. User visits `dashboard.kaffiy.com`
2. Redirected to `/login`
3. Enters email/password
4. Supabase Auth validates
5. System checks `worker_tb` for `company_id`
6. If found → Dashboard with company-filtered data
7. If not found → Error: "No cafe associated with this account"

### Mobile UI (Customers)
1. User opens app or visits `app.kaffiy.com`
2. Can browse without login (limited features)
3. To earn points/redeem → Must login
4. Email/password or social login
5. Creates record in `user_tb`
6. Access to personal loyalty data

### Admin (Kaffiy Team)
1. User visits `admin.kaffiy.com`
2. Redirected to `/login`
3. Enters admin credentials
4. Supabase Auth validates
5. Additional check: Is user in admin role?
6. If yes → Full system access
7. If no → Access denied

## 📊 Database Schema Integration

### Key Tables and Their Usage

#### `company_tb` (Cafes)
- **Dashboard:** Read-only (own company)
- **Mobile UI:** Read-only (browse cafes)
- **Admin:** Full CRUD access

#### `worker_tb` (Cafe Staff)
- **Dashboard:** CRUD for own company's workers
- **Mobile UI:** No access
- **Admin:** Full CRUD access

#### `user_tb` (Customers)
- **Dashboard:** Read-only (customers who visited their cafe)
- **Mobile UI:** CRUD (own profile)
- **Admin:** Full CRUD access

#### `campaign_tb` (Marketing Campaigns)
- **Dashboard:** CRUD for own company's campaigns
- **Mobile UI:** Read-only (active campaigns)
- **Admin:** Full CRUD access

#### `qr_tb` (QR Codes)
- **Dashboard:** Create QR codes for own company
- **Mobile UI:** Scan and redeem QR codes
- **Admin:** Full CRUD access

#### `royalty_tb` (Loyalty Points)
- **Dashboard:** Read-only (customers' points at their cafe)
- **Mobile UI:** Read-only (own points)
- **Admin:** Full CRUD access

## 🔄 Integration Points

### 1. QR Code Flow
```
Dashboard (Create QR) → Database → Mobile UI (Scan QR) → Database → Dashboard (See redemption)
```

**Dashboard:**
```typescript
// Cafe creates QR code
const { data: qr } = await supabase
  .from("qr_tb")
  .insert({
    company_id: companyId,
    qr_code: generateUniqueCode(),
    points_earned: 50,
    status: "active"
  });
```

**Mobile UI:**
```typescript
// Customer scans QR
const { data: qr } = await supabase
  .from("qr_tb")
  .select("*")
  .eq("qr_code", scannedCode)
  .single();

// Update loyalty points
await supabase
  .from("royalty_tb")
  .upsert({
    user_id: userId,
    company_id: qr.company_id,
    points: currentPoints + qr.points_earned
  });

// Mark QR as used
await supabase
  .from("qr_tb")
  .update({ status: "used", used_by: userId })
  .eq("id", qr.id);
```

### 2. Campaign Flow
```
Dashboard (Create Campaign) → Database → Mobile UI (View Campaign) → Mobile UI (Redeem) → Dashboard (Track)
```

### 3. Customer Acquisition Flow
```
Mobile UI (User Signs Up) → Database → Dashboard (New Customer Appears) → Admin (System Analytics)
```

## 🛠️ Implementation Checklist

### Phase 1: Core Authentication ✅
- [x] Dashboard: CompanyContext created
- [x] Dashboard: Login with company_id extraction
- [ ] Mobile UI: User authentication
- [ ] Admin: Admin role verification

### Phase 2: Data Filtering
- [x] Dashboard: Campaigns filtered by company_id
- [ ] Dashboard: Customers filtered by company_id
- [ ] Dashboard: Team filtered by company_id
- [ ] Mobile UI: Loyalty filtered by user_id
- [ ] Mobile UI: QR codes filtered by user_id
- [ ] Admin: No filtering (full access)

### Phase 3: Cross-Interface Features
- [ ] QR Code creation (Dashboard) → Scanning (Mobile UI)
- [ ] Campaign creation (Dashboard) → Display (Mobile UI)
- [ ] Customer actions (Mobile UI) → Analytics (Dashboard)
- [ ] System monitoring (Admin) → All interfaces

### Phase 4: Real-time Updates
- [ ] Dashboard: Real-time customer activity
- [ ] Mobile UI: Real-time point updates
- [ ] Admin: Real-time system metrics

## 🚀 Next Steps

1. **Complete Dashboard Integration**
   - Add company_id filter to all pages
   - Test data isolation between cafes

2. **Mobile UI Authentication**
   - Implement user login/signup
   - Create UserContext similar to CompanyContext

3. **Admin Panel Setup**
   - Implement admin role checking
   - Create admin-specific components
   - Add system-wide analytics

4. **Cross-Testing**
   - Create test cafe in Admin
   - Login as cafe owner in Dashboard
   - Create campaign and QR code
   - Login as customer in Mobile UI
   - Scan QR and redeem
   - Verify data appears in Dashboard

## 📝 Notes

- All three interfaces share the same Supabase project
- Row Level Security (RLS) should be configured for production
- Each interface has its own deployment pipeline
- Shared types should be kept in sync across all three projects
