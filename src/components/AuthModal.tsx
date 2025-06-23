/**
 * AUTHENTICATION MODAL COMPONENT
 * 
 * Modal component for user login and registration.
 * Provides a clean, mobile-friendly interface for authentication.
 * 
 * KEY FEATURES:
 * - Login and registration forms
 * - Role selection (tenant/landlord)
 * - Form validation
 * - Error handling
 * - Loading states
 * - Mobile-responsive design
 * 
 * MVP FOCUS:
 * - Simple email/password authentication
 * - Clear user role selection
 * - Good user experience
 * - Proper error messages
 */

import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login' 
}) => {
  // State
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    userRole: 'tenant' as 'tenant' | 'landlord'
  });

  // Auth context
  const { signIn, signUp } = useAuth();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        userRole: 'tenant'
      });
      setError(null);
      setSuccess(null);
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Enhanced form validation
  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (mode === 'register') {
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return false;
      }
      if (formData.fullName.trim().length < 2) {
        setError('Full name must be at least 2 characters');
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        setError('Phone number is required');
        return false;
      }
      // Basic phone number validation for Tanzania
      const phoneRegex = /^(\+255|0)[67]\d{8}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid Tanzanian phone number (e.g., 0712345678)');
        return false;
      }
    }

    return true;
  };

  // Handle form submission with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        console.log('Attempting login...', formData.email);
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          console.error('Login error:', error);
          
          // Handle specific login errors
          if (error.message?.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message?.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else {
            setError(error.message || 'Failed to sign in. Please try again.');
          }
        } else {
          setSuccess('Successfully signed in!');
          setTimeout(() => onClose(), 1000);
        }
      } else {
        console.log('Attempting signup...', { 
          email: formData.email, 
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          userRole: formData.userRole 
        });
        
        const { error } = await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          userRole: formData.userRole
        });
        
        if (error) {
          console.error('Signup error:', error);
          
          // Handle specific error cases
          if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
            setError('An account with this email already exists. Please try signing in instead.');
          } else if (error.message?.includes('Invalid email')) {
            setError('Please enter a valid email address.');
          } else if (error.message?.includes('Password')) {
            setError('Password must be at least 6 characters long.');
          } else if (error.message?.includes('rate limit')) {
            setError('Too many attempts. Please wait a moment and try again.');
          } else if (error.message?.includes('network')) {
            setError('Network error. Please check your internet connection and try again.');
          } else {
            setError(error.message || 'Failed to create account. Please try again.');
          }
        } else {
          setSuccess('Account created successfully! You can now sign in.');
          // Switch to login mode after successful signup
          setTimeout(() => {
            setMode('login');
            setSuccess(null);
            setFormData(prev => ({ ...prev, password: '' })); // Clear password but keep email
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      if (error.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Add formatting
    if (value.startsWith('255')) {
      value = '+' + value;
    } else if (value.startsWith('0')) {
      // Keep as is
    } else if (value.length > 0) {
      value = '0' + value;
    }
    
    setFormData(prev => ({ ...prev, phoneNumber: value }));
    setError(null);
  };

  // Handle name input (capitalize first letters)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    setFormData(prev => ({ ...prev, fullName: value }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Fields */}
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 0712345678"
                      required
                    />
                  </div>
                </div>

                {/* User Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I am a
                  </label>
                  <select
                    name="userRole"
                    value={formData.userRole}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="tenant">Tenant (Looking for property)</option>
                    <option value="landlord">Landlord (Have property to rent)</option>
                  </select>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                  setSuccess(null);
                }}
                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Terms for Registration */}
          {mode === 'register' && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;