/**
 * EMPLOYEE MANAGEMENT HOOK
 * 
 * Custom React hook for managing Property Admin employees.
 * Provides functions for Super Admin to manage employee lifecycle.
 * 
 * KEY FEATURES:
 * - Employee invitation and activation
 * - Property assignment management
 * - Performance tracking
 * - Employee status management
 * - Real-time data updates
 */

import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  employee_id: string | null;
  hired_date: string | null;
  performance_rating: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface EmployeePerformance {
  id: string;
  admin_id: string;
  month_year: string;
  properties_managed: number;
  bookings_received: number;
  bookings_approved: number;
  bookings_completed: number;
  conversion_rate: number;
  average_response_time_hours: number;
  tenant_satisfaction_rating: number;
  revenue_generated: number;
  occupancy_rate: number;
}

interface UseEmployeeManagementReturn {
  // State
  employees: Employee[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadEmployees: () => Promise<void>;
  inviteEmployee: (email: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  activateEmployee: (employeeId: string, employeeData: { employeeId: string; hiredDate: string }) => Promise<{ success: boolean; error?: string }>;
  deactivateEmployee: (employeeId: string) => Promise<{ success: boolean; error?: string }>;
  updateEmployee: (employeeId: string, updates: Partial<Employee>) => Promise<{ success: boolean; error?: string }>;
  assignProperties: (adminId: string, propertyIds: string[]) => Promise<{ success: boolean; error?: string }>;
  
  // Performance tracking
  getEmployeePerformance: (employeeId: string) => Promise<EmployeePerformance[]>;
  updatePerformanceRating: (employeeId: string, rating: number) => Promise<{ success: boolean; error?: string }>;
  
  // Utility functions
  getEmployeeStats: () => {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    avgRating: number;
  };
}

export const useEmployeeManagement = (): UseEmployeeManagementReturn => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authorized (Super Admin only)
  const isAuthorized = profile?.user_role === 'super_admin';

  /**
   * LOAD EMPLOYEES
   * 
   * Fetches all Property Admin employees from the database.
   */
  const loadEmployees = async () => {
    if (!isAuthorized) {
      setError('Unauthorized: Only Super Admins can manage employees');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await db.users.getEmployees();
      
      if (dbError) {
        throw new Error(dbError.message || 'Failed to load employees');
      }
      
      setEmployees(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load employees';
      setError(errorMessage);
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * INVITE EMPLOYEE
   * 
   * Sends invitation to a new Property Admin employee.
   */
  const inviteEmployee = async (email: string, fullName: string) => {
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Only Super Admins can invite employees' };
    }

    try {
      setError(null);
      
      // Check if employee already exists
      const existingEmployee = employees.find(emp => emp.email.toLowerCase() === email.toLowerCase());
      if (existingEmployee) {
        return { success: false, error: 'Employee with this email already exists' };
      }

      // Use auth context function for invitation
      const { error: inviteError } = await db.auth?.inviteEmployee?.(email, fullName) || {};
      
      if (inviteError) {
        throw new Error(inviteError.message || 'Failed to invite employee');
      }

      // Reload employees to get updated list
      await loadEmployees();
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite employee';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * ACTIVATE EMPLOYEE
   * 
   * Activates an invited employee with employee ID and hire date.
   */
  const activateEmployee = async (employeeId: string, employeeData: { employeeId: string; hiredDate: string }) => {
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Only Super Admins can activate employees' };
    }

    try {
      setError(null);
      
      const { data, error: updateError } = await db.users.update(employeeId, {
        employee_id: employeeData.employeeId,
        hired_date: employeeData.hiredDate,
        is_active: true,
        user_role: 'property_admin'
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to activate employee');
      }

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, employee_id: employeeData.employeeId, hired_date: employeeData.hiredDate, is_active: true }
          : emp
      ));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate employee';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * DEACTIVATE EMPLOYEE
   * 
   * Deactivates an employee and reassigns their properties.
   */
  const deactivateEmployee = async (employeeId: string) => {
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Only Super Admins can deactivate employees' };
    }

    try {
      setError(null);
      
      const { data, error: updateError } = await db.users.update(employeeId, {
        is_active: false
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to deactivate employee');
      }

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, is_active: false } : emp
      ));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate employee';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * UPDATE EMPLOYEE
   * 
   * Updates employee information.
   */
  const updateEmployee = async (employeeId: string, updates: Partial<Employee>) => {
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Only Super Admins can update employees' };
    }

    try {
      setError(null);
      
      const { data, error: updateError } = await db.users.update(employeeId, updates);

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update employee');
      }

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, ...updates } : emp
      ));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * ASSIGN PROPERTIES
   * 
   * Assigns multiple properties to an employee.
   */
  const assignProperties = async (adminId: string, propertyIds: string[]) => {
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Only Super Admins can assign properties' };
    }

    try {
      setError(null);
      
      // Update all properties to assign them to the admin
      const promises = propertyIds.map(propertyId => 
        db.properties.update(propertyId, { assigned_admin_id: adminId })
      );
      
      await Promise.all(promises);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign properties';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * GET EMPLOYEE PERFORMANCE
   * 
   * Retrieves performance data for a specific employee.
   */
  const getEmployeePerformance = async (employeeId: string): Promise<EmployeePerformance[]> => {
    try {
      const { data, error: performanceError } = await db.employeePerformance.getByAdmin(employeeId);
      
      if (performanceError) {
        console.error('Error loading employee performance:', performanceError);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Error loading employee performance:', err);
      return [];
    }
  };

  /**
   * UPDATE PERFORMANCE RATING
   * 
   * Updates an employee's performance rating.
   */
  const updatePerformanceRating = async (employeeId: string, rating: number) => {
    if (!isAuthorized) {
      return { success: false, error: 'Unauthorized: Only Super Admins can update performance ratings' };
    }

    try {
      setError(null);
      
      const { data, error: updateError } = await db.users.update(employeeId, {
        performance_rating: rating
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update performance rating');
      }

      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, performance_rating: rating } : emp
      ));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update performance rating';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * GET EMPLOYEE STATS
   * 
   * Calculates summary statistics for all employees.
   */
  const getEmployeeStats = () => {
    const total = employees.length;
    const active = employees.filter(emp => emp.is_active).length;
    const inactive = total - active;
    const verified = employees.filter(emp => emp.is_verified).length;
    const avgRating = employees.length > 0 
      ? employees.reduce((sum, emp) => sum + (emp.performance_rating || 0), 0) / employees.length
      : 0;

    return {
      total,
      active,
      inactive,
      verified,
      avgRating
    };
  };

  // Load employees on mount
  useEffect(() => {
    if (isAuthorized) {
      loadEmployees();
    }
  }, [isAuthorized]);

  return {
    // State
    employees,
    loading,
    error,
    
    // Actions
    loadEmployees,
    inviteEmployee,
    activateEmployee,
    deactivateEmployee,
    updateEmployee,
    assignProperties,
    
    // Performance tracking
    getEmployeePerformance,
    updatePerformanceRating,
    
    // Utility functions
    getEmployeeStats
  };
};

export default useEmployeeManagement;