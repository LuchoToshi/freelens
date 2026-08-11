import type { Metadata } from "next";
import { InboxPageBody } from "@/components/frontdesk/inbox-page-body";

export const metadata: Metadata = {
  title: "FrontDesk inbox",
  robots: { index: false, follow: false },
};

export default function InboxPage() {
  return <InboxPageBody />;
}
