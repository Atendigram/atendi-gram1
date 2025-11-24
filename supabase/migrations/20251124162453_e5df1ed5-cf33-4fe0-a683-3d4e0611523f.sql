-- Função para obter total de contatos do usuário
CREATE OR REPLACE FUNCTION get_total_contacts(p_account_id UUID)
RETURNS BIGINT AS $$
DECLARE
  contacts_table text;
  total_count bigint;
BEGIN
  -- Obtém o nome da tabela de contatos para esta conta
  contacts_table := get_contacts_table_name(p_account_id);
  
  -- Conta os contatos usando a tabela correta
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE account_id = $1',
    contacts_table
  ) USING p_account_id INTO total_count;
  
  RETURN COALESCE(total_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter novos contatos do mês
CREATE OR REPLACE FUNCTION get_new_contacts(
  p_account_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS BIGINT AS $$
DECLARE
  contacts_table text;
  new_count bigint;
  start_date date;
  end_date date;
BEGIN
  -- Obtém o nome da tabela de contatos para esta conta
  contacts_table := get_contacts_table_name(p_account_id);
  
  -- Calcula as datas de início e fim do mês
  start_date := make_date(p_year, p_month, 1);
  end_date := make_date(p_year, p_month, 1) + INTERVAL '1 month';
  
  -- Conta os novos contatos do mês usando a tabela correta
  EXECUTE format(
    'SELECT COUNT(*) 
     FROM public.%I 
     WHERE account_id = $1 
       AND created_at IS NOT NULL 
       AND created_at >= $2 
       AND created_at < $3',
    contacts_table
  ) USING p_account_id, start_date, end_date INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;