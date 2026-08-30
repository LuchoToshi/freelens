// Gate 3 QA fixture: one disposable freelancer whose inbox exercises every
// queue, so the deployed preview can be QA'd with a real signed-in session.
//
// Run:  QA_PASSWORD=... node scripts/qa-gate3-seed.mjs --yes   (seed)
//       node scripts/qa-gate3-seed.mjs --cleanup               (delete)
//
// Additive only: everything hangs off one new auth user and is deleted by
// --cleanup. Sign-in happens in the browser against the preview itself.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const EMAIL = "qa-gate3-frontdesk@example.com";
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function findUser() {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === EMAIL) ?? null;
}

if (process.argv.includes("--cleanup")) {
  const user = await findUser();
  if (!user) {
    console.log("cleanup: no QA user found, nothing to do");
    process.exit(0);
  }
  const { data: f } = await admin
    .from("freelancers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (f) {
    await admin.from("drafts").delete().eq("freelancer_id", f.id);
    await admin.from("inquiries").delete().eq("freelancer_id", f.id);
    await admin.from("freelancers").delete().eq("id", f.id);
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw error;
  console.log("cleanup: QA user and all seeded rows deleted");
  process.exit(0);
}

if (!process.argv.includes("--yes")) {
  console.error("Refusing to run without --yes (creates a test user).");
  process.exit(1);
}

const password = process.env.QA_PASSWORD;
if (!password || password.length < 12) {
  console.error("Set QA_PASSWORD (>=12 chars) for the throwaway account.");
  process.exit(1);
}
const existing = await findUser();
if (existing) {
  console.error("QA user already exists — run --cleanup first.");
  process.exit(1);
}
const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: EMAIL,
  password,
  email_confirm: true,
});
if (createErr) throw createErr;
const userId = created.user.id;

const { data: freelancer, error: fErr } = await admin
  .from("freelancers")
  .insert({
    auth_user_id: userId,
    handle: "qa-gate3",
    display_name: "Emma Visser",
    craft: "photographer",
    city: "Utrecht",
    locale: "en",
    sign_off: "Emma",
    timezone: "Europe/Amsterdam",
    voice_profile: { tone: "warm", length: "medium", formality: "casual" },
  })
  .select("id")
  .single();
if (fErr) throw fErr;
const fid = freelancer.id;

const now = Date.now();
const iso = (msAgo) => new Date(now - msAgo).toISOString();
const DAY = 86_400_000;

// One inquiry per queue state the UI can show.
const inquiries = [
  { label: "decision", client_name: "Lisa de Jong", client_email: null, event_type: "wedding", budget_band: "2500+", status: "new", created_at: iso(2 * DAY), message: "We are getting married in June and love your style." },
  { label: "review", client_name: "Mark Peters", client_email: "mark@example.com", event_type: "business", budget_band: "1000-2500", status: "new", created_at: iso(1 * DAY), event_date: "2026-10-12", message: "Team offsite, need a photographer for the day." },
  { label: "missing-failed", client_name: "Sanne Bakker", client_email: "sanne@example.com", event_type: "party", budget_band: "<1000", status: "new", created_at: iso(3 * DAY), message: "Birthday party photos?" },
  { label: "missing-nodraft", client_name: "Tom Willems", client_email: "tom@example.com", event_type: "portrait", budget_band: "unsure", status: "new", created_at: iso(5 * DAY), message: "Headshots for LinkedIn." },
  { label: "followup-overdue", client_name: "Anna Smit", client_email: "anna@example.com", event_type: "wedding", budget_band: "2500+", status: "nudge_due", created_at: iso(9 * DAY), replied_at: iso(6 * DAY), message: "September wedding in Amersfoort." },
  { label: "followup-snoozed", client_name: "Pieter van Dam", client_email: "pieter@example.com", event_type: "business", budget_band: "1000-2500", status: "nudge_due", created_at: iso(8 * DAY), replied_at: iso(5 * DAY), snoozed_until: new Date(now + 3 * DAY).toISOString(), message: "Conference coverage, two days." },
  { label: "waiting", client_name: "Julia Mulder", client_email: "julia@example.com", event_type: "portrait", budget_band: "1000-2500", status: "replied", created_at: iso(2 * DAY), replied_at: iso(1 * DAY), message: "Family portraits this autumn." },
  { label: "monitoring", client_name: "Rob Janssen", client_email: "rob@example.com", event_type: "other", budget_band: "unsure", status: "new", created_at: iso(2 * 60_000), message: "Quick question about availability." },
  { label: "done-booked", client_name: "Nina Bos", client_email: "nina@example.com", event_type: "wedding", budget_band: "2500+", status: "booked", created_at: iso(12 * DAY), message: "May wedding, confirmed!" },
  // Long-content resilience probe (§ Gate 3: long content must not break layout).
  { label: "long-content", client_name: "Alexandra Constantinopoulos-Vandenberghe", client_email: "alexandra.constantinopoulos.vandenberghe@example.com", event_type: "wedding", budget_band: "2500+", status: "new", created_at: iso(4 * DAY), message: ("We are planning a three-day destination wedding with multiple venues and a very long list of requirements. " + "Supercalifragilisticexpialidocious".repeat(8) + " ").repeat(12) },
];

const inserted = {};
for (const q of inquiries) {
  const { label, ...row } = q;
  const { data, error } = await admin
    .from("inquiries")
    .insert({ freelancer_id: fid, source: "form", ...row })
    .select("id")
    .single();
  if (error) throw new Error(`${label}: ${error.message}`);
  inserted[label] = data.id;
}

const drafts = [
  { inquiry: "decision", body: "Hi Lisa,\n\nCongratulations on your engagement! A June wedding sounds wonderful and I would love to hear more about your plans. Could you tell me the venue and roughly how many guests you expect?\n\nEmma", validation_status: "needs_review", validation_failures: ["recipient-missing"] },
  { inquiry: "review", body: "Hi Mark,\n\nA team offsite is a great occasion for natural, candid photos. I am available around 12 October and my business day rate starts at 950 euro. Shall I send over a short proposal?\n\nEmma", validation_status: "ready_for_review", validation_failures: [] },
  { inquiry: "missing-failed", body: "", validation_status: "failed", validation_failures: ["body-only-greeting", "signoff-missing"] },
  { inquiry: "long-content", body: "Hi Alexandra,\n\nA three-day destination wedding is a beautiful challenge and exactly the kind of work I love. " + "I would plan each day around the light and the venues you have chosen. ".repeat(20) + "\n\nEmma", validation_status: "ready_for_review", validation_failures: [] },
];
for (const d of drafts) {
  const { error } = await admin.from("drafts").insert({
    inquiry_id: inserted[d.inquiry],
    freelancer_id: fid,
    kind: "reply",
    language: "en",
    body: d.body,
    validation_status: d.validation_status,
    validation_failures: d.validation_failures,
    validated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`draft ${d.inquiry}: ${error.message}`);
}

console.log("seeded freelancer", fid);
console.log("inquiries:", JSON.stringify(inserted, null, 2));
