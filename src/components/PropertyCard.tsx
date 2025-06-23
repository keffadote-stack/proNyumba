import React, { useState } from 'react';
import { Heart, MapPin, Eye, Bed, Bath, Home } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(property);
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 border border-gray-100">
      {/* Image Gallery - Responsive height */}
      <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden cursor-pointer" onClick={() => onViewDetails?.(property)}>
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Image Navigation - Touch-friendly on mobile */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md"
            >
              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Image Dots - Responsive sizing */}
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors duration-200 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Like Button - Touch-friendly */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 transition-all duration-200 shadow-sm"
        >
          <Heart
            className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors duration-200 ${
              isLiked ? 'text-red-500 fill-current' : 'text-gray-700'
            }`}
          />
        </button>

        {/* Featured Badge - Responsive */}
        {property.featured && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            Featured
          </div>
        )}

        {/* Image Count Badge - Responsive */}
        {property.images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs font-medium">
            {currentImageIndex + 1}/{property.images.length}
          </div>
        )}
      </div>

      {/* Content - Responsive padding */}
      <div className="p-3 sm:p-4">
        {/* Location - Responsive text */}
        <div className="flex items-center text-gray-500 mb-1.5 sm:mb-2">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="text-xs sm:text-sm">{property.location.city}, {property.location.district}</span>
        </div>

        {/* Title - Responsive sizing */}
        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer leading-tight" onClick={() => onViewDetails?.(property)}>
          {property.title}
        </h3>

        {/* Property Details - Responsive spacing */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-gray-600 mb-2 sm:mb-3">
          <div className="flex items-center space-x-1">
            <Bed className="h-3 w-3" />
            <span className="text-xs">{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-3 w-3" />
            <span className="text-xs">{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Home className="h-3 w-3" />
            <span className="text-xs capitalize">{property.propertyType}</span>
          </div>
        </div>

        {/* Price and Action Row - Responsive layout */}
        <div className="flex items-center justify-between">
          {/* Price - Responsive text sizing */}
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              {formatPrice(property.priceMonthly)}
            </span>
            <span className="text-gray-500 text-xs">per month</span>
          </div>

          {/* View Button - Touch-friendly */}
          <button
            onClick={handleViewClick}
            className="flex items-center space-x-1.5 sm:space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>View</span>
          </button>
        </div>

        {/* Amenities Preview - Responsive */}
        {property.amenities.length > 0 && (
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;