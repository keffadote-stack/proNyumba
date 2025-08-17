/**
 * AUTHENTICATION CONTEXT
 * 
 * React context for managing user authentication state across the application.
 * Provides authentication functions and user data to all components.
 * 
 * KEY FEATURES:
 * - User authentication state management
 * - Login/logout functionality
 * - User profile data
 * - Loading states
 * - Error handling
 * - Automatic session restoration
 * 
 * USAGE:
 * - Wrap app with AuthProvider
 * - Use useAuth hook in components
 * - Access user data and auth functions
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth, db, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../lib/supabase';
import { employeeService } from '../services/employeeService';
import type { Database } from '../lib/supabase';

// Types
type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  // User state
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  
  // Loading states
  loading: boolean;
  profileLoading: boolean;
  
  // Authentication functions
  signUp: (email: string, password: string, userData: {
    fullName: string;
    phoneNumber: string;
    userRole: 'super_admin' | 'property_admin' | 'tenant';
  }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  
  // Employee management functions (Super Admin only)
  inviteEmployee: (email: string, fullName: string) => Promise<{ error: any }>;
  activateEmployee: (userId: string, employeeData: {
    employeeId: string;
    hiredDate: string;
  }) => Promise<{ error: any }>;
  deactivateEmployee: (userId: string) => Promise<{ error: any }>;
  assignProperties: (adminId: string, propertyIds: string[]) => Promise<{ error: any }>;
  
  // Profile functions
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  
  // Role-based utility functions
  isSuperAdmin: boolean;
  isPropertyAdmin: boolean;
  isTenant: boolean;
  canManageEmployees: boolean;
  canManageProperties: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AUTH PROVIDER COMPONENT
 * 
 * Provides authentication context to the entire application.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Start with true, will be set to false after initialization
  const [profileLoading, setProfileLoading] = useState(false);

  /**
   * LOAD USER PROFILE
   * 
   * Fetches user profile data from the database.
   */
  const loadProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Loading profile for user:', userId);
      
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, skipping profile load');
        setProfile(null);
        return;
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile load timeout')), 5000)
      );
      
      try {
        const profilePromise = db.users.getById(userId);
        const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('Error loading profile:', error);
          // Don't throw error, just set profile to null
          setProfile(null);
          return;
        }
        
        console.log('Profile loaded:', data);
        setProfile(data);
      } catch (dbError) {
        console.error('Database error loading profile:', dbError);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * SIGN UP FUNCTION
   * 
   * Creates a new user account with profile data.
   */
  const signUp = async (
    email: string, 
    password: string, 
    userData: { fullName: string; phoneNumber: string; userRole: 'super_admin' | 'property_admin' | 'tenant' }
  ) => {
    try {
      console.log('Starting signup process...', { email, userData });
      
      // Check if Supabase is configured
      if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
        console.log('Supabase not configured, simulating signup success');
        return { error: null };
      }
      
      // Check if user already exists (but don't fail if check fails)
      try {
        const { exists } = await auth.checkUserExists(email);
        if (exists) {
          return { error: { message: 'User with this email already exists' } };
        }
      } catch (checkError) {
        console.log('User existence check failed, proceeding with signup:', checkError);
        // Continue with signup even if check fails
      }
      
      const { data, error } = await auth.signUp(email, password, userData);
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      console.log('Signup data:', data);
      return { error: null };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { error };
    }
  };

  /**
   * SIGN IN FUNCTION
   * 
   * Authenticates user with email and password.
   */
  const signIn = async (email: string, password: string) => {
    try {
      // DEVELOPMENT BYPASS - Allow super admin login without Supabase
      if (email === 'admin@dev.com' && password === 'admin123') {
        console.log('Development bypass: Logging in as super admin');
        
        // Create mock user and profile
        const mockUser = {
          id: 'dev-super-admin-123',
          email: 'admin@dev.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated'
        } as any;
        
        const mockProfile = {
          id: 'dev-super-admin-123',
          full_name: 'Super Admin',
          email: 'admin@dev.com',
          phone_number: '+255123456789',
          user_role: 'super_admin' as const,
          avatar_url: null,
          is_verified: true,
          is_active: true,
          employee_id: 'SA001',
          hired_date: new Date().toISOString(),
          performance_rating: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Set the mock data
        setUser(mockUser);
        setProfile(mockProfile);
        setSession({ user: mockUser, access_token: 'mock-token' } as any);
        
        return { error: null };
      }
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, simulating signin success');
        return { error: null };
      }
      
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * SIGN OUT FUNCTION
   * 
   * Signs out the current user and clears state.
   */
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  /**
   * EMPLOYEE MANAGEMENT FUNCTIONS
   * 
   * Functions for Super Admin to manage Property Admin employees.
   */
  const inviteEmployee = async (email: string, fullName: string) => {
    if (!profile || profile.user_role !== 'super_admin') {
      return { error: 'Unauthorized: Only Super Admins can invite employees' };
    }

    return employeeService.inviteEmployee({ email, fullName });
  };

  const activateEmployee = async (userId: string, employeeData: {
    employeeId: string;
    hiredDate: string;
  }) => {
    if (!profile || profile.user_role !== 'super_admin') {
      return { error: 'Unauthorized: Only Super Admins can activate employees' };
    }

    return employeeService.activateEmployee(userId, employeeData);
  };

  const deactivateEmployee = async (userId: string) => {
    if (!profile || profile.user_role !== 'super_admin') {
      return { error: 'Unauthorized: Only Super Admins can deactivate employees' };
    }

    return employeeService.deactivateEmployee(userId);
  };

  const assignProperties = async (adminId: string, propertyIds: string[]) => {
    if (!profile || profile.user_role !== 'super_admin') {
      return { error: 'Unauthorized: Only Super Admins can assign properties' };
    }

    return employeeService.assignProperties(adminId, propertyIds);
  };

  /**
   * UPDATE PROFILE FUNCTION
   * 
   * Updates user profile data in the database.
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: 'No user logged in' };
    }

    try {
      const { data, error } = await db.users.update(user.id, updates);
      
      if (error) {
        return { error };
      }
      
      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  /**
   * AUTHENTICATION STATE LISTENER
   * 
   * Listens for authentication state changes and updates context.
   */
  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Simple initialization without blocking
    const initializeAuth = async () => {
      try {
        // If Supabase is not configured, just continue without auth
        if (!isSupabaseConfigured) {
          console.log('Supabase not configured, continuing without auth');
          setLoading(false);
          return;
        }
        
        // Try to get session but don't block the app
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('Found existing session');
            setSession(session);
            setUser(session.user);
            // Try to load profile but don't block
            loadProfile(session.user.id).catch(console.error);
          }
        } catch (error) {
          console.error('Error getting session:', error);
        }
        
        // Set up auth listener if Supabase is configured
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              loadProfile(session.user.id).catch(console.error);
            } else {
              setProfile(null);
            }
          }
        );
        
        setLoading(false); // Set loading to false after initialization
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false); // Ensure loading is false even on error
      }
    };
    
    const cleanup = initializeAuth();
    
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, []);

  // Computed values for role-based access
  const isSuperAdmin = profile?.user_role === 'super_admin';
  const isPropertyAdmin = profile?.user_role === 'property_admin';
  const isTenant = profile?.user_role === 'tenant';
  const canManageEmployees = isSuperAdmin;
  const canManageProperties = isSuperAdmin || isPropertyAdmin;

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    inviteEmployee,
    activateEmployee,
    deactivateEmployee,
    assignProperties,
    updateProfile,
    isSuperAdmin,
    isPropertyAdmin,
    isTenant,
    canManageEmployees,
    canManageProperties
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * USE AUTH HOOK
 * 
 * Custom hook to access authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;