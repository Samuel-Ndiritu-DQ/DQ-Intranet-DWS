import { supabaseAdmin } from './lib/supabaseAdmin';

/**
 * Script to check users in the database
 * Run with: npx tsx api/check-users.ts
 */

async function checkUsers() {
  console.log('🔍 Checking users in database...\n');

  try {
    // Check users_local table
    console.log('📊 Querying users_local table...');
    const { data: usersLocal, error: usersLocalError } = await supabaseAdmin
      .from('users_local')
      .select('id, email, name, username, azure_id, role, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (usersLocalError) {
      console.error('❌ Error querying users_local:', usersLocalError);
      return;
    }

    console.log(`\n✅ Found ${usersLocal?.length || 0} user(s) in users_local table:\n`);

    if (!usersLocal || usersLocal.length === 0) {
      console.log('⚠️  No users found in users_local table.');
      console.log('   This could mean:');
      console.log('   - No users have been created yet');
      console.log('   - The database trigger has not fired');
      console.log('   - Users exist in auth.users but not synced to users_local\n');
    } else {
      usersLocal.forEach((user, index) => {
        console.log(`${index + 1}. User:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Name: ${user.name || user.username || 'N/A'}`);
        console.log(`   Username: ${user.username || 'N/A'}`);
        console.log(`   Azure ID: ${user.azure_id || 'N/A'}`);
        console.log(`   Role: ${user.role || 'N/A'}`);
        console.log(`   Created: ${user.created_at || 'N/A'}`);
        console.log(`   Updated: ${user.updated_at || 'N/A'}`);
        console.log('');
      });
    }

    // Check auth.users table (if accessible)
    console.log('📊 Checking auth.users table...');
    try {
      const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 20
      });

      if (authUsersError) {
        console.log('⚠️  Could not query auth.users (may require admin privileges):', authUsersError.message);
      } else {
        console.log(`\n✅ Found ${authUsers?.users?.length || 0} user(s) in auth.users table:\n`);

        if (!authUsers?.users || authUsers.users.length === 0) {
          console.log('⚠️  No users found in auth.users table.\n');
        } else {
          authUsers.users.forEach((user, index) => {
            console.log(`${index + 1}. Auth User:`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Email: ${user.email || 'N/A'}`);
            console.log(`   Created: ${user.created_at || 'N/A'}`);
            console.log(`   Last Sign In: ${user.last_sign_in_at || 'N/A'}`);
            console.log(`   Metadata:`, user.user_metadata || {});
            console.log('');
          });
        }

        // Compare counts
        const authCount = authUsers?.users?.length || 0;
        const localCount = usersLocal?.length || 0;
        
        if (authCount !== localCount) {
          console.log(`\n⚠️  Mismatch detected:`);
          console.log(`   auth.users: ${authCount} users`);
          console.log(`   users_local: ${localCount} users`);
          console.log(`   Difference: ${Math.abs(authCount - localCount)}`);
          console.log(`\n   This suggests the database trigger may not be working correctly.`);
          console.log(`   Check the trigger: on_auth_user_created on auth.users\n`);
        } else if (authCount > 0) {
          console.log(`\n✅ User counts match: ${authCount} users in both tables\n`);
        }
      }
    } catch (error: any) {
      console.log('⚠️  Could not query auth.users:', error.message);
      console.log('   This is normal if admin API is not available.\n');
    }

    // Summary
    console.log('📋 Summary:');
    console.log(`   users_local: ${usersLocal?.length || 0} user(s)`);
    console.log('');

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the check
checkUsers()
  .then(() => {
    console.log('✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });

