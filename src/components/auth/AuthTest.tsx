/**
 * AUTHENTICATION TEST COMPONENT
 * 
 * Simple test component to verify the three-tier authentication system.
 * This component demonstrates role-based access control and user management.
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Users, Home, CheckCircle, XCircle } from 'lucide-react';

const AuthTest: React.FC = () => {
  const { 
    user, 
    profile, 
    loading, 
    isSuperAdmin, 
    isPropertyAdmin, 
    isTenant,
    canManageEmployees,
    canManageProperties
  } = useAuth();

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Test</h3>
        <div className="flex items-center space-x-2 text-red-600">
          <XCircle className="h-5 w-5" />
          <span>Not authenticated</span>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return Shield;
      case 'property_admin': return Users;
      case 'tenant': return Home;
      default: return Home;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-purple-600';
      case 'property_admin': return 'text-green-600';
      case 'tenant': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const RoleIcon = getRoleIcon(profile.user_role);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Test</h3>
      
      {/* Authentication Status */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-green-600 mb-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Authentication Successful</span>
        </div>
        <div className="text-sm text-gray-600">
          User ID: {user.id}
        </div>
      </div>

      {/* User Profile */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">User Profile</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <RoleIcon className={`h-6 w-6 ${getRoleColor(profile.user_role)}`} />
            <div>
              <div className="font-medium text-gray-900">{profile.full_name}</div>
              <div className="text-sm text-gray-600">{profile.email}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Role:</span>
              <span className={`ml-2 font-medium ${getRoleColor(profile.user_role)}`}>
                {profile.user_role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className={`ml-2 font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {profile.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Verified:</span>
              <span className={`ml-2 font-medium ${profile.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {profile.is_verified ? 'Yes' : 'No'}
              </span>
            </div>
            {profile.employee_id && (
              <div>
                <span className="text-gray-600">Employee ID:</span>
                <span className="ml-2 font-medium text-gray-900">{profile.employee_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role-based Permissions */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Role-based Permissions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Super Admin</span>
            <div className={`flex items-center space-x-1 ${isSuperAdmin ? 'text-green-600' : 'text-gray-400'}`}>
              {isSuperAdmin ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{isSuperAdmin ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Property Admin</span>
            <div className={`flex items-center space-x-1 ${isPropertyAdmin ? 'text-green-600' : 'text-gray-400'}`}>
              {isPropertyAdmin ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{isPropertyAdmin ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tenant</span>
            <div className={`flex items-center space-x-1 ${isTenant ? 'text-green-600' : 'text-gray-400'}`}>
              {isTenant ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{isTenant ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Access Permissions */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Access Permissions</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Can Manage Employees</span>
            <div className={`flex items-center space-x-1 ${canManageEmployees ? 'text-green-600' : 'text-gray-400'}`}>
              {canManageEmployees ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{canManageEmployees ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Can Manage Properties</span>
            <div className={`flex items-center space-x-1 ${canManageProperties ? 'text-green-600' : 'text-gray-400'}`}>
              {canManageProperties ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{canManageProperties ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;