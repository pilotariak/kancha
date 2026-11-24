/**
 * The secret of a personal or recovery link that opened the native app, between the native
 * intent (`src/app/+native-intent.tsx`) and its screen. In memory only: it never reaches the
 * router's state, a query key, storage or a log. A new link replaces the one before.
 */

export type SecretKind = "me" | "recover";

let pending: { kind: SecretKind; token: string } | null = null;

export function holdSecret(kind: SecretKind, token: string) {
  pending = { kind, token };
}

/** The secret of that kind, if a link brought one. It stays until `clearSecret`. */
export function readSecret(kind: SecretKind): string | null {
  return pending?.kind === kind ? pending.token : null;
}

export function clearSecret(kind: SecretKind) {
  if (pending?.kind === kind) pending = null;
}
