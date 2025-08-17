/**
 * HOMEPAGE COMPONENT - REFACTORED
 * 
 * This component now serves as a simple wrapper around the PropertySearch component.
 * The main search functionality has been moved to components/property-search/ for better organization.
 * 
 * @deprecated The main implementation is now in PropertySearch component
 */

import React from 'react';
import PropertySearch from '../components/property-search/PropertySearch';

const HomePage: React.FC = () => {
  return <PropertySearch />;
};

export default HomePage;