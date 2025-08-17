-- NyumbaLink Database Creation Script
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tenant', 'landlord');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('house', 'apartment', 'room');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'viewed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    user_role user_role NOT NULL,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    property_type property_type NOT NULL,
    bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
    bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
    price_monthly DECIMAL(12,2) NOT NULL CHECK (price_monthly > 0),
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    address TEXT,
    phone_contact TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    utilities TEXT[] DEFAULT '{}',
    nearby_services TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status inquiry_status DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price_monthly ON properties(price_monthly);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_tenant_id ON property_inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_status ON property_inquiries(status);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING gin(
    to_tsvector('english', title || ' ' || description || ' ' || city || ' ' || area)
);

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON properties USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_city_trgm ON properties USING gin(city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_area_trgm ON properties USING gin(area gin_trgm_ops);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_inquiries_updated_at ON property_inquiries;
CREATE TRIGGER update_property_inquiries_updated_at 
    BEFORE UPDATE ON property_inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, user_role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE((NEW.raw_user_meta_data->>'user_role')::user_role, 'tenant')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile creation (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE properties 
    SET views_count = views_count + 1 
    WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment property inquiries count
CREATE OR REPLACE FUNCTION increment_property_inquiries()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties 
    SET inquiries_count = inquiries_count + 1 
    WHERE id = NEW.property_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for inquiries count (drop first if exists)
DROP TRIGGER IF EXISTS on_property_inquiry_created ON property_inquiries;
CREATE TRIGGER on_property_inquiry_created
    AFTER INSERT ON property_inquiries
    FOR EACH ROW EXECUTE FUNCTION increment_property_inquiries();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Available properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Landlords can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Property owners can update their properties" ON properties;
DROP POLICY IF EXISTS "Property owners can delete their properties" ON properties;

DROP POLICY IF EXISTS "Tenants can create inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Users can view their own inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Property owners can view inquiries for their properties" ON property_inquiries;
DROP POLICY IF EXISTS "Property owners can update inquiry status" ON property_inquiries;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Available properties are viewable by everyone" 
    ON properties FOR SELECT 
    USING (is_available = true OR auth.uid() = owner_id);

CREATE POLICY "Landlords can insert their own properties" 
    ON properties FOR INSERT 
    WITH CHECK (
        auth.uid() = owner_id AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_role = 'landlord'
        )
    );

CREATE POLICY "Property owners can update their properties" 
    ON properties FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Property owners can delete their properties" 
    ON properties FOR DELETE 
    USING (auth.uid() = owner_id);

-- Property inquiries policies
CREATE POLICY "Tenants can create inquiries" 
    ON property_inquiries FOR INSERT 
    WITH CHECK (
        auth.uid() = tenant_id AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_role = 'tenant'
        )
    );

CREATE POLICY "Users can view their own inquiries" 
    ON property_inquiries FOR SELECT 
    USING (auth.uid() = tenant_id);

CREATE POLICY "Property owners can view inquiries for their properties" 
    ON property_inquiries FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_inquiries.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

CREATE POLICY "Property owners can update inquiry status" 
    ON property_inquiries FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_inquiries.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Create storage bucket for property images (if not exists)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'property-images', 'property-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'property-images'
);

-- Drop existing storage policies
DROP POLICY IF EXISTS "Property images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- Storage policies for property images
CREATE POLICY "Property images are publicly accessible" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" 
    ON storage.objects FOR INSERT 
    WITH CHECK (
        bucket_id = 'property-images' AND 
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own property images" 
    ON storage.objects FOR UPDATE 
    USING (
        bucket_id = 'property-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own property images" 
    ON storage.objects FOR DELETE 
    USING (
        bucket_id = 'property-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Success message
SELECT 'NyumbaLink database schema created successfully! 🏠' as message;