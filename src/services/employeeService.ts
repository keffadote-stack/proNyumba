/**
 * EMPLOYEE SERVICE
 * 
 * Business logic for employee management operations.
 * Extracted from AuthContext for better separation of concerns.
 */

import { db, auth } from '../lib/supabase';
import type { Database } from '../types/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

export interface EmployeeInviteData {
  email: string;
  fullName: string;
}

export interface EmployeeActivationData {
  employeeId: string;
  hiredDate: string;
}

export const employeeService = {
  /**
   * Invite a new employee (Super Admin only)
   */
  inviteEmployee: async (inviteData: EmployeeInviteData) => {
    try {
      const { error } = await auth.inviteEmployee(inviteData.email, inviteData.fullName);
      return { error };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Activate an employee (Super Admin only)
   */
  activateEmployee: async (userId: string, employeeData: EmployeeActivationData) => {
    try {
      const { data, error } = await db.users.update(userId, {
        employee_id: employeeData.employeeId,
        hired_date: employeeData.hiredDate,
        is_active: true,
        user_role: 'property_admin'
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Deactivate an employee (Super Admin only)
   */
  deactivateEmployee: async (userId: string) => {
    try {
      const { data, error } = await db.users.update(userId, {
        is_active: false
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Assign properties to an admin (Super Admin only)
   */
  assignProperties: async (adminId: string, propertyIds: string[]) => {
    try {
      // Update all properties to assign them to the admin
      const promises = propertyIds.map(propertyId => 
        db.properties.update(propertyId, { assigned_admin_id: adminId })
      );
      
      await Promise.all(promises);
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Get all employees
   */
  getEmployees: async () => {
    try {
      const { data, error } = await db.users.getEmployees();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get employee by ID
   */
  getEmployeeById: async (id: string) => {
    try {
      const { data, error } = await db.users.getById(id);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update employee profile
   */
  updateEmployee: async (id: string, updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await db.users.update(id, updates);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};