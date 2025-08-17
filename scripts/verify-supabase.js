#!/usr/bin/env node

/**
 * Supabase Verification Script
 * 
 * This script verifies that Supabase is properly configured and connected.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function verifySupabase() {
    console.log('🔍 Verifying Supabase Configuration...');
    console.log('=====================================');

    // Check environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.log('❌ Missing Supabase environment variables');
        console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
        process.exit(1);
    }

    console.log('✅ Environment variables found');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        // Test connection by checking if we can query the profiles table
        console.log('🔌 Testing database connection...');
        
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (error) {
            console.log('❌ Database connection failed:', error.message);
            console.log('');
            console.log('Possible issues:');
            console.log('1. Database schema not yet created - run the initial migration');
            console.log('2. Incorrect Supabase credentials');
            console.log('3. Network connectivity issues');
            return false;
        }

        console.log('✅ Database connection successful');

        // Test storage bucket
        console.log('🗄️  Testing storage bucket...');
        
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.log('⚠️  Storage bucket check failed:', bucketError.message);
        } else {
            const propertyImagesBucket = buckets.find(bucket => bucket.name === 'property-images');
            if (propertyImagesBucket) {
                console.log('✅ Property images storage bucket found');
            } else {
                console.log('⚠️  Property images storage bucket not found - it will be created by migration');
            }
        }

        // Test authentication
        console.log('🔐 Testing authentication service...');
        
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
            console.log('❌ Authentication service error:', authError.message);
        } else {
            console.log('✅ Authentication service is working');
        }

        console.log('');
        console.log('🎉 Supabase verification completed successfully!');
        console.log('');
        console.log('Your NyumbaLink project is ready for development.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Start development server: npm run dev');
        console.log('2. Test user registration and login');
        console.log('3. Create some property listings');
        console.log('4. Set up MCP server for database management');

        return true;

    } catch (error) {
        console.log('❌ Verification failed:', error.message);
        return false;
    }
}

// Run verification
verifySupabase().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Verification script error:', error);
    process.exit(1);
});