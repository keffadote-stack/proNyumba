/**
 * TENANT DASHBOARD
 * 
 * Main dashboard interface for Tenant users.
 * Provides property browsing, booking management, and saved properties.
 * 
 * KEY FEATURES:
 * - Property search and browsing
 * - Booking request management
 * - Saved properties and favorites
 * - Payment history
 * - Profile management
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import { 
  Search, 
  Heart, 
  Calendar,
  CreditCard,
  User,
  Home,
  MapPin,
  Filter,
  AlertCircle
} from 'lucide-react';

type DashboardView = 'browse' | 'bookings' | 'favorites' | 'payments' | 'profile';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  savedProperties: number;
  totalSpent: number;
}

const TenantDashboard: React.FC = () => {
  const { profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('browse');
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    savedProperties: 0,
    totalSpent: 0
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
      
      // Load booking requests
      const { data: bookings } = await db.bookingRequests.getByTenant(profile!.id);
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter((b: any) => b.status === 'pending').length || 0;
      const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;

      // Load payments for total spent
      const { data: payments } = await db.payments.getByTenant(profile!.id);
      const totalSpent = payments?.reduce((sum, p: any) => sum + (p.total_amount || 0), 0) || 0;

      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        savedProperties: 0, // TODO: Implement saved properties
        totalSpent
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

  if (!profile || profile.user_role !== 'tenant') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only Tenants can access this dashboard.</p>
          <p className="text-sm text-gray-500">Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navigationItems = [
    { id: 'browse', label: 'Browse Properties', icon: Search },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'favorites', label: 'Saved Properties', icon: Heart },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
    { id: 'profile', label: 'Profile Settings', icon: User }
  ];

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'bookings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Booking Requests</h2>
            <p className="text-gray-600">Your booking requests and viewing appointments will appear here.</p>
          </div>
        );
      case 'favorites':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Saved Properties</h2>
            <p className="text-gray-600">Properties you've saved for later will appear here.</p>
          </div>
        );
      case 'payments':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment History</h2>
            <p className="text-gray-600">Your payment history and receipts will appear here.</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
            <p className="text-gray-600">Manage your account settings and preferences.</p>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Properties</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Welcome to NyumbaLink!</span>
              </div>
              <p className="text-blue-700 mt-2">
                Start browsing available properties and submit booking requests to schedule viewings.
              </p>
            </div>
            <p className="text-gray-600">Property browsing interface will be implemented here.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {profile.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="h-5 w-5" />
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
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-sm font-medium text-gray-900">
                    {statsLoading ? '...' : stats.totalBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Requests</span>
                  <span className="text-sm font-medium text-orange-600">
                    {statsLoading ? '...' : stats.pendingBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Viewings</span>
                  <span className="text-sm font-medium text-green-600">
                    {statsLoading ? '...' : stats.completedBookings}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="text-sm font-medium text-blue-600">
                    {statsLoading ? '...' : `TSh ${stats.totalSpent.toLocaleString()}`}
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

export default TenantDashboard;