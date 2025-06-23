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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LandlordDashboard from './pages/LandlordDashboard';
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

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NyumbaTZ...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing application...</p>
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
              {/* HOME PAGE ROUTE */}
              <Route path="/" element={<HomePage />} />
              
              {/* LANDLORD DASHBOARD ROUTE - Protected */}
              <Route 
                path="/dashboard" 
                element={
                  user && profile?.user_role === 'landlord' ? (
                    <LandlordDashboard />
                  ) : (
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
                        <p className="text-gray-600 mb-6">You need to be logged in as a landlord to access this page.</p>
                        <button
                          onClick={() => handleAuthClick('login')}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Sign In as Landlord
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
      </Router>

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;