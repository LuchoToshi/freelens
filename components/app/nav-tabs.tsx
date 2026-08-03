"use client";

import { useRef } from "react";
import { Compass, ArrowDownToLine, CalendarCheck, Scale } from "lucide-react";
import { ModeCard, type ModeAccent } from "@/components/design/mode-card";
import { useT } from "@/components/i18n/locale-provider";

export type AppView =
  | "overview"
  | "setup"
  | "money-arrived"
  | "weekly-checkin"
  | "decision";

type TabId = Exclude<AppView, "setup">;

const ACCENTS: Record<TabId, ModeAccent> = {
  overview: {
    fill: "var(--fl-reserve-fill)",
    tint: "var(--fl-reserve-tint)",
    text: "var(--fl-reserve-text)",
  },
  "money-arrived": {
    fill: "var(--fl-vat-fill)",
    tint: "var(--fl-vat-tint)",
    text: "var(--fl-vat-text)",
  },
  "weekly-checkin": {
    fill: "var(--fl-payout-fill)",
    tint: "var(--fl-payout-tint)",
    text: "var(--fl-payout-text)",
  },
  decision: {
    fill: "var(--fl-decision-fill)",
    tint: "var(--fl-decision-tint)",
    text: "var(--fl-decision-text)",
  },
};

const TABS: { id: TabId; key: "overview" | "moneyArrived" | "weeklyCheckin" | "decision"; icon: typeof Compass }[] = [
  { id: "overview", key: "overview", icon: Compass },
  { id: "money-arrived", key: "moneyArrived", icon: ArrowDownToLine },
  { id: "weekly-checkin", key: "weeklyCheckin", icon: CalendarCheck },
  { id: "decision", key: "decision", icon: Scale },
];

/**
 * The four calculator modes as bold, color-coded workspace cards (audit M1).
 * Implements the ARIA tabs keyboard pattern: roving tabindex on the active card,
 * arrow / Home / End move focus and selection. Desktop shows a 4-across strip;
 * mobile a 2x2 grid.
 */
export function NavTabs({
  view,
  onChange,
}: {
  view: TabId;
  onChange: (next: TabId) => void;
}) {
  const t = useT();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number) => {
    const i = TABS.findIndex((t) => t.id === view);
    const next = (i + delta + TABS.length) % TABS.length;
    onChange(TABS[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(TABS[0].id);
      refs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(TABS[TABS.length - 1].id);
      refs.current[TABS.length - 1]?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={t.app.navTabs.ariaLabel}
      onKeyDown={onKeyDown}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {TABS.map((tab, i) => (
        <ModeCard
          key={tab.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          index={i + 1}
          title={t.app.navTabs[tab.key].title}
          description={t.app.navTabs[tab.key].description}
          icon={tab.icon}
          accent={ACCENTS[tab.id]}
          active={view === tab.id}
          id={`tab-${tab.id}`}
          controls="app-panel"
          onSelect={() => onChange(tab.id)}
        />
      ))}
    </div>
  );
}
