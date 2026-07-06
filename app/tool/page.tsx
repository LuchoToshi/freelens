import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SafeToSpend } from "@/components/safe-to-spend";

export default function ToolPage() {
  return (
    <div className="flex flex-1 flex-col bg-[#f6f1df]">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase text-[#0057ff] hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back
        </Link>
      </div>
      <SafeToSpend />
    </div>
  );
}
