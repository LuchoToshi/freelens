-- Page Appearance (handoff §11): three choices, stored as one object.
--
-- A jsonb column rather than four columns: the set is closed and read as a
-- whole by exactly one module (lib/frontdesk/appearance.ts), which validates
-- every value on the way in and on the way out. Nothing else reads it, so
-- there is nothing to query by.
--
-- No default: a null column means "the page as it has always looked", and the
-- reader resolves that to the defaults. Existing pages therefore change in no
-- way at all until their owner chooses something.

alter table public.freelancers
  add column if not exists appearance jsonb;

comment on column public.freelancers.appearance is
  'Page appearance: {tone, accent, theme, cover_url}. Values are whitelisted in lib/frontdesk/appearance.ts; null means product defaults.';
