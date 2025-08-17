# NyumbaLink

**NyumbaLink** is a comprehensive property management platform that connects property owners with potential tenants through a structured employee management system. The platform operates with three distinct user roles and generates revenue through automated service fee collection.

## 🏠 Platform Overview

### User Roles
- **Super Admin**: Platform operators who manage the business and employees
- **Property Admin**: Company employees who manage assigned properties
- **Tenant**: Property seekers who browse and book properties

### Business Model
- **Service Fee**: 20% service fee on all successful rentals
- **Payment Structure**: Tenant pays (Rent + 20% service fee), Property owner receives 100% of rent, Platform keeps 20% service fee
- **Employee Structure**: Property Admins are company employees, not independent landlords

## 🚀 Key Features

### For Super Admins
- Employee management with property assignment
- Business analytics and revenue tracking
- Platform oversight and system metrics
- Performance monitoring and reporting

### For Property Admins
- Assigned property management interface
- Booking request handling system
- Performance metrics dashboard
- Calendar integration for viewings

### For Tenants
- Property browsing and search interface
- Advanced filtering and search capabilities
- Booking request submission system
- Payment processing with service fee breakdown

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time, Storage)
- **Payment**: Stripe or local payment gateway integration
- **Communication**: WhatsApp Business API for direct messaging
- **PWA**: Progressive Web App capabilities with offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Supabase account
- Payment gateway account (Stripe recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nyumbalink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Supabase credentials

4. **Database Setup**
   - Go to your Supabase dashboard
   - Run the migration from `scripts/create-database.sql`

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run supabase:verify  # Verify Supabase connection
npm run supabase:types   # Generate TypeScript types
```

---

**NyumbaLink** - Connecting Properties, Empowering Communities 🏠