/**
 * Thin wrapper around the dedicated outreach Gmail account. Scope is
 * gmail.send only — gmail.readonly turned out to be a Restricted scope
 * requiring a CASA security review, wildly disproportionate for an
 * 8-message probe, so reply detection is a manual toggle in the admin
 * route instead of an automated inbox read. See waitlistSource/db for that.
 *
 * Credentials are absent until Ops provisions the account. Every export
 * throws a clear error rather than silently no-op-ing, so a misconfigured
 * deploy fails loudly instead of pretending to send.
 */
import { google } from "googleapis";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`outreach/gmail: ${name} is not set`);
  return value;
}

function client() {
  const auth = new google.auth.OAuth2(
    env("GMAIL_CLIENT_ID"),
    env("GMAIL_CLIENT_SECRET")
  );
  auth.setCredentials({ refresh_token: env("GMAIL_REFRESH_TOKEN") });
  return google.gmail({ version: "v1", auth });
}

function encodeMessage(input: { to: string; subject: string; body: string }): string {
  const from = env("GMAIL_FROM");
  const raw = [
    `From: ${from}`,
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    input.body,
  ].join("\r\n");
  return Buffer.from(raw).toString("base64url");
}

export async function sendOutreachMessage(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ gmailMessageId: string; gmailThreadId: string }> {
  const gmail = client();
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodeMessage(input) },
  });
  const gmailMessageId = res.data.id;
  const gmailThreadId = res.data.threadId;
  if (!gmailMessageId || !gmailThreadId) {
    throw new Error("outreach/gmail: send returned no message/thread id");
  }
  return { gmailMessageId, gmailThreadId };
}
