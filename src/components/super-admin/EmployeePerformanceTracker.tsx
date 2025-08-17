/**
 * EMPLOYEE PERFORMANCE TRACKER COMPONENT
 *
 * Advanced performance tracking and analytics for Property Admin employees.
 * Provides detailed KPIs, rankings, and performance insights.
 *
 * KEY FEATURES:
 * - Individual employee performance dashboards
 * - Performance rankings and comparisons
 * - KPI tracking (conversion rates, response times, satisfaction)
 * - Performance trends and analytics
 * - Goal setting and achievement tracking
 * - Performance improvement recommendations
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "../../lib/supabase";
import {
  Star,
  Clock,
  Target,
  Award,
  Users,
  BarChart3,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Medal,
  Trophy,
} from "lucide-react";

interface EmployeePerformance {
  id: string;
  admin_id: string;
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
  created_at: string;
  users?: {
    full_name: string;
    employee_id: string;
    is_active: boolean;
  };
}

interface EmployeeKPIs {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  isActive: boolean;
  currentMonth: {
    propertiesManaged: number;
    bookingsReceived: number;
    conversionRate: number;
    responseTime: number;
    satisfaction: number;
    revenue: number;
    occupancyRate: number;
  };
  previousMonth: {
    conversionRate: number;
    responseTime: number;
    satisfaction: number;
    revenue: number;
  };
  trends: {
    conversionTrend: number;
    responseTrend: number;
    satisfactionTrend: number;
    revenueTrend: number;
  };
  rank: number;
  totalScore: number;
}

type TimeFilter = "1m" | "3m" | "6m" | "1y";
type SortBy = "rank" | "conversion" | "response" | "satisfaction" | "revenue";

const EmployeePerformanceTracker: React.FC = React.memo(() => {
  const [, setPerformanceData] = useState<EmployeePerformance[]>(
    []
  );
  const [employeeKPIs, setEmployeeKPIs] = useState<EmployeeKPIs[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("3m");
  const [sortBy, setSortBy] = useState<SortBy>("rank");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Load performance data
  const loadPerformanceData = useCallback(async () => {
    try {
      setLoading(true);

      // Load all employee performance data
      const { data: performanceDataResult, error } =
        await db.employeePerformance.getAll();

      if (error) {
        console.error("Error loading performance data:", error);
        return;
      }

      // Filter and convert the data to match our EmployeePerformance interface
      const validPerformanceData: EmployeePerformance[] = (performanceDataResult || [])
        .filter((item: unknown) => 
          item && 
          typeof item === 'object' && 
          item !== null &&
          'admin_id' in item
        )
        .map((item: Record<string, unknown>) => ({
          id: item.id as string,
          admin_id: item.admin_id as string,
          month_year: (item.month_year as string) || new Date().toISOString().slice(0, 7),
          properties_managed: (item.properties_managed as number) || 0,
          bookings_received: (item.bookings_received as number) || 0,
          bookings_approved: (item.bookings_approved as number) || 0,
          bookings_completed: (item.bookings_completed as number) || 0,
          conversion_rate: (item.conversion_rate as number) || 0,
          average_response_time_hours: (item.average_response_time_hours as number) || 0,
          tenant_satisfaction_rating: (item.tenant_satisfaction_rating as number) || 0,
          revenue_generated: (item.revenue_generated as number) || 0,
          occupancy_rate: (item.occupancy_rate as number) || 0,
          created_at: item.created_at as string,
          users: item.users ? {
            full_name: ((item.users as Record<string, unknown>).full_name as string) || 'Unknown Employee',
            employee_id: ((item.users as Record<string, unknown>).employee_id as string) || 'N/A',
            is_active: ((item.users as Record<string, unknown>).is_active as boolean) ?? true
          } : {
            full_name: 'Unknown Employee',
            employee_id: 'N/A',
            is_active: true
          }
        }));

      setPerformanceData(validPerformanceData);

      // Process KPIs
      const kpis = processEmployeeKPIs(validPerformanceData);
      setEmployeeKPIs(kpis);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData, timeFilter]);

  // Process employee KPIs and rankings
  const processEmployeeKPIs = (data: EmployeePerformance[]): EmployeeKPIs[] => {
    const employeeMap = new Map<string, EmployeePerformance[]>();

    // Group performance data by employee
    data.forEach((perf) => {
      if (!employeeMap.has(perf.admin_id)) {
        employeeMap.set(perf.admin_id, []);
      }
      employeeMap.get(perf.admin_id)!.push(perf);
    });

    const kpis: EmployeeKPIs[] = [];

    employeeMap.forEach((performances, employeeId) => {
      // Sort by month_year descending
      performances.sort(
        (a, b) =>
          new Date(b.month_year).getTime() - new Date(a.month_year).getTime()
      );

      const currentMonth = performances[0];
      const previousMonth = performances[1];

      if (!currentMonth?.users) return;

      // Calculate trends
      const conversionTrend = previousMonth
        ? ((currentMonth.conversion_rate - previousMonth.conversion_rate) /
            previousMonth.conversion_rate) *
          100
        : 0;

      const responseTrend = previousMonth
        ? ((previousMonth.average_response_time_hours -
            currentMonth.average_response_time_hours) /
            previousMonth.average_response_time_hours) *
          100
        : 0;

      const satisfactionTrend = previousMonth
        ? ((currentMonth.tenant_satisfaction_rating -
            previousMonth.tenant_satisfaction_rating) /
            previousMonth.tenant_satisfaction_rating) *
          100
        : 0;

      const revenueTrend = previousMonth
        ? ((currentMonth.revenue_generated - previousMonth.revenue_generated) /
            previousMonth.revenue_generated) *
          100
        : 0;

      // Calculate total performance score (weighted)
      const totalScore =
        currentMonth.conversion_rate * 0.3 +
        Math.max(0, 10 - currentMonth.average_response_time_hours) * 0.2 +
        currentMonth.tenant_satisfaction_rating * 0.25 +
        currentMonth.occupancy_rate * 0.25;

      kpis.push({
        employeeId,
        employeeName: currentMonth.users.full_name,
        employeeCode: currentMonth.users.employee_id,
        isActive: currentMonth.users.is_active,
        currentMonth: {
          propertiesManaged: currentMonth.properties_managed,
          bookingsReceived: currentMonth.bookings_received,
          conversionRate: currentMonth.conversion_rate,
          responseTime: currentMonth.average_response_time_hours,
          satisfaction: currentMonth.tenant_satisfaction_rating,
          revenue: currentMonth.revenue_generated,
          occupancyRate: currentMonth.occupancy_rate,
        },
        previousMonth: {
          conversionRate: previousMonth?.conversion_rate || 0,
          responseTime: previousMonth?.average_response_time_hours || 0,
          satisfaction: previousMonth?.tenant_satisfaction_rating || 0,
          revenue: previousMonth?.revenue_generated || 0,
        },
        trends: {
          conversionTrend,
          responseTrend,
          satisfactionTrend,
          revenueTrend,
        },
        rank: 0, // Will be set after sorting
        totalScore,
      });
    });

    // Sort by total score and assign ranks
    kpis.sort((a, b) => b.totalScore - a.totalScore);
    kpis.forEach((kpi, index) => {
      kpi.rank = index + 1;
    });

    return kpis;
  };

  // Sort employees with memoization
  const sortedEmployees = useMemo(() => {
    return [...employeeKPIs].sort((a, b) => {
      switch (sortBy) {
        case "rank":
          return a.rank - b.rank;
        case "conversion":
          return b.currentMonth.conversionRate - a.currentMonth.conversionRate;
        case "response":
          return a.currentMonth.responseTime - b.currentMonth.responseTime;
        case "satisfaction":
          return b.currentMonth.satisfaction - a.currentMonth.satisfaction;
        case "revenue":
          return b.currentMonth.revenue - a.currentMonth.revenue;
        default:
          return a.rank - b.rank;
      }
    });
  }, [employeeKPIs, sortBy]);

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="h-5 w-5 text-orange-500" />;
    }
    return <span className="text-sm font-medium text-gray-600">#{rank}</span>;
  };

  // Get trend indicator
  const getTrendIndicator = (trend: number) => {
    if (trend > 5) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    } else if (trend < -5) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4" />; // Empty space
  };

  // Export performance data
  const exportData = () => {
    const dataToExport = {
      generatedAt: new Date().toISOString(),
      timeFilter,
      employees: sortedEmployees,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employee-performance-${timeFilter}-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Employee Performance Tracker
          </h2>
          <p className="text-gray-600">
            Track and analyze employee performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Active Employees</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {employeeKPIs.filter((e) => e.isActive).length}
          </p>
          <p className="text-sm text-gray-600">Total: {employeeKPIs.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Avg Conversion</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {employeeKPIs.length > 0
              ? (
                  employeeKPIs.reduce(
                    (sum, e) => sum + e.currentMonth.conversionRate,
                    0
                  ) / employeeKPIs.length
                ).toFixed(1)
              : "0"}
            %
          </p>
          <p className="text-sm text-gray-600">Booking conversion rate</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Avg Response</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {employeeKPIs.length > 0
              ? (
                  employeeKPIs.reduce(
                    (sum, e) => sum + e.currentMonth.responseTime,
                    0
                  ) / employeeKPIs.length
                ).toFixed(1)
              : "0"}
            h
          </p>
          <p className="text-sm text-gray-600">Response time</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900">Avg Satisfaction</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {employeeKPIs.length > 0
              ? (
                  employeeKPIs.reduce(
                    (sum, e) => sum + e.currentMonth.satisfaction,
                    0
                  ) / employeeKPIs.length
                ).toFixed(1)
              : "0"}
          </p>
          <p className="text-sm text-gray-600">Tenant satisfaction</p>
        </div>
      </div>

      {/* Employee Performance Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Employee Rankings
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rank">Overall Rank</option>
                <option value="conversion">Conversion Rate</option>
                <option value="response">Response Time</option>
                <option value="satisfaction">Satisfaction</option>
                <option value="revenue">Revenue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : sortedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No performance data available
                    </p>
                  </td>
                </tr>
              ) : (
                sortedEmployees.map((employee) => (
                  <tr
                    key={employee.employeeId}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedEmployee === employee.employeeId
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedEmployee(
                        selectedEmployee === employee.employeeId
                          ? null
                          : employee.employeeId
                      )
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getRankBadge(employee.rank)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {employee.employeeCode}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.currentMonth.propertiesManaged}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {employee.currentMonth.conversionRate.toFixed(1)}%
                        </span>
                        {getTrendIndicator(employee.trends.conversionTrend)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {employee.currentMonth.responseTime.toFixed(1)}h
                        </span>
                        {getTrendIndicator(employee.trends.responseTrend)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {employee.currentMonth.satisfaction.toFixed(1)}
                        </span>
                        {getTrendIndicator(employee.trends.satisfactionTrend)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      TSh {employee.currentMonth.revenue.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (employee.totalScore / 10) * 100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {employee.totalScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

EmployeePerformanceTracker.displayName = 'EmployeePerformanceTracker';

export default EmployeePerformanceTracker;
