import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Get user's profile to get account_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const { phone, code, password } = await req.json();

    if (!phone || !code) {
      throw new Error('Phone number and verification code are required');
    }

    // Find the pending session for this phone number
    const { data: session, error: sessionError } = await supabase
      .from('telegram_sessions')
      .select('*')
      .eq('account_id', profile.account_id)
      .eq('phone_number', phone)
      .eq('status', 'pending_code')
      .single();

    if (sessionError || !session) {
      throw new Error('No pending session found for this phone number');
    }

    // Here you would implement the actual Telegram login logic
    // For now, we'll just update the status to indicate success
    // In a real implementation, you would:
    // 1. Use the Telegram API to verify the code
    // 2. If successful, get the session string
    // 3. Store the session string in the database

    // For demo purposes, we'll simulate success
    const { error: updateError } = await supabase
      .from('telegram_sessions')
      .update({
        status: 'active',
        session_string: 'demo_session_string_' + Date.now(),
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update session status');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Telegram login finalized successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in finalize-telegram-login function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});