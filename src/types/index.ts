/**
 * TYPE DEFINITIONS FOR NYUMBALINK
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
 * Represents system users with three-tier role system.
 * Supports role-based access control and employee management.
 * 
 * USAGE: Authentication, user profiles, role-based permissions, employee management
 * SCALABILITY:
 * - Three-tier role system (Super Admin, Property Admin, Tenant)
 * - Employee management fields for Property Admins
 * - Verification system for trust and safety
 * - Profile image support for enhanced user experience
 */
export interface User {
  id: string;                   // Unique user identifier (matches auth system)
  fullName: string;             // User's complete name
  email: string;                // Email address (unique, used for login)
  phoneNumber: string;          // Phone number for contact and verification
  userRole: 'super_admin' | 'property_admin' | 'tenant';  // Three-tier role system
  isVerified: boolean;          // Account verification status
  isActive: boolean;            // Account active status
  profileImage?: string;        // Optional profile picture URL
  registrationDate: string;     // When user account was created

  // Employee-specific fields (for Property Admins)
  employeeId?: string;          // Unique employee identifier
  hiredDate?: string;           // When employee was hired
  performanceRating?: number;   // Employee performance rating (0-5)
}

/**
 * EMPLOYEE INVITATION INTERFACE
 * 
 * Represents invitations sent to potential Property Admin employees.
 * Manages the employee onboarding workflow.
 */
export interface EmployeeInvitation {
  id: string;                   // Unique invitation identifier
  email: string;                // Invited employee email
  fullName: string;             // Invited employee name
  invitedBy: string;            // Super Admin who sent invitation
  status: 'pending' | 'accepted' | 'expired';  // Invitation status
  invitationToken: string;      // Unique token for invitation link
  expiresAt: string;            // When invitation expires
  createdAt: string;            // When invitation was sent
}

/**
 * EMPLOYEE PERFORMANCE INTERFACE
 * 
 * Represents employee performance metrics and KPIs.
 * Used for tracking Property Admin productivity.
 */
export interface EmployeePerformance {
  id: string;                   // Unique performance record identifier
  adminId: string;              // Property Admin user ID
  monthYear: string;            // Performance period (YYYY-MM format)
  propertiesManaged: number;    // Number of properties assigned
  bookingsReceived: number;     // Total booking requests received
  bookingsApproved: number;     // Booking requests approved
  bookingsCompleted: number;    // Successful bookings completed
  conversionRate: number;       // Booking conversion percentage
  averageResponseTime: number;  // Average response time in hours
  tenantSatisfactionRating: number;  // Average tenant satisfaction (1-5)
  revenueGenerated: number;     // Revenue generated through bookings
  occupancyRate: number;        // Property occupancy percentage
}

/**
 * BOOKING REQUEST INTERFACE
 * 
 * Represents a tenant's request to view a property with enhanced workflow.
 * Manages the complete booking lifecycle from request to completion.
 * 
 * USAGE: Booking request forms, admin approval workflow, notifications
 * SCALABILITY: 
 * - Complete status workflow management
 * - Admin response and scheduling system
 * - Feedback collection system
 * - Performance tracking integration
 */
export interface BookingRequest {
  id: string;                   // Unique request identifier
  propertyId: string;           // Reference to the property being viewed
  tenantId: string;             // Reference to the requesting tenant
  adminId: string;              // Reference to the assigned property admin
  tenantName: string;           // Tenant's full name
  tenantPhone: string;          // Tenant's phone number
  tenantEmail: string;          // Tenant's email address
  preferredViewingDate: string; // Preferred viewing date (ISO date string)
  preferredViewingTime: string; // Preferred time slot (e.g., "14:00")
  message?: string;             // Optional additional notes or requirements
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';  // Request workflow status
  adminResponse?: string;       // Admin's response message
  scheduledDate?: string;       // Actual scheduled date/time (ISO string)
  feedbackRating?: number;      // Tenant feedback rating (1-5)
  feedbackComment?: string;     // Tenant feedback comment
  createdAt: string;            // When the request was submitted
  updatedAt: string;            // When the request was last updated
}

/**
 * PAYMENT INTERFACE
 * 
 * Represents payment transactions with automatic service fee calculation.
 * Supports multiple payment methods and transparent fee structure.
 * 
 * USAGE: Payment processing, financial reporting, service fee tracking
 * SCALABILITY:
 * - Multiple payment method support
 * - Automatic service fee calculation (20% platform fee)
 * - Transaction reference for payment gateway integration
 * - Status tracking for payment workflow
 */
export interface Payment {
  id: string;                   // Unique payment identifier
  bookingId: string;            // Reference to the booking request
  propertyId: string;           // Reference to the rented property
  tenantId: string;             // Reference to the paying tenant
  adminId: string;              // Reference to the property admin
  rentAmount: number;           // Base rent amount
  serviceFeeAmount: number;     // Platform service fee (20% of rent)
  totalAmount: number;          // Total amount paid by tenant (rent + service fee)
  paymentMethod: 'mpesa' | 'tigo-pesa' | 'airtel-money' | 'bank-transfer' | 'stripe';  // Payment gateway used
  transactionReference: string; // Payment gateway transaction ID
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';  // Payment processing status
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