---
inclusion: always
---

# NyumbaLink Business Model

## Core Business Logic

### User Hierarchy
- **Super Admin**: Platform operators who manage the business and employees
- **Property Admin**: Company employees who manage assigned properties
- **Tenant**: Property seekers who browse and book properties

### Revenue Model
- **Service Fee**: 20% service fee on all successful rentals
- **Payment Structure**: Tenant pays (Rent + 20% service fee), Property owner receives 100% of rent, Platform keeps 20% service fee
- **Employee Structure**: Property Admins are company employees, not independent landlords

## Key Implementation Guidelines

### Authentication & Authorization
- Implement three-tier role-based access control
- Super Admins can manage employees and assign properties
- Property Admins can only access assigned properties
- Tenants can browse available properties and make booking requests

### Property Management
- Properties are assigned to specific Property Admin employees
- Only assigned admins can manage their properties
- Super Admins can reassign properties between employees
- Property status affects availability and visibility

### Payment Processing
- Always calculate and display service fee (20%) separately
- Collect total amount (rent + service fee) from tenant
- Distribute 100% of rent to property owner
- Platform retains 20% service fee as revenue
- Generate receipts showing breakdown for all parties

### Employee Management
- Track employee performance with KPIs
- Monitor booking conversion rates and response times
- Provide performance analytics and rankings
- Support employee invitation and activation workflows

### Communication Flow
- Tenants communicate with assigned Property Admins
- Super Admins oversee all communications
- WhatsApp Business API integration for direct messaging
- Real-time notifications for booking requests and updates

## Technical Considerations

### Database Design
- Use role-based Row Level Security (RLS)
- Track employee assignments and performance
- Maintain audit trails for all transactions
- Support service fee calculations and distributions

### User Experience
- Role-specific dashboards and interfaces
- Mobile-first Progressive Web App design
- Clear service fee disclosure and breakdown
- Streamlined booking and payment workflows

### Security & Compliance
- Protect sensitive employee and financial data
- Implement proper access controls for each role
- Ensure payment security and PCI compliance
- Maintain GDPR compliance for user data