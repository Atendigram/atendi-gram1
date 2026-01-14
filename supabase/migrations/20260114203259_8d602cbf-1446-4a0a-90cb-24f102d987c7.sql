-- Adicionar policy para admins verem todas as contas
CREATE POLICY "admin_read_all_accounts" ON public.accounts
  FOR SELECT
  USING (public.is_admin_user());