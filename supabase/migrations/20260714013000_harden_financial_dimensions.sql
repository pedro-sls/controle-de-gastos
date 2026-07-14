begin;

-- A interface usa arquivamento para preservar o histórico. Privilégios por
-- coluna também impedem mass assignment por chamadas REST fora da aplicação.
revoke insert, update, delete on table public.accounts from authenticated;
revoke insert, update on table public.categories from authenticated;

grant insert (
  user_id,
  name,
  type,
  initial_balance,
  institution,
  color,
  icon
) on public.accounts to authenticated;

grant update (
  name,
  type,
  initial_balance,
  institution,
  color,
  icon,
  archived_at
) on public.accounts to authenticated;

grant insert (
  user_id,
  name,
  type,
  color,
  icon
) on public.categories to authenticated;

grant update (
  name,
  color,
  icon,
  archived_at
) on public.categories to authenticated;

drop policy if exists "accounts_delete_own" on public.accounts;

commit;
