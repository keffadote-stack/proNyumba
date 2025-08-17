-- Seed data for NyumbaLink
-- This file contains sample data for development and testing

-- Insert sample profiles (these will be created automatically when users sign up)
-- But we can insert some test data for development

-- Note: In production, profiles are created automatically via the trigger
-- This is just for testing purposes

-- Sample properties data
-- First, let's create some sample user IDs (these should match actual auth.users in production)

-- Insert sample properties
INSERT INTO properties (
    id,
    owner_id,
    title,
    description,
    property_type,
    bedrooms,
    bathrooms,
    price_monthly,
    city,
    area,
    address,
    phone_contact,
    images,
    amenities,
    utilities,
    nearby_services,
    is_available
) VALUES 
(
    gen_random_uuid(),
    gen_random_uuid(), -- This should be replaced with actual user IDs
    'Modern 3-Bedroom Apartment in Masaki',
    'Beautiful modern apartment with ocean view, fully furnished with modern amenities. Located in the prestigious Masaki area with 24/7 security, backup generator, and water supply.',
    'apartment',
    3,
    2,
    1200000,
    'Dar es Salaam',
    'Masaki',
    'Plot 123, Masaki Peninsula',
    '+255 712 345 678',
    ARRAY[
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
    ],
    ARRAY['Air Conditioning', 'Furnished', 'Parking', 'Security', 'Generator', 'Water Tank'],
    ARRAY['Electricity', 'Water', 'Internet'],
    ARRAY['Supermarket', 'Hospital', 'School', 'Beach'],
    true
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Spacious 4-Bedroom House in Mikocheni',
    'Large family house with garden, perfect for families. Features include a spacious living room, dining area, modern kitchen, and servant quarters.',
    'house',
    4,
    3,
    800000,
    'Dar es Salaam',
    'Mikocheni',
    'House No. 45, Mikocheni B',
    '+255 754 987 321',
    ARRAY[
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
    ],
    ARRAY['Garden', 'Parking', 'Security', 'Servant Quarters'],
    ARRAY['Electricity', 'Water'],
    ARRAY['Shopping Mall', 'School', 'Hospital'],
    true
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Affordable 2-Bedroom Apartment in Kinondoni',
    'Clean and affordable apartment suitable for small families or professionals. Well-maintained building with reliable utilities.',
    'apartment',
    2,
    1,
    450000,
    'Dar es Salaam',
    'Kinondoni',
    'Block C, Kinondoni Housing Estate',
    '+255 678 123 456',
    ARRAY[
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    ARRAY['Parking', 'Security'],
    ARRAY['Electricity', 'Water'],
    ARRAY['Market', 'Bus Stop', 'Clinic'],
    true
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Single Room in Temeke',
    'Clean single room perfect for students or young professionals. Shared bathroom and kitchen facilities available.',
    'room',
    1,
    1,
    180000,
    'Dar es Salaam',
    'Temeke',
    'Temeke Residential Area',
    '+255 765 432 109',
    ARRAY[
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
    ],
    ARRAY['Shared Kitchen', 'Shared Bathroom'],
    ARRAY['Electricity', 'Water'],
    ARRAY['Market', 'Transport'],
    true
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Luxury Villa in Oyster Bay',
    'Stunning luxury villa with swimming pool, garden, and ocean view. Perfect for executives and diplomats.',
    'house',
    5,
    4,
    2500000,
    'Dar es Salaam',
    'Oyster Bay',
    'Villa 7, Oyster Bay',
    '+255 713 567 890',
    ARRAY[
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    ],
    ARRAY['Swimming Pool', 'Garden', 'Ocean View', 'Security', 'Generator', 'Parking'],
    ARRAY['Electricity', 'Water', 'Internet', 'Cable TV'],
    ARRAY['Beach', 'Restaurant', 'Embassy', 'Hospital'],
    true
),
-- Properties in other cities
(
    gen_random_uuid(),
    gen_random_uuid(),
    '3-Bedroom House in Mwanza City Center',
    'Well-located house in Mwanza city center, close to Lake Victoria. Perfect for families working in the city.',
    'house',
    3,
    2,
    600000,
    'Mwanza',
    'City Center',
    'Kenyatta Road, Mwanza',
    '+255 728 345 678',
    ARRAY[
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
    ],
    ARRAY['Parking', 'Security', 'Garden'],
    ARRAY['Electricity', 'Water'],
    ARRAY['Market', 'Bank', 'School', 'Lake Victoria'],
    true
),
(
    gen_random_uuid(),
    gen_random_uuid(),
    'Modern Apartment in Arusha',
    'Modern 2-bedroom apartment in Arusha, close to Mount Meru. Great for professionals and tourists.',
    'apartment',
    2,
    2,
    550000,
    'Arusha',
    'Kaloleni',
    'Kaloleni Area, Arusha',
    '+255 754 876 543',
    ARRAY[
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    ARRAY['Furnished', 'Parking', 'Security'],
    ARRAY['Electricity', 'Water', 'Internet'],
    ARRAY['Shopping Center', 'Hospital', 'Mount Meru View'],
    true
);

-- Sample amenities that can be used for filtering
-- These are already included in the properties above, but here's a reference list:
/*
Common Tanzanian Property Amenities:
- Air Conditioning
- Furnished/Unfurnished
- Parking
- Security/Watchman
- Generator/Backup Power
- Water Tank/Borehole
- Garden
- Swimming Pool
- Servant Quarters
- Balcony/Terrace
- Ocean View/Lake View
- Internet/WiFi Ready
- Cable TV Ready

Common Utilities:
- Electricity (TANESCO)
- Water (Municipal/Borehole)
- Internet
- Cable TV
- Gas

Common Nearby Services:
- Supermarket/Market
- Hospital/Clinic
- School
- Bank/ATM
- Transport/Bus Stop
- Beach/Lake
- Shopping Mall
- Restaurant
- Embassy/Government Office
*/