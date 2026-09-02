-- Invite accountability and test-account labelling (owner decision, 2 Sep 2026).
--
-- Three facts the product could not answer before:
--   who issued an invite,
--   which accounts are ours rather than a real freelancer's,
--   when an account was last actually used.
--
-- All additive. `issued_by` is nullable because invites issued before today
-- have no recorded issuer and inventing one would be worse than a null.

alter table public.invites
  add column if not exists issued_by uuid;

comment on column public.invites.issued_by is
  'auth.users.id of the founder who issued this invite. Null for invites predating 0022.';

alter table public.invites
  add column if not exists is_test_account boolean not null default false;

comment on column public.invites.is_test_account is
  'Marks the account this invite creates as ours, not a customer. Carried onto the auth user at redemption and onto the freelancer row at setup.';

-- Every invite is now bound to one address; the redemption route already
-- refuses a mismatch, and the admin route now refuses to issue without one.
-- Not enforced as NOT NULL: older unbound invites are still redeemable by
-- whoever holds them, and revoking that retroactively is a separate decision.

alter table public.freelancers
  add column if not exists is_test_account boolean not null default false;

comment on column public.freelancers.is_test_account is
  'Ours, not a customer. Excluded from every founder metric. Set by hand or at invite time.';

alter table public.freelancers
  add column if not exists last_seen_at timestamptz;

comment on column public.freelancers.last_seen_at is
  'Last authenticated activity, refreshed by the app on load. Distinct from created_at, which never moves.';
