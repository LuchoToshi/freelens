/**
 * The request bar's brain (addendum §2.3): outcome in, work object out.
 *
 * understand → answer directly (trivial, read-only, from the account's own
 * rows with literal numbers) · propose a plan (only over the two actions the
 * permission model lets the agent execute today: preparing reply and
 * follow-up drafts) · ask ONE focused clarifying question with counted
 * evidence · or say plainly what it cannot do yet.
 *
 * Ceilings are structural: the model can only PROPOSE from a closed action
 * vocabulary, and the executor re-checks `isPermitted` per step server-side,
 * so a work object can never smuggle an action past its ceiling (§2.2).
 * Client email addresses never enter the prompt (§10.2).
 */
import { serviceClient } from "@/lib/frontdesk/server/clients";

const MODEL = process.env.FRONTDESK_DRAFT_MODEL ?? "claude-sonnet-5";

export interface AgentStep {
  action: "prepare_reply" | "prepare_followup";
  inquiry_id: string;
  label: string;
  state: "pending" | "done" | "failed" | "skipped";
  note?: string;
}

export interface Understanding {
  read_as: string;
  kind: "answer" | "plan" | "clarify" | "cannot";
  answer?: string;
  clarify_question?: string;
  cannot_reason?: string;
  steps?: AgentStep[];
}

const SYSTEM = `You are Freelens, a freelancer's front desk agent. You speak in first person as Freelens, plainly, no hype, no emoji. Numbers must be literal counts from the data given, never estimates.

You receive the freelancer's request plus a snapshot of their inquiries. Respond with ONLY a JSON object, no fences:
{"read_as": "<one sentence: how you read the request>",
 "kind": "answer" | "plan" | "clarify" | "cannot",
 "answer": "<for kind=answer: the direct reply, literal numbers, cite which inquiries by client first name>",
 "clarify_question": "<for kind=clarify: ONE focused question with counted evidence from the snapshot>",
 "cannot_reason": "<for kind=cannot: what you can't do yet and the nearest thing you CAN do>",
 "steps": [{"action": "prepare_reply"|"prepare_followup", "inquiry_id": "<id from snapshot>", "label": "<step in plain words>"}]}

Rules:
- kind=answer only for read-only questions answerable from the snapshot.
- kind=plan only when the request maps to the two available actions: preparing a reply draft or preparing a follow-up draft for specific inquiries in the snapshot. Steps execute only after the freelancer approves the plan.
- You can never send anything, state or change a price, confirm a date, or close a lead. If asked to, kind=cannot and say what stays with the freelancer.
- kind=clarify only if the account genuinely cannot answer the ambiguity; include the counts that make the question concrete.
- Respond in the freelancer's language ({language}).`;

export interface SnapshotInquiry {
  id: string;
  client_name: string;
  status: string;
  event_type: string;
  event_date: string | null;
  created_at: string;
  replied_at: string | null;
  message: string | null;
}

export function buildSnapshot(inquiries: SnapshotInquiry[], now: Date): string {
  const lines = inquiries.slice(0, 40).map((i) => {
    const quietDays = i.replied_at
      ? Math.floor((now.getTime() - new Date(i.replied_at).getTime()) / 86_400_000)
      : null;
    return JSON.stringify({
      id: i.id,
      client: i.client_name.split(" ")[0],
      status: i.status,
      type: i.event_type,
      event_date: i.event_date,
      days_since_reply: quietDays,
      message: (i.message ?? "").slice(0, 200),
    });
  });
  return lines.join("\n");
}

export async function understandRequest(
  freelancerId: string,
  requestText: string,
  language: "en" | "nl"
): Promise<Understanding | null> {
  const db = serviceClient();
  const { data: inquiries } = await db
    .from("inquiries")
    .select("id, client_name, status, event_type, event_date, created_at, replied_at, message")
    .eq("freelancer_id", freelancerId)
    .neq("source", "sample")
    .order("created_at", { ascending: false })
    .limit(40);

  const snapshot = buildSnapshot((inquiries ?? []) as SnapshotInquiry[], new Date());
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 900,
      system: SYSTEM.replace("{language}", language === "nl" ? "Dutch" : "English"),
      messages: [
        {
          role: "user",
          content: `Request: ${requestText}\n\nInquiry snapshot (one JSON per line):\n${snapshot || "(no inquiries yet)"}`,
        },
      ],
    }),
  });
  if (!response.ok) {
    console.error("frontdesk/agent: provider returned", response.status);
    return null;
  }
  const payload = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = payload.content?.find((c) => c.type === "text")?.text ?? "";
  return parseUnderstanding(text, new Set((inquiries ?? []).map((i) => i.id)));
}

/** Strict parse: unknown kinds, actions, or inquiry ids are dropped. */
export function parseUnderstanding(
  text: string,
  knownInquiryIds: Set<string>
): Understanding | null {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text.replace(/^```(?:json)?/m, "").replace(/```\s*$/m, "").trim());
  } catch {
    return null;
  }
  const kind = raw.kind;
  if (kind !== "answer" && kind !== "plan" && kind !== "clarify" && kind !== "cannot") return null;
  const readAs = typeof raw.read_as === "string" ? raw.read_as.slice(0, 500) : "";
  if (!readAs) return null;

  const understanding: Understanding = { read_as: readAs, kind };
  if (kind === "answer" && typeof raw.answer === "string") understanding.answer = raw.answer.slice(0, 2000);
  if (kind === "clarify" && typeof raw.clarify_question === "string") {
    understanding.clarify_question = raw.clarify_question.slice(0, 500);
  }
  if (kind === "cannot" && typeof raw.cannot_reason === "string") {
    understanding.cannot_reason = raw.cannot_reason.slice(0, 1000);
  }
  if (kind === "plan") {
    const steps = Array.isArray(raw.steps) ? raw.steps : [];
    understanding.steps = steps
      .filter(
        (s: Record<string, unknown>) =>
          (s.action === "prepare_reply" || s.action === "prepare_followup") &&
          typeof s.inquiry_id === "string" &&
          knownInquiryIds.has(s.inquiry_id) &&
          typeof s.label === "string"
      )
      .slice(0, 10)
      .map((s: { action: "prepare_reply" | "prepare_followup"; inquiry_id: string; label: string }) => ({
        action: s.action,
        inquiry_id: s.inquiry_id,
        label: s.label.slice(0, 200),
        state: "pending" as const,
      }));
    if (understanding.steps.length === 0) return null;
  }
  const complete =
    (kind === "answer" && understanding.answer) ||
    (kind === "clarify" && understanding.clarify_question) ||
    (kind === "cannot" && understanding.cannot_reason) ||
    kind === "plan";
  return complete ? understanding : null;
}
