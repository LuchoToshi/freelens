"use client";

import { Accordion } from "@base-ui/react/accordion";

const FAQS = [
  {
    question: "How accurate is the number?",
    answer:
      "It's a clear estimate based on what you enter: your balance, costs, tax rate, and buffer. The math is simple and visible, not a black box.",
  },
  {
    question: "Is this tax advice?",
    answer:
      "No. It's a working estimate to plan from, not filed advice. For anything official, check with the Belastingdienst or your accountant.",
  },
  {
    question: "Do you store my numbers?",
    answer:
      "Only on your own device, in your browser's local storage, if you choose to save a check-in. Nothing is sent to a server.",
  },
  {
    question: "Do I need an account?",
    answer: "No. Open the calculator, enter your numbers, get your answer.",
  },
  {
    question: "Is it really free?",
    answer: "Yes. No signup, no trial, no catch.",
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
          A few things worth knowing.
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
