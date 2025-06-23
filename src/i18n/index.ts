/**
 * INTERNATIONALIZATION CONFIGURATION
 * 
 * This file sets up react-i18next for multi-language support in the NyumbaTZ platform.
 * Supports English and Swahili with automatic language detection and persistence.
 * 
 * KEY FEATURES:
 * - Automatic language detection from browser settings
 * - Language preference persistence in localStorage
 * - Fallback to English if translation missing
 * - Dynamic language switching without page reload
 * - Namespace organization for better code splitting
 * 
 * SCALABILITY NOTES:
 * - Easy to add new languages by adding translation files
 * - Namespace system supports feature-based translation organization
 * - Can be extended with pluralization rules for complex languages
 * - Supports interpolation for dynamic content
 * - Ready for lazy loading of translation files
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ENGLISH TRANSLATIONS
import enCommon from './locales/en/common.json';
import enHeader from './locales/en/header.json';
import enHero from './locales/en/hero.json';
import enProperty from './locales/en/property.json';
import enFooter from './locales/en/footer.json';
import enSearch from './locales/en/search.json';

// SWAHILI TRANSLATIONS
import swCommon from './locales/sw/common.json';
import swHeader from './locales/sw/header.json';
import swHero from './locales/sw/hero.json';
import swProperty from './locales/sw/property.json';
import swFooter from './locales/sw/footer.json';
import swSearch from './locales/sw/search.json';

/**
 * I18N CONFIGURATION
 * 
 * Configures react-i18next with language detection, fallbacks, and namespaces.
 * Uses browser language detection with localStorage persistence.
 */
i18n
  // LANGUAGE DETECTION PLUGIN
  // Automatically detects user's preferred language from browser settings
  .use(LanguageDetector)
  
  // REACT INTEGRATION PLUGIN
  // Provides React hooks and components for translations
  .use(initReactI18next)
  
  // INITIALIZATION CONFIGURATION
  .init({
    // LANGUAGE DETECTION CONFIGURATION
    detection: {
      // Detection order: localStorage -> navigator -> fallback
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user's language choice in localStorage
      caches: ['localStorage'],
      
      // localStorage key for language preference
      lookupLocalStorage: 'nyumbatz-language',
      
      // Check browser language settings
      checkWhitelist: true
    },

    // FALLBACK LANGUAGE CONFIGURATION
    fallbackLng: 'en',              // Default to English if detection fails
    lng: 'en',                      // Initial language (will be overridden by detection)
    
    // SUPPORTED LANGUAGES
    supportedLngs: ['en', 'sw'],    // English and Swahili only
    
    // NAMESPACE CONFIGURATION
    // Organizes translations by feature/component for better maintainability
    defaultNS: 'common',            // Default namespace for general translations
    ns: ['common', 'header', 'hero', 'property', 'footer', 'search'],
    
    // DEVELOPMENT CONFIGURATION
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
    
    // INTERPOLATION CONFIGURATION
    interpolation: {
      escapeValue: false,           // React already escapes values
      formatSeparator: ',',         // Separator for format functions
    },
    
    // TRANSLATION RESOURCES
    // Organized by language -> namespace -> translations
    resources: {
      // ENGLISH TRANSLATIONS
      en: {
        common: enCommon,           // General UI text, buttons, messages
        header: enHeader,           // Navigation, search, user menu
        hero: enHero,              // Landing section, search form
        property: enProperty,       // Property cards, details, amenities
        footer: enFooter,          // Footer links, contact info
        search: enSearch           // Search filters, results, sorting
      },
      
      // SWAHILI TRANSLATIONS
      sw: {
        common: swCommon,           // Maandishi ya jumla, vitufe, ujumbe
        header: swHeader,           // Urambazaji, utafutaji, menyu ya mtumiaji
        hero: swHero,              // Sehemu ya kuanzia, fomu ya utafutaji
        property: swProperty,       // Kadi za mali, maelezo, huduma
        footer: swFooter,          // Viungo vya footer, maelezo ya mawasiliano
        search: swSearch           // Vichujio vya utafutaji, matokeo, upangaji
      }
    },
    
    // REACT SPECIFIC CONFIGURATION
    react: {
      // Use React Suspense for loading states
      useSuspense: true,
      
      // Bind i18n instance to React component tree
      bindI18n: 'languageChanged',
      
      // Re-render components when language changes
      bindI18nStore: 'added removed',
      
      // Translation component configuration
      transEmptyNodeValue: '',     // Empty node fallback
      transSupportBasicHtmlNodes: true, // Support basic HTML in translations
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'] // Allowed HTML tags
    }
  });

export default i18n;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic Translation Hook:
 *    const { t } = useTranslation('common');
 *    <button>{t('buttons.save')}</button>
 * 
 * 2. Multiple Namespaces:
 *    const { t } = useTranslation(['common', 'property']);
 *    <h1>{t('property:title')}</h1>
 * 
 * 3. Interpolation:
 *    <p>{t('common:welcome', { name: 'John' })}</p>
 * 
 * 4. Language Switching:
 *    const { i18n } = useTranslation();
 *    i18n.changeLanguage('sw');
 * 
 * 5. Pluralization:
 *    <span>{t('property:bedrooms', { count: 3 })}</span>
 */