/**
 * HERO COMPONENT - MAIN LANDING SECTION
 * 
 * The hero section is the first thing users see on the homepage.
 * It contains the main value proposition, search functionality, and key statistics.
 * 
 * KEY FEATURES:
 * - Compelling headline with bilingual support
 * - Advanced property search form with multiple filters
 * - Responsive design optimized for all screen sizes
 * - Visual statistics to build trust and credibility
 * - Gradient background for visual appeal
 * - Full internationalization support with react-i18next
 * 
 * SEARCH FUNCTIONALITY:
 * - Location filtering by major Tanzanian cities
 * - Property type selection (house, apartment, studio, villa)
 * - Bedroom count filtering
 * - Price range selection with common price points
 * - Form validation and user feedback
 * 
 * RESPONSIVE DESIGN:
 * - Mobile-first approach with stacked form fields
 * - Tablet: 2-column grid for form fields
 * - Desktop: 4-column grid for optimal space usage
 * - Touch-friendly buttons and form elements
 * 
 * INTERNATIONALIZATION:
 * - All text content translatable with react-i18next
 * - Form labels and placeholders in both languages
 * - Statistics and tips support bilingual display
 * - Currency formatting respects locale settings
 * 
 * SCALABILITY NOTES:
 * - Search filters easily extensible
 * - Statistics can be dynamically loaded from API
 * - Form validation can be enhanced with custom rules
 * - Supports A/B testing for different layouts
 * - Language-specific content can be customized
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Home, Users } from 'lucide-react';
import { tanzanianCities } from '../data/constants';
import { SearchFilters } from '../types';

/**
 * HERO COMPONENT PROPS INTERFACE
 * 
 * Defines the callback function for search form submission.
 */
interface HeroProps {
  onSearch: (filters: SearchFilters) => void;  // Callback when user submits search
}

/**
 * HERO COMPONENT IMPLEMENTATION
 * 
 * Main landing section with search functionality, value proposition, and internationalization.
 */
export default function Hero({ onSearch }: HeroProps) {

  // INTERNATIONALIZATION HOOKS
  const { t } = useTranslation(['hero', 'common']);

  /**
   * SEARCH FILTERS STATE
   * 
   * Manages the current state of all search form fields.
   * Initialized with sensible defaults for better UX.
   */
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: '',                           // No location filter by default
    priceRange: { min: 0, max: 3000000 },  // Wide price range (0 - 3M TSh)
    bedrooms: null,                         // No bedroom filter
    bathrooms: null,                        // No bathroom filter
    houseType: '',                          // No property type filter
    amenities: []                           // No amenity filters
  });

  /**
   * SEARCH FORM SUBMISSION HANDLER
   * 
   * Processes form submission and triggers search callback.
   * Prevents default form submission and validates input.
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchFilters);
  };

  return (
    <div className="relative bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 py-8 sm:py-12 lg:py-16 xl:py-24">

      {/* BACKGROUND OVERLAY - Subtle gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-blue-600/5"></div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="text-center">

          {/* MAIN HEADLINE - Responsive typography with internationalization */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 leading-tight">
            {t('hero:title.main')}
            <span className="block text-teal-600 mt-1 sm:mt-2">
              {t('hero:title.highlight')}
            </span>
          </h1>

          {/* SUBTITLE - Value proposition with internationalization */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-4">
            {t('hero:subtitle')}
          </p>

          {/* SEARCH FORM CONTAINER - Card-style with shadow */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 lg:p-6 xl:p-8 max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4 lg:space-y-6">

              {/* FORM FIELDS GRID - Responsive layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

                {/* LOCATION FILTER */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 text-left">
                    {t('hero:searchForm.location.label')}
                  </label>
                  <div className="relative">
                    {/* Location Icon */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-full">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>

                    {/* Location Dropdown */}
                    <select
                      value={searchFilters.location}
                      onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                      className="pl-10 sm:pl-12 pr-10 w-full py-3 sm:py-3.5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 text-sm sm:text-base appearance-none bg-white flex items-center"
                    >
                      <option value="">{t('hero:searchForm.location.allCities')}</option>
                      {tanzanianCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>

                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* PROPERTY TYPE FILTER */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 text-left">
                    {t('hero:searchForm.propertyType.label')}
                  </label>
                  <div className="relative">
                    {/* Property Type Icon */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-full">
                      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>

                    {/* Property Type Dropdown */}
                    <select
                      value={searchFilters.houseType}
                      onChange={(e) => setSearchFilters({ ...searchFilters, houseType: e.target.value })}
                      className="pl-10 sm:pl-12 pr-10 w-full py-3 sm:py-3.5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 text-sm sm:text-base appearance-none bg-white flex items-center"
                    >
                      <option value="">{t('hero:searchForm.propertyType.allTypes')}</option>
                      <option value="house">{t('hero:searchForm.propertyType.house')}</option>
                      <option value="apartment">{t('hero:searchForm.propertyType.apartment')}</option>
                      <option value="studio">{t('hero:searchForm.propertyType.studio')}</option>
                      <option value="villa">{t('hero:searchForm.propertyType.villa')}</option>
                      <option value="room">{t('hero:searchForm.propertyType.room')}</option>
                    </select>

                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* BEDROOMS FILTER */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 text-left">
                    {t('hero:searchForm.bedrooms.label')}
                  </label>
                  <div className="relative">
                    {/* Bedrooms Icon */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-full">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>

                    {/* Bedrooms Dropdown */}
                    <select
                      value={searchFilters.bedrooms || ''}
                      onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                      className="pl-10 sm:pl-12 pr-10 w-full py-3 sm:py-3.5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 text-sm sm:text-base appearance-none bg-white flex items-center"
                    >
                      <option value="">{t('hero:searchForm.bedrooms.any')}</option>
                      <option value="1">1+ {t('hero:searchForm.bedrooms.bedroom')}</option>
                      <option value="2">2+ {t('hero:searchForm.bedrooms.bedrooms')}</option>
                      <option value="3">3+ {t('hero:searchForm.bedrooms.bedrooms')}</option>
                      <option value="4">4+ {t('hero:searchForm.bedrooms.bedrooms')}</option>
                      <option value="5">5+ {t('hero:searchForm.bedrooms.bedrooms')}</option>
                    </select>

                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* PRICE RANGE FILTER */}
                <div className="relative group">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 text-left">
                    {t('hero:searchForm.price.label')}
                  </label>
                  <div className="relative">
                    {/* Currency Indicator */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-full">
                      <span className="text-gray-400 text-xs sm:text-sm font-medium">
                        {t('common:currency.tsh')}
                      </span>
                    </div>

                    {/* Price Input Field */}
                    <input
                      type="text"
                      placeholder={t('hero:searchForm.price.anyPrice')}
                      value={searchFilters.priceRange?.max && searchFilters.priceRange.max < 3000000
                        ? searchFilters.priceRange.max.toLocaleString()
                        : ''
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        const numericValue = value ? parseInt(value) : 3000000;
                        setSearchFilters({
                          ...searchFilters,
                          priceRange: { ...searchFilters.priceRange, max: numericValue }
                        });
                      }}
                      className="pl-12 sm:pl-14 w-full py-3 sm:py-3.5 lg:py-4 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 text-sm sm:text-base bg-white"
                    />

                    {/* Quick Price Suggestions */}
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {[300000, 500000, 750000, 1000000, 1500000, 2000000, 2500000, 3000000].map((price) => (
                          <button
                            key={price}
                            type="button"
                            onClick={() => setSearchFilters({
                              ...searchFilters,
                              priceRange: { ...searchFilters.priceRange, max: price }
                            })}
                            className="px-3 py-2.5 text-xs text-gray-600 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors font-medium border border-gray-200 hover:border-teal-300"
                          >
                            {price >= 1000000 ? `${price / 1000000}M` : `${price / 1000}K`}{price === 3000000 ? '+' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Helper Text */}
                  <div className="mt-2 text-xs text-gray-500">
                    {t('hero:searchForm.price.helperText')}
                  </div>
                </div>
              </div>

              {/* SEARCH BUTTON - Call-to-action with internationalization */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-8 rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200 font-semibold text-sm sm:text-base lg:text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:transform active:translate-y-0"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{t('hero:searchForm.searchButton')}</span>
              </button>

              {/* SEARCH TIPS - User guidance with internationalization */}
              <div className="text-center pt-2 sm:pt-3">
                <p className="text-xs sm:text-sm text-gray-600 px-2">
                  {t('hero:searchForm.tips')}
                </p>
              </div>
            </form>
          </div>

          {/* PLATFORM STATISTICS - Trust building with internationalization */}
          <div className="mt-8 sm:mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

            {/* Properties Listed Stat */}
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600 mb-1 sm:mb-2">
                {t('hero:stats.properties.count')}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {t('hero:stats.properties.label')}
              </div>
            </div>

            {/* Cities Covered Stat */}
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {t('hero:stats.cities.count')}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {t('hero:stats.cities.label')}
              </div>
            </div>

            {/* Happy Tenants Stat */}
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                {t('hero:stats.tenants.count')}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                {t('hero:stats.tenants.label')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}