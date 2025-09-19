-- RANKIOU - Supabase Schema v5 (incremental)
-- 1) Garantir permissões de execução para checagem de admin
-- 2) Adicionar wrapper sem argumento para facilitar consumo no cliente

-- 1) Concede EXECUTE explicitamente (defensivo)
grant execute on function public.is_admin(uuid) to authenticated;

-- 2) Wrapper: usa auth.uid() para checar o próprio usuário
create or replace function public.is_admin_self()
returns boolean
language sql
stable
as $$
  select public.is_admin(auth.uid());
$$;

grant execute on function public.is_admin_self() to authenticated;

-- Fim (v5)
