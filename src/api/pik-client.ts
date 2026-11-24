import type { components } from "./pik-openapi";

/**
 * The client of pik, the slots service (kancha ADR-0001): REST and JSON under `/api/v1`, apart
 * from Frontis. Its types come from pik's OpenAPI contract (`bun run pik:types`).
 *
 * This file has no React Native import: `createPikClient` takes `fetch`, the base URL and the
 * token store, so the tests run it on both the native and the web path. `pik.ts` wires it.
 */

type Schemas = components["schemas"];

export type CreateSlot = Schemas["CreateSlot"];
export type SlotCreated = Schemas["SlotCreated"];
export type MySlots = Schemas["MySlots"];
export type SlotCard = Schemas["SlotCard"];
export type SessionList = Schemas["SessionList"];
export type SessionSummary = Schemas["SessionSummary"];
export type SessionState = Schemas["SessionState"];
export type SessionDetail = Schemas["SessionDetail"];
export type SessionChanges = Schemas["SessionChanges"];
export type AnswerStatus = Schemas["AnswerStatus"];
export type AnswerView = Schemas["AnswerView"];
export type NoAnswerView = Schemas["NoAnswerView"];
export type AnswerResult = Schemas["AnswerResult"];
export type SlotCourt = Schemas["Court"];
export type JoinPreview = Schemas["JoinPreview"];
export type FreeName = Schemas["FreeName"];
export type Joined = Schemas["Joined"];
export type SlotDetail = Schemas["SlotDetail"];
export type MemberView = Schemas["MemberView"];
export type MemberChanges = Schemas["MemberChanges"];
export type SlotRole = Schemas["Role"];
export type RecoveryLink = Schemas["RecoveryLink"];

/**
 * The `type` of pik's problem documents, after `https://pik.pilotariak.com/problems/`. pik sends
 * these URIs, but openapi.json lists the Rust variant names (`NameTaken`) as `ProblemType`, so the
 * list comes from `ProblemType` in pik's src/api/problem.rs rather than from the generated types.
 */
export const PIK_PROBLEMS = [
  "unauthorized",
  "origin-not-allowed",
  "organizer-only",
  "not-found",
  "method-not-allowed",
  "name-taken",
  "list-closed",
  "session-cancelled",
  "deadline-passed",
  "last-organizer",
  "already-member",
  "recovery-link-gone",
  "lineup-changed",
  "if-match-required",
  "invalid-request",
  "not-a-session",
  "idempotency-key-reused",
  "rate-limited",
  "internal",
] as const;

export type PikProblem = (typeof PIK_PROBLEMS)[number];

/**
 * Why a call failed: a problem pik sent, or one found on this side. `network` when no response
 * came, `timeout` when none came in time, `config` when the base URL is missing, `unknown` for a
 * response that is not one of pik's problems.
 */
export type PikFailure = PikProblem | "network" | "timeout" | "config" | "unknown";

const PROBLEM_PREFIX = "https://pik.pilotariak.com/problems/";

export class PikError extends Error {
  constructor(
    public readonly failure: PikFailure,
    /** The HTTP status, 0 when no response came. */
    public readonly status: number,
    /** Seconds to wait, from `Retry-After` (429). */
    public readonly retryAfter?: number,
  ) {
    super(`pik ${failure}${status ? ` (${status})` : ""}`);
    this.name = "PikError";
  }
}

/** The problem a `type` URI names, or `unknown` for any other value. */
export function problemOf(type: unknown): PikProblem | "unknown" {
  if (typeof type !== "string" || !type.startsWith(PROBLEM_PREFIX)) return "unknown";
  const name = type.slice(PROBLEM_PREFIX.length);
  return (PIK_PROBLEMS as readonly string[]).includes(name) ? (name as PikProblem) : "unknown";
}

export const isPikFailure = (error: unknown, failure: PikFailure) =>
  error instanceof PikError && error.failure === failure;

/** The device's player token (kancha ADR-0002), kept by the native app. */
export interface PikTokenStore {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PikClientOptions {
  fetch: typeof fetch;
  /** The `/api/v1` base, read on each call; null when it is not configured. */
  baseUrl: () => string | null;
  /**
   * The native app's token store: the token goes in `Authorization: Bearer`. Null on the web,
   * where pik's `HttpOnly` cookie carries it and page scripts never see it.
   */
  tokens: PikTokenStore | null;
  timeoutMs?: number;
}

/**
 * The `/api/v1` base at pik's origin, `EXPO_PUBLIC_PIK_URL`, such as `https://pik.pilotariak.com`
 * or `http://localhost:8787` in development; null when it is not set. The native app and the web
 * build both call it. On the web the call is cross-origin: pik must answer CORS for the Kancha
 * origin.
 */
export function pikBaseUrl(origin: string | undefined): string | null {
  const trimmed = origin?.trim().replace(/\/+$/, "");
  return trimmed ? `${trimmed}/api/v1` : null;
}

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  /** The native token to send, if any. */
  token?: string | null;
}

/** Retry-After in seconds; pik sends a number. */
function retryAfterOf(response: Response): number | undefined {
  const value = Number(response.headers.get("Retry-After"));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export function createPikClient({ fetch, baseUrl, tokens, timeoutMs = 15_000 }: PikClientOptions) {
  async function request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const base = baseUrl();
    if (!base) throw new PikError("config", 0);

    const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${base}${path}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        // Native sends the token as Bearer only: the platform's cookie jar would otherwise keep
        // pik's cookie and send it back. The web build relies on that cookie, which a call to
        // pik's origin carries only with "include".
        credentials: tokens ? "omit" : "include",
      });
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      throw new PikError(aborted ? "timeout" : "network", 0);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      // Never log the body or the headers: they may name members or carry a token.
      const problem = await response.json().then(
        (body: { type?: unknown }) => problemOf(body?.type),
        () => "unknown" as const,
      );
      throw new PikError(problem, response.status, retryAfterOf(response));
    }
    // 204: releasing a name, which answers without a body.
    if (response.status === 204) return undefined as T;
    try {
      return (await response.json()) as T;
    } catch {
      throw new PikError("unknown", response.status);
    }
  }

  /**
   * Clears the stored token after pik answered 401 to it: its player is gone (purged), and a
   * creation without a token gets a new one. Only that token: another call may have stored a
   * new one meanwhile.
   */
  async function forget(token: string) {
    if (tokens && (await tokens.get()) === token) await tokens.clear();
  }

  /** The stored token of the native app; null on the web, where pik's cookie carries it. */
  const stored = () => (tokens ? tokens.get() : Promise.resolve(null));

  /**
   * Keeps the token of a join or a recovery, when pik issued one: the native app stores it, the
   * web build already has it in pik's cookie. Callers never see it.
   */
  async function keep({ player_token: playerToken, ...joined }: Joined) {
    if (tokens && playerToken) await tokens.set(playerToken);
    return joined;
  }

  const slotPath = (slotId: string) => `/slots/${encodeURIComponent(slotId)}`;
  const memberPath = (slotId: string, memberId: string) =>
    `${slotPath(slotId)}/members/${encodeURIComponent(memberId)}`;
  const sessionPath = (slotId: string, date: string) =>
    `${slotPath(slotId)}/sessions/${encodeURIComponent(date)}`;

  return {
    /**
     * The player's slots, for the Créneaux tab. A device without a player has none: the native
     * app then makes no call, and the web build gets a 401 when pik's cookie is missing.
     */
    async mySlots(): Promise<MySlots> {
      const token = tokens ? await tokens.get() : null;
      if (tokens && !token) return { slots: [] };
      try {
        return await request<MySlots>("GET", "/me", { token });
      } catch (error) {
        if (!isPikFailure(error, "unauthorized")) throw error;
        if (token) await forget(token);
        return { slots: [] };
      }
    },

    /**
     * Creates a slot; the device's player becomes its first organizer. A retry of the same
     * creation sends the same `idempotencyKey` (a UUID v4) and the same body: pik then returns
     * the first slot instead of a second one, with a new token that replaces the first.
     *
     * The token stays in this client: the native app stores the one pik returns, the web build
     * leaves it in pik's cookie. A stored token pik no longer knows is dropped, and the slot is
     * created once more without it, under a new player.
     */
    async createSlot(
      slot: CreateSlot,
      idempotencyKey: string,
    ): Promise<Omit<SlotCreated, "player_token">> {
      const send = (token: string | null) =>
        request<SlotCreated>("POST", "/slots", {
          body: slot,
          headers: { "Idempotency-Key": idempotencyKey },
          token,
        });

      const token = tokens ? await tokens.get() : null;
      let created: SlotCreated;
      try {
        created = await send(token);
      } catch (error) {
        // pik rejects an unknown token before it reads the key, so the key is still unused.
        if (!token || !isPikFailure(error, "unauthorized")) throw error;
        await forget(token);
        created = await send(null);
      }

      const { player_token: playerToken, ...rest } = created;
      if (tokens && playerToken) await tokens.set(playerToken);
      return rest;
    },

    /**
     * The sessions of a slot with their counts and states, from `from` (default: today in
     * Paris) to `to` (default: the end of the season), "YYYY-MM-DD".
     */
    async slotSessions(slotId: string, range: { from?: string; to?: string } = {}) {
      const params = Object.entries(range).flatMap(([name, value]) =>
        value ? [`${name}=${encodeURIComponent(value)}`] : []
      );
      const search = params.length > 0 ? `?${params.join("&")}` : "";
      const token = tokens ? await tokens.get() : null;
      return request<SessionList>(
        "GET",
        `/slots/${encodeURIComponent(slotId)}/sessions${search}`,
        { token },
      );
    },

    // ── Joining with an invite link (kancha ADR-0002) ─────────────────────────

    /** The slot of an invite code and the names nobody holds yet. Needs no token. */
    previewJoin(code: string) {
      return request<JoinPreview>("GET", `/join/${encodeURIComponent(code)}`);
    },

    /**
     * Joins a slot: "C'est moi" claims a free name of the preview (`memberId`), "I'm not in the
     * list" adds the player's own (`name`). The name goes to the device's player, or to a new
     * one, whose token pik returns. pik takes an unknown token for none here, so a device whose
     * player was purged joins under a new one.
     */
    async joinSlot(
      code: string,
      choice: { memberId: string } | { name: string },
    ): Promise<Omit<Joined, "player_token">> {
      const path = `/join/${encodeURIComponent(code)}`;
      const token = await stored();
      const joined = "memberId" in choice
        ? await request<Joined>("POST", `${path}/claim`, {
          body: { member_id: choice.memberId },
          token,
        })
        : await request<Joined>("POST", `${path}/members`, { body: { name: choice.name }, token });
      return keep(joined);
    },

    /**
     * Redeems a recovery link: its member, with their answers, becomes the device's. The link
     * works once. pik checks the device's token before the link, so after a 401 the link is still
     * unused: the native app drops the token pik no longer knows, the web build's cookie was
     * cleared by that 401, and the link is redeemed once more under a new player.
     */
    async redeemRecovery(recoveryToken: string): Promise<Omit<Joined, "player_token">> {
      const send = (token: string | null) =>
        request<Joined>("POST", `/recover/${encodeURIComponent(recoveryToken)}`, { token });
      const token = await stored();
      let joined: Joined;
      try {
        joined = await send(token);
      } catch (error) {
        if (!isPikFailure(error, "unauthorized")) throw error;
        if (token) await forget(token);
        joined = await send(null);
      }
      return keep(joined);
    },

    // ── The personal link (native app only) ───────────────────────────────────

    /**
     * The device's player token, for the personal link: the native app's, null on the web, where
     * it stays in pik's cookie. Never log it.
     */
    deviceToken: (): Promise<string | null> => stored(),

    /** The slots of the player a personal link holds, without keeping its token: 401 if unknown. */
    playerSlots(token: string) {
      return request<MySlots>("GET", "/me", { token });
    },

    /**
     * Keeps a personal link's token on this device in place of the stored one. False on the web:
     * pik sets its cookie only for a token it issues, so a page cannot restore one.
     */
    async adoptToken(token: string): Promise<boolean> {
      if (!tokens) return false;
      await tokens.set(token);
      return true;
    },

    // ── A slot and its list of names ──────────────────────────────────────────

    /** A slot with its members, the caller's member and its upcoming sessions. */
    async slot(slotId: string) {
      return request<SlotDetail>("GET", slotPath(slotId), { token: await stored() });
    },

    /** Adds a name to the list (organizer). Nobody holds it until a player claims it. */
    async addMember(slotId: string, name: string) {
      return request<MemberView>("POST", `${slotPath(slotId)}/members`, {
        body: { name },
        token: await stored(),
      });
    },

    /** Changes a member's role or name (organizer). */
    async updateMember(slotId: string, memberId: string, changes: MemberChanges) {
      return request<MemberView>("PATCH", memberPath(slotId, memberId), {
        body: changes,
        token: await stored(),
      });
    },

    /** Frees a claimed name (organizer): the member keeps their answers, anyone can claim it. */
    async releaseName(slotId: string, memberId: string): Promise<void> {
      await request<undefined>("DELETE", `${memberPath(slotId, memberId)}/claim`, {
        token: await stored(),
      });
    },

    /**
     * Creates a recovery link for a member (organizer): valid once, for 24 hours. A retry with
     * the same `idempotencyKey` returns the same link with a fresh token.
     */
    async createRecoveryLink(slotId: string, memberId: string, idempotencyKey: string) {
      return request<RecoveryLink>("POST", `${memberPath(slotId, memberId)}/recovery`, {
        headers: { "Idempotency-Key": idempotencyKey },
        token: await stored(),
      });
    },

    /** Draws a new invite code (organizer): the old link stops working, members stay. */
    async rotateInviteCode(slotId: string) {
      return request<Schemas["InviteCodeView"]>("POST", `${slotPath(slotId)}/invite-code`, {
        token: await stored(),
      });
    },

    /** Closes or reopens the list (organizer): a closed list takes no new name by the link. */
    async setListClosed(slotId: string, closed: boolean) {
      return request<Schemas["ListState"]>("PUT", `${slotPath(slotId)}/list`, {
        body: { closed },
        token: await stored(),
      });
    },

    // ── One session and its answers ───────────────────────────────────────────

    /**
     * One session, `date` as "YYYY-MM-DD" in Europe/Paris: its state and counts, the answers by
     * status and the members who did not answer. pik computes the state on every read.
     */
    async session(slotId: string, date: string) {
      return request<SessionDetail>("GET", sessionPath(slotId, date), { token: await stored() });
    },

    /**
     * Answers for a session: the device's member, or another one (`memberId`, organizer). The
     * last write wins, so a retry is harmless. After the deadline pik takes only `ko`; a
     * cancelled session takes none. Returns the session as pik computes it after the answer.
     */
    async answerSession(slotId: string, date: string, status: AnswerStatus, memberId?: string) {
      return request<AnswerResult>("PUT", `${sessionPath(slotId, date)}/answer`, {
        body: memberId ? { status, member_id: memberId } : { status },
        token: await stored(),
      });
    },

    /** Cancels a date or undoes it, among other changes to one session (organizer). */
    async updateSession(slotId: string, date: string, changes: SessionChanges) {
      return request<SessionSummary>("PATCH", sessionPath(slotId, date), {
        body: changes,
        token: await stored(),
      });
    },
  };
}

export type PikClient = ReturnType<typeof createPikClient>;
