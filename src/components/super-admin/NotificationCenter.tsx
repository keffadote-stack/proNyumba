/**
 * NOTIFICATION CENTER COMPONENT
 *
 * Centralized notification management for Super Admins.
 * Displays system notifications, employee activities, and platform alerts.
 *
 * KEY FEATURES:
 * - Real-time notification display
 * - Notification filtering and search
 * - Mark as read/unread functionality
 * - Notification history
 * - System alerts and warnings
 */

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/supabase";
import {
  Bell,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Info,
  Users,
  Building,
  DollarSign,
  Calendar,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  delivered_at: string | null;
  read_at: string | null;
}

interface NotificationData {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  data?: Record<string, unknown> | null;
  is_read?: boolean;
  created_at: string;
  delivered_at?: string | null;
  read_at?: string | null;
}

type NotificationFilter =
  | "all"
  | "unread"
  | "employee"
  | "booking"
  | "payment"
  | "system";

const NotificationCenter: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await db.notifications.getByUser(profile.id);

      if (error) {
        console.error("Error loading notifications:", error);
      } else {
        // Convert the data to match our Notification interface
        const notificationData = (data || []).map((item: NotificationData) => ({
          id: item.id,
          type: item.type || 'system',
          title: item.title || 'Notification',
          message: item.message || '',
          data: item.data || null,
          is_read: item.is_read ?? false,
          created_at: item.created_at,
          delivered_at: item.delivered_at || null,
          read_at: item.read_at || null
        }));
        setNotifications(notificationData);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notification.is_read) ||
      notification.type.includes(filter);

    return matchesSearch && matchesFilter;
  });

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await db.notifications.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark multiple notifications as read
  const markSelectedAsRead = async () => {
    try {
      const promises = selectedNotifications.map((id) =>
        db.notifications.markAsRead(id)
      );
      await Promise.all(promises);

      setNotifications((prev) =>
        prev.map((n) =>
          selectedNotifications.includes(n.id)
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "employee_invitation":
      case "employee_update":
        return Users;
      case "booking_request":
      case "booking_update":
        return Calendar;
      case "payment_confirmation":
      case "payment_update":
        return DollarSign;
      case "property_update":
      case "property_assignment":
        return Building;
      case "system_announcement":
      case "system_alert":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  // Get notification color
  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColor = isRead
      ? "text-gray-500 bg-gray-100"
      : "text-blue-600 bg-blue-100";

    switch (type) {
      case "employee_invitation":
      case "employee_update":
        return isRead
          ? "text-gray-500 bg-gray-100"
          : "text-blue-600 bg-blue-100";
      case "booking_request":
      case "booking_update":
        return isRead
          ? "text-gray-500 bg-gray-100"
          : "text-green-600 bg-green-100";
      case "payment_confirmation":
      case "payment_update":
        return isRead
          ? "text-gray-500 bg-gray-100"
          : "text-purple-600 bg-purple-100";
      case "property_update":
      case "property_assignment":
        return isRead
          ? "text-gray-500 bg-gray-100"
          : "text-orange-600 bg-orange-100";
      case "system_announcement":
      case "system_alert":
        return isRead ? "text-gray-500 bg-gray-100" : "text-red-600 bg-red-100";
      default:
        return baseColor;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle notification selection
  const handleNotificationSelect = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Notifications", count: notifications.length },
    {
      value: "unread",
      label: "Unread",
      count: notifications.filter((n) => !n.is_read).length,
    },
    {
      value: "employee",
      label: "Employee",
      count: notifications.filter((n) => n.type.includes("employee")).length,
    },
    {
      value: "booking",
      label: "Bookings",
      count: notifications.filter((n) => n.type.includes("booking")).length,
    },
    {
      value: "payment",
      label: "Payments",
      count: notifications.filter((n) => n.type.includes("payment")).length,
    },
    {
      value: "system",
      label: "System",
      count: notifications.filter((n) => n.type.includes("system")).length,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Notification Center
            </h2>
            <p className="text-gray-600">
              {unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "All notifications read"}
            </p>
          </div>
        </div>

        {selectedNotifications.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={markSelectedAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Mark as Read ({selectedNotifications.length})</span>
            </button>
            <button
              onClick={() => setSelectedNotifications([])}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as NotificationFilter)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filter !== "all"
                  ? "No notifications match your criteria"
                  : "No notifications yet"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(
                notification.type,
                notification.is_read
              );

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleNotificationSelect(notification.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            notification.is_read
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p
                        className={`text-sm ${
                          notification.is_read
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.message}
                      </p>

                      {notification.data && (
                        <div className="mt-2 text-xs text-gray-500">
                          {JSON.stringify(notification.data, null, 2)}
                        </div>
                      )}
                    </div>

                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
