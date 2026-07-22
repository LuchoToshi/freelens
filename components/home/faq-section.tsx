"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";

type Group = "Your number" | "VAT and reserve" | "Privacy and safety";

const GROUPS: Group[] = ["Your number", "VAT and reserve", "Privacy and safety"];

const FAQS: { group: Group; question: string; answer: string }[] = [
  {
    group: "Your number",
    question: "Does Freelens calculate my final tax bill?",
    answer:
      "No. Freelens helps you set aside a cautious reserve and see your position. Your final income tax depends on your annual taxable profit, deductions, credits, and personal circumstances, which only the Belastingdienst or your accountant can settle.",
  },
  {
    group: "Your number",
    question: "Why can't Freelens know my exact income tax from one payment?",
    answer:
      "Income tax is based on your whole year's taxable profit, not a single payment or your bank balance. A percentage applied to a payment is a reserve rule, not a calculation of what you owe.",
  },
  {
    group: "Your number",
    question: "What does the reserve percentage mean?",
    answer:
      "It's the share of a payment (or your profit) you choose to keep aside for income tax and Zvw. Freelens applies it consistently. It's a planning rule you control, not an official figure.",
  },
  {
    group: "Your number",
    question: "Why is my bank balance not my salary?",
    answer:
      "Because part of it belongs to the tax authority, part may be VAT, part is needed to run the business, and part should stay as a buffer. What's genuinely yours to pay yourself is what remains after all of that.",
  },
  {
    group: "Your number",
    question: "Does Freelens replace bookkeeping?",
    answer:
      "No. Freelens is a planning and reserve tool. It doesn't record transactions, file returns, or replace bookkeeping software or an accountant.",
  },
  {
    group: "Your number",
    question: "What is a provisional assessment?",
    answer:
      "A voorlopige aanslag is an estimate from the Belastingdienst of the tax you'll owe this year, often paid in instalments. If you have one, you can enter its amount as your reserve method.",
  },
  {
    group: "Your number",
    question: "How often should I update my numbers?",
    answer:
      "A weekly check-in keeps your position current. Freelens flags when your last check-in is getting old so you know when it's worth a refresh.",
  },
  {
    group: "VAT and reserve",
    question: "How does VAT work in Freelens?",
    answer:
      "For a 21% or 9% payment, Freelens separates the VAT from the amount so you don't treat it as income. It labels it as VAT to keep aside — your actual VAT return may be lower or higher after deductible input VAT and other transactions.",
  },
  {
    group: "VAT and reserve",
    question: "What happens if I use the KOR?",
    answer:
      "If you pick the KOR treatment, Freelens adds no VAT to the payment. Under the KOR you generally don't charge VAT or file ordinary VAT returns, and input VAT is generally not deductible while participating.",
  },
  {
    group: "VAT and reserve",
    question: "What if VAT is reverse-charged?",
    answer:
      "Pick the reverse-charged treatment and Freelens won't treat any VAT as collected. Confirm the transaction in your bookkeeping — reverse-charged VAT isn't ordinary output VAT.",
  },
  {
    group: "VAT and reserve",
    question: "Does Freelens account for deductible input VAT?",
    answer:
      "Not automatically from a single payment. You can enter your actual VAT position from your bookkeeping in the weekly check-in, which is often more accurate than adding up VAT payment by payment.",
  },
  {
    group: "VAT and reserve",
    question: "What is the Zvw contribution?",
    answer:
      "The income-dependent contribution to the Health Care Insurance Act. It can apply on top of income tax and national insurance, up to a maximum contribution income. Freelens shows it as its own line in the guided estimate.",
  },
  {
    group: "Privacy and safety",
    question: "Does Freelens store my financial data?",
    answer:
      "Only on your own device, in your browser, and only when you choose to save. Nothing is uploaded to Freelens.",
  },
  {
    group: "Privacy and safety",
    question: "Can I delete my saved information?",
    answer:
      "Yes. There's a clear “Clear saved data” option that removes everything Freelens has stored on your device, after a confirmation.",
  },
  {
    group: "Privacy and safety",
    question: "Do I need to connect my bank?",
    answer:
      "No. There are no bank connections and no account. You enter the numbers yourself, and they stay on your device.",
  },
];

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
  const [group, setGroup] = useState<Group>("Your number");
  const shown = FAQS.filter((f) => f.group === group);

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fl-slate)]">
          Questions
        </span>
        <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Questions worth answering first.
        </h2>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Question topics"
        >
          {GROUPS.map((g) => {
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
                {g}
              </button>
            );
          })}
        </div>

        <Accordion.Root
          key={group}
          className="mt-8 flex flex-col border-t border-[var(--fl-line)]"
        >
          {shown.map(({ question, answer }) => (
            <Accordion.Item
              key={question}
              className="border-b border-[var(--fl-line)]"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-12 w-full items-center justify-between gap-4 bg-transparent py-4 text-left text-base font-medium text-[var(--fl-ink)] select-none hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-focus-ring)]">
                  {question}
                  <PlusIcon className="shrink-0 text-[var(--fl-slate)] transition-transform duration-150 ease-out group-data-panel-open:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-sm transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0">
                <p className="max-w-xl pb-5 leading-relaxed text-[var(--fl-slate)]">
                  {answer}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <p className="mt-8 text-sm text-[var(--fl-slate)]">
          More detail on the rules and official sources is on the{" "}
          <Link
            href="/accuracy"
            className="font-medium text-[var(--fl-ink)] underline decoration-[var(--fl-line)] underline-offset-4 hover:decoration-[var(--fl-ink)]"
          >
            accuracy page
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
