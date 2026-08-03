"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { useT } from "@/components/i18n/locale-provider";

type GroupId = "number" | "vat" | "privacy";

/**
 * Which question belongs to which tab. Kept as ids next to the dictionary keys
 * rather than as translated group names, so grouping survives translation: a
 * Dutch label must never be able to orphan a question.
 */
const FAQ_ORDER: { group: GroupId; key: string }[] = [
  { group: "number", key: "finalBill" },
  { group: "number", key: "onePayment" },
  { group: "number", key: "reservePct" },
  { group: "number", key: "balance" },
  { group: "number", key: "bookkeeping" },
  { group: "number", key: "provisional" },
  { group: "number", key: "howOften" },
  { group: "vat", key: "vatHow" },
  { group: "vat", key: "kor" },
  { group: "vat", key: "reverseCharged" },
  { group: "vat", key: "inputVat" },
  { group: "vat", key: "zvw" },
  { group: "privacy", key: "storeData" },
  { group: "privacy", key: "deleteData" },
  { group: "privacy", key: "bank" },
];

const GROUP_IDS: GroupId[] = ["number", "vat", "privacy"];

function PlusIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1.5 8h13M8 14.5v-13" />
    </svg>
  );
}

export function FaqSection() {
  const t = useT();
  const [group, setGroup] = useState<GroupId>("number");

  const items = t.home.faq.items as Record<string, { q: string; a: string }>;
  const shown = FAQ_ORDER.filter((f) => f.group === group).map((f) => items[f.key]);

  return (
    <section
      id="faq"
      aria-label={t.home.faq.ariaLabel}
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          {t.home.faq.eyebrow}
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          {t.home.faq.heading}
        </h2>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label={t.home.faq.topicsLabel}
        >
          {GROUP_IDS.map((g) => {
            const active = group === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(g)}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)] ${
                  active
                    ? "border-[var(--fl-ink)] bg-[var(--fl-ink)] text-white"
                    : "border-[var(--fl-line)] bg-white text-[var(--fl-ink)] hover:border-[var(--fl-ink)]"
                }`}
              >
                {t.home.faq.groups[g]}
              </button>
            );
          })}
        </div>

        <Accordion.Root
          key={group}
          className="mt-8 flex flex-col border-t border-[var(--fl-line)]"
        >
          {shown.map(({ q, a }) => (
            <Accordion.Item key={q} className="border-b border-[var(--fl-line)]">
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-12 w-full items-center justify-between gap-4 bg-transparent py-4 text-left text-base font-medium text-[var(--fl-ink)] select-none hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                  {q}
                  <PlusIcon className="shrink-0 text-[var(--fl-slate)] transition-transform duration-150 ease-out group-data-panel-open:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0">
                <p className="max-w-xl pb-5 leading-relaxed text-[var(--fl-slate)]">
                  {a}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <p className="mt-8 text-sm text-[var(--fl-slate)]">
          {t.home.faq.footnotePrefix}{" "}
          <Link
            href="/accuracy"
            className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            {t.home.faq.footnoteLink}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
