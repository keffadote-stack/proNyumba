-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('tenant', 'landlord');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_type AS ENUM ('house', 'apartment', 'studio', 'villa', 'room');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inquiry_status AS ENUM ('new', 'contacted', 'viewed', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone_number text,
  user_role user_role NOT NULL DEFAULT 'tenant',
  avatar_url text,
  bio text,
  location text,
  is_verified boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT profiles_phone_check CHECK (phone_number IS NULL OR phone_number ~* '^\+?[0-9\s\-\(\)]{10,15}$')
);

-- =============================================
-- PROPERTIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  property_type property_type NOT NULL,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL CHECK (bathrooms >= 0),
  price_monthly integer NOT NULL CHECK (price_monthly > 0),
  
  -- Location details
  city text NOT NULL,
  area text NOT NULL,
  address text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  
  -- Contact and features
  phone_contact text NOT NULL,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  utilities text[] DEFAULT '{}',
  nearby_services text[] DEFAULT '{}',
  
  -- Property status and metrics
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  views_count integer DEFAULT 0,
  inquiries_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Search vector for full-text search
  search_vector tsvector,
  
  CONSTRAINT properties_phone_check CHECK (phone_contact ~* '^\+?[0-9\s\-\(\)]{10,15}$')
);

-- =============================================
-- PROPERTY INQUIRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Inquiry details
  tenant_name text NOT NULL,
  tenant_phone text NOT NULL,
  tenant_email text NOT NULL,
  message text NOT NULL,
  preferred_contact_method text DEFAULT 'phone',
  
  -- Status and response
  status inquiry_status DEFAULT 'new',
  landlord_response text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  
  CONSTRAINT inquiries_tenant_phone_check CHECK (tenant_phone ~* '^\+?[0-9\s\-\(\)]{10,15}$'),
  CONSTRAINT inquiries_tenant_email_check CHECK (tenant_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =============================================
-- FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT favorites_unique_user_property UNIQUE(user_id, property_id)
);

-- =============================================
-- PROPERTY VIEWS TABLE (Analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS property_views (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_ip inet,
  user_agent text,
  viewed_at timestamptz DEFAULT now(),
  view_date date DEFAULT CURRENT_DATE,
  view_hour integer DEFAULT EXTRACT(hour FROM now())
);

-- Create composite index for preventing duplicate views within same hour
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_views_unique_hourly 
ON property_views (property_id, viewer_id, view_date, view_hour)
WHERE viewer_id IS NOT NULL;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone_number,
    user_role,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE(new.raw_user_meta_data->>'user_role', 'tenant')::user_role,
    COALESCE(new.email_confirmed_at IS NOT NULL, false),
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
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

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_properties_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.area, '') || ' ' ||
    COALESCE(NEW.address, '') || ' ' ||
    COALESCE(array_to_string(NEW.amenities, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.utilities, ' '), '') || ' ' ||
    COALESCE(array_to_string(NEW.nearby_services, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set view date and hour
CREATE OR REPLACE FUNCTION set_view_date_hour()
RETURNS trigger AS $$
BEGIN
  NEW.view_date := CURRENT_DATE;
  NEW.view_hour := EXTRACT(hour FROM NEW.viewed_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment property views
CREATE OR REPLACE FUNCTION increment_property_views(property_id uuid, viewer_id uuid DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Insert view record (will be ignored if duplicate within same hour)
  INSERT INTO property_views (property_id, viewer_id, viewed_at)
  VALUES (property_id, viewer_id, now())
  ON CONFLICT (property_id, viewer_id, view_date, view_hour) DO NOTHING;
  
  -- Update property views count
  UPDATE properties 
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment inquiry count
CREATE OR REPLACE FUNCTION increment_inquiry_count()
RETURNS trigger AS $$
BEGIN
  UPDATE properties 
  SET inquiries_count = inquiries_count + 1,
      updated_at = now()
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON property_inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON property_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for search vector updates
DROP TRIGGER IF EXISTS update_properties_search_vector_trigger ON properties;
CREATE TRIGGER update_properties_search_vector_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

-- Trigger for setting view date and hour
DROP TRIGGER IF EXISTS set_view_date_hour_trigger ON property_views;
CREATE TRIGGER set_view_date_hour_trigger
  BEFORE INSERT ON property_views
  FOR EACH ROW EXECUTE FUNCTION set_view_date_hour();

-- Trigger for inquiry count
DROP TRIGGER IF EXISTS increment_inquiry_count_trigger ON property_inquiries;
CREATE TRIGGER increment_inquiry_count_trigger
  AFTER INSERT ON property_inquiries
  FOR EACH ROW EXECUTE FUNCTION increment_inquiry_count();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price_monthly ON properties(price_monthly);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_search_vector ON properties USING gin(search_vector);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_available_city ON properties(is_available, city) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_properties_available_price ON properties(is_available, price_monthly) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_properties_available_type ON properties(is_available, property_type) WHERE is_available = true;

-- Inquiries indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant_id ON property_inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_landlord_id ON property_inquiries(landlord_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON property_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON property_inquiries(created_at);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Property views indexes
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewer_id ON property_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_property_views_date_hour ON property_views(view_date, view_hour);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "properties_select_available" ON properties
  FOR SELECT USING (is_available = true OR owner_id = auth.uid());

CREATE POLICY "properties_insert_landlord" ON properties
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'landlord')
  );

CREATE POLICY "properties_update_owner" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "properties_delete_owner" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Property inquiries policies
CREATE POLICY "inquiries_select_involved" ON property_inquiries
  FOR SELECT USING (
    auth.uid() = tenant_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "inquiries_insert_tenant" ON property_inquiries
  FOR INSERT WITH CHECK (
    auth.uid() = tenant_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'tenant')
  );

CREATE POLICY "inquiries_update_landlord" ON property_inquiries
  FOR UPDATE USING (auth.uid() = landlord_id);

-- Favorites policies
CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Property views policies
CREATE POLICY "property_views_select_property_owner" ON property_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid())
  );

CREATE POLICY "property_views_insert_any" ON property_views
  FOR INSERT WITH CHECK (true);

-- =============================================
-- STORAGE SETUP
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('property-images', 'property-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "avatar_images_public_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatar_images_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_images_user_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_images_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for property images
CREATE POLICY "property_images_public_access" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "property_images_landlord_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "property_images_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "property_images_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View for property listings with owner details
CREATE OR REPLACE VIEW property_listings AS
SELECT 
  p.*,
  pr.full_name as owner_name,
  pr.phone_number as owner_phone,
  pr.email as owner_email,
  pr.is_verified as owner_verified,
  (SELECT COUNT(*) FROM favorites f WHERE f.property_id = p.id) as favorites_count
FROM properties p
LEFT JOIN profiles pr ON p.owner_id = pr.id
WHERE p.is_available = true;

-- View for landlord dashboard
CREATE OR REPLACE VIEW landlord_dashboard AS
SELECT 
  p.*,
  (SELECT COUNT(*) FROM property_inquiries pi WHERE pi.property_id = p.id) as total_inquiries,
  (SELECT COUNT(*) FROM property_inquiries pi WHERE pi.property_id = p.id AND pi.status = 'new') as new_inquiries,
  (SELECT COUNT(*) FROM favorites f WHERE f.property_id = p.id) as favorites_count
FROM properties p
WHERE p.owner_id = auth.uid();

-- Grant access to views
GRANT SELECT ON property_listings TO authenticated, anon;
GRANT SELECT ON landlord_dashboard TO authenticated;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================
-- VERIFICATION AND SUMMARY
-- =============================================

DO $$
DECLARE
    table_count integer;
    policy_count integer;
    function_count integer;
    trigger_count integer;
    index_count integer;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'properties', 'property_inquiries', 'favorites', 'property_views');
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Count functions
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    AND routine_name IN ('handle_new_user', 'update_updated_at_column', 'update_properties_search_vector', 'increment_property_views', 'increment_inquiry_count', 'set_view_date_hour');
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE '=== DATABASE SCHEMA CREATION COMPLETED ===';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'RLS policies created: %', policy_count;
    RAISE NOTICE 'Functions created: %', function_count;
    RAISE NOTICE 'Triggers created: %', trigger_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tables:';
    RAISE NOTICE '- profiles: User profiles with role-based access';
    RAISE NOTICE '- properties: Property listings with full details';
    RAISE NOTICE '- property_inquiries: Tenant inquiries to landlords';
    RAISE NOTICE '- favorites: User favorite properties';
    RAISE NOTICE '- property_views: Analytics for property views';
    RAISE NOTICE '';
    RAISE NOTICE 'Storage buckets:';
    RAISE NOTICE '- avatars: User profile pictures';
    RAISE NOTICE '- property-images: Property photos';
    RAISE NOTICE '';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '- Row Level Security (RLS) on all tables';
    RAISE NOTICE '- Full-text search on properties';
    RAISE NOTICE '- Automatic profile creation on signup';
    RAISE NOTICE '- Property view tracking and analytics';
    RAISE NOTICE '- Comprehensive indexing for performance';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for production use! 🚀';
END $$;