"use client";

import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import type { WeeklyPositionStatus } from "@/lib/domain/allocation";
import { useT } from "@/components/i18n/locale-provider";

// Status is conveyed by icon + text + tint together, never colour alone.
const STATUS_CONFIG: Record<
  WeeklyPositionStatus,
  { icon: typeof CheckCircle2; key: "reservesCovered" | "limitedRoom" | "reserveGap"; tint: string; text: string }
> = {
  "reserves-covered": {
    icon: CheckCircle2,
    key: "reservesCovered",
    tint: "var(--fl-good-tint)",
    text: "var(--fl-good-text)",
  },
  "limited-room": {
    icon: Info,
    key: "limitedRoom",
    tint: "var(--fl-tight-tint)",
    text: "var(--fl-tight-text)",
  },
  "reserve-gap": {
    icon: AlertCircle,
    key: "reserveGap",
    tint: "var(--fl-short-tint)",
    text: "var(--fl-short-text)",
  },
};

export function StatusBanner({
  status,
  detail,
}: {
  status: WeeklyPositionStatus;
  detail?: string;
}) {
  const t = useT();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-4"
      style={{ backgroundColor: config.tint, borderColor: "transparent" }}
      role="status"
    >
      <Icon
        className="mt-0.5 size-5 shrink-0"
        style={{ color: config.text }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold" style={{ color: config.text }}>
          {t.app.status[config.key]}
        </p>
        {detail && (
          <p className="text-sm text-[var(--fl-ink)]">{detail}</p>
        )}
      </div>
    </div>
  );
}
