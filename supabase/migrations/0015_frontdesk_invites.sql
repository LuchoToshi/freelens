-- Addendum §1 (31 Aug 2026): invite-gated sign-up. Additive only.
--
-- Service-role only: RLS is enabled with no user policies, so the anon and
-- authenticated roles can never read or probe invites — the redemption route
-- is the single gate and fails neutrally.
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 6 and 24),
  issued_to_email text check (issued_to_email is null or char_length(issued_to_email) <= 254),
  redeemed_at timestamptz,
  redeemed_by uuid,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;
