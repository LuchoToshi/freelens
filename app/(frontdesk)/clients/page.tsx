import type { Metadata } from "next";
import { DestinationPageBody } from "@/components/frontdesk/destination-page-body";

export const metadata: Metadata = {
  title: "FrontDesk clients",
  robots: { index: false, follow: false },
};

export default function ClientsPage() {
  return <DestinationPageBody destination="clients" />;
}
