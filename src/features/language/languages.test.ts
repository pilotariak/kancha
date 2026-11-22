import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import eu from "@/i18n/locales/eu.json";
import fr from "@/i18n/locales/fr.json";

import { languageNames, LANGUAGES, resolveLanguage } from "./languages";

const LOCALES = { en, fr, es, eu } as const;

describe("resolveLanguage", () => {
  it("keeps a supported language", () => {
    expect(LANGUAGES.map(resolveLanguage)).toEqual(["en", "fr", "es", "eu"]);
  });

  it("drops the region and the case", () => {
    expect(resolveLanguage("fr-FR")).toBe("fr");
    expect(resolveLanguage("es_ES")).toBe("es");
    expect(resolveLanguage("EU")).toBe("eu");
  });

  it("falls back to English", () => {
    expect(resolveLanguage("de")).toBe("en");
    expect(resolveLanguage("")).toBe("en");
    expect(resolveLanguage(null)).toBe("en");
    expect(resolveLanguage(undefined)).toBe("en");
  });
});

describe("languageNames", () => {
  it("shows the own name, then the localized one", () => {
    expect(languageNames("Euskara", "Basque")).toEqual({
      name: "Euskara",
      localized: "Basque",
      label: "Euskara, Basque",
    });
  });

  it("shows a name once when both names are the same", () => {
    expect(languageNames("Euskara", "Euskara")).toEqual({
      name: "Euskara",
      localized: null,
      label: "Euskara",
    });
    expect(languageNames("Français", "français").localized).toBeNull();
  });

  it("keeps a close but different name", () => {
    expect(languageNames("Euskara", "Euskera").localized).toBe("Euskera");
  });
});

describe("language names in the locales", () => {
  it("names each language in that language", () => {
    expect(LANGUAGES.map((code) => LOCALES[code].language[code])).toEqual([
      "English",
      "Français",
      "Español",
      "Euskara",
    ]);
  });

  it.each(Object.entries(LOCALES))("names every language in %s", (_, messages) => {
    for (const code of LANGUAGES) {
      expect(messages.language[code]).toEqual(expect.any(String));
    }
  });

  it.each(Object.entries(LOCALES))(
    "shows two names for the other languages in %s",
    (lng, messages) => {
      for (const code of LANGUAGES) {
        const names = languageNames(LOCALES[code].language[code], messages.language[code]);
        expect(names.localized === null).toBe(code === lng);
      }
    },
  );

  it.each(Object.entries(LOCALES))("names the About groups in %s", (_, messages) => {
    expect(messages.about.preferences).toEqual(expect.any(String));
    expect(messages.about.application).toEqual(expect.any(String));
  });
});
