-- FrontDesk schema. Additive only: nothing here touches a pre-existing table.
--
-- Four tables, all owner-scoped through the freelancers row, all under RLS
-- from the first migration — no window where one freelancer could read
-- another's inquiries. There are deliberately NO anon policies: the public
-- inquiry form writes through a server route with the service role, and the
-- public profile page reads through one auditable server helper with an
-- explicit column list.
--
-- Policy subqueries wrap auth.uid() as (select auth.uid()) so Postgres plans
-- it once per statement (InitPlan) instead of per row.

create table public.freelancers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9][a-z0-9-]{2,29}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  craft text not null check (craft in ('photographer', 'videographer')),
  city text check (city is null or char_length(city) <= 80),
  photo_url text check (photo_url is null or char_length(photo_url) <= 500),
  locale text not null default 'nl' check (locale in ('nl', 'en')),
  sign_off text check (sign_off is null or char_length(sign_off) <= 60),
  voice_profile jsonb,
  -- Kept, not discarded: profiles are regenerated from these when the
  -- extraction prompt improves. A deliberate divergence from the rebooking
  -- product's discard rule, written into the FrontDesk spec on purpose.
  voice_samples text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 120),
  price_from_eur numeric not null check (price_from_eur >= 0),
  unit text check (unit is null or char_length(unit) <= 40),
  notes text check (notes is null or char_length(notes) <= 500),
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  source text not null default 'form' check (source in ('form', 'email')),
  src_channel text check (src_channel is null or src_channel in ('ig', 'tt', 'li', 'sig')),
  client_name text not null check (char_length(client_name) between 1 and 120),
  -- Collected for the mailto handoff; never enters an LLM prompt.
  client_email text check (client_email is null or char_length(client_email) <= 254),
  event_date date,
  event_type text not null check (event_type in ('wedding', 'party', 'business', 'portrait', 'other')),
  budget_band text not null check (budget_band in ('<1000', '1000-2500', '2500+', 'unsure')),
  message text check (message is null or char_length(message) <= 5000),
  status text not null default 'new'
    check (status in ('new', 'replied', 'nudge_due', 'booked', 'lost')),
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  -- Denormalized so the RLS policy is one hop, same shape as every other
  -- table. Drafts are only ever inserted server-side, so it cannot drift.
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  kind text not null check (kind in ('reply', 'nudge')),
  body text not null check (char_length(body) <= 5000),
  language text not null check (language in ('nl', 'en')),
  prompt_version text,
  outcome text check (outcome is null or outcome in ('sent_as_is', 'edited', 'skipped')),
  final_body text check (final_body is null or char_length(final_body) <= 5000),
  outcome_at timestamptz,
  created_at timestamptz not null default now()
);

-- updated_at maintenance: reuses the trigger function from migration 0001.
create trigger freelancers_updated_at
  before update on public.freelancers
  for each row execute function public.touch_updated_at();

-- Query paths: profile by handle (unique index already), a freelancer's
-- packages, the inbox by status, drafts per inquiry, nudge-cron scans.
create index packages_freelancer_idx on public.packages (freelancer_id, position);
create index inquiries_freelancer_status_idx on public.inquiries (freelancer_id, status, created_at desc);
create index drafts_inquiry_idx on public.drafts (inquiry_id, created_at desc);
create index drafts_freelancer_idx on public.drafts (freelancer_id);

-- Row-level security: owners only, every table, every verb. No anon access.
alter table public.freelancers enable row level security;
alter table public.packages enable row level security;
alter table public.inquiries enable row level security;
alter table public.drafts enable row level security;

create policy "own freelancer row" on public.freelancers
  for all
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

create policy "own packages" on public.packages
  for all
  using (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())))
  with check (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())));

create policy "own inquiries" on public.inquiries
  for all
  using (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())))
  with check (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())));

create policy "own drafts" on public.drafts
  for all
  using (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())))
  with check (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())));

-- Avatar storage: public bucket, per-user folder writes, 2MB, images only.
-- Public read happens via the CDN URL of a public bucket; no SELECT policy
-- (and no listing) is granted.
--
-- NOTE: on hosted Supabase, storage.objects is owned by supabase_storage_admin.
-- If the policy statements below fail with an ownership error when applied via
-- `supabase db query --linked`, create the same three policies in the
-- dashboard (Storage > Policies) and record that in the commit; the SQL here
-- stays the canonical description either way.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'frontdesk-avatars',
  'frontdesk-avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "frontdesk avatar insert own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'frontdesk-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "frontdesk avatar update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'frontdesk-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "frontdesk avatar delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'frontdesk-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
