import type { Metadata } from "next";
import { PrivacyPageBody } from "@/components/pages/privacy-body";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.meta.privacy.title,
  description: en.meta.privacy.description,
};

export default function PrivacyPage() {
  return <PrivacyPageBody />;
}
