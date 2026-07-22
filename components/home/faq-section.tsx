"use client";

import { Accordion } from "@base-ui/react/accordion";

const FAQS = [
  {
    question: "Does Freelens calculate my final tax bill?",
    answer:
      "No. Freelens helps you set aside a cautious reserve and see your position. Your final income tax depends on your annual taxable profit, deductions, credits, and personal circumstances, which only the Belastingdienst or your accountant can settle.",
  },
  {
    question: "Why can't Freelens know my exact income tax from one payment?",
    answer:
      "Income tax is based on your whole year's taxable profit, not a single payment or your bank balance. A percentage applied to a payment is a reserve rule, not a calculation of what you owe.",
  },
  {
    question: "What does the reserve percentage mean?",
    answer:
      "It's the share of a payment (or your profit) you choose to keep aside for income tax and Zvw. Freelens applies it consistently. It's a planning rule you control, not an official figure.",
  },
  {
    question: "How does VAT work in Freelens?",
    answer:
      "For a 21% or 9% payment, Freelens separates the VAT from the amount so you don't treat it as income. It labels it as VAT to keep aside — your actual VAT return may be lower or higher after deductible input VAT and other transactions.",
  },
  {
    question: "What happens if I use the KOR?",
    answer:
      "If you pick the KOR treatment, Freelens adds no VAT to the payment. Under the KOR you generally don't charge VAT or file ordinary VAT returns, and input VAT is generally not deductible while participating.",
  },
  {
    question: "What if VAT is reverse-charged?",
    answer:
      "Pick the reverse-charged treatment and Freelens won't treat any VAT as collected. Confirm the transaction in your bookkeeping — reverse-charged VAT isn't ordinary output VAT.",
  },
  {
    question: "Does Freelens account for deductible input VAT?",
    answer:
      "Not automatically from a single payment. You can enter your actual VAT position from your bookkeeping in the weekly check-in, which is often more accurate than adding up VAT payment by payment.",
  },
  {
    question: "What is the Zvw contribution?",
    answer:
      "The income-dependent contribution to the Health Care Insurance Act. It can apply on top of income tax and national insurance, up to a maximum contribution income. Freelens shows it as its own line in the guided estimate.",
  },
  {
    question: "Why is my bank balance not my salary?",
    answer:
      "Because part of it belongs to the tax authority, part may be VAT, part is needed to run the business, and part should stay as a buffer. What's genuinely yours to pay yourself is what remains after all of that.",
  },
  {
    question: "Does Freelens replace bookkeeping?",
    answer:
      "No. Freelens is a planning and reserve tool. It doesn't record transactions, file returns, or replace bookkeeping software or an accountant.",
  },
  {
    question: "Does Freelens store my financial data?",
    answer:
      "Only on your own device, in your browser, and only when you choose to save. Nothing is uploaded to Freelens.",
  },
  {
    question: "Can I delete my saved information?",
    answer:
      "Yes. There's a clear “Clear saved data” option that removes everything Freelens has stored on your device, after a confirmation.",
  },
  {
    question: "Do I need to connect my bank?",
    answer:
      "No. There are no bank connections and no account. You enter the numbers yourself, and they stay on your device.",
  },
  {
    question: "What is a provisional assessment?",
    answer:
      "A voorlopige aanslag is an estimate from the Belastingdienst of the tax you'll owe this year, often paid in instalments. If you have one, you can enter its amount as your reserve method.",
  },
  {
    question: "How often should I update my numbers?",
    answer:
      "A weekly check-in keeps your position current. Freelens flags when your last check-in is getting old so you know when it's worth a refresh.",
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
  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="border-t border-[var(--fl-line)]"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <h2 className="font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--fl-ink)] sm:text-4xl">
          Questions worth answering first.
        </h2>

        <Accordion.Root className="mt-10 flex flex-col border-t border-[var(--fl-line)]">
          {FAQS.map(({ question, answer }) => (
            <Accordion.Item
              key={question}
              className="border-b border-[var(--fl-line)]"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-12 w-full items-center justify-between gap-4 bg-transparent py-4 text-left text-base font-medium text-[var(--fl-ink)] select-none hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fl-ink)]">
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
      </div>
    </section>
  );
}
