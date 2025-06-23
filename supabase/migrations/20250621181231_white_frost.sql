-- Migration: Fix Authentication Setup and RLS Policies
-- This migration sets up proper authentication triggers and RLS policies

-- First, let's make sure we have the proper extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;

-- Drop existing trigger to recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone_number,
    user_role,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE(new.raw_user_meta_data->>'user_role', 'tenant')::user_role,
    false,
    now(),
    now()
  );
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation during signup (this is crucial)
-- This policy allows the trigger to create profiles
CREATE POLICY "Enable profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Update properties policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing property policies
DROP POLICY IF EXISTS "Anyone can read available properties" ON properties;
DROP POLICY IF EXISTS "Landlords can delete own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can insert properties" ON properties;
DROP POLICY IF EXISTS "Landlords can read own properties" ON properties;
DROP POLICY IF EXISTS "Landlords can update own properties" ON properties;

-- Recreate property policies
CREATE POLICY "Anyone can read available properties" ON properties
  FOR SELECT USING (is_available = true);

CREATE POLICY "Landlords can read own properties" ON properties
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Landlords can insert properties" ON properties
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Landlords can update own properties" ON properties
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Landlords can delete own properties" ON properties
  FOR DELETE USING (owner_id = auth.uid());

-- Update property inquiries policies
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing inquiry policies
DROP POLICY IF EXISTS "Landlords can read inquiries for their properties" ON property_inquiries;
DROP POLICY IF EXISTS "Landlords can update inquiry status" ON property_inquiries;
DROP POLICY IF EXISTS "Tenants can insert inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Tenants can read own inquiries" ON property_inquiries;

-- Recreate inquiry policies
CREATE POLICY "Tenants can insert inquiries" ON property_inquiries
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can read own inquiries" ON property_inquiries
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can read inquiries for their properties" ON property_inquiries
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update inquiry status" ON property_inquiries
  FOR UPDATE USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

-- Create function to increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE properties 
  SET views_count = views_count + 1 
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Verify the setup by checking if our functions exist
DO $$
BEGIN
  -- Check if the trigger function exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    RAISE NOTICE 'handle_new_user function created successfully';
  END IF;
  
  -- Check if the trigger exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    RAISE NOTICE 'on_auth_user_created trigger created successfully';
  END IF;
  
  RAISE NOTICE 'Migration completed successfully';
END $$;