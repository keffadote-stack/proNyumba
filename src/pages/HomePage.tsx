/**
 * HOMEPAGE COMPONENT - MAIN APPLICATION PAGE
 * 
 * This is the primary page component that orchestrates the entire property search experience.
 * It manages the application state, handles search functionality, and coordinates between components.
 * 
 * KEY FEATURES:
 * - Property search and filtering with real-time results
 * - Responsive grid/list view toggle (desktop only)
 * - Infinite scroll with "Load More" functionality
 * - Advanced search with multiple filter criteria
 * - Property details modal/page navigation
 * - Search result management and display
 * - Mobile-first responsive design
 * 
 * STATE MANAGEMENT:
 * - Properties data (mock data, will be API in production)
 * - Filtered and displayed properties
 * - Search filters and query state
 * - Pagination and loading states
 * - View mode and UI preferences
 * 
 * SEARCH FUNCTIONALITY:
 * - Text-based search with intelligent matching
 * - Price range filtering with flexible input
 * - Location-based filtering
 * - Property type and amenity filtering
 * - Real-time search from header component
 * - Search result highlighting and management
 * 
 * SCALABILITY NOTES:
 * - Easy to replace mock data with API calls
 * - Pagination system ready for large datasets
 * - Filter system extensible for new criteria
 * - Component structure supports A/B testing
 * - Performance optimized with proper state management
 */

import React, { useState, useEffect } from 'react';
import { Grid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import SearchFilters from '../components/SearchFilters';
import PropertyDetails from '../components/PropertyDetails';
import { db, isSupabaseConfigured } from '../lib/supabase';
import { Property, SearchFilters as SearchFiltersType } from '../types';
import { mockProperties } from '../data/mockData';

/**
 * PAGINATION CONFIGURATION
 * 
 * Controls how many properties are displayed initially and on subsequent loads.
 * Optimized for performance and user experience.
 */
const PROPERTIES_PER_PAGE = 9; // Initial load: 9 properties (3x3 grid)
// Subsequent loads: 6 properties each time for consistent UX

/**
 * CONVERT DATABASE PROPERTY TO APP PROPERTY FORMAT
 * 
 * Converts the database property format to match the app's Property interface.
 */
const convertDbPropertyToAppProperty = (dbProperty: any): Property => {
  return {
    id: dbProperty.id,
    ownerId: dbProperty.owner_id,
    title: dbProperty.title,
    description: dbProperty.description,
    priceMonthly: dbProperty.price_monthly,
    location: {
      address: dbProperty.address || '',
      city: dbProperty.city,
      district: dbProperty.area,
      neighborhood: dbProperty.area
    },
    bedrooms: dbProperty.bedrooms,
    bathrooms: dbProperty.bathrooms,
    propertyType: dbProperty.property_type as 'house' | 'apartment' | 'studio' | 'villa' | 'room',
    amenities: dbProperty.amenities || [],
    images: dbProperty.images || ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    status: dbProperty.is_available ? 'available' : 'rented' as 'available' | 'rented' | 'maintenance',
    createdDate: dbProperty.created_at,
    updatedDate: dbProperty.updated_at,
    featured: false // You can add a featured column to the database later
  };
};
/**
 * HOMEPAGE COMPONENT IMPLEMENTATION
 * 
 * Main page component managing property search and display functionality.
 */
const HomePage: React.FC = () => {
  
  // CORE DATA STATE
  const [properties, setProperties] = useState<Property[]>([]);                // All available properties
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties); // Properties after filtering
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([]); // Currently displayed properties
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);                           // Current pagination page
  const [hasMoreProperties, setHasMoreProperties] = useState(true);            // Whether more properties available
  const [isLoading, setIsLoading] = useState(false);                          // Loading state for pagination
  const [initialLoading, setInitialLoading] = useState(true);                  // Initial data loading state
  
  // SEARCH AND FILTER STATE
  const [filters, setFilters] = useState<SearchFiltersType>({});               // Current active filters
  const [searchQuery, setSearchQuery] = useState('');                         // Current search query
  const [showSearchResults, setShowSearchResults] = useState(false);          // Whether showing search results
  
  // UI STATE
  const [showFilters, setShowFilters] = useState(false);                       // Filter sidebar visibility
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');          // Grid or list view (desktop only)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null); // Selected property for details
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'newest' | 'featured'>('featured'); // Sort criteria

  /**
   * LOAD PROPERTIES FROM DATABASE
   * 
   * Fetches properties from Supabase database or falls back to mock data.
   */
  const loadProperties = async () => {
    try {
      setInitialLoading(true);
      
      if (!isSupabaseConfigured) {
        console.log('Supabase not configured, using mock data');
        const { mockProperties } = await import('../data/mockData');
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
        return;
      }

      console.log('Loading properties from database...');
      const { data, error } = await db.properties.getAll();
      
      if (error) {
        console.error('Error loading properties:', error);
        // Fallback to mock data
        const { mockProperties } = await import('../data/mockData');
        setProperties(mockProperties);
        setFilteredProperties(mockProperties);
        return;
      }
      
      if (data) {
        const convertedProperties = data.map(convertDbPropertyToAppProperty);
        console.log('Loaded properties from database:', convertedProperties.length);
        setProperties(convertedProperties);
        setFilteredProperties(convertedProperties);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      // Fallback to mock data
      const { mockProperties } = await import('../data/mockData');
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
    } finally {
      setInitialLoading(false);
    }
  };
  /**
   * ADVANCED SEARCH AND FILTERING FUNCTION
   * 
   * This is the core search engine that processes all filter criteria and search queries.
   * It handles text search, price filtering, location matching, and more.
   * 
   * SEARCH CAPABILITIES:
   * - Multi-term text search across all property fields
   * - Intelligent price matching (supports "500k", "1m" format)
   * - Location-based filtering
   * - Property type and feature filtering
   * - Flexible numeric and text matching
   * 
   * @param newFilters - Filter criteria to apply
   * @param query - Text search query
   */
  const applyFilters = (newFilters: SearchFiltersType, query: string = searchQuery) => {
    let filtered = [...properties];

    // TEXT SEARCH PROCESSING
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
      
      filtered = filtered.filter(property => {
        // Create searchable text from all property fields
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

        // Check if any search term matches
        return searchTerms.some(term => {
          // Direct text matching
          if (searchableText.includes(term)) return true;
          
          // INTELLIGENT PRICE MATCHING
          // Supports formats like "500k", "1m", "2.5m"
          if (term.includes('k') || term.includes('m')) {
            const priceValue = parseFloat(term.replace(/[km]/g, ''));
            const multiplier = term.includes('m') ? 1000000 : 1000;
            const searchPrice = priceValue * multiplier;
            const propertyPrice = property.priceMonthly;
            
            // Allow for price range matching (±20% tolerance)
            return Math.abs(propertyPrice - searchPrice) <= (searchPrice * 0.2);
          }
          
          // NUMERIC PRICE MATCHING
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

    // LOCATION FILTERING
    if (newFilters.location) {
      filtered = filtered.filter(property => 
        property.location.city.toLowerCase().includes(newFilters.location!.toLowerCase())
      );
    }

    // PRICE RANGE FILTERING
    if (newFilters.priceMin) {
      filtered = filtered.filter(property => property.priceMonthly >= newFilters.priceMin!);
    }
    if (newFilters.priceMax) {
      filtered = filtered.filter(property => property.priceMonthly <= newFilters.priceMax!);
    }

    // PROPERTY TYPE FILTERING
    if (newFilters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === newFilters.propertyType);
    }

    // BEDROOM FILTERING (minimum requirement)
    if (newFilters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= newFilters.bedrooms!);
    }

    // BATHROOM FILTERING (minimum requirement)
    if (newFilters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= newFilters.bathrooms!);
    }

    // AMENITIES FILTERING (all required amenities must be present)
    if (newFilters.amenities && newFilters.amenities.length > 0) {
      filtered = filtered.filter(property => 
        newFilters.amenities!.every(amenity => 
          property.amenities.includes(amenity)
        )
      );
    }

    // SORTING LOGIC
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
        // Featured properties first, then by creation date
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    // UPDATE STATE
    setFilteredProperties(filtered);
    setFilters(newFilters);
    
    // Reset pagination when filters change
    setCurrentPage(1);
    updateDisplayedProperties(filtered, 1);
  };

  /**
   * PAGINATION MANAGEMENT FUNCTION
   * 
   * Handles the display of properties with pagination logic.
   * Implements progressive loading for better performance.
   * 
   * @param allProperties - All filtered properties
   * @param page - Current page number
   */
  const updateDisplayedProperties = (allProperties: Property[], page: number) => {
    const startIndex = 0;
    // First page shows 9 properties, subsequent pages add 6 more each
    const endIndex = page === 1 ? PROPERTIES_PER_PAGE : PROPERTIES_PER_PAGE + (page - 1) * 6;
    const newDisplayed = allProperties.slice(startIndex, endIndex);
    
    setDisplayedProperties(newDisplayed);
    setHasMoreProperties(endIndex < allProperties.length);
  };

  /**
   * LOAD MORE PROPERTIES FUNCTION
   * 
   * Handles the "Load More" functionality with loading states.
   * Includes artificial delay for better UX feedback.
   */
  const loadMoreProperties = () => {
    if (isLoading || !hasMoreProperties) return;
    
    setIsLoading(true);
    
    // Simulate loading delay for better UX (remove in production with real API)
    setTimeout(() => {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateDisplayedProperties(filteredProperties, nextPage);
      setIsLoading(false);
    }, 800);
  };

  /**
   * SORT CHANGE HANDLER
   * 
   * Updates sorting criteria and re-applies filters.
   */
  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    applyFilters(filters, searchQuery);
  };

  /**
   * SEARCH HANDLERS
   * 
   * Handle different types of search input (header, hero, direct).
   */
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

  /**
   * INITIAL DATA LOADING EFFECT
   * 
   * Loads properties when component mounts.
   */
  useEffect(() => {
    loadProperties();
  }, []);
  /**
   * HEADER SEARCH EVENT LISTENER
   * 
   * Listens for search events from the header component.
   * Uses custom events for loose coupling between components.
   */
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

  /**
   * SORT EFFECT
   * 
   * Re-applies filters when sort criteria changes.
   */
  useEffect(() => {
    if (properties.length > 0) {
      applyFilters(filters, searchQuery);
    }
  }, [sortBy]);

  /**
   * DISPLAY PROPERTIES EFFECT
   * 
   * Updates displayed properties when filtered properties change.
   */
  useEffect(() => {
    if (filteredProperties.length > 0) {
      updateDisplayedProperties(filteredProperties, 1);
    }
  }, [filteredProperties]);

  // PROPERTY DETAILS VIEW
  if (selectedProperty) {
    return (
      <PropertyDetails
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  // INITIAL LOADING STATE
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
  // MAIN HOMEPAGE RENDER
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HERO SECTION - Only show when not searching */}
      {!showSearchResults && <Hero onSearch={handleHeroSearch} />}
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* SEARCH RESULTS HEADER - Mobile-First */}
        {showSearchResults && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="text-center sm:text-left">
                <h2 className="text-base sm:text-lg font-semibold text-blue-900">
                  {searchQuery ? `Search Results for: "${searchQuery}"` : 'Filtered Results'}
                </h2>
                <p className="text-sm sm:text-base text-blue-700">
                  Found {filteredProperties.length} properties {searchQuery ? 'matching your search' : 'matching your criteria'}
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                {searchQuery ? 'Clear Search' : 'Show All'}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS HEADER WITH CONTROLS - Mobile-First */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-4 sm:mb-6">
          
          {/* Results Count and Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {showSearchResults ? 'Search Results' : `${filteredProperties.length} Properties Available`}
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {showSearchResults 
                ? `${filteredProperties.length} properties found • Showing ${displayedProperties.length} of ${filteredProperties.length}`
                : `Mali ${filteredProperties.length} zinapatikana Tanzania • Showing ${displayedProperties.length} of ${filteredProperties.length}`
              }
            </p>
          </div>
          
          {/* Controls Section */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 lg:space-x-4">
            
            {/* Sort Dropdown - Responsive */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>

            {/* View Toggle - Hidden on Mobile, Responsive on larger screens */}
            <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <Grid className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              >
                <List className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>

            {/* Filters Toggle - Mobile-First */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base"
            >
              <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          
          {/* FILTERS SIDEBAR - Mobile-First */}
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

          {/* PROPERTIES GRID/LIST - Mobile-First */}
          <div className="flex-1">
            {filteredProperties.length === 0 ? (
              
              // NO RESULTS STATE
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  {showSearchResults ? `No properties found${searchQuery ? ` for "${searchQuery}"` : ''}` : 'No properties found'}
                </h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                  {showSearchResults 
                    ? 'Try searching with different keywords like location, price, or property type'
                    : 'Try adjusting your filters or search criteria / Jaribu kubadilisha vigezo vyako vya utafutaji'
                  }
                </p>
                {showSearchResults && (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-gray-500 px-4">
                      Search examples: "Mbeya", "500000", "apartment", "3 bedrooms", "parking"
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base"
                    >
                      Clear search and show all properties
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* PROPERTIES GRID - Always responsive grid layout */}
                <div className={`grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`}>
                  {displayedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onViewDetails={setSelectedProperty}
                    />
                  ))}
                </div>

                {/* LOAD MORE BUTTON - Mobile-First */}
                {hasMoreProperties && (
                  <div className="text-center mt-8 sm:mt-12">
                    <button 
                      onClick={loadMoreProperties}
                      disabled={isLoading}
                      className="bg-white border border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto min-w-[160px] sm:min-w-[200px] text-sm sm:text-base"
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
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Showing {displayedProperties.length} of {filteredProperties.length} properties
                    </p>
                  </div>
                )}

                {/* END OF RESULTS MESSAGE - Mobile-First */}
                {!hasMoreProperties && filteredProperties.length > PROPERTIES_PER_PAGE && (
                  <div className="text-center mt-8 sm:mt-12 py-6 sm:py-8 border-t border-gray-200">
                    <div className="text-gray-500 mb-2">
                      <svg className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                      You've seen all properties!
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
                      You've viewed all {filteredProperties.length} properties matching your criteria.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => {
                          setCurrentPage(1);
                          updateDisplayedProperties(filteredProperties, 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                      >
                        Back to Top
                      </button>
                      <button
                        onClick={() => {
                          clearSearch();
                          setShowFilters(true);
                        }}
                        className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                      >
                        Modify Search
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;