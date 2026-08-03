import { FreelensApp } from "@/components/app/freelens-app";
import { BackLink } from "@/components/i18n/back-link";

export default function ToolPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--fl-canvas)]">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
        <BackLink />
      </div>
      <FreelensApp />
    </div>
  );
}
