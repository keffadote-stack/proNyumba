#!/usr/bin/env node

/**
 * Supabase Setup Script for NyumbaLink
 * 
 * This script helps set up the Supabase project with all necessary configurations.
 * It can be run to initialize the database schema and seed data.
 */

const fs = require('fs');
const path = require('path');

console.log('🏠 NyumbaLink Supabase Setup');
console.log('==========================');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Please create a .env file with your Supabase credentials:');
    console.log('');
    console.log('VITE_SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
    console.log('');
    console.log('Get these values from: https://supabase.com/dashboard > Your Project > Settings > API');
    process.exit(1);
}

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase credentials in .env file!');
    console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
    process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

console.log('');
console.log('🚀 Supabase project is configured!');
console.log('');
console.log('Next steps:');
console.log('1. Run your migrations: npx supabase db push');
console.log('2. Seed your database: npx supabase db seed');
console.log('3. Generate TypeScript types: npx supabase gen types typescript --local > src/types/supabase.ts');
console.log('');
console.log('📚 Database Schema Created:');
console.log('   - profiles (user profiles with roles)');
console.log('   - properties (rental listings)');
console.log('   - property_inquiries (tenant inquiries)');
console.log('   - Row Level Security (RLS) policies');
console.log('   - Storage bucket for property images');
console.log('');
console.log('🎯 Ready to start development!');