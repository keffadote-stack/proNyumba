/**
 * EMPLOYEE LIST COMPONENT
 * 
 * List of employees with individual employee cards
 */

import React from 'react';
import { Users } from 'lucide-react';
import EmployeeCard from '../EmployeeCard';

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

interface EmployeeKPIs {
  conversionRate: number;
  responseTime: number;
  satisfaction: number;
  revenue: number;
  propertiesManaged: number;
}

interface EmployeeListProps {
  employees: Employee[];
  loading: boolean;
  getEmployeeKPIs: (employeeId: string) => EmployeeKPIs;
  onActivateEmployee: (id: string) => void;
  onDeactivateEmployee: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading,
  getEmployeeKPIs,
  onActivateEmployee,
  onDeactivateEmployee
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee List</h3>
        </div>
        <div className="space-y-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-white animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Employee List</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {employees.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No employees found</p>
          </div>
        ) : (
          employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              kpis={getEmployeeKPIs(employee.id)}
              onActivate={onActivateEmployee}
              onDeactivate={onDeactivateEmployee}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeList;