import type { Metadata } from "next";
import { DestinationPageBody } from "@/components/frontdesk/destination-page-body";

export const metadata: Metadata = {
  title: "FrontDesk follow-ups",
  robots: { index: false, follow: false },
};

export default function FollowUpsPage() {
  return <DestinationPageBody destination="followups" />;
}
