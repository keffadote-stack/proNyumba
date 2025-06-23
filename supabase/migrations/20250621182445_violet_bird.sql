/*
  # Fix Authentication Setup and RLS Policies
  
  This migration sets up proper authentication triggers and RLS policies
  while avoiding conflicts with existing policies.
  
  1. Database Setup
    - Ensure proper extensions are enabled
    - Clean up existing policies and functions
    
  2. Authentication Functions
    - Create handle_new_user function for profile creation
    - Set up trigger for automatic profile creation
    
  3. Row Level Security
    - Enable RLS on all tables
    - Create comprehensive policies for all user roles
    
  4. Permissions
    - Grant necessary permissions to anon and authenticated users
*/

-- First, let's make sure we have the proper extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop ALL existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on profiles table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
    
    -- Drop all policies on properties table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'properties' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON properties';
    END LOOP;
    
    -- Drop all policies on property_inquiries table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'property_inquiries' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON property_inquiries';
    END LOOP;
END $$;

-- Drop existing trigger and function to recreate them
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for properties table
CREATE POLICY "properties_select_available" ON properties
  FOR SELECT USING (is_available = true);

CREATE POLICY "properties_select_own" ON properties
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "properties_insert_own" ON properties
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "properties_update_own" ON properties
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "properties_delete_own" ON properties
  FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for property_inquiries table
CREATE POLICY "inquiries_insert_tenant" ON property_inquiries
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "inquiries_select_tenant" ON property_inquiries
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "inquiries_select_landlord" ON property_inquiries
  FOR SELECT USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "inquiries_update_landlord" ON property_inquiries
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
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at') THEN
    CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inquiries_updated_at') THEN
    CREATE TRIGGER update_inquiries_updated_at
      BEFORE UPDATE ON property_inquiries
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_city') THEN
    CREATE INDEX idx_properties_city ON properties(city);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_price') THEN
    CREATE INDEX idx_properties_price ON properties(price_monthly);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_type') THEN
    CREATE INDEX idx_properties_type ON properties(property_type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_available') THEN
    CREATE INDEX idx_properties_available ON properties(is_available);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_owner') THEN
    CREATE INDEX idx_properties_owner ON properties(owner_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inquiries_property') THEN
    CREATE INDEX idx_inquiries_property ON property_inquiries(property_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inquiries_tenant') THEN
    CREATE INDEX idx_inquiries_tenant ON property_inquiries(tenant_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inquiries_status') THEN
    CREATE INDEX idx_inquiries_status ON property_inquiries(status);
  END IF;
END $$;

-- Verify the setup
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
  
  -- Check policies count
  RAISE NOTICE 'Total policies created: %', (
    SELECT COUNT(*) FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'properties', 'property_inquiries')
  );
  
  RAISE NOTICE 'Migration completed successfully';
END $$;