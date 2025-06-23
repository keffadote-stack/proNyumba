/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * This file sets up the Supabase client for authentication and database operations.
 * Supabase provides a complete backend solution with authentication, database, and real-time features.
 * 
 * KEY FEATURES:
 * - User authentication (email/password)
 * - PostgreSQL database with real-time subscriptions
 * - Row Level Security (RLS) for data protection
 * - File storage for property images
 * - Automatic API generation
 * 
 * ENVIRONMENT VARIABLES:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Add them to your .env file
 * 4. Run the database migrations to create tables
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('your-anon-key');

console.log('Supabase configuration:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseAnonKey ? 'configured' : 'missing',
  isConfigured: isSupabaseConfigured
});

// Export configuration status for use in other modules
export { isSupabaseConfigured, supabaseUrl, supabaseAnonKey };

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

/**
 * DATABASE TYPES
 * 
 * TypeScript interfaces that match our Supabase database schema.
 * These ensure type safety when working with database operations.
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone_number: string | null;
          user_role: 'tenant' | 'landlord';
          avatar_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone_number?: string | null;
          user_role: 'tenant' | 'landlord';
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone_number?: string | null;
          user_role?: 'tenant' | 'landlord';
          avatar_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          property_type: 'house' | 'apartment' | 'room';
          bedrooms: number;
          bathrooms: number;
          price_monthly: number;
          city: string;
          area: string;
          address: string | null;
          phone_contact: string;
          images: string[];
          amenities: string[];
          utilities: string[];
          nearby_services: string[];
          is_available: boolean;
          views_count: number;
          inquiries_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          property_type: 'house' | 'apartment' | 'room';
          bedrooms: number;
          bathrooms: number;
          price_monthly: number;
          city: string;
          area: string;
          address?: string | null;
          phone_contact: string;
          images?: string[];
          amenities?: string[];
          utilities?: string[];
          nearby_services?: string[];
          is_available?: boolean;
          views_count?: number;
          inquiries_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          property_type?: 'house' | 'apartment' | 'room';
          bedrooms?: number;
          bathrooms?: number;
          price_monthly?: number;
          city?: string;
          area?: string;
          address?: string | null;
          phone_contact?: string;
          images?: string[];
          amenities?: string[];
          utilities?: string[];
          nearby_services?: string[];
          is_available?: boolean;
          views_count?: number;
          inquiries_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_inquiries: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          tenant_name: string;
          tenant_phone: string;
          message: string;
          status: 'new' | 'contacted' | 'viewed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          tenant_name: string;
          tenant_phone: string;
          message: string;
          status?: 'new' | 'contacted' | 'viewed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          tenant_id?: string;
          tenant_name?: string;
          tenant_phone?: string;
          message?: string;
          status?: 'new' | 'contacted' | 'viewed';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

/**
 * AUTHENTICATION HELPERS
 * 
 * Helper functions for common authentication operations.
 */

export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData: { fullName: string; phoneNumber: string; userRole: 'tenant' | 'landlord' }) => {
    try {
      console.log('Starting signup with data:', { email, userData });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for MVP
          data: {
            full_name: userData.fullName,
            phone_number: userData.phoneNumber,
            user_role: userData.userRole
          }
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error.message, error);
        return { data, error };
      }
      
      console.log('Signup successful, user created:', data.user?.id);
      
      // Wait a moment for the trigger to create the profile
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify profile was created
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.log('Profile not found, creating manually...', profileError);
          // Create profile manually if trigger failed
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: userData.fullName,
              email: email,
              phone_number: userData.phoneNumber,
              user_role: userData.userRole,
              is_verified: false
            });
            
          if (createError) {
            console.error('Manual profile creation failed:', createError);
          } else {
            console.log('Profile created manually');
          }
        } else {
          console.log('Profile created by trigger:', profile);
        }
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Signup catch error:', err);
      return { data: null, error: err };
    }
  },

  // Manual profile creation (fallback)
  createProfile: async (userId: string, userData: { fullName: string; email: string; phoneNumber: string; userRole: 'tenant' | 'landlord' }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData.fullName,
          email: userData.email,
          phone_number: userData.phoneNumber,
          user_role: userData.userRole,
          is_verified: false
        })
        .select()
        .single();
      
      return { data, error };
    } catch (err) {
      console.error('Profile creation error:', err);
      return { data: null, error: err };
    }
  },

  // Check if user exists
  checkUserExists: async (email: string) => {
    try {
      console.log('Checking if user exists:', email);
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle to avoid error when no rows found
      
      console.log('User exists check result:', { exists: !!data, error });
      return { exists: !!data, error: null }; // Don't return error for "no rows found"
    } catch (err) {
      console.error('Error checking user existence:', err);
      return { exists: false, error: err };
    }
  },

  // Get user by email
  getUserByEmail: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Update password
  updatePassword: async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Verify email
  verifyEmail: async (token: string, type: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Resend verification email
  resendVerification: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Get auth status
  getAuthStatus: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (err) {
      return { user: null, error: err };
    }
  },

  // Refresh session
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Get current session
  getSession: () => {
    return supabase.auth.getSession();
  }
};

/**
 * DATABASE HELPERS
 * 
 * Helper functions for common database operations.
 */

export const db = {
  // Properties
  properties: {
    // Get all properties with filters
    getAll: async (filters?: {
      city?: string;
      priceMin?: number;
      priceMax?: number;
      propertyType?: string;
      bedrooms?: number;
      bathrooms?: number;
      limit?: number;
      offset?: number;
      search?: string;
    }) => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            phone_number,
            is_verified
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.priceMin) {
        query = query.gte('price_monthly', filters.priceMin);
      }
      if (filters?.priceMax) {
        query = query.lte('price_monthly', filters.priceMax);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters?.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters?.bathrooms) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,area.ilike.%${filters.search}%`);
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 10) - 1);
      }

      return query;
    },

    // Get properties by owner
    getByOwner: async (ownerId: string) => {
      return supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });
    },

    // Get single property
    getById: async (id: string) => {
      return supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            phone_number,
            is_verified
          )
        `)
        .eq('id', id)
        .single();
    },

    // Create property
    create: async (property: Database['public']['Tables']['properties']['Insert']) => {
      return supabase
        .from('properties')
        .insert(property)
        .select()
        .single();
    },

    // Update property
    update: async (id: string, updates: Database['public']['Tables']['properties']['Update']) => {
      return supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    },

    // Delete property
    delete: async (id: string) => {
      return supabase
        .from('properties')
        .delete()
        .eq('id', id);
    },

    // Increment views
    incrementViews: async (id: string) => {
      return supabase.rpc('increment_property_views', { property_id: id });
    }
  },

  // Profiles
  profiles: {
    // Get profile by user ID
    getById: async (id: string) => {
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
    },

    // Create profile
    create: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
      return supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();
    },

    // Update profile
    update: async (id: string, updates: Database['public']['Tables']['profiles']['Update']) => {
      return supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    }
  },

  // Property Inquiries
  inquiries: {
    // Get inquiries for landlord
    getByLandlord: async (landlordId: string) => {
      return supabase
        .from('property_inquiries')
        .select(`
          *,
          properties (
            title,
            city,
            area,
            price_monthly
          )
        `)
        .in('property_id', 
          supabase
            .from('properties')
            .select('id')
            .eq('owner_id', landlordId)
        )
        .order('created_at', { ascending: false });
    },

    // Create inquiry
    create: async (inquiry: Database['public']['Tables']['property_inquiries']['Insert']) => {
      return supabase
        .from('property_inquiries')
        .insert(inquiry)
        .select()
        .single();
    },

    // Update inquiry status
    updateStatus: async (id: string, status: 'new' | 'contacted' | 'viewed') => {
      return supabase
        .from('property_inquiries')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    }
  }
};

/**
 * REAL-TIME SUBSCRIPTIONS
 * 
 * Helper functions for setting up real-time subscriptions.
 */

export const realtime = {
  // Subscribe to property changes
  subscribeToProperties: (callback: (payload: any) => void) => {
    return supabase
      .channel('properties')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to inquiries for a landlord
  subscribeToInquiries: (landlordId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('inquiries')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'property_inquiries',
          filter: `property_id=in.(select id from properties where owner_id=eq.${landlordId})`
        }, 
        callback
      )
      .subscribe();
  }
};

export default supabase;