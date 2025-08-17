import React, { useState } from 'react';
import { Filter, X, Sliders, Home, Building, Users, Car, Shield, Zap } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';
import { tanzanianCities, propertyTypes, amenities } from '../data/constants';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onClose,
  isOpen = true
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  const handleFilterChange = (key: keyof SearchFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = localFilters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', newAmenities);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose?.();
  };

  const clearFilters = () => {
    const emptyFilters: SearchFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'parking':
        return <Car className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'security':
        return <Shield className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'generator':
        return <Zap className="h-3 w-3 sm:h-4 sm:w-4" />;
      default:
        return <Home className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header - Mobile-First */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters / Vichujio</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>

      {/* Location Filter - Responsive */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Location / Eneo
        </label>
        <select
          value={localFilters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
          className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base appearance-none bg-white"
        >
          <option value="">All cities / Miji yote</option>
          {tanzanianCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range - Mobile-First Layout */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Price Range / Bei (TZS)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div>
            <input
              type="number"
              placeholder="Min price / Bei ya chini"
              value={localFilters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max price / Bei ya juu"
              value={localFilters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
            />
          </div>
        </div>
        <div className="mt-1.5 sm:mt-2 text-xs text-gray-600">
          Popular ranges: 200K-500K, 500K-1M, 1M-2M, 2M+
        </div>
      </div>

      {/* Property Type - Mobile-First Grid */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Property Type / Aina ya Mali
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleFilterChange('propertyType', 
                localFilters.propertyType === type.value ? undefined : type.value
              )}
              className={`flex items-center justify-center px-3 py-2 sm:py-2.5 rounded-lg border transition-colors text-xs sm:text-sm ${
                localFilters.propertyType === type.value
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type.value === 'house' && <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
              {type.value === 'apartment' && <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
              {type.value === 'studio' && <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
              {type.value === 'villa' && <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
              {type.value === 'room' && <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />}
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms & Bathrooms - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Bedrooms / Vyumba
          </label>
          <select
            value={localFilters.bedrooms || ''}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base appearance-none bg-white"
          >
            <option value="">Any / Yoyote</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}+ bedroom{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            Bathrooms / Bafu
          </label>
          <select
            value={localFilters.bathrooms || ''}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base appearance-none bg-white"
          >
            <option value="">Any / Yoyote</option>
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>
                {num}+ bathroom{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Amenities - Mobile-First Grid */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Amenities / Huduma
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {amenities.slice(0, 8).map((amenity) => (
            <button
              key={amenity}
              onClick={() => handleAmenityToggle(amenity)}
              className={`flex items-center px-3 py-2 sm:py-2.5 rounded-lg border text-xs sm:text-sm transition-colors ${
                (localFilters.amenities || []).includes(amenity)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getAmenityIcon(amenity)}
              <span className="ml-1.5 sm:ml-2">{amenity}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Date - Responsive */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
          Available From / Inapatikana Kutoka
        </label>
        <input
          type="date"
          value={localFilters.availabilityDate || ''}
          onChange={(e) => handleFilterChange('availabilityDate', e.target.value || undefined)}
          className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
        />
      </div>

      {/* Action Buttons - Mobile-First Layout */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base font-medium"
        >
          Clear All / Futa Yote
        </button>
        <button
          onClick={applyFilters}
          className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm lg:text-base font-medium"
        >
          Apply Filters / Tumia Vichujio
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;