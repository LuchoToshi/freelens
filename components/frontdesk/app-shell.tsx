"use client";

import { usePathname } from "next/navigation";
import { fdDict, type FrontdeskLocale } from "@/lib/frontdesk/i18n";

/**
 * The authenticated shell (master spec §5.2): one nav, five destinations,
 * one vocabulary. Persistent left rail from lg up, bottom bar below it —
 * the spec names 860px; this uses the workspace's existing lg boundary so
 * the shell and the two-pane inbox break at the same width (deviation
 * recorded in the phase log).
 *
 * Tools and Settings point at the surfaces that already own that scope
 * (the public calculator and the setup editor). Clients and Follow-ups are
 * real destinations with honest not-built-yet pages, not dead links.
 */
const DESTINATIONS = [
  { key: "inbox", href: "/inbox" },
  { key: "clients", href: "/clients" },
  { key: "followups", href: "/follow-ups" },
  { key: "tools", href: "/tool" },
  { key: "settings", href: "/setup" },
] as const;

export function AppShell({
  locale,
  children,
}: {
  locale: FrontdeskLocale;
  children: React.ReactNode;
}) {
  const t = fdDict(locale).inbox.shell;
  const pathname = usePathname() ?? "";

  const nav = (orientation: "side" | "bottom") => (
    <nav
      aria-label={t.navLabel}
      className={
        orientation === "side"
          ? "sticky top-0 hidden h-dvh w-44 shrink-0 flex-col gap-1 border-r border-[var(--fd-line)] px-3 py-8 lg:flex"
          : "fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-[var(--fd-line)] bg-white px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] lg:hidden"
      }
    >
      {DESTINATIONS.map(({ key, href }) => {
        const current = pathname === href || (key === "inbox" && pathname === "/inbox");
        return (
          <a
            key={key}
            href={href}
            aria-current={current ? "page" : undefined}
            className={`${
              orientation === "side"
                ? "rounded-xl px-3 py-2 text-sm"
                : "flex min-h-11 min-w-0 shrink items-center whitespace-nowrap rounded-lg px-1.5 py-2 text-xs"
            } ${
              current
                ? "bg-[var(--fd-paper)] font-semibold text-[var(--fd-ink)]"
                : "text-[var(--fd-slate)] hover:text-[var(--fd-ink)]"
            } focus-visible:ring-2 focus-visible:ring-[var(--fd-focus-ring)] focus-visible:outline-none`}
          >
            {t[key]}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {nav("side")}
      <div className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</div>
      {nav("bottom")}
    </div>
  );
}
