import type { Metadata } from "next";
import { AccuracyPageBody } from "@/components/pages/accuracy-body";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.accuracyPage.metaTitle,
  description: en.accuracyPage.metaDescription,
};

export default function AccuracyPage() {
  return <AccuracyPageBody />;
}
