create function public.get_dashboard_snapshot(
  p_period_start date,
  p_period_end date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  user_today date;
begin
  if current_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if p_period_start is null
    or p_period_end is null
    or p_period_end < p_period_start
    or p_period_end - p_period_start > 62 then
    raise exception 'Dashboard period is invalid'
      using errcode = '22023';
  end if;

  select (
    current_timestamp at time zone coalesce(settings.timezone, 'America/Fortaleza')
  )::date
  into user_today
  from (select 1) as seed
  left join public.user_settings as settings
    on settings.user_id = current_user_id;

  return jsonb_build_object(
    'total_balance', coalesce((
      select sum(account.current_balance)
      from public.account_balances as account
      where account.user_id = current_user_id
        and account.archived_at is null
    ), 0),
    'negative_accounts', (
      select count(*)
      from public.account_balances as account
      where account.user_id = current_user_id
        and account.archived_at is null
        and account.current_balance < 0
    ),
    'paid_income', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'income'
        and txn.status = 'paid'
        and txn.transaction_date between p_period_start and p_period_end
    ), 0),
    'paid_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'paid'
        and txn.transaction_date between p_period_start and p_period_end
    ), 0),
    'pending_income', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'income'
        and txn.status = 'pending'
    ), 0),
    'pending_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
    ), 0),
    'committed_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
        and coalesce(txn.due_date, txn.transaction_date) <= p_period_end
    ), 0),
    'overdue_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
        and txn.due_date < user_today
    ), 0),
    'overdue_count', (
      select count(*)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
        and txn.due_date < user_today
    ),
    'upcoming_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
        and txn.due_date between user_today and user_today + 7
    ), 0),
    'upcoming_count', (
      select count(*)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
        and txn.due_date between user_today and user_today + 7
    ),
    'cash_flow', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'date', daily.transaction_date,
          'income', daily.income,
          'expense', daily.expense
        )
        order by daily.transaction_date
      )
      from (
        select
          txn.transaction_date,
          coalesce(sum(txn.amount) filter (where txn.type = 'income'), 0) as income,
          coalesce(sum(txn.amount) filter (where txn.type = 'expense'), 0) as expense
        from public.transactions as txn
        where txn.user_id = current_user_id
          and txn.type in ('income', 'expense')
          and txn.status = 'paid'
          and txn.transaction_date between p_period_start and p_period_end
        group by txn.transaction_date
      ) as daily
    ), '[]'::jsonb),
    'expense_categories', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', grouped.id,
          'name', grouped.name,
          'color', grouped.color,
          'amount', grouped.amount
        )
        order by grouped.amount desc, grouped.name
      )
      from (
        select
          category.id,
          category.name,
          category.color,
          sum(txn.amount) as amount
        from public.transactions as txn
        join public.categories as category
          on category.id = txn.category_id
          and category.user_id = txn.user_id
        where txn.user_id = current_user_id
          and txn.type = 'expense'
          and txn.status = 'paid'
          and txn.transaction_date between p_period_start and p_period_end
        group by category.id, category.name, category.color
      ) as grouped
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_dashboard_snapshot(date, date)
from public, anon;

grant execute on function public.get_dashboard_snapshot(date, date)
to authenticated;

comment on function public.get_dashboard_snapshot(date, date) is
  'Returns an authenticated, aggregate-only dashboard snapshot for a bounded financial period.';
