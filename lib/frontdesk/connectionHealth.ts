/**
 * Integration health (master spec §15). The full state vocabulary exists so
 * every surface talks about a connection the same way; what can actually be
 * derived today comes from `agent_gmail_connections` (migration 0006):
 * connected_at, revoked_at, last_used_at. States with no producing signal yet
 * (connecting, partial, rate limited, reconnecting) are reachable only by
 * explicit report from the code doing the work — never invented here.
 *
 * §15.2: every state names what happened, what was affected, what was NOT
 * affected, the safest next step, and the last successful sync. The copy for
 * that lives in i18n under inbox.connection.<state>; this module only decides
 * which state is true.
 */

export type ConnectionState =
  | "connected"
  | "connecting"
  | "expired"
  | "revoked"
  | "partial"
  | "rate_limited"
  | "stale"
  | "reconnecting"
  | "disconnected";

export interface GmailConnectionRow {
  connected_at: string;
  revoked_at: string | null;
  last_used_at: string | null;
}

export interface ConnectionHealth {
  state: ConnectionState;
  /** Last successful sync, if one ever happened. */
  lastSyncAt: string | null;
}

/** A connection nobody has used for this long is stale (§6.8: 24h). */
const STALE_HOURS = 24;

export function deriveGmailHealth(
  connection: GmailConnectionRow | null,
  now: Date
): ConnectionHealth {
  if (!connection) return { state: "disconnected", lastSyncAt: null };
  if (connection.revoked_at) {
    return { state: "revoked", lastSyncAt: connection.last_used_at };
  }
  const lastActivity = connection.last_used_at ?? connection.connected_at;
  const hoursSince = (now.getTime() - new Date(lastActivity).getTime()) / 3_600_000;
  if (hoursSince > STALE_HOURS) {
    return { state: "stale", lastSyncAt: connection.last_used_at };
  }
  return { state: "connected", lastSyncAt: connection.last_used_at };
}
