import type { Metadata } from "next";
import { AdminPageBody } from "@/components/frontdesk/admin-page-body";

export const metadata: Metadata = {
  title: "FrontDesk",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageBody />;
}
