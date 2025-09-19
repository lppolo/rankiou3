-- RANKIOU - Supabase Schema v3 (incremental)
-- Correções de RLS para evitar 403 no SELECT
-- Uso: cole no SQL Editor do Supabase e execute.

-- Garantir leitura pública segura das tabelas usadas no feed
alter table if exists public.polls enable row level security;
alter table if exists public.poll_options enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.advertisements enable row level security;
alter table if exists public.cities enable row level security;

-- Recria políticas de leitura (idempotente)
drop policy if exists "Public polls read" on public.polls;
create policy "Public polls read" on public.polls
  for select
  using (
    -- Público vê apenas aprovadas; autores veem as próprias
    status = 'APPROVED' or author_id = auth.uid()
  );

drop policy if exists "Public options read" on public.poll_options;
create policy "Public options read" on public.poll_options
  for select using (true);

drop policy if exists "Public profile read" on public.profiles;
create policy "Public profile read" on public.profiles
  for select using (true);

drop policy if exists "Public ads read" on public.advertisements;
create policy "Public ads read" on public.advertisements
  for select using (status = 'ACTIVE');

-- Cidades (auxiliar)
drop policy if exists "Public cities read" on public.cities;
create policy "Public cities read" on public.cities
  for select using (true);

-- Fim (v3)
