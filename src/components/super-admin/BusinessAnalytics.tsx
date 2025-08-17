/**
 * BUSINESS ANALYTICS COMPONENT
 * 
 * Comprehensive analytics dashboard for Super Admins.
 * Provides detailed insights into revenue, employee performance, and business metrics.
 * 
 * KEY FEATURES:
 * - Revenue analytics with service fee tracking
 * - Employee performance metrics and rankings
 * - Property portfolio analytics
 * - Booking conversion analytics
 * - Exportable reports
 * - Time-based filtering
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Building, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Star,
  Clock,
  Target,
  Award
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    serviceFees: number;
  };
  employees: {
    total: number;
    active: number;
    topPerformers: Array<{
      id: string;
      name: string;
      rating: number;
      revenue: number;
      conversions: number;
    }>;
  };
  properties: {
    total: number;
    available: number;
    occupancyRate: number;
    avgViews: number;
  };
  bookings: {
    total: number;
    pending: number;
    conversionRate: number;
    avgResponseTime: number;
  };
}

type TimeFilter = '7d' | '30d' | '90d' | '1y';

const BusinessAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: { total: 0, monthly: 0, growth: 0, serviceFees: 0 },
    employees: { total: 0, active: 0, topPerformers: [] },
    properties: { total: 0, available: 0, occupancyRate: 0, avgViews: 0 },
    bookings: { total: 0, pending: 0, conversionRate: 0, avgResponseTime: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'employees' | 'properties' | 'bookings'>('revenue');

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [timeFilter]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on filter
      const endDate = new Date();
      const startDate = new Date();
      switch (timeFilter) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load revenue data
      const { data: payments } = await db.payments.getByAdmin('all');
      const filteredPayments = payments?.filter((p: any) => 
        new Date(p.created_at) >= startDate && p.status === 'completed'
      ) || [];
      
      const totalRevenue = filteredPayments.reduce((sum, p: any) => sum + (p.service_fee_amount || 0), 0);
      const serviceFees = totalRevenue; // Service fees are our revenue
      
      // Calculate monthly revenue for growth comparison
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      
      const currentMonthRevenue = payments?.filter((p: any) => 
        p.created_at.startsWith(currentMonth) && p.status === 'completed'
      ).reduce((sum, p: any) => sum + (p.service_fee_amount || 0), 0) || 0;
      
      const lastMonthRevenue = payments?.filter((p: any) => 
        p.created_at.startsWith(lastMonthStr) && p.status === 'completed'
      ).reduce((sum, p: any) => sum + (p.service_fee_amount || 0), 0) || 0;
      
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Load employee data
      const { data: employees } = await db.users.getEmployees();
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter((e: any) => e.is_active).length || 0;
      
      // Mock top performers (in real app, calculate from performance data)
      const topPerformers = employees?.slice(0, 5).map((emp, index) => ({
        id: emp.id,
        name: emp.full_name,
        rating: 4.5 - (index * 0.2),
        revenue: 50000 - (index * 8000),
        conversions: 85 - (index * 5)
      })) || [];

      // Load property data
      const { data: properties } = await db.properties.getAll();
      const totalProperties = properties?.length || 0;
      const availableProperties = properties?.filter((p: any) => p.is_available).length || 0;
      const occupancyRate = totalProperties > 0 
        ? ((totalProperties - availableProperties) / totalProperties) * 100 
        : 0;
      const avgViews = properties?.reduce((sum, p: any) => sum + (p.views_count || 0), 0) / totalProperties || 0;

      // Load booking data
      const { data: bookings } = await db.bookingRequests.getByAdmin('all');
      const totalBookings = bookings?.length || 0;
      const pendingBookings = bookings?.filter((b: any) => b.status === 'pending').length || 0;
      const completedBookings = bookings?.filter((b: any) => b.status === 'completed').length || 0;
      const conversionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      setAnalyticsData({
        revenue: {
          total: totalRevenue,
          monthly: currentMonthRevenue,
          growth: revenueGrowth,
          serviceFees
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          topPerformers
        },
        properties: {
          total: totalProperties,
          available: availableProperties,
          occupancyRate,
          avgViews
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          conversionRate,
          avgResponseTime: 2.4 // Mock data
        }
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export data function
  const handleExportData = () => {
    const dataToExport = {
      generatedAt: new Date().toISOString(),
      timeFilter,
      analytics: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeFilter}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Time filter options
  const timeFilterOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  // Metric cards
  const metricCards = [
    {
      id: 'revenue',
      title: 'Revenue Analytics',
      value: `TSh ${analyticsData.revenue.total.toLocaleString()}`,
      subtitle: `TSh ${analyticsData.revenue.monthly.toLocaleString()} this month`,
      icon: DollarSign,
      color: 'green',
      trend: analyticsData.revenue.growth,
      active: selectedMetric === 'revenue'
    },
    {
      id: 'employees',
      title: 'Employee Performance',
      value: analyticsData.employees.active,
      subtitle: `${analyticsData.employees.total} total employees`,
      icon: Users,
      color: 'blue',
      trend: 12.5,
      active: selectedMetric === 'employees'
    },
    {
      id: 'properties',
      title: 'Property Portfolio',
      value: `${analyticsData.properties.occupancyRate.toFixed(1)}%`,
      subtitle: `${analyticsData.properties.total} total properties`,
      icon: Building,
      color: 'purple',
      trend: 8.3,
      active: selectedMetric === 'properties'
    },
    {
      id: 'bookings',
      title: 'Booking Performance',
      value: `${analyticsData.bookings.conversionRate.toFixed(1)}%`,
      subtitle: `${analyticsData.bookings.total} total bookings`,
      icon: Calendar,
      color: 'orange',
      trend: 15.2,
      active: selectedMetric === 'bookings'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const isPositiveTrend = card.trend > 0;
          
          return (
            <button
              key={card.id}
              onClick={() => setSelectedMetric(card.id as any)}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                card.active 
                  ? `border-${card.color}-500 bg-${card.color}-50` 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
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
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {metricCards.find(c => c.id === selectedMetric)?.title} Trends
            </h3>
            <p className="text-sm text-gray-600">Performance over time</p>
          </div>
          
          <div className="p-6">
            {/* Placeholder for chart - in real app, use a charting library */}
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Chart visualization would appear here</p>
                <p className="text-sm text-gray-500">Showing {selectedMetric} trends for {timeFilter}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
            <p className="text-sm text-gray-600">Best performing employees</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.employees.topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{performer.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>TSh {performer.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{performer.conversions}%</span>
                      </div>
                    </div>
                  </div>
                  {index < 3 && (
                    <Award className={`h-4 w-4 ${
                      index === 0 ? 'text-yellow-500' :
                      index === 1 ? 'text-gray-500' :
                      'text-orange-500'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Service Fee Revenue</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            TSh {analyticsData.revenue.serviceFees.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">Total platform revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Avg Response Time</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.bookings.avgResponseTime}h
          </p>
          <p className="text-sm text-gray-600">Employee response time</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Avg Property Views</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.properties.avgViews.toFixed(0)}
          </p>
          <p className="text-sm text-gray-600">Views per property</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-900">Pending Bookings</h4>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analyticsData.bookings.pending}
          </p>
          <p className="text-sm text-gray-600">Awaiting admin response</p>
        </div>

      </div>
    </div>
  );
};

export default BusinessAnalytics;