import type { Metadata } from "next";
import { MethodologyPageBody } from "@/components/pages/methodology-body";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.methodologyPage.metaTitle,
  description: en.methodologyPage.metaDescription,
};

export default function MethodologyPage() {
  return <MethodologyPageBody />;
}
