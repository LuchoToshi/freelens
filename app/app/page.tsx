import type { Metadata } from "next";
import { AgentApp } from "@/components/agent/agent-app";

export const metadata: Metadata = {
  title: "Freelens Rebooking",
  description: "Private beta.",
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <AgentApp />;
}
