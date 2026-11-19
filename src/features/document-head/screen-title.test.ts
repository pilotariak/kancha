import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import { SCREEN_TITLE_KEYS, screenTitleKey } from "./screen-title";

const LOCALES = { en, es, eu, fr } as const;

function lookup(messages: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node as Record<string, unknown> | undefined)?.[part],
    messages,
  );
}

describe("screenTitleKey", () => {
  it("ignores route groups", () => {
    expect(screenTitleKey(["(tabs)", "competitions", "list"])).toBe("competitions.title");
  });

  it("maps a stack index route to its folder", () => {
    expect(screenTitleKey(["(tabs)", "competitions"])).toBe("leagues.title");
    expect(screenTitleKey(["(tabs)", "competitions", "index"])).toBe("leagues.title");
  });

  it("titles the not-found screen", () => {
    expect(screenTitleKey(["+not-found"])).toBe("head.not_found");
  });

  it("returns null for routes without a screen title", () => {
    expect(screenTitleKey([])).toBeNull();
    expect(screenTitleKey(["(tabs)"])).toBeNull();
    expect(screenTitleKey(["unknown"])).toBeNull();
  });
});

describe.each(Object.entries(LOCALES))("%s locale", (_, messages) => {
  it.each(Object.values(SCREEN_TITLE_KEYS))("translates %s", (key) => {
    expect(lookup(messages, key)).toEqual(expect.any(String));
  });

  it("formats the page title around the screen name", () => {
    expect(lookup(messages, "head.page_title")).toContain("{{screen}}");
  });

  it("describes the app", () => {
    expect(lookup(messages, "head.description")).toEqual(expect.any(String));
  });
});
