import type { Metadata } from "next";
import { AgentHomeBody } from "@/components/pages/agent-home-body";
import { en } from "@/lib/i18n/en";

/**
 * Server route so the agent positioning ships in the server-rendered
 * <title> and description. The page body is a client component; setting the
 * title from a hook only updated it after hydration, which left crawlers and
 * link previews reading the old speed-positioning metadata.
 */
export const metadata: Metadata = {
  title: en.meta.agent.title,
  description: en.meta.agent.description,
};

export default function AgentPage() {
  return <AgentHomeBody />;
}
