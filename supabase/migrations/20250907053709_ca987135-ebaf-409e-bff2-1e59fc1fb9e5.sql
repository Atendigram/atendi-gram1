-- Enable RLS on both tables
ALTER TABLE disparos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disparo_items ENABLE ROW LEVEL SECURITY;

-- DISPAROS table policies
DROP POLICY IF EXISTS "select own disparos" ON disparos;
CREATE POLICY "select own disparos"
ON disparos
FOR SELECT
TO authenticated
USING (account_id = (
  SELECT account_id FROM profiles WHERE id = auth.uid()
));

DROP POLICY IF EXISTS "insert own disparos" ON disparos;
CREATE POLICY "insert own disparos"
ON disparos
FOR INSERT
TO authenticated
WITH CHECK (account_id = (
  SELECT account_id FROM profiles WHERE id = auth.uid()
));

DROP POLICY IF EXISTS "update own disparos" ON disparos;
CREATE POLICY "update own disparos"
ON disparos
FOR UPDATE
TO authenticated
USING (account_id = (
  SELECT account_id FROM profiles WHERE id = auth.uid()
))
WITH CHECK (account_id = (
  SELECT account_id FROM profiles WHERE id = auth.uid()
));

DROP POLICY IF EXISTS "delete own disparos" ON disparos;
CREATE POLICY "delete own disparos"
ON disparos
FOR DELETE
TO authenticated
USING (account_id = (
  SELECT account_id FROM profiles WHERE id = auth.uid()
));

-- DISPARO_ITEMS table policies
DROP POLICY IF EXISTS "select items of my account" ON disparo_items;
CREATE POLICY "select items of my account"
ON disparo_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM disparos d
    JOIN profiles p ON p.id = auth.uid()
    WHERE d.id = disparo_items.campaign_id
      AND d.account_id = p.account_id
  )
);

DROP POLICY IF EXISTS "insert items of my account" ON disparo_items;
CREATE POLICY "insert items of my account"
ON disparo_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM disparos d
    JOIN profiles p ON p.id = auth.uid()
    WHERE d.id = disparo_items.campaign_id
      AND d.account_id = p.account_id
  )
);

DROP POLICY IF EXISTS "update items of my account" ON disparo_items;
CREATE POLICY "update items of my account"
ON disparo_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM disparos d
    JOIN profiles p ON p.id = auth.uid()
    WHERE d.id = disparo_items.campaign_id
      AND d.account_id = p.account_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM disparos d
    JOIN profiles p ON p.id = auth.uid()
    WHERE d.id = disparo_items.campaign_id
      AND d.account_id = p.account_id
  )
);

DROP POLICY IF EXISTS "delete items of my account" ON disparo_items;
CREATE POLICY "delete items of my account"
ON disparo_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM disparos d
    JOIN profiles p ON p.id = auth.uid()
    WHERE d.id = disparo_items.campaign_id
      AND d.account_id = p.account_id
  )
);