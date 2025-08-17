-- Seed Properties Data Migration
-- This migration populates the database with sample properties from mock data

-- First, create a sample property admin user to assign properties to
INSERT INTO users (
  id,
  full_name,
  email,
  phone_number,
  user_role,
  is_verified,
  is_active,
  employee_id,
  hired_date,
  performance_rating
) VALUES (
  gen_random_uuid(),
  'John Mwalimu',
  'john.mwalimu@nyumbalink.com',
  '+255712345678',
  'property_admin',
  true,
  true,
  'EMP001',
  '2024-01-01',
  4.2
) ON CONFLICT (email) DO NOTHING;

-- Get the property admin ID for property assignment
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'john.mwalimu@nyumbalink.com';
  
  -- Insert sample properties
  INSERT INTO properties (
    assigned_admin_id,
    title,
    description,
    property_type,
    bedrooms,
    bathrooms,
    rent_amount,
    city,
    area,
    full_address,
    images,
    amenities,
    is_available,
    created_at,
    updated_at
  ) VALUES
  -- Premium Properties in Dar es Salaam
  (
    admin_id,
    'Modern 3BR House in Masaki',
    'Beautiful modern house in the prestigious Masaki area with sea views. Perfect for professionals and families. Fully furnished with modern amenities.',
    'house',
    3,
    2,
    1200000,
    'Dar es Salaam',
    'Masaki',
    'Masaki Peninsula, Kinondoni, Dar es Salaam',
    ARRAY[
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Furnished'],
    true,
    '2024-01-15',
    '2024-01-15'
  ),
  (
    admin_id,
    'Luxury Villa in Oyster Bay',
    'Stunning luxury villa with ocean views in Oyster Bay. Features spacious rooms, private garden, and top-notch security.',
    'house',
    4,
    3,
    2500000,
    'Dar es Salaam',
    'Oyster Bay',
    'Oyster Bay Road, Kinondoni, Dar es Salaam',
    ARRAY[
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    true,
    '2024-01-10',
    '2024-01-10'
  ),
  (
    admin_id,
    'Cozy Apartment in Mikocheni',
    'Well-maintained 2-bedroom apartment in Mikocheni. Close to shopping centers and public transport.',
    'apartment',
    2,
    1,
    550000,
    'Dar es Salaam',
    'Mikocheni',
    'Mikocheni Light Industrial Area, Kinondoni, Dar es Salaam',
    ARRAY[
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Water Tank', 'Internet'],
    true,
    '2024-01-12',
    '2024-01-12'
  ),
  
  -- Regional Properties - Mwanza
  (
    admin_id,
    'Executive House in Mwanza City',
    'Executive 4-bedroom house near Lake Victoria. Perfect for business executives with family.',
    'house',
    4,
    3,
    800000,
    'Mwanza',
    'Ilemela',
    'Ilemela District, Mwanza',
    ARRAY[
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
    true,
    '2024-01-08',
    '2024-01-08'
  ),
  
  -- Tourism Properties - Arusha
  (
    admin_id,
    'Safari Lodge Style House in Arusha',
    'Unique safari lodge style house in Arusha, perfect for tourists and expatriates. Close to Mount Meru.',
    'house',
    3,
    2,
    950000,
    'Arusha',
    'Central',
    'Arusha Central, Arusha Urban, Arusha',
    ARRAY[
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished'],
    true,
    '2024-01-05',
    '2024-01-05'
  ),
  
  -- Budget Properties - Mbeya
  (
    admin_id,
    'Modern Studio in Mbeya',
    'Compact modern studio apartment perfect for students and young professionals in Mbeya.',
    'studio',
    1,
    1,
    280000,
    'Mbeya',
    'Mbeya Urban',
    'Mbeya Urban, Mbeya',
    ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    ARRAY['Security', 'Water Tank', 'Internet'],
    true,
    '2024-01-03',
    '2024-01-03'
  ),
  (
    admin_id,
    'Family House in Mbeya Highlands',
    'Spacious 3-bedroom house in the cool highlands of Mbeya. Perfect for families with children. Features a large garden and mountain views.',
    'house',
    3,
    2,
    450000,
    'Mbeya',
    'Highlands',
    'Mbeya Highlands, Mbeya Rural, Mbeya',
    ARRAY[
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    true,
    '2024-01-18',
    '2024-01-18'
  ),
  
  -- Student Accommodation
  (
    admin_id,
    'Student Hostel in Mbeya University Area',
    'Affordable accommodation near Mbeya University of Science and Technology. Perfect for students with shared facilities.',
    'studio',
    1,
    1,
    180000,
    'Mbeya',
    'University',
    'University Area, Mbeya Urban, Mbeya',
    ARRAY[
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'
    ],
    ARRAY['Security', 'Water Tank', 'Internet'],
    true,
    '2024-01-25',
    '2024-01-25'
  ),
  
  -- Additional Dar es Salaam Properties
  (
    admin_id,
    'Penthouse in Upanga',
    'Luxurious penthouse apartment in Upanga with panoramic city views. Features modern amenities and premium finishes.',
    'apartment',
    3,
    2,
    1800000,
    'Dar es Salaam',
    'Upanga',
    'Upanga West, Ilala, Dar es Salaam',
    ARRAY[
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Elevator', 'Furnished'],
    true,
    '2024-01-20',
    '2024-01-20'
  ),
  (
    admin_id,
    'Affordable 2BR in Temeke',
    'Budget-friendly 2-bedroom house in Temeke. Great for young families starting out.',
    'house',
    2,
    1,
    320000,
    'Dar es Salaam',
    'Temeke',
    'Temeke Municipal, Dar es Salaam',
    ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    ARRAY['Security', 'Water Tank'],
    true,
    '2024-01-22',
    '2024-01-22'
  ),
  
  -- Morogoro Properties
  (
    admin_id,
    'University Town House in Morogoro',
    'Comfortable house near Sokoine University of Agriculture. Perfect for faculty or graduate students.',
    'house',
    3,
    2,
    420000,
    'Morogoro',
    'University Area',
    'Sokoine University Area, Morogoro Urban, Morogoro',
    ARRAY[
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    true,
    '2024-01-28',
    '2024-01-28'
  ),
  
  -- Tanga Properties
  (
    admin_id,
    'Coastal Apartment in Tanga',
    'Beautiful apartment near Tanga Bay with ocean breeze and modern amenities.',
    'apartment',
    2,
    1,
    380000,
    'Tanga',
    'Tanga Bay',
    'Tanga Bay Area, Tanga Urban, Tanga',
    ARRAY[
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    ],
    ARRAY['Security', 'Water Tank', 'Internet', 'Balcony'],
    true,
    '2024-02-01',
    '2024-02-01'
  ),
  
  -- Dodoma Properties
  (
    admin_id,
    'Government Quarter House in Dodoma',
    'Modern house in the capital city, perfect for government employees and civil servants.',
    'house',
    3,
    2,
    650000,
    'Dodoma',
    'Government Quarter',
    'Government Quarter, Dodoma Urban, Dodoma',
    ARRAY[
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet'],
    true,
    '2024-02-05',
    '2024-02-05'
  ),
  
  -- Moshi Properties
  (
    admin_id,
    'Mountain View Villa in Moshi',
    'Stunning villa with views of Mount Kilimanjaro. Perfect for tourists and expatriates.',
    'house',
    4,
    3,
    1100000,
    'Moshi',
    'Kilimanjaro View',
    'Kilimanjaro View Area, Moshi Urban, Moshi',
    ARRAY[
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished'],
    true,
    '2024-02-08',
    '2024-02-08'
  ),
  
  -- Iringa Properties
  (
    admin_id,
    'Highland Retreat in Iringa',
    'Peaceful house in the cool highlands of Iringa. Perfect for those seeking tranquility.',
    'house',
    2,
    1,
    350000,
    'Iringa',
    'Highland',
    'Highland Area, Iringa Urban, Iringa',
    ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    ARRAY['Security', 'Water Tank', 'Garden', 'Internet'],
    true,
    '2024-02-10',
    '2024-02-10'
  ),
  
  -- Mtwara Properties
  (
    admin_id,
    'Coastal Villa in Mtwara',
    'Stunning coastal villa with direct beach access. Features modern amenities and breathtaking ocean views.',
    'house',
    4,
    3,
    1150000,
    'Mtwara',
    'Beach Front',
    'Mtwara Beach Front, Mtwara Urban, Mtwara',
    ARRAY[
      'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg',
      'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg',
      'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'
    ],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    true,
    '2024-02-18',
    '2024-02-18'
  );
  
END $$;

-- Create some sample employee performance data
INSERT INTO employee_performance (
  admin_id,
  month_year,
  properties_managed,
  bookings_received,
  bookings_approved,
  bookings_completed,
  conversion_rate,
  average_response_time_hours,
  tenant_satisfaction_rating,
  revenue_generated,
  occupancy_rate
)
SELECT 
  u.id,
  '2024-01-01'::DATE,
  (SELECT COUNT(*) FROM properties WHERE assigned_admin_id = u.id),
  15,
  12,
  8,
  80.0,
  2.5,
  4.2,
  2400000,
  75.0
FROM users u 
WHERE u.email = 'john.mwalimu@nyumbalink.com'
ON CONFLICT (admin_id, month_year) DO NOTHING;

-- Update property view counts with some realistic data
UPDATE properties SET 
  views_count = FLOOR(RANDOM() * 50) + 10,
  inquiries_count = FLOOR(RANDOM() * 15) + 2
WHERE assigned_admin_id IN (
  SELECT id FROM users WHERE email = 'john.mwalimu@nyumbalink.com'
);

-- Add some sample notifications
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  data,
  created_at
)
SELECT 
  u.id,
  'system_announcement',
  'Welcome to NyumbaLink',
  'Your property admin account has been activated. You can now start managing properties.',
  '{"action": "account_activated"}',
  NOW() - INTERVAL '1 day'
FROM users u 
WHERE u.email = 'john.mwalimu@nyumbalink.com'
ON CONFLICT DO NOTHING;