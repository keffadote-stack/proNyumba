---
inclusion: always
---

# User Roles and Permissions

## Super Admin Role

### Responsibilities
- Manage Property Admin employees (hire, fire, assign properties)
- Monitor business performance and revenue analytics
- Oversee platform operations and system health
- Handle employee performance tracking and KPIs

### Permissions
- Full access to all platform features and data
- Employee management (CRUD operations)
- Property assignment and reassignment
- Business analytics and financial reporting
- System configuration and settings

### Key Features
- Employee management dashboard
- Business analytics with revenue tracking
- Property assignment interface
- Performance monitoring and reporting
- Platform oversight and system metrics

## Property Admin Role

### Responsibilities
- Manage assigned properties (create, edit, update listings)
- Handle booking requests from tenants
- Communicate with potential tenants
- Maintain property information and images
- Track personal performance metrics

### Permissions
- Access only to assigned properties
- Booking request management for assigned properties
- Property listing creation and editing
- Tenant communication and scheduling
- Personal performance dashboard access

### Key Features
- Assigned property management interface
- Booking request handling system
- Property creation and editing forms
- Calendar integration for viewings
- Performance metrics dashboard

## Tenant Role

### Responsibilities
- Browse and search available properties
- Submit booking requests for property viewings
- Communicate with Property Admins
- Complete payment processing with service fees
- Provide feedback after property viewings

### Permissions
- View all available properties
- Create booking requests
- Access personal booking history
- Process payments for selected properties
- Communicate with assigned Property Admins

### Key Features
- Property browsing and search interface
- Advanced filtering and search capabilities
- Booking request submission system
- Payment processing with service fee breakdown
- Saved properties and favorites management

## Role-Based Access Control Implementation

### Authentication Flow
1. User selects role during registration
2. System validates role permissions
3. Role-specific dashboard and features are loaded
4. Access control enforced at component and API level

### Permission Matrix
```
Feature                    | Super Admin | Property Admin | Tenant
---------------------------|-------------|----------------|--------
Employee Management        | ✓           | ✗              | ✗
Property Assignment        | ✓           | ✗              | ✗
Business Analytics         | ✓           | Limited        | ✗
Property Management        | ✓           | Assigned Only  | ✗
Booking Management         | ✓           | Assigned Only  | Own Only
Payment Processing         | ✓           | View Only      | Own Only
Tenant Communication       | ✓           | ✓              | ✓
Performance Metrics        | All         | Own Only       | ✗
```

### Security Considerations
- Row Level Security (RLS) enforces data access
- API endpoints validate user roles
- Frontend components check permissions
- Audit logging tracks role-based actions