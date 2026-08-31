-- Addendum §2.2: the work object — the persistent unit connecting a request
-- to a task and a result. Additive only. User-owned rows under RLS with the
-- same freelancer-scoped policy shape as the core tables.
create table public.agent_work_objects (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers(id) on delete cascade,
  request_text text not null check (char_length(request_text) between 1 and 2000),
  read_as text check (read_as is null or char_length(read_as) <= 500),
  status text not null default 'understanding'
    check (status in ('understanding', 'plan', 'working', 'waiting', 'needs_you', 'paused', 'done', 'failed')),
  steps jsonb not null default '[]'::jsonb,
  needs text check (needs is null or char_length(needs) <= 500),
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agent_work_objects_freelancer_idx
  on public.agent_work_objects (freelancer_id, created_at desc);

alter table public.agent_work_objects enable row level security;

create policy "own work objects" on public.agent_work_objects
  using (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())))
  with check (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())));
