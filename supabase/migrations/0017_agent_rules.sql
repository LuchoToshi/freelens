-- Addendum §6: reusable automations, born only from repeated approvals.
-- Additive only; user-owned rows under the freelancer-scoped RLS shape.
create table public.agent_rules (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers(id) on delete cascade,
  trigger jsonb not null,
  action text not null check (action in ('prepare_reply', 'prepare_followup')),
  status text not null default 'proposed'
    check (status in ('proposed', 'trial', 'on', 'paused', 'declined')),
  origin_approval_ids uuid[] not null default '{}',
  trial_runs_left integer not null default 3 check (trial_runs_left >= 0),
  ran_count integer not null default 0 check (ran_count >= 0),
  edited_count integer not null default 0 check (edited_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agent_rules_freelancer_idx on public.agent_rules (freelancer_id, created_at desc);

alter table public.agent_rules enable row level security;

create policy "own agent rules" on public.agent_rules
  using (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())))
  with check (freelancer_id in (select id from public.freelancers where auth_user_id = (select auth.uid())));

-- The global brake (§6: "pause all rules"), alongside the follow-up switch.
alter table public.freelancers
  add column rules_paused boolean not null default false;
