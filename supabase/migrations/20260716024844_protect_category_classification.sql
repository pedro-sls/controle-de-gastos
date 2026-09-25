begin;

create function private.protect_category_classification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.type is distinct from new.type then
    raise exception 'Category type is immutable after creation'
      using errcode = '23514';
  end if;

  if auth.uid() is not null and (
    (tg_op = 'INSERT' and new.is_default)
    or
    (tg_op = 'UPDATE' and old.is_default is distinct from new.is_default)
  ) then
    raise exception 'Default category classification is managed by the database'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger categories_protect_classification
before insert or update on public.categories
for each row execute function private.protect_category_classification();

revoke all on function private.protect_category_classification()
from public, anon, authenticated;

comment on function private.protect_category_classification is
  'Keeps category type immutable and prevents authenticated clients from spoofing the default-category marker.';

commit;
