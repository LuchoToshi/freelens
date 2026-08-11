import type { Metadata } from "next";
import { SetupPageBody } from "@/components/frontdesk/setup-page-body";

export const metadata: Metadata = {
  title: "FrontDesk setup",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  return <SetupPageBody />;
}
