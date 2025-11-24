-- Função para obter mensagens por dia do mês
CREATE OR REPLACE FUNCTION get_messages_by_day(
  p_account_id UUID,
  p_year INTEGER,
  p_month INTEGER
)
RETURNS TABLE (
  dia DATE,
  mensagens_recebidas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      date_trunc('month', make_date(p_year, p_month, 1))::date,
      (date_trunc('month', make_date(p_year, p_month, 1)) + INTERVAL '1 month' - INTERVAL '1 day')::date,
      INTERVAL '1 day'
    )::date AS dia
  )
  SELECT
    d.dia,
    COALESCE(l.msgs, 0) AS mensagens_recebidas
  FROM days d
  LEFT JOIN (
    SELECT DATE(data_hora) AS dia, COUNT(*) AS msgs
    FROM logsgeral
    WHERE account_id = p_account_id
      AND EXTRACT(YEAR FROM data_hora) = p_year
      AND EXTRACT(MONTH FROM data_hora) = p_month
    GROUP BY DATE(data_hora)
  ) l ON l.dia = d.dia
  ORDER BY d.dia;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;