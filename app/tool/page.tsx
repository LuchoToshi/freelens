import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FreelensApp } from "@/components/app/freelens-app";

export default function ToolPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--fl-canvas)]">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--fl-ink)] hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back
        </Link>
      </div>
      <FreelensApp />
    </div>
  );
}
