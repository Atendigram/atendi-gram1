import { supabase } from '@/integrations/supabase/client';

export const scopedSelect = (table: string, accountId: string | undefined) => {
  if (!accountId) {
    throw new Error('Account ID is required for scoped queries');
  }
  return (supabase as any).from(table).select('*').eq('account_id', accountId);
};

export const scopedSelectWithColumns = (table: string, columns: string, accountId: string | undefined) => {
  if (!accountId) {
    throw new Error('Account ID is required for scoped queries');
  }
  return (supabase as any).from(table).select(columns, { count: 'exact' }).eq('account_id', accountId);
};

export const scopedInsert = (table: string, data: any, accountId: string | undefined) => {
  if (!accountId) {
    throw new Error('Account ID is required for scoped queries');
  }
  return (supabase as any).from(table).insert({ ...data, account_id: accountId });
};

export const scopedUpdate = (table: string, data: any, accountId: string | undefined) => {
  if (!accountId) {
    throw new Error('Account ID is required for scoped queries');
  }
  return (supabase as any).from(table).update(data).eq('account_id', accountId);
};

export const scopedCount = (table: string, accountId: string | undefined) => {
  if (!accountId) {
    throw new Error('Account ID is required for scoped queries');
  }
  return (supabase as any).from(table).select('*', { count: 'exact', head: true }).eq('account_id', accountId);
};