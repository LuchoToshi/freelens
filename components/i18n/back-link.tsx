"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/components/i18n/locale-provider";

/**
 * The "Back" affordance on the tool and rate pages.
 *
 * Its own client component because the pages that use it are server components
 * carrying a `metadata` export, and those two cannot live in one file.
 */
export function BackLink({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  const t = useT();
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${className}`}
    >
      <ArrowLeft className="size-3.5" aria-hidden="true" />
      {t.common.back}
    </Link>
  );
}
