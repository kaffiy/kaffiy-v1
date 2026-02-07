// ========================================
// KAFFIY MOBILE SUPABASE CLIENT
// Professional database connection for mobile app
// ========================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ========================================
// CONFIGURATION
// ========================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ivuhmjtnnhieguiblnbr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dWhtanRubmhpZWd1aWJsbmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MzY4OTcsImV4cCI6MjA4NDMxMjg5N30.SDOsi9-uSVtGt7faeu7fSZsZTXzk4mHSA9R0ky9mSfg';

// ========================================
// CLIENT CREATION
// ========================================

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'kaffiy-mobile/1.0.0',
      },
    },
  }
);

// ========================================
// AUTHENTICATION MANAGER
// ========================================

export class AuthManager {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (error) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get current user error:', error);
      throw new Error(error.message);
    }
    return user;
  }

  static async updateProfile(updates: Record<string, any>) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message);
    }
    return data;
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message);
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// ========================================
// MOBILE BUSINESS LOGIC
// ========================================

export class MobileBusinessLogic {
  // User profile operations
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_tb')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Get user profile error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_tb')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Update user profile error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  // Company operations
  static async getCompanies() {
    const { data, error } = await supabase
      .from('company_tb')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Get companies error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async getCompanyDetails(companyId: string) {
    const { data, error } = await supabase
      .from('company_tb')
      .select(`
        *,
        shop_tb (*)
      `)
      .eq('id', companyId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Get company details error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  // Campaign operations
  static async getCampaigns(companyId?: string, status?: string) {
    let query = supabase
      .from('campaign_tb')
      .select(`
        *,
        company_tb (name, logo_url)
      `)
      .eq('is_active', true);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Get campaigns error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  // QR operations
  static async scanQRCode(qrCode: string, userId: string) {
    // Get QR record
    const { data: qrRecord, error: qrError } = await supabase
      .from('qr_tb')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (qrError) {
      console.error('QR scan error:', qrError);
      throw new Error('QR code not found');
    }

    if (!qrRecord) {
      throw new Error('QR code not found');
    }

    if (qrRecord.status !== 'generated') {
      throw new Error('QR code already used');
    }

    if (qrRecord.expires_at && new Date(qrRecord.expires_at) < new Date()) {
      throw new Error('QR code expired');
    }

    // Update QR status
    const { data: updatedQR, error: updateError } = await supabase
      .from('qr_tb')
      .update({
        status: 'scanned',
        scanned_at: new Date().toISOString(),
        user_id: userId
      })
      .eq('id', qrRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update QR error:', updateError);
      throw new Error(updateError.message);
    }

    // Award points to user
    if (qrRecord.points_earned > 0) {
      await this.updateUserLoyalty(userId, qrRecord.company_id, qrRecord.points_earned);
    }

    return updatedQR;
  }

  // Loyalty operations
  static async getUserLoyalty(userId: string, companyId: string) {
    const { data, error } = await supabase
      .from('royalty_tb')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Get user loyalty error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async updateUserLoyalty(userId: string, companyId: string, pointsToAdd: number) {
    // First, get current loyalty record
    const existing = await this.getUserLoyalty(userId, companyId);

    if (existing) {
      // Update existing record
      const newPoints = existing.points + pointsToAdd;
      const { data, error } = await supabase
        .from('royalty_tb')
        .update({
          points: newPoints,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) {
        console.error('Update loyalty error:', error);
        throw new Error(error.message);
      }
      
      return data;
    } else {
      // Create new loyalty record
      const { data, error } = await supabase
        .from('royalty_tb')
        .insert({
          user_id: userId,
          company_id: companyId,
          points: pointsToAdd,
          level: 'explorer'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Create loyalty error:', error);
        throw new Error(error.message);
      }
      
      return data;
    }
  }

  // Notification operations
  static async getUserNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('user_notice_tb')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Get notifications error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('user_notice_tb')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      console.error('Mark notification as read error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  // User subscription operations
  static async subscribeToCompany(userId: string, companyId: string) {
    const { data, error } = await supabase
      .from('user_subscribe_tb')
      .upsert({
        user_id: userId,
        company_id: companyId,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Subscribe to company error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }

  static async unsubscribeFromCompany(userId: string, companyId: string) {
    const { error } = await supabase
      .from('user_subscribe_tb')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('company_id', companyId);
    
    if (error) {
      console.error('Unsubscribe from company error:', error);
      throw new Error(error.message);
    }
  }

  static async getUserSubscriptions(userId: string) {
    const { data, error } = await supabase
      .from('user_subscribe_tb')
      .select(`
        *,
        company_tb (name, logo_url, description)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (error) {
      console.error('Get user subscriptions error:', error);
      throw new Error(error.message);
    }
    
    return data;
  }
}

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

export class RealtimeManager {
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_notice_tb',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToLoyaltyUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`loyalty-${userId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'royalty_tb',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
}

// ========================================
// STORAGE MANAGER
// ========================================

export class StorageManager {
  static async uploadProfilePicture(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      console.error('Upload profile picture error:', error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    // Update user profile with new avatar
    await MobileBusinessLogic.updateUserProfile(userId, {
      avatar_url: publicUrl
    });

    return publicUrl;
  }

  static async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const utils = {
  // Date formatting
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('tr-TR');
  },

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('tr-TR');
  },

  formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Point calculations
  calculateLoyaltyLevel(points: number): string {
    if (points >= 1000) return 'legend';
    if (points >= 500) return 'gold';
    if (points >= 250) return 'silver';
    if (points >= 100) return 'bronze';
    return 'explorer';
  },

  getPointsToNextLevel(currentPoints: number): number {
    if (currentPoints >= 1000) return 0; // Already at max level
    if (currentPoints >= 500) return 1000 - currentPoints;
    if (currentPoints >= 250) return 500 - currentPoints;
    if (currentPoints >= 100) return 250 - currentPoints;
    return 100 - currentPoints;
  },

  // Validation helpers
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Generate unique codes
  generateReferralCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  },

  // Format currency
  formatCurrency(amount: number, currency: string = 'TRY'): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format points
  formatPoints(points: number): string {
    return points.toLocaleString('tr-TR');
  }
};

// ========================================
// EXPORTS
// ========================================

export default supabase;
