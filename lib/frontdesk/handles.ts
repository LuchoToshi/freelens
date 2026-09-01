/**
 * Handle rules, shared by the public route, the setup wizard, and the chrome
 * gate. The same shape lives as a CHECK constraint on freelancers.handle, so
 * the database refuses what this module refuses.
 */
export const HANDLE_SHAPE = /^[a-z0-9][a-z0-9-]{2,29}$/;

/**
 * Every existing root segment plus FrontDesk's own routes plus generic bait.
 * A handle in this set can never be claimed, so /[handle] never shadows a
 * real page even if the router ever changed its precedence rules.
 */
export const RESERVED_HANDLES = new Set([
  "about",
  "accuracy",
  "admin",
  "api",
  "app",
  "control",
  "demo",
  "frontdesk",
  "freelens",
  "inbox",
  "mail",
  "methodology",
  "offertes",
  "privacy",
  "rekentools",
  "setup",
  "tarief",
  "tool",
  "try",
  "www",
]);

export function isValidHandle(handle: string): boolean {
  return HANDLE_SHAPE.test(handle) && !RESERVED_HANDLES.has(handle);
}

/**
 * Is this pathname a FrontDesk surface? Used by the site-chrome gate: the
 * client never sees the product name, so Freelens header and footer stay off
 * these paths entirely.
 */
export function isFrontdeskPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) return false;
  const [first] = segments;
  if (
    first === "inbox" ||
    first === "setup" ||
    first === "admin" ||
    first === "demo" ||
    first === "home" ||
    first === "control" ||
    first === "clients" ||
    first === "follow-ups"
  ) {
    return true;
  }
  return isValidHandle(first);
}

/**
 * The single route-classification source for site chrome. Register new
 * routes here — nowhere else.
 *
 *   "app"       → FrontDesk product surfaces (/[handle], /inbox, /setup,
 *                 /admin, /demo): no Freelens chrome at all (ChromeGate).
 *   "frontdesk" → FrontDesk marketing pages: FrontDesk footer variant
 *                 (wordmark, About, Privacy, trust line).
 *   "legacy"    → everything else, including unknown routes: the original
 *                 Freelens footer with the calculator links and tax strip.
 */
export type ChromeVariant = "app" | "frontdesk" | "legacy";

const FRONTDESK_MARKETING_PATHS = new Set(["/", "/about"]);

export function chromeVariant(pathname: string): ChromeVariant {
  if (isFrontdeskPath(pathname)) return "app";
  if (FRONTDESK_MARKETING_PATHS.has(pathname)) return "frontdesk";
  return "legacy";
}
