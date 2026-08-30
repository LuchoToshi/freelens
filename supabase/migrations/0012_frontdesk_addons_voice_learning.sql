-- Phase 3 (master spec §6.5, §6.6): package add-ons and voice-learning
-- controls. Additive only.
--
-- addons: [{ "label": text, "price_eur": number }] — exact prices, same
-- contract as packages: a draft may only quote prices the freelancer set.
alter table public.packages
  add column addons jsonb not null default '[]'::jsonb;

-- Voice learning can be paused (§6.6: accept/reject/pause), and decisions on
-- proposals persist so a rejected proposal never resurfaces. Proposals
-- themselves are derived at read time and never stored (D22).
alter table public.freelancers
  add column voice_learning_paused boolean not null default false,
  add column voice_proposal_decisions jsonb not null default '{}'::jsonb;
