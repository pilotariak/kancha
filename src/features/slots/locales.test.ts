import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

const LOCALES = { en, fr, es, eu } as const;

/** Every dotted key under `node`, with its value. */
function leaves(node: unknown, prefix: string): [string, unknown][] {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return [[prefix, node]];
  return Object.entries(node).flatMap(([key, value]) => leaves(value, `${prefix}.${key}`));
}

/** The value at a dotted key, as i18next reads it. */
const lookup = (locale: object, key: string): unknown =>
  key.split(".").reduce<unknown>(
    (node, part) => (node as Record<string, unknown> | undefined)?.[part],
    locale,
  );

// The strings of the session screen and its share messages (#157).
const SECTIONS = [
  "slot.session_screen",
  "slot.session_message",
  "slot.time",
  "slot.date.day_time",
  "slot.open_session",
];

describe("the session screen's strings", () => {
  const keys = (locale: object) =>
    SECTIONS.flatMap((section) => leaves(lookup(locale, section), section).map(([key]) => key))
      .sort();

  it.each(Object.entries(LOCALES))("has the same keys in %s as in English", (_, locale) => {
    expect(keys(locale)).toEqual(keys(en));
  });

  it.each(Object.entries(LOCALES))("has a non-empty string for each in %s", (_, locale) => {
    for (const key of keys(en)) {
      const value = lookup(locale, key);
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});
