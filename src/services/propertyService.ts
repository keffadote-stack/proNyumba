/**
 * PROPERTY SERVICE
 * 
 * Business logic for property management operations.
 */

import { db } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Property, SearchFilters } from '../types';
import { transformDbPropertyToApp, calculatePropertyFees } from '../transformers/propertyTransformer';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export const propertyService = {
  /**
   * Get all properties with optional filters
   */
  getProperties: async (filters?: SearchFilters) => {
    try {
      const dbFilters = filters ? {
        city: filters.location,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        propertyType: filters.propertyType,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        search: filters.location // Use location as search term if provided
      } : undefined;

      const { data, error } = await db.properties.getAll(dbFilters);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get properties by admin ID
   */
  getPropertiesByAdmin: async (adminId: string) => {
    try {
      const { data, error } = await db.properties.getByAdmin(adminId);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get single property by ID
   */
  getPropertyById: async (id: string) => {
    try {
      const { data, error } = await db.properties.getById(id);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Create new property
   */
  createProperty: async (propertyData: PropertyInsert) => {
    try {
      // Calculate service fees using transformer
      const fees = calculatePropertyFees(propertyData.rent_amount);
      
      const propertyWithFees = {
        ...propertyData,
        service_fee_amount: fees.serviceFeeAmount,
        total_amount: fees.totalAmount
      };

      const { data, error } = await db.properties.create(propertyWithFees);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update property
   */
  updateProperty: async (id: string, updates: PropertyUpdate) => {
    try {
      // Recalculate fees if rent amount is updated
      if (updates.rent_amount) {
        const fees = calculatePropertyFees(updates.rent_amount);
        updates.service_fee_amount = fees.serviceFeeAmount;
        updates.total_amount = fees.totalAmount;
      }

      const { data, error } = await db.properties.update(id, updates);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Delete property
   */
  deleteProperty: async (id: string) => {
    try {
      const { error } = await db.properties.delete(id);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Increment property views
   */
  incrementViews: async (id: string) => {
    try {
      const { error } = await db.properties.incrementViews(id);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Transform database property to app property format
   */
  transformDbProperty: transformDbPropertyToApp
};