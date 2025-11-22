import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to get account_id from current session
 */
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
};
