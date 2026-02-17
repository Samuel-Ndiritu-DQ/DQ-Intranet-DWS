import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Use provided credentials or fallback to env variable
const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'Dws.clouddb123';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('💡 Please set these environment variables in your .env file');
  process.exit(1);
}

// Extract project reference from Supabase URL
const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
const projectRef = urlMatch ? urlMatch[1] : null;

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL');
  console.error('   URL format should be: https://[PROJECT_REF].supabase.co');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function tryConnection(Client, connectionString, index, total) {
  console.log(`   Trying connection ${index}/${total}...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log(`✅ Connected via connection method ${index}\n`);
  return client;
}

async function connectToDatabase(Client, projectRef, dbPassword) {
  const connectionStrings = [
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${projectRef}.pooler.supabase.com:6543/postgres`,
  ];
  
  console.log('🔌 Connecting to database...');
  let lastError;
  
  for (let i = 0; i < connectionStrings.length; i++) {
    try {
      return await tryConnection(Client, connectionStrings[i], i + 1, connectionStrings.length);
    } catch (error) {
      lastError = error;
      if (i < connectionStrings.length - 1) {
        console.log(`   Failed: ${error.message.substring(0, 60)}...`);
      }
    }
  }
  
  console.error('❌ All connection methods failed');
  console.error('   Last error:', lastError?.message);
  console.error('\n💡 Please check:');
  console.error('   1. Your SUPABASE_DB_PASSWORD is correct');
  console.error('   2. Database password can be found at:');
  console.error(`      https://app.supabase.com/project/${projectRef}/settings/database`);
  console.error('   3. Or run the migration manually in Supabase SQL Editor\n');
  throw new Error('Failed to connect to database');
}

async function executeMigrationSQL(client, migrationSQL) {
  console.log('⏳ Executing migration SQL...');
  try {
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!\n');
  } catch (sqlError) {
    if (sqlError.message.includes('already exists') || sqlError.message.includes('duplicate')) {
      console.log('⚠️  Some objects may already exist (this is OK)\n');
    } else {
      throw sqlError;
    }
  }
}

async function verifyMigration(client) {
  console.log('🔍 Verifying migration...');
  const result = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'marketplace_services'
    );
  `);

  if (result.rows[0].exists) {
    console.log('✅ Table "marketplace_services" exists!\n');
    
    const countResult = await client.query('SELECT COUNT(*) FROM marketplace_services');
    console.log(`📊 Current row count: ${countResult.rows[0].count}\n`);
    
    console.log('🎉 Migration complete! You can now seed the services:');
    console.log('   npm run db:seed-services\n');
  } else {
    console.log('❌ Table verification failed - table does not exist');
    throw new Error('Table was not created');
  }
}

async function executeMigrationViaPostgres() {
  console.log('🚀 Running migration via PostgreSQL connection...\n');

  try {
    const pg = await import('pg');
    const { Client } = pg.default || pg;

    if (dbPassword === null || dbPassword === undefined) {
      console.log('❌ SUPABASE_DB_PASSWORD not set');
      console.log('\n💡 To get your database password:');
      console.log(`   1. Go to: https://app.supabase.com/project/${projectRef}/settings/database`);
      console.log('   2. Find "Database password" or reset it');
      console.log('   3. Add to .env: SUPABASE_DB_PASSWORD=your_password\n');
      throw new Error('Database password required');
    }

    const migrationPath = join(__dirname, '..', 'supabase', 'marketplace-services-schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');

    const client = await connectToDatabase(Client, projectRef, dbPassword);
    
    await executeMigrationSQL(client, migrationSQL);
    await verifyMigration(client);
    await client.end();

  } catch (error) {
    if (error.message.includes('password') || error.message.includes('authentication')) {
      console.error('\n❌ Authentication failed');
      console.error('💡 Please check your SUPABASE_DB_PASSWORD in .env file\n');
      throw error;
    }
    throw error;
  }
}

async function checkTableExists() {
  try {
    const { error } = await supabase
      .from('marketplace_services')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return false;
      }
      console.error('Unexpected error checking table:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking table existence:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Marketplace Services Migration (Automatic)\n');
  console.log('=' .repeat(50));

  // Check if table already exists
  console.log('\n🔍 Checking if table already exists...');
  const exists = await checkTableExists();
  
  if (exists) {
    console.log('✅ Table "marketplace_services" already exists!');
    
    // Get count
    const { count } = await supabase
      .from('marketplace_services')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Current row count: ${count || 0}\n`);
    
    const readline = await import('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Do you want to re-run the migration? (y/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          executeMigrationViaPostgres().then(resolve).catch(() => process.exit(1));
        } else {
          console.log('\n✅ Migration skipped. Table already exists.\n');
          resolve();
        }
      });
    });
  }

  console.log('❌ Table does not exist - running migration...\n');
  await executeMigrationViaPostgres();
}

await main();
