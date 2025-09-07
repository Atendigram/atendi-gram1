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

// Helper function to get account_id from session
export const getAccountId = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user?.id) {
      return null;
    }

    // Get account_id from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', session.user.id)
      .single();

    return profile?.account_id || null;
  } catch (error) {
    console.error('Error getting account_id:', error);
    return null;
  }
}
