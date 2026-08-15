-- Gmail outreach tool: standalone internal recruiting instrument, unrelated
-- to the paused customer-facing Gmail opportunity-agent. Sends only from a
-- dedicated Freelens-owned account; never reads a third party's inbox.
--
-- Service-role only: no anon or authenticated path touches these tables, so
-- there is no owner column to key RLS on. RLS is enabled anyway with no
-- policies, matching this schema's default-deny posture everywhere else --
-- service role bypasses RLS, so this only closes off anon/authenticated
-- access that should never have existed in the first place.

create table public.outreach_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  name text check (name is null or char_length(name) <= 120),
  source text not null check (source in ('waitlist', 'manual')),
  status text not null default 'candidate'
    check (status in ('candidate', 'contacted', 'declined', 'unreachable')),
  created_at timestamptz not null default now()
);

create table public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.outreach_contacts (id) on delete cascade,
  subject text not null check (char_length(subject) <= 200),
  body text not null check (char_length(body) <= 5000),
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'sent', 'replied', 'rejected')),
  -- Buzz pubkey or email of whoever approved the send. Null until approved.
  approved_by text,
  gmail_thread_id text,
  gmail_message_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create unique index outreach_contacts_email_idx on public.outreach_contacts (email);
create index outreach_messages_contact_idx on public.outreach_messages (contact_id, created_at desc);
create index outreach_messages_status_idx on public.outreach_messages (status);

alter table public.outreach_contacts enable row level security;
alter table public.outreach_messages enable row level security;
