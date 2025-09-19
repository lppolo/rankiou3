-- RANKIOU - Supabase Schema v2 (incremental)
-- Data: 2025-09-19
-- Uso: Cole este arquivo no SQL Editor do Supabase e execute.
-- Seguro para rodar mais de uma vez (usa IF EXISTS / IF NOT EXISTS / CREATE OR REPLACE).

-- 0) Extensões (por segurança)
create extension if not exists "uuid-ossp";

-- 1) Cities (para escopo LOCAL/ROLÊ)
create table if not exists public.cities (
  id uuid primary key default uuid_generate_v4(),
  state text not null,
  name text not null,
  unique(state, name)
);

-- 2) RLS de opções: permitir opções por qualquer usuário quando for PERGUNTAS
-- Limpa políticas antigas que conflitam
drop policy if exists "Public options read" on public.poll_options;
drop policy if exists "Authors insert options" on public.poll_options;

-- Recria as políticas
create policy "Public options read" on public.poll_options
  for select using (true);

create policy "Insert options: author or open question" on public.poll_options
  for insert with check (
    exists(
      select 1 from public.polls p
      where p.id = poll_id and (p.author_id = auth.uid() or p.type = 'PERGUNTAS')
    )
  );

-- 3) Votos: ganhar +1 ponto por voto válido
create or replace function public.vote_on_poll(p_poll_id uuid, p_option_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_option_id uuid;
  v_inserted boolean := false;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_option_id from public.poll_options where poll_id = p_poll_id and text = p_option_text;
  if v_option_id is null then
    raise exception 'Option not found';
  end if;

  begin
    insert into public.votes(poll_id, option_id, user_id) values (p_poll_id, v_option_id, v_user_id);
    v_inserted := true;
  exception when unique_violation then
    v_inserted := false; -- already voted
  end;

  if v_inserted then
    update public.poll_options set votes = votes + 1 where id = v_option_id;
    update public.polls set total_votes = total_votes + 1 where id = p_poll_id;
    update public.profiles set creation_points = greatest(0, creation_points + 1) where id = v_user_id; -- +1 ponto
  end if;
end;
$$;

grant execute on function public.vote_on_poll(uuid, text) to authenticated;

-- 4) Criar enquete com opções (custa 5 pontos) – status PENDING
create or replace function public.create_poll_with_options(
  p_title text,
  p_category text,
  p_type public.poll_type,
  p_scope public.poll_scope,
  p_location_city text,
  p_options text[],
  p_image_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_poll_id uuid;
  v_points int;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select creation_points into v_points from public.profiles where id = v_user_id;
  if v_points is null or v_points < 5 then
    raise exception 'Pontos insuficientes';
  end if;

  insert into public.polls(id, author_id, title, image_url, category, type, scope, location_city, status)
  values (
    uuid_generate_v4(), v_user_id, p_title, p_image_url, p_category, p_type, p_scope,
    case when p_scope = 'MUNDO' then null else p_location_city end,
    'PENDING'
  ) returning id into v_poll_id;

  if p_options is not null then
    insert into public.poll_options(poll_id, text)
    select v_poll_id, trim(o)
    from unnest(p_options) as o
    where trim(o) <> ''
    on conflict do nothing;
  end if;

  update public.profiles set creation_points = greatest(0, creation_points - 5) where id = v_user_id; -- -5 pontos
  return v_poll_id;
end;
$$;

grant execute on function public.create_poll_with_options(text, text, public.poll_type, public.poll_scope, text, text[], text) to authenticated;

-- 5) Perguntas abertas: adicionar opção e votar
create or replace function public.add_option_and_vote(
  p_poll_id uuid,
  p_option_text text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_option_id uuid;
  v_is_open boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select (type = 'PERGUNTAS') into v_is_open from public.polls where id = p_poll_id;
  if not v_is_open then
    raise exception 'Poll is not open for new options';
  end if;

  insert into public.poll_options(id, poll_id, text)
  values (uuid_generate_v4(), p_poll_id, trim(p_option_text))
  on conflict (poll_id, text) do nothing;

  select id into v_option_id from public.poll_options where poll_id = p_poll_id and text = trim(p_option_text);
  if v_option_id is null then
    raise exception 'Failed to create option';
  end if;

  perform public.vote_on_poll(p_poll_id, trim(p_option_text));
end;
$$;

grant execute on function public.add_option_and_vote(uuid, text) to authenticated;

-- 6) Admin helpers
create or replace function public.is_admin(p_user_id uuid)
returns boolean as $$
  select exists(select 1 from public.profiles where id = p_user_id and role = 'admin');
$$ language sql stable;

create or replace function public.admin_set_poll_status(p_poll_id uuid, p_status public.poll_status, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if not public.is_admin(v_user_id) then
    raise exception 'Forbidden';
  end if;
  update public.polls set status = p_status, moderation_reason = p_reason where id = p_poll_id;
end;
$$;

grant execute on function public.admin_set_poll_status(uuid, public.poll_status, text) to authenticated;

-- Fim (v2)
