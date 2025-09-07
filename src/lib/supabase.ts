import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton — evita criar múltiplos clients em dev/HMR
const globalForSupabase = globalThis as unknown as {
  __supabase__: SupabaseClient | undefined
}

export const supabase =
  globalForSupabase.__supabase__ ??
  (globalForSupabase.__supabase__ = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }))
