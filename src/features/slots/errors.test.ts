import { PIK_PROBLEMS, PikError } from "@/api/pik-client";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import { isTransient, slotErrorMessage } from "./errors";

const LOCALES = { en, fr, es, eu } as const;

/** The value at a dotted key, as i18next reads it. */
const lookup = (locale: object, key: string): unknown =>
  key.split(".").reduce<unknown>(
    (node, part) => (node as Record<string, unknown> | undefined)?.[part],
    locale,
  );

describe("slotErrorMessage", () => {
  it("maps each problem type to its own message", () => {
    expect(slotErrorMessage(new PikError("name-taken", 409))).toEqual({
      key: "slot.errors.name_taken",
    });
    expect(slotErrorMessage(new PikError("idempotency-key-reused", 422))).toEqual({
      key: "slot.errors.idempotency_key_reused",
    });
    const keys = PIK_PROBLEMS.map((problem) => slotErrorMessage(new PikError(problem, 400)).key);
    expect(new Set(keys).size).toBe(PIK_PROBLEMS.length);
  });

  it("says how long to wait when pik sends Retry-After", () => {
    expect(slotErrorMessage(new PikError("rate-limited", 429, 60))).toEqual({
      key: "slot.errors.rate_limited_wait",
      params: { count: 60 },
    });
    expect(slotErrorMessage(new PikError("rate-limited", 429))).toEqual({
      key: "slot.errors.rate_limited",
    });
  });

  it("reads any other error as unknown", () => {
    expect(slotErrorMessage(new Error("boom"))).toEqual({ key: "slot.errors.unknown" });
    expect(slotErrorMessage(undefined)).toEqual({ key: "slot.errors.unknown" });
  });

  it.each(Object.entries(LOCALES))("has every message in %s", (_, locale) => {
    const failures = [...PIK_PROBLEMS, "network", "timeout", "config", "unknown"] as const;
    for (const failure of failures) {
      const { key } = slotErrorMessage(new PikError(failure, 0));
      expect(typeof lookup(locale, key)).toBe("string");
    }
    expect(typeof lookup(locale, "slot.errors.rate_limited_wait_one")).toBe("string");
    expect(typeof lookup(locale, "slot.errors.rate_limited_wait_other")).toBe("string");
  });
});

describe("isTransient", () => {
  it("retries only when no answer came", () => {
    expect(isTransient(new PikError("network", 0))).toBe(true);
    expect(isTransient(new PikError("timeout", 0))).toBe(true);
    expect(isTransient(new PikError("internal", 500))).toBe(false);
    expect(isTransient(new PikError("rate-limited", 429))).toBe(false);
    expect(isTransient(new Error("network"))).toBe(false);
  });
});
