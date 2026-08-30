-- Phase 4 (master spec §8.5, §13): per-action automation levels and the
-- required dismiss reason on the live drafts table. Additive only.
--
-- permission_levels: { "<action>": 1..5 } — the app clamps every read to the
-- action's hard ceiling (lib/frontdesk/permissions.ts), so an out-of-range
-- stored value can never take effect.
alter table public.freelancers
  add column permission_levels jsonb not null default '{}'::jsonb;

-- Same vocabulary migration 0005 established for agent_approvals (§6.11).
alter table public.drafts
  add column dismiss_reason text
    check (dismiss_reason is null or dismiss_reason in ('wrong_client', 'wrong_timing', 'wrong_read', 'not_interested'));
