-- Fix RLS policies to prevent infinite recursion
-- This migration corrects the user table policies

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins have full access to users" ON users;
DROP POLICY IF EXISTS "Property admins can view basic user info" ON users;

-- Create corrected RLS policies for Users table
CREATE POLICY "Enable read access for users to their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users to their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Super admin access policy (separate from user self-access)
CREATE POLICY "Super admin full access" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

-- Property admin limited access policy
CREATE POLICY "Property admin limited access" ON users
  FOR SELECT USING (
    user_role = 'tenant' OR 
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

-- Update other table policies to prevent recursion
DROP POLICY IF EXISTS "Super admins have full access to properties" ON properties;
DROP POLICY IF EXISTS "Property admins can manage assigned properties" ON properties;

-- Corrected property policies
CREATE POLICY "Super admin property access" ON properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

CREATE POLICY "Property admin assigned access" ON properties
  FOR ALL USING (
    assigned_admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

-- Update booking request policies
DROP POLICY IF EXISTS "Users can view related booking requests" ON booking_requests;

CREATE POLICY "Booking request access" ON booking_requests
  FOR SELECT USING (
    tenant_id = auth.uid() OR
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

-- Update payment policies
DROP POLICY IF EXISTS "Users can view related payments" ON payments;

CREATE POLICY "Payment access" ON payments
  FOR SELECT USING (
    tenant_id = auth.uid() OR
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

-- Update employee performance policies
DROP POLICY IF EXISTS "Admins can view their own performance" ON employee_performance;

CREATE POLICY "Employee performance access" ON employee_performance
  FOR SELECT USING (
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users au 
      JOIN users u ON au.id = u.id 
      WHERE au.id = auth.uid() AND u.user_role = 'super_admin'
    )
  );

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, user_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'tenant')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();