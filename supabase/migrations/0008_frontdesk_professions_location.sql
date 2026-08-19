-- WP4: freelancers.craft -> professions, freelancers.city -> location.
--
-- Additive and value-preserving, per the brief's migration rule. `craft` is
-- NOT NULL and every existing row depends on it, so this is NOT a rename in
-- one step. Phase 1 (this migration): add the new columns alongside the old
-- ones and backfill from them. Nothing is dropped. `craft`/`city` stay
-- populated and readable by every consumer that has not moved yet
-- (publicProfile.ts, [handle]/page.tsx, rebooking's Craft type). Phase 2, a
-- later migration once no code reads craft/city: drop both columns.
--
-- Also folds in issue #19 ("widen craft to designer/illustrator") rather
-- than landing it separately - #19's fix and this migration would otherwise
-- touch the same column days apart for no reason. designer/illustrator/
-- other are added to craft's own check constraint too, not just the new
-- professions column, so craft stays a valid NOT NULL value for freelancers
-- who pick one of the widened set before every consumer has moved to
-- professions. creative director stays out per #19's original ruling: no
-- dedicated value until it is a real segment on evidence, rides on "other".

alter table public.freelancers
  drop constraint freelancers_craft_check;

alter table public.freelancers
  add constraint freelancers_craft_check
    check (craft in ('photographer', 'videographer', 'designer', 'illustrator', 'other'));

alter table public.freelancers
  add column primary_profession text
    check (primary_profession is null
      or primary_profession in ('photographer', 'videographer', 'designer', 'illustrator', 'other')),
  add column professions text[] not null default '{}'::text[],
  add column location text check (location is null or char_length(location) <= 80);

-- Backfill from the existing single-value columns. Idempotent: only touches
-- rows that have not been backfilled yet, safe to re-run.
update public.freelancers
set
  primary_profession = craft,
  professions = array[craft],
  location = city
where primary_profession is null;
