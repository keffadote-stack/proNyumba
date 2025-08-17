/**
 * PERFORMANCE DATA HOOK
 * 
 * Optimized hook for handling employee performance data with memoization
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../lib/supabase';

interface PerformanceRecord {
  admin_id: string;
  conversion_rate: number;
  average_response_time_hours: number;
  tenant_satisfaction_rating: number;
  revenue_generated: number;
  properties_managed: number;
  month_year: string;
}

export const usePerformanceData = (employeeIds: string[]) => {
  const [rawData, setRawData] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPerformanceData = useCallback(async () => {
    if (employeeIds.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      const { data: performance, error: dbError } = await db.employeePerformance.getAll();
      
      if (dbError) {
        setError(dbError.message);
        return;
      }

      const validPerformance = (performance || [])
        .filter((item: any) => 
          item && 
          typeof item === "object" && 
          item !== null &&
          "admin_id" in item &&
          employeeIds.includes(item.admin_id)
        )
        .map((perf: any) => ({
          admin_id: perf.admin_id,
          conversion_rate: perf.conversion_rate || 0,
          average_response_time_hours: perf.average_response_time_hours || 0,
          tenant_satisfaction_rating: perf.tenant_satisfaction_rating || 0,
          revenue_generated: perf.revenue_generated || 0,
          properties_managed: perf.properties_managed || 0,
          month_year: perf.month_year || new Date().toISOString().slice(0, 7)
        }));

      setRawData(validPerformance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setLoading(false);
    }
  }, [employeeIds]);

  useEffect(() => {
    loadPerformanceData();
  }, [loadPerformanceData]);

  // Memoized performance map for efficient lookups
  const performanceMap = useMemo(() => {
    const map: Record<string, PerformanceRecord[]> = {};
    
    rawData.forEach(perf => {
      if (!map[perf.admin_id]) {
        map[perf.admin_id] = [];
      }
      map[perf.admin_id].push(perf);
    });

    // Sort each employee's performance by month_year descending
    Object.keys(map).forEach(adminId => {
      map[adminId].sort((a, b) => 
        new Date(b.month_year).getTime() - new Date(a.month_year).getTime()
      );
    });

    return map;
  }, [rawData]);

  // Memoized KPI calculator
  const getEmployeeKPIs = useCallback((employeeId: string) => {
    const performances = performanceMap[employeeId] || [];
    
    if (performances.length === 0) {
      return {
        conversionRate: 0,
        responseTime: 0,
        satisfaction: 0,
        revenue: 0,
        propertiesManaged: 0,
      };
    }

    const latest = performances[0];
    return {
      conversionRate: latest.conversion_rate,
      responseTime: latest.average_response_time_hours,
      satisfaction: latest.tenant_satisfaction_rating,
      revenue: latest.revenue_generated,
      propertiesManaged: latest.properties_managed,
    };
  }, [performanceMap]);

  return {
    performanceData: rawData,
    performanceMap,
    getEmployeeKPIs,
    loading,
    error,
    refetch: loadPerformanceData
  };
};