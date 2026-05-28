-- ============================================================================
-- Patch 02 — Enable realtime on bookings + reviews
-- ============================================================================
-- Supabase uses Postgres logical replication for realtime. Tables need to be
-- in the `supabase_realtime` publication to emit change events to clients.

alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table reviews;

-- (No-op if already added — Postgres will error on duplicate; safe to ignore.)
