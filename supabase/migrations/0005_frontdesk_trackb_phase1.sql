-- FrontDesk Track B (Gmail opportunity agent), Phase 1 data model. Additive
-- only: no changes to any table from 0001-0004.
--
-- Schema only, per the Phase 1 migration ticket. No RLS, no sync logic, no
-- ranking/draft/send logic, no UI - all of that is Epic 1 and later, gated
-- on this landing first. The nine entities are from the execution package
-- (PLANS/FRONTDESK_TRACKB_EXECUTION_PACKAGE_V2.md Section 1), plus one
-- table not in that list: agent_sync_batches, added because the ticket's
-- second carried decision ("schema must distinguish in-flight vs completed
-- sync batches") has nowhere else to live - no entity in the nine models a
-- sync run. Discard-on-revoke and delete-completed-only cannot be separate
-- operations without something to key them on.
--
-- Tables are prefixed agent_: this repo already has an `outcomes` table
-- (Rebooking, 0001) and a `drafts` table (FrontDesk, 0003), and this phase
-- needs both nouns again for a third, structurally unrelated product. Reusing
-- the bare names would make every future join a place to get the wrong
-- table. Prefixing the whole set, not just the two collisions, keeps the
-- subsystem's tables grouped and the naming rule simple to state.
--
-- `Outcome.booked`/`Outcome.value` in the execution package's own data-model
-- table are superseded by `marked_booked_by_user`/`marked_value_by_user` -
-- decided 2026-08-17, self-report only, no detection mechanism specced for
-- either (same overclaim class as the concierge test's `outcomes.result`
-- already flagged live). This migration uses the renamed fields, not the
-- doc's table.
--
-- Field names beyond the renamed pair follow the ticket's "key fields" list
-- as the entity contract, not as literal column names: `timestamp` on
-- Approval becomes `decided_at`, matching every other event-time column in
-- this schema (replied_at, sent_at, created_at). Money fields use the
-- codebase's minor-units convention (0001's approx_value_cents) with a
-- `_cents` suffix for clarity, except marked_value_by_user, which keeps the
-- ticket's exact name since the acceptance criteria checks for it literally.
--
-- freelancer_id is not in any entity's field list but is added to
-- agent_contacts, agent_conversations and agent_sync_batches: these are the
-- root/scoping points future RLS policies (Epic 1) will hook into, same
-- "denormalized so the policy is one hop" reasoning as 0003's drafts table.
-- Downstream entities (evidence, opportunities, actions, drafts, approvals,
-- outcomes, corrections) scope through their parent instead.

create table public.agent_contacts (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  email text not null check (char_length(email) <= 254),
  company text check (company is null or char_length(company) <= 160),
  first_seen_at timestamptz not null default now(),
  relationship_value_estimate_cents bigint check (relationship_value_estimate_cents is null or relationship_value_estimate_cents >= 0),
  -- Per-channel consent record; WhatsApp only for now, per the execution
  -- package. Unused until WhatsApp work starts (Phase 4, unscheduled).
  channel_opt_ins jsonb,
  unique (freelancer_id, email)
);

create table public.agent_sync_batches (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'discarded')),
  history_id_start text check (history_id_start is null or char_length(history_id_start) <= 255),
  history_id_end text check (history_id_end is null or char_length(history_id_end) <= 255),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  freelancer_id uuid not null references public.freelancers (id) on delete cascade,
  contact_id uuid not null references public.agent_contacts (id) on delete cascade,
  thread_id text not null check (char_length(thread_id) <= 255),
  channel text not null default 'email' check (channel in ('email', 'instagram', 'whatsapp')),
  -- Null for email (no messaging window). Set for Instagram/WhatsApp once
  -- those channels exist.
  channel_window_open_until timestamptz,
  status text not null default 'active',
  last_message_at timestamptz not null default now(),
  unique (freelancer_id, thread_id)
);

create table public.agent_project_evidence (
  id uuid primary key default gen_random_uuid(),
  -- Which sync run produced this row, so a mid-sync revoke can discard
  -- everything an in-flight batch derived (execution package Section 1).
  sync_batch_id uuid references public.agent_sync_batches (id) on delete set null,
  conversation_id uuid not null references public.agent_conversations (id) on delete cascade,
  extracted_field text not null check (char_length(extracted_field) <= 80),
  -- Nullable: "nothing invented, unextractable fields are null, never
  -- guessed" (execution package Section 1).
  value text check (value is null or char_length(value) <= 2000),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  source_message_id text not null check (char_length(source_message_id) <= 255),
  created_at timestamptz not null default now()
);

create table public.agent_opportunities (
  id uuid primary key default gen_random_uuid(),
  sync_batch_id uuid references public.agent_sync_batches (id) on delete set null,
  conversation_id uuid not null references public.agent_conversations (id) on delete cascade,
  -- The three trigger types from the Judgment Policy Doc (execution package
  -- Section 3): new inquiry with no reply, a quiet active thread, a dormant
  -- client past the recency floor.
  type text not null check (type in ('new_inquiry', 'quiet_thread', 'dormant_reactivation')),
  score numeric not null,
  reason_code text not null check (char_length(reason_code) <= 80),
  status text not null default 'pending',
  -- Derived from channel + window state; null when the opportunity exists
  -- but the channel can't act on it yet (Today-queue's channel-ineligible
  -- state, execution package Section 5).
  eligible_action_type text check (eligible_action_type is null or eligible_action_type in ('reply', 'follow_up', 'reactivate')),
  created_at timestamptz not null default now()
);

create table public.agent_recommended_actions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.agent_opportunities (id) on delete cascade,
  action_type text not null check (action_type in ('reply', 'follow_up', 'reactivate')),
  rationale text not null check (char_length(rationale) <= 2000),
  created_at timestamptz not null default now()
);

create table public.agent_drafts (
  id uuid primary key default gen_random_uuid(),
  sync_batch_id uuid references public.agent_sync_batches (id) on delete set null,
  action_id uuid not null references public.agent_recommended_actions (id) on delete cascade,
  content text not null check (char_length(content) <= 5000),
  validation_status text not null default 'pending',
  validation_rejections text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.agent_drafts (id) on delete cascade,
  -- Today-queue's four actions (execution package Section 5).
  decision text not null check (decision in ('approved', 'edited', 'snoozed', 'dismissed')),
  edited_content text check (edited_content is null or char_length(edited_content) <= 5000),
  -- Required on every dismissal, not skippable (execution package Section 1
  -- "Feedback and correction storage").
  dismiss_reason text check (dismiss_reason is null or dismiss_reason in ('wrong_client', 'wrong_timing', 'wrong_read', 'not_interested')),
  decided_at timestamptz not null default now()
);

create table public.agent_outcomes (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.agent_approvals (id) on delete cascade,
  sent_at timestamptz,
  replied_at timestamptz,
  -- Pure self-report, no detection mechanism. See migration header.
  marked_booked_by_user boolean not null default false,
  marked_value_by_user bigint check (marked_value_by_user is null or marked_value_by_user >= 0)
);

create table public.agent_user_corrections (
  id uuid primary key default gen_random_uuid(),
  -- Not in the ticket's field list, added so a correction is traceable to
  -- what it corrected rather than being an orphaned log row.
  project_evidence_id uuid not null references public.agent_project_evidence (id) on delete cascade,
  field text not null check (char_length(field) <= 80),
  original_value text check (original_value is null or char_length(original_value) <= 2000),
  corrected_value text not null check (char_length(corrected_value) <= 2000),
  applied_at timestamptz not null default now()
);

-- Query paths: per-freelancer contact/conversation lookups, evidence and
-- opportunities per conversation, the pipeline chain from opportunity down
-- to outcome, and discard-on-revoke's batch-scoped deletes.
create index agent_contacts_freelancer_idx on public.agent_contacts (freelancer_id);
create index agent_sync_batches_freelancer_idx on public.agent_sync_batches (freelancer_id, started_at desc);
create index agent_conversations_freelancer_idx on public.agent_conversations (freelancer_id, status);
create index agent_conversations_contact_idx on public.agent_conversations (contact_id);
create index agent_project_evidence_conversation_idx on public.agent_project_evidence (conversation_id);
create index agent_project_evidence_batch_idx on public.agent_project_evidence (sync_batch_id);
create index agent_opportunities_conversation_idx on public.agent_opportunities (conversation_id);
create index agent_opportunities_batch_idx on public.agent_opportunities (sync_batch_id);
create index agent_recommended_actions_opportunity_idx on public.agent_recommended_actions (opportunity_id);
create index agent_drafts_action_idx on public.agent_drafts (action_id);
create index agent_drafts_batch_idx on public.agent_drafts (sync_batch_id);
create index agent_approvals_draft_idx on public.agent_approvals (draft_id);
create index agent_outcomes_approval_idx on public.agent_outcomes (approval_id);
create index agent_user_corrections_evidence_idx on public.agent_user_corrections (project_evidence_id);
