begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select is(
  has_table_privilege('authenticated', 'public.accounts', 'DELETE'),
  false,
  'authenticated cannot permanently delete accounts'
);

select is(
  has_table_privilege('authenticated', 'public.categories', 'DELETE'),
  false,
  'authenticated cannot permanently delete categories'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.categories',
    'is_default',
    'INSERT'
  ),
  false,
  'authenticated cannot mark custom categories as defaults'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.categories',
    'is_default',
    'UPDATE'
  ),
  false,
  'authenticated cannot change the default category marker'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.categories',
    'type',
    'UPDATE'
  ),
  false,
  'authenticated cannot change a category type after creation'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.categories',
    'name',
    'UPDATE'
  ),
  true,
  'authenticated can personalize category names'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.accounts',
    'archived_at',
    'UPDATE'
  ),
  true,
  'authenticated can archive accounts'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.accounts',
    'id',
    'INSERT'
  ),
  false,
  'account identifiers remain database generated'
);

select is(
  has_column_privilege(
    'authenticated',
    'public.accounts',
    'created_at',
    'INSERT'
  ),
  false,
  'account audit timestamps cannot be assigned by clients'
);

insert into auth.users (id, email)
values (
  '40000000-0000-0000-0000-000000000001',
  'dimensions@example.test'
);

set local role authenticated;
set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000001';

select lives_ok(
  $$
    insert into public.accounts (
      user_id,
      name,
      type,
      initial_balance,
      institution,
      color,
      icon
    )
    values (
      '40000000-0000-0000-0000-000000000001',
      'Conta principal',
      'checking',
      -50.25,
      'Banco de teste',
      '#059669',
      'Landmark'
    )
  $$,
  'authenticated can create an account with allowed fields'
);

select lives_ok(
  $$
    insert into public.categories (user_id, name, type, color, icon)
    values (
      '40000000-0000-0000-0000-000000000001',
      'Categoria personalizada',
      'expense',
      '#2563EB',
      'Tags'
    )
  $$,
  'authenticated can create a custom category'
);

select throws_ok(
  $$
    insert into public.categories (user_id, name, type, is_default)
    values (
      '40000000-0000-0000-0000-000000000001',
      'Padrão forjado',
      'income',
      true
    )
  $$,
  '42501',
  null,
  'authenticated cannot forge a default category'
);

select throws_ok(
  $$
    update public.categories
    set type = 'income'
    where user_id = '40000000-0000-0000-0000-000000000001'
      and name = 'Categoria personalizada'
  $$,
  '42501',
  null,
  'authenticated cannot mutate category type directly'
);

select lives_ok(
  $$
    update public.categories
    set archived_at = statement_timestamp()
    where user_id = '40000000-0000-0000-0000-000000000001'
      and name = 'Categoria personalizada'
  $$,
  'authenticated can archive a category'
);

select throws_ok(
  $$
    delete from public.accounts
    where user_id = '40000000-0000-0000-0000-000000000001'
  $$,
  '42501',
  null,
  'authenticated cannot bypass account archiving with delete'
);

select is(
  (
    select current_balance
    from public.account_balances
    where user_id = '40000000-0000-0000-0000-000000000001'
      and name = 'Conta principal'
  ),
  -50.25::numeric,
  'an account starts with its negative initial balance'
);

select lives_ok(
  $$
    insert into public.transactions (
      user_id,
      account_id,
      category_id,
      description,
      amount,
      type,
      transaction_date,
      status,
      paid_date,
      payment_method
    )
    select
      '40000000-0000-0000-0000-000000000001',
      account.id,
      category.id,
      'Receita paga',
      100,
      'income',
      current_date,
      'paid',
      current_date,
      'pix'
    from public.accounts as account
    cross join public.categories as category
    where account.user_id = '40000000-0000-0000-0000-000000000001'
      and account.name = 'Conta principal'
      and category.user_id = account.user_id
      and category.type = 'income'
      and category.archived_at is null
    order by category.id
    limit 1
  $$,
  'a paid income can reference active financial dimensions'
);

select is(
  (
    select current_balance
    from public.account_balances
    where user_id = '40000000-0000-0000-0000-000000000001'
      and name = 'Conta principal'
  ),
  49.75::numeric,
  'paid income contributes to the calculated balance'
);

select lives_ok(
  $$
    insert into public.transactions (
      user_id,
      account_id,
      category_id,
      description,
      amount,
      type,
      transaction_date,
      status,
      payment_method
    )
    select
      '40000000-0000-0000-0000-000000000001',
      account.id,
      category.id,
      'Despesa pendente',
      20,
      'expense',
      current_date,
      'pending',
      'pix'
    from public.accounts as account
    cross join public.categories as category
    where account.user_id = '40000000-0000-0000-0000-000000000001'
      and account.name = 'Conta principal'
      and category.user_id = account.user_id
      and category.type = 'expense'
      and category.archived_at is null
    order by category.id
    limit 1
  $$,
  'a pending expense can be recorded'
);

select is(
  (
    select current_balance
    from public.account_balances
    where user_id = '40000000-0000-0000-0000-000000000001'
      and name = 'Conta principal'
  ),
  49.75::numeric,
  'pending expenses do not change the calculated balance'
);

select * from finish();

rollback;
