/**
 * SUPABASE MODULE INDEX
 * 
 * Re-exports all Supabase functionality from organized modules.
 * This maintains backward compatibility while improving organization.
 */

// Client and configuration
export { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './client';

// Authentication helpers
export { auth } from './auth';

// Database helpers
export { db } from './database';

// Real-time subscriptions
export { realtime } from './realtime';

// Types (re-export from types directory)
export type { Database } from '../../types/supabase';