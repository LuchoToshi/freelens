import { FreelensApp } from "@/components/app/freelens-app";
import { BackLink } from "@/components/i18n/back-link";
import { container } from "@/components/container";

export default function ToolPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--fl-canvas)]">
      <div className={`${container} pt-6`}>
        <BackLink />
      </div>
      <FreelensApp />
    </div>
  );
}
