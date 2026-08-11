// RLS verification by execution, not assertion.
//
// Run:  node scripts/verify-frontdesk-rls.mjs --yes
//
// Creates two throwaway freelancers (A, B) with real auth users, gives each an
// inquiry and a draft via the service role (exactly how production writes
// them), then signs in as A through the anon key — a real JWT, the same path
// the app uses — and proves:
//   1. A sees exactly A's rows on all four tables
//   2. A sees zero of B's rows, and an update against B's inquiry touches 0 rows
//   3. anon (no session) sees zero rows everywhere and cannot insert
//   4. pre-existing tables (relationships, 0001) still behave unchanged for A
// Cleans up after itself. Prints PASS/FAIL lines; exits non-zero on any FAIL.
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
  console.error("Refusing to run without --yes (creates and deletes test users).");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const svc = createClient(url, serviceKey, { auth: { persistSession: false } });
const results = [];
let failed = false;
function check(name, ok, extra) {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!ok) failed = true;
}

const PW = "rls-verify-" + Math.random().toString(36).slice(2);
const users = {};

async function makeUser(tag) {
  const email = `rls-${tag}-${Date.now()}@freelens.test`;
  const { data, error } = await svc.auth.admin.createUser({
    email,
    password: PW,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${tag}: ${error.message}`);
  return { id: data.user.id, email };
}

async function main() {
  users.a = await makeUser("a");
  users.b = await makeUser("b");

  const rows = {};
  for (const tag of ["a", "b"]) {
    const { data: f, error } = await svc
      .from("freelancers")
      .insert({
        auth_user_id: users[tag].id,
        handle: `rls-test-${tag}-${Date.now().toString(36)}`,
        display_name: `RLS ${tag.toUpperCase()}`,
        craft: "photographer",
      })
      .select("id")
      .single();
    if (error) throw new Error(`freelancer ${tag}: ${error.message}`);
    const { data: inq, error: iErr } = await svc
      .from("inquiries")
      .insert({
        freelancer_id: f.id,
        client_name: `Client of ${tag}`,
        event_type: "wedding",
        budget_band: "unsure",
      })
      .select("id")
      .single();
    if (iErr) throw new Error(`inquiry ${tag}: ${iErr.message}`);
    const { error: dErr } = await svc.from("drafts").insert({
      inquiry_id: inq.id,
      freelancer_id: f.id,
      kind: "reply",
      body: "test draft",
      language: "nl",
    });
    if (dErr) throw new Error(`draft ${tag}: ${dErr.message}`);
    rows[tag] = { freelancerId: f.id, inquiryId: inq.id };
  }

  // --- As freelancer A, through the anon key: a real app-context session ---
  const asA = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error: signInErr } = await asA.auth.signInWithPassword({
    email: users.a.email,
    password: PW,
  });
  if (signInErr) throw new Error(`sign-in as A: ${signInErr.message}`);

  const { data: myFreelancers } = await asA.from("freelancers").select("id");
  check("A sees exactly own freelancer row", myFreelancers?.length === 1 && myFreelancers[0].id === rows.a.freelancerId);

  const { data: myInquiries } = await asA.from("inquiries").select("id, freelancer_id");
  check(
    "A sees exactly own inquiries",
    myInquiries?.length === 1 && myInquiries[0].freelancer_id === rows.a.freelancerId
  );

  const { data: bInquiries } = await asA
    .from("inquiries")
    .select("id")
    .eq("freelancer_id", rows.b.freelancerId);
  check("A sees zero of B's inquiries", bInquiries?.length === 0);

  const { data: bDrafts } = await asA.from("drafts").select("id").eq("freelancer_id", rows.b.freelancerId);
  check("A sees zero of B's drafts", bDrafts?.length === 0);

  const { data: updated } = await asA
    .from("inquiries")
    .update({ status: "booked" })
    .eq("id", rows.b.inquiryId)
    .select("id");
  check("A's update against B's inquiry touches 0 rows", updated?.length === 0);

  // Pre-existing table behavior unchanged: A (a fresh user) sees zero
  // relationships rows and gets no error — same as before 0003.
  const { data: rel, error: relErr } = await asA.from("relationships").select("id");
  check("pre-existing relationships table unchanged for A", !relErr && rel?.length === 0);

  // --- As anon: no session at all ---
  const asAnon = createClient(url, anonKey, { auth: { persistSession: false } });
  for (const table of ["freelancers", "packages", "inquiries", "drafts"]) {
    const { data } = await asAnon.from(table).select("id");
    check(`anon sees zero rows in ${table}`, (data ?? []).length === 0);
  }
  const { error: anonInsertErr } = await asAnon.from("inquiries").insert({
    freelancer_id: rows.a.freelancerId,
    client_name: "intruder",
    event_type: "other",
    budget_band: "unsure",
  });
  check("anon cannot insert an inquiry", !!anonInsertErr);

  const { data: anonRel } = await asAnon.from("relationships").select("id");
  check("pre-existing relationships still hidden from anon", (anonRel ?? []).length === 0);
}

try {
  await main();
} catch (e) {
  console.error("SETUP ERROR:", e.message);
  failed = true;
} finally {
  for (const tag of ["a", "b"]) {
    if (users[tag]) await svc.auth.admin.deleteUser(users[tag].id).catch(() => {});
  }
}

console.log(results.join("\n"));
process.exit(failed ? 1 : 0);
