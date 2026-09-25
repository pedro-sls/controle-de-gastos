begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

insert into auth.users (id, email)
values
  ('20000000-0000-0000-0000-000000000001', 'rls-a@example.test'),
  ('20000000-0000-0000-0000-000000000002', 'rls-b@example.test');

insert into public.accounts (id, user_id, name, type, initial_balance)
values
  (
    '21000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Account A',
    'checking',
    100
  ),
  (
    '21000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    'Account B',
    'checking',
    200
  );

insert into public.categories (id, user_id, name, type)
values (
  '22000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'Private expense B',
  'expense'
);

set constraints all immediate;
set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000001';

select is(
  (select count(*) from public.accounts),
  1::bigint,
  'user A only sees their own account'
);

select is(
  (select count(*) from public.categories),
  18::bigint,
  'user A only sees their own categories'
);

select is(
  (select count(*) from public.profiles),
  1::bigint,
  'user A only sees their own profile'
);

select lives_ok(
  $$
    insert into public.accounts (id, user_id, name, type)
    values (
      '21000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000001',
      'Second account A',
      'wallet'
    )
  $$,
  'user A can create their own account'
);

select throws_ok(
  $$
    insert into public.categories (user_id, name, type, is_default)
    values (
      '20000000-0000-0000-0000-000000000001',
      'Spoofed default',
      'expense',
      true
    )
  $$,
  '42501',
  null,
  'authenticated users cannot mark custom categories as defaults'
);

select throws_ok(
  $$
    update public.categories
    set type = 'income'
    where id = (
      select id
      from public.categories
      where user_id = '20000000-0000-0000-0000-000000000001'
        and type = 'expense'
      order by id
      limit 1
    )
  $$,
  '23514',
  null,
  'category type is immutable after creation'
);

select throws_ok(
  $$
    insert into public.accounts (user_id, name, type)
    values (
      '20000000-0000-0000-0000-000000000002',
      'Blocked account',
      'checking'
    )
  $$,
  '42501',
  null,
  'user A cannot create an account for user B'
);

select throws_ok(
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
    values (
      '20000000-0000-0000-0000-000000000001',
      '21000000-0000-0000-0000-000000000001',
      '22000000-0000-0000-0000-000000000002',
      'Blocked cross-user category',
      10,
      'expense',
      current_date,
      'paid',
      current_date,
      'pix'
    )
  $$,
  '23503',
  null,
  'composite foreign keys reject a category owned by user B'
);

select is(
  (select count(*) from public.account_balances),
  2::bigint,
  'security-invoker balance view only exposes user A accounts'
);

update public.accounts
set archived_at = statement_timestamp()
where id = '21000000-0000-0000-0000-000000000003';

select throws_ok(
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
      '20000000-0000-0000-0000-000000000001',
      '21000000-0000-0000-0000-000000000003',
      category.id,
      'Blocked archived account',
      10,
      'expense',
      current_date,
      'pending',
      'pix'
    from public.categories as category
    where category.user_id = '20000000-0000-0000-0000-000000000001'
      and category.type = 'expense'
    order by category.id
    limit 1
  $$,
  '23514',
  null,
  'new transactions cannot use an archived account'
);

select is_empty(
  $$
    update public.accounts
    set name = 'Compromised'
    where id = '21000000-0000-0000-0000-000000000002'
    returning id
  $$,
  'user A cannot update an account owned by user B'
);

select is_empty(
  $$
    delete from public.accounts
    where id = '21000000-0000-0000-0000-000000000002'
    returning id
  $$,
  'user A cannot delete an account owned by user B'
);

select throws_ok(
  $$
    insert into public.transfers (
      user_id,
      source_account_id,
      destination_account_id,
      description,
      amount,
      transaction_date
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '21000000-0000-0000-0000-000000000001',
      '21000000-0000-0000-0000-000000000003',
      'Blocked direct transfer',
      10,
      current_date
    )
  $$,
  '42501',
  null,
  'transfer parents cannot be inserted directly'
);

select throws_ok(
  $$
    insert into public.transactions (
      user_id,
      account_id,
      description,
      amount,
      type,
      transaction_date,
      payment_method,
      transfer_id
    )
    values (
      '20000000-0000-0000-0000-000000000001',
      '21000000-0000-0000-0000-000000000001',
      'Blocked direct transfer leg',
      10,
      'transfer_out',
      current_date,
      'bank_transfer',
      '23000000-0000-0000-0000-000000000001'
    )
  $$,
  '42501',
  null,
  'transfer legs cannot be inserted directly'
);

select throws_ok(
  $$
    delete from public.categories
    where user_id = '20000000-0000-0000-0000-000000000001'
  $$,
  '42501',
  null,
  'categories cannot be deleted directly'
);

reset role;
set local role anon;

select throws_ok(
  'select count(*) from public.accounts',
  '42501',
  null,
  'anonymous users have no account access'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '20000000-0000-0000-0000-000000000002';

select is(
  (select count(*) from public.accounts),
  1::bigint,
  'user B only sees their own account'
);

select is(
  (
    select count(*)
    from public.accounts
    where id in (
      '21000000-0000-0000-0000-000000000001',
      '21000000-0000-0000-0000-000000000003'
    )
  ),
  0::bigint,
  'user B cannot see user A account identifiers'
);

select * from finish();

rollback;
