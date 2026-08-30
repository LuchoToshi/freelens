# Rollback — branch `claude/master-spec-phase1-trust`

## The normal rollback is code-only

Every migration on this branch (0010–0014) is additive. Old code runs
unchanged against the migrated database — this is not a theory: production
`main` has been serving against all five applied migrations since each was
pushed, with zero changes to it.

So if the merged branch misbehaves in production:

1. **Vercel → the previous production deployment → Promote** (or
   `vercel rollback` from the linked project). That is the whole rollback.
2. Leave the database alone. New columns are ignored by old code; no data
   the old code reads was altered.

What survives a code rollback and waits for the fix-forward: stored
validation results, snoozes, permission levels, learned-voice decisions,
follow-up settings, dismiss reasons. All of it is compatible with re-deploy.

## Full schema reversal (last resort only)

`supabase/rollback/rollback_0010_0014.sql` drops every column the branch
added and forgets 0010–0014 in the migration history, so a later
`supabase db push` can re-apply cleanly. **It deletes the data those
columns hold.** Run it only if the schema itself must go, and only after
the code rollback above:

```bash
supabase link --project-ref sdtkwzuzfkhjfluxujkk
psql "$PROD_DB_URL" -f supabase/rollback/rollback_0010_0014.sql
```

## Rehearsal record — 2026-08-30, local stack (production-shaped schema)

Executed, not just written (spec §30 Phase 8):

| Step | Result |
|---|---|
| Baseline | drafts=4, inquiries=10, 12 branch columns present |
| Run rollback script | ALTER TABLEs + `DELETE 5` history rows, committed |
| Verify reversal | 12 branch columns gone; drafts=4, inquiries=10 (no data loss outside the dropped columns); history rows 0 |
| Re-apply | `supabase migration up` re-ran exactly 0010–0014 |
| Verify restore | 12 columns back; drafts=4; 0010's backfill re-ran (4 drafts → `needs_review`) |

Code-rollback compatibility is proven continuously: production `main`
(pre-branch code) has served against the fully migrated production DB
through Phases 1–7 with the RLS suite green after every migration.
