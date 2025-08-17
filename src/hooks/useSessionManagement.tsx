/**
 * SESSION MANAGEMENT HOOK
 * 
 * Custom hook for managing user sessions with role context preservation.
 * Handles session persistence, role-based redirects, and session validation.
 * 
 * KEY FEATURES:
 * - Role context preservation across sessions
 * - Automatic session validation
 * - Role-based redirect handling
 * - Session timeout management
 * - Activity tracking
 */

import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SessionConfig {
  timeoutMinutes?: number;
  trackActivity?: boolean;
  autoRedirect?: boolean;
}

export const useSessionManagement = (config: SessionConfig = {}) => {
  const {
    timeoutMinutes = 60,
    trackActivity = true,
    autoRedirect = true
  } = config;

  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  // Get role-based default route
  const getRoleDefaultRoute = useCallback((userRole: string) => {
    const roleRoutes = {
      super_admin: '/admin/dashboard',
      property_admin: '/admin/properties',
      tenant: '/properties'
    };
    return roleRoutes[userRole as keyof typeof roleRoutes] || '/';
  }, []);

  // Check if current route is appropriate for user role
  const isRouteAppropriateForRole = useCallback((userRole: string, currentPath: string) => {
    const roleRoutePatterns = {
      super_admin: ['/admin', '/dashboard', '/employees', '/analytics'],
      property_admin: ['/admin/properties', '/bookings', '/performance'],
      tenant: ['/properties', '/bookings', '/profile']
    };

    const patterns = roleRoutePatterns[userRole as keyof typeof roleRoutePatterns] || [];
    return patterns.some(pattern => currentPath.startsWith(pattern)) || currentPath === '/';
  }, []);

  // Handle role-based navigation
  const handleRoleBasedNavigation = useCallback(() => {
    if (!profile || !autoRedirect) return;

    const currentPath = location.pathname;
    const userRole = profile.user_role;

    // Skip navigation if user is on an appropriate route
    if (isRouteAppropriateForRole(userRole, currentPath)) {
      return;
    }

    // Redirect to role-appropriate route
    const defaultRoute = getRoleDefaultRoute(userRole);
    if (currentPath !== defaultRoute) {
      navigate(defaultRoute, { replace: true });
    }
  }, [profile, location.pathname, autoRedirect, navigate, getRoleDefaultRoute, isRouteAppropriateForRole]);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('lastActivity', lastActivityRef.current.toString());
  }, []);

  // Check session validity
  const checkSessionValidity = useCallback(() => {
    if (!trackActivity) return true;

    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const now = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    return (now - lastActivity) < timeoutMs;
  }, [timeoutMinutes, trackActivity]);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    localStorage.removeItem('lastActivity');
    // The auth context will handle the actual logout
    if (autoRedirect) {
      navigate('/', { replace: true });
    }
  }, [navigate, autoRedirect]);

  // Set up activity tracking
  useEffect(() => {
    if (!trackActivity || !user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, activityHandler, true);
    });

    // Set up periodic session check
    const checkInterval = setInterval(() => {
      if (!checkSessionValidity()) {
        handleSessionTimeout();
      }
    }, 60000); // Check every minute

    // Initial activity update
    updateActivity();

    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, activityHandler, true);
      });
      
      // Clear interval
      clearInterval(checkInterval);
    };
  }, [user, trackActivity, updateActivity, checkSessionValidity, handleSessionTimeout]);

  // Handle role-based navigation when profile loads
  useEffect(() => {
    if (!loading && profile) {
      handleRoleBasedNavigation();
    }
  }, [loading, profile, handleRoleBasedNavigation]);

  // Store role context in session storage
  useEffect(() => {
    if (profile) {
      const roleContext = {
        userRole: profile.user_role,
        userId: profile.id,
        isActive: profile.is_active,
        lastUpdate: Date.now()
      };
      sessionStorage.setItem('roleContext', JSON.stringify(roleContext));
    } else {
      sessionStorage.removeItem('roleContext');
    }
  }, [profile]);

  // Get stored role context
  const getStoredRoleContext = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('roleContext');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Check if user has required role
  const hasRole = useCallback((requiredRole: string | string[]) => {
    if (!profile) return false;

    const userRole = profile.user_role;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  }, [profile]);

  // Check if user can access route
  const canAccessRoute = useCallback((routePath: string) => {
    if (!profile) return false;

    // Define route access rules
    const routeAccess = {
      '/admin/dashboard': ['super_admin'],
      '/admin/employees': ['super_admin'],
      '/admin/analytics': ['super_admin'],
      '/admin/properties': ['super_admin', 'property_admin'],
      '/bookings': ['super_admin', 'property_admin'],
      '/performance': ['super_admin', 'property_admin'],
      '/properties': ['super_admin', 'property_admin', 'tenant'],
      '/profile': ['super_admin', 'property_admin', 'tenant']
    };

    const allowedRoles = routeAccess[routePath as keyof typeof routeAccess];
    if (!allowedRoles) return true; // Public route

    return hasRole(allowedRoles);
  }, [profile, hasRole]);

  // Get session info
  const getSessionInfo = useCallback(() => {
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0');
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const remainingTime = Math.max(0, timeoutMs - (Date.now() - lastActivity));

    return {
      isValid: checkSessionValidity(),
      lastActivity: new Date(lastActivity),
      remainingTime,
      timeoutMinutes,
      userRole: profile?.user_role,
      isActive: profile?.is_active
    };
  }, [profile, timeoutMinutes, checkSessionValidity]);

  return {
    // Session state
    sessionInfo: getSessionInfo(),
    roleContext: getStoredRoleContext(),
    
    // Role checking
    hasRole,
    canAccessRoute,
    
    // Navigation helpers
    getRoleDefaultRoute,
    isRouteAppropriateForRole,
    
    // Session management
    updateActivity,
    checkSessionValidity,
    
    // Utilities
    isSessionActive: checkSessionValidity(),
    currentRole: profile?.user_role,
    isAccountActive: profile?.is_active
  };
};