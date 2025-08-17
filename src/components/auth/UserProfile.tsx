/**
 * USER PROFILE COMPONENT
 * 
 * Component for managing user profile information with role-specific fields.
 * Supports employee management fields for Property Admins.
 * 
 * KEY FEATURES:
 * - Role-specific profile fields
 * - Employee information management
 * - Profile image upload
 * - Account status management
 * - Performance metrics display (for Property Admins)
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Badge, Star, Save, Upload, Shield, Users, Home } from 'lucide-react';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { profile, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    avatar_url: profile?.avatar_url || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        console.error('Error updating profile:', error);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (role: string) => {
    const roleInfo = {
      super_admin: {
        title: 'Super Admin',
        description: 'Platform operator with full access',
        icon: Shield,
        color: 'purple'
      },
      property_admin: {
        title: 'Property Admin',
        description: 'Company employee managing properties',
        icon: Users,
        color: 'green'
      },
      tenant: {
        title: 'Tenant',
        description: 'Looking for property to rent',
        icon: Home,
        color: 'blue'
      }
    };
    return roleInfo[role as keyof typeof roleInfo] || roleInfo.tenant;
  };

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile.user_role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors">
                <Upload className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <RoleIcon className={`h-4 w-4 text-${roleInfo.color}-500`} />
              <span className="text-sm text-gray-600">{roleInfo.title}</span>
              {!profile.is_active && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                  Inactive
                </span>
              )}
              {profile.is_verified && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Verified
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{profile.full_name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{profile.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{profile.phone_number || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Employee-specific fields for Property Admins */}
        {profile.user_role === 'property_admin' && (
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <div className="flex items-center space-x-2">
                  <Badge className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{profile.employee_id || 'Not assigned'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hire Date
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {profile.hired_date 
                      ? new Date(profile.hired_date).toLocaleDateString()
                      : 'Not set'
                    }
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Rating
                </label>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {profile.performance_rating 
                      ? `${profile.performance_rating}/5.0`
                      : 'Not rated'
                    }
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    profile.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-gray-900">
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Description */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Role Information</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <RoleIcon className={`h-5 w-5 text-${roleInfo.color}-500`} />
              <span className="font-medium text-gray-900">{roleInfo.title}</span>
            </div>
            <p className="text-sm text-gray-600">{roleInfo.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;