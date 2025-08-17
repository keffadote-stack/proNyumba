-- Enhanced Database Schema with Employee Management
-- Migration to transform existing schema to support three-tier user system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing types and recreate with enhanced structure
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Create enhanced user role type
CREATE TYPE user_role AS ENUM ('super_admin', 'property_admin', 'tenant');

-- Create property type enum
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'room', 'studio');

-- Create booking status enum
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'declined', 'completed', 'cancelled');

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Enhanced Users table with employee management
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  user_role user_role NOT NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  employee_id TEXT UNIQUE, -- For property admins
  hired_date TIMESTAMP WITH TIME ZONE, -- For property admins
  performance_rating DECIMAL(3,2) DEFAULT 0, -- For property admins
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Properties table with admin assignment
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_admin_id UUID REFERENCES users(id) NOT NULL, -- Property admin assignment
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type property_type NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
  square_footage DECIMAL(10,2),
  rent_amount DECIMAL(12,2) NOT NULL CHECK (rent_amount > 0),
  service_fee_amount DECIMAL(12,2) GENERATED ALWAYS AS (rent_amount * 0.20) STORED,
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS (rent_amount * 1.20) STORED,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  full_address TEXT,
  contact_preferences JSONB DEFAULT '{"whatsapp": true, "phone": true, "email": false}',
  utilities JSONB DEFAULT '{"water": false, "electricity": false, "internet": false}',
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  pet_policy TEXT,
  parking_available BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  occupancy_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking Requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) NOT NULL, -- Property admin handling the booking
  tenant_name TEXT NOT NULL,
  tenant_phone TEXT NOT NULL,
  tenant_email TEXT NOT NULL,
  preferred_viewing_date DATE NOT NULL,
  preferred_viewing_time TIME NOT NULL,
  message TEXT,
  status booking_status DEFAULT 'pending',
  admin_response TEXT,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table with service fee tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES booking_requests(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) NOT NULL,
  tenant_id UUID REFERENCES users(id) NOT NULL,
  admin_id UUID REFERENCES users(id) NOT NULL,
  rent_amount DECIMAL(12,2) NOT NULL,
  service_fee_amount DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_gateway_id TEXT,
  transaction_reference TEXT UNIQUE,
  status payment_status DEFAULT 'pending',
  gateway_response JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employee Performance Tracking table
CREATE TABLE IF NOT EXISTS employee_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- First day of the month
  properties_managed INTEGER DEFAULT 0,
  bookings_received INTEGER DEFAULT 0,
  bookings_approved INTEGER DEFAULT 0,
  bookings_completed INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  average_response_time_hours DECIMAL(8,2) DEFAULT 0,
  tenant_satisfaction_rating DECIMAL(3,2) DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  occupancy_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id, month_year)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'booking_request', 'payment_confirmation', 'property_update', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional notification data
  channels TEXT[] DEFAULT '{"in_app"}', -- 'in_app', 'email', 'push', 'whatsapp'
  is_read BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_properties_admin ON properties(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_city_area ON properties(city, area);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_admin ON booking_requests(admin_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_tenant ON booking_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_employee_performance_admin ON employee_performance(admin_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins have full access to users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

CREATE POLICY "Property admins can view basic user info" ON users
  FOR SELECT USING (
    user_role = 'tenant' OR 
    (user_role = 'property_admin' AND auth.uid() = id) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

-- RLS Policies for Properties table
CREATE POLICY "Super admins have full access to properties" ON properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

CREATE POLICY "Property admins can manage assigned properties" ON properties
  FOR ALL USING (
    assigned_admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

CREATE POLICY "Tenants can view available properties" ON properties
  FOR SELECT USING (
    is_available = true OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('super_admin', 'property_admin'))
  );

-- RLS Policies for Booking Requests table
CREATE POLICY "Users can view related booking requests" ON booking_requests
  FOR SELECT USING (
    tenant_id = auth.uid() OR
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

CREATE POLICY "Tenants can create booking requests" ON booking_requests
  FOR INSERT WITH CHECK (
    tenant_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'tenant')
  );

CREATE POLICY "Property admins can update their booking requests" ON booking_requests
  FOR UPDATE USING (
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

-- RLS Policies for Payments table
CREATE POLICY "Users can view related payments" ON payments
  FOR SELECT USING (
    tenant_id = auth.uid() OR
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

CREATE POLICY "System can manage payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

-- RLS Policies for Employee Performance table
CREATE POLICY "Admins can view their own performance" ON employee_performance
  FOR SELECT USING (
    admin_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

CREATE POLICY "Super admins can manage employee performance" ON employee_performance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role = 'super_admin')
  );

-- RLS Policies for Notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create functions for automated tasks
CREATE OR REPLACE FUNCTION update_property_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update property statistics when booking requests are created/updated
  IF TG_OP = 'INSERT' THEN
    UPDATE properties 
    SET inquiries_count = inquiries_count + 1,
        updated_at = NOW()
    WHERE id = NEW.property_id;
    
    IF NEW.status = 'completed' THEN
      UPDATE properties 
      SET bookings_count = bookings_count + 1,
          is_available = false,
          updated_at = NOW()
      WHERE id = NEW.property_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
      UPDATE properties 
      SET bookings_count = bookings_count + 1,
          is_available = false,
          updated_at = NOW()
      WHERE id = NEW.property_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for property stats updates
DROP TRIGGER IF EXISTS trigger_update_property_stats ON booking_requests;
CREATE TRIGGER trigger_update_property_stats
  AFTER INSERT OR UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_property_stats();

-- Create function to update employee performance
CREATE OR REPLACE FUNCTION update_employee_performance()
RETURNS TRIGGER AS $$
DECLARE
  current_month DATE;
BEGIN
  current_month := DATE_TRUNC('month', NOW())::DATE;
  
  -- Insert or update employee performance record
  INSERT INTO employee_performance (admin_id, month_year, bookings_received)
  VALUES (NEW.admin_id, current_month, 1)
  ON CONFLICT (admin_id, month_year)
  DO UPDATE SET 
    bookings_received = employee_performance.bookings_received + 1;
    
  -- Update conversion metrics if booking is approved/completed
  IF NEW.status IN ('approved', 'completed') THEN
    UPDATE employee_performance
    SET bookings_approved = bookings_approved + 1,
        conversion_rate = (bookings_approved + 1) * 100.0 / bookings_received
    WHERE admin_id = NEW.admin_id AND month_year = current_month;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for employee performance updates
DROP TRIGGER IF EXISTS trigger_update_employee_performance ON booking_requests;
CREATE TRIGGER trigger_update_employee_performance
  AFTER INSERT OR UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_employee_performance();

-- Create function to automatically calculate service fees
CREATE OR REPLACE FUNCTION calculate_service_fee()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure service fee is calculated correctly
  NEW.service_fee_amount := NEW.rent_amount * 0.20;
  NEW.total_amount := NEW.rent_amount + NEW.service_fee_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service fee calculation
DROP TRIGGER IF EXISTS trigger_calculate_service_fee ON payments;
CREATE TRIGGER trigger_calculate_service_fee
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION calculate_service_fee();

-- Insert initial Super Admin user (if not exists)
INSERT INTO users (id, full_name, email, user_role, is_verified, is_active)
SELECT 
  auth.uid(),
  'Super Admin',
  'admin@nyumbalink.com',
  'super_admin',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE user_role = 'super_admin'
) AND auth.uid() IS NOT NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_properties_updated_at ON properties;
CREATE TRIGGER trigger_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_booking_requests_updated_at ON booking_requests;
CREATE TRIGGER trigger_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();