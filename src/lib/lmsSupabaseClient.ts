import { createClient } from '@supabase/supabase-js'

// LMS-specific Supabase client
const lmsUrl = import.meta.env.VITE_LMS_SUPABASE_URL as string
const lmsAnonKey = import.meta.env.VITE_LMS_SUPABASE_ANON_KEY as string

if (!lmsUrl || !lmsAnonKey) {
  console.warn('Missing VITE_LMS_SUPABASE_URL or VITE_LMS_SUPABASE_ANON_KEY. LMS features will use fallback data.')
}

export const lmsSupabaseClient = lmsUrl && lmsAnonKey 
  ? createClient(lmsUrl, lmsAnonKey, {
      auth: { 
        persistSession: false, 
        autoRefreshToken: false 
      },
    })
  : null;

// Debug: Verify client is initialized
if (typeof window !== 'undefined' && lmsSupabaseClient) {
  console.log('✅ lmsSupabaseClient initialized for LMS database');
}

export default lmsSupabaseClient;
