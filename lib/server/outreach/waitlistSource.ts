/**
 * Pulls confirmed waitlist signups in as outreach candidates. These people
 * already gave Freelens their email and asked to hear from us — a warm,
 * consented list, unlike cold-sourced FB/LinkedIn contacts.
 */
import { list, get } from "@vercel/blob";
import type { WaitlistRecord } from "@/lib/server/waitlist";
import { addCandidateContact } from "./db";

const CONFIRMED_PREFIX = "waitlist/confirmed/";

export async function syncWaitlistCandidates(): Promise<{ found: number }> {
  const { blobs } = await list({ prefix: CONFIRMED_PREFIX });

  let found = 0;
  for (const blob of blobs) {
    const download = await get(blob.pathname, { access: "private", useCache: false });
    if (!download || download.statusCode !== 200) continue;
    const record = JSON.parse(await new Response(download.stream).text()) as WaitlistRecord;
    await addCandidateContact({ email: record.email, name: record.name, source: "waitlist" });
    found += 1;
  }
  return { found };
}
