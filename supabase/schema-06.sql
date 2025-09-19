-- RANKIOU - Supabase Schema v6 (consolidado)
-- Resolve problemas de permissão 403 e "permission denied for table [Prototype]"
-- Recria policies públicas, grants de RPCs e permissões completas

-- ==============================
-- 1) ENABLE RLS em todas as tabelas críticas
-- ==============================
alter table if exists public.profiles enable row level security;
alter table if exists public.polls enable row level security;
alter table if exists public.poll_options enable row level security;
alter table if exists public.votes enable row level security;
alter table if exists public.favorites enable row level security;
alter table if exists public.advertisements enable row level security;
alter table if exists public.cities enable row level security;
alter table if exists public.reports enable row level security;
alter table if exists public.predefined_rankards enable row level security;
alter table if exists public.user_rank_cards enable row level security;

-- ==============================
-- 2) POLICIES DE LEITURA PÚBLICA (idempotente)
-- ==============================

-- Profiles: leitura pública, escrita própria
drop policy if exists "Public profile read" on public.profiles;
create policy "Public profile read" on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Insert profile only by service role" on public.profiles;
create policy "Insert profile only by service role" on public.profiles
  for insert with check (false); -- Inserção via trigger apenas

-- Polls: público vê APPROVED; autores veem próprias
drop policy if exists "Public polls read" on public.polls;
create policy "Public polls read" on public.polls
  for select using (
    status = 'APPROVED' or author_id = auth.uid()
  );

drop policy if exists "Users insert own polls" on public.polls;
create policy "Users insert own polls" on public.polls
  for insert with check (auth.uid() = author_id);

drop policy if exists "Users update own pending polls" on public.polls;
create policy "Users update own pending polls" on public.polls
  for update using (auth.uid() = author_id);

-- Poll Options: leitura pública, inserção por autor ou questão aberta
drop policy if exists "Public options read" on public.poll_options;
create policy "Public options read" on public.poll_options
  for select using (true);

drop policy if exists "Insert options: author or open question" on public.poll_options;
create policy "Insert options: author or open question" on public.poll_options
  for insert with check (
    exists(select 1 from public.polls p where p.id = poll_id and (p.author_id = auth.uid() or p.type = 'PERGUNTAS'))
  );

-- Votes: usuário vê/modifica próprios votos
drop policy if exists "Users read own votes" on public.votes;
create policy "Users read own votes" on public.votes
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert vote" on public.votes;
create policy "Users insert vote" on public.votes
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update vote" on public.votes;
create policy "Users update vote" on public.votes
  for update using (auth.uid() = user_id);

-- Favorites: usuário vê/modifica próprios favoritos
drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "Users upsert favorites" on public.favorites;
create policy "Users upsert favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete favorites" on public.favorites;
create policy "Users delete favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Advertisements: leitura pública de anúncios ativos
drop policy if exists "Public ads read" on public.advertisements;
create policy "Public ads read" on public.advertisements
  for select using (status = 'ACTIVE');

-- Cities: leitura pública
drop policy if exists "Public cities read" on public.cities;
create policy "Public cities read" on public.cities
  for select using (true);

-- Reports: usuário cria/lê próprios reports
drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports" on public.reports
  for insert with check (auth.uid() = user_id);

drop policy if exists "Read own reports" on public.reports;
create policy "Read own reports" on public.reports
  for select using (auth.uid() = user_id);

-- Rankards: leitura pública dos predefinidos, usuário vê próprios cards
drop policy if exists "Public read predefined rankards" on public.predefined_rankards;
create policy "Public read predefined rankards" on public.predefined_rankards
  for select using (true);

drop policy if exists "Users read own rank cards" on public.user_rank_cards;
create policy "Users read own rank cards" on public.user_rank_cards
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own rank cards" on public.user_rank_cards;
create policy "Users insert own rank cards" on public.user_rank_cards
  for insert with check (auth.uid() = user_id);

-- ==============================
-- 3) GRANTS DE EXECUÇÃO PARA RPCS
-- ==============================

-- Funções básicas de votação e favoritos
grant execute on function public.vote_on_poll(uuid, text) to authenticated;
grant execute on function public.change_vote(uuid, text) to authenticated;
grant execute on function public.toggle_favorite(uuid) to authenticated;

-- Criação de polls e opções
grant execute on function public.create_poll_with_options(text, text, public.poll_type, public.poll_scope, text, text[], text) to authenticated;
grant execute on function public.add_option_and_vote(uuid, text) to authenticated;

-- Funções de admin
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_admin_self() to authenticated;
grant execute on function public.admin_set_poll_status(uuid, public.poll_status, text) to authenticated;

-- Bot do rolê
grant execute on function public.run_role_bot_now(uuid) to authenticated;

-- Backfill de perfis (uma vez executado, pode revogar se quiser)
grant execute on function public.backfill_profiles() to authenticated;

-- ==============================
-- 4) VIEWS DE CONSULTA (se necessário)
-- ==============================

-- View de polls com autor (opcional, se não existe)
create or replace view public.polls_with_author as
select p.*, 
       pr.name as author_name, 
       pr.avatar_url as author_avatar_url
from public.polls p
left join public.profiles pr on pr.id = p.author_id;

-- Grant na view
grant select on public.polls_with_author to authenticated, anon;

-- ==============================
-- 5) PERMISSÕES DE ACESSO DIRETO ÀS TABELAS
-- ==============================

-- Garante que authenticated pode SELECT nas tabelas (complementa policies)
grant select on public.profiles to authenticated, anon;
grant select on public.polls to authenticated, anon;
grant select on public.poll_options to authenticated, anon;
grant select on public.advertisements to authenticated, anon;
grant select on public.cities to authenticated, anon;
grant select on public.predefined_rankards to authenticated, anon;

-- Permissões de INSERT/UPDATE/DELETE baseadas em policies
grant insert, update on public.profiles to authenticated;
grant insert, update on public.polls to authenticated;
grant insert on public.poll_options to authenticated;
grant insert, update, delete on public.votes to authenticated;
grant insert, delete on public.favorites to authenticated;
grant insert on public.reports to authenticated;
grant insert on public.user_rank_cards to authenticated;

-- ==============================
-- 6) TESTE RÁPIDO DOS GRANTS
-- ==============================

-- Executa is_admin_self para testar se funcionou
-- (irá retornar true/false sem erro se tudo estiver ok)
do $$
begin
  if (select public.is_admin_self()) is not null then
    raise notice 'is_admin_self está funcionando!';
  end if;
exception when others then
  raise notice 'Erro em is_admin_self: %', SQLERRM;
end $$;

-- Fim schema-06