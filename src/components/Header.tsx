/**
 * HEADER COMPONENT - MAIN NAVIGATION AND SEARCH
 * 
 * This is the primary navigation component that appears on all pages.
 * Provides responsive navigation, search functionality, user authentication, and language switching.
 * 
 * KEY FEATURES:
 * - Responsive design (mobile-first approach)
 * - Multi-level search functionality (desktop, tablet, mobile)
 * - User authentication state management
 * - Hamburger menu for mobile devices
 * - Real-time search with suggestions
 * - Language switching with react-i18next
 * - Bilingual support (English/Swahili)
 * 
 * RESPONSIVE BREAKPOINTS:
 * - Mobile: < 768px (hamburger menu, bottom search)
 * - Tablet: 768px-1024px (medium search, collapsible nav)
 * - Desktop: 1024px+ (full navigation, expanded search)
 * 
 * INTERNATIONALIZATION:
 * - All text content is translatable using react-i18next
 * - Language switcher integrated in desktop and mobile views
 * - Search placeholders and suggestions support both languages
 * - Navigation links with bilingual labels
 * 
 * SCALABILITY NOTES:
 * - Search suggestions can be dynamically loaded from API
 * - Navigation links easily configurable
 * - Authentication state can integrate with any auth provider
 * - Supports multiple languages through i18next
 * - Language switcher can be extended for more languages
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Menu, X, User, Heart, Bell, Home, Info, Phone, LogIn, UserPlus } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * HEADER COMPONENT PROPS INTERFACE
 * 
 * Defines the contract for Header component usage.
 * All props are optional with sensible defaults for flexibility.
 */
interface HeaderProps {
  onSearch?: (query: string) => void;    // Callback for search functionality
  isAuthenticated?: boolean;             // User authentication state
  onAuthClick?: () => void;              // Callback for auth actions (login/signup)
}

/**
 * HEADER COMPONENT IMPLEMENTATION
 * 
 * Main navigation component with responsive design, search functionality, and language switching.
 */
const Header: React.FC<HeaderProps> = ({ 
  onSearch = () => {}, 
  isAuthenticated = false, 
  onAuthClick = () => {} 
}) => {
  // INTERNATIONALIZATION HOOKS
  const { t } = useTranslation(['header', 'common']);

  // COMPONENT STATE MANAGEMENT
  const [isMenuOpen, setIsMenuOpen] = useState(false);           // Mobile menu toggle
  const [searchQuery, setSearchQuery] = useState('');           // Current search input
  const [isSearchExpanded, setIsSearchExpanded] = useState(false); // Search expansion state

  // REFS FOR CLICK OUTSIDE DETECTION
  const searchRef = useRef<HTMLDivElement>(null);               // Desktop search container
  const mediumSearchRef = useRef<HTMLDivElement>(null);         // Tablet search container

  /**
   * SEARCH FORM SUBMISSION HANDLER
   * 
   * Handles form submission for search functionality.
   * Prevents empty searches and manages UI state.
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsSearchExpanded(false);
    }
  };

  /**
   * REAL-TIME SEARCH INPUT HANDLER
   * 
   * Provides instant search results as user types.
   * Debouncing can be added here for performance optimization.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Real-time search as user types
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  /**
   * SEARCH CLEAR FUNCTIONALITY
   * 
   * Resets search state and clears results.
   */
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
    onSearch(''); // Clear search results
  };

  /**
   * CLICK OUTSIDE DETECTION EFFECT
   * 
   * Closes expanded search when user clicks outside.
   * Improves UX by managing focus states.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
      if (mediumSearchRef.current && !mediumSearchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * NAVIGATION LINKS CONFIGURATION
   * 
   * Centralized navigation structure with internationalization support.
   * Easy to modify for different sections or languages.
   */
  const navigationLinks = [
    { name: t('header:navigation.properties'), href: '#properties', icon: Home },
    { name: t('header:navigation.about'), href: '#about', icon: Info },
    { name: t('header:navigation.contact'), href: '#contact', icon: Phone }
  ];

  /**
   * SEARCH SUGGESTIONS DATA
   * 
   * Predefined search suggestions for better UX.
   * In production, these could be dynamically loaded based on popular searches.
   * Supports both English and Swahili terms.
   */
  const searchSuggestions = [
    'Dar es Salaam', 'Mwanza', 'Arusha', 'Mbeya', 
    '500000', '1000000', '2 bedrooms', '3 bedrooms',
    'Apartment', 'House', 'Parking', 'Security'
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 lg:h-20">
          
          {/* LOGO SECTION - Responsive sizing */}
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600 cursor-pointer hover:text-teal-700 transition-colors">
              Nyumba<span className="text-orange-500">TZ</span>
            </h1>
          </div>

          {/* DESKTOP NAVIGATION - Large screens only */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigationLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium group"
              >
                <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm xl:text-base">{link.name}</span>
              </a>
            ))}
          </div>

          {/* DESKTOP SEARCH - Advanced search with suggestions */}
          <div className="hidden lg:flex flex-1 max-w-xl xl:max-w-2xl mx-6 xl:mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div 
                className={`relative transition-all duration-300 ease-in-out ${
                  isSearchExpanded 
                    ? 'transform scale-105' 
                    : 'hover:shadow-md'
                }`}
              >
                {/* Search Input Container */}
                <div 
                  className={`flex items-center border rounded-full bg-white transition-all duration-300 ${
                    isSearchExpanded 
                      ? 'border-teal-500 shadow-lg py-3 px-6' 
                      : 'border-gray-300 shadow-sm py-2 px-4 hover:border-gray-400'
                  }`}
                >
                  {/* Search Icon */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`transition-all duration-300 ${
                      isSearchExpanded ? 'h-5 w-5 text-teal-600' : 'h-4 w-4 text-gray-400'
                    }`} />
                  </div>
                  
                  {/* Search Input Field */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => setIsSearchExpanded(true)}
                    placeholder={isSearchExpanded 
                      ? t('header:search.expandedPlaceholder')
                      : t('header:search.placeholder')
                    }
                    className={`block w-full bg-transparent outline-none transition-all duration-300 ${
                      isSearchExpanded 
                        ? 'pl-8 pr-12 text-base placeholder-gray-400' 
                        : 'pl-8 pr-10 text-sm placeholder-gray-500'
                    }`}
                  />
                  
                  {/* Clear Search Button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-12 flex items-center pr-2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </button>
                  )}
                  
                  {/* Search Submit Button */}
                  <button
                    type="submit"
                    className={`absolute inset-y-0 right-0 flex items-center transition-all duration-300 ${
                      isSearchExpanded 
                        ? 'pr-4' 
                        : 'pr-3'
                    }`}
                  >
                    <div className={`rounded-full transition-all duration-300 ${
                      isSearchExpanded 
                        ? 'bg-teal-600 hover:bg-teal-700 p-2' 
                        : 'bg-teal-600 hover:bg-teal-700 p-1.5'
                    }`}>
                      <Search className="h-4 w-4 text-white" />
                    </div>
                  </button>
                </div>

                {/* SEARCH SUGGESTIONS DROPDOWN */}
                {isSearchExpanded && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="text-xs font-semibold text-gray-900 mb-2">
                      {t('header:search.popularSearches')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            onSearch(suggestion);
                            setIsSearchExpanded(false);
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-teal-100 hover:text-teal-700 rounded-full text-xs text-gray-700 transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* TABLET SEARCH - Medium screens */}
          <div className="hidden md:flex lg:hidden flex-1 max-w-md mx-4" ref={mediumSearchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder={t('header:search.placeholder')}
                  className="block w-full pl-9 pr-8 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* DESKTOP USER ACTIONS - Authentication, language switcher, and user menu */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher variant="dropdown" size="md" showLabel={false} />

            {isAuthenticated ? (
              // AUTHENTICATED USER MENU
              <>
                {/* Favorites Button with notification badge */}
                <button className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors duration-200 relative">
                  <Heart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
                
                {/* Notifications Button with badge */}
                <button className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors duration-200 relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
                </button>
                
                {/* User Profile Menu */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full pl-3 pr-2 py-1 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">David M.</span>
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
              </>
            ) : (
              // UNAUTHENTICATED USER ACTIONS
              <div className="flex items-center space-x-2 xl:space-x-3">
                {/* Sign In Button */}
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium text-sm xl:text-base"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t('header:auth.signIn')}</span>
                </button>
                
                {/* Sign Up Button */}
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 bg-teal-600 text-white px-3 xl:px-4 py-2 rounded-full hover:bg-teal-700 transition-colors duration-200 font-medium text-sm xl:text-base"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{t('header:auth.signUp')}</span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER MENU BUTTON */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-teal-600 hover:bg-gray-100 transition-colors duration-200"
              aria-label={isMenuOpen ? t('header:mobile.close') : t('header:mobile.menu')}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* MOBILE SEARCH BAR - Below header on small screens */}
        <div className="md:hidden pb-3 sm:pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder={t('header:search.placeholder')}
                className="block w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all duration-200 text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* MOBILE/TABLET OVERLAY MENU */}
      {isMenuOpen && (
        <>
          {/* OVERLAY BACKDROP */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          
          {/* SLIDE-OUT MENU FROM LEFT */}
          <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* MENU HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-teal-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <div>
                  <h2 className="font-bold text-teal-600 text-lg">NyumbaTZ</h2>
                  <p className="text-xs text-gray-600">Find Your Perfect Home</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 space-y-6">
            
              {/* NAVIGATION LINKS SECTION */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Navigation</h3>
                <div className="space-y-1">
                  {navigationLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <link.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* LANGUAGE SWITCHER SECTION */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Language / Lugha</h3>
                <div className="px-3">
                  <LanguageSwitcher variant="dropdown" size="md" showLabel={true} />
                </div>
              </div>

              {/* USER SECTION */}
              {isAuthenticated ? (
                // AUTHENTICATED USER MOBILE MENU
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</h3>
                  
                  {/* User Profile Section */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">David Mwakibolwa</div>
                      <div className="text-sm text-gray-500">david.mwakibolwa@email.com</div>
                    </div>
                  </div>
                  
                  {/* User Action Links */}
                  <div className="space-y-1">
                    <a 
                      href="#favorites" 
                      className="flex items-center justify-between px-3 py-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5" />
                        <span>{t('header:user.favorites')}</span>
                      </div>
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">3</span>
                    </a>
                    
                    <a 
                      href="#notifications" 
                      className="flex items-center justify-between px-3 py-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5" />
                        <span>{t('header:user.notifications')}</span>
                      </div>
                      <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">2</span>
                    </a>
                    
                    <a 
                      href="#settings" 
                      className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>{t('header:user.settings')}</span>
                    </a>
                  </div>
                  
                  {/* Sign Out Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button 
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-5 w-5 rotate-180" />
                      <span>{t('header:auth.signOut')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                // UNAUTHENTICATED USER MOBILE MENU
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Get Started</h3>
                  <div className="space-y-3">
                    {/* Sign In Button */}
                    <button
                      onClick={() => {
                        onAuthClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors duration-200 font-medium"
                    >
                      <LogIn className="h-5 w-5" />
                      <span>{t('header:auth.signIn')}</span>
                    </button>
                    
                    {/* Sign Up Button */}
                    <button
                      onClick={() => {
                        onAuthClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium shadow-md"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>{t('header:auth.signUp')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* QUICK ACTIONS SECTION */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a 
                    href="#list-property"
                    className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-6 w-6 text-blue-600 mb-1" />
                    <span className="text-xs font-medium text-blue-700">List Property</span>
                  </a>
                  <a 
                    href="#help"
                    className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Phone className="h-6 w-6 text-green-600 mb-1" />
                    <span className="text-xs font-medium text-green-700">Get Help</span>
                  </a>
                </div>
              </div>

              {/* FOOTER INFO */}
              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-2">Made with ❤️ by</p>
                <p className="text-sm font-semibold text-teal-600">MalixTechnologies</p>
                <p className="text-xs text-gray-400 mt-1">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;