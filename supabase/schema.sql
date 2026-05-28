-- ============================================================================
-- Termino — Supabase schema
-- ============================================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================================

-- ── Enums ────────────────────────────────────────────────────────────────────
create type user_role as enum ('client', 'provider', 'admin');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type service_category as enum ('hair', 'beauty', 'nails', 'massage', 'fitness', 'barber', 'spa', 'dental');

-- ── Profiles (extends auth.users) ────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  avatar_url text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

-- ── Providers (business profile, linked to a user) ──────────────────────────
create table providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category service_category not null,
  description text,
  address text not null,
  city text not null,
  lat numeric,
  lng numeric,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  verified boolean not null default false,
  working_hours jsonb not null default '{}'::jsonb,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  created_at timestamptz not null default now()
);
create index on providers (category);
create index on providers (city);

-- ── Services offered by a provider ──────────────────────────────────────────
create table services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  name text not null,
  description text,
  duration_min int not null check (duration_min > 0),
  price numeric(10,2) not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on services (provider_id);

-- ── Addons (optional extras for a service) ──────────────────────────────────
create table addons (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null check (price >= 0)
);
create index on addons (service_id);

-- ── Bookings ────────────────────────────────────────────────────────────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  starts_at timestamptz not null,
  duration_min int not null,
  total_price numeric(10,2) not null,
  status booking_status not null default 'pending',
  addon_ids uuid[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);
create index on bookings (client_id);
create index on bookings (provider_id);
create index on bookings (starts_at);
-- Prevent double-booking of the same service at the exact same start
create unique index bookings_no_overlap on bookings (provider_id, starts_at)
  where status in ('pending', 'confirmed');

-- ── Reviews ─────────────────────────────────────────────────────────────────
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index on reviews (provider_id);

-- ── Trigger: auto-create profile when auth user is created ──────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'client')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Trigger: recompute provider rating after a review ──────────────────────
create or replace function recompute_provider_rating()
returns trigger language plpgsql as $$
begin
  update providers
    set rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where provider_id = new.provider_id), 0),
        review_count = (select count(*) from reviews where provider_id = new.provider_id)
    where id = new.provider_id;
  return new;
end;
$$;
create trigger reviews_rating_sync
  after insert or update or delete on reviews
  for each row execute function recompute_provider_rating();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles  enable row level security;
alter table providers enable row level security;
alter table services  enable row level security;
alter table addons    enable row level security;
alter table bookings  enable row level security;
alter table reviews   enable row level security;

-- profiles: user sees/edits only own profile; everyone can read basic info
create policy "profiles_select_all"   on profiles for select using (true);
create policy "profiles_update_own"   on profiles for update using (auth.uid() = id);

-- providers: public read; owner full control
create policy "providers_select_all"  on providers for select using (true);
create policy "providers_insert_own"  on providers for insert with check (auth.uid() = owner_id);
create policy "providers_update_own"  on providers for update using (auth.uid() = owner_id);
create policy "providers_delete_own"  on providers for delete using (auth.uid() = owner_id);

-- services / addons: public read; only provider owner can modify
create policy "services_select_all"   on services for select using (true);
create policy "services_modify_owner" on services for all
  using (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid()));

create policy "addons_select_all"     on addons for select using (true);
create policy "addons_modify_owner"   on addons for all
  using (exists (
    select 1 from services s
    join providers p on p.id = s.provider_id
    where s.id = service_id and p.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from services s
    join providers p on p.id = s.provider_id
    where s.id = service_id and p.owner_id = auth.uid()
  ));

-- bookings: client sees own; provider owner sees bookings for their business
create policy "bookings_select_visible" on bookings for select using (
  auth.uid() = client_id
  or exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid())
);
create policy "bookings_insert_self"  on bookings for insert with check (auth.uid() = client_id);
create policy "bookings_update_party" on bookings for update using (
  auth.uid() = client_id
  or exists (select 1 from providers p where p.id = provider_id and p.owner_id = auth.uid())
);

-- reviews: public read; only the booking's client may write, and only once
create policy "reviews_select_all"    on reviews for select using (true);
create policy "reviews_insert_owner"  on reviews for insert with check (
  auth.uid() = client_id
  and exists (
    select 1 from bookings b
    where b.id = booking_id and b.client_id = auth.uid() and b.status = 'completed'
  )
);
create policy "reviews_update_owner"  on reviews for update using (auth.uid() = client_id);
create policy "reviews_delete_owner"  on reviews for delete using (auth.uid() = client_id);
