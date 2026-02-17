import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminInstance: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  // Return cached instance if already initialized
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  // Prefer service role key for admin operations, fallback to anon key
  // In serverless functions, use SUPABASE_URL (not VITE_SUPABASE_URL)
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim()
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim()
  const key = serviceRoleKey || anonKey

  console.log('[supabaseAdmin] Initialization check:', {
    hasUrl: !!url,
    hasServiceRoleKey: !!serviceRoleKey,
    hasAnonKey: !!anonKey,
    urlLength: url.length,
    serviceRoleKeyLength: serviceRoleKey.length,
    anonKeyLength: anonKey.length,
    usingServiceRole: !!serviceRoleKey,
    envVars: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
    }
  });

  if (!url || !key) {
    const errorMsg = 'Missing Supabase configuration. Required: (SUPABASE_URL or VITE_SUPABASE_URL) and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY). ' +
      'Check your environment variables.';
    console.error('[supabaseAdmin]', errorMsg);
    throw new Error(errorMsg);
  }

  if (!serviceRoleKey) {
    console.warn(
      '⚠️  WARNING: Using anon key for admin operations. ' +
      'For production, use SUPABASE_SERVICE_ROLE_KEY for server-side operations.'
    )
  }

  try {
    supabaseAdminInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': 'dq-intranet-dws-admin-api',
        },
      },
      db: {
        schema: 'public',
      },
    });
    console.log('[supabaseAdmin] Client created successfully');
    return supabaseAdminInstance;
  } catch (error: any) {
    console.error('[supabaseAdmin] Failed to create client:', error);
    throw error;
  }
}

// Function to clear the cached client instance (useful for schema cache issues)
export function clearSupabaseAdminCache() {
  supabaseAdminInstance = null;
  console.log('[supabaseAdmin] Cache cleared');
}

// Export as a getter function to allow lazy initialization
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

