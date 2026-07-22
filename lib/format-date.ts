/** Medium-style date for saved timestamps, e.g. "Jul 22, 2026". */
export function formatCheckInDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}
