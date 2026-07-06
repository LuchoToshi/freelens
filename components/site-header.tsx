import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[#e3e1da] bg-[#faf9f6]">
      <div className="mx-auto flex max-w-5xl items-center px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[#122540] hover:opacity-80"
        >
          Freelens
        </Link>
      </div>
    </header>
  );
}
