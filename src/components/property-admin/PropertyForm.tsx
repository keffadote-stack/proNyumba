/**
 * PROPERTY FORM COMPONENT
 * 
 * Form for creating and editing property listings with comprehensive fields:
 * - Basic property information
 * - Location details
 * - Pricing with automatic service fee calculation
 * - Property features and amenities
 * - Image upload and management
 * - Contact preferences
 */

import React, { useState, useEffect } from 'react';
import ImageUpload from '../shared/ImageUpload';
import { X, DollarSign, MapPin, Home, Settings } from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  property_type: 'house' | 'apartment' | 'room' | 'studio';
  bedrooms: number;
  bathrooms: number;
  square_footage: number | null;
  rent_amount: number;
  city: string;
  area: string;
  full_address: string;
  contact_preferences: {
    whatsapp: boolean;
    phone: boolean;
    email: boolean;
  };
  utilities: {
    water: boolean;
    electricity: boolean;
    internet: boolean;
    gas: boolean;
    cable: boolean;
  };
  images: string[];
  amenities: string[];
  pet_policy: string;
  parking_available: boolean;
  is_available: boolean;
}

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: 'house' | 'apartment' | 'room' | 'studio';
  bedrooms: number;
  bathrooms: number;
  square_footage: number | null;
  rent_amount: number;
  city: string;
  area: string;
  full_address: string | null;
  contact_preferences: any;
  utilities: any;
  images: string[];
  amenities: string[];
  pet_policy: string | null;
  parking_available: boolean;
  is_available: boolean;
}

interface PropertyFormProps {
  property?: Property | null;
  onSubmit: (data: PropertyFormData) => Promise<void>;
  onCancel: () => void;
}

const COMMON_AMENITIES = [
  'Air Conditioning',
  'Balcony',
  'Furnished',
  'Garden',
  'Gym',
  'Laundry',
  'Pool',
  'Security',
  'Storage',
  'Terrace'
];

const CITIES = [
  'Dar es Salaam',
  'Arusha',
  'Mwanza',
  'Dodoma',
  'Mbeya',
  'Morogoro',
  'Tanga',
  'Tabora',
  'Kigoma',
  'Mtwara'
];

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    square_footage: null,
    rent_amount: 0,
    city: 'Dar es Salaam',
    area: '',
    full_address: '',
    contact_preferences: {
      whatsapp: true,
      phone: true,
      email: false
    },
    utilities: {
      water: false,
      electricity: false,
      internet: false,
      gas: false,
      cable: false
    },
    images: [],
    amenities: [],
    pet_policy: 'not_allowed',
    parking_available: false,
    is_available: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with property data if editing
  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        property_type: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_footage: property.square_footage,
        rent_amount: property.rent_amount,
        city: property.city,
        area: property.area,
        full_address: property.full_address || '',
        contact_preferences: property.contact_preferences || {
          whatsapp: true,
          phone: true,
          email: false
        },
        utilities: property.utilities || {
          water: false,
          electricity: false,
          internet: false,
          gas: false,
          cable: false
        },
        images: property.images || [],
        amenities: property.amenities || [],
        pet_policy: property.pet_policy || 'not_allowed',
        parking_available: property.parking_available,
        is_available: property.is_available
      });
    }
  }, [property]);

  /**
   * Calculate service fee (20% of rent)
   */
  const serviceFee = formData.rent_amount * 0.2;
  const totalAmount = formData.rent_amount + serviceFee;

  /**
   * Handle form field changes
   */
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Handle nested object changes (utilities, contact_preferences)
   */
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof PropertyFormData],
        [field]: value
      }
    }));
  };

  /**
   * Handle amenities selection
   */
  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Property description is required';
    }

    if (formData.rent_amount <= 0) {
      newErrors.rent_amount = 'Rent amount must be greater than 0';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area/neighborhood is required';
    }

    if (formData.bedrooms < 0) {
      newErrors.bedrooms = 'Bedrooms cannot be negative';
    }

    if (formData.bathrooms < 0) {
      newErrors.bathrooms = 'Bathrooms cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              {property ? 'Edit Property' : 'Add New Property'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Modern 2BR Apartment in Masaki"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleChange('property_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="room">Room</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    value={formData.square_footage || ''}
                    onChange={(e) => handleChange('square_footage', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.bedrooms ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.bedrooms && <p className="text-red-600 text-sm mt-1">{errors.bedrooms}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => handleChange('bathrooms', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.bathrooms ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.bathrooms && <p className="text-red-600 text-sm mt-1">{errors.bathrooms}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe the property, its features, and what makes it special..."
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area/Neighborhood *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.area ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Masaki, Mikocheni, Upanga"
                  />
                  {errors.area && <p className="text-red-600 text-sm mt-1">{errors.area}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={formData.full_address}
                    onChange={(e) => handleChange('full_address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Complete street address (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rent (TSh) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rent_amount}
                    onChange={(e) => handleChange('rent_amount', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.rent_amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 800000"
                  />
                  {errors.rent_amount && <p className="text-red-600 text-sm mt-1">{errors.rent_amount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Fee (20%)
                  </label>
                  <input
                    type="text"
                    value={`TSh ${serviceFee.toLocaleString()}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatically calculated</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount
                  </label>
                  <input
                    type="text"
                    value={`TSh ${totalAmount.toLocaleString()}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-semibold"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rent + Service Fee</p>
                </div>
              </div>
            </div>

            {/* Utilities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilities Included</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(formData.utilities).map(([utility, included]) => (
                  <label key={utility} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={(e) => handleNestedChange('utilities', utility, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{utility}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {COMMON_AMENITIES.map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Additional Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet Policy
                  </label>
                  <select
                    value={formData.pet_policy}
                    onChange={(e) => handleChange('pet_policy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="not_allowed">Pets Not Allowed</option>
                    <option value="allowed">Pets Allowed</option>
                    <option value="cats_only">Cats Only</option>
                    <option value="dogs_only">Dogs Only</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.parking_available}
                      onChange={(e) => handleChange('parking_available', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Parking Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Preferences</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(formData.contact_preferences).map(([method, enabled]) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleNestedChange('contact_preferences', method, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Property Images */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) => handleChange('images', images)}
                maxImages={10}
              />
            </div>

            {/* Availability */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => handleChange('is_available', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Property is available for rent</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;