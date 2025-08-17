/**
 * PLATFORM OVERVIEW COMPONENT
 *
 * Main overview dashboard for Super Admins showing key business metrics,
 * system health, and quick access to important functions.
 *
 * KEY FEATURES:
 * - Business metrics overview
 * - Revenue tracking and trends
 * - Employee performance summary
 * - System health indicators
 * - Quick action buttons
 * - Recent activity feed
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  DollarSign,
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  Star,
  Eye,
} from 'lucide-react';

interface PlatformOverviewProps {
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    totalProperties: number;
    availableProperties: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalBookings: number;
    pendingBookings: number;
  };
  loading: boolean;
}



interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'employee' | 'property';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

const PlatformOverview: React.FC<PlatformOverviewProps> = React.memo(({ stats, loading }) => {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [trends] = useState({
    employeeGrowth: 12.5,
    revenueGrowth: 8.3,
    propertyGrowth: 15.2,
    bookingGrowth: 22.1
  });

  // Mock recent activity data (in real app, this would come from API)
  useEffect(() => {
    setRecentActivity([
      {
        id: '1',
        type: 'employee',
        title: 'New Employee Activated',
        description: 'John Doe has been activated as Property Admin',
        timestamp: '2 hours ago',
        status: 'success'
      },
      {
        id: '2',
        type: 'booking',
        title: 'Booking Request Approved',
        description: 'Property viewing scheduled for tomorrow',
        timestamp: '4 hours ago',
        status: 'success'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Processed',
        description: 'TSh 240,000 service fee collected',
        timestamp: '6 hours ago',
        status: 'success'
      },
      {
        id: '4',
        type: 'property',
        title: 'New Property Listed',
        description: '3BR apartment in Mikocheni added',
        timestamp: '1 day ago',
        status: 'success'
      },
      {
        id: '5',
        type: 'booking',
        title: 'Booking Request Pending',
        description: 'Tenant waiting for admin response',
        timestamp: '2 days ago',
        status: 'pending'
      }
    ]);
  }, []);

  // Metric cards configuration
  const metricCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      subtitle: `${stats.activeEmployees} active`,
      icon: Users,
      color: 'blue',
      trend: trends.employeeGrowth,
      trendLabel: 'vs last month'
    },
    {
      title: 'Properties Managed',
      value: stats.totalProperties,
      subtitle: `${stats.availableProperties} available`,
      icon: Building,
      color: 'green',
      trend: trends.propertyGrowth,
      trendLabel: 'vs last month'
    },
    {
      title: 'Total Revenue',
      value: `TSh ${stats.totalRevenue.toLocaleString()}`,
      subtitle: `TSh ${stats.monthlyRevenue.toLocaleString()} this month`,
      icon: DollarSign,
      color: 'purple',
      trend: trends.revenueGrowth,
      trendLabel: 'vs last month'
    },
    {
      title: 'Booking Requests',
      value: stats.totalBookings,
      subtitle: `${stats.pendingBookings} pending`,
      icon: Calendar,
      color: 'orange',
      trend: trends.bookingGrowth,
      trendLabel: 'vs last month'
    }
  ];

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee': return Users;
      case 'booking': return Calendar;
      case 'payment': return DollarSign;
      case 'property': return Building;
      default: return Activity;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Platform Overview</h2>
        <p className="text-blue-100">
          Monitor your business performance and manage your property rental platform
        </p>
        <div className="mt-4 flex space-x-4">
          <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            View Reports
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          const isPositiveTrend = card.trend > 0;
          
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <Icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositiveTrend ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositiveTrend ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span>{Math.abs(card.trend)}%</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? '...' : card.value}
                </p>
                <p className="text-sm text-gray-500">{card.subtitle}</p>
                <p className="text-xs text-gray-400 mt-1">{card.trendLabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance Summary</h3>
            <p className="text-sm text-gray-600">Key performance indicators for your platform</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Employee Performance */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">4.2</h4>
                <p className="text-sm text-gray-600">Avg Employee Rating</p>
                <p className="text-xs text-green-600 mt-1">+0.3 from last month</p>
              </div>
              
              {/* Response Time */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">2.4h</h4>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-xs text-green-600 mt-1">-0.5h improvement</p>
              </div>
              
              {/* Conversion Rate */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">68%</h4>
                <p className="text-sm text-gray-600">Booking Conversion</p>
                <p className="text-xs text-green-600 mt-1">+5% increase</p>
              </div>
              
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">Latest platform activities</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity: RecentActivity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Invite Employee</p>
              <p className="text-sm text-gray-600">Add new Property Admin</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Building className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Assign Properties</p>
              <p className="text-sm text-gray-600">Manage property assignments</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Detailed business reports</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-6 w-6 text-orange-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Monitor Performance</p>
              <p className="text-sm text-gray-600">Employee KPIs</p>
            </div>
          </button>
          
        </div>
      </div>
    </div>
  );
});

PlatformOverview.displayName = 'PlatformOverview';

export default PlatformOverview;