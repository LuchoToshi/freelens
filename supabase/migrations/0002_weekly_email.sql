-- Weekly email preference. Default on, one click off, per B5: no email when
-- the queue is empty, no streaks, no engagement mechanics.
alter table public.voice_profiles
  add column weekly_email boolean not null default true;
