import type { Metadata } from "next";
import { AboutPageBody } from "@/components/pages/about-body";
import { en } from "@/lib/i18n/en";

export const metadata: Metadata = {
  title: en.meta.about.title,
  description: en.meta.about.description,
};

export default function AboutPage() {
  return <AboutPageBody />;
}
