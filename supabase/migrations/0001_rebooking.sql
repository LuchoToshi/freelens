-- Rebooking Agent schema, Phase B1.
--
-- Three tables, all user-owned, all under row-level security from the first
-- migration: there is no window in this schema's history where one user could
-- read another's rows. Service-role access stays server-side only.
--
-- Privacy by minimisation is enforced structurally: no column exists for a
-- client address, phone number, KvK or VAT number.

create table public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_name text not null check (char_length(client_name) between 1 and 120),
  client_email text check (client_email is null or char_length(client_email) <= 254),
  company text check (company is null or char_length(company) <= 120),
  client_type text check (client_type in ('direct', 'agency', 'brand', 'editorial', 'other')),
  last_project_title text check (last_project_title is null or char_length(last_project_title) <= 200),
  last_project_date date,
  approx_value_cents bigint check (approx_value_cents is null or approx_value_cents >= 0),
  notes text check (notes is null or char_length(notes) <= 2000),
  temperature text not null default 'cold' check (temperature in ('warm', 'cooling', 'cold')),
  snoozed_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.touches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  relationship_id uuid not null references public.relationships (id) on delete cascade,
  suggested_at timestamptz not null default now(),
  reason_code text not null check (reason_code in ('anniversary', 'season', 'gap', 'manual')),
  reason_text text not null check (char_length(reason_text) <= 500),
  draft_subject text not null default '' check (char_length(draft_subject) <= 200),
  draft_body text not null default '' check (char_length(draft_body) <= 5000),
  status text not null default 'suggested'
    check (status in ('suggested', 'edited', 'sent_by_user', 'skipped', 'snoozed')),
  status_at timestamptz not null default now()
);

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  touch_id uuid not null references public.touches (id) on delete cascade,
  result text not null
    check (result in ('reply_positive', 'reply_neutral', 'reply_negative', 'booked', 'no_reply')),
  booked_value_cents bigint check (booked_value_cents is null or booked_value_cents >= 0),
  note text check (note is null or char_length(note) <= 1000),
  recorded_at timestamptz not null default now()
);

-- The voice profile: the derived style only. Raw pasted emails are never
-- stored here — they are processed and discarded, per the retention rules.
create table public.voice_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  craft text not null check (craft in ('photographer', 'videographer', 'designer', 'illustrator', 'other')),
  greeting text check (greeting is null or char_length(greeting) <= 40),
  signoff text check (signoff is null or char_length(signoff) <= 40),
  formality text check (formality in ('je', 'u')),
  style_notes text check (style_notes is null or char_length(style_notes) <= 1000),
  updated_at timestamptz not null default now()
);

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger relationships_updated_at
  before update on public.relationships
  for each row execute function public.touch_updated_at();

create trigger voice_profiles_updated_at
  before update on public.voice_profiles
  for each row execute function public.touch_updated_at();

-- Query paths: the weekly queue reads a user's non-snoozed relationships; the
-- outcome prompt reads sent touches by age.
create index relationships_user_idx on public.relationships (user_id, snoozed_until);
create index touches_user_status_idx on public.touches (user_id, status, status_at);
create index outcomes_user_idx on public.outcomes (user_id, recorded_at);

-- Row-level security: owners only, on every table, for every verb.
alter table public.relationships enable row level security;
alter table public.touches enable row level security;
alter table public.outcomes enable row level security;
alter table public.voice_profiles enable row level security;

create policy "own relationships" on public.relationships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own touches" on public.touches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own outcomes" on public.outcomes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own voice profile" on public.voice_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
