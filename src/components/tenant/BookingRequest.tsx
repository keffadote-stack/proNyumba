/**
 * BOOKING REQUEST COMPONENT
 * 
 * Allows tenants to submit booking requests for property viewings.
 * Includes date/time selection, contact information, and message.
 * 
 * Features:
 * - Date and time selection for viewing appointments
 * - Contact information form
 * - Optional message/requirements
 * - Form validation and submission
 * - Mobile-first responsive design
 */

import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Send, X } from 'lucide-react';
import { Property, BookingRequest as BookingRequestType } from '../../types';

interface BookingRequestProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: Partial<BookingRequestType>) => Promise<void>;
}

const BookingRequest: React.FC<BookingRequestProps> = ({
  property,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    preferredViewingDate: '',
    preferredViewingTime: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tenantName.trim()) {
      newErrors.tenantName = 'Full name is required';
    }

    if (!formData.tenantPhone.trim()) {
      newErrors.tenantPhone = 'Phone number is required';
    } else if (!/^(\+255|0)[67]\d{8}$/.test(formData.tenantPhone.replace(/\s/g, ''))) {
      newErrors.tenantPhone = 'Please enter a valid Tanzanian phone number';
    }

    if (!formData.tenantEmail.trim()) {
      newErrors.tenantEmail = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.tenantEmail)) {
      newErrors.tenantEmail = 'Please enter a valid email address';
    }

    if (!formData.preferredViewingDate) {
      newErrors.preferredViewingDate = 'Please select a viewing date';
    }

    if (!formData.preferredViewingTime) {
      newErrors.preferredViewingTime = 'Please select a viewing time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData: Partial<BookingRequestType> = {
        propertyId: property.id,
        tenantName: formData.tenantName,
        tenantPhone: formData.tenantPhone,
        tenantEmail: formData.tenantEmail,
        preferredViewingDate: formData.preferredViewingDate,
        preferredViewingTime: formData.preferredViewingTime,
        message: formData.message || undefined,
        status: 'pending'
      };

      await onSubmit(bookingData);
      
      // Reset form and close modal
      setFormData({
        tenantName: '',
        tenantPhone: '',
        tenantEmail: '',
        preferredViewingDate: '',
        preferredViewingTime: '',
        message: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting booking request:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg sm:rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Request Viewing
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Schedule a visit to {property.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Property Info */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{property.title}</h3>
            <p className="text-sm text-gray-600">
              {property.location.city}, {property.location.district}
            </p>
            <p className="text-sm font-medium text-teal-600 mt-1">
              {new Intl.NumberFormat('en-TZ', {
                style: 'currency',
                currency: 'TZS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(property.priceMonthly)}/month
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Your Information
            </h3>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={(e) => handleInputChange('tenantName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                  errors.tenantName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.tenantName && (
                <p className="text-red-500 text-xs mt-1">{errors.tenantName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData.tenantPhone}
                  onChange={(e) => handleInputChange('tenantPhone', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                    errors.tenantPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+255 712 345 678"
                />
              </div>
              {errors.tenantPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.tenantPhone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                    errors.tenantEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.tenantEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.tenantEmail}</p>
              )}
            </div>
          </div>

          {/* Viewing Schedule */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Preferred Viewing Time
            </h3>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                value={formData.preferredViewingDate}
                onChange={(e) => handleInputChange('preferredViewingDate', e.target.value)}
                min={getMinDate()}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm ${
                  errors.preferredViewingDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.preferredViewingDate && (
                <p className="text-red-500 text-xs mt-1">{errors.preferredViewingDate}</p>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleInputChange('preferredViewingTime', time)}
                    className={`flex items-center justify-center px-3 py-2 border rounded-lg text-sm transition-colors ${
                      formData.preferredViewingTime === time
                        ? 'bg-teal-100 border-teal-500 text-teal-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {time}
                  </button>
                ))}
              </div>
              {errors.preferredViewingTime && (
                <p className="text-red-500 text-xs mt-1">{errors.preferredViewingTime}</p>
              )}
            </div>
          </div>

          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                placeholder="Any specific requirements or questions about the property..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingRequest;