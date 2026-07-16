begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

select has_function(
  'public',
  'get_dashboard_snapshot',
  array['date', 'date'],
  'dashboard snapshot function exists'
);

insert into auth.users (id, email)
values
  ('40000000-0000-0000-0000-000000000001', 'dashboard-a@example.test'),
  ('40000000-0000-0000-0000-000000000002', 'dashboard-b@example.test');

insert into public.accounts (id, user_id, name, type, initial_balance)
values
  (
    '41000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    'Dashboard A',
    'checking',
    1000
  ),
  (
    '41000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000001',
    'Savings A',
    'savings',
    0
  );

insert into public.transactions (
  user_id,
  account_id,
  category_id,
  description,
  amount,
  type,
  transaction_date,
  due_date,
  status,
  paid_date,
  payment_method
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    (
      select id from public.categories
      where user_id = '40000000-0000-0000-0000-000000000001'
        and type = 'income'
      order by name limit 1
    ),
    'Salary', 2000, 'income', '2026-07-05', null, 'paid', '2026-07-05', 'pix'
  ),
  (
    '40000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    (
      select id from public.categories
      where user_id = '40000000-0000-0000-0000-000000000001'
        and type = 'expense'
      order by name limit 1
    ),
    'Rent', 500, 'expense', '2026-07-06', null, 'paid', '2026-07-06', 'pix'
  ),
  (
    '40000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    (
      select id from public.categories
      where user_id = '40000000-0000-0000-0000-000000000001'
        and type = 'expense'
      order by name limit 1
    ),
    'Pending bill', 300, 'expense', '2026-07-10', '2026-07-20', 'pending', null, 'boleto'
  ),
  (
    '40000000-0000-0000-0000-000000000001',
    '41000000-0000-0000-0000-000000000001',
    (
      select id from public.categories
      where user_id = '40000000-0000-0000-0000-000000000001'
        and type = 'income'
      order by name limit 1
    ),
    'Pending income', 100, 'income', '2026-07-10', '2026-07-22', 'pending', null, 'pix'
  );

set local role anon;

select throws_ok(
  $$ select public.get_dashboard_snapshot('2026-07-01', '2026-07-31') $$,
  '42501',
  null,
  'anonymous users cannot read a dashboard snapshot'
);

set local role authenticated;
set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000001';

create temporary table dashboard_test_state as
select public.get_dashboard_snapshot('2026-07-01', '2026-07-31') as snapshot;

select is(
  (select (snapshot ->> 'total_balance')::numeric from dashboard_test_state),
  2500.00::numeric,
  'active account balance is aggregated without transfer duplication'
);

select is(
  (select (snapshot ->> 'paid_income')::numeric from dashboard_test_state),
  2000.00::numeric,
  'paid income is aggregated for the period'
);

select is(
  (select (snapshot ->> 'paid_expense')::numeric from dashboard_test_state),
  500.00::numeric,
  'paid expense is aggregated for the period'
);

select is(
  (select (snapshot ->> 'pending_income')::numeric from dashboard_test_state),
  100.00::numeric,
  'pending income remains separate from available money'
);

select is(
  (select (snapshot ->> 'pending_expense')::numeric from dashboard_test_state),
  300.00::numeric,
  'pending expense is aggregated separately'
);

select is(
  (select (snapshot ->> 'committed_expense')::numeric from dashboard_test_state),
  300.00::numeric,
  'expenses due through the period end are reserved'
);

select is(
  (select jsonb_array_length(snapshot -> 'cash_flow') from dashboard_test_state),
  2,
  'cash flow contains only paid direct movement days'
);

select is(
  (select jsonb_array_length(snapshot -> 'expense_categories') from dashboard_test_state),
  1,
  'paid expenses are grouped by category'
);

select throws_ok(
  $$ select public.get_dashboard_snapshot('2026-08-01', '2026-07-01') $$,
  '22023',
  null,
  'invalid periods are rejected'
);

set local request.jwt.claim.sub = '40000000-0000-0000-0000-000000000002';

select is(
  (public.get_dashboard_snapshot('2026-07-01', '2026-07-31') ->> 'paid_income')::numeric,
  0::numeric,
  'another user receives no totals from user A'
);

select is(
  jsonb_array_length(
    public.get_dashboard_snapshot('2026-07-01', '2026-07-31') -> 'cash_flow'
  ),
  0,
  'another user receives no chart data from user A'
);

select * from finish();

rollback;
