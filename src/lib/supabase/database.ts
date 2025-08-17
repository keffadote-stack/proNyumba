/**
 * DATABASE HELPERS
 *
 * Helper functions for common database operations.
 * Extracted from the main supabase.ts file for better organization.
 */

import { supabase } from "./client";
import type { Database } from "../../types/supabase";

export const db = {
  // Users (formerly profiles)
  users: {
    // Get user by ID
    getById: async (id: string) => {
      return supabase.from("users").select("*").eq("id", id).single();
    },

    // Get all employees (Property Admins)
    getEmployees: async () => {
      return supabase
        .from("users")
        .select("*")
        .eq("user_role", "property_admin")
        .order("created_at", { ascending: false });
    },

    // Create user
    create: async (user: Database["public"]["Tables"]["users"]["Insert"]) => {
      return supabase.from("users").insert(user).select().single();
    },

    // Update user
    update: async (
      id: string,
      updates: Database["public"]["Tables"]["users"]["Update"]
    ) => {
      return supabase
        .from("users")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
    },
  },

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
      adminId?: string; // Filter by assigned admin
    }) => {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters?.priceMin) {
        query = query.gte("rent_amount", filters.priceMin);
      }
      if (filters?.priceMax) {
        query = query.lte("rent_amount", filters.priceMax);
      }
      if (filters?.propertyType) {
        query = query.eq("property_type", filters.propertyType);
      }
      if (filters?.bedrooms) {
        query = query.gte("bedrooms", filters.bedrooms);
      }
      if (filters?.bathrooms) {
        query = query.gte("bathrooms", filters.bathrooms);
      }
      if (filters?.adminId) {
        query = query.eq("assigned_admin_id", filters.adminId);
      }
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,area.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          (filters.offset || 0) + (filters.limit || 10) - 1
        );
      }

      return query;
    },

    // Get properties by assigned admin
    getByAdmin: async (adminId: string) => {
      return supabase
        .from("properties")
        .select("*")
        .eq("assigned_admin_id", adminId)
        .order("created_at", { ascending: false });
    },

    // Get single property
    getById: async (id: string) => {
      return supabase
        .from("properties")
        .select(
          `
          *,
          users:assigned_admin_id (
            full_name,
            phone_number,
            is_verified,
            employee_id
          )
        `
        )
        .eq("id", id)
        .single();
    },

    // Create property
    create: async (
      property: Database["public"]["Tables"]["properties"]["Insert"]
    ) => {
      return supabase.from("properties").insert(property).select().single();
    },

    // Update property
    update: async (
      id: string,
      updates: Database["public"]["Tables"]["properties"]["Update"]
    ) => {
      return supabase
        .from("properties")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
    },

    // Delete property
    delete: async (id: string) => {
      return supabase.from("properties").delete().eq("id", id);
    },

    // Increment views
    incrementViews: async (id: string) => {
      return supabase.rpc("increment_property_views", { property_id: id });
    },
  },

  // Booking Requests
  bookingRequests: {
    // Get booking requests for admin
    getByAdmin: async (adminId: string) => {
      if (adminId === "all") {
        return supabase
          .from("booking_requests")
          .select(
            `
            *,
            properties (
              title,
              city,
              area,
              rent_amount,
              service_fee_amount,
              total_amount
            )
          `
          )
          .order("created_at", { ascending: false });
      }

      return supabase
        .from("booking_requests")
        .select(
          `
          *,
          properties (
            title,
            city,
            area,
            rent_amount,
            service_fee_amount,
            total_amount
          )
        `
        )
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false });
    },

    // Get booking requests for tenant
    getByTenant: async (tenantId: string) => {
      return supabase
        .from("booking_requests")
        .select(
          `
          *,
          properties (
            title,
            city,
            area,
            rent_amount,
            service_fee_amount,
            total_amount
          )
        `
        )
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
    },

    // Create booking request
    create: async (
      booking: Database["public"]["Tables"]["booking_requests"]["Insert"]
    ) => {
      return supabase
        .from("booking_requests")
        .insert(booking)
        .select()
        .single();
    },

    // Update booking request
    update: async (
      id: string,
      updates: Database["public"]["Tables"]["booking_requests"]["Update"]
    ) => {
      return supabase
        .from("booking_requests")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
    },
  },

  // Payments
  payments: {
    // Get payments for admin
    getByAdmin: async (adminId: string) => {
      if (adminId === "all") {
        return supabase
          .from("payments")
          .select(
            `
            *,
            properties (title, city, area),
            users:tenant_id (full_name, email)
          `
          )
          .order("created_at", { ascending: false });
      }

      return supabase
        .from("payments")
        .select(
          `
          *,
          properties (title, city, area),
          users:tenant_id (full_name, email)
        `
        )
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false });
    },

    // Get payments for tenant
    getByTenant: async (tenantId: string) => {
      return supabase
        .from("payments")
        .select(
          `
          *,
          properties (title, city, area)
        `
        )
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
    },

    // Create payment
    create: async (
      payment: Database["public"]["Tables"]["payments"]["Insert"]
    ) => {
      return supabase.from("payments").insert(payment).select().single();
    },

    // Update payment
    update: async (
      id: string,
      updates: Database["public"]["Tables"]["payments"]["Update"]
    ) => {
      return supabase
        .from("payments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    },
  },

  // Employee Performance
  employeePerformance: {
    // Get performance for admin
    getByAdmin: async (adminId: string) => {
      return supabase
        .from("employee_performance")
        .select("*")
        .eq("admin_id", adminId)
        .order("month_year", { ascending: false });
    },

    // Get all employee performance (Super Admin)
    getAll: async () => {
      return supabase
        .from("employee_performance")
        .select(
          `
          *,
          users:admin_id (
            full_name,
            employee_id
          )
        `
        )
        .order("month_year", { ascending: false });
    },

    // Create or update performance record
    upsert: async (
      performance: Database["public"]["Tables"]["employee_performance"]["Insert"]
    ) => {
      return supabase
        .from("employee_performance")
        .upsert(performance, { onConflict: "admin_id,month_year" })
        .select()
        .single();
    },
  },

  // Notifications
  notifications: {
    // Get notifications for user
    getByUser: async (userId: string) => {
      return supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    },

    // Create notification
    create: async (
      notification: Database["public"]["Tables"]["notifications"]["Insert"]
    ) => {
      return supabase
        .from("notifications")
        .insert(notification)
        .select()
        .single();
    },

    // Mark as read
    markAsRead: async (id: string) => {
      return supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
    },
  },
};
