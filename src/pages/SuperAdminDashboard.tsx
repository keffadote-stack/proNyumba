/**
 * SUPER ADMIN DASHBOARD
 * 
 * Main dashboard interface for Super Admin users.
 * Provides comprehensive business overview and navigation to management features.
 * 
 * KEY FEATURES:
 * - Business overview with key metrics
 * - Employee management access
 * - Property assignment interface
 * - Revenue and service fee tracking
 * - Performance analytics
 * - Quick actions and navigation
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { employeeService } from '../services/employeeService';
import { propertyService } from '../services/propertyService';
import EmployeeManagement from '../components/super-admin/EmployeeManagement';
import BusinessAnalytics from '../components/super-admin/BusinessAnalytics';
import PropertyAssignment from '../components/super-admin/PropertyAssignment';
import PlatformOverview from '../components/super-admin/PlatformOverview';
import NotificationCenter from '../components/super-admin/NotificationCenter';
import { 
  Users, 
  Building, 
  Settings,
  Bell,
  BarChart3,
  Home,
  AlertCircle
} from 'lucide-react';

type DashboardView = 'overview' | 'employees' | 'analytics' | 'properties' | 'notifications' | 'settings';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalProperties: number;
  availableProperties: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  pendingBookings: number;
}

const SuperAdminDashboard: React.FC = () => {
  const { profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalProperties: 0,
    availableProperties: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load dashboard statistics
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Load employees
      const { data: employees } = await employeeService.getEmployees();
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter((e: any) => e.is_active).length || 0;

      // Load properties
      const { data: properties } = await propertyService.getProperties();
      const totalProperties = properties?.length || 0;
      const availableProperties = properties?.filter(p => p.is_available).length || 0;

      // Load payments for revenue calculation
      const { data: payments } = await db.payments.getByAdmin('all');
      const totalRevenue = payments?.reduce((sum, p: any) => sum + (p.service_fee_amount || 0), 0) || 0;
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const monthlyRevenue = payments?.filter((p: any) => 
        p.created_at.startsWith(currentMonth) && p.status === 'completed'
      ).reduce((sum, p: any) => sum + (p.service_fee_amount || 0), 0) || 0;

      // Load booking requests
      const { data: bookings } = await db.bookingRequests.getByAdmin('all');
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter((b: any) => b.status === 'pending').length || 0;

      setStats({
        totalEmployees,
        activeEmployees,
        totalProperties,
        availableProperties,
        totalRevenue,
        monthlyRevenue,
        totalBookings,
        pendingBookings
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Check authorization
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.user_role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only Super Admins can access this dashboard.</p>
          <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'analytics', label: 'Business Analytics', icon: BarChart3 },
    { id: 'properties', label: 'Property Assignment', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'employees':
        return <EmployeeManagement />;
      case 'analytics':
        return <BusinessAnalytics />;
      case 'properties':
        return <PropertyAssignment />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Settings</h2>
            <p className="text-gray-600">Platform configuration and settings will be available here.</p>
          </div>
        );
      default:
        return <PlatformOverview stats={stats} loading={statsLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Navigation</h3>
              </div>
              <nav className="p-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as DashboardView)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats Card */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Employees</span>
                  <span className="text-sm font-medium text-gray-900">
                    {statsLoading ? '...' : stats.activeEmployees}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available Properties</span>
                  <span className="text-sm font-medium text-gray-900">
                    {statsLoading ? '...' : stats.availableProperties}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Bookings</span>
                  <span className="text-sm font-medium text-gray-900">
                    {statsLoading ? '...' : stats.pendingBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-sm font-medium text-green-600">
                    {statsLoading ? '...' : `TSh ${stats.monthlyRevenue.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;