// Production/preview smoke test (master spec Phase 8): the surfaces a
// freelancer and their client actually touch. Read-only except the demo
// draft generation, which writes to no table by design.
//
// Run:  node scripts/smoke-frontdesk.mjs https://frlns.com [handle]
const base = process.argv[2];
const handle = process.argv[3];
if (!base) {
  console.error("Usage: node scripts/smoke-frontdesk.mjs <baseUrl> [handle]");
  process.exit(1);
}

let failures = 0;
async function check(name, path, test) {
  try {
    const res = await fetch(`${base}${path}`, { redirect: "follow" });
    const body = await res.text();
    const problem = test(res, body);
    if (problem) {
      failures++;
      console.log(`FAIL ${name}: ${problem}`);
    } else {
      console.log(`PASS ${name}`);
    }
  } catch (error) {
    failures++;
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

await check("home", "/", (r, b) =>
  r.status !== 200 ? `status ${r.status}` : b.includes("Freelens") ? null : "missing brand"
);
await check("robots", "/robots.txt", (r, b) =>
  r.status !== 200 ? `status ${r.status}` : b.includes("User-Agent") ? null : "no rules"
);
await check("sitemap", "/sitemap.xml", (r, b) =>
  r.status !== 200 ? `status ${r.status}` : b.includes("<urlset") ? null : "not a sitemap"
);
await check("inbox shell", "/inbox", (r, b) =>
  r.status !== 200 ? `status ${r.status}` : b.length > 500 ? null : "empty shell"
);
await check("demo page", "/demo", (r) => (r.status === 200 ? null : `status ${r.status}`));
if (handle) {
  await check("public page", `/${handle}`, (r, b) =>
    r.status !== 200 ? `status ${r.status}` : b.includes("Freelens") ? "brand leaked to client page" : null
  );
}

// End-to-end draft generation through the same model path production uses.
try {
  const res = await fetch(`${base}/api/frontdesk/demo/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale: "en" }),
  });
  const payload = await res.json();
  if (payload.ok && payload.body && payload.body.length > 40) {
    console.log("PASS demo draft generation");
  } else {
    failures++;
    console.log(`FAIL demo draft generation: ${JSON.stringify(payload).slice(0, 120)}`);
  }
} catch (error) {
  failures++;
  console.log(`FAIL demo draft generation: ${error.message}`);
}

console.log(failures === 0 ? "SMOKE: all green" : `SMOKE: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
