import { PikError, type PikFailure } from "@/api/pik-client";

/** The translation key of each failure, under `slot.errors`: one message per problem `type`. */
const KEYS: Record<PikFailure, string> = {
  unauthorized: "unauthorized",
  "origin-not-allowed": "origin_not_allowed",
  "organizer-only": "organizer_only",
  "not-found": "not_found",
  "method-not-allowed": "method_not_allowed",
  "name-taken": "name_taken",
  "list-closed": "list_closed",
  "session-cancelled": "session_cancelled",
  "deadline-passed": "deadline_passed",
  "last-organizer": "last_organizer",
  "already-member": "already_member",
  "recovery-link-gone": "recovery_link_gone",
  "lineup-changed": "lineup_changed",
  "if-match-required": "if_match_required",
  "invalid-request": "invalid_request",
  "not-a-session": "not_a_session",
  "idempotency-key-reused": "idempotency_key_reused",
  "rate-limited": "rate_limited",
  internal: "internal",
  network: "network",
  timeout: "timeout",
  config: "config",
  unknown: "unknown",
};

/** A translated message: its key and the values it quotes. */
export interface ErrorMessage {
  key: string;
  params?: Record<string, number>;
}

/** The message of a failed pik call. An error that is not pik's reads as `unknown`. */
export function slotErrorMessage(error: unknown): ErrorMessage {
  if (!(error instanceof PikError)) return { key: "slot.errors.unknown" };
  const key = `slot.errors.${KEYS[error.failure]}`;
  // "Try again in 60 seconds" when pik says how long to wait.
  return error.failure === "rate-limited" && error.retryAfter
    ? { key: "slot.errors.rate_limited_wait", params: { count: error.retryAfter } }
    : { key };
}

/** A call worth retrying as is: no answer came, so pik may not have seen it. */
export const isTransient = (error: unknown) =>
  error instanceof PikError && (error.failure === "network" || error.failure === "timeout");
