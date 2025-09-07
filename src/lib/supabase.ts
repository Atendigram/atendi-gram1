import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sjafivptbizdrzkozonv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWZpdnB0Yml6ZHJ6a296b252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzY1NjUsImV4cCI6MjA3MjM1MjU2NX0.GxUFl9wsRSmQdcCc0xBAfOYpw4BpSToBSaW2gP63Rig'

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
