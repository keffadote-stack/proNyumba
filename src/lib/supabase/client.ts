/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * Core Supabase client setup and configuration.
 * This file only handles client initialization.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('your-anon-key');

console.log('Supabase configuration:', {
  url: supabaseUrl ? 'configured' : 'missing',
  key: supabaseAnonKey ? 'configured' : 'missing',
  isConfigured: isSupabaseConfigured
});

// Export configuration status for use in other modules
export { supabaseUrl, supabaseAnonKey };

// Create Supabase client with TypeScript types
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key', 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);