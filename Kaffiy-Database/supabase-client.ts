// ========================================
// KAFFIY SUPABASE CLIENT
// Professional database connection and utilities
// ========================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// ========================================
// CONFIGURATION
// ========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ========================================
// CLIENT CREATION
// ========================================

export const supabase: SupabaseClient<Database> = createClient<Database>(
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
        'X-Client-Info': 'kaffiy-dashboard/1.0.0',
      },
    },
  }
);

// ========================================
// AUTHENTICATION UTILITIES
// ========================================

export class AuthManager {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
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
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async updateProfile(updates: Record<string, any>) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// ========================================
// DATABASE OPERATIONS
// ========================================

export class DatabaseManager {
  // Generic CRUD operations
  static async create<T extends keyof Database['Tables']>(
    table: T,
    data: Database['Tables'][T]['Insert']
  ) {
    const { data, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async read<T extends keyof Database['Tables']>(
    table: T,
    options?: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    }
  ) {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async update<T extends keyof Database['Tables']>(
    table: T,
    id: string,
    data: Database['Tables'][T]['Update']
  ) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  }

  static async delete<T extends keyof Database['Tables']>(
    table: T,
    id: string
  ) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }

  // Batch operations
  static async batchCreate<T extends keyof Database['Tables']>(
    table: T,
    records: Database['Tables'][T]['Insert'][]
  ) {
    const { data, error } = await supabase
      .from(table)
      .insert(records)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Count operations
  static async count<T extends keyof Database['Tables']>(
    table: T,
    filters?: Record<string, any>
  ) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

export class RealtimeManager {
  static subscribe<T extends keyof Database['Tables']>(
    table: T,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        callback
      )
      .subscribe();
  }

  static subscribeToAuth(callback: (payload: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static unsubscribe(channel: any) {
    supabase.removeChannel(channel);
  }
}

// ========================================
// STORAGE OPERATIONS
// ========================================

export class StorageManager {
  static async upload(
    bucket: string,
    path: string,
    file: File,
    options?: {
      upsert?: boolean;
      contentType?: string;
    }
  ) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options);
    
    if (error) throw error;
    return data;
  }

  static async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  static async delete(bucket: string, paths: string[]) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) throw error;
    return data;
  }

  static async list(bucket: string, path?: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order?: 'asc' | 'desc' };
  }) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, options);
    
    if (error) throw error;
    return data;
  }
}

// ========================================
// BUSINESS LOGIC HELPERS
// ========================================

export class BusinessLogic {
  // User loyalty operations
  static async updateUserLoyalty(userId: string, companyId: string, pointsToAdd: number) {
    // First, get current loyalty record
    const { data: existing } = await supabase
      .from('royalty_tb')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (existing) {
      // Update existing record
      const newPoints = existing.points + pointsToAdd;
      const { data, error } = await supabase.rpc('update_loyalty_level', {
        user_uuid: userId,
        company_uuid: companyId
      });
      
      if (error) throw error;
      return data;
    } else {
      // Create new loyalty record
      return await DatabaseManager.create('royalty_tb', {
        user_id: userId,
        company_id: companyId,
        points: pointsToAdd,
        level: 'explorer'
      });
    }
  }

  // Campaign operations
  static async createCampaign(campaignData: Database['Tables']['campaign_tb']['Insert']) {
    return await DatabaseManager.create('campaign_tb', campaignData);
  }

  static async getCampaignsByCompany(companyId: string, status?: Database['Types']['StatusCampaign']) {
    const filters: Record<string, any> = { company_id: companyId };
    if (status) filters.status = status;

    return await DatabaseManager.read('campaign_tb', {
      filters,
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  // QR operations
  static async generateQRCode(qrData: Database['Tables']['qr_tb']['Insert']) {
    // Generate unique QR code
    const qrCode = `KAFFIY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return await DatabaseManager.create('qr_tb', {
      ...qrData,
      qr_code: qrCode,
      status: 'generated'
    });
  }

  static async scanQRCode(qrCode: string, userId: string) {
    // Get QR record
    const { data: qrRecord } = await supabase
      .from('qr_tb')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (!qrRecord) throw new Error('QR code not found');
    if (qrRecord.status !== 'generated') throw new Error('QR code already used');
    if (qrRecord.expires_at && new Date(qrRecord.expires_at) < new Date()) {
      throw new Error('QR code expired');
    }

    // Update QR status
    const updatedQR = await DatabaseManager.update('qr_tb', qrRecord.id, {
      status: 'scanned',
      scanned_at: new Date().toISOString(),
      user_id: userId
    });

    // Award points to user
    if (qrRecord.points_earned > 0) {
      await this.updateUserLoyalty(userId, qrRecord.company_id, qrRecord.points_earned);
    }

    return updatedQR;
  }

  // Notification operations
  static async sendNotification(notificationData: Database['Tables']['user_notice_tb']['Insert']) {
    return await DatabaseManager.create('user_notice_tb', notificationData);
  }

  static async getUserNotifications(userId: string, unreadOnly = false) {
    const filters: Record<string, any> = { user_id: userId };
    if (unreadOnly) filters.is_read = false;

    return await DatabaseManager.read('user_notice_tb', {
      filters,
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  static async markNotificationAsRead(notificationId: string) {
    return await DatabaseManager.update('user_notice_tb', notificationId, {
      is_read: true,
      read_at: new Date().toISOString()
    });
  }
}

// ========================================
// ERROR HANDLING
// ========================================

export class ErrorHandler {
  static handleDatabaseError(error: any): never {
    console.error('Database Error:', error);
    
    if (error.code === 'PGRST116') {
      throw new Error('Record not found');
    } else if (error.code === 'PGRST301') {
      throw new Error('Permission denied');
    } else if (error.code === '23505') {
      throw new Error('Duplicate entry');
    } else if (error.code === '23503') {
      throw new Error('Foreign key constraint violation');
    } else {
      throw new Error(error.message || 'Database operation failed');
    }
  }

  static handleAuthError(error: any): never {
    console.error('Auth Error:', error);
    
    if (error.message === 'Invalid login credentials') {
      throw new Error('Invalid email or password');
    } else if (error.message === 'User already registered') {
      throw new Error('Email already registered');
    } else if (error.message === 'Email not confirmed') {
      throw new Error('Please confirm your email address');
    } else {
      throw new Error(error.message || 'Authentication failed');
    }
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

  // Point calculations
  calculateLoyaltyLevel(points: number): Database['Types']['TypeRoyalty'] {
    if (points >= 1000) return 'legend';
    if (points >= 500) return 'gold';
    if (points >= 250) return 'silver';
    if (points >= 100) return 'bronze';
    return 'explorer';
  },

  // Validation helpers
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Generate unique codes
  generateReferralCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  },

  generateQRCode(): string {
    return `KAFFIY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// ========================================
// EXPORTS
// ========================================

export default supabase;
export {
  AuthManager,
  DatabaseManager,
  RealtimeManager,
  StorageManager,
  BusinessLogic,
  ErrorHandler,
  utils
};
