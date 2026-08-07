/**
 * Voice-profile derivation: deterministic, client-side, destructive by design.
 *
 * The raw pasted emails never leave the browser. This function reads them in
 * memory, returns the derived profile, and the caller stores only that. The
 * spec's retention rule ("raw samples deleted after derivation") is upheld by
 * never transmitting them anywhere in the first place.
 *
 * Heuristics, not a model: a greeting, a sign-off, je/u and a few style
 * observations are pattern-matching problems, and a deterministic answer here
 * means the same paste always produces the same profile.
 */
export interface DerivedVoice {
  greeting?: string;
  signoff?: string;
  formality?: "je" | "u";
  styleNotes?: string;
}

const GREETING = /^(hoi|hi|hey|hallo|beste|dag|goedemorgen|goedemiddag)\b[^,\n]{0,25}/i;
const SIGNOFF =
  /^(groetjes|groet|gr\.?|met vriendelijke groet(en)?|mvg|liefs|hartelijks|thanks|cheers|best|warm regards|kind regards)\b.{0,20}$/i;

export function deriveVoice(samples: string[]): DerivedVoice {
  const text = samples.join("\n\n");
  if (!text.trim()) return {};

  let greeting: string | undefined;
  let signoff: string | undefined;

  for (const sample of samples) {
    const lines = sample
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!greeting && lines[0] && GREETING.test(lines[0]) && lines[0].length <= 40) {
      greeting = lines[0].replace(/,+$/, "").split(/\s+/).slice(0, 1).join(" ");
    }
    // Sign-off: search the last three lines; the very last is often a name.
    for (const line of lines.slice(-3)) {
      if (SIGNOFF.test(line)) {
        signoff = line.replace(/,+$/, "");
        break;
      }
    }
  }

  const je = (text.match(/\b(je|jij|jouw|jou)\b/gi) ?? []).length;
  const u = (text.match(/\b(u|uw)\b/g) ?? []).length;
  const formality = je + u === 0 ? undefined : je >= u ? "je" : "u";

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 2);
  const words = text.split(/\s+/).filter(Boolean).length;
  const avg = sentences.length ? Math.round(words / sentences.length) : 0;
  const notes: string[] = [];
  if (avg > 0) notes.push(avg <= 12 ? "short sentences" : avg >= 22 ? "long sentences" : "medium sentences");
  if ((text.match(/!/g) ?? []).length >= 2) notes.push("uses exclamation marks");
  if (/\p{Extended_Pictographic}/u.test(text)) notes.push("uses emoji");

  return {
    greeting,
    signoff,
    formality,
    styleNotes: notes.join(", ") || undefined,
  };
}
