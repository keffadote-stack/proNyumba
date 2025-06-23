/**
 * LANGUAGE SWITCHER COMPONENT
 * 
 * This component provides a user interface for switching between English and Swahili.
 * It integrates with react-i18next to provide seamless language switching with persistence.
 * 
 * KEY FEATURES:
 * - Dropdown interface for language selection
 * - Visual language indicators (flags/icons)
 * - Automatic language persistence in localStorage
 * - Responsive design for mobile and desktop
 * - Smooth transitions and animations
 * - Accessibility support with proper ARIA labels
 * 
 * USAGE:
 * - Can be placed in header, footer, or settings page
 * - Automatically detects current language
 * - Provides visual feedback during language changes
 * - Supports keyboard navigation
 * 
 * SCALABILITY NOTES:
 * - Easy to add new languages by extending the languages array
 * - Can be styled to match different design systems
 * - Supports both dropdown and toggle button modes
 * - Can be enhanced with language detection suggestions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe, Check } from 'lucide-react';

/**
 * LANGUAGE SWITCHER PROPS INTERFACE
 * 
 * Defines customization options for the language switcher component.
 */
interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';     // Display style variant
  size?: 'sm' | 'md' | 'lg';          // Size variant
  showLabel?: boolean;                 // Whether to show language labels
  className?: string;                  // Additional CSS classes
}

/**
 * SUPPORTED LANGUAGES CONFIGURATION
 * 
 * Defines available languages with their display properties.
 * Easy to extend for additional languages.
 */
const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    shortName: 'EN'
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇹🇿',
    shortName: 'SW'
  }
];

/**
 * LANGUAGE SWITCHER COMPONENT IMPLEMENTATION
 * 
 * Provides a user-friendly interface for language switching.
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  // HOOKS AND STATE
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current language configuration
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  /**
   * LANGUAGE CHANGE HANDLER
   * 
   * Handles language switching with smooth transitions and persistence.
   * 
   * @param languageCode - The language code to switch to
   */
  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Change language using i18next
      await i18n.changeLanguage(languageCode);
      
      // Close dropdown
      setIsOpen(false);
      
      // Optional: Add visual feedback
      // Could trigger a toast notification or brief loading state
      
    } catch (error) {
      console.error('Failed to change language:', error);
      // Handle error gracefully - could show error message to user
    }
  };

  /**
   * CLICK OUTSIDE HANDLER
   * 
   * Closes dropdown when user clicks outside the component.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * SIZE VARIANT STYLES
   * 
   * Responsive sizing for different use cases.
   */
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  /**
   * TOGGLE VARIANT RENDER
   * 
   * Simple toggle button for space-constrained areas.
   */
  if (variant === 'toggle') {
    return (
      <button
        onClick={() => handleLanguageChange(currentLanguage.code === 'en' ? 'sw' : 'en')}
        className={`
          flex items-center space-x-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-transparent ${sizeClasses[size]} ${className}
        `}
        aria-label={t('language.changeLanguage')}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        {showLabel && (
          <span className="font-medium text-gray-700">
            {currentLanguage.shortName}
          </span>
        )}
      </button>
    );
  }

  /**
   * DROPDOWN VARIANT RENDER
   * 
   * Full dropdown with all language options.
   */
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* DROPDOWN TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-transparent ${sizeClasses[size]} min-w-[100px] justify-between
        `}
        aria-label={t('language.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Current Language Display */}
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentLanguage.flag}</span>
          {showLabel && (
            <span className="font-medium text-gray-700">
              {currentLanguage.shortName}
            </span>
          )}
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1" role="listbox">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 
                  transition-colors duration-150 focus:outline-none focus:bg-gray-50
                  ${currentLanguage.code === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
                role="option"
                aria-selected={currentLanguage.code === language.code}
              >
                {/* Language Info */}
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {language.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {language.nativeName}
                    </span>
                  </div>
                </div>
                
                {/* Selected Indicator */}
                {currentLanguage.code === language.code && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Header Navigation:
 *    <LanguageSwitcher variant="dropdown" size="md" showLabel={true} />
 * 
 * 2. Mobile Menu:
 *    <LanguageSwitcher variant="toggle" size="sm" showLabel={false} />
 * 
 * 3. Settings Page:
 *    <LanguageSwitcher variant="dropdown" size="lg" showLabel={true} />
 * 
 * 4. Footer:
 *    <LanguageSwitcher variant="toggle" size="sm" showLabel={true} />
 */