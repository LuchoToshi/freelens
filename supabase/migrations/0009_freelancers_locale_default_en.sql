-- Default freelancers.locale to English, not Dutch.
--
-- Additive and value-preserving: changes only the DEFAULT applied to future
-- inserts that omit the column. No existing row is touched, no backfill, no
-- data rewritten. FrontDesk is a global product; every actual write path now
-- sets locale explicitly (setup-wizard defaults to browser-detected language
-- for a first-time signup, "en" for the SSR-safe first render), so this is
-- defense in depth for any insert path that does not, not a behavior change
-- for the app itself.

alter table public.freelancers
  alter column locale set default 'en';
