/**
 * PROPERTY BROWSER COMPONENT
 * 
 * Enhanced property browsing interface for tenants with advanced features.
 * Integrates all tenant-specific functionality in one comprehensive component.
 * 
 * Features:
 * - Grid/list view toggle
 * - Advanced search and filtering
 * - Saved properties management
 * - Property comparison
 * - Booking requests
 * - Mobile-first responsive design
 */

import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Heart, 
  BarChart3, 
  SlidersHorizontal, 
  Search,
  ChevronDown,
  Eye,
  Plus,
  X
} from 'lucide-react';
import { Property, SearchFilters as SearchFiltersType } from '../../types';
import PropertyCard from '../PropertyCard';
import SearchFilters from '../SearchFilters';
import PropertyDetails from '../PropertyDetails';
import BookingRequest from './BookingRequest';
import SavedProperties, { useSavedProperties } from './SavedProperties';
import PropertyComparison from './PropertyComparison';

interface PropertyBrowserProps {
  properties: Property[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

const PropertyBrowser: React.FC<PropertyBrowserProps> = ({
  properties,
  onLoadMore,
  hasMore = false,
  isLoading = false
}) => {
  // State management
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'newest' | 'featured'>('featured');
  
  // Modal states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSavedProperties, setShowSavedProperties] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Comparison and saved properties
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([]);
  const { savedProperties, saveProperty, unsaveProperty, isPropertySaved } = useSavedProperties();

  const PROPERTIES_PER_PAGE = 9;

  // Update filtered properties when properties change
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  // Update displayed properties when filtered properties change
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * PROPERTIES_PER_PAGE;
    setDisplayedProperties(filteredProperties.slice(startIndex, endIndex));
  }, [filteredProperties, currentPage]);

  // Apply filters and search
  const applyFilters = (newFilters: SearchFiltersType, query: string = searchQuery) => {
    let filtered = [...properties];

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(property => {
        const searchableText = [
          property.title,
          property.location.city,
          property.location.district,
          property.description,
          property.propertyType,
          ...property.amenities
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchTerm);
      });
    }

    // Apply other filters
    if (newFilters.location) {
      filtered = filtered.filter(property => 
        property.location.city.toLowerCase().includes(newFilters.location!.toLowerCase())
      );
    }

    if (newFilters.priceMin) {
      filtered = filtered.filter(property => property.priceMonthly >= newFilters.priceMin!);
    }

    if (newFilters.priceMax) {
      filtered = filtered.filter(property => property.priceMonthly <= newFilters.priceMax!);
    }

    if (newFilters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === newFilters.propertyType);
    }

    if (newFilters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= newFilters.bedrooms!);
    }

    if (newFilters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= newFilters.bathrooms!);
    }

    if (newFilters.amenities && newFilters.amenities.length > 0) {
      filtered = filtered.filter(property => 
        newFilters.amenities!.every(amenity => property.amenities.includes(amenity))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.priceMonthly - b.priceMonthly);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.priceMonthly - a.priceMonthly);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        break;
      case 'featured':
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    setFilteredProperties(filtered);
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(filters, query);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    applyFilters(filters, searchQuery);
  };

  const handleLoadMore = () => {
    if (isLoading) return;
    
    const nextPage = currentPage + 1;
    const endIndex = nextPage * PROPERTIES_PER_PAGE;
    
    if (endIndex >= filteredProperties.length && hasMore && onLoadMore) {
      onLoadMore();
    } else {
      setCurrentPage(nextPage);
    }
  };

  const handlePropertyAction = (property: Property, action: 'view' | 'save' | 'compare' | 'book') => {
    switch (action) {
      case 'view':
        setSelectedProperty(property);
        break;
      case 'save':
        if (isPropertySaved(property.id)) {
          unsaveProperty(property.id);
        } else {
          saveProperty(property);
        }
        break;
      case 'compare':
        if (comparisonProperties.find(p => p.id === property.id)) {
          setComparisonProperties(prev => prev.filter(p => p.id !== property.id));
        } else if (comparisonProperties.length < 4) {
          setComparisonProperties(prev => [...prev, property]);
        }
        break;
      case 'book':
        setSelectedProperty(property);
        setShowBookingModal(true);
        break;
    }
  };

  const handleBookingSubmit = async (bookingData: any) => {
    // TODO: Implement booking submission to backend
    console.log('Booking submitted:', bookingData);
    
    // For now, just close the modal
    setShowBookingModal(false);
    setSelectedProperty(null);
  };

  // Property Details View
  if (selectedProperty && !showBookingModal) {
    return (
      <PropertyDetails
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header with Search */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search properties by location, price, or features..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSavedProperties(true)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Heart className={`h-4 w-4 ${savedProperties.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                <span>Saved ({savedProperties.length})</span>
              </button>
              
              {comparisonProperties.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-teal-100 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Compare ({comparisonProperties.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {filteredProperties.length} Properties Available
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Showing {displayedProperties.length} of {filteredProperties.length} properties
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-20">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={(newFilters) => applyFilters(newFilters, searchQuery)}
                  onClose={() => setShowFilters(false)}
                  isOpen={showFilters}
                />
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="flex-1">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({});
                    applyFilters({}, '');
                  }}
                  className="text-teal-600 hover:text-teal-700 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Properties Grid */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {displayedProperties.map((property) => (
                    <div key={property.id} className="relative group">
                      <PropertyCard
                        property={property}
                        onViewDetails={(prop) => handlePropertyAction(prop, 'view')}
                      />
                      
                      {/* Property Actions Overlay */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Save Button */}
                        <button
                          onClick={() => handlePropertyAction(property, 'save')}
                          className={`p-1.5 rounded-full shadow-lg transition-colors ${
                            isPropertySaved(property.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-600 hover:text-red-500'
                          }`}
                          title={isPropertySaved(property.id) ? 'Remove from saved' : 'Save property'}
                        >
                          <Heart className="h-3 w-3" />
                        </button>
                        
                        {/* Compare Button */}
                        <button
                          onClick={() => handlePropertyAction(property, 'compare')}
                          className={`p-1.5 rounded-full shadow-lg transition-colors ${
                            comparisonProperties.find(p => p.id === property.id)
                              ? 'bg-teal-500 text-white'
                              : 'bg-white text-gray-600 hover:text-teal-500'
                          }`}
                          title={
                            comparisonProperties.find(p => p.id === property.id)
                              ? 'Remove from comparison'
                              : 'Add to comparison'
                          }
                          disabled={!comparisonProperties.find(p => p.id === property.id) && comparisonProperties.length >= 4}
                        >
                          <BarChart3 className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Book Viewing Button */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePropertyAction(property, 'book')}
                          className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors shadow-lg"
                        >
                          Book Viewing
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {(displayedProperties.length < filteredProperties.length || hasMore) && (
                  <div className="text-center mt-8">
                    <button 
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto min-w-[200px]"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <span>Load More Properties</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && selectedProperty && (
        <BookingRequest
          property={selectedProperty}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedProperty(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}

      <SavedProperties
        isOpen={showSavedProperties}
        onClose={() => setShowSavedProperties(false)}
        onViewProperty={(property) => {
          setShowSavedProperties(false);
          setSelectedProperty(property);
        }}
      />

      <PropertyComparison
        properties={comparisonProperties}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onViewProperty={(property) => {
          setShowComparison(false);
          setSelectedProperty(property);
        }}
        onRemoveProperty={(propertyId) => {
          setComparisonProperties(prev => prev.filter(p => p.id !== propertyId));
        }}
        onAddProperty={() => {
          setShowComparison(false);
          // Could open a property selection modal here
        }}
      />
    </div>
  );
};

export default PropertyBrowser;