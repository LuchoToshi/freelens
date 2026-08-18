-- FrontDesk Track B, Epic 1 (Connect). Additive only: no changes to any
-- table from 0001-0005.
--
-- One connection per freelancer (single inbox, per the Phase 1 smoke test's
-- "connect one inbox" scope). Columns are the durable shape FS specced in
-- #general 2026-08-18: user reference, encrypted token material, granted
-- scopes, connected_at, revoked_at, last_used_at. Deliberately excludes any
-- retention/purge behavior (grace-period expiry, idle-connection cleanup) -
-- that is Epic 11, gated on the retention table Ops is writing and QRA is
-- signing off. This table's shape does not change once that lands; only a
-- future scheduled job reading revoked_at/last_used_at does.
--
-- encrypted_refresh_token holds ciphertext only (AES-256-GCM, application
-- layer - see lib/gmail/server/tokens.ts), never the raw token. The refresh
-- token is the standing artifact of an offline-access OAuth grant; nothing
-- else in this table is sensitive enough to need it.
--
-- RLS is enabled with no policies, unlike 0005's tables. Those are schema
-- staged ahead of Epic 1's RLS work per that migration's own header; this
-- table holds live credential material as of this migration; every
-- read/write goes through the service-role client in the connect/callback
-- routes and the freelancer's own signed OAuth state, never through a
-- client-side anon session, so default-deny costs nothing and closes the
-- gap if that ever changes by accident.

create table public.agent_gmail_connections (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null unique references public.freelancers (id) on delete cascade,
  encrypted_refresh_token text not null,
  granted_scopes text[] not null,
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);

alter table public.agent_gmail_connections enable row level security;

create index agent_gmail_connections_freelancer_idx on public.agent_gmail_connections (freelancer_id);
