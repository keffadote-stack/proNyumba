# NyumbaLink Supabase Configuration

This directory contains all the Supabase configuration files for the NyumbaLink rental platform.

## 📁 Directory Structure

```
supabase/
├── config.toml              # Supabase local development configuration
├── migrations/              # Database schema migrations
│   └── 20250812000001_initial_schema.sql
├── seed.sql                 # Sample data for development
└── README.md               # This file
```

## 🚀 Quick Setup

### 1. Prerequisites

- Node.js (v16 or higher)
- Supabase account at [supabase.com](https://supabase.com)
- Supabase CLI (optional for local development)

### 2. Environment Configuration

1. Copy `.env.example` to `.env`
2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings > API
   - Copy the Project URL and anon/public key

3. Update your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/20250812000001_initial_schema.sql`
4. Run the migration
5. Optionally, run the seed data from `seed.sql`

#### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-id

# Push migrations to remote database
supabase db push

# Seed the database (optional)
supabase db seed
```

## 📊 Database Schema

### Tables

#### `profiles`
User profiles extending Supabase Auth users.
- **Purpose**: Store additional user information and roles
- **Key Fields**: `user_role` (tenant/landlord), `is_verified`, contact info
- **Relationships**: One-to-one with `auth.users`

#### `properties`
Rental property listings.
- **Purpose**: Store all property information and metadata
- **Key Fields**: Property details, location, pricing, amenities
- **Relationships**: Many-to-one with `profiles` (owner)

#### `property_inquiries`
Tenant inquiries for properties.
- **Purpose**: Manage communication between tenants and landlords
- **Key Fields**: Inquiry message, status, contact information
- **Relationships**: Many-to-one with both `properties` and `profiles`

### Security

#### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

- **Profiles**: Public read, users can only modify their own
- **Properties**: Public read for available properties, owners can manage their own
- **Inquiries**: Users can create and view their own, property owners can view inquiries for their properties

#### Storage
- **Bucket**: `property-images` for property photos
- **Policies**: Public read, authenticated users can upload, users can manage their own images

## 🔧 Database Functions

### `increment_property_views(property_id UUID)`
Safely increments the view count for a property.

### `handle_new_user()`
Automatically creates a profile when a new user signs up.

## 📝 Sample Data

The `seed.sql` file contains sample properties across different Tanzanian cities:
- Dar es Salaam (various areas)
- Mwanza
- Arusha

Sample data includes realistic:
- Property types (houses, apartments, rooms)
- Pricing in Tanzanian Shillings
- Local amenities and services
- Tanzanian addresses and phone numbers

## 🛠️ Development Workflow

### 1. Making Schema Changes

1. Create a new migration file:
```bash
supabase migration new your_migration_name
```

2. Write your SQL changes in the new migration file

3. Test locally:
```bash
supabase start
supabase db reset
```

4. Push to remote:
```bash
supabase db push
```

### 2. Updating TypeScript Types

After schema changes, regenerate types:
```bash
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

### 3. Testing

Use the seed data for consistent testing:
```bash
supabase db seed
```

## 🔍 Useful Queries

### Get all available properties with owner info:
```sql
SELECT 
  p.*,
  pr.full_name as owner_name,
  pr.phone_number as owner_phone
FROM properties p
JOIN profiles pr ON p.owner_id = pr.id
WHERE p.is_available = true
ORDER BY p.created_at DESC;
```

### Get property inquiries for a landlord:
```sql
SELECT 
  pi.*,
  p.title as property_title
FROM property_inquiries pi
JOIN properties p ON pi.property_id = p.id
WHERE p.owner_id = 'landlord-user-id'
ORDER BY pi.created_at DESC;
```

## 🚨 Important Notes

1. **Never commit sensitive data**: The `.env` file is gitignored for security
2. **RLS is enforced**: All database access goes through Row Level Security policies
3. **Automatic profile creation**: Profiles are created automatically when users sign up
4. **Image storage**: Property images are stored in Supabase Storage, not as database BLOBs
5. **Indexes**: The schema includes performance indexes for common queries

## 🆘 Troubleshooting

### Common Issues

1. **Migration fails**: Check for syntax errors in SQL files
2. **RLS blocks queries**: Ensure you're authenticated and have proper permissions
3. **Types out of sync**: Regenerate TypeScript types after schema changes
4. **Seed data fails**: Ensure migrations are applied first

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Project Issues](https://github.com/your-repo/issues)

## 📈 Performance Considerations

- **Indexes**: Created on commonly queried fields (city, price, availability)
- **Full-text search**: Implemented for property search functionality
- **Trigram indexes**: For fuzzy search capabilities
- **Connection pooling**: Configured in `config.toml`

## 🔐 Security Best Practices

- RLS policies enforce data access rules
- Input validation in application layer
- Secure file upload policies
- Regular security audits recommended
- Environment variables for sensitive data