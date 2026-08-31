import type { Metadata } from "next";
import { HomePageBody } from "@/components/frontdesk/home-page-body";

export const metadata: Metadata = {
  title: "Freelens home",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <HomePageBody />;
}
