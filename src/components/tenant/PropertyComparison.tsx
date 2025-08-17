/**
 * PROPERTY COMPARISON COMPONENT
 * 
 * Allows tenants to compare multiple properties side by side.
 * Provides detailed comparison of features, pricing, and amenities.
 * 
 * Features:
 * - Side-by-side property comparison
 * - Feature comparison matrix
 * - Price and value comparison
 * - Amenities comparison
 * - Location comparison
 * - Mobile-responsive design
 */

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Bed, 
  Bath, 
  Home, 
  Calendar,
  DollarSign,
  Check,
  Minus,
  Eye,
  Heart,
  Plus
} from 'lucide-react';
import { Property } from '../../types';

interface PropertyComparisonProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  onViewProperty: (property: Property) => void;
  onRemoveProperty: (propertyId: string) => void;
  onAddProperty?: () => void;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({
  properties,
  isOpen,
  onClose,
  onViewProperty,
  onRemoveProperty,
  onAddProperty
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'price',
    'bedrooms',
    'bathrooms',
    'location',
    'amenities'
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getAllAmenities = () => {
    const allAmenities = new Set<string>();
    properties.forEach(property => {
      property.amenities.forEach(amenity => allAmenities.add(amenity));
    });
    return Array.from(allAmenities).sort();
  };

  const hasAmenity = (property: Property, amenity: string) => {
    return property.amenities.includes(amenity);
  };

  const getComparisonRows = () => {
    const rows = [];

    // Basic Information
    if (selectedFeatures.includes('price')) {
      rows.push({
        label: 'Monthly Rent',
        icon: <DollarSign className="h-4 w-4" />,
        values: properties.map(p => formatPrice(p.priceMonthly))
      });
    }

    if (selectedFeatures.includes('bedrooms')) {
      rows.push({
        label: 'Bedrooms',
        icon: <Bed className="h-4 w-4" />,
        values: properties.map(p => p.bedrooms.toString())
      });
    }

    if (selectedFeatures.includes('bathrooms')) {
      rows.push({
        label: 'Bathrooms',
        icon: <Bath className="h-4 w-4" />,
        values: properties.map(p => p.bathrooms.toString())
      });
    }

    if (selectedFeatures.includes('location')) {
      rows.push({
        label: 'City',
        icon: <MapPin className="h-4 w-4" />,
        values: properties.map(p => p.location.city)
      });
      
      rows.push({
        label: 'District',
        icon: <MapPin className="h-4 w-4" />,
        values: properties.map(p => p.location.district)
      });
    }

    rows.push({
      label: 'Property Type',
      icon: <Home className="h-4 w-4" />,
      values: properties.map(p => p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1))
    });

    rows.push({
      label: 'Listed Date',
      icon: <Calendar className="h-4 w-4" />,
      values: properties.map(p => new Date(p.createdDate).toLocaleDateString())
    });

    // Amenities
    if (selectedFeatures.includes('amenities')) {
      const allAmenities = getAllAmenities();
      allAmenities.forEach(amenity => {
        rows.push({
          label: amenity,
          icon: <Check className="h-4 w-4" />,
          values: properties.map(p => hasAmenity(p, amenity)),
          isAmenity: true
        });
      });
    }

    return rows;
  };

  if (!isOpen || properties.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Property Comparison
            </h2>
            <p className="text-sm text-gray-600">
              Comparing {properties.length} {properties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature Selection */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Compare Features:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'price', label: 'Price' },
              { key: 'bedrooms', label: 'Bedrooms' },
              { key: 'bathrooms', label: 'Bathrooms' },
              { key: 'location', label: 'Location' },
              { key: 'amenities', label: 'Amenities' }
            ].map(feature => (
              <button
                key={feature.key}
                onClick={() => {
                  if (selectedFeatures.includes(feature.key)) {
                    setSelectedFeatures(prev => prev.filter(f => f !== feature.key));
                  } else {
                    setSelectedFeatures(prev => [...prev, feature.key]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedFeatures.includes(feature.key)
                    ? 'bg-teal-100 text-teal-700 border border-teal-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            {/* Property Headers */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex">
                {/* Feature Column Header */}
                <div className="w-32 sm:w-40 flex-shrink-0 p-4 border-r border-gray-200">
                  <div className="text-sm font-medium text-gray-900">Features</div>
                </div>
                
                {/* Property Headers */}
                {properties.map((property, index) => (
                  <div key={property.id} className="flex-1 min-w-64 p-4 border-r border-gray-200 last:border-r-0">
                    <div className="space-y-2">
                      {/* Property Image */}
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Property Title */}
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {property.title}
                      </h3>
                      
                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewProperty(property)}
                          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-teal-600 text-white rounded text-xs hover:bg-teal-700 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => onRemoveProperty(property.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove from comparison"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Property Column */}
                {properties.length < 4 && onAddProperty && (
                  <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200">
                    <button
                      onClick={onAddProperty}
                      className="w-full h-full min-h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors"
                    >
                      <Plus className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">Add Property</span>
                      <span className="text-xs">Compare up to 4</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-gray-200">
              {getComparisonRows().map((row, index) => (
                <div key={index} className="flex hover:bg-gray-50">
                  {/* Feature Label */}
                  <div className="w-32 sm:w-40 flex-shrink-0 p-4 border-r border-gray-200 flex items-center space-x-2">
                    {row.icon}
                    <span className="text-sm font-medium text-gray-900">{row.label}</span>
                  </div>
                  
                  {/* Property Values */}
                  {row.values.map((value, propertyIndex) => (
                    <div key={propertyIndex} className="flex-1 min-w-64 p-4 border-r border-gray-200 last:border-r-0 flex items-center">
                      {row.isAmenity ? (
                        value ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Minus className="h-4 w-4" />
                            <span className="text-sm">No</span>
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-gray-900">{value}</span>
                      )}
                    </div>
                  ))}
                  
                  {/* Add Property Column Spacer */}
                  {properties.length < 4 && onAddProperty && (
                    <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Tip: Click on property images or "View" buttons to see full details
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;