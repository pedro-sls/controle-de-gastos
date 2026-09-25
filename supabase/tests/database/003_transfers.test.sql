begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

insert into auth.users (id, email)
values
  ('30000000-0000-0000-0000-000000000001', 'transfer-a@example.test'),
  ('30000000-0000-0000-0000-000000000002', 'transfer-b@example.test');

insert into public.accounts (id, user_id, name, type, initial_balance)
values
  (
    '31000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Source A',
    'checking',
    1000
  ),
  (
    '31000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    'Destination A',
    'savings',
    200
  ),
  (
    '31000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000002',
    'Account B',
    'checking',
    500
  );

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

create temporary table transfer_test_state (transfer_id uuid not null);

select lives_ok(
  $$
    insert into transfer_test_state (transfer_id)
    select public.create_transfer(
      '31000000-0000-0000-0000-000000000001',
      '31000000-0000-0000-0000-000000000002',
      'Initial transfer',
      125,
      '2026-07-13',
      null,
      'paid',
      '2026-07-13',
      'Transfer test'
    )
  $$,
  'the transfer RPC creates a transfer atomically'
);

select is(
  (
    select count(*)
    from public.transfers
    where id = (select transfer_id from transfer_test_state)
  ),
  1::bigint,
  'the canonical transfer is visible to its owner'
);

select is(
  (
    select count(*)
    from public.transactions
    where transfer_id = (select transfer_id from transfer_test_state)
  ),
  2::bigint,
  'the transfer creates exactly two transaction legs'
);

select set_eq(
  $$
    select type::text
    from public.transactions
    where transfer_id = (select transfer_id from transfer_test_state)
  $$,
  $$ values ('transfer_in'::text), ('transfer_out'::text) $$,
  'the transfer has one inbound and one outbound leg'
);

select is(
  (
    select count(*)
    from public.transactions
    where transfer_id = (select transfer_id from transfer_test_state)
      and amount = 125
      and status = 'paid'
      and paid_date = '2026-07-13'
      and payment_method = 'bank_transfer'
  ),
  2::bigint,
  'both legs match the canonical transfer'
);

select is(
  (
    select current_balance
    from public.account_balances
    where id = '31000000-0000-0000-0000-000000000001'
  ),
  875.00::numeric,
  'the outbound leg reduces the source balance'
);

select is(
  (
    select current_balance
    from public.account_balances
    where id = '31000000-0000-0000-0000-000000000002'
  ),
  325.00::numeric,
  'the inbound leg increases the destination balance'
);

select lives_ok(
  $$
    select public.update_transfer(
      (select transfer_id from transfer_test_state),
      '31000000-0000-0000-0000-000000000001',
      '31000000-0000-0000-0000-000000000002',
      'Updated transfer',
      250,
      '2026-07-14',
      null,
      'paid',
      '2026-07-14',
      'Updated test'
    )
  $$,
  'the transfer RPC updates the aggregate atomically'
);

select is(
  (
    select count(*)
    from public.transfers
    where id = (select transfer_id from transfer_test_state)
      and description = 'Updated transfer'
      and amount = 250
      and transaction_date = '2026-07-14'
  ),
  1::bigint,
  'the canonical transfer stores the updated values'
);

select is(
  (
    select count(*)
    from public.transactions
    where transfer_id = (select transfer_id from transfer_test_state)
      and description = 'Updated transfer'
      and amount = 250
      and transaction_date = '2026-07-14'
      and paid_date = '2026-07-14'
  ),
  2::bigint,
  'updating the transfer synchronizes both legs'
);

select is(
  (
    select current_balance
    from public.account_balances
    where id = '31000000-0000-0000-0000-000000000001'
  ),
  750.00::numeric,
  'the source balance reflects the updated amount'
);

select is(
  (
    select current_balance
    from public.account_balances
    where id = '31000000-0000-0000-0000-000000000002'
  ),
  450.00::numeric,
  'the destination balance reflects the updated amount'
);

reset role;

select throws_ok(
  $$
    update public.transactions
    set transfer_id = '33000000-0000-0000-0000-000000000001'
    where transfer_id = (select transfer_id from transfer_test_state)
      and type = 'transfer_out'
  $$,
  '23514',
  null,
  'even privileged writes cannot reassign a transfer leg'
);

set local role authenticated;
set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

select throws_ok(
  $$
    select public.create_transfer(
      '31000000-0000-0000-0000-000000000001',
      '31000000-0000-0000-0000-000000000003',
      'Cross-user transfer',
      10,
      current_date
    )
  $$,
  '42501',
  null,
  'the transfer RPC rejects an account owned by another user'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000002';

select throws_ok(
  $$
    select public.delete_transfer(
      (select transfer_id from transfer_test_state)
    )
  $$,
  'P0002',
  null,
  'user B cannot delete user A transfer through the RPC'
);

set local request.jwt.claim.sub = '30000000-0000-0000-0000-000000000001';

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
      '30000000-0000-0000-0000-000000000001',
      '31000000-0000-0000-0000-000000000001',
      '31000000-0000-0000-0000-000000000002',
      'Direct insert',
      10,
      current_date
    )
  $$,
  '42501',
  null,
  'authenticated users cannot insert transfer parents directly'
);

select throws_ok(
  $$
    delete from public.transfers
    where id = (select transfer_id from transfer_test_state)
  $$,
  '42501',
  null,
  'authenticated users cannot delete transfer parents directly'
);

select lives_ok(
  $$
    select public.delete_transfer(
      (select transfer_id from transfer_test_state)
    )
  $$,
  'the transfer RPC deletes the aggregate atomically'
);

select is(
  (
    select count(*)
    from public.transfers
    where id = (select transfer_id from transfer_test_state)
  ),
  0::bigint,
  'the canonical transfer is deleted'
);

select is(
  (
    select count(*)
    from public.transactions
    where transfer_id = (select transfer_id from transfer_test_state)
  ),
  0::bigint,
  'both transfer legs are deleted with the canonical transfer'
);

select * from finish();

rollback;
