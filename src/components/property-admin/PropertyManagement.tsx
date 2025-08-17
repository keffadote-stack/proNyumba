/**
 * PROPERTY MANAGEMENT COMPONENT
 * 
 * Property Admin interface for managing assigned properties.
 * Handles property creation, editing, and management.
 * 
 * KEY FEATURES:
 * - View assigned properties
 * - Create new property listings
 * - Edit existing properties
 * - Property status management
 * - Image upload and management
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import PropertyForm from './PropertyForm';
import ImageGallery from '../shared/ImageGallery';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: 'house' | 'apartment' | 'room' | 'studio';
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  service_fee_amount: number;
  total_amount: number;
  city: string;
  area: string;
  is_available: boolean;
  views_count: number;
  inquiries_count: number;
  bookings_count: number;
  images: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
}

interface PropertyManagementProps {
  onStatsUpdate?: () => void;
}

const PropertyManagement: React.FC<PropertyManagementProps> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Load properties assigned to this admin
  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await db.properties.getByAdmin(user.id);
      
      if (error) {
        console.error('Error loading properties:', error);
      } else {
        setProperties(data || []);
        onStatsUpdate?.();
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle property form submission
   */
  const handlePropertySubmit = async (propertyData: any) => {
    try {
      if (editingProperty) {
        // Update existing property
        const { error } = await db.properties.update(editingProperty.id, propertyData);
        if (error) throw error;
      } else {
        // Create new property
        const { error } = await db.properties.create({
          ...propertyData,
          assigned_admin_id: user!.id
        });
        if (error) throw error;
      }

      // Reload properties
      await loadProperties();
      
      // Close form
      setShowForm(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  /**
   * Handle edit property
   */
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  };

  /**
   * Filter properties based on search and status
   */
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && property.is_available) ||
                         (filterStatus === 'unavailable' && !property.is_available);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
          <p className="text-gray-600">Manage your assigned properties</p>
        </div>
        <button
          onClick={() => {
            setEditingProperty(null);
            setShowForm(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'rented')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Properties</option>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'No properties match your search criteria.' 
              : 'You haven\'t added any properties yet. Start by creating your first property listing.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => {
                setEditingProperty(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MapPin className="h-6 w-6 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    property.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {property.is_available ? 'Available' : 'Rented'}
                  </span>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex space-x-1">
                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleEditProperty(property)}
                    className="p-1.5 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.area}, {property.city}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      TSh {property.rent_amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      +TSh {property.service_fee_amount.toLocaleString()} fee
                    </div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      <span>{property.views_count} views</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{property.inquiries_count} inquiries</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(property.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Form Modal */}
      {showForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handlePropertySubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
        />
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProperty.title}</h3>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Property Images */}
              {selectedProperty.images.length > 0 && (
                <div className="mb-6">
                  <ImageGallery images={selectedProperty.images} />
                </div>
              )}

              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Property Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedProperty.property_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium">{selectedProperty.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">{selectedProperty.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedProperty.area}, {selectedProperty.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${selectedProperty.is_available ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedProperty.is_available ? 'Available' : 'Rented'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Pricing & Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-medium">TSh {selectedProperty.rent_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee (20%):</span>
                      <span className="font-medium">TSh {selectedProperty.service_fee_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg">TSh {selectedProperty.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{selectedProperty.views_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inquiries:</span>
                      <span className="font-medium">{selectedProperty.inquiries_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings:</span>
                      <span className="font-medium">{selectedProperty.bookings_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                <p className="text-gray-600 leading-relaxed">{selectedProperty.description}</p>
              </div>

              {/* Amenities */}
              {selectedProperty.amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    handleEditProperty(selectedProperty);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Edit Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;