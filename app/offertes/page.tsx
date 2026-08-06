import type { Metadata } from "next";
import { OffertesPageBody } from "@/components/pages/offertes-body";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.meta.offertes.title,
  description: en.meta.offertes.description,
};

export default function OffertesPage() {
  return <OffertesPageBody />;
}
