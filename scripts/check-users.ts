/**
 * Script to check users in the users_local table
 * 
 * Usage:
 *   npx tsx scripts/check-users.ts
 * 
 * Requires environment variables:
 *   - VITE_SUPABASE_URL or SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY
 * 
 * Alternative: Run scripts/check-users.sql in Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js';

async function checkUsers() {
  console.log('🔍 Checking users in users_local table...\n');

  // Get environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ Missing Supabase URL environment variable');
    console.error('   Please set VITE_SUPABASE_URL or SUPABASE_URL');
    console.error('\n💡 Alternative: Run scripts/check-users.sql in Supabase SQL Editor');
    process.exit(1);
  }

  if (!supabaseServiceKey && !supabaseAnonKey) {
    console.error('❌ Missing Supabase key environment variable');
    console.error('   Please set SUPABASE_SERVICE_ROLE_KEY (recommended) or SUPABASE_ANON_KEY');
    console.error('\n💡 Alternative: Run scripts/check-users.sql in Supabase SQL Editor');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Query all users from users_local table
    const { data: users, error } = await supabase
      .from('users_local')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying users_local:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📭 No users found in users_local table');
      console.log('\n💡 This could mean:');
      console.log('   - No users have been created yet');
      console.log('   - The database trigger hasn\'t fired yet');
      console.log('   - Users exist in auth.users but haven\'t been synced to users_local');
      return;
    }

    console.log(`✅ Found ${users.length} user(s) in users_local table:\n`);

    users.forEach((user: any, index: number) => {
      console.log(`--- User ${index + 1} ---`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email || 'N/A'}`);
      console.log(`Name: ${user.name || user.username || 'N/A'}`);
      console.log(`Username: ${user.username || 'N/A'}`);
      console.log(`Azure ID: ${user.azure_id || 'N/A'}`);
      console.log(`Role: ${user.role || 'N/A'}`);
      console.log(`Created: ${user.created_at || 'N/A'}`);
      console.log(`Updated: ${user.updated_at || 'N/A'}`);
      console.log('');
    });

    // Also check auth.users if possible
    console.log('\n🔍 Checking auth.users table...\n');
    
    try {
      // Note: This requires service role key to access auth.users
      if (supabaseServiceKey) {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.log('⚠️  Could not query auth.users (this is normal - RLS restrictions)');
          console.log('   Error:', authError.message);
        } else if (authUsers && authUsers.users) {
          console.log(`📊 Found ${authUsers.users.length} user(s) in auth.users table`);
          
          if (authUsers.users.length > 0) {
            console.log('\nFirst few users in auth.users:');
            authUsers.users.slice(0, 5).forEach((user: any, index: number) => {
              console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
            });
            
            if (authUsers.users.length > 5) {
              console.log(`  ... and ${authUsers.users.length - 5} more`);
            }
          }
        }
      } else {
        console.log('⚠️  Cannot query auth.users - requires SUPABASE_SERVICE_ROLE_KEY');
        console.log('   Using anon key - only users_local table is accessible');
      }
    } catch (err: any) {
      console.log('⚠️  Could not query auth.users:', err.message);
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - users_local: ${users.length} user(s)`);
    console.log(`   - Most recent user created: ${users[0]?.created_at || 'N/A'}`);
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the check
checkUsers()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

