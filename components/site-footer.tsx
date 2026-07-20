import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--fl-line)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link
          href="/"
          className="font-serif text-lg font-medium tracking-tight text-[var(--fl-ink)] hover:opacity-80"
        >
          Freelens
        </Link>
        <p className="text-sm text-[var(--fl-slate)]">
          Not tax advice. A clear estimate to work from. Your numbers never
          leave your browser.
        </p>
      </div>
    </footer>
  );
}
