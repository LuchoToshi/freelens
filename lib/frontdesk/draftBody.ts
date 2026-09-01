/**
 * The one place that turns a draft body into what leaves the product.
 *
 * The handoff requires the draft shown in the decision panel to be the exact
 * string the mailto and the clipboard carry (§6, §16). Keeping the mailto
 * construction here — rather than inline in a component — is what lets a test
 * assert that byte-equality, and stops a second surface inventing its own
 * encoding.
 *
 * The only transformation is the CRLF line ending mail clients expect; the
 * body itself, including the freelancer's sign-off, is never touched (§8
 * sign-off integrity).
 */
export function mailtoHref(email: string, subject: string, body: string): string {
  const crlf = body.replace(/\n/g, "\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

/** What the clipboard receives: the body, unchanged. */
export function clipboardBody(body: string): string {
  return body;
}

/** The body a mailto href carries, decoded back — the assertion hook for tests. */
export function bodyFromMailto(href: string): string {
  const marker = "&body=";
  const start = href.indexOf(marker);
  if (start === -1) return "";
  return decodeURIComponent(href.slice(start + marker.length)).replace(/\r\n/g, "\n");
}
