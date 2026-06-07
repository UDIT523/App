-- ============================================================================
--  SparePro — 0002: drop Supabase Auth, switch to a plain users table.
--  Idempotent: safe to re-run.
--
--  WARNING: This OPENS Row-Level Security to the public `anon` key on every
--  table (read + write), because the app no longer has authenticated sessions.
--  Passwords in public.users are stored as plain text and are readable by
--  anyone with the anon key. Use only for a trusted/internal deployment.
-- ============================================================================

-- ---------- Users table (replaces auth + profiles) -------------------------
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  username   text not null unique,
  full_name  text not null default '',
  password   text not null,
  role       text not null default 'admin'
               check (role in ('admin', 'manager', 'technician')),
  created_at timestamptz not null default now()
);

-- ---------- Record who issued a part (no auth uid anymore) ------------------
alter table public.transactions add column if not exists issued_by text;

-- ---------- Re-create issue_part without auth, with issued_by --------------
drop function if exists public.issue_part(uuid, text, text, text, integer, date, text, text);

create or replace function public.issue_part(
  p_part_id     uuid,
  p_machine     text,
  p_sub_machine text,
  p_given_to    text,
  p_quantity    integer,
  p_issue_date  date,
  p_issue_mode  text default 'machine',
  p_invoice_url text default null,
  p_issued_by   text default null
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
    quantity, issue_date, issue_mode, invoice_url, issued_by
  )
  values (
    p_part_id, v_part.name, p_machine, p_sub_machine, p_given_to,
    p_quantity, coalesce(p_issue_date, current_date), p_issue_mode,
    p_invoice_url, p_issued_by
  )
  returning * into v_tx;

  return v_tx;
end;
$$;

grant execute on function public.issue_part(
  uuid, text, text, text, integer, date, text, text, text
) to anon, authenticated;

-- ---------- Open RLS on every table to the anon key ------------------------
-- 1) Drop all existing policies on our tables.
do $$
declare r record;
begin
  for r in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles', 'users', 'machines', 'sub_machines',
        'parts', 'part_usages', 'transactions'
      )
  loop
    execute format('drop policy if exists %I on public.%I;', r.policyname, r.tablename);
  end loop;
end $$;

-- 2) One permissive policy per table for anon + authenticated.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'users', 'machines', 'sub_machines',
    'parts', 'part_usages', 'transactions'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated '
      || 'using (true) with check (true);',
      t || '_public', t
    );
  end loop;
end $$;

-- ---------- Open storage policies to anon ----------------------------------
drop policy if exists part_images_read on storage.objects;
drop policy if exists part_images_write on storage.objects;
drop policy if exists invoices_read on storage.objects;
drop policy if exists invoices_write on storage.objects;
drop policy if exists part_images_all on storage.objects;
drop policy if exists invoices_all on storage.objects;

create policy part_images_all on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'part-images')
  with check (bucket_id = 'part-images');

create policy invoices_all on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'invoices')
  with check (bucket_id = 'invoices');

-- ============================================================================
--  Done. Create your first user from the app's "Create account" screen,
--  or insert one directly:
--    insert into public.users (username, full_name, password, role)
--    values ('admin', 'Administrator', 'admin123', 'admin');
-- ============================================================================
