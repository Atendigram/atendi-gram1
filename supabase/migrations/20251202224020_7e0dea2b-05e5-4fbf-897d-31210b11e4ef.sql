
-- Remover registros duplicados da tabela contatos_etianefelixvip
-- Mantém apenas o registro mais antigo (menor created_at) para cada user_id
DELETE FROM contatos_etianefelixvip
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
    FROM contatos_etianefelixvip
    WHERE user_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Adicionar índice único para prevenir duplicatas futuras
CREATE UNIQUE INDEX IF NOT EXISTS idx_contatos_etianefelixvip_user_id 
ON contatos_etianefelixvip(user_id) 
WHERE user_id IS NOT NULL;
