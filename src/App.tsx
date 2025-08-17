/**
 * APP COMPONENT - ROOT APPLICATION COMPONENT
 * 
 * This is the main application component that sets up routing, global state,
 * and coordinates between major application sections.
 * 
 * KEY RESPONSIBILITIES:
 * - Application routing setup (React Router)
 * - Global layout structure (Header, Main, Footer)
 * - Authentication state management
 * - Search coordination between Header and HomePage
 * - Global event handling and communication
 * 
 * ARCHITECTURE DECISIONS:
 * - Uses React Router for client-side routing
 * - Implements custom event system for component communication
 * - Maintains authentication state at app level
 * - Provides consistent layout structure
 * 
 * SCALABILITY NOTES:
 * - Easy to add new routes and pages
 * - Authentication can be replaced with any provider
 * - Global state can be enhanced with Context API or Redux
 * - Event system can be replaced with state management
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

import SuperAdminDashboard from './pages/SuperAdminDashboard';
import PropertyAdminDashboard from './pages/PropertyAdminDashboard';
import TenantDashboard from './pages/TenantDashboard';
import AuthModal from './components/AuthModal';
import { useAuth } from './contexts/AuthContext';

/**
 * MAIN APP COMPONENT
 * 
 * Root component that provides application structure and routing.
 */
function AppContent() {
  // Authentication state
  const { user, profile, loading } = useAuth();
  
  // Modal state
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  
  /**
   * SEARCH EVENT HANDLER
   * 
   * Handles search requests from the Header component.
   * Uses custom events to communicate with HomePage component.
   * This loose coupling allows for easy component replacement.
   * 
   * @param query - Search query from header
   */
  const handleSearch = (query: string) => {
    // Dispatch a custom event that HomePage can listen to
    const searchEvent = new CustomEvent('headerSearch', { detail: query });
    window.dispatchEvent(searchEvent);
  };

  /**
   * AUTHENTICATION HANDLER
   * 
   * Opens authentication modal with specified mode.
   */
  const handleAuthClick = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  /**
   * ROLE-BASED REDIRECT COMPONENT
   * 
   * Redirects authenticated users to their appropriate dashboard
   */
  const RoleBasedRedirect = () => {
    if (!user || !profile) {
      return <HomePage />;
    }

    // Redirect based on user role
    switch (profile.user_role) {
      case 'super_admin':
        return <Navigate to="/super-admin" replace />;
      case 'property_admin':
        return <Navigate to="/dashboard" replace />;
      case 'tenant':
        return <Navigate to="/tenant-dashboard" replace />;
      default:
        return <HomePage />;
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NyumbaLink...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing application...</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Refresh Page
          </button>
          <p className="text-xs text-gray-400 mt-2">If this persists, try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        {/* MAIN APPLICATION LAYOUT */}
        <div className="min-h-screen bg-gray-50 flex flex-col">
          
          {/* GLOBAL HEADER - Appears on all pages */}
          <Header 
            onSearch={handleSearch}           // Search functionality
            isAuthenticated={!!user}          // Authentication state
            onAuthClick={handleAuthClick}     // Authentication handler
            user={user}                       // User data
            profile={profile}                 // Profile data
          />
          
          {/* MAIN CONTENT AREA - Flexible height */}
          <main className="flex-1">
            <Routes>
              {/* HOME PAGE ROUTE - Redirects authenticated users to their dashboard */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* SUPER ADMIN DASHBOARD ROUTE - Protected */}
              <Route 
                path="/super-admin" 
                element={
                  user && profile?.user_role === 'super_admin' ? (
                    <SuperAdminDashboard />
                  ) : (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in as a Super Admin to access this page.</p>
                        <button
                          onClick={() => handleAuthClick('login')}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In as Super Admin
                        </button>
                      </div>
                    </div>
                  )
                }
              />

              {/* PROPERTY ADMIN DASHBOARD ROUTE - Protected */}
              <Route 
                path="/dashboard" 
                element={
                  user && profile?.user_role === 'property_admin' ? (
                    <PropertyAdminDashboard />
                  ) : (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in as a Property Admin to access this page.</p>
                        <button
                          onClick={() => handleAuthClick('login')}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In as Property Admin
                        </button>
                      </div>
                    </div>
                  )
                }
              />

              {/* TENANT DASHBOARD ROUTE - Protected */}
              <Route 
                path="/tenant-dashboard" 
                element={
                  user && profile?.user_role === 'tenant' ? (
                    <TenantDashboard />
                  ) : (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in as a Tenant to access this page.</p>
                        <button
                          onClick={() => handleAuthClick('login')}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In as Tenant
                        </button>
                      </div>
                    </div>
                  )
                }
              />
              
              {/* FUTURE ROUTES CAN BE ADDED HERE */}
              {/* <Route path="/property/:id" element={<PropertyDetailsPage />} /> */}
              {/* <Route path="/profile" element={<ProfilePage />} /> */}
            </Routes>
          </main>
          
          {/* GLOBAL FOOTER - Appears on all pages */}
          <Footer />
        </div>

        {/* AUTHENTICATION MODAL - Inside Router context */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authMode}
        />
      </Router>
    </>
  );
}

/**
 * MAIN APP COMPONENT WITH PROVIDERS
 * 
 * Wraps the application with necessary providers.
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;