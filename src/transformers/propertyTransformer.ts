/**
 * PROPERTY DATA TRANSFORMERS
 * 
 * Functions to transform data between different formats.
 * Centralized location for all property-related data transformations.
 */

import type { Property } from '../types';

/**
 * Transform database property to app property format
 */
export const transformDbPropertyToApp = (dbProperty: any): Property => {
  return {
    id: dbProperty.id,
    ownerId: dbProperty.assigned_admin_id,
    title: dbProperty.title,
    description: dbProperty.description,
    priceMonthly: parseFloat(dbProperty.rent_amount),
    location: {
      address: dbProperty.full_address || '',
      city: dbProperty.city,
      district: dbProperty.area,
      neighborhood: dbProperty.area
    },
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    propertyType: dbProperty.property_type as 'house' | 'apartment' | 'studio' | 'villa' | 'room',
    amenities: dbProperty.amenities || [],
    images: dbProperty.images || ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    status: dbProperty.is_available ? 'available' : 'rented' as 'available' | 'rented' | 'maintenance',
    createdDate: dbProperty.created_at,
    updatedDate: dbProperty.updated_at,
    featured: false
  };
};

/**
 * Transform app property to database format
 */
export const transformAppPropertyToDb = (appProperty: Property): any => {
  return {
    id: appProperty.id,
    assigned_admin_id: appProperty.ownerId,
    title: appProperty.title,
    description: appProperty.description,
    rent_amount: appProperty.priceMonthly,
    full_address: appProperty.location.address,
    city: appProperty.location.city,
    area: appProperty.location.district,
    bedrooms: appProperty.bedrooms,
    bathrooms: appProperty.bathrooms,
    property_type: appProperty.propertyType,
    amenities: appProperty.amenities,
    images: appProperty.images,
    is_available: appProperty.status === 'available',
    created_at: appProperty.createdDate,
    updated_at: appProperty.updatedDate
  };
};

/**
 * Calculate service fees for property
 */
export const calculatePropertyFees = (rentAmount: number) => {
  const serviceFee = rentAmount * 0.2; // 20% service fee
  const totalAmount = rentAmount + serviceFee;
  
  return {
    rentAmount,
    serviceFeeAmount: serviceFee,
    totalAmount
  };
};