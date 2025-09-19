-- RANKIOU - Supabase Schema (v0)
-- Run this in the SQL editor of your brand new Supabase project.

-- 1) Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2) Auth: profiles table (one row per user)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  name text,
  avatar_url text,
  role text not null default 'user', -- 'user' | 'admin'
  creation_points int not null default 0,
  onboarding_completed boolean not null default false,
  preferred_city text,
  rankcard_vote_progress int not null default 0,
  rankcard_create_progress int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Polls
create type public.poll_scope as enum ('MUNDO','LOCAL','ROLÊ');
create type public.poll_status as enum ('PENDING','APPROVED','REJECTED');
create type public.poll_type as enum ('ENQUETE','PERGUNTAS');

create table if not exists public.polls (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  image_url text,
  category text not null,
  type public.poll_type not null default 'ENQUETE',
  scope public.poll_scope not null default 'MUNDO',
  location_city text,
  status public.poll_status not null default 'PENDING',
  moderation_reason text,
  total_votes int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  votes int not null default 0,
  unique(poll_id, text)
);

create table if not exists public.votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(poll_id, user_id)
);

-- Favorites
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  poll_id uuid not null references public.polls(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, poll_id)
);

-- Advertisements (simple)
create type public.ad_scope as enum('MUNDO','LOCAL');
create type public.ad_status as enum('ACTIVE','PAUSED');
create table if not exists public.advertisements (
  id uuid primary key default uuid_generate_v4(),
  advertiser text not null,
  title text not null,
  cta_text text not null,
  cta_url text not null,
  image_url text not null,
  scope public.ad_scope not null default 'MUNDO',
  location_city text,
  status public.ad_status not null default 'ACTIVE',
  created_at timestamptz not null default now()
);

-- Reports
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

-- Rankards (predefined catalogue)
create type public.rarity as enum('COMUM','RARO','ÉPICO','LENDÁRIO');
create table if not exists public.predefined_rankards (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text not null,
  stage int not null check (stage between 1 and 3),
  rarity public.rarity,
  req_votes int,
  req_creates int
);

-- User owned cards
create table if not exists public.user_rank_cards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  predefined_card_id uuid not null references public.predefined_rankards(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 4) RLS
alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.advertisements enable row level security;
alter table public.predefined_rankards enable row level security;
alter table public.user_rank_cards enable row level security;

-- Profiles policies
create policy "Public profile read" on public.profiles
  for select using (true);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Insert profile only by service role" on public.profiles
  for insert with check (false);

-- Polls policies
create policy "Public polls read" on public.polls for select using (true);
create policy "Users insert own polls" on public.polls for insert with check (auth.uid() = author_id);
create policy "Users update own pending polls" on public.polls for update using (auth.uid() = author_id);

-- Options policies
create policy "Public options read" on public.poll_options for select using (true);
create policy "Authors insert options" on public.poll_options for insert with check (
  exists(select 1 from public.polls p where p.id = poll_id and p.author_id = auth.uid())
);

-- Votes policies
create policy "Users read own votes" on public.votes for select using (auth.uid() = user_id);
create policy "Users insert vote" on public.votes for insert with check (auth.uid() = user_id);
create policy "Users update vote" on public.votes for update using (auth.uid() = user_id);

-- Favorites
create policy "Users read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "Users upsert favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users delete favorites" on public.favorites for delete using (auth.uid() = user_id);

-- Advertisements: public read only
create policy "Public ads read" on public.advertisements for select using (true);

-- Reports
create policy "Users create reports" on public.reports for insert with check (auth.uid() = user_id);
create policy "Read own reports" on public.reports for select using (auth.uid() = user_id);

-- Rankards catalogue: public read
create policy "Public read predefined rankards" on public.predefined_rankards for select using (true);

-- User rank cards
create policy "Users read own rank cards" on public.user_rank_cards for select using (auth.uid() = user_id);
create policy "Users insert own rank cards" on public.user_rank_cards for insert with check (auth.uid() = user_id);

-- 5) Helper views
create or replace view public.polls_with_author as
select p.*, pr.name as author_name, pr.avatar_url as author_avatar
from public.polls p
join public.profiles pr on pr.id = p.author_id;

-- 6) RPCs (voting and favorites)
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
  end if;
end;
$$;

grant execute on function public.vote_on_poll(uuid, text) to authenticated;

create or replace function public.change_vote(p_poll_id uuid, p_new_option_text text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_new_option_id uuid;
  v_old_option_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_new_option_id from public.poll_options where poll_id = p_poll_id and text = p_new_option_text;
  if v_new_option_id is null then
    raise exception 'New option not found';
  end if;

  select option_id into v_old_option_id from public.votes where poll_id = p_poll_id and user_id = v_user_id;
  if v_old_option_id is null then
    raise exception 'No prior vote';
  end if;

  if v_old_option_id = v_new_option_id then
    return; -- nothing to change
  end if;

  update public.votes set option_id = v_new_option_id where poll_id = p_poll_id and user_id = v_user_id;
  update public.poll_options set votes = votes - 1 where id = v_old_option_id;
  update public.poll_options set votes = votes + 1 where id = v_new_option_id;
end;
$$;

grant execute on function public.change_vote(uuid, text) to authenticated;

create or replace function public.toggle_favorite(p_poll_id uuid)
returns boolean -- returns true if now favorited, false if removed
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_exists boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select exists(select 1 from public.favorites where user_id = v_user_id and poll_id = p_poll_id) into v_exists;
  if v_exists then
    delete from public.favorites where user_id = v_user_id and poll_id = p_poll_id;
    return false;
  else
    insert into public.favorites(user_id, poll_id) values (v_user_id, p_poll_id);
    return true;
  end if;
end;
$$;

grant execute on function public.toggle_favorite(uuid) to authenticated;

-- 7) Auto-profile on signup (create profile row from auth.users)
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
