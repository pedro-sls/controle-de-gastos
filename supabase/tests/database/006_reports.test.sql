begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

select has_function(
  'public',
  'get_financial_report',
  array['date', 'date'],
  'financial report function exists'
);

insert into auth.users (id, email)
values
  ('60000000-0000-0000-0000-000000000001', 'report-a@example.test'),
  ('60000000-0000-0000-0000-000000000002', 'report-b@example.test');

insert into public.accounts (id, user_id, name, type)
values (
  '61000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  'Report account',
  'checking'
);

insert into public.transactions (
  user_id, account_id, category_id, description, amount, type,
  transaction_date, due_date, status, paid_date, payment_method
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    (select id from public.categories where user_id = '60000000-0000-0000-0000-000000000001' and type = 'income' order by name limit 1),
    'Previous income', 800, 'income', '2026-05-15', null, 'paid', '2026-05-15', 'pix'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    (select id from public.categories where user_id = '60000000-0000-0000-0000-000000000001' and type = 'income' order by name limit 1),
    'Current income', 1000, 'income', '2026-06-10', null, 'paid', '2026-06-10', 'pix'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    (select id from public.categories where user_id = '60000000-0000-0000-0000-000000000001' and type = 'expense' order by name limit 1),
    'Current expense', 300, 'expense', '2026-06-12', null, 'paid', '2026-06-12', 'pix'
  ),
  (
    '60000000-0000-0000-0000-000000000001',
    '61000000-0000-0000-0000-000000000001',
    (select id from public.categories where user_id = '60000000-0000-0000-0000-000000000001' and type = 'expense' order by name limit 1),
    'Pending expense', 150, 'expense', '2026-06-15', '2026-06-20', 'pending', null, 'boleto'
  );

set local role anon;

select throws_ok(
  $$ select public.get_financial_report('2026-06-01', '2026-06-30') $$,
  '42501',
  null,
  'anonymous users cannot read reports'
);

set local role authenticated;
set local request.jwt.claim.sub = '60000000-0000-0000-0000-000000000001';

create temporary table report_state as
select public.get_financial_report('2026-06-01', '2026-06-30') as report;

select is(
  (select (report ->> 'income')::numeric from report_state),
  1000::numeric,
  'current paid income is aggregated'
);

select is(
  (select (report ->> 'expense')::numeric from report_state),
  300::numeric,
  'current paid expense is aggregated'
);

select is(
  (select (report ->> 'previous_income')::numeric from report_state),
  800::numeric,
  'same-length previous period is compared'
);

select is(
  (select (report ->> 'pending_expense')::numeric from report_state),
  150::numeric,
  'pending expense remains separate'
);

select is(
  (select jsonb_array_length(report -> 'monthly') from report_state),
  1,
  'monthly series fills the selected month'
);

select is(
  (select jsonb_array_length(report -> 'expense_categories') from report_state),
  1,
  'expenses are grouped by category'
);

select throws_ok(
  $$ select public.get_financial_report('2026-06-30', '2026-06-01') $$,
  '22023',
  null,
  'inverted periods are rejected'
);

set local request.jwt.claim.sub = '60000000-0000-0000-0000-000000000002';

select is(
  (public.get_financial_report('2026-06-01', '2026-06-30') ->> 'income')::numeric,
  0::numeric,
  'another user receives no income from user A'
);

select is(
  jsonb_array_length(
    public.get_financial_report('2026-06-01', '2026-06-30') -> 'expense_categories'
  ),
  0,
  'another user receives no categories from user A'
);

select lives_ok(
  $$
    select public.update_user_preferences(
      'Report User B',
      'BRL',
      'pt-BR',
      'America/Recife',
      5::smallint,
      'dark',
      'dd/MM/yyyy'
    )
  $$,
  'preferences can be updated atomically'
);

select is(
  (
    select profile.full_name || '|' || settings.timezone || '|' || settings.financial_month_start
    from public.profiles as profile
    join public.user_settings as settings on settings.user_id = profile.id
    where profile.id = '60000000-0000-0000-0000-000000000002'
  ),
  'Report User B|America/Recife|5'::text,
  'profile and settings changes are stored together'
);

select * from finish();

rollback;
