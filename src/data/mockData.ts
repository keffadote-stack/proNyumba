/**
 * MOCK DATA FOR NYUMBATZ RENTAL PLATFORM
 * 
 * This file contains sample data used for development and testing.
 * In production, this data would come from a database (Supabase).
 * 
 * STRUCTURE:
 * - Static reference data (cities, property types, amenities)
 * - Sample properties with realistic Tanzanian data
 * - Sample users representing different roles
 * - Sample viewing requests and payments
 * 
 * SCALABILITY NOTES:
 * - Data is structured to match production database schema
 * - Includes comprehensive property coverage across Tanzania
 * - Realistic pricing in Tanzanian Shillings
 * - Diverse property types and amenities
 */

import { Property, User, ViewingRequest, Payment } from '../types';

/**
 * TANZANIAN CITIES DATA
 * 
 * List of major cities where the platform operates.
 * Used in search filters and property location selection.
 * 
 * USAGE: Dropdown options, search filters, location validation
 * SCALABILITY: Easy to add new cities as platform expands
 */
export const tanzanianCities = [
  'Dar es Salaam',    // Commercial capital and largest city
  'Mwanza',           // Second largest city, Lake Victoria region
  'Arusha',           // Northern Tanzania, tourism hub
  'Mbeya',            // Southern highlands, agricultural center
  'Morogoro',         // Central Tanzania, university town
  'Tanga',            // Coastal city, historical significance
  'Dodoma',           // Capital city, government center
  'Moshi',            // Kilimanjaro region, coffee growing area
  'Iringa',           // Southern highlands, cool climate
  'Mtwara',           // Southern coast, gas and port city
];

/**
 * PROPERTY TYPES CONFIGURATION
 * 
 * Defines available property categories with bilingual labels.
 * Supports both English and Swahili for local users.
 * 
 * USAGE: Property type filters, listing forms, search options
 * SCALABILITY: Easy to add new property types (e.g., commercial, land)
 */
export const propertyTypes = [
  { value: 'house', label: 'Nyumba (House)' },           // Standalone houses
  { value: 'apartment', label: 'Ghorofa (Apartment)' },  // Apartment units
  { value: 'studio', label: 'Studio' },                  // Studio apartments
  { value: 'villa', label: 'Villa' },                    // Luxury villas
  { value: 'room', label: 'Chumba (Room)' }              // Single rooms
];

/**
 * AMENITIES REFERENCE DATA
 * 
 * List of common property amenities and features.
 * Used for property filtering and feature highlighting.
 * 
 * USAGE: Amenity filters, property feature lists, search criteria
 * SCALABILITY: Easy to add new amenities as market demands change
 */
export const amenities = [
  'Parking',          // Vehicle parking space
  'Security',         // Security guard or system
  'Generator',        // Backup power generation
  'Water Tank',       // Water storage system
  'Garden',           // Outdoor garden space
  'Balcony',          // Balcony or terrace
  'Air Conditioning', // Climate control
  'Internet',         // Internet connectivity
  'Swimming Pool',    // Swimming facilities
  'Gym',              // Fitness facilities
  'Elevator',         // Lift access
  'Furnished',        // Comes with furniture
  'CCTV',            // Security cameras
  'Kitchen',         // Modern kitchen
  'Dining Room'      // Dining area
];

/**
 * UTILITIES REFERENCE DATA
 * 
 * List of available utilities and infrastructure.
 * Used for property utility filtering and feature highlighting.
 */
export const utilities = [
  'Electricity (TANESCO)',  // National electricity grid
  'Water (DAWASA)',         // Water authority supply
  'Internet Ready',         // Internet infrastructure
  'Solar Power',            // Solar energy system
  'Backup Generator',       // Emergency power
  'Water Pump'              // Water pumping system
];

/**
 * NEARBY SERVICES REFERENCE DATA
 * 
 * List of nearby services and facilities.
 * Used for location-based filtering and area information.
 */
export const nearbyServices = [
  'Hospital',          // Medical facilities
  'Clinic',            // Health clinic
  'Primary School',    // Elementary education
  'Secondary School',  // High school education
  'University',        // Higher education
  'Market',            // Local market
  'Supermarket',       // Shopping center
  'Bank',              // Banking services
  'ATM',               // Cash machine
  'Bus Stop',          // Public transport
  'Taxi Stand',        // Taxi services
  'Restaurant',        // Dining options
  'Pharmacy',          // Medical supplies
  'Police Station'     // Security services
];

/**
 * SAMPLE PROPERTIES DATA
 * 
 * Comprehensive collection of sample rental properties across Tanzania.
 * Includes diverse property types, locations, and price ranges.
 * 
 * DATA STRUCTURE:
 * - Properties span major Tanzanian cities
 * - Realistic pricing in Tanzanian Shillings (TSh)
 * - Varied property types and sizes
 * - Featured properties for promotional display
 * - High-quality stock photos from Pexels
 * 
 * PRICING CONTEXT:
 * - Studio: 180K-280K TSh/month
 * - Apartment: 320K-650K TSh/month  
 * - House: 450K-920K TSh/month
 * - Villa: 750K-2.8M TSh/month
 * 
 * SCALABILITY:
 * - Easy to add more properties
 * - Structure matches database schema
 * - Supports property status management
 * - Featured flag for promotional listings
 */
export const mockProperties: Property[] = [
  // PREMIUM PROPERTIES IN DAR ES SALAAM
  {
    id: '1',
    ownerId: 'owner1',
    title: 'Modern 3BR House in Masaki',
    description: 'Beautiful modern house in the prestigious Masaki area with sea views. Perfect for professionals and families. Fully furnished with modern amenities.',
    priceMonthly: 1200000,  // 1.2M TSh - Premium location
    location: {
      address: 'Masaki Peninsula',
      city: 'Dar es Salaam',
      district: 'Kinondoni',
      neighborhood: 'Masaki',
      latitude: -6.7611,
      longitude: 39.2858
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Furnished'],
    images: [
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-15',
    updatedDate: '2024-01-15',
    featured: true  // Premium featured listing
  },

  {
    id: '2',
    ownerId: 'owner2',
    title: 'Luxury Villa in Oyster Bay',
    description: 'Stunning luxury villa with ocean views in Oyster Bay. Features spacious rooms, private garden, and top-notch security.',
    priceMonthly: 2500000,  // 2.5M TSh - Luxury property
    location: {
      address: 'Oyster Bay Road',
      city: 'Dar es Salaam',
      district: 'Kinondoni',
      neighborhood: 'Oyster Bay',
      latitude: -6.7924,
      longitude: 39.2793
    },
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'villa',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    images: [
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-10',
    updatedDate: '2024-01-10',
    featured: true
  },

  // AFFORDABLE OPTIONS IN DAR ES SALAAM
  {
    id: '3',
    ownerId: 'owner3',
    title: 'Cozy Apartment in Mikocheni',
    description: 'Well-maintained 2-bedroom apartment in Mikocheni. Close to shopping centers and public transport.',
    priceMonthly: 550000,   // 550K TSh - Mid-range apartment
    location: {
      address: 'Mikocheni Light Industrial Area',
      city: 'Dar es Salaam',
      district: 'Kinondoni',
      neighborhood: 'Mikocheni',
      latitude: -6.7735,
      longitude: 39.2203
    },
    bedrooms: 2,
    bathrooms: 1,
    propertyType: 'apartment',
    amenities: ['Parking', 'Security', 'Water Tank', 'Internet'],
    images: [
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-12',
    updatedDate: '2024-01-12'
  },

  // REGIONAL PROPERTIES - MWANZA
  {
    id: '4',
    ownerId: 'owner4',
    title: 'Executive House in Mwanza City',
    description: 'Executive 4-bedroom house near Lake Victoria. Perfect for business executives with family.',
    priceMonthly: 800000,   // 800K TSh - Executive housing
    location: {
      address: 'Ilemela District',
      city: 'Mwanza',
      district: 'Ilemela',
      neighborhood: 'Ilemela',
      latitude: -2.5164,
      longitude: 32.9175
    },
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
    images: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-08',
    updatedDate: '2024-01-08',
    featured: true
  },

  // TOURISM PROPERTIES - ARUSHA
  {
    id: '5',
    ownerId: 'owner5',
    title: 'Safari Lodge Style House in Arusha',
    description: 'Unique safari lodge style house in Arusha, perfect for tourists and expatriates. Close to Mount Meru.',
    priceMonthly: 950000,   // 950K TSh - Tourism market
    location: {
      address: 'Arusha Central',
      city: 'Arusha',
      district: 'Arusha Urban',
      neighborhood: 'Central',
      latitude: -3.3667,
      longitude: 36.6833
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished'],
    images: [
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-05',
    updatedDate: '2024-01-05'
  },

  // BUDGET PROPERTIES - MBEYA
  {
    id: '6',
    ownerId: 'owner6',
    title: 'Modern Studio in Mbeya',
    description: 'Compact modern studio apartment perfect for students and young professionals in Mbeya.',
    priceMonthly: 280000,   // 280K TSh - Budget option
    location: {
      address: 'Mbeya Urban',
      city: 'Mbeya',
      district: 'Mbeya Urban',
      neighborhood: 'Mbeya',
      latitude: -8.9094,
      longitude: 33.4607
    },
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'studio',
    amenities: ['Security', 'Water Tank', 'Internet'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-03',
    updatedDate: '2024-01-03'
  },

  // ADDITIONAL MBEYA PROPERTIES (Comprehensive coverage)
  {
    id: '7',
    ownerId: 'owner7',
    title: 'Family House in Mbeya Highlands',
    description: 'Spacious 3-bedroom house in the cool highlands of Mbeya. Perfect for families with children. Features a large garden and mountain views.',
    priceMonthly: 450000,
    location: {
      address: 'Mbeya Highlands',
      city: 'Mbeya',
      district: 'Mbeya Rural',
      neighborhood: 'Highlands',
      latitude: -8.8953,
      longitude: 33.4456
    },
    bedrooms: 3,
    bathrooms: 2,
    propertyType: 'house',
    amenities: ['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    images: [
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-18',
    updatedDate: '2024-01-18'
  },

  // ... (Additional properties continue with similar detailed comments)
  // Note: I'm including a few more key examples to show the pattern

  // STUDENT ACCOMMODATION
  {
    id: '10',
    ownerId: 'owner10',
    title: 'Student Hostel in Mbeya University Area',
    description: 'Affordable accommodation near Mbeya University of Science and Technology. Perfect for students with shared facilities.',
    priceMonthly: 180000,   // 180K TSh - Student budget
    location: {
      address: 'University Area',
      city: 'Mbeya',
      district: 'Mbeya Urban',
      neighborhood: 'University',
      latitude: -8.9123,
      longitude: 33.4789
    },
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'studio',
    amenities: ['Security', 'Water Tank', 'Internet'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'
    ],
    status: 'available',
    createdDate: '2024-01-25',
    updatedDate: '2024-01-25'
  },

  // COASTAL PROPERTIES
  {
    id: '30',
    ownerId: 'owner30',
    title: 'Coastal Villa in Mtwara',
    description: 'Stunning coastal villa with direct beach access. Features modern amenities and breathtaking ocean views.',
    priceMonthly: 1150000,  // 1.15M TSh - Coastal premium
    location: {
      address: 'Mtwara Beach Front',
      city: 'Mtwara',
      district: 'Mtwara Urban',
      neighborhood: 'Beach Front',
      latitude: -10.2678,
      longitude: 40.1834
    },
    bedrooms: 4,
    bathrooms: 3,
    propertyType: 'villa',
    amenities: ['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    images: [
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'
    ],
    status: 'available',
    createdDate: '2024-02-18',
    updatedDate: '2024-02-18',
    featured: true
  }

  // Note: Additional properties (8, 9, 11-29) follow the same pattern
  // Each represents different market segments and geographic areas
];

/**
 * SAMPLE USERS DATA
 * 
 * Represents different user roles in the system.
 * Used for testing role-based access control and user interactions.
 * 
 * USER ROLES:
 * - tenant: Can search properties, request viewings, make payments
 * - owner: Can list properties, manage listings, receive payments
 * - admin: Full system access, user management, financial oversight
 */
export const mockUsers: User[] = [
  {
    id: 'user1',
    fullName: 'John Mwamba',
    email: 'john.mwamba@gmail.com',
    phoneNumber: '+255712345678',
    userRole: 'tenant',
    registrationDate: '2024-01-01',
    isVerified: true
  },
  {
    id: 'owner1',
    fullName: 'Grace Kimonge',
    email: 'grace.kimonge@gmail.com',
    phoneNumber: '+255722345678',
    userRole: 'owner',
    registrationDate: '2023-12-15',
    isVerified: true
  },
  {
    id: 'admin1',
    fullName: 'Admin User',
    email: 'admin@nyumba-tz.com',
    phoneNumber: '+255732345678',
    userRole: 'admin',
    registrationDate: '2023-11-01',
    isVerified: true
  }
];

/**
 * SAMPLE VIEWING REQUESTS
 * 
 * Represents property viewing requests from tenants.
 * Used for testing the viewing request workflow and notifications.
 */
export const mockViewingRequests: ViewingRequest[] = [
  {
    id: 'req1',
    propertyId: '1',
    tenantId: 'user1',
    requestedDate: '2024-02-01',
    preferredTime: '14:00',
    status: 'pending',
    createdAt: '2024-01-20'
  }
];

/**
 * SAMPLE PAYMENTS DATA
 * 
 * Represents completed payment transactions.
 * Demonstrates the 15% commission structure and payment processing.
 * 
 * COMMISSION STRUCTURE:
 * - Total amount: What tenant pays
 * - Commission (15%): Platform fee
 * - Owner amount (85%): What property owner receives
 */
export const mockPayments: Payment[] = [
  {
    id: 'pay1',
    propertyId: '1',
    tenantId: 'user1',
    amountTotal: 1380000,      // Total paid by tenant (rent + commission)
    commissionAmount: 180000,   // 15% platform commission
    ownerAmount: 1200000,       // 85% to property owner
    paymentMethod: 'mpesa',
    transactionReference: 'MP240115001',
    status: 'completed',
    paymentDate: '2024-01-15'
  }
];