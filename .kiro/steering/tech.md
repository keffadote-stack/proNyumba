# Technology Stack

## Frontend Framework
- **React 18** with TypeScript for type safety
- **Vite** as build tool and dev server
- **React Router DOM** with role-based route protection
- **Progressive Web App (PWA)** capabilities

## Styling & UI
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** component library for consistent design
- **Lucide React** for icons
- Mobile-first responsive design with PWA features

## Backend & Database
- **Supabase** for backend-as-a-service
  - Role-based authentication with RLS
  - PostgreSQL database with employee management
  - Real-time subscriptions for notifications
  - File storage for property images
  - Edge functions for business logic

## Payment Processing
- **Stripe** or local payment gateway integration
- Automated service fee calculation (20%)
- Payment distribution and revenue tracking
- PCI DSS compliant payment processing

## Communication
- **WhatsApp Business API** for direct messaging
- **Email notifications** for booking updates
- **Push notifications** for PWA users
- Real-time in-app messaging system

## Development Tools
- **ESLint** with TypeScript support
- **PostCSS** with Autoprefixer
- **TypeScript** with strict mode enabled

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Build Configuration
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **JSX**: react-jsx
- Strict TypeScript with unused variable checks
- Vite optimizations exclude `lucide-react`