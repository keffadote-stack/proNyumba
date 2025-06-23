import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  Calendar,
  Phone,
  Mail,
  Car,
  Shield,
  Zap,
  Wifi,
  Home,
  Star,
  Flag,
  MessageCircle
} from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'parking':
        return <Car className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'security':
        return <Shield className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'generator':
        return <Zap className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'internet':
        return <Wifi className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Home className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hi, I'm interested in your property: ${property.title}. Location: ${property.location.address}, ${property.location.city}. Price: ${formatPrice(property.priceMonthly)}/month. Can we discuss more details?`;
    const whatsappUrl = `https://wa.me/255712345678?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneCall = () => {
    window.location.href = 'tel:+255712345678';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile-First Responsive */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to search</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                <span className="text-xs sm:text-sm">Save</span>
              </button>
              
              <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
              </button>
              
              <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-600 hover:text-orange-600 transition-colors">
                <Flag className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Property Title & Location - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{property.title}</h1>
          <div className="flex items-center text-gray-600 mb-3 sm:mb-4">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="text-sm sm:text-base lg:text-lg">
              {property.location.address}, {property.location.city}, {property.location.district}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-6 text-gray-600 text-sm sm:text-base">
            <div className="flex items-center">
              <Bed className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span>{property.bedrooms} bedrooms</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span>{property.bathrooms} bathrooms</span>
            </div>
            <div className="flex items-center">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span className="capitalize">{property.propertyType}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Image Gallery - Mobile-First */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-64 sm:h-80 lg:h-96">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? property.images.length - 1 : prev - 1
                      )}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all"
                    >
                      <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === property.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Image Thumbnails - Responsive */}
              {property.images.length > 1 && (
                <div className="flex space-x-2 p-3 sm:p-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                About this property / Kuhusu mali hii
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{property.description}</p>
            </div>

            {/* Amenities - Mobile-First Grid */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Amenities / Huduma
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700 text-sm sm:text-base">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Location / Mahali
              </h2>
              <div className="h-48 sm:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <MapPin className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2" />
                  <p className="text-sm sm:text-base">Interactive map coming soon</p>
                  <p className="text-xs sm:text-sm mt-1">
                    {property.location.address}, {property.location.city}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking & Contact - Mobile-First */}
          <div className="space-y-4 sm:space-y-6">
            {/* Pricing Card - Responsive */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 sticky top-20 sm:top-24">
              <div className="mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatPrice(property.priceMonthly)}
                </div>
                <div className="text-gray-600 text-sm sm:text-base">per month</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  + {formatPrice(property.priceMonthly * 0.15)} service fee
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* WhatsApp Contact Button */}
                <button
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base shadow-md"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>WhatsApp Owner</span>
                </button>

                {/* Phone Call Button */}
                <button
                  onClick={handlePhoneCall}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base shadow-md"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Call Owner</span>
                </button>
              </div>

              {/* Property Stats - Responsive */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                  <span>Property ID:</span>
                  <span className="font-mono">{property.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mt-2">
                  <span>Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                    {property.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Contact Info - Mobile-Optimized */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Property Owner / Mmiliki
              </h3>
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm sm:text-base">Property Owner</div>
                  <div className="text-xs sm:text-sm text-gray-600">Verified owner</div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={handlePhoneCall}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Owner</span>
                </button>
                <button 
                  onClick={handleWhatsAppContact}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;