/**
 * PROPERTY GRID COMPONENT
 * 
 * Displays properties in a responsive grid layout
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import PropertyCard from '../PropertyCard';
import type { Property } from '../../types';

interface PropertyGridProps {
  properties: Property[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPropertySelect: (property: Property) => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  loading,
  hasMore,
  onLoadMore,
  onPropertySelect
}) => {
  if (properties.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-400 mb-4">
          <svg className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          No properties found
        </h3>
        <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Properties Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onViewDetails={onPropertySelect}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-8 sm:mt-12">
          <button 
            onClick={onLoadMore}
            disabled={loading}
            className="bg-white border border-gray-300 text-gray-700 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto min-w-[160px] sm:min-w-[200px] text-sm sm:text-base"
          >
            {loading ? (
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
            Showing {properties.length} properties
          </p>
        </div>
      )}

      {/* End of Results Message */}
      {!hasMore && properties.length > 12 && (
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
            You've viewed all {properties.length} properties matching your criteria.
          </p>
        </div>
      )}
    </>
  );
};

export default PropertyGrid;