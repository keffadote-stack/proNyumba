/*
  # Remove Database Tables - Keep Authentication Only
  
  This migration removes all custom database tables while preserving
  the Supabase authentication system (auth.users table).
  
  1. Drop all views
  2. Drop all custom tables
  3. Drop all custom functions
  4. Drop all custom types
  5. Keep auth system intact
*/

-- Drop all views first (they depend on tables)
DROP VIEW IF EXISTS all_properties_view CASCADE;
DROP VIEW IF EXISTS property_summary CASCADE;
DROP VIEW IF EXISTS rukia_properties CASCADE;

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON property_inquiries;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS increment_property_views(uuid) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_property_image_url(text) CASCADE;
DROP FUNCTION IF EXISTS upload_property_image(uuid, bytea, text, text) CASCADE;

-- Drop all tables (in correct order to handle foreign key dependencies)
DROP TABLE IF EXISTS property_inquiries CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS inquiry_status CASCADE;

-- Drop storage policies for property images
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'property-images';

-- Clean up any remaining sequences
DROP SEQUENCE IF EXISTS profiles_id_seq CASCADE;
DROP SEQUENCE IF EXISTS properties_id_seq CASCADE;
DROP SEQUENCE IF EXISTS property_inquiries_id_seq CASCADE;

-- Verification
DO $$
DECLARE
    table_count integer;
    function_count integer;
    type_count integer;
    view_count integer;
BEGIN
    -- Count remaining custom tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%';
    
    -- Count remaining custom functions
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_name NOT LIKE 'pg_%';
    
    -- Count remaining custom types
    SELECT COUNT(*) INTO type_count 
    FROM pg_type 
    WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND typname NOT LIKE 'pg_%'
    AND typname NOT LIKE '_%'; -- Exclude array types
    
    -- Count remaining views
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_schema = 'public';
    
    RAISE NOTICE '=== DATABASE CLEANUP COMPLETED ===';
    RAISE NOTICE 'Remaining custom tables: %', table_count;
    RAISE NOTICE 'Remaining custom functions: %', function_count;
    RAISE NOTICE 'Remaining custom types: %', type_count;
    RAISE NOTICE 'Remaining custom views: %', view_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Authentication system preserved:';
    RAISE NOTICE '- auth.users table: INTACT';
    RAISE NOTICE '- auth.sessions table: INTACT';
    RAISE NOTICE '- auth.refresh_tokens table: INTACT';
    RAISE NOTICE '- All auth functions: INTACT';
    RAISE NOTICE '';
    
    IF table_count = 0 AND function_count = 0 AND view_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All custom database objects removed!';
        RAISE NOTICE 'Only Supabase authentication system remains.';
    ELSE
        RAISE NOTICE 'WARNING: Some custom objects may still exist.';
    END IF;
END $$;