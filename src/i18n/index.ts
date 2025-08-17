/**
 * INTERNATIONALIZATION CONFIGURATION
 * 
 * Sets up i18next for multi-language support in the application.
 * Currently supports English and Swahili.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      close: 'Close'
    },
    title: {
      maintitle: {
        highlight: 'Find Your Perfect Home in Tanzania'
      },
      subtitle: 'Discover quality rental properties across major Tanzanian cities'
    },
    searchForm: {
      location: {
        label: 'Location',
        allCities: 'All Cities'
      },
      propertyType: {
        label: 'Property Type',
        allTypes: 'All Types',
        house: 'House',
        apartment: 'Apartment',
        studio: 'Studio',
        villa: 'Villa',
        room: 'Room'
      },
      bedrooms: {
        label: 'Bedrooms',
        any: 'Any',
        bedroom: 'bedroom',
        bedrooms: 'bedrooms'
      },
      price: {
        label: 'Price Range',
        helperText: 'Enter your budget range'
      },
      searchButton: 'Search Properties',
      tips: 'Search tips: Try "Dar es Salaam", "500000", or "2 bedrooms"'
    },
    currency: {
      tshs: 'TSh'
    },
    stats: {
      properties: {
        count: '1,000+',
        label: 'Properties Available'
      },
      cities: {
        count: '10+',
        label: 'Cities Covered'
      },
      tenants: {
        count: '5,000+',
        label: 'Happy Tenants'
      }
    },
    hero: {
      title: {
        main: 'Find Your Perfect',
        highlight: 'Home in Tanzania'
      },
      subtitle: 'Discover quality rental properties across major Tanzanian cities',
      searchForm: {
        location: {
          label: 'Location',
          allCities: 'All Cities'
        },
        propertyType: {
          label: 'Property Type',
          allTypes: 'All Types',
          house: 'House',
          apartment: 'Apartment',
          studio: 'Studio',
          villa: 'Villa',
          room: 'Room'
        },
        bedrooms: {
          label: 'Bedrooms',
          any: 'Any',
          bedroom: 'bedroom',
          bedrooms: 'bedrooms'
        },
        price: {
          label: 'Price Range',
          anyPrice: 'Any Price',
          helperText: 'Enter your budget range'
        },
        searchButton: 'Search Properties',
        tips: 'Search tips: Try "Dar es Salaam", "500000", or "2 bedrooms"'
      },
      currency: {
        tshs: 'TSh'
      },
      stats: {
        properties: {
          count: '1,000+',
          label: 'Properties Available'
        },
        cities: {
          count: '10+',
          label: 'Cities Covered'
        },
        tenants: {
          count: '5,000+',
          label: 'Happy Tenants'
        }
      }
    },
    header: {
      navigation: {
        properties: 'Properties',
        about: 'About',
        contact: 'Contact'
      },
      search: {
        placeholder: 'Search properties...',
        expandedPlaceholder: 'Search by location, price, or property type...',
        popularSearches: 'Popular Searches'
      },
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out'
      },
      user: {
        favorites: 'Favorites',
        notifications: 'Notifications',
        settings: 'Settings'
      },
      mobile: {
        menu: 'Menu',
        close: 'Close'
      }
    },
    footer: {
      company: {
        name: 'NyumbaLink',
        description: 'Your trusted platform for finding quality rental properties in Tanzania. Connecting property owners with tenants through a seamless, secure experience.'
      },
      social: {
        title: 'Follow Us'
      },
      language: {
        selectLanguage: 'Select Language'
      },
      quickLinks: {
        title: 'Quick Links',
        searchProperties: 'Search Properties',
        listProperty: 'List Your Property',
        howItWorks: 'How It Works',
        pricing: 'Pricing',
        faqs: 'FAQs'
      },
      support: {
        title: 'Support',
        supportTitle: 'Support',
        helpCenter: 'Help Center',
        contactSupport: 'Contact Support',
        reportIssue: 'Report Issue',
        safetyTips: 'Safety Tips',
        legalTitle: 'Legal',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
        cookiePolicy: 'Cookie Policy',
        refundPolicy: 'Refund Policy'
      },
      contact: {
        title: 'Contact Info',
        phone: '+255 123 456 789',
        phoneLabel: 'Phone',
        email: 'info@nyumbalink.co.tz',
        emailLabel: 'Email',
        whatsapp: 'WhatsApp',
        whatsappNumber: '+255 123 456 789',
        address: '123 Uhuru Street, Dar es Salaam',
        addressLabel: 'Address',
        citiesTitle: 'We Serve'
      },
      newsletter: {
        title: 'Stay Updated',
        description: 'Get the latest property listings and market insights delivered to your inbox.',
        subscribe: 'Subscribe'
      },
      bottom: {
        copyright: '© 2024 NyumbaLink. All rights reserved.',
        madeWith: 'Made with',
        by: 'by',
        systemStatus: 'System Status'
      }
    }
  },
  sw: {
    common: {
      loading: 'Inapakia...',
      error: 'Kosa',
      success: 'Mafanikio',
      cancel: 'Ghairi',
      save: 'Hifadhi',
      delete: 'Futa',
      edit: 'Hariri',
      view: 'Ona',
      search: 'Tafuta',
      filter: 'Chuja',
      sort: 'Panga',
      next: 'Ifuatayo',
      previous: 'Iliyotangulia',
      close: 'Funga'
    },
    title: {
      maintitle: {
        highlight: 'Pata Nyumba Yako Bora Tanzania'
      },
      subtitle: 'Gundua nyumba za ubora za kukodisha katika miji mikuu ya Tanzania'
    },
    searchForm: {
      location: {
        label: 'Mahali',
        allCities: 'Miji Yote'
      },
      propertyType: {
        label: 'Aina ya Nyumba',
        allTypes: 'Aina Zote',
        house: 'Nyumba',
        apartment: 'Ghorofa',
        studio: 'Studio',
        villa: 'Villa',
        room: 'Chumba'
      },
      bedrooms: {
        label: 'Vyumba vya Kulala',
        any: 'Yoyote',
        bedroom: 'chumba',
        bedrooms: 'vyumba'
      },
      price: {
        label: 'Bei',
        helperText: 'Weka bajeti yako'
      },
      searchButton: 'Tafuta Nyumba',
      tips: 'Vidokezo: Jaribu "Dar es Salaam", "500000", au "vyumba 2"'
    },
    currency: {
      tshs: 'TSh'
    },
    stats: {
      properties: {
        count: '1,000+',
        label: 'Nyumba Zinapatikana'
      },
      cities: {
        count: '10+',
        label: 'Miji Inayohudumika'
      },
      tenants: {
        count: '5,000+',
        label: 'Wakodishaji Wenye Furaha'
      }
    },
    hero: {
      title: {
        main: 'Pata Nyumba Yako',
        highlight: 'Bora Tanzania'
      },
      subtitle: 'Gundua nyumba za ubora za kukodisha katika miji mikuu ya Tanzania',
      searchForm: {
        location: {
          label: 'Mahali',
          allCities: 'Miji Yote'
        },
        propertyType: {
          label: 'Aina ya Nyumba',
          allTypes: 'Aina Zote',
          house: 'Nyumba',
          apartment: 'Ghorofa',
          studio: 'Studio',
          villa: 'Villa',
          room: 'Chumba'
        },
        bedrooms: {
          label: 'Vyumba vya Kulala',
          any: 'Yoyote',
          bedroom: 'chumba',
          bedrooms: 'vyumba'
        },
        price: {
          label: 'Bei',
          anyPrice: 'Bei Yoyote',
          helperText: 'Weka bajeti yako'
        },
        searchButton: 'Tafuta Nyumba',
        tips: 'Vidokezo: Jaribu "Dar es Salaam", "500000", au "vyumba 2"'
      },
      currency: {
        tshs: 'TSh'
      },
      stats: {
        properties: {
          count: '1,000+',
          label: 'Nyumba Zinapatikana'
        },
        cities: {
          count: '10+',
          label: 'Miji Inayohudumika'
        },
        tenants: {
          count: '5,000+',
          label: 'Wakodishaji Wenye Furaha'
        }
      }
    },
    header: {
      navigation: {
        properties: 'Nyumba',
        about: 'Kuhusu',
        contact: 'Mawasiliano'
      },
      search: {
        placeholder: 'Tafuta nyumba...',
        expandedPlaceholder: 'Tafuta kwa eneo, bei, au aina ya nyumba...',
        popularSearches: 'Utafutaji Maarufu'
      },
      auth: {
        signIn: 'Ingia',
        signUp: 'Jisajili',
        signOut: 'Toka'
      },
      user: {
        favorites: 'Pendekezo',
        notifications: 'Arifa',
        settings: 'Mipangilio'
      },
      mobile: {
        menu: 'Menyu',
        close: 'Funga'
      }
    },
    footer: {
      company: {
        name: 'NyumbaLink',
        description: 'Jukwaa lako la kuaminika la kupata nyumba za ubora za kukodisha Tanzania. Tunawaungania wamiliki wa nyumba na wakodishaji kupitia uzoefu salama na rahisi.'
      },
      social: {
        title: 'Tufuate'
      },
      language: {
        selectLanguage: 'Chagua Lugha'
      },
      quickLinks: {
        title: 'Viungo vya Haraka',
        searchProperties: 'Tafuta Nyumba',
        listProperty: 'Orodhesha Nyumba Yako',
        howItWorks: 'Jinsi Inavyofanya Kazi',
        pricing: 'Bei',
        faqs: 'Maswali Yanayoulizwa Mara kwa Mara'
      },
      support: {
        title: 'Msaada',
        supportTitle: 'Msaada',
        helpCenter: 'Kituo cha Msaada',
        contactSupport: 'Wasiliana na Msaada',
        reportIssue: 'Ripoti Tatizo',
        safetyTips: 'Vidokezo vya Usalama',
        legalTitle: 'Kisheria',
        termsOfService: 'Masharti ya Huduma',
        privacyPolicy: 'Sera ya Faragha',
        cookiePolicy: 'Sera ya Vidakuzi',
        refundPolicy: 'Sera ya Kurudisha Pesa'
      },
      contact: {
        title: 'Maelezo ya Mawasiliano',
        phone: '+255 123 456 789',
        phoneLabel: 'Simu',
        email: 'info@nyumbalink.co.tz',
        emailLabel: 'Barua Pepe',
        whatsapp: 'WhatsApp',
        whatsappNumber: '+255 123 456 789',
        address: '123 Barabara ya Uhuru, Dar es Salaam',
        addressLabel: 'Anwani',
        citiesTitle: 'Tunahudumia'
      },
      newsletter: {
        title: 'Baki Umejulishwa',
        description: 'Pata orodha za nyumba za hivi karibuni na maarifa ya soko yaliyoletwa kwenye sanduku lako la barua.',
        subscribe: 'Jiandikishe'
      },
      bottom: {
        copyright: '© 2024 NyumbaLink. Haki zote zimehifadhiwa.',
        madeWith: 'Imetengenezwa kwa',
        by: 'na',
        systemStatus: 'Hali ya Mfumo'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    lng: 'en', // Force English language
    
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;