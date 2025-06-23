/**
 * LANDLORD DASHBOARD - MVP PROPERTY MANAGEMENT
 * 
 * Simple dashboard for landlords to manage their property listings.
 * Includes property listing, editing, and basic analytics.
 * 
 * KEY FEATURES:
 * - View all landlord properties
 * - Add new property with amenities
 * - Edit/Delete existing properties
 * - Basic property statistics
 * - Contact inquiries management
 * - Mobile-first responsive design
 * 
 * MVP FOCUS:
 * - Simple, clean interface
 * - Essential functionality only
 * - Local storage for data persistence
 * - No complex features
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  MessageCircle,
  Home,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Camera,
  Save,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

// Types for MVP
interface Property {
  id: string;
  title: string;
  description: string;
  type: 'house' | 'apartment' | 'room';
  bedrooms: number;
  bathrooms: number;
  price: number;
  city: string;
  area: string;
  phone: string;
  images: string[];
  amenities: string[];
  utilities: string[];
  nearbyServices: string[];
  createdAt: string;
  isAvailable: boolean;
  views: number;
  inquiries: number;
}

interface Contact {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantPhone: string;
  message: string;
  timestamp: string;
  status: 'new' | 'contacted' | 'viewed';
}

const LandlordDashboard: React.FC = () => {
  // State Management
  const [properties, setProperties] = useState<Property[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'contacts' | 'analytics'>('properties');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'house' as 'house' | 'apartment' | 'room',
    bedrooms: 1,
    bathrooms: 1,
    price: '',
    city: '',
    area: '',
    phone: '',
    images: [] as string[],
    amenities: [] as string[],
    utilities: [] as string[],
    nearbyServices: [] as string[]
  });

  // Available Options
  const amenitiesOptions = [
    'Parking', 'Security Guard', 'CCTV', 'Generator', 'Water Tank', 
    'Garden', 'Balcony', 'Furnished', 'Kitchen', 'Dining Room'
  ];

  const utilitiesOptions = [
    'Electricity (TANESCO)', 'Water (DAWASA)', 'Internet Ready', 
    'Solar Power', 'Backup Generator', 'Water Pump'
  ];

  const nearbyServicesOptions = [
    'Hospital', 'Clinic', 'Primary School', 'Secondary School', 
    'University', 'Market', 'Supermarket', 'Bank', 'ATM', 
    'Bus Stop', 'Taxi Stand', 'Restaurant', 'Pharmacy', 'Police Station'
  ];

  const tanzanianCities = [
    'Dar es Salaam', 'Mwanza', 'Arusha', 'Mbeya', 'Morogoro', 
    'Tanga', 'Dodoma', 'Moshi', 'Iringa', 'Mtwara'
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProperties = localStorage.getItem('landlord_properties');
    const savedContacts = localStorage.getItem('property_contacts');
    
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('landlord_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('property_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Form Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayToggle = (array: string[], item: string, field: 'amenities' | 'utilities' | 'nearbyServices') => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleImageAdd = () => {
    // This function is now handled by ImageUpload component
    console.log('Image upload handled by ImageUpload component');
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const propertyData: Property = {
      id: editingProperty?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      price: parseInt(formData.price),
      city: formData.city,
      area: formData.area,
      phone: formData.phone,
      images: formData.images.length > 0 ? formData.images : [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      amenities: formData.amenities,
      utilities: formData.utilities,
      nearbyServices: formData.nearbyServices,
      createdAt: editingProperty?.createdAt || new Date().toISOString(),
      isAvailable: true,
      views: editingProperty?.views || 0,
      inquiries: editingProperty?.inquiries || 0
    };

    if (editingProperty) {
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? propertyData : p));
    } else {
      setProperties(prev => [...prev, propertyData]);
    }

    // Reset form
    setFormData({
      title: '', description: '', type: 'house', bedrooms: 1, bathrooms: 1,
      price: '', city: '', area: '', phone: '', images: [], 
      amenities: [], utilities: [], nearbyServices: []
    });
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const handleEdit = (property: Property) => {
    setFormData({
      title: property.title,
      description: property.description,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      price: property.price.toString(),
      city: property.city,
      area: property.area,
      phone: property.phone,
      images: property.images,
      amenities: property.amenities,
      utilities: property.utilities,
      nearbyServices: property.nearbyServices
    });
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Calculate statistics
  const totalProperties = properties.length;
  const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
  const totalInquiries = properties.reduce((sum, p) => sum + p.inquiries, 0);
  const availableProperties = properties.filter(p => p.isAvailable).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Landlord Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your property listings</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Property</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{totalInquiries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableProperties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'properties', label: 'My Properties', icon: Home },
                { id: 'contacts', label: 'Inquiries', icon: MessageCircle },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'properties' && (
              <div>
                {properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first property listing</p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Property
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative h-48">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              onClick={() => handleEdit(property)}
                              className="bg-white bg-opacity-90 p-1.5 rounded-full hover:bg-opacity-100 transition-colors"
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="bg-white bg-opacity-90 p-1.5 rounded-full hover:bg-opacity-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{property.area}, {property.city}</span>
                          </div>
                          
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(property.price)}/month
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              property.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {property.isAvailable ? 'Available' : 'Rented'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm text-gray-600 mb-3">
                            <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
                            <span>{property.views} views</span>
                          </div>
                          
                          {/* Amenities Preview */}
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {property.amenities.slice(0, 3).map((amenity) => (
                                <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {amenity}
                                </span>
                              ))}
                              {property.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{property.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                              View Details
                            </button>
                            <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                              <Phone className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Inquiries</h3>
                {contacts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No inquiries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{contact.tenantName}</h4>
                            <p className="text-sm text-gray-600">{contact.tenantPhone}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            contact.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {contact.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{contact.message}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {new Date(contact.timestamp).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                              Call
                            </button>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                              WhatsApp
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Most Viewed Properties</h4>
                    <div className="space-y-2">
                      {properties
                        .sort((a, b) => b.views - a.views)
                        .slice(0, 5)
                        .map((property) => (
                          <div key={property.id} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 truncate">{property.title}</span>
                            <span className="text-sm font-medium text-gray-900">{property.views} views</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Properties by City</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        properties.reduce((acc, property) => {
                          acc[property.city] = (acc[property.city] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([city, count]) => (
                        <div key={city} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{city}</span>
                          <span className="text-sm font-medium text-gray-900">{count} properties</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Property Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProperty(null);
                    setFormData({
                      title: '', description: '', type: 'house', bedrooms: 1, bathrooms: 1,
                      price: '', city: '', area: '', phone: '', images: [], 
                      amenities: [], utilities: [], nearbyServices: []
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 3 Bedroom House in Kinondoni"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="house">House</option>
                      <option value="apartment">Apartment</option>
                      <option value="room">Room</option>
                      <option value="studio">Studio</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (TZS)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 800000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 0712345678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select City</option>
                      {tanzanianCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area/District</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Kinondoni, Mikocheni"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your property in detail..."
                  />
                </div>

                {/* Images */}
                <div>
                  <ImageUpload
                    images={formData.images}
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    maxSizePerImage={5}
                  />
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {amenitiesOptions.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleArrayToggle(formData.amenities, amenity, 'amenities')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Utilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utilities Available</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {utilitiesOptions.map((utility) => (
                      <label key={utility} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.utilities.includes(utility)}
                          onChange={() => handleArrayToggle(formData.utilities, utility, 'utilities')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{utility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Nearby Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Services</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {nearbyServicesOptions.map((service) => (
                      <label key={service} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.nearbyServices.includes(service)}
                          onChange={() => handleArrayToggle(formData.nearbyServices, service, 'nearbyServices')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingProperty(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingProperty ? 'Update Property' : 'Add Property'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;