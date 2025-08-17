/**
 * PROPERTY SEARCH COMPONENT - REFACTORED
 *
 * Main property search component that orchestrates the search experience.
 * Refactored from HomePage for better organization and maintainability.
 */

import React, { useState, useEffect } from 'react';
import Hero from '../Hero';
import SearchFilters from '../SearchFilters';
import PropertyDetails from '../PropertyDetails';
import SearchResults from './SearchResults';
import PropertyGrid from './PropertyGrid';
import { isSupabaseConfigured } from '../../lib/supabase';
import { propertyService } from '../../services/propertyService';
import { Property, SearchFilters as SearchFiltersType } from '../../types';

const PROPERTIES_PER_PAGE = 12;

const PropertySearch: React.FC = () => {
  // Core data state
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProperties, setHasMoreProperties] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  // Search and filter state
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'newest' | 'featured'>('featured');

  // Load properties from database
  const loadProperties = async () => {
    try {
      setInitialLoading(true);
      
      if (!isSupabaseConfigured) {
        console.error('Supabase not configured! Check your .env file');
        setProperties([]);
        setFilteredProperties([]);
        return;
      }

      const { data, error } = await propertyService.getProperties();
      
      console.log('Database query result:', { 
        dataLength: data?.length, 
        error: error?.message,
        firstProperty: data?.[0] 
      });
      
      if (error) {
        console.error('Error loading properties from database:', error);
        setProperties([]);
        setFilteredProperties([]);
        return;
      }
      
      if (data && data.length > 0) {
        const convertedProperties = data.map(propertyService.transformDbProperty);
        setProperties(convertedProperties);
        setFilteredProperties(convertedProperties);
      } else {
        setProperties([]);
        setFilteredProperties([]);
      }
    } catch (error) {
      console.error('Catch error loading properties:', error);
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Apply filters and search
  const applyFilters = (newFilters: SearchFiltersType, query: string = searchQuery) => {
    let filtered = [...properties];

    // Text search processing
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
      
      filtered = filtered.filter(property => {
        const searchableText = [
          property.title,
          property.location.city,
          property.location.district,
          property.location.neighborhood || '',
          property.description,
          property.propertyType,
          property.priceMonthly.toString(),
          property.bedrooms.toString(),
          property.bathrooms.toString(),
          ...property.amenities
        ].join(' ').toLowerCase();

        return searchTerms.some(term => {
          if (searchableText.includes(term)) return true;
          
          // Intelligent price matching
          if (term.includes('k') || term.includes('m')) {
            const priceValue = parseFloat(term.replace(/[km]/g, ''));
            const multiplier = term.includes('m') ? 1000000 : 1000;
            const searchPrice = priceValue * multiplier;
            const propertyPrice = property.priceMonthly;
            
            return Math.abs(propertyPrice - searchPrice) <= (searchPrice * 0.2);
          }
          
          if (!isNaN(Number(term))) {
            const searchPrice = Number(term);
            return Math.abs(property.priceMonthly - searchPrice) <= (searchPrice * 0.1);
          }
          
          return false;
        });
      });
      
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
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
        newFilters.amenities!.every(amenity => 
          property.amenities.includes(amenity)
        )
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
    updateDisplayedProperties(filtered, 1);
  };

  // Update displayed properties with pagination
  const updateDisplayedProperties = (allProperties: Property[], page: number) => {
    const startIndex = 0;
    const endIndex = page === 1 ? PROPERTIES_PER_PAGE : PROPERTIES_PER_PAGE + (page - 1) * 8;
    const newDisplayed = allProperties.slice(startIndex, endIndex);
    
    setDisplayedProperties(newDisplayed);
    setHasMoreProperties(endIndex < allProperties.length);
  };

  // Load more properties
  const loadMoreProperties = () => {
    if (isLoading || !hasMoreProperties) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateDisplayedProperties(filteredProperties, nextPage);
      setIsLoading(false);
    }, 800);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    applyFilters(filters, searchQuery);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(filters, query);
  };

  const handleHeroSearch = (heroFilters: SearchFiltersType) => {
    setShowSearchResults(true);
    applyFilters(heroFilters, searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    applyFilters(filters, '');
  };

  // Effects
  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    const handleHeaderSearch = (event: CustomEvent) => {
      const query = event.detail;
      handleSearch(query);
    };

    window.addEventListener('headerSearch', handleHeaderSearch as EventListener);
    
    return () => {
      window.removeEventListener('headerSearch', handleHeaderSearch as EventListener);
    };
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      applyFilters(filters, searchQuery);
    }
  }, [sortBy]);

  useEffect(() => {
    if (filteredProperties.length > 0) {
      updateDisplayedProperties(filteredProperties, 1);
    }
  }, [filteredProperties]);

  // Show property details
  if (selectedProperty) {
    return (
      <PropertyDetails
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching latest listings from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {!showSearchResults && <Hero onSearch={handleHeroSearch} />}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Search Results Header and Controls */}
        <SearchResults
          showSearchResults={showSearchResults}
          searchQuery={searchQuery}
          totalResults={filteredProperties.length}
          displayedResults={displayedProperties.length}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onClearSearch={clearSearch}
        />

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-16 sm:top-20 lg:top-24">
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
            <PropertyGrid
              properties={displayedProperties}
              loading={isLoading}
              hasMore={hasMoreProperties}
              onLoadMore={loadMoreProperties}
              onPropertySelect={setSelectedProperty}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;