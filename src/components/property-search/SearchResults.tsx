/**
 * SEARCH RESULTS COMPONENT
 * 
 * Displays search results header and controls
 */

import React from 'react';
import { Grid, List, SlidersHorizontal } from 'lucide-react';

interface SearchResultsProps {
  showSearchResults: boolean;
  searchQuery: string;
  totalResults: number;
  displayedResults: number;
  sortBy: 'price-low' | 'price-high' | 'newest' | 'featured';
  onSortChange: (sortBy: 'price-low' | 'price-high' | 'newest' | 'featured') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearSearch: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  showSearchResults,
  searchQuery,
  totalResults,
  displayedResults,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  onClearSearch
}) => {
  return (
    <>
      {/* Search Results Header */}
      {showSearchResults && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-base sm:text-lg font-semibold text-blue-900">
                {searchQuery ? `Search Results for: "${searchQuery}"` : 'Filtered Results'}
              </h2>
              <p className="text-sm sm:text-base text-blue-700">
                Found {totalResults} properties {searchQuery ? 'matching your search' : 'matching your criteria'}
              </p>
            </div>
            <button
              onClick={onClearSearch}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              {searchQuery ? 'Clear Search' : 'Show All'}
            </button>
          </div>
        </div>
      )}

      {/* Results Header with Controls */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-4 sm:mb-6">
        
        {/* Results Count and Info */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {showSearchResults ? 'Search Results' : `${totalResults} Properties Available`}
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {showSearchResults 
              ? `${totalResults} properties found • Showing ${displayedResults} of ${totalResults}`
              : `Mali ${totalResults} zinapatikana Tanzania • Showing ${displayedResults} of ${totalResults}`
            }
          </p>
        </div>
        
        {/* Controls Section */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 lg:space-x-4">
          
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm lg:text-base"
          >
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {/* View Toggle - Hidden on Mobile */}
          <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <Grid className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
            >
              <List className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={onToggleFilters}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm lg:text-base"
          >
            <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sm:inline">Filters</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SearchResults;