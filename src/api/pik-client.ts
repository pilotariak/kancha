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
export type AnswerStatus = Schemas["AnswerStatus"];
export type SlotCourt = Schemas["Court"];

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
  };
}

export type PikClient = ReturnType<typeof createPikClient>;
