import { asUserClient } from "@/lib/frontdesk/server/clients";
import { buildAuthUrl } from "@/lib/gmail/server/oauth";
import { signState } from "@/lib/gmail/server/tokens";

/**
 * Bearer-JWT, same as the other frontdesk routes: identifies the freelancer,
 * then hands back Google's authorize URL for the client to redirect to.
 * Does not redirect itself, so the caller can show its own "connecting..."
 * state before leaving the app.
 */
export async function GET(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });

  const asUser = asUserClient(jwt);
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  const { data: freelancer } = await asUser.from("freelancers").select("id").maybeSingle();
  if (!freelancer) return Response.json({ ok: false }, { status: 404 });

  const url = buildAuthUrl(signState(freelancer.id));
  return Response.json({ ok: true, url });
}
