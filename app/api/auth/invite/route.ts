import { serviceClient } from "@/lib/frontdesk/server/clients";

/**
 * Invite redemption — the ONLY path that creates an account (addendum §1.3).
 * Sign-in itself never creates users (`shouldCreateUser: false`); this route
 * validates the invite, creates the user, and marks the invite redeemed in
 * one conditional update so an invite can never mint two accounts.
 *
 * Failures are neutral (addendum §1.1): "used" and "invalid" are the only
 * distinctions (both shown to the holder of the code); nothing reveals
 * whether an email address has an account. Logs carry reason codes only.
 */
export async function POST(request: Request) {
  let body: { code?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "invalid" }, { status: 200 });
  }
  const code = String(body.code ?? "").trim().toUpperCase();
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!code || code.length < 6 || code.length > 24 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ ok: false, reason: "invalid" }, { status: 200 });
  }

  const db = serviceClient();
  const { data: invite } = await db
    .from("invites")
    .select("id, redeemed_at, expires_at, issued_to_email")
    .eq("code", code)
    .maybeSingle();

  if (!invite || (invite.expires_at && new Date(invite.expires_at) < new Date())) {
    console.log("auth/invite: invalid");
    return Response.json({ ok: false, reason: "invalid" }, { status: 200 });
  }
  if (invite.redeemed_at) {
    console.log("auth/invite: used");
    return Response.json({ ok: false, reason: "used" }, { status: 200 });
  }
  if (invite.issued_to_email && invite.issued_to_email.toLowerCase() !== email) {
    // Bound invites only work for the address they were issued to; the
    // holder learns nothing beyond "doesn't work".
    console.log("auth/invite: email_mismatch");
    return Response.json({ ok: false, reason: "invalid" }, { status: 200 });
  }

  // Claim the invite first — the conditional update is the one-redemption
  // lock; two racing requests cannot both pass it.
  const { data: claimed } = await db
    .from("invites")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("id", invite.id)
    .is("redeemed_at", null)
    .select("id")
    .maybeSingle();
  if (!claimed) {
    console.log("auth/invite: used");
    return Response.json({ ok: false, reason: "used" }, { status: 200 });
  }

  const { data: created, error } = await db.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error || !created.user) {
    // The address already has an account (or creation failed): release the
    // invite so it stays usable, answer neutrally.
    await db.from("invites").update({ redeemed_at: null }).eq("id", invite.id);
    console.log("auth/invite: create_failed");
    return Response.json({ ok: false, reason: "invalid" }, { status: 200 });
  }
  await db.from("invites").update({ redeemed_by: created.user.id }).eq("id", invite.id);

  console.log("auth/invite: redeemed");
  return Response.json({ ok: true });
}
