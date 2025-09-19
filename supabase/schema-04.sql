-- RANKIOU - Supabase Schema v4 (incremental)
-- 1) Backfill de perfis ausentes e reforço do trigger
-- 2) Bot do ROLÊ (RPC admin) + agendamento semanal opcional (pg_cron)

-- 1) Backfill de perfis
create or replace function public.backfill_profiles()
returns void
language sql
security definer
as $$
  insert into public.profiles (id, username, name, avatar_url)
  select u.id,
         split_part(u.email, '@', 1) as username,
         coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
         coalesce(u.raw_user_meta_data->>'avatar_url', '') as avatar_url
  from auth.users u
  left join public.profiles p on p.id = u.id
  where p.id is null;
$$;

-- Executa o backfill imediatamente (idempotente)
select public.backfill_profiles();

-- Garante trigger de auto-profile (idempotente)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, avatar_url)
  values (new.id, split_part(new.email, '@', 1), coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), coalesce(new.raw_user_meta_data->>'avatar_url', ''))
  on conflict (id) do update set updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Bot do ROLÊ
-- Obs: usamos a técnica de "set_config('request.jwt.claims', ...)" para simular um usuário autor,
--      permitindo passar nas policies de RLS (auth.uid() = author_id). Restrito a admin real.
create or replace function public.run_role_bot_now(p_author_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_author uuid;
  v_poll uuid;
begin
  -- Verifica se quem chamou é admin de verdade (antes de mudar claims)
  if not public.is_admin(v_caller) then
    raise exception 'Forbidden';
  end if;

  -- Escolhe autor: parâmetro ou primeiro perfil
  if p_author_id is not null then
    v_author := p_author_id;
  else
    select id into v_author from public.profiles order by created_at asc limit 1;
  end if;
  if v_author is null then
    raise exception 'No profiles available to act as bot author';
  end if;

  -- Simula o JWT do autor
  perform set_config('request.jwt.claims', json_build_object('role','authenticated','sub', v_author)::text, true);

  -- Insere uma enquete de rolê já aprovada
  -- Observação: inserção direta para não consumir pontos
  -- Campos mínimos para aparecer no feed
  v_poll := uuid_generate_v4();
  begin
    insert into public.polls(id, author_id, title, category, type, scope, location_city, status, total_votes)
    values (
      v_poll, v_author,
      'Qual o rolê desta semana?', 'LAZER', 'ENQUETE', 'ROLÊ', null, 'APPROVED', 0
    );
    insert into public.poll_options(poll_id, text) values
      (v_poll, 'Barzinho'), (v_poll, 'Cinema'), (v_poll, 'Show'), (v_poll, 'Restaurante');
  exception when others then
    -- Em caso de corrida/duplicidade, apenas ignora
    null;
  end;
end;
$$;

grant execute on function public.run_role_bot_now(uuid) to authenticated;

-- Agendamento semanal (opcional): sextas às 12:00 (UTC)
-- Requer extensão pg_cron
create extension if not exists pg_cron;
do $cron$
begin
  -- Só agenda se a tabela do cron existir
  if to_regclass('cron.job') is not null then
    if not exists (select 1 from cron.job where jobname = 'rankiou_role_weekly') then
      perform cron.schedule('rankiou_role_weekly', '0 12 * * 5', 'select public.run_role_bot_now();');
    end if;
  end if;
end
$cron$;

-- Fim (v4)
