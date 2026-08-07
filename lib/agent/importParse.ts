/**
 * Client-list parsing: deterministic, forgiving, never final.
 *
 * Every parsed row lands in a confirmation table the user edits before
 * anything is saved, so parsing here is a convenience, not an authority.
 * Accepts CSV (comma or semicolon, with or without a header) and loose lines
 * like "Rituals, campagneshoot, maart 2026, €2400".
 */
export interface ParsedRow {
  clientName: string;
  clientEmail?: string;
  lastProjectTitle?: string;
  lastProjectDate?: string; // ISO yyyy-mm-dd (day defaults to 01)
  approxValueCents?: number;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mrt: 3, mar: 3, apr: 4, mei: 5, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dec: 12,
  januari: 1, februari: 2, maart: 3, april: 4, juni: 6, juli: 7,
  augustus: 8, september: 9, oktober: 10, november: 11, december: 12,
  january: 1, february: 2, march: 3, june: 6, july: 7, august: 8,
  october: 10, december_en: 12,
};

const HEADER_WORDS = /^(naam|name|klant|client|email|e-mail|project|datum|date|bedrag|value|waarde)/i;

export function parseImport(text: string): ParsedRow[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1)
    .filter((l, i) => !(i === 0 && HEADER_WORDS.test(l.split(/[,;]/)[0] ?? "")))
    .map(parseLine)
    .filter((r): r is ParsedRow => r !== null);
}

function parseLine(line: string): ParsedRow | null {
  const parts = line.split(/[;,]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const row: ParsedRow = { clientName: "" };
  const leftovers: string[] = [];

  for (const part of parts) {
    if (!row.clientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(part)) {
      row.clientEmail = part.toLowerCase();
    } else if (!row.approxValueCents && /(€|eur)?\s*[\d.]{2,}/i.test(part) && /\d/.test(part) && !parseDate(part)) {
      const digits = part.replace(/[^\d]/g, "");
      if (digits.length >= 2 && digits.length <= 7) {
        row.approxValueCents = Number(digits) * 100;
      } else {
        leftovers.push(part);
      }
    } else if (!row.lastProjectDate && parseDate(part)) {
      row.lastProjectDate = parseDate(part)!;
    } else {
      leftovers.push(part);
    }
  }

  row.clientName = leftovers[0] ?? "";
  if (leftovers[1]) row.lastProjectTitle = leftovers.slice(1).join(", ");
  if (!row.clientName) return null;
  return row;
}

/** "maart 2026" | "03-2026" | "2026-03" | "2026" → ISO first-of-month. */
export function parseDate(part: string): string | null {
  const lower = part.toLowerCase().trim();

  const iso = lower.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3] ?? "1")}`;

  const nlNum = lower.match(/^(\d{1,2})-(\d{4})$/);
  if (nlNum) return `${nlNum[2]}-${pad(nlNum[1])}-01`;

  const monthName = lower.match(/^([a-z]+)\.?\s+(\d{4})$/);
  if (monthName && MONTHS[monthName[1]]) {
    return `${monthName[2]}-${pad(String(MONTHS[monthName[1]]))}-01`;
  }

  const yearOnly = lower.match(/^(\d{4})$/);
  if (yearOnly && Number(yearOnly[1]) > 1990 && Number(yearOnly[1]) < 2100) {
    return `${yearOnly[1]}-06-01`;
  }

  return null;
}

function pad(n: string): string {
  return n.padStart(2, "0");
}
