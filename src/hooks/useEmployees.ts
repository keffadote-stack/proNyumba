/**
 * CUSTOM HOOK FOR EMPLOYEE MANAGEMENT
 * 
 * Centralizes employee data fetching and management logic
 */

import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/supabase';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  user_role: "super_admin" | "property_admin" | "tenant";
  avatar_url: string | null;
  employee_id: string | null;
  hired_date: string | null;
  performance_rating: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await db.users.getEmployees();

      if (dbError) {
        setError(dbError.message);
        return;
      }

      const employeeData: Employee[] = (data || []).map((user: any) => ({
        id: user.id as string,
        full_name: user.full_name as string,
        email: user.email as string,
        phone_number: user.phone_number as string | null,
        user_role: user.user_role as "super_admin" | "property_admin" | "tenant",
        avatar_url: user.avatar_url as string | null,
        employee_id: (user.employee_id as string) || null,
        hired_date: (user.hired_date as string) || null,
        performance_rating: (user.performance_rating as number) || null,
        is_active: (user.is_active as boolean) ?? true,
        is_verified: (user.is_verified as boolean) ?? false,
        created_at: user.created_at as string,
        updated_at: user.updated_at as string,
      }));
      
      setEmployees(employeeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return {
    employees,
    loading,
    error,
    refetch: loadEmployees
  };
};