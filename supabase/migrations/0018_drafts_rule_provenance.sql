-- Addendum §6: every rule-produced item carries "Your rule: …" provenance.
-- Additive only. ON DELETE SET NULL: deleting a rule never deletes the work
-- it produced, it only stops claiming it.
alter table public.drafts
  add column rule_id uuid references public.agent_rules(id) on delete set null;
