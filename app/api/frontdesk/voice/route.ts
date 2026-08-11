import { asUserClient } from "@/lib/frontdesk/server/clients";
import { extractVoiceProfile, FrontdeskGenerationError } from "@/lib/frontdesk/generateDraft";

/**
 * Voice-profile extraction. Bearer-JWT; the freelancer row is read and
 * written through the caller's own token, so RLS owns the question of whose
 * profile this is.
 *
 * The pasted samples ARE stored (voice_samples) — a deliberate divergence
 * from the rebooking product's discard rule, written into the FrontDesk spec
 * on purpose: profiles get regenerated from them when the extraction prompt
 * improves.
 */
export const maxDuration = 300;

export async function POST(request: Request) {
  const jwt = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return Response.json({ ok: false }, { status: 401 });

  const asUser = asUserClient(jwt);
  const { data: userData, error: userError } = await asUser.auth.getUser(jwt);
  if (userError || !userData?.user) return Response.json({ ok: false }, { status: 401 });

  let body: { samples?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  const samples = typeof body.samples === "string" ? body.samples.trim().slice(0, 20_000) : "";
  if (samples.length < 100) {
    return Response.json({ ok: false, reason: "too_short" }, { status: 400 });
  }

  const { data: freelancer } = await asUser
    .from("freelancers")
    .select("id, locale")
    .maybeSingle();
  if (!freelancer) return Response.json({ ok: false }, { status: 404 });

  try {
    const profile = await extractVoiceProfile(samples, freelancer.locale === "en" ? "en" : "nl");
    const sampleArray = samples
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
    const { error } = await asUser
      .from("freelancers")
      .update({ voice_profile: profile, voice_samples: sampleArray })
      .eq("id", freelancer.id);
    if (error) {
      console.error("frontdesk/voice: store_failed");
      return Response.json({ ok: false }, { status: 500 });
    }
    console.log("frontdesk/voice: extracted");
    return Response.json({ ok: true, profile });
  } catch (error) {
    console.error(
      "frontdesk/voice: extraction_failed",
      error instanceof FrontdeskGenerationError ? `attempts:${error.attempts}` : "unexpected"
    );
    return Response.json({ ok: false }, { status: 502 });
  }
}
