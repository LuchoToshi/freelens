"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

const EMAIL_STORAGE_KEY = "freelens.checkin-reminder-email";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckInReminderForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    // Stored locally for now, MVP-only. Swap this for a real signup
    // endpoint (a Vercel API route backed by an email service, or a
    // waitlist tool like Loops/ConvertKit) before this goes out to users.
    window.localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
    setError(null);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm font-medium text-[#122540]">
        You&apos;re on the list — we&apos;ll remind you next month.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div className="flex flex-col gap-1">
        <Input
          type="text"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border-[#d8d5cd] bg-white sm:w-64"
        />
        {error && (
          <p className="text-xs font-medium text-[#b8362b]">{error}</p>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#122540] px-4 text-sm font-medium text-white transition hover:bg-[#0d1b30]"
      >
        Get reminders
      </button>
    </form>
  );
}
