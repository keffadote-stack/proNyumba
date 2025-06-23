/*
  # Initial Database Schema for NyumbaTZ MVP

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `properties` - Property listings with comprehensive details
    - `property_inquiries` - Contact inquiries from tenants

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user roles

  3. Functions
    - Auto-create profile on user signup
    - Increment property views counter
    - Update timestamps automatically
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('tenant', 'landlord');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'room');
CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'viewed');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  user_role user_role NOT NULL DEFAULT 'tenant',
  avatar_url text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  property_type property_type NOT NULL,
  bedrooms integer NOT NULL CHECK (bedrooms > 0),
  bathrooms integer NOT NULL CHECK (bathrooms > 0),
  price_monthly integer NOT NULL CHECK (price_monthly > 0),
  city text NOT NULL,
  area text NOT NULL,
  address text,
  phone_contact text NOT NULL,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  utilities text[] DEFAULT '{}',
  nearby_services text[] DEFAULT '{}',
  is_available boolean DEFAULT true,
  views_count integer DEFAULT 0,
  inquiries_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Property inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_name text NOT NULL,
  tenant_phone text NOT NULL,
  message text NOT NULL,
  status inquiry_status DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can read available properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Landlords can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Landlords can insert properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Landlords can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Landlords can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Property inquiries policies
CREATE POLICY "Tenants can insert inquiries"
  ON property_inquiries
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can read own inquiries"
  ON property_inquiries
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can read inquiries for their properties"
  ON property_inquiries
  FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update inquiry status"
  ON property_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, phone_number, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE((NEW.raw_user_meta_data->>'user_role')::user_role, 'tenant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE properties 
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON property_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_monthly);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant ON property_inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON property_inquiries(status);