/**
 * Event names, and nothing else.
 *
 * Freelens holds a person's income. The promise on every page is that their
 * numbers stay on their device, so the analytics boundary is not a policy to
 * remember, it is a shape: `track` takes a name from a closed list and has no
 * second parameter. There is no way to attach an amount to an event because
 * there is nowhere to put one.
 *
 * That is deliberate over a properties bag with a review rule. A reviewer has
 * to notice; a missing parameter cannot be forgotten.
 *
 * Delivery is Vercel Web Analytics, which is cookieless and stores no personal
 * data. When the script has not loaded, which is every local run and every
 * blocked client, this is a no-op rather than an error.
 */

/** Every event this product may ever send. Adding one is a deliberate act. */
export type AnalyticsEvent =
  | "year_position_counted"
  | "year_position_undone"
  | "year_position_prefilled"
  | "year_position_reset"
  | "waitlist_submitted"
  | "quote_calculated"
  | "quote_saved"
  | "quote_won"
  | "quote_lost"
  | "quote_reopened"
  | "voice_confirmed"
  | "setup_completed"
  | "draft_sent"
  | "draft_copied"
  | "draft_skipped"
  | "draft_regenerated"
  | "try_demo_clicked_hero"
  | "try_demo_clicked_nav";

type VercelAnalytics = (
  command: "event",
  payload: { name: string }
) => void;

declare global {
  interface Window {
    va?: VercelAnalytics;
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    window.va?.("event", { name: event });
  } catch {
    // Analytics must never be able to break a calculation.
  }
}
