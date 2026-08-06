"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { container } from "@/components/container";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/components/i18n/locale-provider";

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
  children,
}: {
  href: string;
  pathname: string | null;
  onNavigate?: () => void;
  children: React.ReactNode;
}) {
  const current = pathname === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={`inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
        current
          ? "text-[var(--fl-ink)] underline decoration-[var(--fl-ink)] decoration-2"
          : "text-[var(--fl-slate)] hover:text-[var(--fl-ink)]"
      }`}
    >
      {children}
    </Link>
  );
}

const LINKS = [
  { href: "/", key: "rebooking" },
  { href: "/rekentools", key: "tools" },
  { href: "/about", key: "about" },
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
    <header className="fl-chrome relative border-b border-[var(--fl-line)] bg-[var(--fl-canvas)]/85 backdrop-blur-sm min-[420px]:sticky min-[420px]:top-0 min-[420px]:z-40">
      <div className={`${container} flex items-center gap-x-4 py-2 sm:gap-x-5 sm:py-4`}>
        <Link
          href="/"
          className="mr-auto inline-flex min-h-11 items-center font-serif text-xl font-medium tracking-tight text-[var(--fl-ink)] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
        >
          {t.common.brand}
        </Link>

        <nav
          aria-label={t.common.nav.ariaLabel}
          className="hidden items-center gap-x-4 min-[420px]:flex sm:gap-x-5"
        >
          {LINKS.map(({ href, key }) => (
            <NavLink key={href} href={href} pathname={pathname}>
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
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--fl-line-control)] text-[var(--fl-ink)] min-[420px]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]"
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
          className={`${container} flex flex-col gap-1 border-t border-[var(--fl-line)] pb-3 pt-2 min-[420px]:hidden`}
        >
          {LINKS.map(({ href, key }) => (
            <NavLink
              key={href}
              href={href}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            >
              {t.common.nav[key]}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
