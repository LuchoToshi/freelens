-- Full reversal of migrations 0010–0014 (master spec Phase 8: rollback
-- rehearsed, not just written — see docs/master-spec/ROLLBACK.md for the
-- rehearsal record and when to actually use this).
--
-- IMPORTANT: the normal rollback is CODE-ONLY. Every migration in this
-- branch is additive, so old code runs unchanged against the migrated
-- database — proven live: production main has been serving against
-- 0010–0014 since they were applied. Run this file only if the schema
-- itself must be reversed, and accept that it DELETES the listed columns'
-- data (validation history, snoozes, permissions, learned-voice decisions,
-- follow-up settings, dismiss reasons).

begin;

-- 0014
alter table public.freelancers
  drop column if exists followup_quiet_days,
  drop column if exists followups_paused;

-- 0013
alter table public.freelancers
  drop column if exists permission_levels;
alter table public.drafts
  drop column if exists dismiss_reason;

-- 0012
alter table public.packages
  drop column if exists addons;
alter table public.freelancers
  drop column if exists voice_learning_paused,
  drop column if exists voice_proposal_decisions;

-- 0011
alter table public.freelancers
  drop column if exists timezone;
alter table public.inquiries
  drop column if exists snoozed_until;

-- 0010
alter table public.drafts
  drop column if exists validation_status,
  drop column if exists validation_failures,
  drop column if exists validated_at;

-- Migration history: forget 0010–0014 so a future `db push` can re-apply.
delete from supabase_migrations.schema_migrations
  where version in ('0010', '0011', '0012', '0013', '0014');

commit;
