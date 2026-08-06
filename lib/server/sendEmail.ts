/**
 * The one place the product sends email, and the only kind it sends:
 * a confirmation link to an address its owner just typed.
 *
 * Provider is Resend over plain fetch; no SDK. When the key is absent (local
 * dev, or the account not yet created) this returns false and the caller
 * still answers generically — a signup is stored as pending either way, so
 * nothing is lost, only unconfirmed. Log lines never contain the address.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("sendEmail: RESEND_API_KEY not set — mail not sent");
    return false;
  }
  const from = process.env.RESEND_FROM ?? "Freelens <onboarding@resend.dev>";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html }),
    });
    if (!response.ok) {
      console.error("sendEmail: provider returned", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("sendEmail: request failed", error instanceof Error ? error.message : "");
    return false;
  }
}
