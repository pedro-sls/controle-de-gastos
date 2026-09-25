begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.account_type as enum (
  'checking',
  'savings',
  'wallet',
  'cash',
  'digital',
  'other'
);

create type public.account_status as enum ('active', 'archived');
create type public.category_type as enum ('income', 'expense');

create type public.transaction_type as enum (
  'income',
  'expense',
  'transfer_out',
  'transfer_in'
);

create type public.transaction_status as enum (
  'paid',
  'pending',
  'canceled'
);

create type public.payment_method as enum (
  'cash',
  'pix',
  'debit_card',
  'credit_card',
  'boleto',
  'bank_transfer',
  'other'
);

create type public.recurrence_frequency as enum (
  'weekly',
  'biweekly',
  'monthly',
  'bimonthly',
  'quarterly',
  'semiannual',
  'annual'
);

create type public.theme_preference as enum ('system', 'light', 'dark');
create type public.goal_status as enum ('active', 'paused', 'completed', 'canceled');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length_check check (
    full_name is null
    or (char_length(btrim(full_name)) between 1 and 120)
  ),
  constraint profiles_avatar_url_length_check check (
    avatar_url is null or char_length(avatar_url) <= 2048
  )
);

alter table public.profiles enable row level security;

create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency_code varchar(3) not null default 'BRL',
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Fortaleza',
  financial_month_start smallint not null default 1,
  theme public.theme_preference not null default 'system',
  date_format text not null default 'dd/MM/yyyy',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_currency_code_check check (
    currency_code ~ '^[A-Z]{3}$'
  ),
  constraint user_settings_locale_check check (
    char_length(btrim(locale)) between 2 and 35
  ),
  constraint user_settings_timezone_check check (
    char_length(btrim(timezone)) between 1 and 100
  ),
  constraint user_settings_financial_month_start_check check (
    financial_month_start between 1 and 28
  ),
  constraint user_settings_date_format_check check (
    date_format in ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd')
  )
);

alter table public.user_settings enable row level security;

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type public.account_type not null,
  initial_balance numeric(14, 2) not null default 0,
  institution text,
  color text,
  icon text,
  archived_at timestamptz,
  status public.account_status generated always as (
    case
      when archived_at is null then 'active'::public.account_status
      else 'archived'::public.account_status
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_name_length_check check (
    char_length(btrim(name)) between 1 and 80
  ),
  constraint accounts_institution_length_check check (
    institution is null or char_length(btrim(institution)) between 1 and 120
  ),
  constraint accounts_color_check check (
    color is null or color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint accounts_icon_check check (
    icon is null or icon ~ '^[A-Za-z0-9-]{1,60}$'
  ),
  constraint accounts_id_user_unique unique (id, user_id)
);

alter table public.accounts enable row level security;

create unique index accounts_active_name_unique_idx
  on public.accounts (user_id, lower(btrim(name)))
  where archived_at is null;

create index accounts_user_archived_idx
  on public.accounts (user_id, archived_at);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type public.category_type not null,
  color text,
  icon text,
  is_default boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_length_check check (
    char_length(btrim(name)) between 1 and 80
  ),
  constraint categories_color_check check (
    color is null or color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint categories_icon_check check (
    icon is null or icon ~ '^[A-Za-z0-9-]{1,60}$'
  ),
  constraint categories_id_user_unique unique (id, user_id),
  constraint categories_id_user_type_unique unique (id, user_id, type)
);

alter table public.categories enable row level security;

create unique index categories_active_name_unique_idx
  on public.categories (user_id, type, lower(btrim(name)))
  where archived_at is null;

create index categories_user_type_archived_idx
  on public.categories (user_id, type, archived_at);

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  description text not null,
  amount numeric(14, 2) not null,
  type public.category_type not null,
  frequency public.recurrence_frequency not null,
  start_date date not null,
  end_date date,
  next_execution_date date not null,
  is_active boolean not null default true,
  default_status public.transaction_status not null default 'pending',
  payment_method public.payment_method not null,
  is_fixed boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_transactions_description_length_check check (
    char_length(btrim(description)) between 1 and 160
  ),
  constraint recurring_transactions_amount_check check (amount > 0),
  constraint recurring_transactions_dates_check check (
    end_date is null or end_date >= start_date
  ),
  constraint recurring_transactions_next_date_check check (
    next_execution_date >= start_date
    and (end_date is null or next_execution_date <= end_date)
  ),
  constraint recurring_transactions_note_length_check check (
    note is null or char_length(note) <= 2000
  ),
  constraint recurring_transactions_fixed_check check (
    not is_fixed or type = 'expense'
  ),
  constraint recurring_transactions_id_user_unique unique (id, user_id),
  constraint recurring_transactions_account_owner_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete no action
    deferrable initially deferred,
  constraint recurring_transactions_category_owner_fk
    foreign key (category_id, user_id, type)
    references public.categories (id, user_id, type)
    on delete no action
    deferrable initially deferred
);

alter table public.recurring_transactions enable row level security;

create index recurring_transactions_user_account_idx
  on public.recurring_transactions (user_id, account_id);

create index recurring_transactions_user_category_idx
  on public.recurring_transactions (user_id, category_id);

create index recurring_transactions_due_idx
  on public.recurring_transactions (user_id, next_execution_date)
  where is_active;

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_account_id uuid not null,
  destination_account_id uuid not null,
  description text not null,
  amount numeric(14, 2) not null,
  transaction_date date not null,
  due_date date,
  status public.transaction_status not null default 'pending',
  paid_date date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfers_description_length_check check (
    char_length(btrim(description)) between 1 and 160
  ),
  constraint transfers_amount_check check (amount > 0),
  constraint transfers_distinct_accounts_check check (
    source_account_id <> destination_account_id
  ),
  constraint transfers_due_date_check check (
    due_date is null or due_date >= transaction_date
  ),
  constraint transfers_paid_date_check check (
    (status = 'paid' and paid_date is not null)
    or (status <> 'paid' and paid_date is null)
  ),
  constraint transfers_note_length_check check (
    note is null or char_length(note) <= 2000
  ),
  constraint transfers_id_user_unique unique (id, user_id),
  constraint transfers_source_account_owner_fk
    foreign key (source_account_id, user_id)
    references public.accounts (id, user_id)
    on delete no action
    deferrable initially deferred,
  constraint transfers_destination_account_owner_fk
    foreign key (destination_account_id, user_id)
    references public.accounts (id, user_id)
    on delete no action
    deferrable initially deferred
);

alter table public.transfers enable row level security;

create index transfers_user_date_idx
  on public.transfers (user_id, transaction_date desc, created_at desc);

create index transfers_user_source_account_idx
  on public.transfers (user_id, source_account_id);

create index transfers_user_destination_account_idx
  on public.transfers (user_id, destination_account_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null,
  category_id uuid,
  description text not null,
  amount numeric(14, 2) not null,
  type public.transaction_type not null,
  category_kind public.category_type generated always as (
    case
      when type = 'income' then 'income'::public.category_type
      when type = 'expense' then 'expense'::public.category_type
      else null
    end
  ) stored,
  transaction_date date not null,
  due_date date,
  status public.transaction_status not null default 'pending',
  paid_date date,
  payment_method public.payment_method not null,
  is_fixed boolean not null default false,
  note text,
  transfer_id uuid,
  recurring_transaction_id uuid,
  recurrence_date date,
  is_recurring boolean generated always as (
    recurring_transaction_id is not null
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_description_length_check check (
    char_length(btrim(description)) between 1 and 160
  ),
  constraint transactions_amount_check check (amount > 0),
  constraint transactions_due_date_check check (
    due_date is null or due_date >= transaction_date
  ),
  constraint transactions_paid_date_check check (
    (status = 'paid' and paid_date is not null)
    or (status <> 'paid' and paid_date is null)
  ),
  constraint transactions_note_length_check check (
    note is null or char_length(note) <= 2000
  ),
  constraint transactions_fixed_check check (
    not is_fixed or type = 'expense'
  ),
  constraint transactions_recurrence_check check (
    (recurring_transaction_id is null and recurrence_date is null)
    or (recurring_transaction_id is not null and recurrence_date is not null)
  ),
  constraint transactions_kind_check check (
    (
      type in ('income', 'expense')
      and category_id is not null
      and transfer_id is null
    )
    or (
      type in ('transfer_out', 'transfer_in')
      and category_id is null
      and transfer_id is not null
      and recurring_transaction_id is null
      and recurrence_date is null
      and payment_method = 'bank_transfer'
      and not is_fixed
    )
  ),
  constraint transactions_id_user_unique unique (id, user_id),
  constraint transactions_account_owner_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete no action
    deferrable initially deferred,
  constraint transactions_category_owner_fk
    foreign key (category_id, user_id, category_kind)
    references public.categories (id, user_id, type)
    on delete no action
    deferrable initially deferred,
  constraint transactions_transfer_owner_fk
    foreign key (transfer_id, user_id)
    references public.transfers (id, user_id)
    on delete cascade,
  constraint transactions_recurring_owner_fk
    foreign key (recurring_transaction_id, user_id)
    references public.recurring_transactions (id, user_id)
    on delete no action
    deferrable initially deferred
);

alter table public.transactions enable row level security;

create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc, created_at desc);

create index transactions_user_account_date_idx
  on public.transactions (user_id, account_id, transaction_date desc);

create index transactions_user_category_date_idx
  on public.transactions (user_id, category_id, transaction_date desc)
  where category_id is not null;

create index transactions_user_type_date_idx
  on public.transactions (user_id, type, transaction_date desc);

create index transactions_user_pending_due_idx
  on public.transactions (user_id, due_date)
  where status = 'pending' and due_date is not null;

create unique index transactions_recurring_occurrence_unique_idx
  on public.transactions (recurring_transaction_id, recurrence_date)
  where recurring_transaction_id is not null;

create unique index transactions_transfer_leg_unique_idx
  on public.transactions (transfer_id, type)
  where transfer_id is not null;

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid,
  category_kind public.category_type generated always as (
    'expense'::public.category_type
  ) stored,
  period_month date not null,
  limit_amount numeric(14, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_period_month_check check (
    period_month = date_trunc('month', period_month)::date
  ),
  constraint budgets_limit_amount_check check (limit_amount > 0),
  constraint budgets_category_owner_fk
    foreign key (category_id, user_id, category_kind)
    references public.categories (id, user_id, type)
    on delete no action
    deferrable initially deferred
);

alter table public.budgets enable row level security;

create unique index budgets_general_period_unique_idx
  on public.budgets (user_id, period_month)
  where category_id is null;

create unique index budgets_category_period_unique_idx
  on public.budgets (user_id, category_id, period_month)
  where category_id is not null;

create index budgets_user_category_idx
  on public.budgets (user_id, category_id);

create table public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid,
  name text not null,
  target_amount numeric(14, 2) not null,
  reserved_amount numeric(14, 2) not null default 0,
  target_date date,
  status public.goal_status not null default 'active',
  completed_at timestamptz,
  color text,
  icon text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_goals_name_length_check check (
    char_length(btrim(name)) between 1 and 120
  ),
  constraint financial_goals_target_amount_check check (target_amount > 0),
  constraint financial_goals_reserved_amount_check check (reserved_amount >= 0),
  constraint financial_goals_completed_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  ),
  constraint financial_goals_color_check check (
    color is null or color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint financial_goals_icon_check check (
    icon is null or icon ~ '^[A-Za-z0-9-]{1,60}$'
  ),
  constraint financial_goals_note_length_check check (
    note is null or char_length(note) <= 2000
  ),
  constraint financial_goals_account_owner_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete no action
    deferrable initially deferred
);

alter table public.financial_goals enable row level security;

create index financial_goals_user_status_date_idx
  on public.financial_goals (user_id, status, target_date);

create index financial_goals_user_account_idx
  on public.financial_goals (user_id, account_id)
  where account_id is not null;

create function private.set_audit_timestamps()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := statement_timestamp();
  else
    new.created_at := old.created_at;
  end if;

  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create trigger profiles_set_audit_timestamps
before insert or update on public.profiles
for each row execute function private.set_audit_timestamps();

create trigger user_settings_set_audit_timestamps
before insert or update on public.user_settings
for each row execute function private.set_audit_timestamps();

create trigger accounts_set_audit_timestamps
before insert or update on public.accounts
for each row execute function private.set_audit_timestamps();

create trigger categories_set_audit_timestamps
before insert or update on public.categories
for each row execute function private.set_audit_timestamps();

create trigger recurring_transactions_set_audit_timestamps
before insert or update on public.recurring_transactions
for each row execute function private.set_audit_timestamps();

create trigger transfers_set_audit_timestamps
before insert or update on public.transfers
for each row execute function private.set_audit_timestamps();

create trigger transactions_set_audit_timestamps
before insert or update on public.transactions
for each row execute function private.set_audit_timestamps();

create trigger budgets_set_audit_timestamps
before insert or update on public.budgets
for each row execute function private.set_audit_timestamps();

create trigger financial_goals_set_audit_timestamps
before insert or update on public.financial_goals
for each row execute function private.set_audit_timestamps();

create function private.validate_user_settings_timezone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = new.timezone
  ) then
    raise exception 'Unknown timezone: %', new.timezone
      using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger user_settings_validate_timezone
before insert or update on public.user_settings
for each row execute function private.validate_user_settings_timezone();

create function private.protect_transfer_leg_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.transfer_id is distinct from new.transfer_id then
    raise exception 'A transaction cannot enter, leave, or change a transfer aggregate'
      using errcode = '23514';
  end if;

  if old.transfer_id is not null
    and (
      old.user_id is distinct from new.user_id
      or old.type is distinct from new.type
    ) then
    raise exception 'Transfer leg ownership and direction are immutable'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger transactions_protect_transfer_leg_identity
before update on public.transactions
for each row execute function private.protect_transfer_leg_identity();

create function private.validate_active_financial_references()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_data jsonb;
  old_data jsonb;
  target_user_id uuid;
  target_account_id uuid;
  target_category_id uuid;
  account_key text;
  category_key text;
begin
  new_data := to_jsonb(new);
  old_data := coalesce(to_jsonb(old), '{}'::jsonb);
  target_user_id := (new_data ->> 'user_id')::uuid;

  if tg_table_name = 'transfers' then
    if tg_op = 'INSERT'
      or new_data ->> 'user_id' is distinct from old_data ->> 'user_id'
      or new_data ->> 'source_account_id' is distinct from old_data ->> 'source_account_id'
      or new_data ->> 'destination_account_id' is distinct from old_data ->> 'destination_account_id' then
      if (
        select count(*)
        from public.accounts as account
        where account.user_id = target_user_id
          and account.id in (
            (new_data ->> 'source_account_id')::uuid,
            (new_data ->> 'destination_account_id')::uuid
          )
          and account.archived_at is null
      ) <> 2 then
        raise exception 'New transfers require two active accounts owned by the user'
          using errcode = '23514';
      end if;
    end if;

    return new;
  end if;

  if tg_table_name in ('recurring_transactions', 'transactions') then
    account_key := 'account_id';
    category_key := 'category_id';
  elsif tg_table_name = 'budgets' then
    category_key := 'category_id';
  elsif tg_table_name = 'financial_goals' then
    account_key := 'account_id';
  else
    raise exception 'Unsupported active-reference table: %', tg_table_name;
  end if;

  if account_key is not null then
    target_account_id := nullif(new_data ->> account_key, '')::uuid;

    if target_account_id is not null
      and (
        tg_op = 'INSERT'
        or new_data ->> 'user_id' is distinct from old_data ->> 'user_id'
        or new_data ->> account_key is distinct from old_data ->> account_key
      )
      and exists (
        select 1
        from public.accounts as account
        where account.id = target_account_id
          and account.user_id = target_user_id
      )
      and not exists (
        select 1
        from public.accounts as account
        where account.id = target_account_id
          and account.user_id = target_user_id
          and account.archived_at is null
      ) then
      raise exception 'New % records require an active account owned by the user', tg_table_name
        using errcode = '23514';
    end if;
  end if;

  if category_key is not null then
    target_category_id := nullif(new_data ->> category_key, '')::uuid;

    if target_category_id is not null
      and (
        tg_op = 'INSERT'
        or new_data ->> 'user_id' is distinct from old_data ->> 'user_id'
        or new_data ->> category_key is distinct from old_data ->> category_key
      )
      and exists (
        select 1
        from public.categories as category
        where category.id = target_category_id
          and category.user_id = target_user_id
      )
      and not exists (
        select 1
        from public.categories as category
        where category.id = target_category_id
          and category.user_id = target_user_id
          and category.archived_at is null
      ) then
      raise exception 'New % records require an active category owned by the user', tg_table_name
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger recurring_transactions_validate_active_references
before insert or update on public.recurring_transactions
for each row execute function private.validate_active_financial_references();

create trigger transfers_validate_active_references
before insert or update on public.transfers
for each row execute function private.validate_active_financial_references();

create trigger transactions_validate_active_references
before insert or update on public.transactions
for each row execute function private.validate_active_financial_references();

create trigger budgets_validate_active_references
before insert or update on public.budgets
for each row execute function private.validate_active_financial_references();

create trigger financial_goals_validate_active_references
before insert or update on public.financial_goals
for each row execute function private.validate_active_financial_references();

create function private.sync_transfer_legs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.transactions
  set
    account_id = case
      when type = 'transfer_out' then new.source_account_id
      else new.destination_account_id
    end,
    description = new.description,
    amount = new.amount,
    transaction_date = new.transaction_date,
    due_date = new.due_date,
    status = new.status,
    paid_date = new.paid_date,
    note = new.note
  where transfer_id = new.id
    and user_id = new.user_id;

  return new;
end;
$$;

create trigger transfers_sync_legs
after update on public.transfers
for each row execute function private.sync_transfer_legs();

create function private.validate_transfer_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  transfer_to_check uuid;
  transfer_record public.transfers%rowtype;
  leg_count integer;
  outbound_count integer;
  inbound_count integer;
  matching_count integer;
begin
  if tg_table_name = 'transfers' then
    if tg_op = 'DELETE' then
      transfer_to_check := old.id;
    else
      transfer_to_check := new.id;
    end if;
  else
    if tg_op = 'DELETE' then
      transfer_to_check := old.transfer_id;
    else
      transfer_to_check := new.transfer_id;
    end if;
  end if;

  if transfer_to_check is null then
    return null;
  end if;

  select *
  into transfer_record
  from public.transfers
  where id = transfer_to_check;

  if not found then
    return null;
  end if;

  select
    count(*),
    count(*) filter (where type = 'transfer_out'),
    count(*) filter (where type = 'transfer_in'),
    count(*) filter (
      where user_id = transfer_record.user_id
        and amount = transfer_record.amount
        and description = transfer_record.description
        and transaction_date = transfer_record.transaction_date
        and due_date is not distinct from transfer_record.due_date
        and status = transfer_record.status
        and paid_date is not distinct from transfer_record.paid_date
        and note is not distinct from transfer_record.note
        and payment_method = 'bank_transfer'
        and category_id is null
        and recurring_transaction_id is null
        and recurrence_date is null
        and not is_fixed
        and (
          (type = 'transfer_out' and account_id = transfer_record.source_account_id)
          or
          (type = 'transfer_in' and account_id = transfer_record.destination_account_id)
        )
    )
  into leg_count, outbound_count, inbound_count, matching_count
  from public.transactions
  where transfer_id = transfer_to_check;

  if leg_count <> 2
    or outbound_count <> 1
    or inbound_count <> 1
    or matching_count <> 2 then
    raise exception 'Transfer % must have one matching outbound leg and one matching inbound leg',
      transfer_to_check
      using errcode = '23514';
  end if;

  return null;
end;
$$;

create constraint trigger transfers_validate_integrity
after insert or update on public.transfers
deferrable initially deferred
for each row execute function private.validate_transfer_integrity();

create constraint trigger transaction_legs_validate_integrity
after insert or update or delete on public.transactions
deferrable initially deferred
for each row execute function private.validate_transfer_integrity();

create function public.create_transfer(
  p_source_account_id uuid,
  p_destination_account_id uuid,
  p_description text,
  p_amount numeric,
  p_transaction_date date,
  p_due_date date default null,
  p_status public.transaction_status default 'pending',
  p_paid_date date default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  owned_account_count integer;
  new_transfer_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if p_source_account_id = p_destination_account_id then
    raise exception 'Source and destination accounts must be different'
      using errcode = '22023';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Transfer amount must be greater than zero'
      using errcode = '22023';
  end if;

  perform account.id
  from public.accounts as account
  where account.user_id = current_user_id
    and account.id in (p_source_account_id, p_destination_account_id)
    and account.archived_at is null
  order by account.id
  for update;

  get diagnostics owned_account_count = row_count;

  if owned_account_count <> 2 then
    raise exception 'Both active accounts must belong to the authenticated user'
      using errcode = '42501';
  end if;

  insert into public.transfers (
    user_id,
    source_account_id,
    destination_account_id,
    description,
    amount,
    transaction_date,
    due_date,
    status,
    paid_date,
    note
  )
  values (
    current_user_id,
    p_source_account_id,
    p_destination_account_id,
    p_description,
    p_amount,
    p_transaction_date,
    p_due_date,
    p_status,
    p_paid_date,
    p_note
  )
  returning id into new_transfer_id;

  insert into public.transactions (
    user_id,
    account_id,
    description,
    amount,
    type,
    transaction_date,
    due_date,
    status,
    paid_date,
    payment_method,
    note,
    transfer_id
  )
  values
    (
      current_user_id,
      p_source_account_id,
      p_description,
      p_amount,
      'transfer_out',
      p_transaction_date,
      p_due_date,
      p_status,
      p_paid_date,
      'bank_transfer',
      p_note,
      new_transfer_id
    ),
    (
      current_user_id,
      p_destination_account_id,
      p_description,
      p_amount,
      'transfer_in',
      p_transaction_date,
      p_due_date,
      p_status,
      p_paid_date,
      'bank_transfer',
      p_note,
      new_transfer_id
    );

  return new_transfer_id;
end;
$$;

create function public.update_transfer(
  p_transfer_id uuid,
  p_source_account_id uuid,
  p_destination_account_id uuid,
  p_description text,
  p_amount numeric,
  p_transaction_date date,
  p_due_date date default null,
  p_status public.transaction_status default 'pending',
  p_paid_date date default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  owned_account_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if p_source_account_id = p_destination_account_id then
    raise exception 'Source and destination accounts must be different'
      using errcode = '22023';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Transfer amount must be greater than zero'
      using errcode = '22023';
  end if;

  perform transfer.id
  from public.transfers as transfer
  where transfer.id = p_transfer_id
    and transfer.user_id = current_user_id
  for update;

  if not found then
    raise exception 'Transfer was not found'
      using errcode = 'P0002';
  end if;

  perform account.id
  from public.accounts as account
  where account.user_id = current_user_id
    and account.id in (p_source_account_id, p_destination_account_id)
    and account.archived_at is null
  order by account.id
  for update;

  get diagnostics owned_account_count = row_count;

  if owned_account_count <> 2 then
    raise exception 'Both active accounts must belong to the authenticated user'
      using errcode = '42501';
  end if;

  update public.transfers
  set
    source_account_id = p_source_account_id,
    destination_account_id = p_destination_account_id,
    description = p_description,
    amount = p_amount,
    transaction_date = p_transaction_date,
    due_date = p_due_date,
    status = p_status,
    paid_date = p_paid_date,
    note = p_note
  where id = p_transfer_id
    and user_id = current_user_id;

  return p_transfer_id;
end;
$$;

create function public.delete_transfer(p_transfer_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  delete from public.transfers
  where id = p_transfer_id
    and user_id = current_user_id;

  if not found then
    raise exception 'Transfer was not found'
      using errcode = 'P0002';
  end if;
end;
$$;

create function private.provision_default_categories(target_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.categories (user_id, name, type, color, icon, is_default)
  values
    (target_user_id, 'Alimentação', 'expense', '#F97316', 'Utensils', true),
    (target_user_id, 'Transporte', 'expense', '#3B82F6', 'Bus', true),
    (target_user_id, 'Moradia', 'expense', '#8B5CF6', 'House', true),
    (target_user_id, 'Saúde', 'expense', '#EF4444', 'HeartPulse', true),
    (target_user_id, 'Educação', 'expense', '#6366F1', 'GraduationCap', true),
    (target_user_id, 'Lazer', 'expense', '#EC4899', 'Gamepad2', true),
    (target_user_id, 'Compras', 'expense', '#F59E0B', 'ShoppingBag', true),
    (target_user_id, 'Assinaturas', 'expense', '#14B8A6', 'Repeat2', true),
    (target_user_id, 'Dívidas', 'expense', '#DC2626', 'Landmark', true),
    (target_user_id, 'Impostos', 'expense', '#64748B', 'ReceiptText', true),
    (target_user_id, 'Outros', 'expense', '#737373', 'CircleEllipsis', true),
    (target_user_id, 'Salário', 'income', '#16A34A', 'BriefcaseBusiness', true),
    (target_user_id, 'Freelance', 'income', '#0D9488', 'Laptop', true),
    (target_user_id, 'Vendas', 'income', '#22C55E', 'BadgeDollarSign', true),
    (target_user_id, 'Rendimentos', 'income', '#15803D', 'TrendingUp', true),
    (target_user_id, 'Reembolso', 'income', '#0891B2', 'RotateCcw', true),
    (target_user_id, 'Presente', 'income', '#DB2777', 'Gift', true),
    (target_user_id, 'Outros', 'income', '#737373', 'CircleEllipsis', true)
  on conflict do nothing;
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(left(btrim(new.raw_user_meta_data ->> 'full_name'), 120), ''),
    case
      when char_length(btrim(new.raw_user_meta_data ->> 'avatar_url')) between 1 and 2048
        then btrim(new.raw_user_meta_data ->> 'avatar_url')
      else null
    end
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  perform private.provision_default_categories(new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

insert into public.profiles (id, full_name, avatar_url)
select
  auth_user.id,
  nullif(left(btrim(auth_user.raw_user_meta_data ->> 'full_name'), 120), ''),
  case
    when char_length(btrim(auth_user.raw_user_meta_data ->> 'avatar_url')) between 1 and 2048
      then btrim(auth_user.raw_user_meta_data ->> 'avatar_url')
    else null
  end
from auth.users as auth_user
on conflict (id) do nothing;

insert into public.user_settings (user_id)
select id from auth.users
on conflict (user_id) do nothing;

do $$
declare
  existing_user record;
begin
  for existing_user in select id from auth.users loop
    perform private.provision_default_categories(existing_user.id);
  end loop;
end;
$$;

create view public.transactions_with_effective_status
with (security_invoker = true)
as
select
  txn.*,
  case
    when txn.status = 'pending'
      and txn.due_date < (
        current_timestamp at time zone coalesce(settings.timezone, 'America/Fortaleza')
      )::date then 'overdue'
    else txn.status::text
  end as effective_status
from public.transactions as txn
left join public.user_settings as settings
  on settings.user_id = txn.user_id;

create view public.account_balances
with (security_invoker = true)
as
select
  account.id,
  account.user_id,
  account.name,
  account.type,
  account.initial_balance,
  account.institution,
  account.color,
  account.icon,
  account.archived_at,
  account.status,
  account.created_at,
  account.updated_at,
  (
    account.initial_balance
    + coalesce(
      sum(
        case
          when txn.status <> 'paid' then 0
          when txn.type in ('income', 'transfer_in') then txn.amount
          when txn.type in ('expense', 'transfer_out') then -txn.amount
          else 0
        end
      ),
      0
    )
  )::numeric(14, 2) as current_balance
from public.accounts as account
left join public.transactions as txn
  on txn.account_id = account.id
  and txn.user_id = account.user_id
group by account.id;

create view public.budget_progress
with (security_invoker = true)
as
with budget_usage as (
  select
    budget.id,
    budget.user_id,
    budget.category_id,
    budget.period_month,
    budget.limit_amount,
    budget.created_at,
    budget.updated_at,
    coalesce(sum(txn.amount), 0)::numeric(14, 2) as used_amount
  from public.budgets as budget
  left join public.transactions as txn
    on txn.user_id = budget.user_id
    and txn.type = 'expense'
    and txn.status = 'paid'
    and txn.transaction_date >= budget.period_month
    and txn.transaction_date < (budget.period_month + interval '1 month')
    and (budget.category_id is null or txn.category_id = budget.category_id)
  group by budget.id
)
select
  budget_usage.*,
  round((used_amount / limit_amount) * 100, 2) as percentage_used,
  case
    when used_amount >= limit_amount then 'exceeded'
    when used_amount >= limit_amount * 0.90 then 'near_limit'
    when used_amount >= limit_amount * 0.75 then 'attention'
    else 'healthy'
  end as status,
  case
    when used_amount >= limit_amount then 100
    when used_amount >= limit_amount * 0.90 then 90
    when used_amount >= limit_amount * 0.75 then 75
    when used_amount >= limit_amount * 0.50 then 50
    else 0
  end as alert_threshold
from budget_usage;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "user_settings_select_own"
on public.user_settings for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "user_settings_update_own"
on public.user_settings for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "accounts_select_own"
on public.accounts for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "accounts_insert_own"
on public.accounts for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "accounts_update_own"
on public.accounts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "accounts_delete_own"
on public.accounts for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "categories_select_own"
on public.categories for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "categories_insert_own"
on public.categories for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "categories_update_own"
on public.categories for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "recurring_transactions_select_own"
on public.recurring_transactions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "recurring_transactions_insert_own"
on public.recurring_transactions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "recurring_transactions_update_own"
on public.recurring_transactions for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "recurring_transactions_delete_own"
on public.recurring_transactions for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "transfers_select_own"
on public.transfers for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "transactions_select_own"
on public.transactions for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "transactions_insert_own_non_transfer"
on public.transactions for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and type in ('income', 'expense')
  and transfer_id is null
);

create policy "transactions_update_own_non_transfer"
on public.transactions for update
to authenticated
using (
  (select auth.uid()) = user_id
  and type in ('income', 'expense')
  and transfer_id is null
)
with check (
  (select auth.uid()) = user_id
  and type in ('income', 'expense')
  and transfer_id is null
);

create policy "transactions_delete_own_non_transfer"
on public.transactions for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and type in ('income', 'expense')
  and transfer_id is null
);

create policy "budgets_select_own"
on public.budgets for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "budgets_insert_own"
on public.budgets for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "budgets_update_own"
on public.budgets for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "budgets_delete_own"
on public.budgets for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "financial_goals_select_own"
on public.financial_goals for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "financial_goals_insert_own"
on public.financial_goals for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "financial_goals_update_own"
on public.financial_goals for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "financial_goals_delete_own"
on public.financial_goals for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table
  public.profiles,
  public.user_settings,
  public.accounts,
  public.categories,
  public.recurring_transactions,
  public.transfers,
  public.transactions,
  public.budgets,
  public.financial_goals,
  public.transactions_with_effective_status,
  public.account_balances,
  public.budget_progress
from public, anon, authenticated;

grant select, update on table public.profiles, public.user_settings
to authenticated;

grant select, insert, update, delete on table
  public.accounts,
  public.recurring_transactions,
  public.transactions,
  public.budgets,
  public.financial_goals
to authenticated;

grant select, insert, update on table public.categories
to authenticated;

grant select on table public.transfers
to authenticated;

grant select on table
  public.transactions_with_effective_status,
  public.account_balances,
  public.budget_progress
to authenticated;

grant all on table
  public.profiles,
  public.user_settings,
  public.accounts,
  public.categories,
  public.recurring_transactions,
  public.transfers,
  public.transactions,
  public.budgets,
  public.financial_goals
to service_role;

grant select on table
  public.transactions_with_effective_status,
  public.account_balances,
  public.budget_progress
to service_role;

revoke all on all functions in schema private from public, anon, authenticated;

revoke all on function public.create_transfer(
  uuid,
  uuid,
  text,
  numeric,
  date,
  date,
  public.transaction_status,
  date,
  text
) from public, anon;

revoke all on function public.update_transfer(
  uuid,
  uuid,
  uuid,
  text,
  numeric,
  date,
  date,
  public.transaction_status,
  date,
  text
) from public, anon;

revoke all on function public.delete_transfer(uuid) from public, anon;

grant execute on function public.create_transfer(
  uuid,
  uuid,
  text,
  numeric,
  date,
  date,
  public.transaction_status,
  date,
  text
) to authenticated;

grant execute on function public.update_transfer(
  uuid,
  uuid,
  uuid,
  text,
  numeric,
  date,
  date,
  public.transaction_status,
  date,
  text
) to authenticated;

grant execute on function public.delete_transfer(uuid) to authenticated;

comment on table public.transactions is
  'Income, expense and the two internal legs of each transfer. Monetary values are positive; type determines direction.';

comment on column public.transactions.category_kind is
  'Generated category type used by the composite FK to prevent category/type and cross-user mismatches.';

comment on column public.transactions.is_recurring is
  'Generated from recurring_transaction_id to avoid contradictory recurrence flags.';

comment on table public.transfers is
  'Canonical transfer aggregate. Mutations are only available through atomic RPC functions.';

comment on view public.transactions_with_effective_status is
  'Derives overdue from pending transactions whose due date has passed, avoiding stale persisted status.';

comment on view public.account_balances is
  'Calculates current account balances from initial balance and paid transaction movements.';

comment on view public.budget_progress is
  'Calculates paid expense usage, percentage, health status and the latest reached alert threshold.';

comment on function public.create_transfer is
  'Atomically creates the canonical transfer and its outbound/inbound transaction legs for the authenticated user.';

comment on function public.update_transfer is
  'Atomically updates a transfer and synchronizes both transaction legs for the authenticated user.';

comment on function public.delete_transfer is
  'Deletes a transfer and cascades only to its two transaction legs for the authenticated user.';

commit;
