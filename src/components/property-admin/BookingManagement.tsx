/**
 * BOOKING MANAGEMENT COMPONENT
 * 
 * Allows Property Admins to manage booking requests:
 * - View all booking requests for assigned properties
 * - Approve or decline booking requests
 * - Schedule property viewings
 * - Communicate with tenants
 * - Track booking status and history
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/supabase';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  X, 
  MessageCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react';

interface BookingRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  preferred_viewing_date: string;
  preferred_viewing_time: string;
  message: string | null;
  status: 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
  admin_response: string | null;
  scheduled_date: string | null;
  feedback_rating: number | null;
  feedback_comment: string | null;
  created_at: string;
  updated_at: string;
  properties?: {
    title: string;
    city: string;
    area: string;
    rent_amount: number;
    service_fee_amount: number;
    total_amount: number;
  };
}

interface BookingManagementProps {
  onStatsUpdate?: () => void;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'decline'>('approve');

  /**
   * Load booking requests for this admin
   */
  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await db.bookingRequests.getByAdmin(user.id);
      
      if (error) {
        console.error('Error loading bookings:', error);
        return;
      }

      setBookings(data || []);
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  /**
   * Handle booking response (approve/decline)
   */
  const handleBookingResponse = async () => {
    if (!selectedBooking) return;

    try {
      const updateData: any = {
        status: actionType === 'approve' ? 'approved' : 'declined',
        admin_response: responseText
      };

      if (actionType === 'approve' && scheduledDate) {
        updateData.scheduled_date = scheduledDate;
      }

      const { error } = await db.bookingRequests.update(selectedBooking.id, updateData);
      
      if (error) {
        console.error('Error updating booking:', error);
        return;
      }

      // Reload bookings
      await loadBookings();
      
      // Close modal
      setShowResponseModal(false);
      setSelectedBooking(null);
      setResponseText('');
      setScheduledDate('');
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  /**
   * Open response modal
   */
  const openResponseModal = (booking: BookingRequest, action: 'approve' | 'decline') => {
    setSelectedBooking(booking);
    setActionType(action);
    setShowResponseModal(true);
    setResponseText('');
    setScheduledDate('');
  };

  /**
   * Filter bookings based on search and status
   */
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.tenant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.properties?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.properties?.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /**
   * Get status badge color
   */
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Format date and time
   */
  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString();
    return time ? `${dateStr} at ${time}` : dateStr;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <p className="text-gray-600">Manage viewing requests for your properties</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Booking Requests</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'No bookings match your search criteria.' 
              : 'You haven\'t received any booking requests yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Property Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.properties?.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{booking.properties?.area}, {booking.properties?.city}</span>
                      <span className="mx-2">•</span>
                      <span className="font-medium">TSh {booking.properties?.total_amount.toLocaleString()}/month</span>
                    </div>

                    {/* Tenant Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>{booking.tenant_name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{booking.tenant_phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{booking.tenant_email}</span>
                      </div>
                    </div>

                    {/* Viewing Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Preferred: {formatDateTime(booking.preferred_viewing_date, booking.preferred_viewing_time)}</span>
                      </div>
                      {booking.scheduled_date && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Scheduled: {formatDateTime(booking.scheduled_date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    {booking.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">
                          <MessageCircle className="h-4 w-4 inline mr-1" />
                          {booking.message}
                        </p>
                      </div>
                    )}

                    {/* Admin Response */}
                    {booking.admin_response && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-blue-800">
                          <strong>Your Response:</strong> {booking.admin_response}
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {booking.feedback_rating && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-green-800">Tenant Feedback:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < booking.feedback_rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        {booking.feedback_comment && (
                          <p className="text-sm text-green-700">{booking.feedback_comment}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => openResponseModal(booking, 'approve')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => openResponseModal(booking, 'decline')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Decline
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-4">
                  <span className="text-xs text-gray-500">
                    Requested on {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                  {booking.updated_at !== booking.created_at && (
                    <span className="text-xs text-gray-500">
                      Updated {new Date(booking.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'approve' ? 'Approve' : 'Decline'} Booking Request
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Property:</strong> {selectedBooking.properties?.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tenant:</strong> {selectedBooking.tenant_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Preferred Date:</strong> {formatDateTime(selectedBooking.preferred_viewing_date, selectedBooking.preferred_viewing_time)}
                </p>
              </div>

              {actionType === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Viewing Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message
                </label>
                <textarea
                  rows={3}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={actionType === 'approve' 
                    ? 'Confirm the viewing details and provide any additional instructions...'
                    : 'Explain why the request is being declined...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedBooking(null);
                    setResponseText('');
                    setScheduledDate('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingResponse}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                    actionType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve Request' : 'Decline Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && !showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Detailed booking information would go here */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Property Information</h4>
                  <p className="text-gray-600">{selectedBooking.properties?.title}</p>
                  <p className="text-gray-600">{selectedBooking.properties?.area}, {selectedBooking.properties?.city}</p>
                  <p className="text-gray-600">TSh {selectedBooking.properties?.total_amount.toLocaleString()}/month</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Tenant Information</h4>
                  <p className="text-gray-600">Name: {selectedBooking.tenant_name}</p>
                  <p className="text-gray-600">Phone: {selectedBooking.tenant_phone}</p>
                  <p className="text-gray-600">Email: {selectedBooking.tenant_email}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Viewing Request</h4>
                  <p className="text-gray-600">
                    Preferred Date: {formatDateTime(selectedBooking.preferred_viewing_date, selectedBooking.preferred_viewing_time)}
                  </p>
                  {selectedBooking.scheduled_date && (
                    <p className="text-gray-600">
                      Scheduled Date: {formatDateTime(selectedBooking.scheduled_date)}
                    </p>
                  )}
                  <p className="text-gray-600">Status: {selectedBooking.status}</p>
                </div>

                {selectedBooking.message && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Tenant Message</h4>
                    <p className="text-gray-600">{selectedBooking.message}</p>
                  </div>
                )}

                {selectedBooking.admin_response && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Response</h4>
                    <p className="text-gray-600">{selectedBooking.admin_response}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;