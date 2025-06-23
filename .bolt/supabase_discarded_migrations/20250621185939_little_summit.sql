/*
  # Insert Sample Properties Data
  
  This migration inserts sample property data into the database.
  Since we can't create fake auth users, we'll create properties
  that can be associated with real users when they sign up.
  
  1. Insert sample properties with a placeholder owner system
  2. Create a function to assign properties to real users
  3. Add sample property data for testing
*/

-- First, let's create a temporary table for sample landlords
-- We'll use this to generate consistent owner IDs
CREATE TEMPORARY TABLE temp_landlords AS
SELECT 
  gen_random_uuid() as id,
  name,
  email,
  phone
FROM (VALUES 
  ('Grace Kimonge', 'grace.kimonge@gmail.com', '+255722345678'),
  ('John Mwamba', 'john.mwamba@gmail.com', '+255712345678'),
  ('Mary Shayo', 'mary.shayo@gmail.com', '+255732345678'),
  ('David Mwakibolwa', 'david.mwakibolwa@gmail.com', '+255742345678'),
  ('Sarah Kimaro', 'sarah.kimaro@gmail.com', '+255752345678')
) AS landlords(name, email, phone);

-- Insert sample properties using the temporary landlord IDs
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
  is_available,
  views_count,
  inquiries_count,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_landlords ORDER BY random() LIMIT 1),
  title,
  description,
  property_type::property_type,
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
  is_available,
  views_count,
  inquiries_count,
  created_at::timestamptz,
  updated_at::timestamptz
FROM (VALUES 
  -- Premium Properties in Dar es Salaam
  (
    'Modern 3BR House in Masaki',
    'Beautiful modern house in the prestigious Masaki area with sea views. Perfect for professionals and families. Fully furnished with modern amenities.',
    'house',
    3,
    2,
    1200000,
    'Dar es Salaam',
    'Kinondoni',
    'Masaki Peninsula',
    '+255722345678',
    ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Furnished'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power'],
    ARRAY['Hospital', 'Supermarket', 'Bank', 'Restaurant', 'Beach'],
    true,
    45,
    8,
    '2024-01-15',
    '2024-01-15'
  ),
  (
    'Luxury Villa in Oyster Bay',
    'Stunning luxury villa with ocean views in Oyster Bay. Features spacious rooms, private garden, and top-notch security.',
    'house',
    4,
    3,
    2500000,
    'Dar es Salaam',
    'Kinondoni',
    'Oyster Bay Road',
    '+255712345678',
    ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power', 'Backup Generator'],
    ARRAY['Hospital', 'Clinic', 'Supermarket', 'Bank', 'Restaurant', 'Beach', 'ATM'],
    true,
    67,
    12,
    '2024-01-10',
    '2024-01-10'
  ),
  (
    'Cozy Apartment in Mikocheni',
    'Well-maintained 2-bedroom apartment in Mikocheni. Close to shopping centers and public transport.',
    'apartment',
    2,
    1,
    550000,
    'Dar es Salaam',
    'Kinondoni',
    'Mikocheni Light Industrial Area',
    '+255732345678',
    ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
    ARRAY['Parking', 'Security', 'Water Tank', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['Market', 'Supermarket', 'Bus Stop', 'Pharmacy'],
    true,
    23,
    5,
    '2024-01-12',
    '2024-01-12'
  ),
  
  -- Regional Properties - Mwanza
  (
    'Executive House in Mwanza City',
    'Executive 4-bedroom house near Lake Victoria. Perfect for business executives with family.',
    'house',
    4,
    3,
    800000,
    'Mwanza',
    'Ilemela',
    'Ilemela District',
    '+255742345678',
    ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Backup Generator'],
    ARRAY['Hospital', 'Primary School', 'Market', 'Bank', 'Lake Victoria'],
    true,
    34,
    7,
    '2024-01-08',
    '2024-01-08'
  ),
  
  -- Tourism Properties - Arusha
  (
    'Safari Lodge Style House in Arusha',
    'Unique safari lodge style house in Arusha, perfect for tourists and expatriates. Close to Mount Meru.',
    'house',
    3,
    2,
    950000,
    'Arusha',
    'Arusha Urban',
    'Arusha Central',
    '+255752345678',
    ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power'],
    ARRAY['Hospital', 'University', 'Market', 'Bank', 'Restaurant', 'Mount Meru'],
    true,
    28,
    6,
    '2024-01-05',
    '2024-01-05'
  ),
  
  -- Budget Properties - Mbeya
  (
    'Modern Studio in Mbeya',
    'Compact modern studio apartment perfect for students and young professionals in Mbeya.',
    'apartment',
    1,
    1,
    280000,
    'Mbeya',
    'Mbeya Urban',
    'Mbeya Urban',
    '+255722345678',
    ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
    ARRAY['Security', 'Water Tank', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['University', 'Market', 'Bus Stop', 'Clinic'],
    true,
    15,
    3,
    '2024-01-03',
    '2024-01-03'
  ),
  (
    'Family House in Mbeya Highlands',
    'Spacious 3-bedroom house in the cool highlands of Mbeya. Perfect for families with children. Features a large garden and mountain views.',
    'house',
    3,
    2,
    450000,
    'Mbeya',
    'Mbeya Rural',
    'Mbeya Highlands',
    '+255712345678',
    ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['Primary School', 'Secondary School', 'Market', 'Clinic', 'Mountains'],
    true,
    19,
    4,
    '2024-01-18',
    '2024-01-18'
  ),
  (
    'Student Hostel in Mbeya University Area',
    'Affordable accommodation near Mbeya University of Science and Technology. Perfect for students with shared facilities.',
    'room',
    1,
    1,
    180000,
    'Mbeya',
    'Mbeya Urban',
    'University Area',
    '+255732345678',
    ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
    ARRAY['Security', 'Water Tank', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['University', 'Market', 'Bus Stop', 'Pharmacy', 'Library'],
    true,
    12,
    2,
    '2024-01-25',
    '2024-01-25'
  ),
  
  -- Additional Properties for Better Coverage
  (
    'Modern Apartment in Morogoro',
    'Beautiful 2-bedroom apartment in Morogoro town center. Close to university and shopping areas.',
    'apartment',
    2,
    1,
    380000,
    'Morogoro',
    'Morogoro Urban',
    'Morogoro Town Center',
    '+255742345678',
    ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    ARRAY['Parking', 'Security', 'Water Tank', 'Internet', 'Balcony'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['University', 'Market', 'Supermarket', 'Bank', 'Hospital'],
    true,
    21,
    4,
    '2024-01-20',
    '2024-01-20'
  ),
  (
    'Coastal Villa in Mtwara',
    'Stunning coastal villa with direct beach access. Features modern amenities and breathtaking ocean views.',
    'house',
    4,
    3,
    1150000,
    'Mtwara',
    'Mtwara Urban',
    'Mtwara Beach Front',
    '+255752345678',
    ARRAY['https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power', 'Backup Generator'],
    ARRAY['Hospital', 'Market', 'Restaurant', 'Beach', 'Port'],
    true,
    38,
    9,
    '2024-02-18',
    '2024-02-18'
  ),
  (
    'Business Apartment in Tanga',
    'Professional 3-bedroom apartment in Tanga city center. Perfect for business travelers and professionals.',
    'apartment',
    3,
    2,
    620000,
    'Tanga',
    'Tanga Urban',
    'Tanga City Center',
    '+255722345678',
    ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Furnished'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Backup Generator'],
    ARRAY['Hospital', 'Bank', 'Market', 'Restaurant', 'Port'],
    true,
    26,
    5,
    '2024-02-01',
    '2024-02-01'
  ),
  (
    'Government House in Dodoma',
    'Spacious 4-bedroom house in Dodoma, perfect for government officials and their families.',
    'house',
    4,
    3,
    750000,
    'Dodoma',
    'Dodoma Urban',
    'Dodoma Government Area',
    '+255712345678',
    ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
    ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power'],
    ARRAY['Hospital', 'Primary School', 'Secondary School', 'Market', 'Government Offices'],
    true,
    31,
    6,
    '2024-02-05',
    '2024-02-05'
  ),
  (
    'Mountain View House in Moshi',
    'Beautiful house with Kilimanjaro mountain views. Perfect for nature lovers and tourists.',
    'house',
    3,
    2,
    680000,
    'Moshi',
    'Moshi Urban',
    'Moshi Town',
    '+255732345678',
    ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet', 'Mountain View'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['Hospital', 'Market', 'Restaurant', 'Kilimanjaro National Park', 'Coffee Farms'],
    true,
    29,
    7,
    '2024-02-10',
    '2024-02-10'
  ),
  (
    'Cool Climate House in Iringa',
    'Comfortable house in Iringa with cool highland climate. Great for families seeking cooler weather.',
    'house',
    3,
    2,
    520000,
    'Iringa',
    'Iringa Urban',
    'Iringa Town',
    '+255742345678',
    ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
    ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
    ARRAY['Hospital', 'University', 'Market', 'Bank', 'Cool Climate'],
    true,
    18,
    3,
    '2024-02-12',
    '2024-02-12'
  )
) AS property_data(
  title, description, property_type, bedrooms, bathrooms, price_monthly,
  city, area, address, phone_contact, images, amenities, utilities, 
  nearby_services, is_available, views_count, inquiries_count, created_at, updated_at
);

-- Create a function to assign properties to real landlords when they sign up
CREATE OR REPLACE FUNCTION assign_property_to_landlord(landlord_id uuid, property_count integer DEFAULT 1)
RETURNS void AS $$
BEGIN
  -- Update unassigned properties to be owned by the new landlord
  UPDATE properties 
  SET owner_id = landlord_id
  WHERE owner_id NOT IN (SELECT id FROM profiles WHERE user_role = 'landlord')
  AND id IN (
    SELECT id FROM properties 
    WHERE owner_id NOT IN (SELECT id FROM profiles WHERE user_role = 'landlord')
    ORDER BY random() 
    LIMIT property_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the data was inserted
DO $$
DECLARE
  property_count integer;
  city_count integer;
BEGIN
  SELECT COUNT(*) INTO property_count FROM properties;
  SELECT COUNT(DISTINCT city) INTO city_count FROM properties;
  
  RAISE NOTICE 'Properties inserted: %', property_count;
  RAISE NOTICE 'Cities covered: %', city_count;
  RAISE NOTICE 'Sample properties are ready!';
  RAISE NOTICE 'Properties will be automatically assigned to landlords when they register.';
END $$;