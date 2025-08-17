import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySchema() {
    console.log('🔍 Checking database schema...');
    
    try {
        // Test if users table exists with the new schema
        const { data, error } = await supabase
            .from('users')
            .select('id, user_role, employee_id')
            .limit(1);
            
        if (error) {
            console.log('❌ Users table not found or schema mismatch:', error.message);
            return false;
        }
        
        console.log('✅ Users table exists with enhanced schema');
        
        // Test properties table
        const { data: propData, error: propError } = await supabase
            .from('properties')
            .select('id, assigned_admin_id, service_fee_amount')
            .limit(1);
            
        if (propError) {
            console.log('❌ Properties table not found or schema mismatch:', propError.message);
            return false;
        }
        
        console.log('✅ Properties table exists with service fee calculation');
        
        // Test employee_performance table
        const { data: perfData, error: perfError } = await supabase
            .from('employee_performance')
            .select('id, admin_id, conversion_rate')
            .limit(1);
            
        if (perfError) {
            console.log('❌ Employee performance table not found:', perfError.message);
            return false;
        }
        
        console.log('✅ Employee performance table exists');
        
        console.log('🎉 Database schema verification completed successfully!');
        return true;
        
    } catch (error) {
        console.log('❌ Verification failed:', error.message);
        return false;
    }
}

verifySchema().then(success => {
    process.exit(success ? 0 : 1);
});