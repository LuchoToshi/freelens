"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { container } from "@/components/container";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/components/i18n/locale-provider";
import { track } from "@/lib/analytics";

/**
 * One nav link, with a real current state.
 *
 * The underline means "this is the page you are on" and nothing else, backed
 * by `aria-current` so the same fact reaches a screen reader.
 */
function NavLink({
  href,
  pathname,
  onNavigate,
  onLinkClick,
  quiet,
  children,
}: {
  href: string;
  pathname: string | null;
  onNavigate?: () => void;
  onLinkClick?: () => void;
  quiet?: boolean;
  children: React.ReactNode;
}) {
  const current = pathname === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={() => {
        onLinkClick?.();
        onNavigate?.();
      }}
      className={`inline-flex min-h-11 items-center underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)] ${
        quiet
          ? "text-xs font-normal text-[var(--fd-slate)] hover:text-[var(--fd-ink)]"
          : current
            ? "text-sm font-medium text-[var(--fd-ink)] underline decoration-[var(--fd-ink)] decoration-2"
            : "text-sm font-medium text-[var(--fd-slate)] hover:text-[var(--fd-ink)]"
      }`}
    >
      {children}
    </Link>
  );
}

// The homepage sells one product (FrontDesk), so the primary nav carries no
// second-product entries: the wordmark is the way home, the calculators and
// rebooking surfaces keep their routes and their quiet footer links. Sign-in
// is for the invited testers who already have a handle, so it stays quiet —
// the hero's worked example is the product's real front door now.
const LINKS = [
  {
    href: "/setup",
    key: "tryDemo",
    quiet: true,
    onLinkClick: () => track("sign_in_clicked_nav"),
  },
  { href: "/about", key: "about", quiet: false, onLinkClick: undefined },
] as const;

/**
 * Sticky from 420px up; below that it scrolls with the page and the links
 * collapse behind a menu button, so nothing ever sits over content while
 * scrolling. The open panel is in normal flow — it pushes the page down
 * rather than covering it — and it closes on navigation and on scroll.
 */
export function SiteHeader() {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);

  return (
    <header className="fl-chrome relative border-b border-[var(--fd-line)] bg-[var(--fd-paper)]/85 backdrop-blur-sm min-[420px]:sticky min-[420px]:top-0 min-[420px]:z-40">
      <div className={`${container} flex items-center gap-x-4 py-2 sm:gap-x-5 sm:py-4`}>
        <Link
          href="/"
          className="mr-auto inline-flex min-h-11 items-center font-serif text-xl font-medium tracking-tight text-[var(--fd-ink)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)]"
        >
          {t.common.brand}
        </Link>

        <nav
          aria-label={t.common.nav.ariaLabel}
          className="hidden items-center gap-x-4 min-[420px]:flex sm:gap-x-5"
        >
          {LINKS.map(({ href, key, quiet, onLinkClick }) => (
            <NavLink key={href} href={href} pathname={pathname} quiet={quiet} onLinkClick={onLinkClick}>
              {t.common.nav[key]}
            </NavLink>
          ))}
        </nav>

        <LanguageSwitcher />

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={t.common.nav.menuLabel}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--fd-line-control)] text-[var(--fd-ink)] min-[420px]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fd-focus-ring)]"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label={t.common.nav.ariaLabel}
          className={`${container} flex flex-col gap-1 border-t border-[var(--fd-line)] pb-3 pt-2 min-[420px]:hidden`}
        >
          {LINKS.map(({ href, key, quiet, onLinkClick }) => (
            <NavLink
              key={href}
              href={href}
              pathname={pathname}
              quiet={quiet}
              onNavigate={() => setOpen(false)}
              onLinkClick={onLinkClick}
            >
              {t.common.nav[key]}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
