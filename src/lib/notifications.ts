/**
 * NOTIFICATION SERVICE
 * 
 * Service for sending notifications via email, WhatsApp, and in-app notifications.
 * Handles employee invitations, booking updates, and system notifications.
 */

import { db } from './supabase';

export interface NotificationData {
  userId: string;
  type: 'employee_invitation' | 'booking_request' | 'payment_confirmation' | 'property_update' | 'system_announcement';
  title: string;
  message: string;
  data?: any;
  channels?: ('in_app' | 'email' | 'whatsapp' | 'push')[];
}

export const notifications = {
  // Send employee invitation notification
  sendEmployeeInvitation: async (email: string, fullName: string, invitedBy: string) => {
    try {
      // In a real application, this would integrate with an email service like SendGrid, Mailgun, etc.
      console.log('Sending employee invitation email:', {
        to: email,
        subject: 'Welcome to NyumbaLink - Property Admin Invitation',
        template: 'employee_invitation',
        data: {
          fullName,
          invitedBy,
          loginUrl: `${window.location.origin}/login`,
          companyName: 'NyumbaLink'
        }
      });

      // For now, we'll just log the invitation details
      // In production, replace this with actual email service integration
      const emailContent = `
        Dear ${fullName},

        You have been invited to join NyumbaLink as a Property Admin by ${invitedBy}.

        As a Property Admin, you will be able to:
        - Manage assigned properties
        - Handle booking requests from tenants
        - Track your performance metrics
        - Communicate with potential tenants

        To get started:
        1. Visit ${window.location.origin}
        2. Sign in with your email: ${email}
        3. Complete your profile setup
        4. Wait for property assignments from your Super Admin

        Welcome to the team!

        Best regards,
        The NyumbaLink Team
      `;

      console.log('Employee invitation email content:', emailContent);

      return { success: true, message: 'Invitation email sent successfully' };
    } catch (error) {
      console.error('Error sending employee invitation:', error);
      return { success: false, message: 'Failed to send invitation email' };
    }
  },

  // Send booking request notification
  sendBookingNotification: async (adminId: string, bookingData: any) => {
    try {
      // Create in-app notification
      await db.notifications.create({
        user_id: adminId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `New viewing request for ${bookingData.propertyTitle}`,
        data: bookingData,
        channels: ['in_app', 'email']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending booking notification:', error);
      return { success: false };
    }
  },

  // Send payment confirmation notification
  sendPaymentConfirmation: async (userId: string, paymentData: any) => {
    try {
      await db.notifications.create({
        user_id: userId,
        type: 'payment_confirmation',
        title: 'Payment Processed',
        message: `Payment of TSh ${paymentData.totalAmount.toLocaleString()} has been processed successfully`,
        data: paymentData,
        channels: ['in_app', 'email']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return { success: false };
    }
  },

  // Send property assignment notification
  sendPropertyAssignment: async (adminId: string, propertyData: any) => {
    try {
      await db.notifications.create({
        user_id: adminId,
        type: 'property_update',
        title: 'New Property Assigned',
        message: `You have been assigned to manage "${propertyData.title}"`,
        data: propertyData,
        channels: ['in_app', 'email']
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending property assignment notification:', error);
      return { success: false };
    }
  },

  // Send system announcement
  sendSystemAnnouncement: async (userIds: string[], title: string, message: string) => {
    try {
      const promises = userIds.map(userId =>
        db.notifications.create({
          user_id: userId,
          type: 'system_announcement',
          title,
          message,
          channels: ['in_app']
        })
      );

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error sending system announcement:', error);
      return { success: false };
    }
  }
};

// WhatsApp Business API integration (placeholder)
export const whatsapp = {
  sendMessage: async (phoneNumber: string, message: string) => {
    try {
      // In production, integrate with WhatsApp Business API
      console.log('WhatsApp message would be sent:', {
        to: phoneNumber,
        message
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false };
    }
  },

  sendBookingUpdate: async (phoneNumber: string, bookingData: any) => {
    const message = `
Hello! Your booking request for "${bookingData.propertyTitle}" has been ${bookingData.status}.

${bookingData.adminResponse ? `Admin response: ${bookingData.adminResponse}` : ''}

For more details, please visit our platform.

- NyumbaLink Team
    `;

    return whatsapp.sendMessage(phoneNumber, message);
  }
};