# 🏠 NyumbaLink Supabase Setup Guide

This guide will help you set up Supabase for the NyumbaLink rental platform with all the necessary components.

## 📋 What's Included

✅ **Complete Database Schema**
- User profiles with role-based access (tenant/landlord)
- Property listings with comprehensive details
- Inquiry management system
- Row Level Security (RLS) policies

✅ **Storage Configuration**
- Property images bucket
- Secure file upload policies

✅ **Authentication Setup**
- Email/password authentication
- Automatic profile creation
- Role-based access control

✅ **Development Tools**
- TypeScript types generation
- Sample data for testing
- Verification scripts

## 🚀 Quick Start

### Step 1: Supabase Project Setup

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project**
3. **Get your credentials**:
   - Go to Settings > API
   - Copy your Project URL and anon/public key

### Step 2: Environment Configuration

Your `.env` file is already configured with:
```env
VITE_SUPABASE_URL=https://wnebeebaorhvejhyxjhz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Database Schema Setup

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250812000001_initial_schema.sql`
4. Paste and run the migration
5. Optionally run the seed data from `supabase/seed.sql`

**Option B: Using Supabase CLI**

```bash
# Install dependencies
npm install

# Run the setup verification
npm run supabase:verify
```

### Step 4: MCP Server Configuration

Your MCP server is configured in `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@supabase/mcp-server-supabase@latest", "--read-only", "--project-ref=wnebeebaorhvejhyxjhz"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "<personal-access-token>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

**To complete MCP setup:**
1. Get your Supabase Personal Access Token:
   - Go to https://supabase.com/dashboard/account/tokens
   - Create a new token
   - Copy the token

2. Replace `<personal-access-token>` in the MCP config with your actual token

## 🗄️ Database Schema Overview

### Tables Created

#### `profiles`
```sql
- id (UUID, references auth.users)
- full_name (TEXT)
- email (TEXT, unique)
- phone_number (TEXT, nullable)
- user_role (ENUM: 'tenant' | 'landlord')
- avatar_url (TEXT, nullable)
- is_verified (BOOLEAN, default false)
- created_at, updated_at (TIMESTAMP)
```

#### `properties`
```sql
- id (UUID, primary key)
- owner_id (UUID, references profiles)
- title, description (TEXT)
- property_type (ENUM: 'house' | 'apartment' | 'room')
- bedrooms, bathrooms (INTEGER)
- price_monthly (DECIMAL)
- city, area, address (TEXT)
- phone_contact (TEXT)
- images, amenities, utilities, nearby_services (TEXT[])
- is_available (BOOLEAN, default true)
- views_count, inquiries_count (INTEGER, default 0)
- created_at, updated_at (TIMESTAMP)
```

#### `property_inquiries`
```sql
- id (UUID, primary key)
- property_id (UUID, references properties)
- tenant_id (UUID, references profiles)
- tenant_name, tenant_phone, message (TEXT)
- status (ENUM: 'new' | 'contacted' | 'viewed')
- created_at, updated_at (TIMESTAMP)
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Automatic profile creation** when users sign up
- **Role-based access control** for landlords and tenants
- **Secure file upload** policies for property images

## 🛠️ Available Scripts

```bash
# Verify Supabase connection and setup
npm run supabase:verify

# Generate TypeScript types
npm run supabase:types

# Setup verification
npm run supabase:setup
```

## 🧪 Testing Your Setup

### 1. Run Verification Script
```bash
npm run supabase:verify
```

This will test:
- Database connection
- Table existence
- Storage bucket setup
- Authentication service

### 2. Test in Browser
1. Start the development server: `npm run dev`
2. Try registering a new user
3. Test property search functionality
4. Verify role-based access

### 3. Using MCP Tools
Once MCP is configured, you can:
- Query database tables directly
- Inspect schema
- Run read-only SQL queries
- Monitor database performance

## 📊 Sample Data

The setup includes realistic sample data:
- **7 properties** across Dar es Salaam, Mwanza, and Arusha
- **Realistic pricing** in Tanzanian Shillings
- **Local amenities** and services
- **Tanzanian addresses** and phone numbers

## 🔧 Development Workflow

### Making Schema Changes
1. Create new migration files in `supabase/migrations/`
2. Test changes locally
3. Apply to production database
4. Regenerate TypeScript types

### Adding New Features
1. Update database schema if needed
2. Update TypeScript types
3. Implement frontend components
4. Test with sample data

## 🚨 Important Security Notes

1. **Never commit `.env` files** - they contain sensitive credentials
2. **RLS policies are enforced** - all database access goes through security policies
3. **Use personal access tokens** for MCP server (not anon keys)
4. **Validate all user input** in your application layer

## 🆘 Troubleshooting

### Common Issues

**"Table doesn't exist" errors**
- Run the initial migration in Supabase SQL Editor
- Check that all tables were created successfully

**Authentication not working**
- Verify your Supabase URL and anon key
- Check that auth is enabled in your Supabase project

**MCP server connection fails**
- Ensure you have a valid personal access token
- Check that the project reference is correct
- Verify MCP server is properly configured

**RLS blocks queries**
- Ensure users are properly authenticated
- Check RLS policies match your use case
- Verify user roles are set correctly

### Getting Help

- Check the `supabase/README.md` for detailed documentation
- Run `npm run supabase:verify` to diagnose issues
- Review Supabase logs in the dashboard
- Check browser console for client-side errors

## 🎯 Next Steps

1. **Complete MCP setup** with your personal access token
2. **Test the database** using MCP tools
3. **Start implementing** the tasks from your spec
4. **Add real property data** for your target market

Your NyumbaLink platform is now ready for development! 🚀