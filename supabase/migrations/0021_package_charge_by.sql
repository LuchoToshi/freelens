-- How a price is charged, and whether it is a starting price (§ packages).
--
-- "Unit" was free text: it asked the freelancer to invent a word for something
-- the product needed, and produced values no surface could reason about. The
-- question people can answer is whether they charge by the hour, the day, the
-- session, the item, the project, or as a fixed package, which is a closed
-- list. It is stored beside `unit` rather than replacing it, so every row
-- written before today keeps rendering exactly as its owner wrote it.
--
-- price_from_eur has always been read as a starting price. Some prices are
-- exact, so the "from" becomes a fact the freelancer states rather than a
-- shape the column imposes; it defaults to false, which is what the plain
-- reading of an entered price should have been all along.

alter table public.packages
  add column if not exists charge_by text;

alter table public.packages
  drop constraint if exists packages_charge_by_check;

alter table public.packages
  add constraint packages_charge_by_check check (
    charge_by is null or charge_by in ('hour', 'day', 'session', 'item', 'project', 'fixed')
  );

alter table public.packages
  add column if not exists price_is_from boolean not null default false;

comment on column public.packages.charge_by is
  'Closed set: hour, day, session, item, project, fixed. Null means a legacy row whose free-text unit still applies.';
comment on column public.packages.price_is_from is
  'True when price_from_eur is a starting price rather than the price.';
