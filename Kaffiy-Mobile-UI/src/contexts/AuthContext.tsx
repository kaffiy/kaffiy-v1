// ========================================
// KAFFIY MOBILE AUTH CONTEXT
// Authentication state management for mobile app
// ========================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthManager, MobileBusinessLogic } from '../lib/supabase';
import { User } from '../types/database';

// ========================================
// TYPES
// ========================================

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Record<string, any>) => Promise<void>;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ========================================
// ACTION TYPES
// ========================================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SIGN_OUT' };

// ========================================
// REDUCER
// ========================================

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// ========================================
// INITIAL STATE
// ========================================

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// ========================================
// CONTEXT
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

export const AuthProviderComponent: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Get current user
        const currentUser = await AuthManager.getCurrentUser();
        
        if (currentUser) {
          // Get user profile from database
          const userProfile = await MobileBusinessLogic.getUserProfile(currentUser.id);
          dispatch({ type: 'SET_USER', payload: userProfile || null });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_USER', payload: null });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AuthManager.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userProfile = await MobileBusinessLogic.getUserProfile(session.user.id);
            dispatch({ type: 'SET_USER', payload: userProfile || null });
          } catch (error) {
            console.error('Error getting user profile:', error);
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'SIGN_OUT' });
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ========================================
  // ACTIONS
  // ========================================

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const { user } = await AuthManager.signIn(email, password);
      
      if (user) {
        const userProfile = await MobileBusinessLogic.getUserProfile(user.id);
        dispatch({ type: 'SET_USER', payload: userProfile || null });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş yapılamadı';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await AuthManager.signUp(email, password, metadata);
      
      // Don't set user immediately - they need to verify email first
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıt yapılamadı';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AuthManager.signOut();
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      console.error('Sign out error:', error);
      // Still sign out locally even if server call fails
      dispatch({ type: 'SIGN_OUT' });
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await AuthManager.resetPassword(email);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Şifre sıfırlanamadı';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateProfile = async (updates: Record<string, any>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Update auth profile
      await AuthManager.updateProfile(updates);
      
      // Update database profile
      if (state.user) {
        const updatedProfile = await MobileBusinessLogic.getUserProfile(state.user.id);
        dispatch({ type: 'SET_USER', payload: updatedProfile || null });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profil güncellenemedi';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================================
// HOOK
// ========================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// ========================================
// EXPORTS
// ========================================

export { AuthContext, AuthProviderComponent as AuthProvider };
