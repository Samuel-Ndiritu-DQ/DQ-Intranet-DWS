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
const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'Dws.clouddb123';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project reference
const urlMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
const projectRef = urlMatch ? urlMatch[1] : null;

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function tryDatabaseConnection(Client, connectionString, index, total) {
  console.log(`🔌 Trying connection ${index}/${total}...`);
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });
  
  await client.connect();
  console.log(`✅ Connected successfully!\n`);
  return client;
}

async function connectToDatabase(Client, projectRef, dbPassword) {
  const connectionStrings = [
    `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    try {
      return await tryDatabaseConnection(Client, connectionStrings[i], i + 1, connectionStrings.length);
    } catch (error) {
      console.log(`   Failed: ${error.message.substring(0, 80)}...`);
    }
  }

  throw new Error('Failed to connect to database with all connection methods');
}

async function executeMigrationSQL(client, migrationSQL) {
  console.log('⏳ Executing migration SQL...');
  try {
    await client.query(migrationSQL);
    console.log('✅ Migration executed successfully!\n');
  } catch (sqlError) {
    if (sqlError.message.includes('already exists') && sqlError.message.includes('duplicate')) {
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

async function executeMigrationViaAPI() {
  console.log('🚀 Running migration via Supabase Management API...\n');

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'marketplace-services-schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('⏳ Executing migration via Supabase API...\n');

    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.startsWith('--') === false && s.startsWith('COMMENT') === false);

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    const pg = await import('pg');
    const { Client } = pg.default || pg;

    const client = await connectToDatabase(Client, projectRef, dbPassword);
    
    await executeMigrationSQL(client, migrationSQL);
    await verifyMigration(client);
    await client.end();

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Alternative: Run migration manually');
    console.error('   1. Go to https://app.supabase.com');
    console.error('   2. Open SQL Editor');
    console.error('   3. Copy contents of: supabase/marketplace-services-schema.sql');
    console.error('   4. Paste and run\n');
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
  console.log('🚀 Marketplace Services Migration\n');
  console.log('=' .repeat(50));

  // Check if table already exists
  console.log('\n🔍 Checking if table already exists...');
  const exists = await checkTableExists();
  
  if (exists) {
    console.log('✅ Table "marketplace_services" already exists!');
    
    const { count } = await supabase
      .from('marketplace_services')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Current row count: ${count || 0}\n`);
    console.log('✅ Migration already complete!\n');
    return;
  }

  console.log('❌ Table does not exist - running migration...\n');
  await executeMigrationViaAPI();
}

await main();

