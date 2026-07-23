begin;

create function private.next_recurrence_date(
  p_current_date date,
  p_start_date date,
  p_frequency public.recurrence_frequency
)
returns date
language plpgsql
stable
strict
set search_path = ''
as $$
declare
  month_step integer;
  target_month date;
  target_last_day integer;
  anchor_day integer := extract(day from p_start_date);
begin
  if p_frequency = 'weekly' then
    return p_current_date + 7;
  elsif p_frequency = 'biweekly' then
    return p_current_date + 14;
  end if;

  month_step := case p_frequency
    when 'monthly' then 1
    when 'bimonthly' then 2
    when 'quarterly' then 3
    when 'semiannual' then 6
    when 'annual' then 12
    else null
  end;

  if month_step is null then
    raise exception 'Unsupported recurrence frequency'
      using errcode = '22023';
  end if;

  target_month := (
    date_trunc('month', p_current_date)
    + make_interval(months => month_step)
  )::date;
  target_last_day := extract(
    day from (target_month + interval '1 month - 1 day')
  );

  return target_month + least(anchor_day, target_last_day) - 1;
end;
$$;

create function public.generate_recurring_occurrences(
  p_until_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  recurrence public.recurring_transactions%rowtype;
  occurrence_date date;
  following_date date;
  generated_count integer := 0;
  inserted_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if p_until_date is null
    or p_until_date > current_date + 366 then
    raise exception 'Occurrence generation date is outside the allowed range'
      using errcode = '22023';
  end if;

  for recurrence in
    select recurring.*
    from public.recurring_transactions as recurring
    where recurring.user_id = current_user_id
      and recurring.is_active
      and recurring.next_execution_date <= p_until_date
      and (
        recurring.end_date is null
        or recurring.next_execution_date <= recurring.end_date
      )
    order by recurring.next_execution_date, recurring.id
    for update
  loop
    occurrence_date := recurrence.next_execution_date;

    while occurrence_date <= p_until_date
      and (
        recurrence.end_date is null
        or occurrence_date <= recurrence.end_date
      )
    loop
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
        payment_method,
        is_fixed,
        note,
        recurring_transaction_id,
        recurrence_date
      )
      values (
        current_user_id,
        recurrence.account_id,
        recurrence.category_id,
        recurrence.description,
        recurrence.amount,
        recurrence.type::text::public.transaction_type,
        occurrence_date,
        occurrence_date,
        recurrence.default_status,
        case
          when recurrence.default_status = 'paid' then occurrence_date
          else null
        end,
        recurrence.payment_method,
        recurrence.is_fixed,
        recurrence.note,
        recurrence.id,
        occurrence_date
      )
      on conflict (recurring_transaction_id, recurrence_date)
        where recurring_transaction_id is not null
      do nothing;

      get diagnostics inserted_count = row_count;
      generated_count := generated_count + inserted_count;
      following_date := private.next_recurrence_date(
        occurrence_date,
        recurrence.start_date,
        recurrence.frequency
      );
      occurrence_date := following_date;
    end loop;

    if recurrence.end_date is not null
      and occurrence_date > recurrence.end_date then
      update public.recurring_transactions
      set
        is_active = false,
        next_execution_date = greatest(
          recurrence.start_date,
          recurrence.end_date
        )
      where id = recurrence.id
        and user_id = current_user_id;
    else
      update public.recurring_transactions
      set next_execution_date = occurrence_date
      where id = recurrence.id
        and user_id = current_user_id;
    end if;
  end loop;

  return generated_count;
end;
$$;

revoke all on function private.next_recurrence_date(
  date,
  date,
  public.recurrence_frequency
) from public;

revoke all on function public.generate_recurring_occurrences(date)
from public, anon;

grant execute on function public.generate_recurring_occurrences(date)
to authenticated;

comment on function public.generate_recurring_occurrences(date) is
  'Generates each authenticated user recurrence once through a bounded date, locking schedules and advancing their next execution.';

commit;
