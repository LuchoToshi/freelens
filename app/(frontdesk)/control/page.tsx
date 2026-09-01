import type { Metadata } from "next";
import { ControlPageBody } from "@/components/frontdesk/control-page-body";

export const metadata: Metadata = {
  title: "Freelens control room",
  robots: { index: false, follow: false },
};

export default function ControlPage() {
  return <ControlPageBody />;
}
