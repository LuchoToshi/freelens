"use client";

import { usePathname } from "next/navigation";
import { chromeVariant } from "@/lib/frontdesk/handles";

/**
 * Keeps the Freelens site chrome off FrontDesk surfaces.
 *
 * The client of a freelancer never sees the product name, and a FrontDesk
 * tester is never led into the rest of the site mid-test — so on /inbox,
 * /setup, /admin and every /[handle] page, the header and footer this
 * component wraps simply do not render. Everywhere else it is a pass-through.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (chromeVariant(pathname ?? "") === "app") return null;
  return <>{children}</>;
}
