/**
 * EMPLOYEE MANAGEMENT COMPONENT - REFACTORED
 *
 * Refactored Super Admin interface for managing Property Admin employees.
 * Now uses smaller, focused components for better maintainability.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { employeeService } from "../../../services/employeeService";
import { db } from "../../../lib/supabase";
import { notifications } from "../../../lib/notifications";
import EmployeePerformanceTracker from "../EmployeePerformanceTracker";
import EmployeeStats from "./EmployeeStats";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeList from "./EmployeeList";
import InviteEmployeeModal from "./InviteEmployeeModal";
import ErrorBoundary from "../../ErrorBoundary";
import {
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  user_role: "super_admin" | "property_admin" | "tenant";
  avatar_url: string | null;
  employee_id: string | null;
  hired_date: string | null;
  performance_rating: number | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

const EmployeeManagement: React.FC = React.memo(() => {
  const { profile, inviteEmployee, activateEmployee, deactivateEmployee } = useAuth();
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [currentView, setCurrentView] = useState<"list" | "performance">("list");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Performance data state
  const [performanceData, setPerformanceData] = useState<Record<string, any[]>>({});

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Debounce search term to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, []);

  // Load performance data when employees change
  useEffect(() => {
    if (employees.length > 0) {
      loadPerformanceData();
    }
  }, [employees]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await employeeService.getEmployees();

      if (dbError) {
        console.error("Error loading employees:", dbError);
        setError("Failed to load employees. Please try again.");
        setEmployees([]);
      } else {
        const employeeData: Employee[] = (data || []).map((user: any) => ({
          id: user.id as string,
          full_name: user.full_name as string,
          email: user.email as string,
          phone_number: user.phone_number as string | null,
          user_role: user.user_role as "super_admin" | "property_admin" | "tenant",
          avatar_url: user.avatar_url as string | null,
          employee_id: (user.employee_id as string) || null,
          hired_date: (user.hired_date as string) || null,
          performance_rating: (user.performance_rating as number) || null,
          is_active: (user.is_active as boolean) ?? true,
          is_verified: (user.is_verified as boolean) ?? false,
          created_at: user.created_at as string,
          updated_at: user.updated_at as string,
        }));
        setEmployees(employeeData);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      setError("Failed to load employees. Please check your connection and try again.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceData = useCallback(async () => {
    try {
      const { data: performance } = await db.employeePerformance.getAll();
      const performanceMap: Record<string, any[]> = {};

      const validPerformance = (performance || []).filter(
        (item: any) =>
          item &&
          typeof item === "object" &&
          item !== null &&
          "admin_id" in item &&
          "conversion_rate" in item
      );

      validPerformance.forEach((perf: any) => {
        const adminId = perf.admin_id as string;
        if (!performanceMap[adminId]) {
          performanceMap[adminId] = [];
        }
        performanceMap[adminId].push({
          admin_id: adminId,
          conversion_rate: perf.conversion_rate || 0,
          average_response_time_hours: perf.average_response_time_hours || 0,
          tenant_satisfaction_rating: perf.tenant_satisfaction_rating || 0,
          revenue_generated: perf.revenue_generated || 0,
          properties_managed: perf.properties_managed || 0,
        });
      });

      setPerformanceData(performanceMap);
    } catch (error) {
      console.error("Error loading performance data:", error);
    }
  }, []);

  // Get employee KPIs
  const getEmployeeKPIs = useCallback((employeeId: string) => {
    const performances = performanceData[employeeId] || [];
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
      conversionRate: latest.conversion_rate || 0,
      responseTime: latest.average_response_time_hours || 0,
      satisfaction: latest.tenant_satisfaction_rating || 0,
      revenue: latest.revenue_generated || 0,
      propertiesManaged: latest.properties_managed || 0,
    };
  }, [performanceData]);

  // Filter employees with memoization
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.full_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (employee.employee_id &&
          employee.employee_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && employee.is_active) ||
        (filterStatus === "inactive" && !employee.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [employees, debouncedSearchTerm, filterStatus]);

  // Handle employee invitation
  const handleInviteEmployee = async (inviteData: { email: string; fullName: string }) => {
    setInviting(true);

    try {
      const { error } = await inviteEmployee(inviteData.email, inviteData.fullName);

      if (error) {
        console.error("Error inviting employee:", error);
        setError("Failed to invite employee. Please try again.");
      } else {
        try {
          const emailResult = await notifications.sendEmployeeInvitation(
            inviteData.email,
            inviteData.fullName,
            profile?.full_name || "Super Admin"
          );

          if (emailResult.success) {
            setSuccess("Employee invitation sent successfully! They will receive an email with login instructions.");
          } else {
            setSuccess("Employee account created, but email notification failed. Please contact the employee directly.");
          }
        } catch (emailError) {
          console.error("Email notification error:", emailError);
          setSuccess("Employee account created, but email notification failed. Please contact the employee directly.");
        }

        setShowInviteModal(false);
        loadEmployees();
      }
    } catch (error) {
      console.error("Error inviting employee:", error);
      setError("Failed to invite employee. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  // Handle employee activation
  const handleActivateEmployee = async (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    const employeeIdInput = prompt("Enter Employee ID:");
    if (!employeeIdInput) return;

    try {
      const { error } = await activateEmployee(employeeId, {
        employeeId: employeeIdInput,
        hiredDate: new Date().toISOString(),
      });

      if (error) {
        console.error("Error activating employee:", error);
        setError("Failed to activate employee. Please try again.");
      } else {
        setSuccess("Employee activated successfully!");
        loadEmployees();
      }
    } catch (error) {
      console.error("Error activating employee:", error);
      setError("Failed to activate employee. Please try again.");
    }
  };

  // Handle employee deactivation
  const handleDeactivateEmployee = async (employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    if (!confirm(`Are you sure you want to deactivate ${employee.full_name}?`))
      return;

    try {
      const { error } = await deactivateEmployee(employeeId);

      if (error) {
        console.error("Error deactivating employee:", error);
        setError("Failed to deactivate employee. Please try again.");
      } else {
        setSuccess("Employee deactivated successfully!");
        loadEmployees();
      }
    } catch (error) {
      console.error("Error deactivating employee:", error);
      setError("Failed to deactivate employee. Please try again.");
    }
  };

  if (!profile || profile.user_role !== "super_admin") {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">
          Only Super Admins can access employee management.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600">Failed to load employee management. Please refresh the page.</p>
      </div>
    }>
      <div className="p-6">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-red-600 hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-700">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="text-xs text-green-600 hover:text-green-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Employee Management
            </h1>
            <p className="text-gray-600">
              Manage Property Admin employees and their performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView("list")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Employee List
              </button>
              <button
                onClick={() => setCurrentView("performance")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "performance"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Performance Tracker
              </button>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Invite Employee</span>
            </button>
          </div>
        </div>

        {/* Render Current View */}
        {currentView === "performance" ? (
          <EmployeePerformanceTracker />
        ) : (
          <>
            {/* Stats Cards */}
            <EmployeeStats employees={employees} />

            {/* Search and Filter */}
            <EmployeeFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />

            {/* Employee List */}
            <EmployeeList
              employees={filteredEmployees}
              loading={loading}
              getEmployeeKPIs={getEmployeeKPIs}
              onActivateEmployee={handleActivateEmployee}
              onDeactivateEmployee={handleDeactivateEmployee}
            />
          </>
        )}

        {/* Invite Employee Modal */}
        <InviteEmployeeModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteEmployee}
          loading={inviting}
        />
      </div>
    </ErrorBoundary>
  );
});

EmployeeManagement.displayName = 'EmployeeManagement';

export default EmployeeManagement;