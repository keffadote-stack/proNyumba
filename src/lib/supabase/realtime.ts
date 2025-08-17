/**
 * REAL-TIME SUBSCRIPTIONS
 * 
 * Helper functions for setting up real-time subscriptions.
 * Extracted from main supabase file for better organization.
 */

import { supabase } from './client';

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

  // Subscribe to booking request changes
  subscribeToBookingRequests: (callback: (payload: any) => void, adminId?: string) => {
    let channel = supabase.channel('booking_requests');
    
    if (adminId) {
      channel = channel.on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'booking_requests',
          filter: `admin_id=eq.${adminId}`
        }, 
        callback
      );
    } else {
      channel = channel.on('postgres_changes', 
        { event: '*', schema: 'public', table: 'booking_requests' }, 
        callback
      );
    }
    
    return channel.subscribe();
  },

  // Subscribe to user changes (for employee management)
  subscribeToUsers: (callback: (payload: any) => void) => {
    return supabase
      .channel('users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to notifications
  subscribeToNotifications: (callback: (payload: any) => void, userId: string) => {
    return supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  },

  // Unsubscribe from a channel
  unsubscribe: (subscription: any) => {
    return supabase.removeChannel(subscription);
  }
};