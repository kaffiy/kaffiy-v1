// ========================================
// KAFFIY DATABASE TYPES
// TypeScript definitions for Supabase integration - Dashboard
// ========================================

// ========================================
// ENUM TYPES
// ========================================

export type StatusAccount = 'active' | 'passive' | 'pending' | 'suspended' | 'banned';
export type StatusCampaign = 'draft' | 'active' | 'paused' | 'expired' | 'cancelled';
export type TypeCampaign = 'reward' | 'discount' | 'birthday' | 'referral' | 'event';
export type TypeCampaignTarget = 'all' | 'new' | 'active' | 'risky' | 'passive';
export type TypeDeleteReason = 'low_usage' | 'too_complex' | 'privacy_concerns' | 'technical_issues' | 'other';
export type TypeFeedbackApp = 'compliment' | 'bug_report' | 'feature_request' | 'design_request' | 'other';
export type TypeFeedbackStore = 'compliment' | 'suggestion' | 'complaint' | 'quality' | 'other';
export type TypePayment = 'free' | 'economy' | 'standard' | 'premium' | 'custom';
export type TypeRoyalty = 'explorer' | 'bronze' | 'silver' | 'gold' | 'legend';
export type TypeWorker = 'brand_admin' | 'brand_manager' | 'store_manager' | 'store_chief' | 'store_staff';
export type StatusPayment = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type TypeNotification = 'campaign' | 'reward' | 'friend_request' | 'system' | 'marketing';
export type StatusQR = 'generated' | 'scanned' | 'used' | 'expired';

// ========================================
// TABLE INTERFACES
// ========================================

export interface Company {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    payment_tier: TypePayment;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Shop {
    id: string;
    company_id: string;
    name: string;
    slug: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    opening_hours?: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Worker {
    id: string;
    company_id: string;
    shop_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    role: TypeWorker;
    permissions: Record<string, any>;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: string;
    avatar_url?: string;
    status: StatusAccount;
    email_verified: boolean;
    phone_verified: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export interface UserSubscribe {
    id: string;
    user_id: string;
    company_id: string;
    subscription_date: string;
    is_active: boolean;
    created_at: string;
}

export interface UserFollow {
    id: string;
    follower_id: string;
    following_id: string;
    followed_at: string;
}

export interface UserShare {
    id: string;
    sender_id: string;
    receiver_id: string;
    points: number;
    message?: string;
    shared_at: string;
}

export interface Campaign {
    id: string;
    company_id: string;
    shop_id?: string;
    title: string;
    description?: string;
    type: TypeCampaign;
    target_audience: TypeCampaignTarget;
    status: StatusCampaign;
    reward_points: number;
    discount_percentage?: number;
    max_uses?: number;
    current_uses: number;
    start_date?: string;
    end_date?: string;
    conditions: Record<string, any>;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface QR {
    id: string;
    campaign_id?: string;
    user_id?: string;
    company_id: string;
    shop_id?: string;
    qr_code: string;
    status: StatusQR;
    points_earned: number;
    scanned_at?: string;
    used_at?: string;
    expires_at?: string;
    metadata: Record<string, any>;
    created_at: string;
}

export interface Royalty {
    id: string;
    user_id: string;
    company_id: string;
    level: TypeRoyalty;
    points: number;
    total_spent: number;
    visits_count: number;
    last_activity: string;
    level_upgraded_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: string;
    user_id?: string;
    company_id: string;
    payment_type: TypePayment;
    amount: number;
    currency: string;
    status: StatusPayment;
    payment_method?: string;
    transaction_id?: string;
    description?: string;
    metadata: Record<string, any>;
    processed_at?: string;
    created_at: string;
}

export interface UserNotice {
    id: string;
    user_id: string;
    company_id?: string;
    type: TypeNotification;
    title: string;
    message: string;
    data: Record<string, any>;
    is_read: boolean;
    read_at?: string;
    created_at: string;
}

export interface FeedbackApp {
    id: string;
    user_id?: string;
    type: TypeFeedbackApp;
    title?: string;
    description: string;
    rating?: number;
    metadata: Record<string, any>;
    status: string;
    created_at: string;
}

export interface FeedbackStore {
    id: string;
    user_id?: string;
    company_id: string;
    shop_id?: string;
    type: TypeFeedbackStore;
    title?: string;
    description: string;
    rating?: number;
    metadata: Record<string, any>;
    status: string;
    created_at: string;
}

export interface Reference {
    id: string;
    user_id: string;
    code: string;
    reward_points: number;
    max_uses: number;
    current_uses: number;
    is_active: boolean;
    expires_at?: string;
    created_at: string;
}

export interface ReferenceUsage {
    id: string;
    reference_id: string;
    user_id: string;
    company_id: string;
    points_awarded: number;
    used_at: string;
}

export interface Country {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
}

export interface City {
    id: number;
    country_id: number;
    name: string;
    is_active: boolean;
}

export interface District {
    id: number;
    city_id: number;
    name: string;
    is_active: boolean;
}

export interface ProfilePicture {
    id: string;
    user_id: string;
    url: string;
    is_active: boolean;
    created_at: string;
}

export interface Delete {
    id: string;
    user_id: string;
    reason: TypeDeleteReason;
    description?: string;
    status: string;
    processed_at?: string;
    created_at: string;
}

export interface TokenUsage {
    id: string;
    company_id: string;
    user_id?: string;
    tokens_used: number;
    operation: string;
    cost: number;
    metadata: Record<string, any>;
    created_at: string;
}

// ========================================
// DATABASE TYPE DEFINITION FOR SUPABASE
// ========================================

export interface Database {
    Tables: {
        company_tb: {
            Row: Company;
            Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<Company, 'id' | 'created_at'>>;
        };
        shop_tb: {
            Row: Shop;
            Insert: Omit<Shop, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<Shop, 'id' | 'created_at'>>;
        };
        worker_tb: {
            Row: Worker;
            Insert: Omit<Worker, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<Worker, 'id' | 'created_at'>>;
        };
        user_tb: {
            Row: User;
            Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<User, 'id' | 'created_at'>>;
        };
        user_subscribe_tb: {
            Row: UserSubscribe;
            Insert: Omit<UserSubscribe, 'id' | 'created_at'>;
            Update: Partial<Omit<UserSubscribe, 'id' | 'created_at'>>;
        };
        user_follow_tb: {
            Row: UserFollow;
            Insert: Omit<UserFollow, 'id' | 'followed_at'>;
            Update: Partial<Omit<UserFollow, 'id' | 'followed_at'>>;
        };
        user_share_tb: {
            Row: UserShare;
            Insert: Omit<UserShare, 'id' | 'shared_at'>;
            Update: Partial<Omit<UserShare, 'id' | 'shared_at'>>;
        };
        campaign_tb: {
            Row: Campaign;
            Insert: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<Campaign, 'id' | 'created_at'>>;
        };
        qr_tb: {
            Row: QR;
            Insert: Omit<QR, 'id' | 'created_at'>;
            Update: Partial<Omit<QR, 'id' | 'created_at'>>;
        };
        royalty_tb: {
            Row: Royalty;
            Insert: Omit<Royalty, 'id' | 'created_at' | 'updated_at'>;
            Update: Partial<Omit<Royalty, 'id' | 'created_at'>>;
        };
        payment_tb: {
            Row: Payment;
            Insert: Omit<Payment, 'id' | 'created_at'>;
            Update: Partial<Omit<Payment, 'id' | 'created_at'>>;
        };
        user_notice_tb: {
            Row: UserNotice;
            Insert: Omit<UserNotice, 'id' | 'created_at'>;
            Update: Partial<Omit<UserNotice, 'id' | 'created_at'>>;
        };
        feedback_app_tb: {
            Row: FeedbackApp;
            Insert: Omit<FeedbackApp, 'id' | 'created_at'>;
            Update: Partial<Omit<FeedbackApp, 'id' | 'created_at'>>;
        };
        feedback_store_tb: {
            Row: FeedbackStore;
            Insert: Omit<FeedbackStore, 'id' | 'created_at'>;
            Update: Partial<Omit<FeedbackStore, 'id' | 'created_at'>>;
        };
        reference_tb: {
            Row: Reference;
            Insert: Omit<Reference, 'id' | 'created_at'>;
            Update: Partial<Omit<Reference, 'id' | 'created_at'>>;
        };
        reference_usage_tb: {
            Row: ReferenceUsage;
            Insert: Omit<ReferenceUsage, 'id' | 'used_at'>;
            Update: Partial<Omit<ReferenceUsage, 'id' | 'used_at'>>;
        };
        country_tb: {
            Row: Country;
            Insert: Omit<Country, 'id'>;
            Update: Partial<Omit<Country, 'id'>>;
        };
        city_tb: {
            Row: City;
            Insert: Omit<City, 'id'>;
            Update: Partial<Omit<City, 'id'>>;
        };
        district_tb: {
            Row: District;
            Insert: Omit<District, 'id'>;
            Update: Partial<Omit<District, 'id'>>;
        };
        profile_picture_tb: {
            Row: ProfilePicture;
            Insert: Omit<ProfilePicture, 'id' | 'created_at'>;
            Update: Partial<Omit<ProfilePicture, 'id' | 'created_at'>>;
        };
        delete_tb: {
            Row: Delete;
            Insert: Omit<Delete, 'id' | 'created_at'>;
            Update: Partial<Omit<Delete, 'id' | 'created_at'>>;
        };
        token_usage_tb: {
            Row: TokenUsage;
            Insert: Omit<TokenUsage, 'id' | 'created_at'>;
            Update: Partial<Omit<TokenUsage, 'id' | 'created_at'>>;
        };
    };
    Views: {
        user_loyalty_summary: {
            Row: {
                user_id: string;
                email: string;
                first_name?: string;
                last_name?: string;
                total_points: number;
                max_loyalty_level: TypeRoyalty;
                subscribed_companies: number;
                following_count: number;
                followers_count: number;
            };
            Insert: never;
            Update: never;
        };
        campaign_performance_summary: {
            Row: {
                company_id: string;
                company_name: string;
                total_campaigns: number;
                active_campaigns: number;
                expired_campaigns: number;
                total_uses: number;
                avg_uses_per_campaign: number;
            };
            Insert: never;
            Update: never;
        };
    };
    Functions: {
        calculate_loyalty_level: {
            Args: { points: number };
            Returns: TypeRoyalty;
        };
        update_loyalty_level: {
            Args: { user_uuid: string; company_uuid: string };
            Returns: void;
        };
    };
    Enums: {
        status_account: StatusAccount;
        status_campaign: StatusCampaign;
        type_campaign: TypeCampaign;
        type_campaign_target: TypeCampaignTarget;
        type_delete_reason: TypeDeleteReason;
        type_feedback_app: TypeFeedbackApp;
        type_feedback_store: TypeFeedbackStore;
        type_payment: TypePayment;
        type_royalty: TypeRoyalty;
        type_worker: TypeWorker;
        status_payment: StatusPayment;
        type_notification: TypeNotification;
        status_qr: StatusQR;
    };
}
