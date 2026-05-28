-- ============================================================================
-- Patch 01 — fixes for: B1 (booking overlap), H1 (profiles privacy)
-- Run in SQL Editor after schema.sql
-- ============================================================================

-- B1: Proper overlap prevention.
-- tstzrange is technically STABLE (not IMMUTABLE) per Postgres because it
-- depends on session TZ at parse time. Wrap in an IMMUTABLE SQL function so
-- it can be used in a generated column and exclusion constraint.

create extension if not exists btree_gist;

create or replace function booking_range(start_ts timestamptz, mins int)
returns tstzrange
language sql
immutable
parallel safe
as $$
  select tstzrange(start_ts, start_ts + make_interval(mins => mins), '[)')
$$;

drop index if exists bookings_no_overlap;

alter table bookings drop constraint if exists bookings_no_overlap_excl;
alter table bookings drop column if exists time_range;

alter table bookings
  add column time_range tstzrange
  generated always as (booking_range(starts_at, duration_min)) stored;

alter table bookings
  add constraint bookings_no_overlap_excl
  exclude using gist (
    provider_id with =,
    time_range with &&
  )
  where (status in ('pending', 'confirmed'));

create index if not exists bookings_time_range_idx on bookings using gist (time_range);

-- H1: tighten profiles privacy
drop policy if exists "profiles_select_all" on profiles;
drop policy if exists "profiles_select_own" on profiles;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create or replace view public_profiles
  with (security_invoker = false) as
  select id, name, avatar_url, role, created_at
  from profiles;

grant select on public_profiles to anon, authenticated;
