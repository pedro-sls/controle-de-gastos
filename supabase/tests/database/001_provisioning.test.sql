begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select is(
  (
    select count(*)
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind = 'r'
      and relation.relname = any (
        array[
          'profiles',
          'user_settings',
          'accounts',
          'categories',
          'recurring_transactions',
          'transfers',
          'transactions',
          'budgets',
          'financial_goals'
        ]
      )
  ),
  9::bigint,
  'all domain tables exist'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relrowsecurity
      and relation.relname = any (
        array[
          'profiles',
          'user_settings',
          'accounts',
          'categories',
          'recurring_transactions',
          'transfers',
          'transactions',
          'budgets',
          'financial_goals'
        ]
      )
  ),
  9::bigint,
  'RLS is enabled on every domain table'
);

select is(
  (
    select count(*)
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind = 'v'
      and relation.relname = any (
        array[
          'transactions_with_effective_status',
          'account_balances',
          'budget_progress'
        ]
      )
      and relation.reloptions @> array['security_invoker=true']
  ),
  3::bigint,
  'derived views execute with invoker security'
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '10000000-0000-0000-0000-000000000001',
  'provisioning@example.test',
  '{"full_name":"Provisioned User"}'::jsonb
);

select is(
  (
    select count(*)
    from public.profiles
    where id = '10000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'a profile is provisioned for a new auth user'
);

select is(
  (
    select full_name
    from public.profiles
    where id = '10000000-0000-0000-0000-000000000001'
  ),
  'Provisioned User'::text,
  'safe profile metadata is copied during provisioning'
);

select is(
  (
    select currency_code || '|' || locale || '|' || timezone
    from public.user_settings
    where user_id = '10000000-0000-0000-0000-000000000001'
  ),
  'BRL|pt-BR|America/Fortaleza'::text,
  'default financial settings are provisioned'
);

select is(
  (
    select count(*)
    from public.categories
    where user_id = '10000000-0000-0000-0000-000000000001'
  ),
  18::bigint,
  'eighteen default categories are provisioned'
);

select is(
  (
    select count(*)
    from public.categories
    where user_id = '10000000-0000-0000-0000-000000000001'
      and type = 'expense'
  ),
  11::bigint,
  'eleven expense categories are provisioned'
);

select is(
  (
    select count(*)
    from public.categories
    where user_id = '10000000-0000-0000-0000-000000000001'
      and type = 'income'
  ),
  7::bigint,
  'seven income categories are provisioned'
);

select is(
  (
    select count(*)
    from public.categories
    where user_id = '10000000-0000-0000-0000-000000000001'
      and is_default
  ),
  18::bigint,
  'all provisioned categories are marked as defaults'
);

insert into public.accounts (
  id,
  user_id,
  name,
  type,
  created_at,
  updated_at
)
values (
  '11000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'Audit account',
  'checking',
  '2000-01-01 00:00:00+00',
  '2000-01-01 00:00:00+00'
);

select ok(
  (
    select created_at > now() - interval '1 minute'
    from public.accounts
    where id = '11000000-0000-0000-0000-000000000001'
  ),
  'created_at cannot be spoofed on insert'
);

update public.accounts
set
  name = 'Updated audit account',
  created_at = '2001-01-01 00:00:00+00',
  updated_at = '2001-01-01 00:00:00+00'
where id = '11000000-0000-0000-0000-000000000001';

select ok(
  (
    select created_at > now() - interval '1 minute'
    from public.accounts
    where id = '11000000-0000-0000-0000-000000000001'
  ),
  'created_at is preserved on update'
);

select ok(
  (
    select updated_at > now() - interval '1 minute'
    from public.accounts
    where id = '11000000-0000-0000-0000-000000000001'
  ),
  'updated_at is controlled by the database'
);

delete from auth.users
where id = '10000000-0000-0000-0000-000000000001';

select is(
  (
    (select count(*) from public.profiles where id = '10000000-0000-0000-0000-000000000001')
    +
    (select count(*) from public.user_settings where user_id = '10000000-0000-0000-0000-000000000001')
  ),
  0::bigint,
  'profile and settings are removed with the auth user'
);

select is(
  (
    select count(*)
    from public.categories
    where user_id = '10000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'categories are removed with the auth user'
);

select is(
  (
    select count(*)
    from public.accounts
    where user_id = '10000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'accounts are removed with the auth user'
);

select * from finish();

rollback;
