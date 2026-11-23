/**
 * The `Idempotency-Key` of a slot creation. A retry of the same creation must send the same key
 * and the same body: pik then returns the first slot instead of creating a second one. A key sent
 * again with another body answers 422 `idempotency-key-reused`, so a body edited after a failure
 * gets a new key.
 */
export interface PendingCreation {
  key: string;
  /** The body the key was drawn for, in a stable form. */
  body: string;
}

/** JSON with the keys sorted, so that two equal bodies give one string. */
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** The key to send: the pending one for the same body, a new one (`newKey`) otherwise. */
export function creationKey(
  pending: PendingCreation | null,
  body: unknown,
  newKey: () => string,
): PendingCreation {
  const json = stableJson(body);
  return pending?.body === json ? pending : { key: newKey(), body: json };
}
