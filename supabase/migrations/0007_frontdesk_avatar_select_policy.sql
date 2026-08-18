-- Fix: avatar upload silently fails for every user.
--
-- Root cause, confirmed by reproducing the exact client call
-- (sb.storage.from('frontdesk-avatars').upload(path, file, { upsert: true }))
-- against production as a real authenticated user:
--   - a plain insert (no upsert) succeeds under the existing three policies.
--   - the same call with upsert: true always fails with
--     "new row violates row-level security policy", even on a brand-new path
--     that has no existing row to conflict with.
-- Storage's upsert path needs to read the target row to decide insert vs.
-- update, and 0003 deliberately granted no SELECT policy on storage.objects
-- ("public read happens via the CDN URL of a public bucket"). Without SELECT,
-- the upsert's own row visibility check fails closed. setup-wizard.tsx always
-- uploads with upsert: true (re-uploading a photo replaces the same
-- `${user}/avatar` path), so every upload hit this.
--
-- Fix: grant SELECT on storage.objects, scoped to the user's own folder only,
-- matching the update/delete policies already in 0003. This does not expose
-- other users' files or enable listing across folders.
create policy "frontdesk avatar select own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'frontdesk-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
