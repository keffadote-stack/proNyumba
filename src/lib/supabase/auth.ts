/**
 * AUTHENTICATION HELPERS
 * 
 * Helper functions for common authentication operations.
 */

import { supabase } from './client';

export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData: { fullName: string; phoneNumber: string; userRole: 'super_admin' | 'property_admin' | 'tenant' }) => {
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
        
        // Verify user profile was created
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.log('User profile not found, creating manually...', profileError);
          // Create user profile manually if trigger failed
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              full_name: userData.fullName,
              email: email,
              phone_number: userData.phoneNumber,
              user_role: userData.userRole,
              is_verified: false,
              is_active: true
            });
            
          if (createError) {
            console.error('Manual user profile creation failed:', createError);
          } else {
            console.log('User profile created manually');
          }
        } else {
          console.log('User profile created by trigger:', profile);
