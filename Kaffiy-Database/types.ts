// ========================================
// KAFFIY DATABASE TYPES
// TypeScript definitions for Supabase integration
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
// VIEW INTERFACES
// ========================================

export interface UserLoyaltySummary {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  total_points: number;
  max_loyalty_level: TypeRoyalty;
  subscribed_companies: number;
  following_count: number;
  followers_count: number;
}

export interface CampaignPerformanceSummary {
  company_id: string;
  company_name: string;
  total_campaigns: number;
  active_campaigns: number;
  expired_campaigns: number;
  total_uses: number;
  avg_uses_per_campaign: number;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// ========================================
// AUTHENTICATION TYPES
// ========================================

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  company_id?: string;
  shop_id?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

// ========================================
// BUSINESS LOGIC TYPES
// ========================================

export interface LoyaltyLevelThreshold {
  level: TypeRoyalty;
  min_points: number;
  benefits: string[];
}

export interface CampaignConditions {
  min_purchase?: number;
  max_uses_per_user?: number;
  required_royalty_level?: TypeRoyalty;
  valid_days?: string[];
  time_restrictions?: {
    start_time: string;
    end_time: string;
  };
}

export interface QRGenerationRequest {
  campaign_id?: string;
  user_id?: string;
  company_id: string;
  shop_id?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface NotificationData {
  type: TypeNotification;
  title: string;
  message: string;
  data?: Record<string, any>;
  target_users?: string[];
  target_companies?: string[];
  scheduled_at?: string;
}

// ========================================
// DASHBOARD TYPES
// ========================================

export interface DashboardStats {
  total_users: number;
  active_campaigns: number;
  total_qr_scans: number;
  revenue: number;
  growth_percentage: number;
}

export interface UserEngagementMetrics {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: number;
  retention_rate: number;
}

export interface CampaignMetrics {
  campaign_id: string;
  title: string;
  total_scans: number;
  unique_users: number;
  conversion_rate: number;
  revenue_generated: number;
}

// ========================================
// UTILITY TYPES
// ========================================

export type DatabaseTable = 
  | 'company_tb'
  | 'shop_tb'
  | 'worker_tb'
  | 'user_tb'
  | 'user_subscribe_tb'
  | 'user_follow_tb'
  | 'user_share_tb'
  | 'campaign_tb'
  | 'qr_tb'
  | 'royalty_tb'
  | 'payment_tb'
  | 'user_notice_tb'
  | 'feedback_app_tb'
  | 'feedback_store_tb'
  | 'reference_tb'
  | 'reference_usage_tb'
  | 'country_tb'
  | 'city_tb'
  | 'district_tb'
  | 'profile_picture_tb'
  | 'delete_tb'
  | 'token_usage_tb';

export type DatabaseFunction = 
  | 'calculate_loyalty_level'
  | 'update_loyalty_level'
  | 'update_updated_at_column';

export type DatabaseView = 
  | 'user_loyalty_summary'
  | 'campaign_performance_summary';

// ========================================
// SUPABASE CLIENT CONFIGURATION
// ========================================

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      persistSession: boolean;
      autoRefreshToken: boolean;
    };
    realtime?: {
      params?: Record<string, any>;
    };
  };
}

// ========================================
// ERROR TYPES
// ========================================

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ========================================
// EXPORT ALL TYPES
// ========================================

// All types are already exported with their interface declarations
// No additional exports needed to avoid conflicts
