-- Intake asks a creative freelancer's real question set (handoff §9).
--
-- event_type carries a CHECK constraint, so the new options cannot be stored
-- until it is widened. Legacy values stay in the constraint: rows written
-- under the old vocabulary must keep rendering, and dropping them would make
-- existing inquiries unreadable to satisfy a form that no longer offers them.
--
-- "Something else" gets its own column rather than a prefix in message: the
-- draft pipeline reads the project kind, and a value buried in free text is a
-- value the drafting context cannot use.

alter table public.inquiries
  drop constraint if exists inquiries_event_type_check;

alter table public.inquiries
  add constraint inquiries_event_type_check check (
    event_type in (
      -- offered today
      'wedding',
      'event',
      'brand_film',
      'music_video',
      'real_estate',
      'social_content',
      'other',
      -- the hybrid thread's "the client never said"
      'unspecified',
      -- retired from the form, kept readable
      'party',
      'business',
      'portrait'
    )
  );

alter table public.inquiries
  add column if not exists event_type_other text;

alter table public.inquiries
  drop constraint if exists inquiries_event_type_other_len;

alter table public.inquiries
  add constraint inquiries_event_type_other_len check (
    event_type_other is null or char_length(event_type_other) <= 120
  );

comment on column public.inquiries.event_type_other is
  'What the client typed when they chose "Something else". Null for every other type.';
