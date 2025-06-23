/**
 * TYPE DEFINITIONS FOR NYUMBATZ RENTAL PLATFORM
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * These types ensure type safety and provide clear contracts between components.
 * 
 * SCALABILITY NOTES:
 * - All interfaces use optional properties where appropriate for flexibility
 * - IDs are strings to support various ID formats (UUID, MongoDB ObjectId, etc.)
 * - Enums are defined as union types for better TypeScript support
 * - Location interface supports both basic and advanced geographic data
 */

/**
 * LOCATION INTERFACE
 * 
 * Represents geographic location data for properties.
 * Supports both basic address info and precise coordinates for mapping.
 * 
 * USAGE: Property listings, search filters, map integration
 * SCALABILITY: Can be extended with postal codes, regions, etc.
 */
export interface Location {
  address: string;           // Street address or building name
  city: string;             // City name (required for search/filtering)
  district: string;         // District/ward for more precise location
  neighborhood?: string;    // Optional neighborhood for detailed location
  latitude?: number;        // GPS coordinates for map integration
  longitude?: number;       // GPS coordinates for map integration
}

/**
 * PROPERTY INTERFACE
 * 
 * Core data structure representing a rental property.
 * Contains all essential information needed for listing, searching, and displaying properties.
 * 
 * USAGE: Property cards, details pages, search results, admin management
 * SCALABILITY: 
 * - Images array supports multiple photos
 * - Amenities array allows flexible feature additions
 * - Status enum can be extended for more property states
 * - Featured flag supports promotional listings
 */
export interface Property {
  id: string;                    // Unique identifier (UUID recommended)
  ownerId: string;              // Reference to property owner's user ID
  title: string;                // Property listing title/headline
  description: string;          // Detailed property description
  priceMonthly: number;         // Monthly rent in Tanzanian Shillings
  location: Location;           // Geographic location data
  bedrooms: number;             // Number of bedrooms
  bathrooms: number;            // Number of bathrooms
  propertyType: 'house' | 'apartment' | 'studio' | 'villa' | 'room';  // Property category
  amenities: string[];          // Array of available amenities/features
  images: string[];             // Array of image URLs (first image is primary)
  status: 'available' | 'rented' | 'maintenance';  // Current property status
  createdDate: string;          // ISO date string when property was listed
  updatedDate: string;          // ISO date string when property was last modified
  featured?: boolean;           // Optional flag for promoted/featured listings
}

/**
 * VIEWING REQUEST INTERFACE
 * 
 * Represents a tenant's request to view a property.
 * Manages the scheduling and status of property viewings.
 * 
 * USAGE: Viewing request forms, admin approval workflow, notifications
 * SCALABILITY: 
 * - Status enum supports complete workflow management
 * - Notes field allows flexible communication
 * - Can be extended with preferred contact method, group viewing, etc.
 */
export interface ViewingRequest {
  id: string;                   // Unique request identifier
  propertyId: string;           // Reference to the property being viewed
  tenantId: string;             // Reference to the requesting tenant
  requestedDate: string;        // Preferred viewing date (ISO date string)
  preferredTime: string;        // Preferred time slot (e.g., "14:00")
  status: 'pending' | 'approved' | 'rejected' | 'completed';  // Request workflow status
  notes?: string;               // Optional additional notes or requirements
  createdAt: string;            // When the request was submitted
}

/**
 * USER INTERFACE
 * 
 * Represents system users (tenants, property owners, administrators).
 * Supports role-based access control and user verification.
 * 
 * USAGE: Authentication, user profiles, role-based permissions
 * SCALABILITY:
 * - Role enum supports multiple user types
 * - Verification system for trust and safety
 * - Profile image support for enhanced user experience
 * - Can be extended with preferences, settings, etc.
 */
export interface User {
  id: string;                   // Unique user identifier (matches auth system)
  fullName: string;             // User's complete name
  email: string;                // Email address (unique, used for login)
  phoneNumber: string;          // Phone number for contact and verification
  userRole: 'admin' | 'tenant' | 'owner';  // Role-based access control
  isVerified: boolean;          // Account verification status
  profileImage?: string;        // Optional profile picture URL
  registrationDate: string;     // When user account was created
}

/**
 * PAYMENT INTERFACE
 * 
 * Represents payment transactions with automatic commission calculation.
 * Supports multiple payment methods popular in Tanzania.
 * 
 * USAGE: Payment processing, financial reporting, commission tracking
 * SCALABILITY:
 * - Multiple payment method support
 * - Automatic commission calculation (15% platform fee)
 * - Transaction reference for payment gateway integration
 * - Status tracking for payment workflow
 */
export interface Payment {
  id: string;                   // Unique payment identifier
  propertyId: string;           // Reference to the rented property
  tenantId: string;             // Reference to the paying tenant
  amountTotal: number;          // Total amount paid by tenant
  commissionAmount: number;     // Platform commission (15% of total)
  ownerAmount: number;          // Amount paid to property owner (85% of total)
  paymentMethod: 'mpesa' | 'tigo-pesa' | 'airtel-money' | 'bank-transfer';  // Payment gateway used
  transactionReference: string; // Payment gateway transaction ID
  status: 'pending' | 'completed' | 'failed';  // Payment processing status
  paymentDate: string;          // When payment was processed
}

/**
 * SEARCH FILTERS INTERFACE
 * 
 * Represents user search criteria and filtering options.
 * All properties are optional to support flexible searching.
 * 
 * USAGE: Search forms, filter components, query building
 * SCALABILITY:
 * - All optional properties for flexible filtering
 * - Price range object supports min/max filtering
 * - Amenities array supports multiple feature filtering
 * - Legacy houseType support for backward compatibility
 * - Can be extended with sorting, pagination, etc.
 */
export interface SearchFilters {
  location?: string;            // City or area filter
  priceMin?: number;            // Minimum price filter
  priceMax?: number;            // Maximum price filter
  priceRange?: {                // Alternative price range object
    min: number;
    max: number;
  };
  bedrooms?: number;            // Minimum number of bedrooms
  bathrooms?: number;           // Minimum number of bathrooms
  propertyType?: string;        // Property type filter
  houseType?: string;           // Legacy property type field (for backward compatibility)
  amenities?: string[];         // Required amenities filter
  availabilityDate?: string;    // Available from date filter
}