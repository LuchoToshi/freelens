-- Phase 5 (master spec §11.3, §11.4): user-defined follow-up cadence and the
-- global pause stop condition. Additive only.
alter table public.freelancers
  add column followup_quiet_days integer
    check (followup_quiet_days is null or (followup_quiet_days >= 1 and followup_quiet_days <= 14)),
  add column followups_paused boolean not null default false;
