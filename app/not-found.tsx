"use client";

import Link from "next/link";
import { container } from "@/components/container";
import { linkButtonClass } from "@/components/button-classes";
import { useDocumentTitle, useT } from "@/components/i18n/locale-provider";

export default function NotFound() {
  const t = useT();
  useDocumentTitle(t.notFound.title, t.notFound.body);
  return (
    <main className="min-h-screen bg-[var(--fl-canvas)] text-[var(--fl-text)]">
      <div className={`${container} flex flex-col items-start gap-4 py-24`}>
        <h1 className="font-serif text-3xl font-medium text-[var(--fl-ink)]">
          {t.notFound.title.split("·")[0].trim()}
        </h1>
        <p className="text-base text-[var(--fl-slate)]">{t.notFound.body}</p>
        <Link href="/" className={linkButtonClass}>
          {t.notFound.back}
        </Link>
      </div>
    </main>
  );
}
