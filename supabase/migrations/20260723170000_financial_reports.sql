begin;

create function public.get_financial_report(
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
  period_days integer;
  previous_start date;
  previous_end date;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  period_days := p_period_end - p_period_start + 1;
  if p_period_start is null
    or p_period_end is null
    or period_days < 1
    or period_days > 731 then
    raise exception 'Report period must contain between 1 and 731 days'
      using errcode = '22023';
  end if;

  previous_end := p_period_start - 1;
  previous_start := previous_end - period_days + 1;

  return jsonb_build_object(
    'period_start', p_period_start,
    'period_end', p_period_end,
    'previous_start', previous_start,
    'previous_end', previous_end,
    'income', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'income'
        and txn.status = 'paid'
        and txn.transaction_date between p_period_start and p_period_end
    ), 0),
    'expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'paid'
        and txn.transaction_date between p_period_start and p_period_end
    ), 0),
    'previous_income', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'income'
        and txn.status = 'paid'
        and txn.transaction_date between previous_start and previous_end
    ), 0),
    'previous_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'paid'
        and txn.transaction_date between previous_start and previous_end
    ), 0),
    'pending_income', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'income'
        and txn.status = 'pending'
        and coalesce(txn.due_date, txn.transaction_date)
          between p_period_start and p_period_end
    ), 0),
    'pending_expense', coalesce((
      select sum(txn.amount)
      from public.transactions as txn
      where txn.user_id = current_user_id
        and txn.type = 'expense'
        and txn.status = 'pending'
        and coalesce(txn.due_date, txn.transaction_date)
          between p_period_start and p_period_end
    ), 0),
    'monthly', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'month', month_series.month_start,
          'income', coalesce(grouped.income, 0),
          'expense', coalesce(grouped.expense, 0)
        )
        order by month_series.month_start
      )
      from generate_series(
        date_trunc('month', p_period_start)::date,
        date_trunc('month', p_period_end)::date,
        interval '1 month'
      ) as month_series(month_start)
      left join (
        select
          date_trunc('month', txn.transaction_date)::date as month_start,
          sum(txn.amount) filter (where txn.type = 'income') as income,
          sum(txn.amount) filter (where txn.type = 'expense') as expense
        from public.transactions as txn
        where txn.user_id = current_user_id
          and txn.type in ('income', 'expense')
          and txn.status = 'paid'
          and txn.transaction_date between p_period_start and p_period_end
        group by date_trunc('month', txn.transaction_date)::date
      ) as grouped using (month_start)
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

revoke all on function public.get_financial_report(date, date)
from public, anon;

grant execute on function public.get_financial_report(date, date)
to authenticated;

comment on function public.get_financial_report(date, date) is
  'Returns an authenticated aggregate report, previous-period comparison, monthly evolution, and expense distribution.';

create function public.update_user_preferences(
  p_full_name text,
  p_currency_code varchar,
  p_locale text,
  p_timezone text,
  p_financial_month_start smallint,
  p_theme public.theme_preference,
  p_date_format text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  update public.profiles
  set full_name = nullif(btrim(p_full_name), '')
  where id = current_user_id;

  update public.user_settings
  set
    currency_code = p_currency_code,
    locale = p_locale,
    timezone = p_timezone,
    financial_month_start = p_financial_month_start,
    theme = p_theme,
    date_format = p_date_format
  where user_id = current_user_id;

  if not found then
    raise exception 'User preferences not found'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.update_user_preferences(
  text,
  varchar,
  text,
  text,
  smallint,
  public.theme_preference,
  text
) from public, anon;

grant execute on function public.update_user_preferences(
  text,
  varchar,
  text,
  text,
  smallint,
  public.theme_preference,
  text
) to authenticated;

comment on function public.update_user_preferences(
  text,
  varchar,
  text,
  text,
  smallint,
  public.theme_preference,
  text
) is 'Atomically updates the authenticated user profile and financial preferences.';

commit;
