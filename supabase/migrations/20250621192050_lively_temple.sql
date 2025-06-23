/*
  # Setup Rukia Mray Profile and Supabase Storage
  
  1. Create Rukia Mray as a verified landlord
  2. Setup storage bucket for property images
  3. Update properties to belong to Rukia Mray
  4. Add storage policies for image management
*/

-- First, let's create a storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for property images
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create Rukia Mray's auth user first (this would normally be done through signup)
-- We'll create a placeholder that can be claimed later
DO $$
DECLARE
    rukia_user_id uuid := gen_random_uuid();
    rukia_email text := 'rukia.mray@nyumbatz.com';
    property_count integer;
BEGIN
    -- Check if Rukia already exists
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = rukia_email) THEN
        -- Insert into auth.users (this is a simplified version - in production this would be done via Supabase Auth)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            rukia_user_id,
            '00000000-0000-0000-0000-000000000000',
            rukia_email,
            crypt('NyumbaTZ2024!', gen_salt('bf')), -- Default password
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Rukia Mray", "phone_number": "+255712000000", "user_role": "landlord"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;

        -- Create Rukia's profile
        INSERT INTO profiles (
            id,
            full_name,
            email,
            phone_number,
            user_role,
            is_verified,
            created_at,
            updated_at
        ) VALUES (
            rukia_user_id,
            'Rukia Mray',
            rukia_email,
            '+255712000000',
            'landlord',
            true,
            now(),
            now()
        ) ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Created Rukia Mray profile with ID: %', rukia_user_id;
    ELSE
        -- Get existing Rukia's ID
        SELECT id INTO rukia_user_id FROM profiles WHERE email = rukia_email;
        RAISE NOTICE 'Using existing Rukia Mray profile with ID: %', rukia_user_id;
    END IF;

    -- Update all properties to belong to Rukia Mray
    UPDATE properties 
    SET 
        owner_id = rukia_user_id,
        phone_contact = '+255712000000',
        updated_at = now()
    WHERE owner_id IS NULL OR owner_id != rukia_user_id;

    -- Get count of properties assigned to Rukia
    SELECT COUNT(*) INTO property_count FROM properties WHERE owner_id = rukia_user_id;
    
    RAISE NOTICE 'Assigned % properties to Rukia Mray', property_count;
END $$;

-- Create a function to generate Supabase storage URLs for images
CREATE OR REPLACE FUNCTION get_property_image_url(image_path text)
RETURNS text AS $$
BEGIN
    IF image_path IS NULL OR image_path = '' THEN
        RETURN 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';
    END IF;
    
    -- If it's already a full URL, return as is
    IF image_path LIKE 'http%' THEN
        RETURN image_path;
    END IF;
    
    -- If it's a storage path, construct the full URL
    RETURN format('https://%s.supabase.co/storage/v1/object/public/property-images/%s', 
                  current_setting('app.settings.project_ref', true), 
                  image_path);
END;
$$ LANGUAGE plpgsql;

-- Update the all_properties_view to include proper image URLs
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
    pr.full_name as owner_name,
    pr.email as owner_email,
    pr.phone_number as owner_phone,
    pr.user_role as owner_role
FROM properties p
LEFT JOIN profiles pr ON p.owner_id = pr.id;

-- Create a view specifically for Rukia's properties
CREATE OR REPLACE VIEW rukia_properties AS
SELECT 
    p.*,
    pr.full_name as owner_name,
    pr.email as owner_email,
    pr.phone_number as owner_phone
FROM properties p
JOIN profiles pr ON p.owner_id = pr.id
WHERE pr.email = 'rukia.mray@nyumbatz.com';

-- Grant access to the views
GRANT SELECT ON all_properties_view TO authenticated, anon;
GRANT SELECT ON rukia_properties TO authenticated, anon;

-- Create a function to upload property images (to be used by the frontend)
CREATE OR REPLACE FUNCTION upload_property_image(
    property_id uuid,
    image_data bytea,
    image_name text,
    content_type text
)
RETURNS text AS $$
DECLARE
    user_id uuid;
    file_path text;
    property_owner uuid;
BEGIN
    -- Get current user
    user_id := auth.uid();
    
    -- Check if user owns the property
    SELECT owner_id INTO property_owner FROM properties WHERE id = property_id;
    
    IF property_owner != user_id THEN
        RAISE EXCEPTION 'You can only upload images for your own properties';
    END IF;
    
    -- Generate file path
    file_path := format('%s/%s/%s', user_id, property_id, image_name);
    
    -- This would be handled by the frontend using Supabase Storage client
    -- Return the path that would be used
    RETURN file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Final verification
DO $$
DECLARE
    rukia_id uuid;
    rukia_properties_count integer;
    total_properties integer;
BEGIN
    -- Get Rukia's ID
    SELECT id INTO rukia_id FROM profiles WHERE email = 'rukia.mray@nyumbatz.com';
    
    -- Count her properties
    SELECT COUNT(*) INTO rukia_properties_count FROM properties WHERE owner_id = rukia_id;
    SELECT COUNT(*) INTO total_properties FROM properties;
    
    RAISE NOTICE '=== RUKIA MRAY SETUP COMPLETED ===';
    RAISE NOTICE 'Rukia Mray User ID: %', rukia_id;
    RAISE NOTICE 'Properties owned by Rukia: %', rukia_properties_count;
    RAISE NOTICE 'Total properties in database: %', total_properties;
    RAISE NOTICE 'Storage bucket "property-images" created';
    RAISE NOTICE 'Storage policies configured for image management';
    RAISE NOTICE 'Views created: all_properties_view, rukia_properties';
    
    IF rukia_properties_count = total_properties THEN
        RAISE NOTICE 'SUCCESS: All properties assigned to Rukia Mray!';
    ELSE
        RAISE NOTICE 'WARNING: Not all properties assigned to Rukia Mray';
    END IF;
END $$;