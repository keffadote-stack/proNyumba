/**
 * FOOTER COMPONENT - COMPREHENSIVE SITE FOOTER
 * 
 * This component provides a comprehensive footer with company information, navigation links,
 * contact details, newsletter signup, and social media links. Fully internationalized
 * with react-i18next for English and Swahili support.
 * 
 * KEY FEATURES:
 * - Responsive design optimized for all screen sizes
 * - Complete internationalization with react-i18next
 * - Newsletter subscription form with responsive layout
 * - Social media links with hover effects
 * - Contact information with multiple channels
 * - Legal and support links organization
 * - Language switcher integration
 * - Bilingual content display
 * 
 * RESPONSIVE DESIGN:
 * - Mobile: Single column layout with stacked sections
 * - Tablet: 2-column grid with reorganized content
 * - Desktop: 4-column grid with full feature display
 * - Newsletter form adapts from stacked to inline layout
 * 
 * INTERNATIONALIZATION:
 * - All text content translatable
 * - Dynamic year display
 * - Currency and contact info localization
 * - Bilingual link labels where appropriate
 * 
 * SCALABILITY NOTES:
 * - Easy to add new footer sections
 * - Social media links easily configurable
 * - Newsletter integration ready for API connection
 * - Contact information supports multiple channels
 * - Legal links can be dynamically managed
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Phone, 
  Mail, 
  MapPin,
  Heart,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * FOOTER COMPONENT IMPLEMENTATION
 * 
 * Comprehensive footer with full internationalization support.
 */
const Footer: React.FC = () => {
  // INTERNATIONALIZATION HOOKS
  const { t } = useTranslation(['footer', 'common']);
  
  // DYNAMIC YEAR CALCULATION
  const currentYear = new Date().getFullYear();

  /**
   * SOCIAL MEDIA LINKS CONFIGURATION
   * 
   * Centralized social media configuration with hover colors and accessibility.
   * Easy to modify or extend with additional platforms.
   */
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'hover:text-red-600' }
  ];

  /**
   * QUICK LINKS CONFIGURATION
   * 
   * Main navigation and feature links with internationalization keys.
   * Supports both English and Swahili labels.
   */
  const quickLinks = [
    { nameKey: 'quickLinks.searchProperties', href: '#' },
    { nameKey: 'quickLinks.listProperty', href: '#' },
    { nameKey: 'quickLinks.howItWorks', href: '#' },
    { nameKey: 'quickLinks.pricing', href: '#' },
    { nameKey: 'quickLinks.faq', href: '#' }
  ];

  /**
   * LEGAL LINKS CONFIGURATION
   * 
   * Legal and policy links with internationalization support.
   */
  const legalLinks = [
    { nameKey: 'support.termsOfService', href: '#' },
    { nameKey: 'support.privacyPolicy', href: '#' },
    { nameKey: 'support.cookiePolicy', href: '#' },
    { nameKey: 'support.refundPolicy', href: '#' }
  ];

  /**
   * SUPPORT LINKS CONFIGURATION
   * 
   * Customer support and help links.
   */
  const supportLinks = [
    { nameKey: 'support.helpCenter', href: '#' },
    { nameKey: 'support.contactSupport', href: '#' },
    { nameKey: 'support.reportIssue', href: '#' },
    { nameKey: 'support.safetyTips', href: '#' }
  ];

  /**
   * CITIES CONFIGURATION
   * 
   * Major cities served by the platform.
   * Could be dynamically loaded from API in production.
   */
  const cities = [
    'Dar es Salaam',
    'Mwanza',
    'Arusha',
    'Mbeya',
    'Morogoro',
    'Tanga'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* COMPANY INFO SECTION */}
          <div className="space-y-4">
            <div>
              {/* Company Logo and Name */}
              <h2 className="text-2xl font-bold text-teal-400">
                {t('footer:company.name')}
              </h2>
              
              {/* Company Description */}
              <p className="text-gray-300 mt-2 text-sm leading-relaxed">
                {t('footer:company.description')}
              </p>
            </div>

            {/* SOCIAL MEDIA LINKS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">
                {t('footer:social.title')}
              </h3>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`p-2 bg-gray-800 rounded-full transition-colors duration-200 ${social.color} hover:bg-gray-700`}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* LANGUAGE SWITCHER */}
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">
                {t('common:language.selectLanguage')}
              </h3>
              <LanguageSwitcher variant="dropdown" size="sm" showLabel={true} />
            </div>
          </div>

          {/* QUICK LINKS SECTION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              {t('footer:quickLinks.title')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.nameKey}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-teal-400 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span>{t(`footer:${link.nameKey}`)}</span>
                    <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT & LEGAL SECTION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              {t('footer:support.title')}
            </h3>
            <div className="space-y-4">
              
              {/* Support Links */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  {t('footer:support.supportTitle')}
                </h4>
                <ul className="space-y-1">
                  {supportLinks.map((link) => (
                    <li key={link.nameKey}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-teal-400 transition-colors duration-200 text-sm"
                      >
                        {t(`footer:${link.nameKey}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Legal Links */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  {t('footer:support.legalTitle')}
                </h4>
                <ul className="space-y-1">
                  {legalLinks.map((link) => (
                    <li key={link.nameKey}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-teal-400 transition-colors duration-200 text-sm"
                      >
                        {t(`footer:${link.nameKey}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CONTACT INFO & CITIES SECTION */}
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">
              {t('footer:contact.title')}
            </h3>
            
            {/* CONTACT INFORMATION */}
            <div className="space-y-3 mb-6">
              
              {/* Phone Contact */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-600 rounded-full">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{t('footer:contact.phone')}</p>
                  <p className="text-gray-500 text-xs">{t('footer:contact.phoneLabel')}</p>
                </div>
              </div>
              
              {/* Email Contact */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-600 rounded-full">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{t('footer:contact.email')}</p>
                  <p className="text-gray-500 text-xs">{t('footer:contact.emailLabel')}</p>
                </div>
              </div>
              
              {/* WhatsApp Contact */}
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{t('footer:contact.whatsapp')}</p>
                  <p className="text-gray-500 text-xs">{t('footer:contact.whatsappNumber')}</p>
                </div>
              </div>
              
              {/* Physical Address */}
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-600 rounded-full">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{t('footer:contact.address')}</p>
                  <p className="text-gray-500 text-xs">{t('footer:contact.addressLabel')}</p>
                </div>
              </div>
            </div>

            {/* CITIES WE SERVE */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                {t('footer:contact.citiesTitle')}
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {cities.map((city) => (
                  <a
                    key={city}
                    href="#"
                    className="text-gray-400 hover:text-teal-400 transition-colors duration-200 text-xs"
                  >
                    {city}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER SIGNUP SECTION */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            
            {/* Newsletter Header */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-200">
                {t('footer:newsletter.title')}
              </h3>
              <p className="text-gray-400 text-sm">
                {t('footer:newsletter.description')}
              </p>
            </div>
            
            {/* Newsletter Form - Fully Responsive */}
            <div className="w-full md:w-auto md:min-w-[320px] lg:min-w-[400px]">
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-0">
                <input
                  type="email"
                  placeholder={t('footer:newsletter.placeholder')}
                  className="flex-1 px-4 py-3 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-gray-400 text-sm sm:text-base min-w-0"
                />
                <button className="px-6 py-3 sm:py-2.5 bg-teal-600 hover:bg-teal-700 rounded-lg sm:rounded-l-none sm:rounded-r-lg transition-colors duration-200 font-medium text-sm sm:text-base whitespace-nowrap">
                  {t('footer:newsletter.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            
            {/* Copyright and Attribution */}
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>{t('footer:bottom.copyright', { year: currentYear })}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{t('footer:bottom.madeWith')}</span>
              <Heart className="h-4 w-4 text-red-500 fill-current hidden sm:inline" />
              <span className="hidden sm:inline">{t('footer:bottom.by')}</span>
            </div>
            
            {/* System Status */}
            <div className="flex items-center space-x-4 text-gray-400 text-sm">
              <span className="hidden lg:inline">{t('footer:bottom.poweredBy')}</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('footer:bottom.systemStatus')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;