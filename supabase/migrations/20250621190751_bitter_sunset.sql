/*
  # Add Sample Properties Data
  
  This migration adds comprehensive sample property data to the database.
  It handles the foreign key constraints properly by working with existing profiles.
  
  1. Check existing data
  2. Add properties with proper owner references
  3. Create helpful views for data access
  4. Verify the data insertion
*/

-- First, let's check what we have in the database
DO $$
DECLARE
    property_count integer;
    profile_count integer;
    landlord_count integer;
BEGIN
    SELECT COUNT(*) INTO property_count FROM properties;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO landlord_count FROM profiles WHERE user_role = 'landlord';
    
    RAISE NOTICE 'Current properties in database: %', property_count;
    RAISE NOTICE 'Current profiles in database: %', profile_count;
    RAISE NOTICE 'Current landlord profiles: %', landlord_count;
END $$;

-- Create a temporary function to get or create a default owner
CREATE OR REPLACE FUNCTION get_default_owner_id()
RETURNS uuid AS $$
DECLARE
    owner_id uuid;
BEGIN
    -- Try to get an existing landlord profile
    SELECT id INTO owner_id 
    FROM profiles 
    WHERE user_role = 'landlord' 
    LIMIT 1;
    
    -- If no landlord, get any profile
    IF owner_id IS NULL THEN
        SELECT id INTO owner_id 
        FROM profiles 
        LIMIT 1;
    END IF;
    
    -- If still no profile, we'll need to handle this differently
    -- For now, we'll return NULL and handle it in the calling code
    RETURN owner_id;
END;
$$ LANGUAGE plpgsql;

-- Get the default owner ID to use
DO $$
DECLARE
    default_owner_id uuid;
    property_count_before integer;
    property_count_after integer;
BEGIN
    -- Get the default owner
    default_owner_id := get_default_owner_id();
    
    IF default_owner_id IS NULL THEN
        RAISE NOTICE 'No existing profiles found. Properties will be created without owner initially.';
        -- We'll create properties with a placeholder and fix them later
        default_owner_id := gen_random_uuid();
    ELSE
        RAISE NOTICE 'Using existing profile as owner: %', default_owner_id;
    END IF;
    
    -- Count properties before insertion
    SELECT COUNT(*) INTO property_count_before FROM properties;
    
    -- Insert sample properties only if we don't have many already
    IF property_count_before < 10 THEN
        -- Insert all the sample properties
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
        ) VALUES 
            -- Premium Properties in Dar es Salaam
            (
                gen_random_uuid(),
                default_owner_id,
                'Modern 3BR House in Masaki',
                'Beautiful modern house in the prestigious Masaki area with sea views. Perfect for professionals and families. Fully furnished with modern amenities.',
                'house',
                3,
                2,
                1200000,
                'Dar es Salaam',
                'Kinondoni',
                'Masaki Peninsula',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Furnished'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power'],
                ARRAY['Hospital', 'Supermarket', 'Bank', 'Restaurant', 'Beach'],
                true,
                45,
                8,
                '2024-01-15'::timestamptz,
                '2024-01-15'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Luxury Villa in Oyster Bay',
                'Stunning luxury villa with ocean views in Oyster Bay. Features spacious rooms, private garden, and top-notch security.',
                'house',
                4,
                3,
                2500000,
                'Dar es Salaam',
                'Kinondoni',
                'Oyster Bay Road',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power', 'Backup Generator'],
                ARRAY['Hospital', 'Clinic', 'Supermarket', 'Bank', 'Restaurant', 'Beach', 'ATM'],
                true,
                67,
                12,
                '2024-01-10'::timestamptz,
                '2024-01-10'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Cozy Apartment in Mikocheni',
                'Well-maintained 2-bedroom apartment in Mikocheni. Close to shopping centers and public transport.',
                'apartment',
                2,
                1,
                550000,
                'Dar es Salaam',
                'Kinondoni',
                'Mikocheni Light Industrial Area',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
                ARRAY['Parking', 'Security', 'Water Tank', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['Market', 'Supermarket', 'Bus Stop', 'Pharmacy'],
                true,
                23,
                5,
                '2024-01-12'::timestamptz,
                '2024-01-12'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Executive House in Mwanza City',
                'Executive 4-bedroom house near Lake Victoria. Perfect for business executives with family.',
                'house',
                4,
                3,
                800000,
                'Mwanza',
                'Ilemela',
                'Ilemela District',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Backup Generator'],
                ARRAY['Hospital', 'Primary School', 'Market', 'Bank', 'Lake Victoria'],
                true,
                34,
                7,
                '2024-01-08'::timestamptz,
                '2024-01-08'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Safari Lodge Style House in Arusha',
                'Unique safari lodge style house in Arusha, perfect for tourists and expatriates. Close to Mount Meru.',
                'house',
                3,
                2,
                950000,
                'Arusha',
                'Arusha Urban',
                'Arusha Central',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Air Conditioning', 'Internet', 'Furnished'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power'],
                ARRAY['Hospital', 'University', 'Market', 'Bank', 'Restaurant', 'Mount Meru'],
                true,
                28,
                6,
                '2024-01-05'::timestamptz,
                '2024-01-05'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Modern Studio in Mbeya',
                'Compact modern studio apartment perfect for students and young professionals in Mbeya.',
                'apartment',
                1,
                1,
                280000,
                'Mbeya',
                'Mbeya Urban',
                'Mbeya Urban',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
                ARRAY['Security', 'Water Tank', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['University', 'Market', 'Bus Stop', 'Clinic'],
                true,
                15,
                3,
                '2024-01-03'::timestamptz,
                '2024-01-03'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Family House in Mbeya Highlands',
                'Spacious 3-bedroom house in the cool highlands of Mbeya. Perfect for families with children. Features a large garden and mountain views.',
                'house',
                3,
                2,
                450000,
                'Mbeya',
                'Mbeya Rural',
                'Mbeya Highlands',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
                ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['Primary School', 'Secondary School', 'Market', 'Clinic', 'Mountains'],
                true,
                19,
                4,
                '2024-01-18'::timestamptz,
                '2024-01-18'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Student Hostel in Mbeya University Area',
                'Affordable accommodation near Mbeya University of Science and Technology. Perfect for students with shared facilities.',
                'room',
                1,
                1,
                180000,
                'Mbeya',
                'Mbeya Urban',
                'University Area',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
                ARRAY['Security', 'Water Tank', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['University', 'Market', 'Bus Stop', 'Pharmacy', 'Library'],
                true,
                12,
                2,
                '2024-01-25'::timestamptz,
                '2024-01-25'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Modern Apartment in Morogoro',
                'Beautiful 2-bedroom apartment in Morogoro town center. Close to university and shopping areas.',
                'apartment',
                2,
                1,
                380000,
                'Morogoro',
                'Morogoro Urban',
                'Morogoro Town Center',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
                ARRAY['Parking', 'Security', 'Water Tank', 'Internet', 'Balcony'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['University', 'Market', 'Supermarket', 'Bank', 'Hospital'],
                true,
                21,
                4,
                '2024-01-20'::timestamptz,
                '2024-01-20'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Coastal Villa in Mtwara',
                'Stunning coastal villa with direct beach access. Features modern amenities and breathtaking ocean views.',
                'house',
                4,
                3,
                1150000,
                'Mtwara',
                'Mtwara Urban',
                'Mtwara Beach Front',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg', 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Swimming Pool', 'Air Conditioning', 'Internet', 'Furnished'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power', 'Backup Generator'],
                ARRAY['Hospital', 'Market', 'Restaurant', 'Beach', 'Port'],
                true,
                38,
                9,
                '2024-02-18'::timestamptz,
                '2024-02-18'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Business Apartment in Tanga',
                'Professional 3-bedroom apartment in Tanga city center. Perfect for business travelers and professionals.',
                'apartment',
                3,
                2,
                620000,
                'Tanga',
                'Tanga Urban',
                'Tanga City Center',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Air Conditioning', 'Internet', 'Furnished'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Backup Generator'],
                ARRAY['Hospital', 'Bank', 'Market', 'Restaurant', 'Port'],
                true,
                26,
                5,
                '2024-02-01'::timestamptz,
                '2024-02-01'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Government House in Dodoma',
                'Spacious 4-bedroom house in Dodoma, perfect for government officials and their families.',
                'house',
                4,
                3,
                750000,
                'Dodoma',
                'Dodoma Urban',
                'Dodoma Government Area',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'],
                ARRAY['Parking', 'Security', 'Generator', 'Water Tank', 'Garden', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 'Solar Power'],
                ARRAY['Hospital', 'Primary School', 'Secondary School', 'Market', 'Government Offices'],
                true,
                31,
                6,
                '2024-02-05'::timestamptz,
                '2024-02-05'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Mountain View House in Moshi',
                'Beautiful house with Kilimanjaro mountain views. Perfect for nature lovers and tourists.',
                'house',
                3,
                2,
                680000,
                'Moshi',
                'Moshi Urban',
                'Moshi Town',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
                ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet', 'Mountain View'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['Hospital', 'Market', 'Restaurant', 'Kilimanjaro National Park', 'Coffee Farms'],
                true,
                29,
                7,
                '2024-02-10'::timestamptz,
                '2024-02-10'::timestamptz
            ),
            (
                gen_random_uuid(),
                default_owner_id,
                'Cool Climate House in Iringa',
                'Comfortable house in Iringa with cool highland climate. Great for families seeking cooler weather.',
                'house',
                3,
                2,
                520000,
                'Iringa',
                'Iringa Urban',
                'Iringa Town',
                '+255712000000',
                ARRAY['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
                ARRAY['Parking', 'Security', 'Water Tank', 'Garden', 'Internet'],
                ARRAY['Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready'],
                ARRAY['Hospital', 'University', 'Market', 'Bank', 'Cool Climate'],
                true,
                18,
                3,
                '2024-02-12'::timestamptz,
                '2024-02-12'::timestamptz
            )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Sample properties inserted successfully';
    ELSE
        RAISE NOTICE 'Properties already exist (%), skipping insertion', property_count_before;
    END IF;
    
    -- Count properties after insertion
    SELECT COUNT(*) INTO property_count_after FROM properties;
    RAISE NOTICE 'Properties added: %', (property_count_after - property_count_before);
END $$;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS get_default_owner_id();

-- Create a view to easily see all properties with their details
CREATE OR REPLACE VIEW all_properties_view AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.property_type,
    p.bedrooms,
    p.bathrooms,
    p.price_monthly,
    p.city,
    p.area,
    p.address,
    p.phone_contact,
    p.amenities,
    p.utilities,
    p.nearby_services,
    p.is_available,
    p.views_count,
    p.inquiries_count,
    p.created_at,
    p.updated_at,
    COALESCE(pr.full_name, 'Property Owner') as owner_name,
    COALESCE(pr.email, 'owner@nyumbatz.com') as owner_email,
    COALESCE(pr.phone_number, p.phone_contact) as owner_phone,
    pr.user_role as owner_role
FROM properties p
LEFT JOIN profiles pr ON p.owner_id = pr.id;

-- Grant access to the view
GRANT SELECT ON all_properties_view TO authenticated, anon;

-- Create a summary view for quick statistics
CREATE OR REPLACE VIEW property_summary AS
SELECT 
    COUNT(*) as total_properties,
    COUNT(DISTINCT city) as cities_covered,
    COUNT(DISTINCT owner_id) as unique_owners,
    AVG(price_monthly)::integer as average_price,
    MIN(price_monthly) as min_price,
    MAX(price_monthly) as max_price,
    COUNT(*) FILTER (WHERE is_available = true) as available_properties,
    COUNT(*) FILTER (WHERE property_type = 'house') as houses,
    COUNT(*) FILTER (WHERE property_type = 'apartment') as apartments,
    COUNT(*) FILTER (WHERE property_type = 'room') as rooms
FROM properties;

-- Grant access to the summary view
GRANT SELECT ON property_summary TO authenticated, anon;

-- Final verification and summary
DO $$
DECLARE
    total_properties integer;
    unique_owners integer;
    cities_count integer;
    avg_price numeric;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO total_properties FROM properties;
    SELECT COUNT(DISTINCT owner_id) INTO unique_owners FROM properties;
    SELECT COUNT(DISTINCT city) INTO cities_count FROM properties;
    SELECT AVG(price_monthly) INTO avg_price FROM properties;
    
    RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Total properties in database: %', total_properties;
    RAISE NOTICE 'Unique property owners: %', unique_owners;
    RAISE NOTICE 'Cities covered: %', cities_count;
    RAISE NOTICE 'Average property price: TSh %', avg_price::integer;
    RAISE NOTICE '';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '- all_properties_view: Complete property details with owner info';
    RAISE NOTICE '- property_summary: Quick statistics and summary';
    RAISE NOTICE '';
    RAISE NOTICE 'Cities with properties:';
    
    -- List all cities with property counts
    FOR rec IN (
        SELECT city, COUNT(*) as property_count 
        FROM properties 
        GROUP BY city 
        ORDER BY property_count DESC, city
    )
    LOOP
        RAISE NOTICE '- %: % properties', rec.city, rec.property_count;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Property types:';
    FOR rec IN (
        SELECT property_type, COUNT(*) as type_count 
        FROM properties 
        GROUP BY property_type 
        ORDER BY type_count DESC
    )
    LOOP
        RAISE NOTICE '- %: % properties', rec.property_type, rec.type_count;
    END LOOP;
END $$;