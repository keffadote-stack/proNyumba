/**
 * ROLE SELECTOR COMPONENT
 * 
 * Component for selecting user role during registration.
 * Supports the three-tier role system: Super Admin, Property Admin, Tenant.
 * 
 * KEY FEATURES:
 * - Visual role selection with descriptions
 * - Role-specific information and benefits
 * - Clear role hierarchy explanation
 * - Mobile-responsive design
 */

import React from 'react';
import { Shield, Users, Home, Check } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'super_admin' | 'property_admin' | 'tenant';
  onRoleChange: (role: 'super_admin' | 'property_admin' | 'tenant') => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange,
  disabled = false
}) => {
  const roles = [
    {
      id: 'tenant' as const,
      title: 'Tenant',
      description: 'Looking for property to rent',
      icon: Home,
      features: [
        'Browse available properties',
        'Request property viewings',
        'Direct communication with property admins',
        'Secure payment processing',
        'Save favorite properties',
        'Track your booking history',
        'Get instant notifications',
        'Access mobile-friendly interface'
      ],
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-gray-200',
        bg: isSelected ? 'bg-blue-50' : 'bg-white',
        icon: isSelected ? 'text-blue-600' : 'text-blue-500',
        title: isSelected ? 'text-blue-900' : 'text-gray-900',
        check: 'bg-blue-500'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-gray-200',
        bg: isSelected ? 'bg-green-50' : 'bg-white',
        icon: isSelected ? 'text-green-600' : 'text-green-500',
        title: isSelected ? 'text-green-900' : 'text-gray-900',
        check: 'bg-green-500'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-gray-200',
        bg: isSelected ? 'bg-purple-50' : 'bg-white',
        icon: isSelected ? 'text-purple-600' : 'text-purple-500',
        title: isSelected ? 'text-purple-900' : 'text-gray-900',
        check: 'bg-purple-500'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Your Role
      </label>
      
      {roles.map((role) => {
        const isSelected = selectedRole === role.id;
        const colors = getColorClasses(role.color, isSelected);
        const Icon = role.icon;
        
        return (
          <div
            key={role.id}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              colors.border
            } ${colors.bg} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onRoleChange(role.id)}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full ${colors.check} flex items-center justify-center`}>
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            
            {/* Role header */}
            <div className="flex items-start space-x-3 mb-3">
              <div className={`flex-shrink-0 ${colors.icon}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${colors.title}`}>
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {role.description}
                </p>
              </div>
            </div>
            
            {/* Role features */}
            <div className="ml-9">
              <ul className="space-y-1">
                {role.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {role.features.length > 3 && (
                  <li className="text-sm text-gray-500 italic">
                    +{role.features.length - 3} more features
                  </li>
                )}
              </ul>
              
              {/* Special notes */}
              {role.note && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  {role.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Platform information */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Welcome to NyumbaLink</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>Join thousands of tenants finding their perfect home in Tanzania.</p>
          <p>Our platform connects you directly with verified property administrators for a seamless rental experience.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;