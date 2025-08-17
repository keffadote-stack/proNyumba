/**
 * EMPLOYEE CARD COMPONENT
 * 
 * Individual employee card extracted from EmployeeManagement
 */

import React from 'react';
import { Users, Mail, Badge, Calendar, Settings, Star } from 'lucide-react';

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

interface EmployeeCardProps {
  employee: Employee;
  kpis: EmployeeKPIs;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  kpis,
  onActivate,
  onDeactivate
}) => {
  return (
    <div className="p-4 hover:bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-gray-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {employee.full_name}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{employee.email}</span>
              </span>
              
              {employee.employee_id && (
                <span className="flex items-center space-x-1">
                  <Badge className="h-3 w-3" />
                  <span>ID: {employee.employee_id}</span>
                </span>
              )}
              
              {employee.hired_date && (
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Hired: {new Date(employee.hired_date).toLocaleDateString()}
                  </span>
                </span>
              )}
            </div>

            {/* Employee KPIs */}
            {employee.is_active && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-blue-50 px-2 py-1 rounded">
                  <span className="text-blue-600 font-medium">
                    Properties: {kpis.propertiesManaged}
                  </span>
                </div>
                <div className="bg-green-50 px-2 py-1 rounded">
                  <span className="text-green-600 font-medium">
                    Conv: {kpis.conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-purple-50 px-2 py-1 rounded">
                  <span className="text-purple-600 font-medium">
                    Response: {kpis.responseTime.toFixed(1)}h
                  </span>
                </div>
                <div className="bg-yellow-50 px-2 py-1 rounded">
                  <span className="text-yellow-600 font-medium">
                    Rating: {kpis.satisfaction.toFixed(1)}
                  </span>
                </div>
                <div className="bg-indigo-50 px-2 py-1 rounded">
                  <span className="text-indigo-600 font-medium">
                    Revenue: TSh {kpis.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status badges */}
          <div className="flex space-x-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                employee.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {employee.is_active ? "Active" : "Inactive"}
            </span>
            {employee.is_verified && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Verified
              </span>
            )}
          </div>

          {/* Performance rating */}
          {employee.performance_rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {employee.performance_rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2">
            {!employee.is_active ? (
              <button
                onClick={() => onActivate(employee.id)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Activate
              </button>
            ) : (
              <button
                onClick={() => onDeactivate(employee.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Deactivate
              </button>
            )}
            <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
              <Settings className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;