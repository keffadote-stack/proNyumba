/**
 * PROPERTY ADMIN DASHBOARD
 * 
 * Main dashboard interface for Property Admin users.
 * Provides property management, booking handling, and performance tracking.
 * 
 * KEY FEATURES:
 * - Assigned property management
 * - Booking request handling
 * - Performance metrics
 * - Tenant communication
 * - Property creation and editing
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { 
  Building, 
  Calendar, 
  BarChart3,
  MessageSquare,
  Plus,
  Users,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';

type DashboardView = 'overview' | 'properties' | 'bookings' | 'performance' | 'messages';

interface DashboardStats {
  assignedProperties: number;
  availableProperties: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageResponseTime: number;
}

const PropertyAdminDashboard: React.FC = () => {
  const { profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    assignedProperties: 0,
    availableProperties: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    averageResponseTime: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Load dashboard statistics
  useEffect(() => {
    if (profile?.id) {
      loadDashboardStats();
    }
  }, [profile?.id]);

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Load assigned properties
      const { data: properties } = await db.properties.getByAdmin(profile!.id);
      const assignedProperties = properties?.length || 0;
      const availableProperties = properties?.filter(p => p.is_available).length || 0;

      // Load booking requests
      const { data: bookings } = await db.bookingRequests.getByAdmin(profile!.id);
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter((b: any) => b.status === 'pending').length || 0;
      const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;

      // Load payments for revenue calculation
      const { data: payments } = await db.payments.getByAdmin(profile!.id);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = payments?.filter((p: any) => 
        p.created_at.startsWith(currentMonth) && p.status === 'completed'
      ).reduce((sum, p: any) => sum + (p.service_fee_amount || 0), 0) || 0;

      // Calculate conversion rate
      const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      setStats({
        assignedProperties,
        availableProperties,
        totalBookings,
        pendingBookings,
        completedBookings,
        monthlyRevenue,
        conversionRate,
        averageResponseTime: 2.5 // Mock data
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.user_role !== 'property_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only Property Admins can access this dashboard.</p>
          <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'properties', label: 'My Properties', icon: Building },
    { id: 'bookings', label: 'Booking Requests', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ];

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'properties':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
              <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Property</span>
              </button>
            </div>
            <p className="text-gray-600">Your assigned properties will appear here.</p>
          </div>
        );
      case 'bookings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Requests</h2>
            <p className="text-gray-600">Incoming booking requests and viewing appointments will appear here.</p>
          </div>
        );
      case 'performance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
            <p className="text-gray-600">Your performance analytics and KPIs will appear here.</p>
          </div>
        );
      case 'messages':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
            <p className="text-gray-600">Communication with tenants and notifications will appear here.</p>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Assigned Properties</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {statsLoading ? '...' : stats.assignedProperties}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Available Properties</p>
                    <p className="text-2xl font-bold text-green-900">
                      {statsLoading ? '...' : stats.availableProperties}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Pending Bookings</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {statsLoading ? '...' : stats.pendingBookings}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {statsLoading ? '...' : `TSh ${stats.monthlyRevenue.toLocaleString()}`}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-medium text-gray-900">
                      {statsLoading ? '...' : `${stats.conversionRate.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Avg. Response Time</span>
                    <span className="font-medium text-gray-900">
                      {statsLoading ? '...' : `${stats.averageResponseTime}h`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-medium text-gray-900">
                      {statsLoading ? '...' : stats.totalBookings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">New booking request received</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Property viewing completed</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">Payment processed successfully</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
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
                          ? 'bg-green-50 text-green-700 border border-green-200'
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

            {/* Employee Info Card */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Employee Info</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Employee ID:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {profile.employee_id || 'Not assigned'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${profile.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Hired:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {profile.hired_date ? new Date(profile.hired_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              {renderCurrentView()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAdminDashboard;