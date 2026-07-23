begin;

create extension if not exists pgtap with schema extensions;

select plan(12);

select has_function(
  'public',
  'generate_recurring_occurrences',
  array['date'],
  'recurrence generator function exists'
);

insert into auth.users (id, email)
values
  ('50000000-0000-0000-0000-000000000001', 'recurrence-a@example.test'),
  ('50000000-0000-0000-0000-000000000002', 'recurrence-b@example.test');

insert into public.accounts (id, user_id, name, type)
values
  (
    '51000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    'Recurring A',
    'checking'
  ),
  (
    '51000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    'Recurring B',
    'checking'
  );

insert into public.recurring_transactions (
  id,
  user_id,
  account_id,
  category_id,
  description,
  amount,
  type,
  frequency,
  start_date,
  next_execution_date,
  default_status,
  payment_method,
  is_fixed
)
values
  (
    '52000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000001',
    '51000000-0000-0000-0000-000000000001',
    (
      select id from public.categories
      where user_id = '50000000-0000-0000-0000-000000000001'
        and type = 'expense'
      order by name limit 1
    ),
    'Monthly expense',
    100,
    'expense',
    'monthly',
    '2026-01-31',
    '2026-01-31',
    'pending',
    'boleto',
    true
  ),
  (
    '52000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000002',
    '51000000-0000-0000-0000-000000000002',
    (
      select id from public.categories
      where user_id = '50000000-0000-0000-0000-000000000002'
        and type = 'income'
      order by name limit 1
    ),
    'Other user income',
    500,
    'income',
    'monthly',
    '2026-01-01',
    '2026-01-01',
    'paid',
    'pix',
    false
  );

set local role anon;

select throws_ok(
  $$ select public.generate_recurring_occurrences('2026-03-31') $$,
  '42501',
  null,
  'anonymous users cannot generate occurrences'
);

set local role authenticated;
set local request.jwt.claim.sub = '50000000-0000-0000-0000-000000000001';

select is(
  public.generate_recurring_occurrences('2026-03-31'),
  3,
  'all due occurrences are generated'
);

select is(
  (
    select count(*)
    from public.transactions
    where recurring_transaction_id = '52000000-0000-0000-0000-000000000001'
  ),
  3::bigint,
  'three monthly transactions exist'
);

select set_eq(
  $$
    select recurrence_date::text
    from public.transactions
    where recurring_transaction_id = '52000000-0000-0000-0000-000000000001'
  $$,
  $$ values ('2026-01-31'), ('2026-02-28'), ('2026-03-31') $$,
  'month-end recurrence keeps its original calendar anchor'
);

select is(
  (
    select next_execution_date
    from public.recurring_transactions
    where id = '52000000-0000-0000-0000-000000000001'
  ),
  '2026-04-30'::date,
  'schedule advances to the next anchored date'
);

select is(
  public.generate_recurring_occurrences('2026-03-31'),
  0,
  'repeating generation is idempotent'
);

select is(
  (
    select count(*)
    from public.transactions
    where recurring_transaction_id = '52000000-0000-0000-0000-000000000002'
  ),
  0::bigint,
  'generation never processes another user schedule'
);

select is(
  (
    select count(*)
    from public.transactions
    where recurring_transaction_id = '52000000-0000-0000-0000-000000000001'
      and due_date = recurrence_date
      and paid_date is null
      and is_fixed
  ),
  3::bigint,
  'generated pending expenses preserve due date and fixed classification'
);

select throws_ok(
  $$ select public.generate_recurring_occurrences(current_date + 367) $$,
  '22023',
  null,
  'generation more than one year ahead is rejected'
);

set local request.jwt.claim.sub = '50000000-0000-0000-0000-000000000002';

select is(
  public.generate_recurring_occurrences('2026-01-01'),
  1,
  'the other user can generate only their own occurrence'
);

select is(
  (
    select paid_date
    from public.transactions
    where recurring_transaction_id = '52000000-0000-0000-0000-000000000002'
  ),
  '2026-01-01'::date,
  'paid recurrences receive a matching paid date'
);

select * from finish();

rollback;
