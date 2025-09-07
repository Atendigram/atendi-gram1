-- Verificar se a trigger handle_new_user está funcionando corretamente
-- E garantir que todo usuário autenticado tenha um profile criado

-- Verificar triggers existentes
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR trigger_schema = 'auth'
ORDER BY trigger_name;

-- Se não existir profile para o usuário logado, criar um
DO $$
DECLARE
    user_record RECORD;
    profile_exists BOOLEAN;
BEGIN
    -- Buscar usuários que não tem profile
    FOR user_record IN 
        SELECT au.id, au.email, au.created_at
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        -- Verificar se há uma conta para este usuário
        SELECT EXISTS(SELECT 1 FROM public.accounts WHERE owner_id = user_record.id) INTO profile_exists;
        
        IF NOT profile_exists THEN
            -- Criar account e profile para este usuário
            INSERT INTO public.accounts (owner_id, name)
            VALUES (user_record.id, COALESCE(split_part(user_record.email, '@', 1), 'owner'));
            
            INSERT INTO public.profiles (id, account_id, email, display_name)
            VALUES (
                user_record.id, 
                (SELECT id FROM public.accounts WHERE owner_id = user_record.id LIMIT 1),
                user_record.email, 
                split_part(user_record.email, '@', 1)
            );
            
            RAISE NOTICE 'Created profile for user %', user_record.email;
        END IF;
    END LOOP;
END $$;