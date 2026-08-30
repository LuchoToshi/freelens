-- Draft validation verdicts, stored (master spec Phase 1, §10.5/§24.3).
--
-- A draft can never appear ready when it is not: every write path persists
-- the deterministic guard verdict alongside the body, and the inbox renders
-- the stored status instead of assuming presence means readiness.
--
-- Additive and reversible: three new columns, no existing column touched.
-- Backfill: every historical row becomes 'needs_review', never
-- 'ready_for_review' -- uncertain history must not be converted into false
-- certainty (§24.4). Down path: drop the three columns.

alter table public.drafts
  add column validation_status text not null default 'pending'
    check (validation_status in ('pending', 'ready_for_review', 'needs_review', 'failed')),
  add column validation_failures text[] not null default '{}',
  add column validated_at timestamptz;

update public.drafts set validation_status = 'needs_review';
