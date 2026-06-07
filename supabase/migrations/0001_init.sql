-- ============================================================================
--  SparePro — initial schema, RLS, functions, storage, realtime
--  Idempotent: safe to run multiple times in the Supabase SQL editor.
--
--  Model: global SKU + machine usage (M:N).
--   - A part name is one catalog row (parts.name is unique) with ONE global
--     quantity and reorder level shared across every machine that uses it.
--   - part_usages records which sub-machines a part is used in.
--   - Issuing a part decrements the global quantity atomically (issue_part RPC).
-- ============================================================================

-- ---------- Extensions ------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------- Tables ----------------------------------------------------------

-- Profiles: one row per auth user, holds display name + role.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  role        text not null default 'technician'
                 check (role in ('admin', 'manager', 'technician')),
  created_at  timestamptz not null default now()
);

create table if not exists public.machines (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.sub_machines (
  id          uuid primary key default gen_random_uuid(),
  machine_id  uuid not null references public.machines (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (machine_id, name)
);

create table if not exists public.parts (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,          -- the SKU
  unit            text not null default 'Nos',
  quantity        integer not null default 0 check (quantity >= 0),
  reorder_level   integer not null default 0 check (reorder_level >= 0),
  image_url       text,
  last_issue_date date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- M:N "where used": which sub-machines a part belongs to.
create table if not exists public.part_usages (
  id             uuid primary key default gen_random_uuid(),
  part_id        uuid not null references public.parts (id) on delete cascade,
  sub_machine_id uuid not null references public.sub_machines (id) on delete cascade,
  created_at     timestamptz not null default now(),
  unique (part_id, sub_machine_id)
);

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  part_id     uuid references public.parts (id) on delete set null,
  part_name   text not null,                     -- snapshot for history
  machine     text not null,
  sub_machine text not null,
  given_to    text not null,
  quantity    integer not null check (quantity > 0),
  issue_date  date not null default current_date,
  issue_mode  text not null default 'machine',
  invoice_url text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_transactions_created_at on public.transactions (created_at desc);
create index if not exists idx_sub_machines_machine on public.sub_machines (machine_id);
create index if not exists idx_part_usages_part on public.part_usages (part_id);

-- ---------- Helper: caller's role ------------------------------------------
-- Named app_role() (NOT current_role, which is a reserved Postgres function).
-- SECURITY DEFINER so it can read profiles without tripping RLS recursion.
create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

grant execute on function public.app_role() to authenticated;

-- ---------- Trigger: create profile on signup ------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'technician'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Trigger: maintain parts.updated_at -----------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_parts_updated_at on public.parts;
create trigger trg_parts_updated_at
  before update on public.parts
  for each row execute function public.set_updated_at();

-- ---------- RPC: atomic issue ----------------------------------------------
-- Decrements global stock, stamps last_issue_date, records the transaction.
-- SECURITY DEFINER so technicians (who cannot UPDATE parts directly) can issue,
-- while the stock check stays race-free via row lock.
create or replace function public.issue_part(
  p_part_id     uuid,
  p_machine     text,
  p_sub_machine text,
  p_given_to    text,
  p_quantity    integer,
  p_issue_date  date,
  p_issue_mode  text default 'machine',
  p_invoice_url text default null
)
returns public.transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_part public.parts;
  v_tx   public.transactions;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  select * into v_part from public.parts where id = p_part_id for update;
  if not found then
    raise exception 'Spare part not found';
  end if;
  if v_part.quantity < p_quantity then
    raise exception 'Insufficient stock: % available, % requested',
      v_part.quantity, p_quantity;
  end if;

  update public.parts
     set quantity = quantity - p_quantity,
         last_issue_date = p_issue_date
   where id = p_part_id;

  insert into public.transactions (
    part_id, part_name, machine, sub_machine, given_to,
    quantity, issue_date, issue_mode, invoice_url, created_by
  )
  values (
    p_part_id, v_part.name, p_machine, p_sub_machine, p_given_to,
    p_quantity, coalesce(p_issue_date, current_date), p_issue_mode, p_invoice_url, auth.uid()
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

grant execute on function public.issue_part(
  uuid, text, text, text, integer, date, text, text
) to authenticated;

-- ---------- Enable RLS ------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.machines     enable row level security;
alter table public.sub_machines enable row level security;
alter table public.parts        enable row level security;
alter table public.part_usages  enable row level security;
alter table public.transactions enable row level security;

-- ---------- Policies: profiles ---------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.app_role());  -- can't self-promote

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.app_role() = 'admin')
  with check (public.app_role() = 'admin');

-- ---------- Policies: catalog tables (read-all, write = admin|manager) -----
do $$
declare t text;
begin
  foreach t in array array['machines', 'sub_machines', 'parts', 'part_usages']
  loop
    execute format('drop policy if exists %I_select on public.%I;', t, t);
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (true);',
      t, t);

    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format(
      'create policy %I_write on public.%I for all to authenticated '
      || 'using (public.app_role() in (''admin'',''manager'')) '
      || 'with check (public.app_role() in (''admin'',''manager''));',
      t, t);
  end loop;
end $$;

-- ---------- Policies: transactions -----------------------------------------
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions
  for select to authenticated using (true);

drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions
  for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists transactions_delete on public.transactions;
create policy transactions_delete on public.transactions
  for delete to authenticated
  using (public.app_role() in ('admin', 'manager'));

-- ---------- Storage buckets -------------------------------------------------
insert into storage.buckets (id, name, public)
values ('part-images', 'part-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- part-images: anyone can read; admin|manager can write/delete.
drop policy if exists part_images_read on storage.objects;
create policy part_images_read on storage.objects
  for select to public using (bucket_id = 'part-images');

drop policy if exists part_images_write on storage.objects;
create policy part_images_write on storage.objects
  for all to authenticated
  using (bucket_id = 'part-images' and public.app_role() in ('admin','manager'))
  with check (bucket_id = 'part-images' and public.app_role() in ('admin','manager'));

-- invoices: any authenticated user can read/write (issuing attaches invoices).
drop policy if exists invoices_read on storage.objects;
create policy invoices_read on storage.objects
  for select to authenticated using (bucket_id = 'invoices');

drop policy if exists invoices_write on storage.objects;
create policy invoices_write on storage.objects
  for all to authenticated
  using (bucket_id = 'invoices')
  with check (bucket_id = 'invoices');

-- ---------- Realtime --------------------------------------------------------
-- Add parts + transactions to the realtime publication (ignore if present).
do $$
begin
  begin
    alter publication supabase_realtime add table public.parts;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.transactions;
  exception when duplicate_object then null;
  end;
end $$;

-- ============================================================================
--  Done. To create your first admin, register in the app, then run:
--    update public.profiles set role = 'admin' where id = (
--      select id from auth.users where email = 'you@company.com'
--    );
-- ============================================================================
