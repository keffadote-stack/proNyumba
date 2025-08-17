/**
 * PROPERTY ASSIGNMENT COMPONENT
 * 
 * Interface for Super Admins to assign properties to Property Admin employees.
 * Manages property-admin relationships and workload distribution.
 * 
 * KEY FEATURES:
 * - View all properties and their assignments
 * - Assign/reassign properties to admins
 * - Bulk property assignment
 * - Admin workload visualization
 * - Property performance tracking
 * - Assignment history
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../lib/supabase';
import { notifications } from '../../lib/notifications';
import { 
  Building, 
  Users, 
  Search, 
  Filter, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  DollarSign,
  User,
  Plus,
  Minus,
  BarChart3,
  Settings
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  city: string;
  area: string;
  rent_amount: number;
  service_fee_amount: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  is_available: boolean;
  views_count: number;
  inquiries_count: number;
  bookings_count: number;
  assigned_admin_id: string;
  created_at: string;
  users?: {
    full_name: string;
    employee_id: string;
    is_active: boolean;
  };
}

interface Employee {
  id: string;
  full_name: string;
  employee_id: string | null;
  is_active: boolean;
  performance_rating: number | null;
  propertyCount?: number;
}

const PropertyAssignment: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdmin, setFilterAdmin] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'rented'>('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [assignmentMode, setAssignmentMode] = useState<'single' | 'bulk'>('single');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load properties with admin info
      const { data: propertiesData, error: propertiesError } = await db.properties.getAll();
      if (propertiesError) {
        console.error('Error loading properties:', propertiesError);
      } else {
        setProperties(propertiesData || []);
      }

      // Load employees
      const { data: employeesData, error: employeesError } = await db.users.getEmployees();
      if (employeesError) {
        console.error('Error loading employees:', employeesError);
      } else {
        // Calculate property count for each employee
        const employeesWithCounts = (employeesData || []).map((emp: any) => ({
          ...emp,
          propertyCount: propertiesData?.filter((p: any) => p.assigned_admin_id === emp.id).length || 0
        }));
        setEmployees(employeesWithCounts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAdmin = filterAdmin === 'all' || 
                        (filterAdmin === 'unassigned' && !property.assigned_admin_id) ||
                        property.assigned_admin_id === filterAdmin;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && property.is_available) ||
                         (filterStatus === 'rented' && !property.is_available);
    
    return matchesSearch && matchesAdmin && matchesStatus;
  });

  // Handle property assignment
  const handleAssignProperty = async (propertyId: string, adminId: string) => {
    try {
      const { error } = await db.properties.update(propertyId, {
        assigned_admin_id: adminId
      });

      if (error) {
        console.error('Error assigning property:', error);
        alert('Failed to assign property. Please try again.');
      } else {
        // Send notification to the assigned admin
        const property = properties.find(p => p.id === propertyId);
        if (property) {
          await notifications.sendPropertyAssignment(adminId, {
            title: property.title,
            city: property.city,
            area: property.area,
            rentAmount: property.rent_amount
          });
        }

        alert('Property assigned successfully! The admin has been notified.');
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error assigning property:', error);
      alert('Failed to assign property. Please try again.');
    }
  };

  // Handle bulk assignment
  const handleBulkAssignment = async () => {
    if (!selectedAdmin || selectedProperties.length === 0) {
      alert('Please select an admin and at least one property.');
      return;
    }

    try {
      const promises = selectedProperties.map(propertyId =>
        db.properties.update(propertyId, { assigned_admin_id: selectedAdmin })
      );

      await Promise.all(promises);
      
      // Send bulk notification to the assigned admin
      const assignedProperties = properties.filter(p => selectedProperties.includes(p.id));
      const propertyTitles = assignedProperties.map(p => p.title).join(', ');
      
      await notifications.sendPropertyAssignment(selectedAdmin, {
        title: `${selectedProperties.length} Properties`,
        description: `You have been assigned ${selectedProperties.length} properties: ${propertyTitles}`,
        count: selectedProperties.length
      });
      
      alert(`Successfully assigned ${selectedProperties.length} properties! The admin has been notified.`);
      setSelectedProperties([]);
      setShowAssignModal(false);
      loadData();
    } catch (error) {
      console.error('Error with bulk assignment:', error);
      alert('Failed to assign properties. Please try again.');
    }
  };

  // Handle property selection
  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Get admin name
  const getAdminName = (adminId: string) => {
    const admin = employees.find(e => e.id === adminId);
    return admin ? `${admin.full_name} (${admin.employee_id})` : 'Unassigned';
  };

  // Get admin workload color
  const getWorkloadColor = (count: number) => {
    if (count === 0) return 'text-gray-500';
    if (count <= 5) return 'text-green-600';
    if (count <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Assignment</h2>
          <p className="text-gray-600">Assign properties to Property Admin employees</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setAssignmentMode('bulk');
              setShowAssignModal(true);
            }}
            disabled={selectedProperties.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>Bulk Assign ({selectedProperties.length})</span>
          </button>
        </div>
      </div>

      {/* Admin Workload Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Admin Workload Overview</h3>
          <p className="text-sm text-gray-600">Current property assignments per admin</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.full_name}
                    </p>
                    <p className="text-xs text-gray-500">ID: {employee.employee_id}</p>
                  </div>
                  <div className={`text-right ${employee.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Properties</span>
                  <span className={`text-lg font-bold ${getWorkloadColor(employee.propertyCount || 0)}`}>
                    {employee.propertyCount || 0}
                  </span>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Rating</span>
                  <span className="text-yellow-600">
                    ★ {employee.performance_rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterAdmin}
                onChange={(e) => setFilterAdmin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Admins</option>
                <option value="unassigned">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.propertyCount || 0})
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Properties</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>

        {/* Properties List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading properties...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No properties found</p>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div key={property.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property.id)}
                    onChange={() => handlePropertySelect(property.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {property.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.is_available ? 'Available' : 'Rented'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{property.city}, {property.area}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>TSh {property.rent_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{property.views_count} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{property.inquiries_count} inquiries</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Assigned to:</span>
                        <span className={`text-sm font-medium ${
                          property.assigned_admin_id ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {getAdminName(property.assigned_admin_id)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            setAssignmentMode('single');
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          {property.assigned_admin_id ? 'Reassign' : 'Assign'}
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                          <Settings className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {assignmentMode === 'bulk' 
                  ? `Assign ${selectedProperties.length} Properties` 
                  : `Assign Property: ${selectedProperty?.title}`
                }
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Property Admin
                  </label>
                  <select
                    value={selectedAdmin}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose an admin...</option>
                    {employees.filter(emp => emp.is_active).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id}) - {emp.propertyCount || 0} properties
                      </option>
                    ))}
                  </select>
                </div>
                
                {assignmentMode === 'bulk' && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      You are about to assign {selectedProperties.length} properties to the selected admin.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedProperty(null);
                    setSelectedAdmin('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (assignmentMode === 'bulk') {
                      handleBulkAssignment();
                    } else if (selectedProperty) {
                      handleAssignProperty(selectedProperty.id, selectedAdmin);
                      setShowAssignModal(false);
                      setSelectedProperty(null);
                      setSelectedAdmin('');
                    }
                  }}
                  disabled={!selectedAdmin}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyAssignment;