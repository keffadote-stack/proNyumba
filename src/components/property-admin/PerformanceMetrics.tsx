/**
 * PERFORMANCE METRICS COMPONENT
 * 
 * Displays individual Property Admin KPIs and performance tracking:
 * - Monthly performance overview
 * - Key performance indicators (KPIs)
 * - Performance trends and charts
 * - Comparison with previous periods
 * - Goal tracking and achievements
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  Calendar,
  Home,
  Users,
  DollarSign,
  Clock,
  Star,
  BarChart3
} from 'lucide-react';

interface PerformanceData {
  id: string;
  month_year: string;
  properties_managed: number;
  bookings_received: number;
  bookings_approved: number;
  bookings_completed: number;
  conversion_rate: number;
  average_response_time_hours: number;
  tenant_satisfaction_rating: number;
  revenue_generated: number;
  occupancy_rate: number;
}

interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  description: string;
}

const PerformanceMetrics: React.FC = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<PerformanceData | null>(null);
  const [previousMonth, setPreviousMonth] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current');

  /**
   * Load performance data
   */
  const loadPerformanceData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await db.employeePerformance.getByAdmin(user.id);
      
      if (error) {
        console.error('Error loading performance data:', error);
        return;
      }

      const sortedData = (data || []).sort((a, b) => 
        new Date(b.month_year).getTime() - new Date(a.month_year).getTime()
      );

      setPerformanceData(sortedData);
      setCurrentMonth(sortedData[0] || null);
      setPreviousMonth(sortedData[1] || null);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, [user]);

  /**
   * Calculate percentage change
   */
  const calculateChange = (current: number, previous: number): { value: number; type: 'increase' | 'decrease' } => {
    if (!previous) return { value: 0, type: 'increase' };
    
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      type: change >= 0 ? 'increase' : 'decrease'
    };
  };

  /**
   * Get KPI cards data
   */
  const getKPICards = (): KPICard[] => {
    if (!currentMonth) return [];

    const conversionChange = previousMonth 
      ? calculateChange(currentMonth.conversion_rate, previousMonth.conversion_rate)
      : { value: 0, type: 'increase' as const };

    const revenueChange = previousMonth 
      ? calculateChange(currentMonth.revenue_generated, previousMonth.revenue_generated)
      : { value: 0, type: 'increase' as const };

    const responseTimeChange = previousMonth 
      ? calculateChange(currentMonth.average_response_time_hours, previousMonth.average_response_time_hours)
      : { value: 0, type: 'increase' as const };

    const satisfactionChange = previousMonth 
      ? calculateChange(currentMonth.tenant_satisfaction_rating, previousMonth.tenant_satisfaction_rating)
      : { value: 0, type: 'increase' as const };

    return [
      {
        title: 'Properties Managed',
        value: currentMonth.properties_managed,
        icon: <Home className="h-6 w-6" />,
        color: 'bg-blue-500',
        description: 'Total properties under your management'
      },
      {
        title: 'Conversion Rate',
        value: `${currentMonth.conversion_rate.toFixed(1)}%`,
        change: conversionChange.value,
        changeType: conversionChange.type,
        icon: <Target className="h-6 w-6" />,
        color: 'bg-green-500',
        description: 'Percentage of inquiries converted to bookings'
      },
      {
        title: 'Revenue Generated',
        value: `TSh ${currentMonth.revenue_generated.toLocaleString()}`,
        change: revenueChange.value,
        changeType: revenueChange.type,
        icon: <DollarSign className="h-6 w-6" />,
        color: 'bg-purple-500',
        description: 'Total revenue from completed bookings'
      },
      {
        title: 'Response Time',
        value: `${currentMonth.average_response_time_hours.toFixed(1)}h`,
        change: responseTimeChange.value,
        changeType: responseTimeChange.type === 'increase' ? 'decrease' : 'increase', // Lower is better
        icon: <Clock className="h-6 w-6" />,
        color: 'bg-orange-500',
        description: 'Average time to respond to inquiries'
      },
      {
        title: 'Tenant Satisfaction',
        value: `${currentMonth.tenant_satisfaction_rating.toFixed(1)}/5`,
        change: satisfactionChange.value,
        changeType: satisfactionChange.type,
        icon: <Star className="h-6 w-6" />,
        color: 'bg-yellow-500',
        description: 'Average rating from tenant feedback'
      },
      {
        title: 'Occupancy Rate',
        value: `${currentMonth.occupancy_rate.toFixed(1)}%`,
        icon: <Users className="h-6 w-6" />,
        color: 'bg-indigo-500',
        description: 'Percentage of properties currently occupied'
      }
    ];
  };

  /**
   * Get performance level based on conversion rate
   */
  const getPerformanceLevel = (conversionRate: number): { level: string; color: string; description: string } => {
    if (conversionRate >= 80) {
      return { level: 'Excellent', color: 'text-green-600', description: 'Outstanding performance!' };
    } else if (conversionRate >= 60) {
      return { level: 'Good', color: 'text-blue-600', description: 'Above average performance' };
    } else if (conversionRate >= 40) {
      return { level: 'Average', color: 'text-yellow-600', description: 'Meeting expectations' };
    } else {
      return { level: 'Needs Improvement', color: 'text-red-600', description: 'Focus on improving conversion' };
    }
  };

  /**
   * Format month year for display
   */
  const formatMonthYear = (monthYear: string): string => {
    const date = new Date(monthYear);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentMonth) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
        <p className="text-gray-600 mb-6">
          Performance metrics will appear here once you start managing properties and handling bookings.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How Performance is Tracked</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Conversion rate: Approved bookings ÷ Total inquiries</li>
            <li>• Response time: Average time to respond to tenant inquiries</li>
            <li>• Revenue: Total service fees from completed bookings</li>
            <li>• Satisfaction: Average rating from tenant feedback</li>
          </ul>
        </div>
      </div>
    );
  }

  const kpiCards = getKPICards();
  const performanceLevel = getPerformanceLevel(currentMonth.conversion_rate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
          <p className="text-gray-600">Track your KPIs and performance trends</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current">Current Month</option>
            <option value="last3">Last 3 Months</option>
            <option value="last6">Last 6 Months</option>
          </select>
        </div>
      </div>

      {/* Current Period Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {formatMonthYear(currentMonth.month_year)} Overview
          </h3>
          <div className="flex items-center space-x-2">
            <Award className={`h-5 w-5 ${performanceLevel.color}`} />
            <span className={`text-sm font-medium ${performanceLevel.color}`}>
              {performanceLevel.level}
            </span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{performanceLevel.description}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${kpi.color} text-white`}>
                  {kpi.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                </div>
              </div>
              {kpi.change !== undefined && (
                <div className={`flex items-center ${
                  kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">{kpi.change.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Inquiries</span>
              <span className="text-sm font-medium text-gray-900">{currentMonth.bookings_received}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved Bookings</span>
              <span className="text-sm font-medium text-gray-900">{currentMonth.bookings_approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed Bookings</span>
              <span className="text-sm font-medium text-gray-900">{currentMonth.bookings_completed}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium text-gray-900">Conversion Rate</span>
              <span className="text-sm font-bold text-blue-600">{currentMonth.conversion_rate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          {performanceData.length > 1 ? (
            <div className="space-y-4">
              {performanceData.slice(0, 3).map((data, index) => (
                <div key={data.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatMonthYear(data.month_year)}
                    </span>
                    {index === 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {data.conversion_rate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      TSh {data.revenue_generated.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">More data will appear as you complete more months</p>
            </div>
          )}
        </div>
      </div>

      {/* Goals and Achievements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals & Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversion Rate Goal */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${Math.min(currentMonth.conversion_rate, 100)}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">
                  {currentMonth.conversion_rate.toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Conversion Goal</p>
            <p className="text-xs text-gray-500">Target: 70%</p>
          </div>

          {/* Response Time Goal */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-green-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${Math.max(0, 100 - (currentMonth.average_response_time_hours / 24) * 100)}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">
                  {currentMonth.average_response_time_hours.toFixed(1)}h
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Response Time</p>
            <p className="text-xs text-gray-500">Target: &lt;2h</p>
          </div>

          {/* Satisfaction Goal */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-yellow-500"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${(currentMonth.tenant_satisfaction_rating / 5) * 100}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-900">
                  {currentMonth.tenant_satisfaction_rating.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-900">Satisfaction</p>
            <p className="text-xs text-gray-500">Target: 4.5/5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;