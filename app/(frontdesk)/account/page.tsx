import type { Metadata } from "next";
import { AccountPageBody } from "@/components/frontdesk/account-page-body";

export const metadata: Metadata = {
  title: "Freelens account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountPageBody />;
}
