import { SITE_URL } from "@/constants/site";
import { shareUrl } from "@/features/links/share-url";

/**
 * The links of a slot (kancha ADR-0002), on the Kancha website and in the app:
 *
 * - the invite link, `/slot/join?code=K7Q2M9XP`, posted in the group chat. A fixed route and a
 *   query parameter: the website is a static export, where a `slot/[code]` route would fall back
 *   to `index.html`;
 * - the personal link, `/slot/me#t=…`, which holds the device's player token;
 * - the recovery link, `/slot/recover#t=…`, which an organizer creates for one member.
 *
 * The secrets go in the URL fragment, which the browser sends neither to the server nor to its
 * logs, never in a query parameter or a path segment. pik takes the recovery token in its path
 * (`POST /recover/{token}`): only the client builds that call.
 *
 * Every function here parses strings by hand: React Native's `URL` polyfill does not implement
 * `hash`, `pathname` or `searchParams` on every version, and Jest runs on Node, where it does.
 */

export const JOIN_PATH = "/slot/join";
export const PERSONAL_PATH = "/slot/me";
export const RECOVERY_PATH = "/slot/recover";

/** pik's invite code alphabet: 24 letters without O and I, 8 digits without 0 and 1. */
const INVITE_CODE = /^[A-HJ-NP-Z2-9]{8}$/;

/** A player or recovery token: 256 bits in lowercase base32, 52 characters (pik `Token`). */
const TOKEN = /^[a-z2-7]{52}$/;

const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

/** Decodes a query or fragment value; `null` for a malformed escape. */
function decode(value: string): string | null {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return null;
  }
}

/** The value of `name` in a `a=1&b=2` string, the first one when it repeats. */
export function paramOf(pairs: string, name: string): string | null {
  for (const pair of pairs.split("&")) {
    const [key, ...rest] = pair.split("=");
    if (key !== undefined && decode(key) === name) return decode(rest.join("="));
  }
  return null;
}

/**
 * The invite code in what a player typed or pasted: the code, in any case, with spaces or dashes,
 * or a whole invite link. `null` when it cannot be a code.
 */
export function normalizeInviteCode(input: string | null | undefined): string | null {
  if (!input) return null;
  let text = input.trim();
  const query = text.indexOf("?");
  if (query >= 0) {
    const fragment = text.indexOf("#", query);
    text = paramOf(text.slice(query + 1, fragment >= 0 ? fragment : undefined), "code") ?? "";
  }
  const code = text.replace(/[\s-]/g, "").toUpperCase();
  return INVITE_CODE.test(code) ? code : null;
}

/** Whether `value` has the shape of a pik token. Nothing more: only pik knows whether it works. */
export const isPikToken = (value: string | null | undefined): value is string =>
  typeof value === "string" && TOKEN.test(value);

/** The token in a URL fragment, `t=…`, with or without its `#`; `null` without a valid one. */
export function tokenOfFragment(fragment: string | null | undefined): string | null {
  if (!fragment) return null;
  const token = paramOf(fragment.replace(/^#/, ""), "t");
  return isPikToken(token) ? token : null;
}

/** The invite link to post in the group chat. */
export const inviteUrl = (code: string) =>
  shareUrl(`${JOIN_PATH}?code=${encodeURIComponent(code)}`);

/** The personal link: the device's player token. It works like a password. */
export const personalUrl = (token: string) => shareUrl(`${PERSONAL_PATH}#t=${token}`);

/** The recovery link an organizer sends privately to a member. */
export const recoveryUrl = (token: string) => shareUrl(`${RECOVERY_PATH}#t=${token}`);

/** A slot link the app opened, with what it carries. */
export type SlotLink =
  | { kind: "join"; code: string | null }
  | { kind: "me"; token: string | null }
  | { kind: "recover"; token: string | null };

/**
 * The path of a URL the system opened the app with, `/slot/join` for all of these:
 *
 * - `https://kancha.pilotariak.com/slot/join` (universal link, App Link);
 * - `kancha://slot/join`, where `slot` is the host, and `kancha:///slot/join`;
 * - `exp://192.168.1.2:8081/--/slot/join` (Expo Go).
 *
 * `null` for a web address of another site.
 */
function pathOf(url: string): string | null {
  const scheme = /^([a-z][a-z0-9+.-]*):\/\//i.exec(url);
  let rest = scheme ? url.slice(scheme[0].length) : url;
  const name = scheme?.[1]?.toLowerCase();
  if (name === "http" || name === "https" || name === "exp" || name === "exps") {
    const slash = rest.indexOf("/");
    const host = slash >= 0 ? rest.slice(0, slash) : rest;
    if ((name === "http" || name === "https") && host.toLowerCase() !== SITE_HOST) return null;
    rest = slash >= 0 ? rest.slice(slash) : "/";
    if (name === "exp" || name === "exps") rest = rest.replace(/^\/--(?=\/|$)/, "");
  }
  const path = `/${rest.replace(/^\/+/, "")}`.replace(/\/+$/, "");
  return path || "/";
}

/** The slot link in a URL, or `null` for any other address. */
export function parseSlotLink(url: string): SlotLink | null {
  const hashAt = url.indexOf("#");
  const fragment = hashAt >= 0 ? url.slice(hashAt + 1) : "";
  const beforeHash = hashAt >= 0 ? url.slice(0, hashAt) : url;
  const queryAt = beforeHash.indexOf("?");
  const query = queryAt >= 0 ? beforeHash.slice(queryAt + 1) : "";
  const path = pathOf(queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash);

  switch (path) {
    case JOIN_PATH:
      return { kind: "join", code: normalizeInviteCode(paramOf(query, "code")) };
    case PERSONAL_PATH:
      return { kind: "me", token: tokenOfFragment(fragment) };
    case RECOVERY_PATH:
      return { kind: "recover", token: tokenOfFragment(fragment) };
    default:
      return null;
  }
}

/**
 * The app path of a slot link, without its secret: the native app keeps the token in memory
 * (`pending-secret.ts`), out of the router's state, where a fragment would become the `#` param.
 */
export function slotLinkPath(link: SlotLink): string {
  switch (link.kind) {
    case "join":
      return link.code ? `${JOIN_PATH}?code=${link.code}` : JOIN_PATH;
    case "me":
      return PERSONAL_PATH;
    case "recover":
      return RECOVERY_PATH;
  }
}
