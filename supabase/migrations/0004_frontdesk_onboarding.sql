-- FrontDesk onboarding: one column, one widened CHECK. Additive only.
--
-- link_in_bio_confirmed_at: the freelancer's manual "my link is live" tick.
-- The checklist also auto-completes this from any inquiry with a src_channel
-- (a tagged link demonstrably works) — derived in the query, not backfilled.
--
-- source gains 'sample': the seeded practice inquiry. Sample rows are
-- excluded from the nudge cron and from every admin number.

alter table public.freelancers
  add column link_in_bio_confirmed_at timestamptz;

alter table public.inquiries
  drop constraint inquiries_source_check;

alter table public.inquiries
  add constraint inquiries_source_check
  check (source in ('form', 'email', 'sample'));
