import type { Metadata } from "next";
import { TryApp } from "@/components/try/try-app";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.meta.try.title,
  description: en.meta.try.description,
};

export default function TryPage() {
  return <TryApp />;
}
