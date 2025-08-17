/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Component for protecting routes based on user roles and authentication status.
 * Provides role-based access control and redirects unauthorized users.
 * 
 * KEY FEATURES:
 * - Role-based route protection
 * - Authentication status checking
 * - Automatic redirects for unauthorized access
 * - Loading states during authentication checks
 * - Flexible role requirements (single role or multiple roles)
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'property_admin' | 'tenant';
  requiredRoles?: ('super_admin' | 'property_admin' | 'tenant')[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  requireAuth = true,
  fallbackPath = '/'
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required and user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user profile is loaded (required for role checking)
  if (requireAuth && user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (profile && (requiredRole || requiredRoles)) {
    const userRole = profile.user_role;
    let hasRequiredRole = false;

    if (requiredRole) {
      hasRequiredRole = userRole === requiredRole;
    } else if (requiredRoles) {
      hasRequiredRole = requiredRoles.includes(userRole);
    }

    // Check if user account is active (for property admins)
    const isAccountActive = profile.is_active !== false;

    if (!hasRequiredRole || !isAccountActive) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              {!hasRequiredRole ? (
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              ) : (
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {!hasRequiredRole ? 'Access Denied' : 'Account Inactive'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {!hasRequiredRole ? (
                <>
                  You don't have permission to access this page. 
                  {requiredRole && (
                    <> This page requires <strong>{getRoleDisplayName(requiredRole)}</strong> access.</>
                  )}
                  {requiredRoles && (
                    <> This page requires one of the following roles: <strong>{requiredRoles.map(getRoleDisplayName).join(', ')}</strong>.</>
                  )}
                </>
              ) : (
                'Your account is currently inactive. Please contact your administrator for assistance.'
              )}
            </p>
            
            <div className="space-y-2">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </button>
            </div>
            
            {/* Role information */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Your Current Role</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getRoleColor(userRole)}`} />
                <span className="text-sm text-gray-600">
                  {getRoleDisplayName(userRole)}
                  {!profile.is_active && ' (Inactive)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // User has required permissions, render the protected content
  return <>{children}</>;
};

// Helper function to get display name for roles
const getRoleDisplayName = (role: string): string => {
  const roleNames = {
    super_admin: 'Super Admin',
    property_admin: 'Property Admin',
    tenant: 'Tenant'
  };
  return roleNames[role as keyof typeof roleNames] || role;
};

// Helper function to get color for roles
const getRoleColor = (role: string): string => {
  const roleColors = {
    super_admin: 'bg-purple-500',
    property_admin: 'bg-green-500',
    tenant: 'bg-blue-500'
  };
  return roleColors[role as keyof typeof roleColors] || 'bg-gray-500';
};

export default ProtectedRoute;