/**
 * SAVED PROPERTIES COMPONENT
 * 
 * Manages tenant's saved/favorite properties functionality.
 * Allows users to save, view, and manage their favorite properties.
 * 
 * Features:
 * - Save/unsave properties
 * - View saved properties list
 * - Remove properties from favorites
 * - Search within saved properties
 * - Mobile-first responsive design
 */

import React, { useState, useEffect } from 'react';
import { Heart, Search, Trash2, Eye, MapPin, Bed, Bath, Home, X } from 'lucide-react';
import { Property } from '../../types';
import PropertyCard from '../PropertyCard';

interface SavedPropertiesProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProperty: (property: Property) => void;
}

const SavedProperties: React.FC<SavedPropertiesProps> = ({
  isOpen,
  onClose,
  onViewProperty
}) => {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved properties from localStorage
  useEffect(() => {
    const loadSavedProperties = () => {
      try {
        const saved = localStorage.getItem('savedProperties');
        if (saved) {
          const properties = JSON.parse(saved);
          setSavedProperties(properties);
          setFilteredProperties(properties);
        }
      } catch (error) {
        console.error('Error loading saved properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadSavedProperties();
    }
  }, [isOpen]);

  // Filter properties based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProperties(savedProperties);
    } else {
      const filtered = savedProperties.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProperties(filtered);
    }
  }, [searchQuery, savedProperties]);

  const handleRemoveProperty = (propertyId: string) => {
    const updatedProperties = savedProperties.filter(p => p.id !== propertyId);
    setSavedProperties(updatedProperties);
    setFilteredProperties(updatedProperties.filter(property =>
      !searchQuery.trim() || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
    ));
    
    // Update localStorage
    try {
      localStorage.setItem('savedProperties', JSON.stringify(updatedProperties));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
        detail: { savedProperties: updatedProperties }
      }));
    } catch (error) {
      console.error('Error updating saved properties:', error);
    }
  };

  const handleClearAll = () => {
    setSavedProperties([]);
    setFilteredProperties([]);
    
    // Update localStorage
    try {
      localStorage.removeItem('savedProperties');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
        detail: { savedProperties: [] }
      }));
    } catch (error) {
      console.error('Error clearing saved properties:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Saved Properties
              </h2>
              <p className="text-sm text-gray-600">
                {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved properties..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Clear All Button */}
            {savedProperties.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            // Loading State
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading saved properties...</p>
              </div>
            </div>
          ) : savedProperties.length === 0 ? (
            // Empty State
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved properties yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start saving properties you're interested in by clicking the heart icon on any property listing.
              </p>
              <button
                onClick={onClose}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Browse Properties
              </button>
            </div>
          ) : filteredProperties.length === 0 ? (
            // No Search Results
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-4">
                No saved properties match your search for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-teal-600 hover:text-teal-700 underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            // Properties Grid
            <div>
              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {searchQuery ? (
                    <>Showing {filteredProperties.length} of {savedProperties.length} saved properties</>
                  ) : (
                    <>Showing all {savedProperties.length} saved properties</>
                  )}
                </p>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProperties.map((property) => (
                  <div key={property.id} className="relative">
                    <PropertyCard
                      property={property}
                      onViewDetails={onViewProperty}
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveProperty(property.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility functions for managing saved properties
export const useSavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Load saved properties from localStorage
    const loadSavedProperties = () => {
      try {
        const saved = localStorage.getItem('savedProperties');
        if (saved) {
          setSavedProperties(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved properties:', error);
      }
    };

    loadSavedProperties();

    // Listen for changes to saved properties
    const handleSavedPropertiesChanged = (event: CustomEvent) => {
      setSavedProperties(event.detail.savedProperties);
    };

    window.addEventListener('savedPropertiesChanged', handleSavedPropertiesChanged as EventListener);

    return () => {
      window.removeEventListener('savedPropertiesChanged', handleSavedPropertiesChanged as EventListener);
    };
  }, []);

  const saveProperty = (property: Property) => {
    const updatedProperties = [...savedProperties, property];
    setSavedProperties(updatedProperties);
    
    try {
      localStorage.setItem('savedProperties', JSON.stringify(updatedProperties));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
        detail: { savedProperties: updatedProperties }
      }));
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const unsaveProperty = (propertyId: string) => {
    const updatedProperties = savedProperties.filter(p => p.id !== propertyId);
    setSavedProperties(updatedProperties);
    
    try {
      localStorage.setItem('savedProperties', JSON.stringify(updatedProperties));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('savedPropertiesChanged', {
        detail: { savedProperties: updatedProperties }
      }));
    } catch (error) {
      console.error('Error unsaving property:', error);
    }
  };

  const isPropertySaved = (propertyId: string) => {
    return savedProperties.some(p => p.id === propertyId);
  };

  return {
    savedProperties,
    saveProperty,
    unsaveProperty,
    isPropertySaved
  };
};

export default SavedProperties;