// FrontDesk demo seed: one freelancer, three packages, a canned voice profile.
//
// Run:  node scripts/seed-frontdesk.mjs --yes
//
// Uses the service role, so it refuses to run without the explicit --yes flag:
// a service-role seed pointed at the wrong project is the classic footgun.
// Loads .env.local itself because plain node does not.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

loadEnvLocal();

if (!process.argv.includes("--yes")) {
  console.error("Refusing to run without --yes (service-role writes).");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
console.log("Target project:", new URL(url).hostname);

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const DEMO_EMAIL = "frontdesk-demo@freelens.test";
const HANDLE = "demo-emma";

// Auth user (idempotent: reuse if it exists).
let userId;
{
  const { data: created, error } = await db.auth.admin.createUser({
    email: DEMO_EMAIL,
    email_confirm: true,
  });
  if (error) {
    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
    if (!existing) {
      console.error("createUser failed and no existing user found:", error.message);
      process.exit(1);
    }
    userId = existing.id;
  } else {
    userId = created.user.id;
  }
}

const { data: freelancer, error: fErr } = await db
  .from("freelancers")
  .upsert(
    {
      auth_user_id: userId,
      handle: HANDLE,
      display_name: "Emma van Dijk",
      craft: "photographer",
      city: "Utrecht",
      locale: "nl",
      sign_off: "— Emma",
      voice_profile: {
        tone: "warm and personal",
        formality: "informal",
        sentence_length: "medium",
        emoji: "rare",
        greeting_style: "Hoi {first name}!",
        closing_habit: "always suggests a short call",
        sign_off: "— Emma",
        language_notes: "writes Dutch informally with 'je', sprinkles English terms",
        quirks: ["uses an exclamation mark in the first sentence", "mentions light or location"],
      },
    },
    { onConflict: "auth_user_id" }
  )
  .select("id")
  .single();
if (fErr) {
  console.error("freelancer upsert failed:", fErr.message);
  process.exit(1);
}

await db.from("packages").delete().eq("freelancer_id", freelancer.id);
const { error: pErr } = await db.from("packages").insert([
  {
    freelancer_id: freelancer.id,
    label: "Hele trouwdag",
    price_from_eur: 1950,
    unit: "per dag",
    notes: "incl. tweede fotograaf en online galerij",
    position: 0,
  },
  {
    freelancer_id: freelancer.id,
    label: "Portretsessie",
    price_from_eur: 350,
    unit: "per sessie",
    notes: "1,5 uur, 15 bewerkte foto's",
    position: 1,
  },
  {
    freelancer_id: freelancer.id,
    label: "Zakelijke reportage",
    price_from_eur: 750,
    unit: "per dagdeel",
    notes: null,
    position: 2,
  },
]);
if (pErr) {
  console.error("packages insert failed:", pErr.message);
  process.exit(1);
}

console.log(`Seeded: ${DEMO_EMAIL} → /${HANDLE} with 3 packages.`);
