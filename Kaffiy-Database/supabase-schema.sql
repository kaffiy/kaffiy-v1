-- ========================================
-- KAFFIY DATABASE SCHEMA - SUPABASE
-- Professional Coffee Shop Management System
-- ========================================

-- ========================================
-- 1. ENUM TYPES
-- ========================================

-- User account status tracking
CREATE TYPE status_account AS ENUM (
    'active', 
    'passive', 
    'pending', 
    'suspended', 
    'banned'
);
COMMENT ON TYPE status_account IS 'Tracks the current status of the user account (e.g., active, banned, pending approval).';

-- Marketing campaign lifecycle
CREATE TYPE status_campaign AS ENUM (
    'draft', 
    'active', 
    'paused', 
    'expired', 
    'cancelled'
);
COMMENT ON TYPE status_campaign IS 'Monitors the lifecycle stages of a marketing campaign from creation to completion.';

-- Campaign and loyalty incentive types
CREATE TYPE type_campaign AS ENUM (
    'reward', 
    'discount', 
    'birthday', 
    'referral', 
    'event'
);
COMMENT ON TYPE type_campaign IS 'Categorizes different marketing initiatives such as rewards, discounts, and referral programs used to increase customer loyalty.';

-- Campaign target audience types
CREATE TYPE type_campaign_target AS ENUM (
    'all', 
    'new', 
    'active', 
    'risky', 
    'passive'
);
COMMENT ON TYPE type_campaign_target IS 'Specifies the target audience of campaigns to manage user retention and engagement.';

-- Account deletion reasons
CREATE TYPE type_delete_reason AS ENUM (
    'low_usage', 
    'too_complex', 
    'privacy_concerns', 
    'technical_issues', 
    'other'
);
COMMENT ON TYPE type_delete_reason IS 'Stores the reason for account deletion to help analyze customer churn (churn analysis).';

-- Mobile app feedback types
CREATE TYPE type_feedback_app AS ENUM (
    'compliment', 
    'bug_report', 
    'feature_request', 
    'design_request', 
    'other'
);
COMMENT ON TYPE type_feedback_app IS 'Classifies technical and design feedback specifically related to the mobile application experience.';

-- Store feedback types
CREATE TYPE type_feedback_store AS ENUM (
    'compliment', 
    'suggestion', 
    'complaint', 
    'quality', 
    'other'
);
COMMENT ON TYPE type_feedback_store IS 'Categorizes customer feedback into actionable categories for business analysis.';

-- Payment and subscription tiers
CREATE TYPE type_payment AS ENUM (
    'free', 
    'economy', 
    'standard', 
    'premium', 
    'custom'
);
COMMENT ON TYPE type_payment IS 'Defines the pricing tier and feature access level for business accounts.';

-- Loyalty/Royalty levels
CREATE TYPE type_royalty AS ENUM (
    'explorer', 
    'bronze', 
    'silver', 
    'gold', 
    'legend'
);
COMMENT ON TYPE type_royalty IS 'Defines the customer loyalty level based on interaction and spending habits within the application.';

-- Employee roles and permissions
CREATE TYPE type_worker AS ENUM (
    'brand_admin', 
    'brand_manager', 
    'store_manager', 
    'store_chief', 
    'store_staff'
);
COMMENT ON TYPE type_worker IS 'Determines the hierarchical roles and access permissions of employees within the business management system.';

-- Additional enums for comprehensive system
CREATE TYPE status_payment AS ENUM (
    'pending', 
    'completed', 
    'failed', 
    'refunded', 
    'cancelled'
);
COMMENT ON TYPE status_payment IS 'Payment transaction status tracking';

CREATE TYPE type_notification AS ENUM (
    'campaign', 
    'reward', 
    'friend_request', 
    'system', 
    'marketing'
);
COMMENT ON TYPE type_notification IS 'Notification categories for user engagement';

CREATE TYPE status_qr AS ENUM (
    'generated', 
    'scanned', 
    'used', 
    'expired'
);
COMMENT ON TYPE status_qr IS 'QR code lifecycle status tracking';

-- ========================================
-- 2. CORE TABLES
-- ========================================

-- Companies table (Multi-tenant architecture support)
CREATE TABLE company_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    tax_number VARCHAR(50),
    payment_tier type_payment DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE company_tb IS 'Company/Brand information for multi-tenant architecture';

-- Shops/Stores table
CREATE TABLE shop_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    opening_hours JSONB, -- Store opening hours in JSON format
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, slug)
);
COMMENT ON TABLE shop_tb IS 'Physical store locations for each company';

-- Workers/Employees table
CREATE TABLE worker_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shop_tb(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role type_worker NOT NULL,
    permissions JSONB DEFAULT '{}', -- Custom permissions per role
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE worker_tb IS 'Employee accounts with role-based permissions';

-- Users table (Customers)
CREATE TABLE user_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(10),
    avatar_url VARCHAR(500),
    status status_account DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE user_tb IS 'Customer accounts with comprehensive profile information';

-- User-Company subscriptions
CREATE TABLE user_subscribe_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    subscription_date TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);
COMMENT ON TABLE user_subscribe_tb IS 'User subscriptions to specific companies/brands';

-- User social features
CREATE TABLE user_follow_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);
COMMENT ON TABLE user_follow_tb IS 'User-to-user following relationships';

CREATE TABLE user_share_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    shared_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK(sender_id != receiver_id),
    CHECK(points > 0)
);
COMMENT ON TABLE user_share_tb IS 'Points sharing between users';

-- ========================================
-- 3. LOYALTY & CAMPAIGN SYSTEM
-- ========================================

-- Campaigns table
CREATE TABLE campaign_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shop_tb(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type type_campaign NOT NULL,
    target_audience type_campaign_target DEFAULT 'all',
    status status_campaign DEFAULT 'draft',
    reward_points INTEGER DEFAULT 0,
    discount_percentage DECIMAL(5, 2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    conditions JSONB DEFAULT '{}', -- Campaign conditions and rules
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE campaign_tb IS 'Marketing campaigns with comprehensive tracking';

-- QR codes table
CREATE TABLE qr_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaign_tb(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_tb(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shop_tb(id) ON DELETE SET NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status status_qr DEFAULT 'generated',
    points_earned INTEGER DEFAULT 0,
    scanned_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}', -- Additional QR metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE qr_tb IS 'QR code generation and tracking system';

-- Royalty/Loyalty cards
CREATE TABLE royalty_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    level type_royalty DEFAULT 'explorer',
    points INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    visits_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    level_upgraded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);
COMMENT ON TABLE royalty_tb IS 'Customer loyalty program tracking';

-- ========================================
-- 4. PAYMENT & TRANSACTIONS
-- ========================================

-- Payment tracking
CREATE TABLE payment_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_tb(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    payment_type type_payment NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status status_payment DEFAULT 'pending',
    payment_method VARCHAR(50), -- credit_card, cash, etc.
    transaction_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE payment_tb IS 'Payment transaction tracking and processing';

-- ========================================
-- 5. NOTIFICATIONS & FEEDBACK
-- ========================================

-- User notifications
CREATE TABLE user_notice_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    company_id UUID REFERENCES company_tb(id) ON DELETE CASCADE,
    type type_notification NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional notification data
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE user_notice_tb IS 'User notification system';

-- Feedback tables
CREATE TABLE feedback_app_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_tb(id) ON DELETE SET NULL,
    type type_feedback_app NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE feedback_app_tb IS 'Mobile application feedback tracking';

CREATE TABLE feedback_store_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_tb(id) ON DELETE SET NULL,
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES shop_tb(id) ON DELETE SET NULL,
    type type_feedback_store NOT NULL,
    title VARCHAR(255),
    description TEXT NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE feedback_store_tb IS 'Store-specific feedback tracking';

-- ========================================
-- 6. REFERRAL SYSTEM
-- ========================================

-- Reference codes
CREATE TABLE reference_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    reward_points INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE reference_tb IS 'Referral code generation and tracking';

CREATE TABLE reference_usage_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID NOT NULL REFERENCES reference_tb(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    points_awarded INTEGER DEFAULT 0,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reference_id, user_id)
);
COMMENT ON TABLE reference_usage_tb IS 'Referral code usage tracking';

-- ========================================
-- 7. SYSTEM & ADMIN
-- ========================================

-- Geographic data
CREATE TABLE country_tb (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(2) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true
);
COMMENT ON TABLE country_tb IS 'Country reference data';

CREATE TABLE city_tb (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES country_tb(id),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true
);
COMMENT ON TABLE city_tb IS 'City reference data';

CREATE TABLE district_tb (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES city_tb(id),
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true
);
COMMENT ON TABLE district_tb IS 'District reference data';

-- Profile pictures
CREATE TABLE profile_picture_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE profile_picture_tb IS 'User profile picture management';

-- Account deletion requests
CREATE TABLE delete_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_tb(id) ON DELETE CASCADE,
    reason type_delete_reason NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE delete_tb IS 'Account deletion request tracking';

-- AI token usage tracking
CREATE TABLE token_usage_tb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_tb(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_tb(id) ON DELETE SET NULL,
    tokens_used INTEGER NOT NULL,
    operation VARCHAR(100) NOT NULL, -- AI operation type
    cost DECIMAL(10, 4) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE token_usage_tb IS 'AI token usage and cost tracking';

-- ========================================
-- 8. INDEXES FOR PERFORMANCE
-- ========================================

-- Performance indexes
CREATE INDEX idx_user_tb_email ON user_tb(email);
CREATE INDEX idx_user_tb_status ON user_tb(status);
CREATE INDEX idx_user_tb_created_at ON user_tb(created_at);

CREATE INDEX idx_company_tb_slug ON company_tb(slug);
CREATE INDEX idx_company_tb_payment_tier ON company_tb(payment_tier);

CREATE INDEX idx_shop_tb_company_id ON shop_tb(company_id);
CREATE INDEX idx_shop_tb_location ON shop_tb(latitude, longitude);

CREATE INDEX idx_campaign_tb_company_id ON campaign_tb(company_id);
CREATE INDEX idx_campaign_tb_status ON campaign_tb(status);
CREATE INDEX idx_campaign_tb_dates ON campaign_tb(start_date, end_date);

CREATE INDEX idx_qr_tb_code ON qr_tb(qr_code);
CREATE INDEX idx_qr_tb_status ON qr_tb(status);
CREATE INDEX idx_qr_tb_user_id ON qr_tb(user_id);

CREATE INDEX idx_royalty_tb_user_company ON royalty_tb(user_id, company_id);
CREATE INDEX idx_royalty_tb_level ON royalty_tb(level);

CREATE INDEX idx_payment_tb_company_id ON payment_tb(company_id);
CREATE INDEX idx_payment_tb_status ON payment_tb(status);

CREATE INDEX idx_user_notice_tb_user_id ON user_notice_tb(user_id);
CREATE INDEX idx_user_notice_tb_read ON user_notice_tb(is_read);

-- ========================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all user-related tables
ALTER TABLE user_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscribe_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follow_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_share_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE royalty_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notice_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_app_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_store_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_usage_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_picture_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE delete_tb ENABLE ROW LEVEL SECURITY;

-- Company-specific RLS policies
ALTER TABLE company_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_tb ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_tb ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 10. TRIGGERS FOR AUTOMATION
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_company_updated_at BEFORE UPDATE ON company_tb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_updated_at BEFORE UPDATE ON shop_tb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_updated_at BEFORE UPDATE ON worker_tb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON user_tb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_updated_at BEFORE UPDATE ON campaign_tb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_royalty_updated_at BEFORE UPDATE ON royalty_tb FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 11. SAMPLE DATA (Optional for development)
-- ========================================

-- Insert sample countries
INSERT INTO country_tb (name, code) VALUES 
('Türkiye', 'TR'),
('United States', 'US'),
('Germany', 'DE'),
('United Kingdom', 'GB');

-- Insert sample cities
INSERT INTO city_tb (country_id, name) VALUES 
(1, 'İstanbul'),
(1, 'Ankara'),
(1, 'İzmir'),
(2, 'New York'),
(2, 'Los Angeles');

-- ========================================
-- 12. VIEWS FOR COMMON QUERIES
-- ========================================

-- User loyalty summary view
CREATE VIEW user_loyalty_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    COALESCE(SUM(r.points), 0) as total_points,
    COALESCE(MAX(r.level), 'explorer') as max_loyalty_level,
    COUNT(DISTINCT r.company_id) as subscribed_companies,
    COUNT(DISTINCT uf.following_id) as following_count,
    COUNT(DISTINCT uf2.follower_id) as followers_count
FROM user_tb u
LEFT JOIN royalty_tb r ON u.id = r.user_id
LEFT JOIN user_subscribe_tb us ON u.id = us.user_id AND us.is_active = true
LEFT JOIN user_follow_tb uf ON u.id = uf.follower_id
LEFT JOIN user_follow_tb uf2 ON u.id = uf2.following_id
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- Company campaign performance view
CREATE VIEW campaign_performance_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(cam.id) as total_campaigns,
    COUNT(CASE WHEN cam.status = 'active' THEN 1 END) as active_campaigns,
    COUNT(CASE WHEN cam.status = 'expired' THEN 1 END) as expired_campaigns,
    COALESCE(SUM(cam.current_uses), 0) as total_uses,
    COALESCE(AVG(cam.current_uses), 0) as avg_uses_per_campaign
FROM company_tb c
LEFT JOIN campaign_tb cam ON c.id = cam.company_id
GROUP BY c.id, c.name;

-- ========================================
-- 13. FUNCTIONS FOR BUSINESS LOGIC
-- ========================================

-- Function to calculate loyalty level based on points
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

-- Function to update user loyalty level
CREATE OR REPLACE FUNCTION update_loyalty_level(user_uuid UUID, company_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE royalty_tb 
    SET level = calculate_loyalty_level(points),
        updated_at = NOW()
    WHERE user_id = user_uuid AND company_id = company_uuid;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMPLETION
-- ========================================

-- Schema is ready for Supabase deployment
-- This provides a comprehensive foundation for the Kaffiy coffee shop management system
