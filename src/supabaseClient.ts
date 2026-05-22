import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// If they set some placeholders like "SUA_URL_AQUI" or similar, we treat them as unconfigured
const isValidUrl = supabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co/i.test(supabaseUrl);
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 20;

export const isSupabaseConfigured = !!(isValidUrl && isValidKey);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const SUPABASE_SQL_INSTRUCTIONS = `
-- Execute este comando SQL no SQL Editor do seu console Supabase para criar a tabela de chamados:

create table chamados (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  status text not null check (status in ('aberto', 'encerrado')),
  priority text not null check (priority in ('baixa', 'media', 'alta')),
  sector text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone,
  operator_username text not null,
  mechanic_username text,
  resolution text
);

-- Habilite as políticas de RLS ou desative RLS temporariamente para testes
alter table chamados enable row level security;

create policy "Permitir leitura para todos" on chamados
  for select using (true);

create policy "Permitir inserção por todos" on chamados
  for insert with check (true);

create policy "Permitir atualização por todos" on chamados
  for update using (true);
`.trim();
