# Project Structure

## Root Directory
```
├── src/                    # Source code
├── supabase/              # Database migrations
├── .kiro/                 # Kiro AI assistant configuration
├── .bolt/                 # Bolt configuration
├── node_modules/          # Dependencies
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── .env                   # Environment variables (not committed)
```

## Source Directory Structure (`src/`)
```
src/
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   │   ├── AuthModal.tsx # Role-based authentication modal
│   │   ├── RoleSelector.tsx # User role selection
│   │   └── ProtectedRoute.tsx # Route protection by role
│   ├── super-admin/      # Super Admin specific components
│   │   ├── EmployeeManagement.tsx # Admin employee CRUD
│   │   ├── BusinessAnalytics.tsx # Revenue and performance analytics
│   │   ├── PropertyAssignment.tsx # Assign properties to admins
│   │   └── PlatformOverview.tsx # System-wide metrics
│   ├── property-admin/   # Property Admin specific components
│   │   ├── PropertyManagement.tsx # Assigned property management
│   │   ├── BookingManagement.tsx # Handle booking requests
│   │   ├── PerformanceMetrics.tsx # Admin KPI dashboard
│   │   └── PropertyForm.tsx # Property creation/editing
│   ├── tenant/           # Tenant specific components
│   │   ├── PropertyBrowser.tsx # Property discovery interface
│   │   ├── PropertyDetails.tsx # Detailed property view
│   │   ├── BookingRequest.tsx # Viewing request form
│   │   ├── PaymentProcessor.tsx # Service fee payment handling
│   │   └── SavedProperties.tsx # Favorites management
│   ├── shared/           # Shared components across roles
│   │   ├── Header.tsx    # Role-aware navigation
│   │   ├── NotificationCenter.tsx # Real-time notifications
│   │   ├── SearchFilters.tsx # Advanced property filtering
│   │   ├── PropertyCard.tsx # Property listing card
│   │   ├── ImageGallery.tsx # Property image management
│   │   ├── CommunicationHub.tsx # WhatsApp/messaging integration
│   │   └── PaymentBreakdown.tsx # Service fee display
│   └── ui/               # Shadcn/ui components
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Role-based authentication
│   ├── NotificationContext.tsx # Real-time notifications
│   └── PaymentContext.tsx # Payment processing state
├── pages/                # Page-level components
│   ├── SuperAdminDashboard.tsx # Super admin main interface
│   ├── PropertyAdminDashboard.tsx # Property admin main interface
│   ├── TenantDashboard.tsx # Tenant main interface
│   └── PropertyDetailsPage.tsx # Standalone property view
├── hooks/                # Custom React hooks
│   ├── useEmployeeManagement.tsx # Super admin employee operations
│   ├── usePropertyManagement.tsx # Property admin operations
│   ├── useBookingManagement.tsx # Booking workflow management
│   └── usePaymentProcessing.tsx # Payment and service fee handling
├── types/                # TypeScript type definitions
│   ├── index.ts          # Shared types and interfaces
│   └── supabase.ts       # Supabase database types
├── lib/                  # External service configurations
│   ├── supabase.ts       # Supabase client setup
│   ├── payment.ts        # Payment gateway integration
│   ├── whatsapp.ts       # WhatsApp Business API
│   └── analytics.ts      # Business analytics utilities
├── App.tsx               # Root application component
├── main.tsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Architecture Patterns

### Component Organization
- **Components**: Reusable UI components with single responsibility
- **Pages**: Route-level components that compose multiple components
- **Contexts**: Global state management using React Context API

### File Naming Conventions
- **Components**: PascalCase (e.g., `PropertyCard.tsx`)
- **Pages**: PascalCase with "Page" suffix (e.g., `HomePage.tsx`)
- **Utilities**: camelCase (e.g., `mockData.ts`)
- **Types**: camelCase with descriptive names (e.g., `index.ts`)

### Import Organization
1. React and external libraries first
2. Internal components and utilities
3. Types and interfaces
4. Relative imports last

### State Management
- **Local State**: useState for component-specific state
- **Global State**: React Context for authentication and shared state
- **Server State**: Supabase real-time subscriptions

### Routing Structure
- `/` - Home page with property listings
- `/dashboard` - Landlord dashboard (protected route)
- Future routes: `/property/:id`, `/profile`, etc.

## Key Architectural Decisions
- **Custom Events**: Used for loose coupling between components (e.g., search communication)
- **Role-based Access**: Authentication context provides user roles for route protection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Internationalization**: Built-in support for multiple languages