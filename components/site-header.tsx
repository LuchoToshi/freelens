import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--fl-line)] bg-[var(--fl-canvas)]/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-medium tracking-tight text-[var(--fl-ink)] hover:opacity-80"
        >
          Freelens
        </Link>
        <Link
          href="/tool"
          className="text-sm font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
        >
          Get my number
        </Link>
      </div>
    </header>
  );
}
