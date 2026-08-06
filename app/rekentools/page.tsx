import type { Metadata } from "next";
import { RekentoolsPageBody } from "@/components/pages/rekentools-body";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.meta.rekentools.title,
  description: en.meta.rekentools.description,
};

export default function RekentoolsPage() {
  return <RekentoolsPageBody />;
}
