# Kaffiy Database - Supabase Schema

Professional database architecture for Kaffiy coffee shop management system with comprehensive features for multi-tenant operations, loyalty programs, and customer engagement.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [TypeScript Integration](#typescript-integration)
- [Business Logic](#business-logic)
- [Security](#security)
- [Performance](#performance)

## 🎯 Overview

Kaffiy Database is a comprehensive PostgreSQL schema designed specifically for coffee shop management systems. It supports multi-tenant architecture, loyalty programs, QR code campaigns, and advanced customer engagement features.

### Key Capabilities

- **Multi-tenant Architecture**: Support for multiple companies/brands
- **Loyalty Programs**: Advanced royalty/loyalty system with gamification
- **QR Code Campaigns**: Flexible marketing campaign management
- **Social Features**: User following, points sharing, and referrals
- **Real-time Updates**: Live data synchronization
- **Comprehensive Analytics**: Built-in reporting and metrics

## 🚀 Features

### Core Features
- ✅ **Company Management**: Multi-brand support with hierarchical permissions
- ✅ **Store Management**: Multiple locations per company with geolocation
- ✅ **User Management**: Customer profiles with comprehensive data
- ✅ **Employee Management**: Role-based access control
- ✅ **Campaign System**: Flexible marketing campaigns with targeting
- ✅ **QR Code System**: Generation, tracking, and redemption
- ✅ **Loyalty Program**: Multi-tier loyalty system with points
- ✅ **Payment Tracking**: Comprehensive payment and subscription management
- ✅ **Notification System**: Multi-channel notifications
- ✅ **Feedback System**: App and store-specific feedback collection
- ✅ **Referral System**: Advanced referral program with rewards
- ✅ **Analytics**: Built-in views and reporting functions

### Advanced Features
- 🔐 **Row Level Security**: Advanced data protection
- 📊 **Performance Indexes**: Optimized for scale
- 🔄 **Automated Triggers**: Business logic automation
- 📱 **Real-time Subscriptions**: Live data updates
- 💾 **Storage Management**: File upload and management
- 🤖 **AI Integration**: Token usage tracking
- 🌍 **Geographic Data**: Country, city, district management

## 📊 Database Schema

### Core Tables

#### Company (`company_tb`)
Multi-tenant company management with payment tiers and branding.

```sql
- id: UUID (Primary Key)
- name: VARCHAR(255) - Company name
- slug: VARCHAR(255) - URL-friendly identifier
- payment_tier: type_payment - Subscription level
- is_active: BOOLEAN - Active status
```

#### Users (`user_tb`)
Customer management with comprehensive profile data.

```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) - Unique email
- status: status_account - Account status
- email_verified: BOOLEAN - Verification status
```

#### Campaigns (`campaign_tb`)
Marketing campaign management with flexible targeting.

```sql
- id: UUID (Primary Key)
- company_id: UUID - Foreign key to company
- type: type_campaign - Campaign type
- target_audience: type_campaign_target - Target segment
- status: status_campaign - Campaign status
- reward_points: INTEGER - Points awarded
```

#### QR Codes (`qr_tb`)
QR code generation and tracking system.

```sql
- id: UUID (Primary Key)
- qr_code: VARCHAR(255) - Unique QR identifier
- status: status_qr - QR lifecycle status
- points_earned: INTEGER - Points awarded
```

#### Loyalty (`royalty_tb`)
Customer loyalty program tracking.

```sql
- id: UUID (Primary Key)
- user_id: UUID - Customer reference
- company_id: UUID - Company reference
- level: type_royalty - Loyalty tier
- points: INTEGER - Current points balance
```

### Enum Types

#### Account Status
- `active` - Fully functional account
- `passive` - Temporarily inactive
- `pending` - Awaiting verification
- `suspended` - Admin suspended
- `banned` - Permanently banned

#### Campaign Types
- `reward` - Point rewards
- `discount` - Percentage discounts
- `birthday` - Birthday specials
- `referral` - Referral bonuses
- `event` - Special events

#### Loyalty Levels
- `explorer` - Entry level (0-99 points)
- `bronze` - Bronze tier (100-249 points)
- `silver` - Silver tier (250-499 points)
- `gold` - Gold tier (500-999 points)
- `legend` - Legend tier (1000+ points)

## 🛠 Setup Instructions

### Prerequisites

- Supabase account (https://supabase.com)
- Node.js 16+ (for TypeScript integration)
- PostgreSQL knowledge (optional)

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project creation (2-3 minutes)

### 2. Deploy Schema

1. Open Supabase SQL Editor
2. Copy the entire schema from `supabase-schema.sql`
3. Paste and execute the SQL
4. Verify all tables are created successfully

### 3. Environment Variables

Create `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For development
SUPABASE_DB_URL=your_database_url
```

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js
npm install -D @types/node
```

### 5. TypeScript Integration

Copy the TypeScript types to your project:

```bash
cp Kaffiy-Database/types.ts src/types/database.ts
cp Kaffiy-Database/supabase-client.ts src/lib/supabase.ts
```

## 🔧 TypeScript Integration

### Basic Usage

```typescript
import { supabase, AuthManager, DatabaseManager } from '@/lib/supabase';

// Authentication
const user = await AuthManager.signIn('user@example.com', 'password');

// Database Operations
const companies = await DatabaseManager.read('company_tb', {
  filters: { is_active: true },
  orderBy: { column: 'name' }
});

// Create Campaign
const campaign = await DatabaseManager.create('campaign_tb', {
  company_id: 'company-uuid',
  title: 'Summer Special',
  type: 'discount',
  discount_percentage: 15,
  status: 'active'
});
```

### Business Logic

```typescript
import { BusinessLogic } from '@/lib/supabase';

// Update User Loyalty
await BusinessLogic.updateUserLoyalty(
  'user-uuid',
  'company-uuid',
  50 // points to add
);

// Generate QR Code
const qr = await BusinessLogic.generateQRCode({
  company_id: 'company-uuid',
  points_earned: 25,
  expires_at: '2024-12-31T23:59:59Z'
});

// Scan QR Code
const result = await BusinessLogic.scanQRCode('QR-CODE-123', 'user-uuid');
```

### Real-time Updates

```typescript
import { RealtimeManager } from '@/lib/supabase';

// Subscribe to campaign changes
const subscription = RealtimeManager.subscribe(
  'campaign_tb',
  'UPDATE',
  (payload) => {
    console.log('Campaign updated:', payload);
  }
);

// Cleanup
RealtimeManager.unsubscribe(subscription);
```

## 🔒 Security Features

### Row Level Security (RLS)

All user-related tables have RLS enabled with appropriate policies:

- Users can only access their own data
- Companies can only access their data
- Workers have role-based access
- Admins have full access

### Data Protection

- **Encryption**: All data encrypted at rest
- **API Keys**: Secure key management
- **Authentication**: JWT-based auth
- **Permissions**: Granular access control

### Privacy Compliance

- **GDPR Ready**: Data deletion support
- **Account Deletion**: Complete data removal
- **Consent Management**: User consent tracking

## ⚡ Performance Optimization

### Database Indexes

Comprehensive indexing strategy for optimal performance:

```sql
-- User queries
CREATE INDEX idx_user_tb_email ON user_tb(email);
CREATE INDEX idx_user_tb_status ON user_tb(status);

-- Campaign queries
CREATE INDEX idx_campaign_tb_company_id ON campaign_tb(company_id);
CREATE INDEX idx_campaign_tb_status ON campaign_tb(status);

-- QR code queries
CREATE INDEX idx_qr_tb_code ON qr_tb(qr_code);
CREATE INDEX idx_qr_tb_status ON qr_tb(status);
```

### Query Optimization

- **Views**: Pre-computed complex queries
- **Functions**: Server-side business logic
- **Triggers**: Automated data updates
- **Partitions**: Large table optimization

### Caching Strategy

- **Application Cache**: Frequently accessed data
- **Database Cache**: Query result caching
- **CDN**: Static asset delivery

## 📈 Analytics & Reporting

### Built-in Views

#### User Loyalty Summary
```sql
SELECT 
    u.email,
    SUM(r.points) as total_points,
    MAX(r.level) as max_loyalty_level,
    COUNT(DISTINCT r.company_id) as subscribed_companies
FROM user_tb u
LEFT JOIN royalty_tb r ON u.id = r.user_id
GROUP BY u.id, u.email;
```

#### Campaign Performance
```sql
SELECT 
    c.name as company_name,
    COUNT(cam.id) as total_campaigns,
    COUNT(CASE WHEN cam.status = 'active' THEN 1 END) as active_campaigns,
    SUM(cam.current_uses) as total_uses
FROM company_tb c
LEFT JOIN campaign_tb cam ON c.id = cam.company_id
GROUP BY c.id, c.name;
```

### Custom Analytics

- **User Engagement**: Active user metrics
- **Campaign ROI**: Return on investment tracking
- **Loyalty Metrics**: Program effectiveness
- **Geographic Data**: Location-based insights

## 🔄 Business Logic Functions

### Loyalty Level Calculation

```sql
CREATE OR REPLACE FUNCTION calculate_loyalty_level(points INTEGER)
RETURNS type_royalty AS $$
BEGIN
    IF points >= 1000 THEN RETURN 'legend';
    ELSIF points >= 500 THEN RETURN 'gold';
    ELSIF points >= 250 THEN RETURN 'silver';
    ELSIF points >= 100 THEN RETURN 'bronze';
    ELSE RETURN 'explorer';
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### Automated Updates

```sql
-- Update loyalty level automatically
CREATE OR REPLACE FUNCTION update_loyalty_level(user_uuid UUID, company_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE royalty_tb 
    SET level = calculate_loyalty_level(points),
        updated_at = NOW()
    WHERE user_id = user_uuid AND company_id = company_uuid;
END;
$$ LANGUAGE plpgsql;
```

## 🌐 API Integration

### REST API Examples

```typescript
// Get user campaigns
GET /api/campaigns?company_id=uuid&status=active

// Create QR code
POST /api/qr/generate
{
  "company_id": "uuid",
  "points_earned": 50,
  "expires_at": "2024-12-31"
}

// Update loyalty
POST /api/loyalty/update
{
  "user_id": "uuid",
  "company_id": "uuid",
  "points": 25
}
```

### Webhook Support

- **Payment Events**: Stripe/webhook integration
- **User Actions**: Real-time user behavior
- **Campaign Events**: Campaign lifecycle events
- **System Events**: Admin and system notifications

## 📱 Mobile App Support

### Offline Capabilities

- **Local Storage**: Critical data caching
- **Sync Queue**: Offline action queuing
- **Conflict Resolution**: Data merge strategies

### Push Notifications

- **Campaign Updates**: New campaign alerts
- **Loyalty Changes**: Level upgrade notifications
- **QR Scans**: Successful scan confirmations
- **Social Features**: Friend activity updates

## 🚀 Deployment

### Production Checklist

- [ ] Schema deployed to Supabase
- [ ] Environment variables configured
- [ ] RLS policies tested
- [ ] Performance indexes verified
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Security audit completed

### Monitoring & Maintenance

- **Query Performance**: Slow query monitoring
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: API usage metrics
- **Backup Verification**: Regular backup testing

## 🤝 Contributing

### Schema Changes

1. Update `supabase-schema.sql`
2. Update TypeScript types in `types.ts`
3. Update business logic functions
4. Test with sample data
5. Update documentation

### Best Practices

- **Naming Conventions**: Consistent table/column naming
- **Data Types**: Appropriate type selection
- **Constraints**: Proper foreign key relationships
- **Indexes**: Performance optimization
- **Security**: RLS policies implementation

## 📞 Support

### Documentation

- **Schema Reference**: Detailed table documentation
- **API Guide**: Integration examples
- **Troubleshooting**: Common issues and solutions
- **Migration Guides**: Version upgrade instructions

### Community

- **GitHub Issues**: Bug reports and feature requests
- **Discord Channel**: Real-time support
- **Documentation Wiki**: Community contributions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase Team**: Excellent database platform
- **PostgreSQL**: Powerful database engine
- **TypeScript**: Type-safe development
- **Community**: Contributors and feedback providers

---

**Built with ❤️ for the Kaffiy Coffee Shop Management System**
