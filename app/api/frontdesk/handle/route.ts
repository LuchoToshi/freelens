import { serviceClient } from "@/lib/frontdesk/server/clients";
import { isValidHandle } from "@/lib/frontdesk/handles";

/**
 * Is this link name free? (handoff §5.2 link rules.)
 *
 * The wizard may not claim a name is available on the strength of shape alone:
 * uniqueness lives in the database, and a handle can be taken by an account the
 * asker cannot see under RLS. So the check runs here, with the service client,
 * and answers one of three things — taken, free, or "could not check". The
 * caller shows nothing at all for the third, which is why the failure case is
 * an explicit `ok: false` rather than a defaulted `available: true`.
 *
 * The route reads one column of one row and needs no session: a link name is
 * public by nature, and gating it behind auth would only mean the wizard could
 * not check before the account exists.
 */
export async function GET(request: Request) {
  const handle = (new URL(request.url).searchParams.get("handle") ?? "").toLowerCase().trim();

  if (!isValidHandle(handle)) {
    // Shape and reserved words are settled client-side by the same module;
    // reaching here with an invalid handle means the caller is out of step.
    return Response.json({ ok: true, available: false, reason: "invalid" });
  }

  const { data, error } = await serviceClient()
    .from("freelancers")
    .select("handle")
    .eq("handle", handle)
    .maybeSingle();

  if (error) {
    console.error("frontdesk/handle: check failed:", error.message);
    return Response.json({ ok: false }, { status: 200 });
  }

  return Response.json({ ok: true, available: data === null });
}
