-- Update the handle_new_user function to make account name optional
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
declare
  v_account_id uuid;
  v_flow_id uuid;
begin
  -- Insert account with owner_id = auth.uid() and optional empty name
  insert into public.accounts (owner_id, name)
  values (new.id, null)
  returning id into v_account_id;

  insert into public.profiles (id, account_id, email, display_name)
  values (new.id, v_account_id, new.email, split_part(new.email, '@', 1));

  -- Create default welcome flow for new account
  insert into public.welcome_flows (account_id, name, enabled, is_default, workspace_id)
  values (v_account_id, 'Boas-vindas', true, true, 'default')
  returning id into v_flow_id;

  -- Create default welcome steps
  insert into public.welcome_flow_steps (account_id, flow_id, order_index, kind, text_content, delay_after_sec)
  values 
    (v_account_id, v_flow_id, 1, 'text', 'Olá! Bem-vindo(a) ao nosso sistema! 👋', 2),
    (v_account_id, v_flow_id, 2, 'text', 'Estamos muito felizes em tê-lo(a) conosco!', 0);

  return new;
end;
$function$