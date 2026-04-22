-- ============================================================
-- Personal Finance Manager — Supabase Schema
-- Currency amounts stored as INTEGER (centavos) to avoid
-- floating-point errors. Divide by 100 for display.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  type        text not null check (type in ('income', 'expense')),
  icon        text not null default 'circle',      -- Lucide icon name
  color       text not null default '#6366f1',     -- hex color
  created_at  timestamptz not null default now(),

  unique(user_id, name, type)
);

-- RLS
alter table categories enable row level security;

create policy "Users can manage their own categories"
  on categories for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
create table if not exists transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete restrict,
  type         text not null check (type in ('income', 'expense')),
  amount       bigint not null check (amount > 0),  -- centavos (integer)
  description  text not null default '',
  date         date not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_transactions_user_date
  on transactions(user_id, date desc);

create index if not exists idx_transactions_category
  on transactions(category_id);

-- RLS
alter table transactions enable row level security;

create policy "Users can manage their own transactions"
  on transactions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- Monthly aggregates per user
create or replace view monthly_stats as
select
  user_id,
  to_char(date, 'YYYY-MM')                          as month,
  sum(case when type = 'income'  then amount else 0 end) as income_centavos,
  sum(case when type = 'expense' then amount else 0 end) as expense_centavos,
  sum(case when type = 'income'  then amount else -amount end) as balance_centavos
from transactions
group by user_id, to_char(date, 'YYYY-MM');

-- Category spend breakdown per month
create or replace view category_monthly_stats as
select
  t.user_id,
  to_char(t.date, 'YYYY-MM')  as month,
  c.id                         as category_id,
  c.name                       as category_name,
  c.color,
  c.type,
  sum(t.amount)                as total_centavos
from transactions t
join categories c on c.id = t.category_id
group by t.user_id, to_char(t.date, 'YYYY-MM'), c.id, c.name, c.color, c.type;

-- ============================================================
-- SEED: default categories (inserted on first sign-up via trigger)
-- ============================================================
create or replace function create_default_categories()
returns trigger language plpgsql security definer as $$
begin
  insert into categories (user_id, name, type, icon, color) values
    -- Income
    (new.id, 'Royalties',      'income',  'music',          '#10b981'),
    (new.id, 'Proyecto',       'income',  'briefcase',      '#3b82f6'),
    (new.id, 'Freelance',      'income',  'laptop',         '#8b5cf6'),
    (new.id, 'Inversiones',    'income',  'trending-up',    '#f59e0b'),
    (new.id, 'Otros ingresos', 'income',  'plus-circle',    '#6366f1'),
    -- Expenses
    (new.id, 'Vivienda',       'expense', 'home',           '#ef4444'),
    (new.id, 'Alimentación',   'expense', 'utensils',       '#f97316'),
    (new.id, 'Transporte',     'expense', 'car',            '#eab308'),
    (new.id, 'Salud',          'expense', 'heart-pulse',    '#ec4899'),
    (new.id, 'Tecnología',     'expense', 'cpu',            '#06b6d4'),
    (new.id, 'Entretenimiento','expense', 'tv',             '#a855f7'),
    (new.id, 'Educación',      'expense', 'book-open',      '#0ea5e9'),
    (new.id, 'Otros gastos',   'expense', 'minus-circle',   '#64748b');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_default_categories();

-- ============================================================
-- BUDGETS
-- Monthly spending limits per category.
-- amount stored as BIGINT centavos (same convention as transactions).
-- ============================================================
create table if not exists budgets (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category_id  uuid not null references categories(id) on delete cascade,
  amount       bigint not null check (amount > 0),  -- centavos
  month        text,  -- YYYY-MM; NULL = recurring default for every month

  unique(user_id, category_id, month),
  created_at   timestamptz not null default now()
);

create index if not exists idx_budgets_user_month
  on budgets(user_id, month);

alter table budgets enable row level security;

create policy "Users can manage their own budgets"
  on budgets for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- VIEW: budget vs actual spending per category per month
-- ============================================================
create or replace view budget_vs_actual as
select
  b.user_id,
  coalesce(b.month, to_char(now(), 'YYYY-MM'))  as month,
  c.id                                           as category_id,
  c.name                                         as category_name,
  c.icon,
  c.color,
  b.amount                                       as budget_centavos,
  coalesce(sum(t.amount), 0)                     as spent_centavos,
  b.amount - coalesce(sum(t.amount), 0)          as remaining_centavos,
  round(
    coalesce(sum(t.amount), 0)::numeric / b.amount * 100, 1
  )                                              as percentage_used
from budgets b
join categories c on c.id = b.category_id
left join transactions t
  on  t.category_id = b.category_id
  and t.user_id     = b.user_id
  and t.type        = 'expense'
  and to_char(t.date, 'YYYY-MM') = coalesce(b.month, to_char(now(), 'YYYY-MM'))
group by b.user_id, b.month, c.id, c.name, c.icon, c.color, b.amount;
