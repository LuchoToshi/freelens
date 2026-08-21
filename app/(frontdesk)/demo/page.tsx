import type { Metadata } from "next";
import { DemoApp } from "@/components/frontdesk/demo-app";

export const metadata: Metadata = {
  title: "FrontDesk demo",
  description: "Try FrontDesk with sample data. No account needed, nothing is saved.",
};

export default function DemoPage() {
  return <DemoApp />;
}
