/**
 * EMPLOYEE STATS COMPONENT
 * 
 * Displays employee statistics cards extracted from EmployeeManagement
 */

import React from 'react';
import { Users, UserCheck, CheckCircle, Star } from 'lucide-react';

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

interface EmployeeStatsProps {
  employees: Employee[];
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ employees }) => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.is_active).length;
  const verifiedEmployees = employees.filter((e) => e.is_verified).length;
  const avgRating = employees.length > 0
    ? (employees.reduce((sum, e) => sum + (e.performance_rating || 0), 0) / employees.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Total Employees
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {totalEmployees}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <UserCheck className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Active Employees
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {activeEmployees}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Verified Employees
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {verifiedEmployees}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <Star className="h-8 w-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Avg Rating
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {avgRating.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;