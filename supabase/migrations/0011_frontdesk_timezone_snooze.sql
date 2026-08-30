-- Phase 2 (master spec §30): correct overdue arithmetic and snooze.
--
-- freelancers.timezone (DEC-4, option a): "overdue by 1 day" must flip at
-- the freelancer's midnight, not UTC's. Nullable; the app falls back to
-- Europe/Amsterdam (the product's market) until a value is set.
--
-- inquiries.snoozed_until: snooze is a scheduling action (§7.7 safe-to-batch
-- set). Overdue itself stays derived at read time and is never stored (D22).
--
-- Additive and reversible: two new nullable columns, nothing touched.

alter table public.freelancers
  add column timezone text check (timezone is null or char_length(timezone) <= 64);

alter table public.inquiries
  add column snoozed_until timestamptz;
