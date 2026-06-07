# SparePro — Spare Parts & Inventory Management

A production-grade, monochrome SaaS for managing factory spare parts: real-time
stock tracking across machines, fast part issuing, transaction history, role-based
access, and image/invoice storage — powered by **React (Vite) + Tailwind CSS v4 +
Supabase**.

## Tech stack

- **Frontend:** React 19, Vite 6, Tailwind CSS v4 (single global stylesheet), React Router 7
- **Server state:** TanStack Query + Supabase Realtime
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (Postgres, Auth, Storage, Row-Level Security, Realtime)
- **Charts/icons/motion:** Recharts, lucide-react, Framer Motion

## Project structure

```
src/
  lib/supabase.js          Supabase client (reads VITE_ env vars)
  services/                Thin async wrappers over Supabase (no UI)
  hooks/                   TanStack Query hooks + realtime subscriptions
  context/AuthContext.jsx  Session, profile, role, can(action) gating
  components/ui/           Reusable primitives (Button, Modal, Table, Combobox…)
  components/layout/       AppShell, Sidebar, Topbar, PageHeader
  pages/                   Login, Register, Dashboard, Inventory, IssuePart, …
  utils/                   excel, csv, formatting, zod schemas
  index.css                The ONLY css file (Tailwind import + design tokens)
supabase/migrations/0001_init.sql   Full schema, RLS, RPC, storage, realtime
```

## Authentication

This build uses a **simple username + password** stored in a `public.users`
table — **no Supabase Auth, no email**. Row-Level Security is open to the public
`anon` key so the app works without a logged-in token.

> ⚠️ Security note: this is for trusted/internal use only. Passwords are stored
> as plain text and the data is readable/writable by anyone with the anon key.

Roles (`admin` / `manager` / `technician`) are stored on each user as **labels
only** — access is **not** enforced; every signed-in user can do everything.

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, and grab the
**Project URL** and **anon public key** from *Project Settings → API*.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 3. Run the database migrations

In the Supabase **SQL Editor**, run both files in order (both idempotent):

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — tables, `issue_part` RPC, storage buckets, realtime.
2. [`supabase/migrations/0002_users_no_auth.sql`](supabase/migrations/0002_users_no_auth.sql) — adds the `users` table, opens RLS to the anon key, and removes the auth requirement.

### 4. Install & run

```bash
npm install
npm run dev        # http://localhost:3000
```

### 5. Create a user

Open the app and use **Create account** (username + password), or insert one
directly in the SQL editor:

```sql
insert into public.users (username, full_name, password, role)
values ('admin', 'Administrator', 'admin123', 'admin');
```

Then sign in with those credentials.

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the Vite dev server         |
| `npm run build`   | Production build to `dist/`       |
| `npm run preview` | Preview the production build      |

## Manual verification checklist

After steps 1–5 above:

- [ ] Create account (username + password) → land in the app.
- [ ] Add a spare part with an image upload (Inventory).
- [ ] Issue a part → stock decrements, a transaction is logged (with `issued_by`), low-stock toast fires at/under reorder level.
- [ ] Open a second browser tab → stock change appears live (realtime).
- [ ] Import/export inventory via Excel; copy/paste CSV.
- [ ] Manage users and roles on the Users page.
