import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b-4 border-black bg-white">
      <div className="mx-auto flex max-w-7xl items-center px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="font-mono text-lg font-black uppercase tracking-normal hover:underline"
        >
          Freelens
        </Link>
      </div>
    </header>
  );
}
